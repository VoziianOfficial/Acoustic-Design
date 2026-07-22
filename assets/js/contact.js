(function () {
    "use strict";

    function normalizeValue(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function updateConfiguredImages(config) {
        const images = config.images?.contact;

        if (!images) {
            return;
        }

        const hero = document.querySelector(".contact-hero");

        if (hero && images.hero) {
            hero.style.backgroundImage = `url("${images.hero}")`;
        }

        const mappings = [
            {
                selector: ".contact-prepare__image img",
                source: images.prepare
            },
            {
                selector: ".contact-prepare__detail img",
                source: images.detail
            },
            {
                selector: ".contact-collaboration__media img",
                source: images.collaboration
            },
            {
                selector: ".contact-faq__visual img",
                source: images.faq
            }
        ];

        mappings.forEach(function (mapping) {
            const image = document.querySelector(mapping.selector);

            if (image && mapping.source) {
                image.src = mapping.source;
            }
        });
    }

    function updateFormContent(config) {
        const formConfig =
            config.forms?.general ||
            config.forms?.contact;

        const form = document.querySelector(
            "form[data-form-type='general']"
        );

        if (!formConfig || !form) {
            return;
        }

        const eyebrow = form.querySelector(
            ".contact-form__heading > span"
        );
        const heading = form.querySelector(
            ".contact-form__heading h3"
        );
        const description = form.querySelector(
            ".contact-form__heading p"
        );
        const submitLabel = form.querySelector(
            "[data-submit-label]"
        );

        if (eyebrow && formConfig.eyebrow) {
            eyebrow.textContent = formConfig.eyebrow;
        }

        if (heading && formConfig.title) {
            heading.textContent = formConfig.title;
        }

        if (description && formConfig.description) {
            description.textContent =
                formConfig.description;
        }

        if (submitLabel && formConfig.submitLabel) {
            submitLabel.textContent =
                formConfig.submitLabel;
        }
    }

    function updatePrivacyConsent(config) {
        const checkbox = document.querySelector(
            ".contact-form .site-form__checkbox"
        );

        if (
            !checkbox ||
            !config.forms?.privacyConsentText
        ) {
            return;
        }

        const textContainer =
            checkbox.querySelector("span:last-child");

        if (!textContainer) {
            return;
        }

        const consentText =
            config.forms.privacyConsentText;
        const linkLabel =
            config.forms.privacyLinkLabel ||
            "Privacy Policy";
        const linkUrl =
            config.forms.privacyLinkUrl ||
            "privacy-policy.html";

        textContainer.innerHTML = `
      ${String(consentText)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")}
      <a href="${String(linkUrl)
                .replaceAll("&", "&amp;")
                .replaceAll('"', "&quot;")}">${String(
                    linkLabel
                )
                    .replaceAll("&", "&amp;")
                    .replaceAll("<", "&lt;")
                    .replaceAll(">", "&gt;")}</a>.
      <span aria-hidden="true">*</span>
    `;
    }

    function findMatchingOption(select, terms) {
        if (!select) {
            return null;
        }

        const normalizedTerms = terms.map(
            normalizeValue
        );

        return (
            Array.from(select.options).find(
                function (option) {
                    const value = normalizeValue(
                        option.value
                    );
                    const label = normalizeValue(
                        option.textContent
                    );

                    return normalizedTerms.some(
                        function (term) {
                            return (
                                value === term ||
                                value.includes(term) ||
                                label.includes(term)
                            );
                        }
                    );
                }
            ) || null
        );
    }

    function setInquiryType(form, intent) {
        const select = form?.querySelector(
            "[name='projectType']"
        );

        if (!select) {
            return false;
        }

        const termGroups = {
            collaboration: [
                "advertising-collaboration",
                "advertising",
                "collaboration",
                "partnership",
                "business-inquiry"
            ],
            acousticPlan: [
                "acoustic-plan",
                "room-plan",
                "planning",
                "acoustic-planning"
            ],
            general: [
                "general-inquiry",
                "general",
                "question",
                "other"
            ]
        };

        const option = findMatchingOption(
            select,
            termGroups[intent] || [intent]
        );

        if (!option) {
            return false;
        }

        select.value = option.value;
        select.dispatchEvent(
            new Event("change", {
                bubbles: true
            })
        );

        return true;
    }

    function focusContactForm(
        form,
        helpers,
        intent
    ) {
        if (!form) {
            return;
        }

        if (intent) {
            setInquiryType(form, intent);
        }

        form.scrollIntoView({
            behavior: helpers.reducedMotion.matches
                ? "auto"
                : "smooth",
            block: "center"
        });

        form.classList.remove("is-prefilled");

        window.requestAnimationFrame(function () {
            form.classList.add("is-prefilled");
        });

        window.setTimeout(
            function () {
                const firstEmpty = Array.from(
                    form.querySelectorAll(
                        "input:not([type='hidden']):not([type='checkbox']):not([tabindex='-1']), select, textarea"
                    )
                ).find(function (field) {
                    return !field.value;
                });

                const target =
                    firstEmpty ||
                    form.querySelector(
                        "input:not([type='hidden']):not([tabindex='-1']), select, textarea"
                    );

                if (target) {
                    target.focus({
                        preventScroll: true
                    });
                }
            },
            helpers.reducedMotion.matches
                ? 0
                : 650
        );
    }

    function initializeContactActions(helpers) {
        const form = document.querySelector(
            "form[data-form-type='general']"
        );

        document
            .querySelectorAll(
                "[data-contact-focus-form]"
            )
            .forEach(function (trigger) {
                trigger.addEventListener(
                    "click",
                    function (event) {
                        event.preventDefault();
                        focusContactForm(
                            form,
                            helpers,
                            "general"
                        );
                    }
                );
            });

        document
            .querySelectorAll(
                "[data-collaboration-form]"
            )
            .forEach(function (trigger) {
                trigger.addEventListener(
                    "click",
                    function () {
                        focusContactForm(
                            form,
                            helpers,
                            "collaboration"
                        );
                    }
                );
            });
    }

    function initializeQueryPrefill(helpers) {
        const form = document.querySelector(
            "form[data-form-type='general']"
        );

        if (!form) {
            return;
        }

        const parameters = new URLSearchParams(
            window.location.search
        );
        const intent =
            parameters.get("type") ||
            parameters.get("intent") ||
            parameters.get("projectType");

        if (!intent) {
            return;
        }

        const normalizedIntent =
            normalizeValue(intent);

        let mappedIntent = normalizedIntent;

        if (
            normalizedIntent.includes(
                "collabor"
            ) ||
            normalizedIntent.includes(
                "advert"
            ) ||
            normalizedIntent.includes(
                "partner"
            )
        ) {
            mappedIntent = "collaboration";
        } else if (
            normalizedIntent.includes("plan")
        ) {
            mappedIntent = "acousticPlan";
        } else if (
            normalizedIntent.includes(
                "general"
            ) ||
            normalizedIntent.includes(
                "question"
            )
        ) {
            mappedIntent = "general";
        }

        window.setTimeout(function () {
            focusContactForm(
                form,
                helpers,
                mappedIntent
            );
        }, 120);
    }

    function updateFieldState(field) {
        const wrapper = field.closest(
            "[data-form-field]"
        );

        if (!wrapper) {
            return;
        }

        const hasValue =
            field.type === "checkbox"
                ? field.checked
                : Boolean(field.value.trim());

        wrapper.classList.toggle(
            "has-value",
            hasValue
        );

        if (
            field.tagName === "SELECT"
        ) {
            field.classList.toggle(
                "has-value",
                hasValue
            );
        }

        if (!hasValue) {
            wrapper.classList.remove(
                "is-valid"
            );
            return;
        }

        wrapper.classList.toggle(
            "is-valid",
            field.checkValidity()
        );
    }

    function initializeFieldStates() {
        const form = document.querySelector(
            "form[data-form-type='general']"
        );

        if (!form) {
            return;
        }

        const fields = Array.from(
            form.querySelectorAll(
                "input:not([type='hidden']):not([name='company']), select, textarea"
            )
        );

        fields.forEach(function (field) {
            const wrapper = field.closest(
                "[data-form-field]"
            );

            field.addEventListener(
                "focus",
                function () {
                    wrapper?.classList.add(
                        "is-focused"
                    );
                }
            );

            field.addEventListener(
                "blur",
                function () {
                    wrapper?.classList.remove(
                        "is-focused"
                    );
                    updateFieldState(field);
                }
            );

            field.addEventListener(
                "input",
                function () {
                    updateFieldState(field);
                }
            );

            field.addEventListener(
                "change",
                function () {
                    updateFieldState(field);
                }
            );

            updateFieldState(field);
        });

        form.addEventListener(
            "reset",
            function () {
                window.requestAnimationFrame(
                    function () {
                        fields.forEach(
                            updateFieldState
                        );
                    }
                );
            }
        );
    }

    function initializeFormProgress() {
        const form = document.querySelector(
            "form[data-form-type='general']"
        );

        if (!form) {
            return;
        }

        const requiredFields = Array.from(
            form.querySelectorAll(
                "[required]:not([type='hidden'])"
            )
        );

        function updateProgress() {
            const completed =
                requiredFields.filter(
                    function (field) {
                        if (
                            field.type === "checkbox"
                        ) {
                            return field.checked;
                        }

                        return Boolean(
                            field.value.trim()
                        );
                    }
                ).length;

            const total =
                requiredFields.length;

            form.style.setProperty(
                "--form-progress",
                total > 0
                    ? `${Math.round(
                        (completed / total) * 100
                    )}%`
                    : "0%"
            );

            form.dataset.completion =
                String(completed);
            form.dataset.requiredCount =
                String(total);
        }

        requiredFields.forEach(
            function (field) {
                field.addEventListener(
                    "input",
                    updateProgress
                );
                field.addEventListener(
                    "change",
                    updateProgress
                );
            }
        );

        form.addEventListener(
            "reset",
            function () {
                window.requestAnimationFrame(
                    updateProgress
                );
            }
        );

        updateProgress();
    }

    function initializeTextareaCounter() {
        const textarea = document.querySelector(
            "#contact-message"
        );
        const help = document.querySelector(
            "#contact-message-help"
        );

        if (!textarea || !help) {
            return;
        }

        const originalText =
            help.textContent.trim();
        const maximum = Number(
            textarea.getAttribute("maxlength") ||
            5000
        );

        function updateCounter() {
            help.textContent = `${originalText} ${textarea.value.length}/${maximum}`;
        }

        textarea.addEventListener(
            "input",
            updateCounter
        );

        updateCounter();
    }

    function initializeImageStates() {
        document
            .querySelectorAll(
                ".contact-prepare img, .contact-collaboration img, .contact-faq img"
            )
            .forEach(function (image) {
                function markLoaded() {
                    image.classList.add("is-loaded");
                }

                function markFailed() {
                    image.classList.add("has-error");
                }

                if (
                    image.complete &&
                    image.naturalWidth > 0
                ) {
                    markLoaded();
                } else if (image.complete) {
                    markFailed();
                } else {
                    image.addEventListener(
                        "load",
                        markLoaded,
                        {
                            once: true
                        }
                    );

                    image.addEventListener(
                        "error",
                        markFailed,
                        {
                            once: true
                        }
                    );
                }
            });
    }

    function initializeEmailFallback(config) {
        const email =
            config.company?.email ||
            config.contact?.email;

        if (!email) {
            return;
        }

        document
            .querySelectorAll(
                "[data-config-email]"
            )
            .forEach(function (link) {
                link.textContent = email;
                link.href = `mailto:${email}`;
            });
    }

    function initializeCollaborationBinding(config) {
        const collaboration =
            config.advertiseCollaborate;

        if (!collaboration) {
            return;
        }

        const heading = document.querySelector(
            "#contact-collaboration-title"
        );
        const text = document.querySelector(
            ".contact-collaboration__content > p"
        );
        const buttonLabel =
            document.querySelector(
                "[data-collaboration-form] span"
            );

        if (heading && collaboration.title) {
            heading.textContent =
                collaboration.title;
        }

        if (text && collaboration.text) {
            text.textContent =
                collaboration.text;
        }

        if (
            buttonLabel &&
            collaboration.contactButtonLabel
        ) {
            buttonLabel.textContent =
                collaboration.contactButtonLabel;
        }
    }

    async function initializeContactPage(
        config,
        helpers
    ) {
        updateConfiguredImages(config);
        updateFormContent(config);
        updatePrivacyConsent(config);
        initializeEmailFallback(config);
        initializeCollaborationBinding(config);
        helpers.renderConfiguredSelectOptions(
            document
        );
        initializeFieldStates();
        initializeFormProgress();
        initializeTextareaCounter();
        initializeContactActions(helpers);
        initializeQueryPrefill(helpers);
        initializeImageStates();
        helpers.refreshIcons(document);
        helpers.safeRefreshAos();
    }

    window.ECHOFORM_PAGE_MODULE = {
        init: initializeContactPage
    };
})();