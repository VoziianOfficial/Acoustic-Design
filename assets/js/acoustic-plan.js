(function () {
    "use strict";

    const fallbackPlanningNotes = [
        {
            number: "01",
            icon: "mic-2",
            title: "Voice and Microphone Use",
            text: "Describe where the speaker sits or stands, microphone type if known, typical speaking distance, and whether the room is used for calls, podcasts, streaming, or voice recording."
        },
        {
            number: "02",
            icon: "speaker",
            title: "Listening and Speakers",
            text: "Share speaker size, approximate distance from walls, listening distance, desk dimensions, and whether the room is mainly for mixing, music listening, editing, or entertainment."
        },
        {
            number: "03",
            icon: "activity",
            title: "Bass Behaviour",
            text: "Explain whether bass feels stronger near walls or corners, weak at the listening seat, uneven across the room, or difficult to judge at different volumes."
        },
        {
            number: "04",
            icon: "door-open",
            title: "Transmission Concern",
            text: "Describe the sound source, receiving room, time of day, walls or floors involved, doors, windows, ventilation, and whether the issue is airborne sound or impact noise."
        }
    ];

    function toLucideName(value) {
        return String(value || "audio-waveform")
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .replace(/[\s_]+/g, "-")
            .toLowerCase();
    }

    function updateConfiguredImages(config) {
        const images = config.images?.acousticPlan;

        if (!images) {
            return;
        }

        const hero = document.querySelector(".acoustic-plan-hero");

        if (hero && images.hero) {
            hero.style.backgroundImage = `url("${images.hero}")`;
        }

        const mappings = [
            {
                selector: ".plan-intro__main img",
                source: images.overview
            },
            {
                selector: ".plan-intro__detail img",
                source: images.detail
            },
            {
                selector: ".plan-expectations__image img",
                source: images.expectations
            }
        ];

        mappings.forEach(function (mapping) {
            const image = document.querySelector(mapping.selector);

            if (image && mapping.source) {
                image.src = mapping.source;
            }
        });
    }

    function normalizePlanningNote(note, index) {
        const fallback =
            fallbackPlanningNotes[index] ||
            fallbackPlanningNotes[
            index % fallbackPlanningNotes.length
            ];

        return {
            number:
                note?.number ||
                String(index + 1).padStart(2, "0"),
            icon:
                note?.icon ||
                fallback.icon ||
                "audio-waveform",
            title:
                note?.title ||
                fallback.title ||
                "Planning Detail",
            text:
                note?.text ||
                note?.description ||
                fallback.text ||
                ""
        };
    }

    function renderPlanningNotes(config, helpers) {
        const wrapper = document.querySelector(
            "[data-planning-notes]"
        );

        if (!wrapper) {
            return;
        }

        const source =
            Array.isArray(config.planningNotes) &&
                config.planningNotes.length > 0
                ? config.planningNotes
                : fallbackPlanningNotes;

        wrapper.innerHTML = source
            .map(function (note, index) {
                const item = normalizePlanningNote(
                    note,
                    index
                );

                return `
          <article class="swiper-slide plan-note">
            <span class="plan-note__number">${helpers.escapeHtml(
                    item.number
                )}</span>
            <i
              data-lucide="${helpers.escapeAttribute(
                    toLucideName(item.icon)
                )}"
              aria-hidden="true"
            ></i>
            <h3>${helpers.escapeHtml(
                    item.title
                )}</h3>
            <p>${helpers.escapeHtml(
                    item.text
                )}</p>
          </article>
        `;
            })
            .join("");
    }

    function updateFormContent(config) {
        const formConfig = config.forms?.acousticPlan;
        const form = document.querySelector(
            "form[data-form-type='acoustic-plan']"
        );

        if (!formConfig || !form) {
            return;
        }

        const heading = form.querySelector(
            ".plan-request__form-heading h3"
        );
        const submitLabel = form.querySelector(
            "[data-submit-label]"
        );

        if (heading && formConfig.title) {
            heading.textContent = formConfig.title;
        }

        if (submitLabel && formConfig.submitLabel) {
            submitLabel.textContent =
                formConfig.submitLabel;
        }
    }

    function updatePrivacyConsent(config) {
        const checkbox = document.querySelector(
            ".plan-request__form .site-form__checkbox"
        );

        if (
            !checkbox ||
            !config.forms?.privacyConsentText
        ) {
            return;
        }

        const textContainer =
            checkbox.querySelector(
                "span:last-child"
            );

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

    function initializePlanAnchors(helpers) {
        document
            .querySelectorAll('a[href^="#"]')
            .forEach(function (link) {
                const href = link.getAttribute("href");

                if (!href || href === "#") {
                    return;
                }

                link.addEventListener(
                    "click",
                    function (event) {
                        const target =
                            document.querySelector(href);

                        if (!target) {
                            return;
                        }

                        event.preventDefault();

                        target.scrollIntoView({
                            behavior:
                                helpers.reducedMotion.matches
                                    ? "auto"
                                    : "smooth",
                            block: "start"
                        });

                        if (
                            target.id === "request-plan"
                        ) {
                            window.setTimeout(
                                function () {
                                    const firstField =
                                        target.querySelector(
                                            "input:not([type='hidden']):not([tabindex='-1']), select, textarea"
                                        );

                                    if (firstField) {
                                        firstField.focus({
                                            preventScroll: true
                                        });
                                    }
                                },
                                helpers.reducedMotion.matches
                                    ? 0
                                    : 650
                            );
                        }
                    }
                );
            });
    }

    function initializeDiagramVisibility(helpers) {
        const diagram = document.querySelector(
            ".plan-anatomy__diagram"
        );

        if (!diagram) {
            return;
        }

        if (
            helpers.reducedMotion.matches ||
            typeof window.IntersectionObserver !==
            "function"
        ) {
            diagram.classList.add("is-visible");
            return;
        }

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    diagram.classList.add(
                        "is-visible"
                    );
                    observer.disconnect();
                });
            },
            {
                threshold: 0.24
            }
        );

        observer.observe(diagram);
    }

    function initializeFormProgress() {
        const form = document.querySelector(
            "form[data-form-type='acoustic-plan']"
        );

        if (!form) {
            return;
        }

        const fields = Array.from(
            form.querySelectorAll(
                "input:not([type='hidden']):not([name='company']), select, textarea"
            )
        );

        function updateProgress() {
            let complete = 0;
            let total = 0;

            fields.forEach(function (field) {
                if (
                    field.type === "checkbox"
                ) {
                    total += 1;

                    if (field.checked) {
                        complete += 1;
                    }

                    return;
                }

                if (!field.required) {
                    return;
                }

                total += 1;

                if (field.value.trim()) {
                    complete += 1;
                }
            });

            form.style.setProperty(
                "--form-progress",
                total > 0
                    ? `${Math.round(
                        (complete / total) * 100
                    )}%`
                    : "0%"
            );

            form.dataset.completion =
                String(complete);
            form.dataset.requiredCount =
                String(total);
        }

        fields.forEach(function (field) {
            field.addEventListener(
                "input",
                updateProgress
            );
            field.addEventListener(
                "change",
                updateProgress
            );
        });

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
            "#plan-message"
        );

        if (!textarea) {
            return;
        }

        const help = document.querySelector(
            "#plan-message-help"
        );

        if (!help) {
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

    function initializeSelectEnhancement() {
        document
            .querySelectorAll(
                ".plan-request__form select"
            )
            .forEach(function (select) {
                function updateState() {
                    select.classList.toggle(
                        "has-value",
                        Boolean(select.value)
                    );
                }

                select.addEventListener(
                    "change",
                    updateState
                );
                updateState();
            });
    }

    function initializeImageStates() {
        document
            .querySelectorAll(
                ".plan-intro img, .plan-expectations img"
            )
            .forEach(function (image) {
                function markLoaded() {
                    image.classList.add(
                        "is-loaded"
                    );
                }

                function markFailed() {
                    image.classList.add(
                        "has-error"
                    );
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

    function initializeFormSectionObserver() {
        const section = document.querySelector(
            ".plan-request"
        );

        if (
            !section ||
            typeof window.IntersectionObserver !==
            "function"
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    document.documentElement.classList.toggle(
                        "plan-form-visible",
                        entry.isIntersecting
                    );
                });
            },
            {
                threshold: 0.2
            }
        );

        observer.observe(section);
    }

    function initializePlanningNoteKeyboard() {
        const slider = document.querySelector(
            ".plan-notes__slider"
        );

        if (!slider) {
            return;
        }

        slider.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.key !== "ArrowLeft" &&
                    event.key !== "ArrowRight"
                ) {
                    return;
                }

                const swiper = slider.swiper;

                if (!swiper) {
                    return;
                }

                event.preventDefault();

                if (event.key === "ArrowLeft") {
                    swiper.slidePrev();
                } else {
                    swiper.slideNext();
                }
            }
        );
    }

    async function initializeAcousticPlanPage(
        config,
        helpers
    ) {
        updateConfiguredImages(config);
        renderPlanningNotes(config, helpers);
        updateFormContent(config);
        updatePrivacyConsent(config);
        helpers.renderConfiguredSelectOptions(
            document
        );
        initializePlanAnchors(helpers);
        initializeDiagramVisibility(helpers);
        initializeFormProgress();
        initializeTextareaCounter();
        initializeSelectEnhancement();
        initializeImageStates();
        initializeFormSectionObserver();
        helpers.refreshIcons(document);
        helpers.initializeSwipers(document);
        initializePlanningNoteKeyboard();
        helpers.safeRefreshAos();
    }

    window.ECHOFORM_PAGE_MODULE = {
        init: initializeAcousticPlanPage
    };
})();