<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Permissions-Policy: geolocation=(), camera=(), microphone=()');

const MAX_REQUEST_BYTES = 131072;
const MIN_SUBMISSION_SECONDS = 2;
const RATE_LIMIT_WINDOW_SECONDS = 600;
const RATE_LIMIT_MAX_REQUESTS = 5;

function respond(int $status, bool $success, string $message, array $extra = []): never
{
    http_response_code($status);

    echo json_encode(
        array_merge(
            [
                'success' => $success,
                'message' => $message,
            ],
            $extra
        ),
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );

    exit;
}

function stringLength(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    return strlen($value);
}

function truncateText(string $value, int $maximumLength): string
{
    if (stringLength($value) <= $maximumLength) {
        return $value;
    }

    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maximumLength, 'UTF-8');
    }

    return substr($value, 0, $maximumLength);
}

function normalizeText(string $value): string
{
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    $value = strip_tags($value);
    $value = preg_replace('/[^\P{C}\n\t]/u', '', $value) ?? '';
    $value = preg_replace('/[ \t]+/u', ' ', $value) ?? '';
    $value = preg_replace('/\n{4,}/u', "\n\n\n", $value) ?? '';

    return trim($value);
}

function normalizeSingleLine(string $value): string
{
    $value = normalizeText($value);
    $value = preg_replace('/[\r\n]+/u', ' ', $value) ?? '';
    $value = preg_replace('/\s+/u', ' ', $value) ?? '';

    return trim($value);
}

function rawField(array $data, string $key): mixed
{
    return $data[$key] ?? null;
}

function textField(array $data, string $key, int $maximumLength): string
{
    $value = rawField($data, $key);

    if (is_array($value)) {
        $value = implode(
            ', ',
            array_map(
                static function (mixed $item): string {
                    if (is_scalar($item)) {
                        return (string) $item;
                    }

                    return '';
                },
                $value
            )
        );
    }

    if (!is_scalar($value)) {
        return '';
    }

    return truncateText(
        normalizeText((string) $value),
        $maximumLength
    );
}

function singleLineField(array $data, string $key, int $maximumLength): string
{
    $value = rawField($data, $key);

    if (is_array($value)) {
        $value = implode(
            ', ',
            array_map(
                static function (mixed $item): string {
                    if (is_scalar($item)) {
                        return (string) $item;
                    }

                    return '';
                },
                $value
            )
        );
    }

    if (!is_scalar($value)) {
        return '';
    }

    return truncateText(
        normalizeSingleLine((string) $value),
        $maximumLength
    );
}

function consentAccepted(mixed $value): bool
{
    if ($value === true || $value === 1) {
        return true;
    }

    if (!is_scalar($value)) {
        return false;
    }

    return in_array(
        strtolower(trim((string) $value)),
        ['1', 'true', 'yes', 'on', 'accepted', 'agree', 'agreed'],
        true
    );
}

function loadSiteConfig(): array
{
    $configPath = __DIR__ . '/config/config.js';

    if (!is_file($configPath) || !is_readable($configPath)) {
        return [];
    }

    $source = file_get_contents($configPath);

    if ($source === false) {
        return [];
    }

    if (
        !preg_match(
            '/window\.ECHOFORM_CONFIG\s*=\s*(\{.*\})\s*;\s*$/s',
            $source,
            $matches
        )
    ) {
        return [];
    }

    try {
        $decoded = json_decode($matches[1], true, 64, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        return [];
    }

    return is_array($decoded) ? $decoded : [];
}

function configString(array $config, array $path): string
{
    $value = $config;

    foreach ($path as $key) {
        if (!is_array($value) || !array_key_exists($key, $value)) {
            return '';
        }

        $value = $value[$key];
    }

    return is_scalar($value) ? trim((string) $value) : '';
}

function configuredRecipientEmail(): string
{
    $configEmail = configString(loadSiteConfig(), ['company', 'email']);

    if (
        $configEmail !== '' &&
        !preg_match('/^\[[A-Z0-9_]+\]$/', $configEmail)
    ) {
        return $configEmail;
    }

    return trim(
        getenv('ECHOFORM_CONTACT_EMAIL') ?: 'hello@echoform.studio'
    );
}

function parseRequestData(): array
{
    $contentType = strtolower(
        trim(
            explode(
                ';',
                $_SERVER['CONTENT_TYPE'] ?? ''
            )[0]
        )
    );

    if ($contentType === 'application/json') {
        $rawBody = file_get_contents('php://input');

        if ($rawBody === false || trim($rawBody) === '') {
            respond(400, false, 'The request body is empty.');
        }

        try {
            $decoded = json_decode(
                $rawBody,
                true,
                32,
                JSON_THROW_ON_ERROR
            );
        } catch (JsonException) {
            respond(400, false, 'The submitted data is not valid JSON.');
        }

        if (!is_array($decoded)) {
            respond(400, false, 'The submitted data must be an object.');
        }

        return $decoded;
    }

    if (
        $contentType === 'application/x-www-form-urlencoded' ||
        $contentType === 'multipart/form-data' ||
        $contentType === ''
    ) {
        return $_POST;
    }

    respond(415, false, 'This request format is not supported.');
}

function validateOrigin(): void
{
    $origin = trim($_SERVER['HTTP_ORIGIN'] ?? '');

    if ($origin === '') {
        return;
    }

    $originHost = parse_url($origin, PHP_URL_HOST);
    $requestHost = $_SERVER['HTTP_HOST'] ?? '';

    if (!is_string($originHost) || $originHost === '') {
        respond(403, false, 'The request origin could not be verified.');
    }

    $requestHost = strtolower(
        preg_replace('/:\d+$/', '', $requestHost) ?? ''
    );
    $originHost = strtolower($originHost);

    if ($requestHost === '' || !hash_equals($requestHost, $originHost)) {
        respond(403, false, 'This form can only be submitted from the Echoform website.');
    }
}

function clientAddress(): string
{
    $address = trim($_SERVER['REMOTE_ADDR'] ?? '');

    if (
        $address !== '' &&
        filter_var($address, FILTER_VALIDATE_IP)
    ) {
        return $address;
    }

    return 'unknown';
}

function enforceRateLimit(string $clientAddress): void
{
    $directory = sys_get_temp_dir();

    if (!is_dir($directory) || !is_writable($directory)) {
        return;
    }

    $identifier = hash(
        'sha256',
        'echoform-contact|' . $clientAddress
    );

    $path = rtrim($directory, DIRECTORY_SEPARATOR)
        . DIRECTORY_SEPARATOR
        . 'echoform-contact-'
        . $identifier
        . '.json';

    $handle = @fopen($path, 'c+');

    if ($handle === false) {
        return;
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            return;
        }

        rewind($handle);
        $contents = stream_get_contents($handle);
        $timestamps = [];

        if (is_string($contents) && trim($contents) !== '') {
            $decoded = json_decode($contents, true);

            if (is_array($decoded)) {
                $timestamps = array_values(
                    array_filter(
                        $decoded,
                        static fn(mixed $item): bool => is_int($item) || ctype_digit((string) $item)
                    )
                );
            }
        }

        $now = time();
        $minimumTimestamp = $now - RATE_LIMIT_WINDOW_SECONDS;

        $timestamps = array_values(
            array_filter(
                $timestamps,
                static fn(mixed $timestamp): bool => (int) $timestamp >= $minimumTimestamp
            )
        );

        if (count($timestamps) >= RATE_LIMIT_MAX_REQUESTS) {
            flock($handle, LOCK_UN);
            fclose($handle);

            respond(
                429,
                false,
                'Too many requests were submitted. Please wait a few minutes and try again.'
            );
        }

        $timestamps[] = $now;

        ftruncate($handle, 0);
        rewind($handle);
        fwrite(
            $handle,
            json_encode($timestamps, JSON_UNESCAPED_SLASHES)
        );
        fflush($handle);
        flock($handle, LOCK_UN);
    } finally {
        if (is_resource($handle)) {
            fclose($handle);
        }
    }
}

function validateSubmissionTime(array $data): void
{
    $startedAt = rawField($data, 'formStartedAt');

    if ($startedAt === null || $startedAt === '') {
        return;
    }

    if (!is_scalar($startedAt)) {
        return;
    }

    $startedAtValue = (float) $startedAt;

    if ($startedAtValue <= 0) {
        return;
    }

    if ($startedAtValue > 100000000000) {
        $startedAtValue /= 1000;
    }

    $elapsed = microtime(true) - $startedAtValue;

    if ($elapsed >= 0 && $elapsed < MIN_SUBMISSION_SECONDS) {
        respond(
            422,
            false,
            'The form was submitted too quickly. Please review the information and try again.'
        );
    }
}

function sanitizeHeaderValue(string $value): string
{
    $value = preg_replace('/[\r\n]+/', ' ', $value) ?? '';
    $value = preg_replace('/\s+/', ' ', $value) ?? '';

    return trim($value);
}

function safeHost(): string
{
    $host = strtolower(
        preg_replace(
            '/:\d+$/',
            '',
            $_SERVER['HTTP_HOST'] ?? ''
        ) ?? ''
    );

    if (
        $host !== '' &&
        preg_match('/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/', $host)
    ) {
        return $host;
    }

    return 'echoform.studio';
}

function fieldLabel(string $key): string
{
    $labels = [
        'formType' => 'Form type',
        'fullName' => 'Full name',
        'email' => 'Email',
        'inquiryType' => 'Inquiry type',
        'service' => 'Selected solution',
        'subject' => 'Subject',
        'roomType' => 'Room type',
        'primaryGoal' => 'Primary goal',
        'roomLength' => 'Room length',
        'roomWidth' => 'Room width',
        'roomHeight' => 'Room height',
        'ceilingHeight' => 'Ceiling height',
        'roomDimensions' => 'Room dimensions',
        'roomUse' => 'Room use',
        'equipment' => 'Equipment',
        'currentTreatment' => 'Current treatment',
        'acousticChallenges' => 'Acoustic challenges',
        'challenges' => 'Challenges',
        'desiredOutcome' => 'Desired outcome',
        'preferredStyle' => 'Preferred style',
        'budget' => 'Budget context',
        'projectTimeline' => 'Project timeline',
        'location' => 'Project location',
        'organization' => 'Organization',
        'website' => 'Website',
        'collaborationType' => 'Collaboration type',
        'proposalType' => 'Proposal type',
        'audience' => 'Audience',
        'campaignDates' => 'Campaign dates',
        'proposalDetails' => 'Proposal details',
        'message' => 'Message',
        'sourcePage' => 'Source page',
    ];

    return $labels[$key] ?? ucfirst(
        preg_replace('/([a-z])([A-Z])/', '$1 $2', $key) ?? $key
    );
}

function subjectForForm(string $formType, string $inquiryType): string
{
    $normalized = strtolower(
        trim($formType . ' ' . $inquiryType)
    );

    if (
        str_contains($normalized, 'acoustic') ||
        str_contains($normalized, 'plan') ||
        str_contains($normalized, 'room')
    ) {
        return 'New Echoform acoustic plan request';
    }

    if (
        str_contains($normalized, 'advert') ||
        str_contains($normalized, 'collabor') ||
        str_contains($normalized, 'partner') ||
        str_contains($normalized, 'campaign')
    ) {
        return 'New Echoform advertising or collaboration inquiry';
    }

    return 'New Echoform website inquiry';
}

function formatMessageBody(array $fields, string $clientAddress): string
{
    $lines = [
        'A new inquiry was submitted through the Echoform website.',
        '',
        'Submission details',
        '------------------',
    ];

    foreach ($fields as $key => $value) {
        if ($value === '') {
            continue;
        }

        $label = fieldLabel($key);
        $normalizedValue = str_replace(
            ["\r\n", "\r"],
            "\n",
            $value
        );

        if (str_contains($normalizedValue, "\n")) {
            $lines[] = $label . ':';
            $lines[] = $normalizedValue;
        } else {
            $lines[] = $label . ': ' . $normalizedValue;
        }

        $lines[] = '';
    }

    $lines[] = 'Technical context';
    $lines[] = '-----------------';
    $lines[] = 'Submitted at: ' . gmdate('Y-m-d H:i:s') . ' UTC';
    $lines[] = 'Client address: ' . $clientAddress;

    $userAgent = normalizeSingleLine(
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    );

    if ($userAgent !== '') {
        $lines[] = 'User agent: ' . truncateText($userAgent, 500);
    }

    return implode("\n", $lines);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');

    respond(
        405,
        false,
        'Only POST requests are accepted.'
    );
}

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);

if ($contentLength > MAX_REQUEST_BYTES) {
    respond(
        413,
        false,
        'The submitted request is too large.'
    );
}

validateOrigin();

$data = parseRequestData();

if (count($data) > 80) {
    respond(
        422,
        false,
        'The submitted form contains too many fields.'
    );
}

$honeypot = singleLineField($data, 'company', 200);

if ($honeypot !== '') {
    respond(
        200,
        true,
        'Thank you. Your inquiry has been received.'
    );
}

validateSubmissionTime($data);

$clientAddress = clientAddress();
enforceRateLimit($clientAddress);

$fullName = singleLineField($data, 'fullName', 120);
$email = strtolower(singleLineField($data, 'email', 254));
$message = textField($data, 'message', 8000);
$proposalDetails = textField($data, 'proposalDetails', 8000);
$acousticChallenges = textField($data, 'acousticChallenges', 5000);
$challenges = textField($data, 'challenges', 5000);
$desiredOutcome = textField($data, 'desiredOutcome', 5000);
$consent = consentAccepted(
    rawField($data, 'privacyConsent')
);

if (stringLength($fullName) < 2) {
    respond(
        422,
        false,
        'Please enter your full name.'
    );
}

if (
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    stringLength($email) > 254
) {
    respond(
        422,
        false,
        'Please enter a valid email address.'
    );
}

$detailValues = [
    $message,
    $proposalDetails,
    $acousticChallenges,
    $challenges,
    $desiredOutcome,
];

$hasProjectDetails = false;

foreach ($detailValues as $detailValue) {
    if (stringLength($detailValue) >= 10) {
        $hasProjectDetails = true;
        break;
    }
}

if (!$hasProjectDetails) {
    respond(
        422,
        false,
        'Please add a short description of your room, project, or inquiry.'
    );
}

if (!$consent) {
    respond(
        422,
        false,
        'Please confirm that you agree to the Privacy Policy.'
    );
}

$allowedFields = [
    'formType' => ['single', 80],
    'fullName' => ['single', 120],
    'email' => ['single', 254],
    'inquiryType' => ['single', 120],
    'service' => ['single', 160],
    'subject' => ['single', 180],
    'roomType' => ['single', 160],
    'primaryGoal' => ['single', 200],
    'roomLength' => ['single', 80],
    'roomWidth' => ['single', 80],
    'roomHeight' => ['single', 80],
    'ceilingHeight' => ['single', 80],
    'roomDimensions' => ['single', 300],
    'roomUse' => ['multi', 2000],
    'equipment' => ['multi', 4000],
    'currentTreatment' => ['multi', 4000],
    'acousticChallenges' => ['multi', 5000],
    'challenges' => ['multi', 5000],
    'desiredOutcome' => ['multi', 5000],
    'preferredStyle' => ['multi', 2000],
    'budget' => ['single', 160],
    'projectTimeline' => ['single', 160],
    'location' => ['single', 220],
    'organization' => ['single', 220],
    'website' => ['single', 500],
    'collaborationType' => ['single', 180],
    'proposalType' => ['single', 180],
    'audience' => ['multi', 2000],
    'campaignDates' => ['single', 220],
    'proposalDetails' => ['multi', 8000],
    'message' => ['multi', 8000],
    'sourcePage' => ['single', 500],
];

$cleanFields = [];

foreach ($allowedFields as $key => [$mode, $maximumLength]) {
    $value = $mode === 'multi'
        ? textField($data, $key, $maximumLength)
        : singleLineField($data, $key, $maximumLength);

    if ($value !== '') {
        $cleanFields[$key] = $value;
    }
}

$cleanFields['fullName'] = $fullName;
$cleanFields['email'] = $email;

$formType = $cleanFields['formType'] ?? '';
$inquiryType = $cleanFields['inquiryType'] ?? '';
$subject = subjectForForm($formType, $inquiryType);

$recipient = configuredRecipientEmail();

if (!filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
    respond(
        500,
        false,
        'The contact recipient is not configured correctly.'
    );
}

$host = safeHost();
$fromAddress = trim(
    getenv('ECHOFORM_FROM_EMAIL') ?: 'noreply@' . $host
);

if (!filter_var($fromAddress, FILTER_VALIDATE_EMAIL)) {
    $fromAddress = 'noreply@echoform.studio';
}

$safeName = sanitizeHeaderValue($fullName);
$safeEmail = sanitizeHeaderValue($email);
$safeSubject = sanitizeHeaderValue($subject);

$encodedSubject = function_exists('mb_encode_mimeheader')
    ? mb_encode_mimeheader(
        $safeSubject,
        'UTF-8',
        'B',
        "\r\n"
    )
    : $safeSubject;

$encodedName = function_exists('mb_encode_mimeheader')
    ? mb_encode_mimeheader(
        $safeName,
        'UTF-8',
        'B',
        "\r\n"
    )
    : $safeName;

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: Echoform Website <' . $fromAddress . '>',
    'Reply-To: ' . $encodedName . ' <' . $safeEmail . '>',
    'X-Mailer: Echoform Contact Form',
];

$body = formatMessageBody(
    $cleanFields,
    $clientAddress
);

$sent = @mail(
    $recipient,
    $encodedSubject,
    $body,
    implode("\r\n", $headers)
);

if (!$sent) {
    respond(
        500,
        false,
        'Your inquiry could not be sent right now. Please try again later or contact Echoform by email.'
    );
}

respond(
    200,
    true,
    'Thank you. Your inquiry has been sent successfully.'
);
