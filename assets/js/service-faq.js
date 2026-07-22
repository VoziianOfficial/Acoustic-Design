(function () {
    "use strict";

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function createFaqItem(item, index, sectionId) {
        const triggerId = `${sectionId}-trigger-${index + 1}`;
        const panelId = `${sectionId}-panel-${index + 1}`;
        const isOpen = index === 0;

        return `
            <article
                class="site-accordion__item service-faq-showcase__item${isOpen ? " is-open" : ""}"
                ${isOpen ? 'data-open="true"' : ""}
            >
                <h3>
                    <button
                        class="site-accordion__trigger service-faq-showcase__trigger"
                        type="button"
                        aria-expanded="${isOpen ? "true" : "false"}"
                        aria-controls="${panelId}"
                        id="${triggerId}"
                    >
                        <span class="service-faq-showcase__question">
                            ${escapeHtml(item.question)}
                        </span>

                        <span
                            class="site-accordion__icon service-faq-showcase__toggle"
                            aria-hidden="true"
                        ></span>
                    </button>
                </h3>

                <div
                    class="site-accordion__panel${isOpen ? " is-open" : ""}"
                    id="${panelId}"
                    role="region"
                    aria-labelledby="${triggerId}"
                >
                    <div class="site-accordion__panel-inner">
                        <div class="site-accordion__content service-faq-showcase__answer">
                            <p>${escapeHtml(item.answer)}</p>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    function renderServiceFaq(root) {
        const key = root.dataset.serviceFaqKey;
        const config = window.ECHOFORM_CONFIG?.serviceFaqs?.[key];

        if (!config) {
            root.remove();
            return;
        }

        const sectionId = `${key}-service-faq`;
        const items = Array.isArray(config.items) ? config.items : [];

        root.outerHTML = `
            <section
                class="service-faq-showcase"
                aria-labelledby="${sectionId}-title"
            >
                <div class="site-container service-faq-showcase__header">
                    <div data-aos="fade-right">
                        <span class="site-eyebrow site-eyebrow--cyan">
                            ${escapeHtml(config.eyebrow)}
                        </span>

                        <h2 id="${sectionId}-title">
                            ${escapeHtml(config.title)}
                        </h2>
                    </div>
                </div>

                <div class="service-faq-showcase__stage">
                    <div
                        class="service-faq-showcase__media"
                        data-aos="fade-up"
                    >
                        <img
                            src="${escapeHtml(config.image)}"
                            alt="${escapeHtml(config.imageAlt)}"
                            width="1920"
                            height="980"
                            loading="lazy"
                            decoding="async"
                        >
                    </div>

                    <div class="site-container service-faq-showcase__panel-wrap">
                        <div
                            class="site-accordion service-faq-showcase__accordion"
                            data-accordion
                            data-first-open="true"
                            data-aos="fade-left"
                        >
                            ${items
                .map((item, index) =>
                    createFaqItem(item, index, sectionId)
                )
                .join("")}
                        </div>
                    </div>
                </div>
            </section>
        `;

        const title = document.getElementById(`${sectionId}-title`);
        const section = title
            ? title.closest(".service-faq-showcase")
            : null;

        initializeRenderedFaq(section);
    }

    function initializeFallbackAccordion(group) {
        const items = Array.from(
            group.querySelectorAll(".site-accordion__item")
        );
        const multiple = group.dataset.accordionMultiple === "true";

        items.forEach(function (item) {
            const trigger = item.querySelector(".site-accordion__trigger");
            const panel = item.querySelector(".site-accordion__panel");

            if (!trigger || !panel) {
                return;
            }

            trigger.addEventListener("click", function () {
                const expanded =
                    trigger.getAttribute("aria-expanded") === "true";

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

                        if (!otherTrigger || !otherPanel) {
                            return;
                        }

                        otherTrigger.setAttribute("aria-expanded", "false");
                        otherPanel.hidden = true;
                        otherPanel.classList.remove("is-open");
                        otherItem.classList.remove("is-open");
                        otherItem.removeAttribute("data-open");
                    });
                }

                trigger.setAttribute(
                    "aria-expanded",
                    expanded ? "false" : "true"
                );
                panel.hidden = expanded;
                panel.classList.toggle("is-open", !expanded);
                item.classList.toggle("is-open", !expanded);

                if (expanded) {
                    item.removeAttribute("data-open");
                } else {
                    item.dataset.open = "true";
                }
            });
        });
    }

    function initializeRenderedFaq(section) {
        if (!section) {
            return;
        }

        const accordion = section.querySelector("[data-accordion]");

        if (!accordion) {
            return;
        }

        if (
            window.ECHOFORM_APP &&
            typeof window.ECHOFORM_APP.initializeAccordions === "function"
        ) {
            window.ECHOFORM_APP.initializeAccordions(section);
            return;
        }

        initializeFallbackAccordion(accordion);
    }

    function initServiceFaqSections() {
        document
            .querySelectorAll("[data-service-faq]")
            .forEach(renderServiceFaq);

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    document.addEventListener("DOMContentLoaded", initServiceFaqSections);
})();
