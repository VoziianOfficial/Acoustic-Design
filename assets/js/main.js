(function () {
    "use strict";

    document.documentElement.classList.remove("no-js");
    document.documentElement.classList.add("js");

    const config = window.ECHOFORM_CONFIG;
    const state = {
        aosInitialized: false,
        mobileMenuOpen: false,
        activeDropdown: null,
        parallaxFrame: 0,
        parallaxEnabled: false,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)"),
        desktopNavigation: window.matchMedia("(min-width: 1100px)"),
        desktopParallax: window.matchMedia("(min-width: 992px)"),
        initializedSwipers: new WeakSet(),
        initializedAccordions: new WeakSet(),
        initializedForms: new WeakSet()
    };

    function isObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replaceAll("`", "&#096;");
    }

    function resolveConfigPath(path) {
        if (!path || !config) {
            return undefined;
        }

        return path.split(".").reduce(function (current, key) {
            if (current === undefined || current === null) {
                return undefined;
            }

            if (Array.isArray(current) && /^\d+$/.test(key)) {
                return current[Number(key)];
            }

            return current[key];
        }, config);
    }

    function validHttpUrl(value) {
        if (typeof value !== "string" || value.includes("[") || value.includes("]")) {
            return false;
        }

        try {
            const url = new URL(value, window.location.href);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (error) {
            return false;
        }
    }

    function validEmail(value) {
        if (typeof value !== "string" || value.includes("[") || value.includes("]")) {
            return false;
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    let SITE_IDENTITY = {
        replaceName: "Echoform",
        name: "Echoform",
        legalName: "Echoform",
        email: "",
        phone: "",
        address: "",
        siteUrl: "",
        copyrightYear: String(new Date().getFullYear())
    };

    function normalizePhoneHref(value) {
        const phone = String(value || "").trim();

        if (
            !phone ||
            phone.includes("[") ||
            phone.includes("]")
        ) {
            return "";
        }

        const prefix = phone.startsWith("+") ? "+" : "";
        const digits = phone.replace(/\D/g, "");

        if (digits.length < 7) {
            return "";
        }

        return prefix + digits;
    }

    function validPhone(value) {
        return normalizePhoneHref(value) !== "";
    }

    function replaceIdentityString(value, replaceOldName) {
        let result = String(value ?? "");

        const replacements = {
            "[BRAND_NAME]": SITE_IDENTITY.name,
            "[COMPANY_NAME]": SITE_IDENTITY.name,
            "[LEGAL_COMPANY_NAME]": SITE_IDENTITY.legalName,
            "[CORPORATE_EMAIL]": SITE_IDENTITY.email,
            "[COMPANY_PHONE]": SITE_IDENTITY.phone,
            "[COMPANY_ADDRESS]": SITE_IDENTITY.address,
            "[SITE_URL]": SITE_IDENTITY.siteUrl
        };

        Object.entries(replacements).forEach(function ([token, replacement]) {
            result = result.split(token).join(String(replacement || ""));
        });

        if (
            replaceOldName !== false &&
            SITE_IDENTITY.replaceName &&
            SITE_IDENTITY.replaceName !== SITE_IDENTITY.name
        ) {
            result = result
                .split(SITE_IDENTITY.replaceName.toUpperCase())
                .join(SITE_IDENTITY.name.toUpperCase());

            result = result
                .split(SITE_IDENTITY.replaceName)
                .join(SITE_IDENTITY.name);
        }

        return result;
    }

    function rewriteConfigValue(value) {
        if (Array.isArray(value)) {
            return value.map(rewriteConfigValue);
        }

        if (isObject(value)) {
            return Object.fromEntries(
                Object.entries(value).map(function ([key, childValue]) {
                    return [key, rewriteConfigValue(childValue)];
                })
            );
        }

        if (typeof value === "string") {
            return replaceIdentityString(value, true);
        }

        return value;
    }

    function prepareSiteIdentity() {
        if (!config || !isObject(config)) {
            return;
        }

        const site = isObject(config.site)
            ? config.site
            : {};

        const currentBrand = isObject(config.brand)
            ? config.brand
            : {};

        const currentCompany = isObject(config.company)
            ? config.company
            : {};

        const replaceName = String(
            site.replaceName ||
            currentBrand.name ||
            "Echoform"
        ).trim();

        const name = String(
            site.name ||
            currentBrand.name ||
            replaceName
        ).trim();

        const legalName = String(
            site.legalName ||
            currentCompany.legalName ||
            currentBrand.legalName ||
            name
        ).trim();

        const email = String(
            site.email ||
            currentCompany.email ||
            ""
        ).trim();

        const phone = String(
            site.phone ||
            currentCompany.phone ||
            ""
        ).trim();

        const address = String(
            site.address ||
            currentCompany.address ||
            ""
        ).trim();

        const siteUrl = String(
            site.url ||
            site.siteUrl ||
            currentCompany.siteUrl ||
            ""
        ).trim().replace(/\/+$/, "");

        const copyrightYear = String(
            site.copyrightYear ||
            new Date().getFullYear()
        );

        SITE_IDENTITY = {
            replaceName,
            name,
            legalName,
            email,
            phone,
            address,
            siteUrl,
            copyrightYear
        };

        /*
         * Обновляем все старые строки внутри config:
         * Echoform, placeholders, тексты CTA, disclaimer и т.д.
         */
        Object.keys(config).forEach(function (key) {
            if (key === "site") {
                return;
            }

            config[key] = rewriteConfigValue(config[key]);
        });

        config.brand = isObject(config.brand)
            ? config.brand
            : {};

        config.company = isObject(config.company)
            ? config.company
            : {};

        /*
         * Старые компоненты сайта продолжают читать brand/company,
         * но значения всегда берутся из одного site-объекта.
         */
        config.brand.name = name;
        config.brand.logoText = name.toUpperCase();
        config.brand.logoAlt = name;
        config.brand.legalName = legalName;

        config.company.name = name;
        config.company.legalName = legalName;
        config.company.email = email;
        config.company.phone = phone;
        config.company.address = address;
        config.company.siteUrl = siteUrl;
        config.company.copyrightText =
            `© ${copyrightYear} ${legalName}. All rights reserved.`;

        config.site = {
            ...site,
            ...SITE_IDENTITY,
            url: siteUrl
        };
    }

    prepareSiteIdentity();

    function validConfiguredText(value) {
        return (
            typeof value === "string" &&
            value.trim() !== "" &&
            !/^\[[A-Z0-9_]+\]$/.test(value.trim())
        );
    }

    function getCompanyName() {
        const companyName = config.company?.name;
        const brandName = config.brand?.name;

        if (validConfiguredText(companyName) && companyName !== "Echoform") {
            return companyName;
        }

        if (validConfiguredText(brandName)) {
            return brandName;
        }

        if (validConfiguredText(companyName)) {
            return companyName;
        }

        return "Echoform";
    }

    function getCompanyLegalName() {
        if (validConfiguredText(config.company?.legalName)) {
            return config.company.legalName;
        }

        if (validConfiguredText(config.brand?.legalName)) {
            return config.brand.legalName;
        }

        return getCompanyName();
    }

    function getCompanyEmail() {
        return String(config.company?.email || config.contact?.email || "");
    }

    function getCompanyAddress() {
        return String(config.company?.address || config.contact?.address || "");
    }

    function getCompanyPhone() {
        return String(config.company?.phone || config.contact?.phone || "");
    }

    function getCompanyPhoneDisplay() {
        return String(
            config.company?.phoneDisplay ||
            config.contact?.phoneDisplay ||
            getCompanyPhone()
        );
    }

    function toTelHref(value) {
        if (!validConfiguredText(value)) {
            return "";
        }

        const normalized = String(value).replace(/[^\d+]/g, "");

        return normalized ? `tel:${normalized}` : "";
    }

    function replaceConfiguredTokens(value) {
        if (typeof value !== "string" || !config) {
            return value;
        }

        const replacements = {
            "[BRAND_NAME]": getCompanyName(),
            "[COMPANY_NAME]": getCompanyName(),
            "[LEGAL_COMPANY_NAME]": getCompanyLegalName(),
            "[CORPORATE_EMAIL]": getCompanyEmail(),
            "[COMPANY_EMAIL]": getCompanyEmail(),
            "[COMPANY_PHONE]": getCompanyPhoneDisplay(),
            "[COMPANY_ADDRESS]": getCompanyAddress(),
            "[SITE_URL]": String(config.company?.siteUrl || "")
        };

        let output = value;

        Object.entries(replacements).forEach(function ([token, replacement]) {
            output = output.replaceAll(token, replacement || token);
        });

        const companyName = getCompanyName();

        if (companyName && companyName !== "Echoform") {
            output = output.replaceAll("Echoform", companyName);
        }

        return output;
    }

    function normalizePageKey() {
        const page = document.body.dataset.page || "home";
        const service = document.body.dataset.service || "";

        if (page === "service-detail" && service) {
            return service;
        }

        if (page === "index") {
            return "home";
        }

        return page;
    }

    function getActiveNavigationId() {
        const page = normalizePageKey();

        if (page === "home") {
            return "home";
        }

        if (page === "about") {
            return "about";
        }

        if (page === "services") {
            return "solutions";
        }

        if (page === "acoustic-plan") {
            return "acoustic-plan";
        }

        if (page === "contact") {
            return "contact";
        }

        if (
            page === "home-studio-acoustics" ||
            page === "streaming-room-setup" ||
            page === "soundproofing-guidance" ||
            page === "acoustic-panels"
        ) {
            return "solutions";
        }

        return "";
    }

    function buildLogo(className) {
        const brand = config.brand;
        const logoText = String(brand.logoText || brand.name || "ECHOFORM");
        const logoIconPath = String(
            brand.logoImagePath ||
            brand.logoIconPath ||
            brand.faviconPath ||
            ""
        );
        const accentIndex = Number.isInteger(brand.accentLetterIndex)
            ? brand.accentLetterIndex
            : 3;

        const letters = Array.from(logoText)
            .map(function (letter, index) {
                const accentClass =
                    index === accentIndex ? " site-logo__letter--accent" : "";

                return `<span class="site-logo__letter${accentClass}">${escapeHtml(letter)}</span>`;
            })
            .join("");
        const icon = logoIconPath
            ? `<img class="site-logo__icon" src="${escapeAttribute(
                logoIconPath
            )}" alt="${escapeAttribute(brand.logoIconAlt || "")}" aria-hidden="true">`
            : "";

        return `
      <a class="site-logo ${className || ""}" href="index.html" aria-label="${escapeAttribute(
            brand.logoAlt || brand.name
        )}">
        ${icon}
        <span class="site-logo__text">${letters}</span>
      </a>
    `;
    }

    function buildDesktopNavigation() {
        const activeId = getActiveNavigationId();
        const activePage = normalizePageKey();

        return config.navigation
            .map(function (item) {
                if (!Array.isArray(item.dropdown) || item.dropdown.length === 0) {
                    const current = item.id === activeId ? ' aria-current="page"' : "";

                    return `
            <li class="site-nav__item">
              <a class="site-nav__link" href="${escapeAttribute(item.url)}"${current}>
                ${escapeHtml(item.label)}
              </a>
            </li>
          `;
                }

                const parentActive = item.id === activeId;
                const dropdownItems = item.dropdown
                    .map(function (dropdownItem) {
                        const current =
                            dropdownItem.id === activePage
                                ? ' aria-current="page"'
                                : activePage === "services" &&
                                    dropdownItem.id === "all-solutions"
                                    ? ' aria-current="page"'
                                    : "";

                        return `
              <li>
                <a class="site-nav__dropdown-link" href="${escapeAttribute(
                            dropdownItem.url
                        )}"${current}>
                  ${escapeHtml(dropdownItem.label)}
                </a>
              </li>
            `;
                    })
                    .join("");

                return `
          <li class="site-nav__item site-nav__item--dropdown">
            <button
              class="site-nav__toggle${parentActive ? " is-active" : ""}"
              type="button"
              aria-expanded="false"
              aria-controls="desktop-solutions-menu"
            >
              <span>${escapeHtml(item.label)}</span>
              <i data-lucide="chevron-down" aria-hidden="true"></i>
            </button>
            <ul class="site-nav__dropdown" id="desktop-solutions-menu">
              ${dropdownItems}
            </ul>
          </li>
        `;
            })
            .join("");
    }

    function buildMobileNavigation() {
        const activeId = getActiveNavigationId();
        const activePage = normalizePageKey();

        return config.navigation
            .map(function (item) {
                if (!Array.isArray(item.dropdown) || item.dropdown.length === 0) {
                    const current = item.id === activeId ? ' aria-current="page"' : "";

                    return `
            <li>
              <a class="site-mobile-menu__link" href="${escapeAttribute(
                        item.url
                    )}"${current}>
                <span>${escapeHtml(item.label)}</span>
              </a>
            </li>
          `;
                }

                const parentActive = item.id === activeId;
                const dropdownItems = item.dropdown
                    .map(function (dropdownItem) {
                        const current =
                            dropdownItem.id === activePage
                                ? ' aria-current="page"'
                                : activePage === "services" &&
                                    dropdownItem.id === "all-solutions"
                                    ? ' aria-current="page"'
                                    : "";

                        return `
              <li>
                <a class="site-mobile-menu__submenu-link" href="${escapeAttribute(
                            dropdownItem.url
                        )}"${current}>
                  ${escapeHtml(dropdownItem.label)}
                </a>
              </li>
            `;
                    })
                    .join("");

                return `
          <li>
            <button
              class="site-mobile-menu__toggle${parentActive ? " is-active" : ""}"
              type="button"
              aria-expanded="${parentActive ? "true" : "false"}"
              aria-controls="mobile-solutions-menu"
            >
              <span>${escapeHtml(item.label)}</span>
              <i data-lucide="chevron-down" aria-hidden="true"></i>
            </button>
            <ul
              class="site-mobile-menu__submenu${parentActive ? " is-open" : ""}"
              id="mobile-solutions-menu"
            >
              ${dropdownItems}
            </ul>
          </li>
        `;
            })
            .join("");
    }

    function buildHeaderEmail(className) {
        const email = config.company.email;

        if (!validEmail(email)) {
            return "";
        }

        return `
        <a
            class="site-button site-button--secondary ${escapeAttribute(
            className || ""
        )}"
            href="mailto:${escapeAttribute(email)}"
            aria-label="Email ${escapeAttribute(config.brand.name)}"
        >
            <i data-lucide="mail" aria-hidden="true"></i>
            <span>${escapeHtml(email)}</span>
        </a>
    `;
    }

    function renderHeader() {
        const target = document.querySelector("[data-site-header]");

        if (!target || !config) {
            return;
        }

        target.innerHTML = `
      <header class="site-header" data-header>
        <div class="site-header__inner">
          ${buildLogo("")}
          <nav class="site-header__nav" aria-label="Primary navigation">
            <ul class="site-nav">
              ${buildDesktopNavigation()}
            </ul>
          </nav>
          <div class="site-header__actions">
            ${buildHeaderEmail(
                "site-button--small site-header__phone"
            )}
            <a
              class="site-button site-button--primary site-button--small site-header__cta"
              href="${escapeAttribute(config.header.ctaUrl)}"
            >
              <span>${escapeHtml(config.header.ctaLabel)}</span>
              <i data-lucide="arrow-up-right" aria-hidden="true"></i>
            </a>
            <button
              class="site-header__menu-button"
              type="button"
              aria-label="${escapeAttribute(config.header.menuOpenLabel)}"
              aria-expanded="false"
              aria-controls="site-mobile-menu"
              data-mobile-menu-open
            >
              <i data-lucide="menu" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </header>
      <div
        class="site-mobile-menu"
        id="site-mobile-menu"
        aria-hidden="true"
        data-mobile-menu
      >
        <div class="site-mobile-menu__inner">
          <div class="site-mobile-menu__top">
            ${buildLogo("")}
            <button
              class="site-mobile-menu__close"
              type="button"
              aria-label="${escapeAttribute(config.header.menuCloseLabel)}"
              data-mobile-menu-close
            >
              <i data-lucide="x" aria-hidden="true"></i>
            </button>
          </div>
          <nav class="site-mobile-menu__nav" aria-label="Mobile navigation">
            <ul class="site-mobile-menu__list">
              ${buildMobileNavigation()}
            </ul>
          </nav>
          <div class="site-mobile-menu__footer">
            ${buildHeaderEmail(
                "site-mobile-menu__phone"
            )}
            <a
              class="site-button site-button--primary"
              href="${escapeAttribute(config.header.ctaUrl)}"
            >
              <span>${escapeHtml(config.header.ctaLabel)}</span>
              <i data-lucide="arrow-up-right" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>
    `;
    }

    function buildFooterContact() {
        const email = config.company.email;
        const address = config.company.address;

        const emailMarkup = validEmail(email)
            ? `
            <a href="mailto:${escapeAttribute(email)}">
                ${escapeHtml(email)}
            </a>
        `
            : email
                ? `<span>${escapeHtml(email)}</span>`
                : "";

        const addressMarkup = address
            ? `<span>${escapeHtml(address)}</span>`
            : "";

        return `
        <div class="site-footer__contact">
            ${emailMarkup}
            ${addressMarkup}
        </div>
    `;
    }

    function buildFooterColumn(column) {
        const links = column.links
            .map(function (link) {
                if (link.action === "open-cookie-settings") {
                    return `
            <li>
              <button
                class="site-footer__link"
                type="button"
                data-cookie-settings
              >
                ${escapeHtml(link.label)}
              </button>
            </li>
          `;
                }

                return `
          <li>
            <a class="site-footer__link" href="${escapeAttribute(link.url)}">
              ${escapeHtml(link.label)}
            </a>
          </li>
        `;
            })
            .join("");

        return `
      <div class="site-footer__column">
        <h2 class="site-footer__column-title">${escapeHtml(column.title)}</h2>
        <ul class="site-footer__links">
          ${links}
        </ul>
      </div>
    `;
    }

    function buildSocialLinks() {
        if (!Array.isArray(config.socialLinks)) {
            return "";
        }

        const links = config.socialLinks
            .filter(function (item) {
                return validHttpUrl(item.url);
            })
            .map(function (item) {
                return `
          <a
            class="site-footer__social"
            href="${escapeAttribute(item.url)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="${escapeAttribute(item.label)}"
          >
            <i data-lucide="${escapeAttribute(
                    String(item.icon || "external-link").toLowerCase()
                )}" aria-hidden="true"></i>
          </a>
        `;
            })
            .join("");

        if (!links) {
            return "";
        }

        return `<div class="site-footer__socials">${links}</div>`;
    }

    function renderFooter() {
        const target = document.querySelector("[data-site-footer]");

        if (!target || !config) {
            return;
        }

        const columns = Array.isArray(config.footer?.columns)
            ? config.footer.columns
                .map(function (column) {
                    return buildFooterColumn(column);
                })
                .join("")
            : "";

        target.innerHTML = `
      <footer class="site-footer">
        <div class="site-container">
          <div class="site-footer__main">
            <div class="site-footer__brand">
              ${buildLogo("")}
              <p>${escapeHtml(config.footer.description)}</p>
              ${buildFooterContact()}
              ${buildSocialLinks()}
            </div>
            ${columns}
          </div>
          <p class="site-footer__disclaimer">
            ${escapeHtml(config.aggregatorDisclaimer)}
          </p>
          <div class="site-footer__bottom">
            <span>${escapeHtml(replaceConfiguredTokens(config.company.copyrightText))}</span>
            <span>${escapeHtml(replaceConfiguredTokens(config.brand.tagline))}</span>
          </div>
        </div>
      </footer>
    `;
    }

    function renderSiteCtas() {
        const pageKey = normalizePageKey();

        document.querySelectorAll("[data-site-cta]").forEach(function (target) {
            const key = target.dataset.ctaKey || pageKey;
            const cta = config.pageCtas[key];

            if (!cta) {
                return;
            }

            target.classList.add("site-cta-wrap");
            target.innerHTML = `
        <div class="site-container">
          <div class="site-cta site-tilt">
            <div class="site-cta__content">
              <span class="site-eyebrow site-eyebrow--blue">Acoustic Direction</span>
              <h2>${escapeHtml(cta.heading)}</h2>
              <p>${escapeHtml(cta.text)}</p>
              <a
                class="site-button site-button--primary"
                href="${escapeAttribute(cta.buttonUrl)}"
              >
                <span>${escapeHtml(cta.buttonLabel)}</span>
                <i data-lucide="arrow-up-right" aria-hidden="true"></i>
              </a>
            </div>
            <div class="site-cta__media" aria-hidden="true">
              <img
                src="${escapeAttribute(cta.image)}"
                alt=""
                width="760"
                height="560"
                loading="lazy"
                decoding="async"
              >
            </div>
          </div>
        </div>
      `;
        });
    }

    function applyConfiguredTextNodes(root) {
        const scope = root || document;
        const walker = document.createTreeWalker(
            scope,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {
                    const parent = node.parentElement;

                    if (
                        !parent ||
                        parent.closest("script, style, textarea, input, select")
                    ) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        const textNodes = [];

        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        textNodes.forEach(function (node) {
            const nextValue = replaceConfiguredTokens(node.nodeValue);

            if (nextValue !== node.nodeValue) {
                node.nodeValue = nextValue;
            }
        });
    }

    function applyConfiguredAttributes(root) {
        const scope = root || document;
        const selector = [
            "[title]",
            "[aria-label]",
            "[alt]",
            "[placeholder]",
            'meta[content]',
            'input[value]',
            'button[value]'
        ].join(",");

        scope.querySelectorAll(selector).forEach(function (element) {
            ["title", "aria-label", "alt", "placeholder", "content", "value"].forEach(
                function (attribute) {
                    if (!element.hasAttribute(attribute)) {
                        return;
                    }

                    const current = element.getAttribute(attribute);
                    const nextValue = replaceConfiguredTokens(current);

                    if (nextValue !== current) {
                        element.setAttribute(attribute, nextValue);
                    }
                }
            );
        });
    }

    function applyConfiguredStructuredData(root) {
        const scope = root || document;

        scope
            .querySelectorAll('script[type="application/ld+json"]')
            .forEach(function (script) {
                script.textContent = replaceConfiguredTokens(script.textContent);
            });
    }

    function applyConfiguredContactLinks(root) {
        const scope = root || document;
        const email = getCompanyEmail();
        const phone = getCompanyPhone();
        const phoneDisplay = getCompanyPhoneDisplay();
        const phoneHref = toTelHref(phone);

        if (validEmail(email)) {
            scope.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
                link.setAttribute("href", `mailto:${email}`);

                if (
                    link.textContent.trim() === "" ||
                    link.textContent.includes("@") ||
                    link.textContent.includes("[CORPORATE_EMAIL]")
                ) {
                    link.textContent = email;
                }
            });
        }

        if (phoneHref) {
            scope.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
                link.setAttribute("href", phoneHref);

                if (
                    link.textContent.trim() === "" ||
                    /^[+\d\s().-]+$/.test(link.textContent.trim()) ||
                    link.textContent.includes("[COMPANY_PHONE]")
                ) {
                    link.textContent = phoneDisplay;
                }
            });
        }
    }

    function applyGlobalContactConfig(root) {
        const scope = root || document;

        if (scope === document) {
            document.title = replaceConfiguredTokens(document.title);
        }

        applyConfiguredTextNodes(scope);
        applyConfiguredAttributes(scope);
        applyConfiguredStructuredData(scope);
        applyConfiguredContactLinks(scope);
    }

    function setContactElementValue(element, value, href) {
        const stringValue = String(value || "");

        /*
         * В legal-карточках внутри ссылки есть иконка и span.
         * Поэтому не удаляем всю внутреннюю разметку.
         */
        const nestedText = element.querySelector(
            "span:last-child"
        );

        if (
            nestedText &&
            element.querySelector("i, svg")
        ) {
            nestedText.textContent = stringValue;
        } else {
            element.textContent = stringValue;
        }

        if (element.tagName !== "A") {
            return;
        }

        if (href) {
            element.setAttribute("href", href);
            element.removeAttribute("aria-disabled");
        } else {
            element.removeAttribute("href");
            element.setAttribute("aria-disabled", "true");
        }
    }

    function replaceJsonIdentity(value) {
        if (Array.isArray(value)) {
            return value.map(replaceJsonIdentity);
        }

        if (isObject(value)) {
            return Object.fromEntries(
                Object.entries(value).map(function ([key, childValue]) {
                    return [
                        key,
                        replaceJsonIdentity(childValue)
                    ];
                })
            );
        }

        if (typeof value === "string") {
            return replaceIdentityString(value, true);
        }

        return value;
    }

    function replaceIdentityInDocument(root) {
        const scope = root || document;

        /*
         * Заменяет Echoform и placeholders в обычном видимом тексте.
         */
        const walker = document.createTreeWalker(
            scope,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {
                    const parent = node.parentElement;

                    if (!parent) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    if (
                        parent.closest(
                            "script, style, noscript, textarea, code, pre"
                        )
                    ) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let node = walker.nextNode();

        while (node) {
            textNodes.push(node);
            node = walker.nextNode();
        }

        textNodes.forEach(function (textNode) {
            const currentValue = textNode.nodeValue;
            const newValue = replaceIdentityString(
                currentValue,
                true
            );

            if (currentValue !== newValue) {
                textNode.nodeValue = newValue;
            }
        });

        /*
         * title, meta description, Open Graph, alt, aria-label.
         */
        scope
            .querySelectorAll(
                "[title], [aria-label], [aria-description], " +
                "[alt], [placeholder], [content]"
            )
            .forEach(function (element) {
                [
                    "title",
                    "aria-label",
                    "aria-description",
                    "alt",
                    "placeholder",
                    "content"
                ].forEach(function (attributeName) {
                    if (!element.hasAttribute(attributeName)) {
                        return;
                    }

                    const currentValue =
                        element.getAttribute(attributeName);

                    const newValue = replaceIdentityString(
                        currentValue,
                        true
                    );

                    if (newValue !== currentValue) {
                        element.setAttribute(
                            attributeName,
                            newValue
                        );
                    }
                });
            });

        /*
         * URL placeholders. Название в путях картинок не трогаем,
         * чтобы echoform-logo.svg не превратился в битый путь.
         */
        scope
            .querySelectorAll("[href], [src], [action]")
            .forEach(function (element) {
                ["href", "src", "action"].forEach(function (attributeName) {
                    if (!element.hasAttribute(attributeName)) {
                        return;
                    }

                    const currentValue =
                        element.getAttribute(attributeName);

                    const newValue = replaceIdentityString(
                        currentValue,
                        false
                    );

                    if (newValue !== currentValue) {
                        element.setAttribute(
                            attributeName,
                            newValue
                        );
                    }
                });
            });

        /*
         * Organization, WebSite, ContactPage и другой JSON-LD.
         */
        scope
            .querySelectorAll(
                'script[type="application/ld+json"]'
            )
            .forEach(function (script) {
                try {
                    const json = JSON.parse(script.textContent);

                    script.textContent = JSON.stringify(
                        replaceJsonIdentity(json),
                        null,
                        2
                    );
                } catch (error) {
                    /*
                     * Не ломаем страницу из-за ошибочного JSON-LD.
                     */
                }
            });
    }

    function applyConfigBindings(root) {
        const scope = root || document;

        scope
            .querySelectorAll("[data-config-text]")
            .forEach(function (element) {
                const value = resolveConfigPath(
                    element.dataset.configText
                );

                if (value !== undefined && value !== null) {
                    element.textContent = replaceIdentityString(
                        String(value),
                        true
                    );
                }
            });

        scope
            .querySelectorAll("[data-config-html]")
            .forEach(function (element) {
                const value = resolveConfigPath(
                    element.dataset.configHtml
                );

                if (value !== undefined && value !== null) {
                    element.textContent = replaceIdentityString(
                        String(value),
                        true
                    );
                }
            });

        scope
            .querySelectorAll("[data-config-href]")
            .forEach(function (element) {
                const value = resolveConfigPath(
                    element.dataset.configHref
                );

                if (typeof value === "string") {
                    element.setAttribute(
                        "href",
                        replaceIdentityString(value, false)
                    );
                }
            });

        scope
            .querySelectorAll("[data-config-src]")
            .forEach(function (element) {
                const value = resolveConfigPath(
                    element.dataset.configSrc
                );

                if (typeof value === "string") {
                    element.setAttribute(
                        "src",
                        replaceIdentityString(value, false)
                    );
                }
            });

        scope
            .querySelectorAll("[data-config-alt]")
            .forEach(function (element) {
                const value = resolveConfigPath(
                    element.dataset.configAlt
                );

                if (typeof value === "string") {
                    element.setAttribute(
                        "alt",
                        replaceIdentityString(value, true)
                    );
                }
            });

        scope
            .querySelectorAll("[data-config-email]")
            .forEach(function (element) {
                const email = config.company.email;

                setContactElementValue(
                    element,
                    email,
                    validEmail(email)
                        ? `mailto:${email}`
                        : ""
                );
            });

        scope
            .querySelectorAll("[data-config-phone]")
            .forEach(function (element) {
                const phone = config.company.phone;
                const normalizedPhone =
                    normalizePhoneHref(phone);

                setContactElementValue(
                    element,
                    phone,
                    normalizedPhone
                        ? `tel:${normalizedPhone}`
                        : ""
                );
            });

        replaceIdentityInDocument(scope);
    }



    function applyBrandAssets() {
        const faviconPath = config.brand?.faviconPath;

        if (!faviconPath) {
            return;
        }

        document
            .querySelectorAll('link[rel~="icon"]')
            .forEach(function (link) {
                link.setAttribute("href", faviconPath);
            });
    }

    function renderConfiguredSelectOptions(root) {
        const scope = root || document;

        scope
            .querySelectorAll("select[data-options-source]")
            .forEach(function (select) {
                const sourceName = select.dataset.optionsSource;
                const options = config.forms[sourceName];

                if (!Array.isArray(options)) {
                    return;
                }

                const currentValue = select.value;
                select.innerHTML = options
                    .map(function (option, index) {
                        const disabled =
                            index === 0 && option.value === "" ? " disabled" : "";
                        const selected =
                            option.value === currentValue ||
                                (!currentValue && index === 0)
                                ? " selected"
                                : "";

                        return `
              <option
                value="${escapeAttribute(option.value)}"
                ${disabled}${selected}
              >
                ${escapeHtml(option.label)}
              </option>
            `;
                    })
                    .join("");
            });
    }

    function refreshIcons(root) {
        if (
            !window.lucide ||
            typeof window.lucide.createIcons !== "function"
        ) {
            return;
        }

        const scope = root || document;

        try {
            window.lucide.createIcons({
                root: scope,
                attrs: {
                    "aria-hidden": "true"
                }
            });
        } catch (error) {
            return;
        }
    }

    function closeDesktopDropdown(restoreFocus) {
        const dropdown = document.querySelector(".site-nav__dropdown.is-open");
        const toggle = document.querySelector(
            '.site-nav__toggle[aria-expanded="true"]'
        );

        if (dropdown) {
            dropdown.classList.remove("is-open");
        }

        if (toggle) {
            toggle.setAttribute("aria-expanded", "false");

            if (restoreFocus) {
                toggle.focus();
            }
        }

        state.activeDropdown = null;
    }

    function initializeDesktopDropdown() {
        const toggle = document.querySelector(".site-nav__toggle");
        const dropdown = document.querySelector(".site-nav__dropdown");

        if (!toggle || !dropdown) {
            return;
        }

        toggle.addEventListener("click", function () {
            const open = toggle.getAttribute("aria-expanded") === "true";

            if (open) {
                closeDesktopDropdown(false);
                return;
            }

            closeDesktopDropdown(false);
            toggle.setAttribute("aria-expanded", "true");
            dropdown.classList.add("is-open");
            state.activeDropdown = dropdown;
        });

        toggle.addEventListener("keydown", function (event) {
            if (event.key !== "ArrowDown") {
                return;
            }

            event.preventDefault();
            toggle.setAttribute("aria-expanded", "true");
            dropdown.classList.add("is-open");
            state.activeDropdown = dropdown;

            const firstLink = dropdown.querySelector("a");

            if (firstLink) {
                firstLink.focus();
            }
        });

        dropdown.addEventListener("keydown", function (event) {
            const links = Array.from(dropdown.querySelectorAll("a"));
            const currentIndex = links.indexOf(document.activeElement);

            if (event.key === "Escape") {
                event.preventDefault();
                closeDesktopDropdown(true);
                return;
            }

            if (event.key === "ArrowDown") {
                event.preventDefault();
                const nextIndex =
                    currentIndex < links.length - 1 ? currentIndex + 1 : 0;
                links[nextIndex].focus();
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();
                const nextIndex =
                    currentIndex > 0 ? currentIndex - 1 : links.length - 1;
                links[nextIndex].focus();
            }
        });

        document.addEventListener("click", function (event) {
            if (
                state.activeDropdown &&
                !event.target.closest(".site-nav__item--dropdown")
            ) {
                closeDesktopDropdown(false);
            }
        });
    }

    function getFocusableElements(container) {
        return Array.from(
            container.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        ).filter(function (element) {
            return (
                !element.hasAttribute("hidden") &&
                element.getAttribute("aria-hidden") !== "true" &&
                element.offsetParent !== null
            );
        });
    }

    function openMobileMenu() {
        const menu = document.querySelector("[data-mobile-menu]");
        const openButton = document.querySelector("[data-mobile-menu-open]");

        if (!menu || !openButton || state.mobileMenuOpen) {
            return;
        }

        state.mobileMenuOpen = true;
        state.mobileMenuTrigger = openButton;
        menu.classList.add("is-open");
        menu.setAttribute("aria-hidden", "false");
        openButton.setAttribute("aria-expanded", "true");
        document.body.classList.add("mobile-menu-open");
        document.documentElement.classList.add("no-scroll");

        window.setTimeout(function () {
            const closeButton = menu.querySelector("[data-mobile-menu-close]");

            if (closeButton) {
                closeButton.focus();
            }
        }, 40);
    }

    function closeMobileMenu(restoreFocus) {
        const menu = document.querySelector("[data-mobile-menu]");
        const openButton = document.querySelector("[data-mobile-menu-open]");

        if (!menu || !openButton || !state.mobileMenuOpen) {
            return;
        }

        state.mobileMenuOpen = false;
        menu.classList.remove("is-open");
        menu.setAttribute("aria-hidden", "true");
        openButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("mobile-menu-open");
        document.documentElement.classList.remove("no-scroll");

        if (restoreFocus && state.mobileMenuTrigger) {
            state.mobileMenuTrigger.focus();
        }
    }

    function initializeMobileMenu() {
        const menu = document.querySelector("[data-mobile-menu]");
        const openButton = document.querySelector("[data-mobile-menu-open]");
        const closeButton = document.querySelector("[data-mobile-menu-close]");
        const submenuToggle = document.querySelector(
            ".site-mobile-menu__toggle"
        );
        const submenu = document.querySelector(
            ".site-mobile-menu__submenu"
        );

        if (!menu || !openButton || !closeButton) {
            return;
        }

        openButton.addEventListener("click", openMobileMenu);
        closeButton.addEventListener("click", function () {
            closeMobileMenu(true);
        });

        menu.addEventListener("click", function (event) {
            const link = event.target.closest("a");

            if (link) {
                closeMobileMenu(false);
            }
        });

        menu.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                event.preventDefault();
                closeMobileMenu(true);
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const focusable = getFocusableElements(menu);

            if (focusable.length === 0) {
                event.preventDefault();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });

        if (submenuToggle && submenu) {
            submenuToggle.addEventListener("click", function () {
                const expanded =
                    submenuToggle.getAttribute("aria-expanded") === "true";

                submenuToggle.setAttribute(
                    "aria-expanded",
                    expanded ? "false" : "true"
                );
                submenu.classList.toggle("is-open", !expanded);
            });
        }

        const handleDesktopChange = function (event) {
            if (event.matches) {
                closeMobileMenu(false);
            }
        };

        if (typeof state.desktopNavigation.addEventListener === "function") {
            state.desktopNavigation.addEventListener(
                "change",
                handleDesktopChange
            );
        } else {
            state.desktopNavigation.addListener(handleDesktopChange);
        }
    }

    function openAccordionItem(item, trigger, panel) {
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;

        window.requestAnimationFrame(function () {
            panel.classList.add("is-open");
            item.classList.add("is-open");
        });
    }

    function closeAccordionItem(item, trigger, panel) {
        trigger.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
        item.classList.remove("is-open");

        window.setTimeout(function () {
            if (trigger.getAttribute("aria-expanded") === "false") {
                panel.hidden = true;
            }
        }, 430);
    }

    function initializeAccordion(group) {
        if (state.initializedAccordions.has(group)) {
            return;
        }

        const items = Array.from(
            group.querySelectorAll(".site-accordion__item")
        );

        if (items.length === 0) {
            return;
        }

        state.initializedAccordions.add(group);
        const multiple = group.dataset.accordionMultiple === "true";

        items.forEach(function (item, index) {
            const trigger = item.querySelector(".site-accordion__trigger");
            const panel = item.querySelector(".site-accordion__panel");

            if (!trigger || !panel) {
                return;
            }

            const shouldOpen =
                trigger.getAttribute("aria-expanded") === "true" ||
                item.dataset.open === "true" ||
                (index === 0 && group.dataset.firstOpen === "true");

            if (shouldOpen) {
                trigger.setAttribute("aria-expanded", "true");
                panel.hidden = false;
                panel.classList.add("is-open");
                item.classList.add("is-open");
            } else {
                trigger.setAttribute("aria-expanded", "false");
                panel.classList.remove("is-open");
                panel.hidden = true;
            }

            trigger.addEventListener("click", function () {
                const expanded =
                    trigger.getAttribute("aria-expanded") === "true";

                if (expanded) {
                    closeAccordionItem(item, trigger, panel);
                    return;
                }

                if (!multiple) {
                    items.forEach(function (otherItem) {
                        if (otherItem === item) {
                            return;
                        }

                        const otherTrigger = otherItem.querySelector(
                            ".site-accordion__trigger"
                        );
                        const otherPanel = otherItem.querySelector(
                            ".site-accordion__panel"
                        );

                        if (
                            otherTrigger &&
                            otherPanel &&
                            otherTrigger.getAttribute("aria-expanded") === "true"
                        ) {
                            closeAccordionItem(
                                otherItem,
                                otherTrigger,
                                otherPanel
                            );
                        }
                    });
                }

                openAccordionItem(item, trigger, panel);
            });
        });
    }

    function initializeAccordions(root) {
        const scope = root || document;

        scope.querySelectorAll("[data-accordion]").forEach(function (group) {
            initializeAccordion(group);
        });
    }

    function getSwiperElements(element) {
        const shell = element.closest("[data-slider-shell]");
        const section =
            element.closest(".site-section, .home-hero") ||
            shell ||
            element.parentElement;
        const paginationScope = shell || section;

        return {
            previous: section
                ? section.querySelector("[data-slider-prev]")
                : null,
            next: section ? section.querySelector("[data-slider-next]") : null,
            pagination: paginationScope
                ? paginationScope.querySelector("[data-slider-pagination]")
                : null
        };
    }

    function buildSwiperOptions(element) {
        const preset = element.dataset.swiper;
        const controls = getSwiperElements(element);
        const base = {
            watchOverflow: true,
            observer: true,
            observeParents: true,
            keyboard: {
                enabled: true,
                onlyInViewport: true
            },
            a11y: {
                enabled: true
            },
            navigation:
                controls.previous && controls.next
                    ? {
                        prevEl: controls.previous,
                        nextEl: controls.next
                    }
                    : undefined,
            pagination: controls.pagination
                ? {
                    el: controls.pagination,
                    clickable: true
                }
                : undefined
        };

        if (preset === "hero") {
            return Object.assign({}, base, {
                slidesPerView: 1,
                speed: state.reducedMotion.matches ? 0 : 850,
                effect: state.reducedMotion.matches ? "slide" : "fade",
                fadeEffect: {
                    crossFade: true
                },
                allowTouchMove: true,
                loop: false,
                rewind: true,
                autoplay: state.reducedMotion.matches
                    ? false
                    : {
                        delay: 7200,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true
                    }
            });
        }

        if (preset === "materials") {
            return Object.assign({}, base, {
                slidesPerView: 1,
                spaceBetween: 18,
                speed: state.reducedMotion.matches ? 0 : 650,
                freeMode: false,
                loop: true,
                breakpoints: {
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 24
                    },
                    1100: {
                        slidesPerView: 3,
                        spaceBetween: 28
                    }
                }
            });
        }

        if (preset === "notes") {
            return Object.assign({}, base, {
                slidesPerView: 1,
                spaceBetween: 20,
                speed: state.reducedMotion.matches ? 0 : 550,
                autoHeight: true,
                autoplay: false,
                loop: true,
                breakpoints: {
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 24
                    },
                    1100: {
                        slidesPerView: 2,
                        spaceBetween: 28
                    }
                }
            });
        }

        if (preset === "service-layouts") {
            return Object.assign({}, base, {
                slidesPerView: 1,
                spaceBetween: 20,
                speed: state.reducedMotion.matches ? 0 : 600,
                autoplay: false,
                loop: true,
                breakpoints: {
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 24
                    },
                    1100: {
                        slidesPerView: 2,
                        spaceBetween: 28
                    }
                }
            });
        }

        return Object.assign({}, base, {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            speed: state.reducedMotion.matches ? 0 : 600
        });
    }

    function pauseHeroOnFocus(element, swiper) {
        if (!swiper.autoplay) {
            return;
        }

        element.addEventListener("focusin", function () {
            swiper.autoplay.stop();
        });

        element.addEventListener("focusout", function (event) {
            if (!element.contains(event.relatedTarget)) {
                swiper.autoplay.start();
            }
        });
    }

    function initializeSwiper(element) {
        if (
            state.initializedSwipers.has(element) ||
            element.dataset.swiperReady === "true"
        ) {
            return null;
        }

        if (typeof window.Swiper !== "function") {
            element.classList.add("site-library-fallback-active");
            return null;
        }

        try {
            const swiper = new window.Swiper(
                element,
                buildSwiperOptions(element)
            );

            state.initializedSwipers.add(element);
            element.dataset.swiperReady = "true";

            if (element.dataset.swiper === "hero") {
                pauseHeroOnFocus(element, swiper);
            }

            return swiper;
        } catch (error) {
            element.classList.add("site-library-fallback-active");
            return null;
        }
    }

    function initializeSwipers(root) {
        const scope = root || document;

        scope.querySelectorAll("[data-swiper]").forEach(function (element) {
            initializeSwiper(element);
        });
    }

    function updateParallax() {
        state.parallaxFrame = 0;

        if (
            !state.desktopParallax.matches ||
            state.reducedMotion.matches
        ) {
            document.documentElement.classList.remove("parallax-enabled");
            state.parallaxEnabled = false;

            document.querySelectorAll("[data-parallax]").forEach(function (item) {
                item.style.removeProperty("--parallax-y");
            });

            return;
        }

        document.documentElement.classList.add("parallax-enabled");
        state.parallaxEnabled = true;

        const viewportHeight = window.innerHeight;

        document.querySelectorAll("[data-parallax]").forEach(function (item) {
            const rect = item.getBoundingClientRect();

            if (rect.bottom < 0 || rect.top > viewportHeight) {
                return;
            }

            const center = rect.top + rect.height / 2;
            const distance = center - viewportHeight / 2;
            const strength = Number(item.dataset.parallaxStrength || 0.07);
            const offset = Math.max(
                -42,
                Math.min(42, distance * strength * -1)
            );

            item.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
        });
    }

    function requestParallaxUpdate() {
        if (state.parallaxFrame) {
            return;
        }

        state.parallaxFrame = window.requestAnimationFrame(updateParallax);
    }

    function initializeParallax() {
        if (!document.querySelector("[data-parallax]")) {
            return;
        }

        updateParallax();
        window.addEventListener("scroll", requestParallaxUpdate, {
            passive: true
        });
        window.addEventListener("resize", requestParallaxUpdate, {
            passive: true
        });

        const handleMotionChange = function () {
            requestParallaxUpdate();
        };

        if (typeof state.reducedMotion.addEventListener === "function") {
            state.reducedMotion.addEventListener(
                "change",
                handleMotionChange
            );
            state.desktopParallax.addEventListener(
                "change",
                handleMotionChange
            );
        } else {
            state.reducedMotion.addListener(handleMotionChange);
            state.desktopParallax.addListener(handleMotionChange);
        }
    }

    function getCookieChoice() {
        try {
            return window.localStorage.getItem(
                config.cookieConsent.storageKey
            );
        } catch (error) {
            return null;
        }
    }

    function saveCookieChoice(value) {
        try {
            window.localStorage.setItem(
                config.cookieConsent.storageKey,
                value
            );
            return true;
        } catch (error) {
            return false;
        }
    }

    function renderCookieConsent() {
        let target = document.querySelector("[data-cookie-consent]");

        if (!target) {
            target = document.createElement("div");
            target.setAttribute("data-cookie-consent", "");
            document.body.appendChild(target);
        }

        const cookie = config.cookieConsent;

        target.innerHTML = `
      <section
        class="site-cookie"
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-description"
        data-cookie-panel
      >
        <div class="site-cookie__content">
          <h2 class="site-cookie__title" id="cookie-title">
            ${escapeHtml(cookie.title)}
          </h2>
          <p class="site-cookie__text" id="cookie-description">
            ${escapeHtml(cookie.text)}
            <a href="${escapeAttribute(cookie.privacyUrl)}">
              ${escapeHtml(cookie.privacyLabel)}
            </a>
          </p>
          <div class="site-cookie__actions">
            <button
              class="site-cookie__button site-cookie__button--accept"
              type="button"
              data-cookie-accept
            >
              ${escapeHtml(cookie.acceptLabel)}
            </button>
            <button
              class="site-cookie__button site-cookie__button--decline"
              type="button"
              data-cookie-decline
            >
              ${escapeHtml(cookie.declineLabel)}
            </button>
          </div>
        </div>
      </section>
    `;
    }

    function showCookiePanel(focusPanel) {
        const panel = document.querySelector("[data-cookie-panel]");

        if (!panel) {
            return;
        }

        panel.classList.add("is-visible");

        if (focusPanel) {
            const firstButton = panel.querySelector("button");

            if (firstButton) {
                firstButton.focus();
            }
        }
    }

    function hideCookiePanel() {
        const panel = document.querySelector("[data-cookie-panel]");

        if (panel) {
            panel.classList.remove("is-visible");
        }
    }

    function initializeCookieConsent() {
        renderCookieConsent();

        const accept = document.querySelector("[data-cookie-accept]");
        const decline = document.querySelector("[data-cookie-decline]");

        if (accept) {
            accept.addEventListener("click", function () {
                saveCookieChoice(config.cookieConsent.acceptedValue);
                document.documentElement.dataset.cookieConsent =
                    config.cookieConsent.acceptedValue;
                hideCookiePanel();
            });
        }

        if (decline) {
            decline.addEventListener("click", function () {
                saveCookieChoice(config.cookieConsent.declinedValue);
                document.documentElement.dataset.cookieConsent =
                    config.cookieConsent.declinedValue;
                hideCookiePanel();
            });
        }

        document.addEventListener("click", function (event) {
            const button = event.target.closest("[data-cookie-settings]");

            if (!button) {
                return;
            }

            event.preventDefault();
            showCookiePanel(true);
        });

        const choice = getCookieChoice();

        if (
            choice === config.cookieConsent.acceptedValue ||
            choice === config.cookieConsent.declinedValue
        ) {
            document.documentElement.dataset.cookieConsent = choice;
            return;
        }

        window.setTimeout(function () {
            showCookiePanel(false);
        }, state.reducedMotion.matches ? 0 : 500);
    }

    function getFormField(input) {
        return input.closest("[data-form-field], .site-form__field");
    }

    function getFormErrorElement(input) {
        const field = getFormField(input);

        if (!field) {
            return null;
        }

        return field.querySelector("[data-form-error], .site-form__error");
    }

    function setFieldError(input, message) {
        const field = getFormField(input);
        const errorElement = getFormErrorElement(input);

        input.setAttribute("aria-invalid", message ? "true" : "false");

        if (field) {
            field.classList.toggle("has-error", Boolean(message));
        }

        if (errorElement) {
            errorElement.textContent = message || "";
        }
    }

    function getValidationMessage(input) {
        const messages = config.forms.validation;
        const value =
            input.type === "checkbox" ? input.checked : input.value.trim();

        if (input.required) {
            if (input.type === "checkbox" && !input.checked) {
                return messages.privacyMessage;
            }

            if (input.type !== "checkbox" && !value) {
                if (input.tagName === "SELECT") {
                    return messages.selectMessage;
                }

                return messages.requiredMessage;
            }
        }

        if (!value && input.type !== "checkbox") {
            return "";
        }

        if (input.name === "fullName") {
            if (
                value.length < messages.nameMinLength ||
                value.length > messages.nameMaxLength
            ) {
                return messages.nameMessage;
            }
        }

        if (input.type === "email") {
            if (!validEmail(value)) {
                return messages.emailMessage;
            }
        }

        if (input.name === "message") {
            if (
                value.length < messages.messageMinLength ||
                value.length > messages.messageMaxLength
            ) {
                return messages.messageMessage;
            }
        }

        if (!input.checkValidity()) {
            return messages.requiredMessage;
        }

        return "";
    }

    function validateForm(form) {
        const inputs = Array.from(
            form.querySelectorAll(
                "input:not([type='hidden']):not([name='company']), select, textarea"
            )
        );
        let firstInvalid = null;

        inputs.forEach(function (input) {
            const message = getValidationMessage(input);
            setFieldError(input, message);

            if (message && !firstInvalid) {
                firstInvalid = input;
            }
        });

        if (firstInvalid) {
            firstInvalid.focus();
            return false;
        }

        return true;
    }

    function setFormStatus(form, message, type) {
        const status = form.querySelector(
            "[data-form-status], .site-form__status"
        );

        if (!status) {
            return;
        }

        status.textContent = message || "";
        status.classList.remove("is-success", "is-error");

        if (type === "success") {
            status.classList.add("is-success");
        }

        if (type === "error") {
            status.classList.add("is-error");
        }
    }

    function getFormStartedField(form) {
        return form.querySelector(
            "input[name='formStartedAt'], input[name='form-start-timestamp']"
        );
    }

    function resetFormStartedAt(form) {
        const field = getFormStartedField(form);

        if (field) {
            field.value = String(Date.now());
        }
    }

    function createSubmissionFingerprint(payload) {
        const source = [
            payload.formType || "",
            payload.fullName || "",
            payload.email || "",
            payload.projectType || "",
            payload.roomType || "",
            payload.primaryGoal || "",
            payload.message || ""
        ].join("|");

        let hash = 0;

        for (let index = 0; index < source.length; index += 1) {
            hash = (hash << 5) - hash + source.charCodeAt(index);
            hash |= 0;
        }

        return String(hash);
    }

    function recentlySubmitted(payload) {
        const fingerprint = createSubmissionFingerprint(payload);
        const key = "echoform-last-form-submission";

        try {
            const stored = JSON.parse(
                window.sessionStorage.getItem(key) || "null"
            );

            if (
                stored &&
                stored.fingerprint === fingerprint &&
                Date.now() - stored.time < 20000
            ) {
                return true;
            }
        } catch (error) {
            return false;
        }

        return false;
    }

    function rememberSubmission(payload) {
        const key = "echoform-last-form-submission";

        try {
            window.sessionStorage.setItem(
                key,
                JSON.stringify({
                    fingerprint: createSubmissionFingerprint(payload),
                    time: Date.now()
                })
            );
        } catch (error) {
            return;
        }
    }

    function buildFormPayload(form) {
        const data = new FormData(form);
        const payload = {};

        data.forEach(function (value, key) {
            payload[key] = typeof value === "string" ? value.trim() : value;
        });

        payload.formType =
            payload.formType || form.dataset.formType || "general";
        payload.sourcePage =
            payload.sourcePage ||
            window.location.pathname.split("/").pop() ||
            "index.html";
        payload.formStartedAt =
            payload.formStartedAt ||
            payload["form-start-timestamp"] ||
            String(Date.now());
        payload.privacyConsent = Boolean(
            form.querySelector("input[name='privacyConsent']:checked")
        );
        payload.company = payload.company || "";

        if (
            payload.formType === "acoustic-plan" &&
            !payload.projectType
        ) {
            payload.projectType = "Acoustic Plan";
        }

        return payload;
    }

    function setSubmittingState(form, submitting) {
        const button = form.querySelector("[type='submit']");

        form.dataset.submitting = submitting ? "true" : "false";

        if (!button) {
            return;
        }

        if (!button.dataset.originalLabel) {
            button.dataset.originalLabel = button.textContent.trim();
        }

        button.disabled = submitting;
        button.setAttribute("aria-disabled", submitting ? "true" : "false");

        const label = button.querySelector("[data-submit-label]");

        if (submitting) {
            if (label) {
                label.textContent = config.forms.loadingMessage;
            } else {
                button.textContent = config.forms.loadingMessage;
            }
        } else if (label) {
            label.textContent = button.dataset.originalLabel;
        } else {
            button.textContent = button.dataset.originalLabel;
        }
    }

    function applyServerFieldErrors(form, errors) {
        if (!isObject(errors)) {
            return;
        }

        Object.keys(errors).forEach(function (name) {
            const input = form.elements.namedItem(name);

            if (input && typeof errors[name] === "string") {
                setFieldError(input, errors[name]);
            }
        });
    }

    async function submitForm(form) {
        if (form.dataset.submitting === "true") {
            return;
        }

        setFormStatus(form, "", "");

        if (!validateForm(form)) {
            setFormStatus(form, config.forms.errorMessage, "error");
            return;
        }

        const payload = buildFormPayload(form);

        if (recentlySubmitted(payload)) {
            setFormStatus(
                form,
                "This request was already sent. Please wait before submitting it again.",
                "error"
            );
            return;
        }

        setSubmittingState(form, true);
        setFormStatus(form, config.forms.loadingMessage, "");

        try {
            const response = await window.fetch(config.forms.endpoint, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: JSON.stringify(payload)
            });

            let result;

            try {
                result = await response.json();
            } catch (error) {
                result = {
                    success: false,
                    message: config.forms.errorMessage
                };
            }

            if (!response.ok || !result.success) {
                applyServerFieldErrors(form, result.errors);
                setFormStatus(
                    form,
                    result.message || config.forms.errorMessage,
                    "error"
                );
                return;
            }

            rememberSubmission(payload);
            setFormStatus(
                form,
                result.message || config.forms.successMessage,
                "success"
            );
            form.reset();
            resetFormStartedAt(form);
            renderConfiguredSelectOptions(form);
        } catch (error) {
            setFormStatus(form, config.forms.errorMessage, "error");
        } finally {
            setSubmittingState(form, false);
        }
    }

    function initializeForm(form) {
        if (state.initializedForms.has(form)) {
            return;
        }

        state.initializedForms.add(form);
        form.noValidate = true;
        resetFormStartedAt(form);

        Array.from(form.elements).forEach(function (input) {
            if (
                !input ||
                typeof input.addEventListener !== "function" ||
                input.type === "hidden" ||
                input.name === "company"
            ) {
                return;
            }

            input.addEventListener("blur", function () {
                setFieldError(input, getValidationMessage(input));
            });

            input.addEventListener("input", function () {
                if (input.getAttribute("aria-invalid") === "true") {
                    setFieldError(input, getValidationMessage(input));
                }
            });

            input.addEventListener("change", function () {
                if (input.getAttribute("aria-invalid") === "true") {
                    setFieldError(input, getValidationMessage(input));
                }
            });
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            submitForm(form);
        });
    }

    function initializeForms(root) {
        const scope = root || document;

        scope
            .querySelectorAll("form[data-echoform-form]")
            .forEach(function (form) {
                initializeForm(form);
            });
    }

    function applySeoFromConfig() {
        const pageKey = normalizePageKey();
        const seo = config.seo[pageKey];

        if (!seo) {
            return;
        }

        document.title = replaceConfiguredTokens(seo.title);

        const description = document.querySelector(
            'meta[name="description"]'
        );
        const ogTitle = document.querySelector(
            'meta[property="og:title"]'
        );
        const ogDescription = document.querySelector(
            'meta[property="og:description"]'
        );
        const twitterTitle = document.querySelector(
            'meta[name="twitter:title"]'
        );
        const twitterDescription = document.querySelector(
            'meta[name="twitter:description"]'
        );

        if (description) {
            description.setAttribute("content", replaceConfiguredTokens(seo.description));
        }

        if (ogTitle) {
            ogTitle.setAttribute(
                "content",
                replaceConfiguredTokens(seo.openGraphTitle || seo.title)
            );
        }

        if (ogDescription) {
            ogDescription.setAttribute(
                "content",
                replaceConfiguredTokens(seo.openGraphDescription || seo.description)
            );
        }

        if (twitterTitle) {
            twitterTitle.setAttribute(
                "content",
                replaceConfiguredTokens(seo.openGraphTitle || seo.title)
            );
        }

        if (twitterDescription) {
            twitterDescription.setAttribute(
                "content",
                replaceConfiguredTokens(seo.openGraphDescription || seo.description)
            );
        }

        if (validHttpUrl(config.company.siteUrl)) {
            const baseUrl = config.company.siteUrl.replace(/\/+$/, "");
            const canonicalUrl = `${baseUrl}/${seo.canonicalPath}`;
            const canonical = document.querySelector('link[rel="canonical"]');
            const ogUrl = document.querySelector('meta[property="og:url"]');
            const ogImage = document.querySelector(
                'meta[property="og:image"]'
            );
            const twitterImage = document.querySelector(
                'meta[name="twitter:image"]'
            );
            const imageUrl = `${baseUrl}/${config.brand.openGraphImage}`;

            if (canonical) {
                canonical.setAttribute("href", canonicalUrl);
            }

            if (ogUrl) {
                ogUrl.setAttribute("content", canonicalUrl);
            }

            if (ogImage) {
                ogImage.setAttribute("content", imageUrl);
            }

            if (twitterImage) {
                twitterImage.setAttribute("content", imageUrl);
            }
        }
    }

    function safeRefreshAos() {
        if (
            state.aosInitialized &&
            window.AOS &&
            typeof window.AOS.refreshHard === "function"
        ) {
            window.requestAnimationFrame(function () {
                window.AOS.refreshHard();
            });
        }
    }

    function initializeAos() {
        if (state.aosInitialized) {
            return;
        }

        if (
            !window.AOS ||
            typeof window.AOS.init !== "function" ||
            state.reducedMotion.matches
        ) {
            document.documentElement.classList.remove("aos-ready");
            document.documentElement.classList.add("aos-fallback");
            return;
        }

        try {
            window.AOS.init({
                once: true,
                duration: 700,
                offset: 80,
                easing: "ease-out-cubic"
            });

            state.aosInitialized = true;
            document.documentElement.classList.add("aos-ready");
            safeRefreshAos();
        } catch (error) {
            document.documentElement.classList.remove("aos-ready");
            document.documentElement.classList.add("aos-fallback");
        }
    }

    function initializeGlobalInteractions() {
        initializeDesktopDropdown();
        initializeMobileMenu();
        initializeCookieConsent();
        initializeAccordions();
        initializeSwipers();
        initializeForms();
        initializeParallax();
    }

    function getPageHelpers() {
        return {
            escapeHtml: escapeHtml,
            escapeAttribute: escapeAttribute,
            resolveConfigPath: resolveConfigPath,
            refreshIcons: refreshIcons,
            initializeAccordions: initializeAccordions,
            initializeSwipers: initializeSwipers,
            initializeForms: initializeForms,
            initializeSwiper: initializeSwiper,
            safeRefreshAos: safeRefreshAos,
            applyConfigBindings: applyConfigBindings,
            applyGlobalContactConfig: applyGlobalContactConfig,
            renderConfiguredSelectOptions: renderConfiguredSelectOptions,
            reducedMotion: state.reducedMotion
        };
    }

    async function initializePageModule() {
        const module = window.ECHOFORM_PAGE_MODULE;

        if (!module || typeof module.init !== "function") {
            return;
        }

        try {
            await module.init(config, getPageHelpers());
        } catch (error) {
            document.documentElement.classList.add("page-module-fallback");
        }
    }

    function renderAutomaticCompanyContacts(root) {
        const scope = root || document;
        scope
            .querySelectorAll("[data-generated-company-phone]")
            .forEach(function (container) {
                container.remove();
            });
    }

    async function initializeApplication() {
        if (!config || !isObject(config)) {
            document.documentElement.classList.add(
                "config-error"
            );
            return;
        }

        /*
         * Конфиг уже синхронизирован через prepareSiteIdentity().
         */
        renderHeader();
        renderFooter();
        renderSiteCtas();
        applyBrandAssets();

        /*
         * Меняем статический HTML, title, meta и JSON-LD.
         */
        applyConfigBindings();
        renderConfiguredSelectOptions();
        applySeoFromConfig();

        await initializePageModule();

        /*
         * Page module мог добавить новые элементы,
         * поэтому применяем данные ещё раз.
         */
        renderAutomaticCompanyContacts();
        applyConfigBindings();
        renderConfiguredSelectOptions();

        refreshIcons();
        initializeGlobalInteractions();
        initializeAos();
        safeRefreshAos();

        document.documentElement.classList.add(
            "app-ready"
        );
    }

    window.ECHOFORM_APP = {
        getConfig: function () {
            return config;
        },
        refreshIcons: refreshIcons,
        initializeAccordions: initializeAccordions,
        initializeSwipers: initializeSwipers,
        initializeForms: initializeForms,
        safeRefreshAos: safeRefreshAos,
        applyConfigBindings: applyConfigBindings,
        applyGlobalContactConfig: applyGlobalContactConfig,
        renderConfiguredSelectOptions: renderConfiguredSelectOptions,
        renderAutomaticCompanyContacts:
            renderAutomaticCompanyContacts,

        replaceIdentityInDocument:
            replaceIdentityInDocument,
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeApplication,
            {
                once: true
            }
        );
    } else {
        initializeApplication();
    }
})();
