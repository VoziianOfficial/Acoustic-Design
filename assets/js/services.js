(function () {
    "use strict";

    const fallbackDirections = {
        "home-studio-acoustics": {
            label: "Home Studio Acoustics",
            title: "Studio Priorities",
            description:
                "Explore speaker and listening position, desk interaction, first-reflection zones, rear-wall energy, bass build-up, and recording priorities.",
            priorities: [
                "Listening position and speaker alignment",
                "First-reflection and rear-wall control",
                "Bass build-up and corner treatment"
            ],
            image: "assets/images/studio-overview.webp",
            imageAlt:
                "Home studio arranged around speakers, a listening position, and acoustic treatment",
            icon: "audio-waveform",
            url: "home-studio-acoustics.html"
        },
        "streaming-room-setup": {
            label: "Streaming Room Setup",
            title: "Speech Priorities",
            description:
                "Review the microphone zone, nearby hard surfaces, desk reflections, monitor placement, camera framing, and treatment that works with the visible background.",
            priorities: [
                "Microphone position and speaking distance",
                "Desk, wall, and ceiling reflection control",
                "Treatment integrated with the camera view"
            ],
            image: "assets/images/streaming-overview.webp",
            imageAlt:
                "Streaming room with a microphone, workstation, lighting, and acoustic wall treatment",
            icon: "radio",
            url: "streaming-room-setup.html"
        },
        "soundproofing-guidance": {
            label: "Soundproofing Guidance",
            title: "Transmission Priorities",
            description:
                "Separate airborne and impact noise, identify likely gaps and connected paths, and understand why mass, sealing, decoupling, doors, windows, and ventilation details matter.",
            priorities: [
                "Identify the source and transmission route",
                "Review openings, gaps, and connected surfaces",
                "Seek building-specific input for structural work"
            ],
            image: "assets/images/soundproofing-overview.webp",
            imageAlt:
                "Layered room construction and sealed openings associated with sound isolation",
            icon: "layers",
            url: "soundproofing-guidance.html"
        },
        "acoustic-panels": {
            label: "Acoustic Panel Planning",
            title: "Panel Priorities",
            description:
                "Compare panel purpose, thickness, air gaps, mounting zones, finishes, ceiling treatment, and deeper forms intended for lower-frequency control.",
            priorities: [
                "Connect placement to the room problem",
                "Compare depth, backing, and air gaps",
                "Verify complete-product safety information"
            ],
            image: "assets/images/panels-overview.webp",
            imageAlt:
                "Architectural room with fabric acoustic panels arranged across the wall",
            icon: "layout-panel-top",
            url: "acoustic-panels.html"
        }
    };

    function toLucideName(value) {
        return String(value || "audio-waveform")
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .replace(/[\s_]+/g, "-")
            .toLowerCase();
    }

    function findService(config, slug) {
        if (!Array.isArray(config.services)) {
            return null;
        }

        return (
            config.services.find(function (service) {
                return service.slug === slug || service.id === slug;
            }) || null
        );
    }

    function getDirection(config, slug) {
        const service = findService(config, slug);
        const fallback = fallbackDirections[slug];

        if (!service && !fallback) {
            return null;
        }

        const selector = service?.selector || service?.servicesSelector || {};

        return {
            label:
                selector.label ||
                service?.name ||
                fallback?.label ||
                "Acoustic Direction",
            title:
                selector.title ||
                service?.selectorTitle ||
                fallback?.title ||
                service?.name ||
                "Room Direction",
            description:
                selector.description ||
                service?.selectorDescription ||
                service?.description ||
                fallback?.description ||
                "",
            priorities:
                selector.priorities ||
                service?.priorities ||
                fallback?.priorities ||
                [],
            image:
                selector.image ||
                service?.overviewImage ||
                service?.image ||
                fallback?.image ||
                "",
            imageAlt:
                selector.imageAlt ||
                service?.overviewImageAlt ||
                service?.imageAlt ||
                fallback?.imageAlt ||
                service?.name ||
                "",
            icon:
                selector.icon ||
                service?.icon ||
                fallback?.icon ||
                "audio-waveform",
            url:
                selector.url ||
                service?.url ||
                fallback?.url ||
                "services.html"
        };
    }

    function preloadImage(source) {
        return new Promise(function (resolve) {
            if (!source) {
                resolve(false);
                return;
            }

            const image = new Image();

            image.onload = function () {
                resolve(true);
            };

            image.onerror = function () {
                resolve(false);
            };

            image.src = source;
        });
    }

    function renderPriorityList(target, priorities, escapeHtml) {
        if (!target || !Array.isArray(priorities)) {
            return;
        }

        target.innerHTML = priorities
            .map(function (priority) {
                return `<li>${escapeHtml(priority)}</li>`;
            })
            .join("");
    }

    function updateServiceCards(config) {
        document
            .querySelectorAll("[data-service-card]")
            .forEach(function (card) {
                const service = findService(
                    config,
                    card.dataset.serviceCard
                );

                if (!service) {
                    return;
                }

                const image = card.querySelector(
                    ".services-solution__media img"
                );
                const title = card.querySelector(
                    ".services-solution__content h3"
                );
                const description = card.querySelector(
                    ".services-solution__content p"
                );
                const icon = card.querySelector(
                    ".services-solution__icon [data-lucide]"
                );

                if (service.url) {
                    card.href = service.url;
                }

                if (image && service.image) {
                    image.src = service.image;
                    image.alt = service.imageAlt || service.name;
                }

                if (title && service.name) {
                    title.textContent = service.name;
                }

                if (description && service.description) {
                    description.textContent = service.description;
                }

                if (icon && service.icon) {
                    icon.setAttribute(
                        "data-lucide",
                        toLucideName(service.icon)
                    );
                }
            });
    }

    function updateGuideRows(config) {
        document
            .querySelectorAll("[data-guide-service]")
            .forEach(function (row) {
                const service = findService(
                    config,
                    row.dataset.guideService
                );

                if (!service) {
                    return;
                }

                const title = row.querySelector(
                    ".services-guide-row__content strong"
                );
                const description = row.querySelector(
                    ".services-guide-row__content small"
                );
                const image = row.querySelector(
                    ".services-guide-row__visual img"
                );
                const icon = row.querySelector(
                    ".services-guide-row__icon [data-lucide]"
                );

                if (service.url) {
                    row.href = service.url;
                }

                if (title && service.name) {
                    title.textContent = service.name;
                }

                if (description && service.description) {
                    description.textContent = service.description;
                }

                if (image && service.image) {
                    image.src = service.image;
                }

                if (icon && service.icon) {
                    icon.setAttribute(
                        "data-lucide",
                        toLucideName(service.icon)
                    );
                }
            });
    }

    function updateConfiguredImages(config) {
        const images = config.images?.services;

        if (!images) {
            return;
        }

        const hero = document.querySelector(".services-hero");

        if (hero && images.hero) {
            hero.style.backgroundImage = `url("${images.hero}")`;
        }

        const mappings = [
            {
                selector: ".services-problems__image img",
                source: images.problems
            },
            {
                selector: ".services-faq__image img",
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

    function initializeServicesSelector(config, helpers) {
        const selector = document.querySelector(
            "[data-services-selector]"
        );

        if (!selector) {
            return;
        }

        const options = Array.from(
            selector.querySelectorAll("[data-service-option]")
        );
        const panel = selector.querySelector('[role="tabpanel"]');
        const image = selector.querySelector(
            "[data-service-selector-image]"
        );
        const label = selector.querySelector(
            "[data-service-selector-label]"
        );
        const title = selector.querySelector(
            "[data-service-selector-title]"
        );
        const description = selector.querySelector(
            "[data-service-selector-description]"
        );
        const priorities = selector.querySelector(
            "[data-service-selector-priorities]"
        );
        const link = selector.querySelector(
            "[data-service-selector-link]"
        );
        const icon = selector.querySelector(
            "[data-service-selector-icon]"
        );
        const hoverSupported = window.matchMedia(
            "(hover: hover) and (pointer: fine)"
        );
        let activeId =
            options.find(function (option) {
                return option.classList.contains("is-active");
            })?.dataset.serviceOption ||
            options[0]?.dataset.serviceOption ||
            "";
        let updateToken = 0;

        function updateOptionStates(id, focusOption) {
            options.forEach(function (option) {
                const active =
                    option.dataset.serviceOption === id;

                option.classList.toggle("is-active", active);
                option.setAttribute(
                    "aria-selected",
                    active ? "true" : "false"
                );
                option.setAttribute(
                    "tabindex",
                    active ? "0" : "-1"
                );

                if (active && focusOption) {
                    option.focus();
                }
            });
        }

        function renderDirection(direction) {
            if (label) {
                label.textContent = direction.label;
            }

            if (title) {
                title.textContent = direction.title;
            }

            if (description) {
                description.textContent =
                    direction.description;
            }

            if (link) {
                link.href = direction.url;
            }

            if (icon) {
                icon.setAttribute(
                    "data-lucide",
                    toLucideName(direction.icon)
                );
            }

            renderPriorityList(
                priorities,
                direction.priorities,
                helpers.escapeHtml
            );
        }

        async function activateDirection(id, focusOption) {
            const direction = getDirection(config, id);

            if (!direction) {
                return;
            }

            const changed = activeId !== id;
            activeId = id;
            updateOptionStates(id, focusOption);

            if (!changed) {
                renderDirection(direction);
                helpers.refreshIcons(selector);
                return;
            }

            const token = ++updateToken;

            if (image) {
                image.classList.add("is-changing");
            }

            const loaded = await preloadImage(
                direction.image
            );

            if (token !== updateToken) {
                return;
            }

            if (image && loaded) {
                image.src = direction.image;
                image.alt = direction.imageAlt;
            }

            renderDirection(direction);

            window.requestAnimationFrame(function () {
                if (image) {
                    image.classList.remove("is-changing");
                }

                helpers.refreshIcons(selector);
                helpers.safeRefreshAos();
            });
        }

        options.forEach(function (option, index) {
            const id = option.dataset.serviceOption;

            option.addEventListener("click", function () {
                activateDirection(id, false);
            });

            option.addEventListener("focus", function () {
                activateDirection(id, false);
            });

            option.addEventListener(
                "mouseenter",
                function () {
                    if (hoverSupported.matches) {
                        activateDirection(id, false);
                    }
                }
            );

            option.addEventListener(
                "keydown",
                function (event) {
                    let nextIndex = index;

                    if (
                        event.key === "ArrowDown" ||
                        event.key === "ArrowRight"
                    ) {
                        nextIndex =
                            index < options.length - 1
                                ? index + 1
                                : 0;
                    } else if (
                        event.key === "ArrowUp" ||
                        event.key === "ArrowLeft"
                    ) {
                        nextIndex =
                            index > 0
                                ? index - 1
                                : options.length - 1;
                    } else if (event.key === "Home") {
                        nextIndex = 0;
                    } else if (event.key === "End") {
                        nextIndex = options.length - 1;
                    } else {
                        return;
                    }

                    event.preventDefault();

                    const nextOption = options[nextIndex];

                    if (nextOption) {
                        activateDirection(
                            nextOption.dataset.serviceOption,
                            true
                        );
                    }
                }
            );
        });

        if (panel) {
            panel.setAttribute("aria-live", "polite");
            panel.setAttribute("aria-atomic", "false");
        }

        const initialDirection = getDirection(
            config,
            activeId
        );

        if (initialDirection) {
            updateOptionStates(activeId, false);
            renderDirection(initialDirection);

            if (image) {
                image.src = initialDirection.image;
                image.alt = initialDirection.imageAlt;
            }
        }
    }

    function initializeLayerDiagram() {
        const scene = document.querySelector(
            ".services-layers__scene"
        );

        if (!scene) {
            return;
        }

        const planes = Array.from(
            scene.querySelectorAll(
                ".services-layers__plane"
            )
        );

        planes.forEach(function (plane, index) {
            plane.setAttribute("tabindex", "0");
            plane.setAttribute(
                "aria-label",
                plane.textContent.trim()
            );

            plane.addEventListener("mouseenter", function () {
                scene.dataset.activeLayer =
                    String(index + 1);
            });

            plane.addEventListener("focus", function () {
                scene.dataset.activeLayer =
                    String(index + 1);
            });

            plane.addEventListener("mouseleave", function () {
                delete scene.dataset.activeLayer;
            });

            plane.addEventListener("blur", function () {
                delete scene.dataset.activeLayer;
            });
        });
    }

    function initializeProblemScan(helpers) {
        const scan = document.querySelector(
            ".services-problems__scan"
        );

        if (!scan) {
            return;
        }

        if (helpers.reducedMotion.matches) {
            scan.classList.add("is-static");
            return;
        }

        if (
            typeof window.IntersectionObserver !== "function"
        ) {
            scan.classList.add("is-active");
            return;
        }

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    scan.classList.toggle(
                        "is-active",
                        entry.isIntersecting
                    );
                });
            },
            {
                threshold: 0.25
            }
        );

        observer.observe(scan);
    }

    function initializeImageStates() {
        document
            .querySelectorAll(
                ".services-solution img, .services-problems img, .services-selector img, .services-material-row img, .services-faq img, .services-guide-row img"
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

    function initializeServiceLinks() {
        document
            .querySelectorAll(
                ".services-solution, .services-guide-row"
            )
            .forEach(function (link) {
                link.addEventListener(
                    "keydown",
                    function (event) {
                        if (event.key !== " ") {
                            return;
                        }

                        event.preventDefault();
                        link.click();
                    }
                );
            });
    }

    async function initializeServicesPage(
        config,
        helpers
    ) {
        updateConfiguredImages(config);
        updateServiceCards(config);
        updateGuideRows(config);
        initializeServicesSelector(config, helpers);
        initializeLayerDiagram();
        initializeProblemScan(helpers);
        initializeServiceLinks();
        initializeImageStates();
        helpers.refreshIcons(document);
        helpers.safeRefreshAos();
    }

    window.ECHOFORM_PAGE_MODULE = {
        init: initializeServicesPage
    };
})();