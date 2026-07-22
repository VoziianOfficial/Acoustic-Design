(function () {
    "use strict";

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

    function toLucideName(value) {
        return String(value || "audio-waveform")
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .replace(/[\s_]+/g, "-")
            .toLowerCase();
    }

    function updateServiceRows(config, helpers) {
        document
            .querySelectorAll("[data-about-service]")
            .forEach(function (row) {
                const service = findService(
                    config,
                    row.dataset.aboutService
                );

                if (!service) {
                    return;
                }

                const image = row.querySelector(
                    ".about-service-row__media img"
                );
                const title = row.querySelector(
                    ".about-service-row__content h3"
                );
                const description = row.querySelector(
                    ".about-service-row__content p"
                );
                const icon = row.querySelector(
                    ".about-service-row__icon [data-lucide]"
                );

                row.href = service.url;

                if (image) {
                    image.src = service.image;
                    image.alt = service.imageAlt || service.name;
                }

                if (title) {
                    title.textContent = service.name;
                }

                if (description) {
                    description.textContent = service.description;
                }

                if (icon) {
                    icon.setAttribute(
                        "data-lucide",
                        toLucideName(service.icon)
                    );
                }
            });

        helpers.refreshIcons(document);
    }

    function updateConfiguredImages(config) {
        const images = config.images?.about;

        if (!images) {
            return;
        }

        const hero = document.querySelector(".about-hero");

        if (hero && images.hero) {
            hero.style.backgroundImage = `url("${images.hero}")`;
        }

        const mappings = [
            {
                selector: ".about-story__main img",
                source: images.storyMain
            },
            {
                selector: ".about-story__circle img",
                source: images.storyCircle
            },
            {
                selector: ".about-thinking__media img",
                source: images.realRoom
            },
            {
                selector: ".about-choices__circle--main img",
                source: images.guide
            },
            {
                selector: ".about-rooms__tile--studio img",
                source: images.mosaicStudio
            },
            {
                selector: ".about-rooms__tile--streaming img",
                source: images.mosaicStreaming
            },
            {
                selector: ".about-rooms__tile--living img",
                source: images.mosaicLiving
            },
            {
                selector: ".about-rooms__tile--office img",
                source: images.mosaicOffice
            },
            {
                selector: ".about-guide__image img",
                source: images.guide
            }
        ];

        mappings.forEach(function (mapping) {
            const image = document.querySelector(mapping.selector);

            if (image && mapping.source) {
                image.src = mapping.source;
            }
        });

        const partnershipImage = document.querySelector(
            ".about-partnerships__media img"
        );

        if (
            partnershipImage &&
            config.advertiseCollaborate?.image
        ) {
            partnershipImage.src =
                config.advertiseCollaborate.image;
        }
    }

    function initializeImageStates() {
        document
            .querySelectorAll(
                ".about-story img, .about-thinking img, .about-service-row img, .about-choices img, .about-rooms img, .about-guide img, .about-partnerships img"
            )
            .forEach(function (image) {
                function markLoaded() {
                    image.classList.add("is-loaded");
                }

                function markFailed() {
                    image.classList.add("has-error");
                }

                if (image.complete && image.naturalWidth > 0) {
                    markLoaded();
                } else if (image.complete) {
                    markFailed();
                } else {
                    image.addEventListener("load", markLoaded, {
                        once: true
                    });
                    image.addEventListener("error", markFailed, {
                        once: true
                    });
                }
            });
    }

    function initializeServiceRowKeyboard() {
        document
            .querySelectorAll(".about-service-row")
            .forEach(function (row) {
                row.addEventListener("keydown", function (event) {
                    if (
                        event.key !== "Enter" &&
                        event.key !== " "
                    ) {
                        return;
                    }

                    if (event.key === " ") {
                        event.preventDefault();
                        row.click();
                    }
                });
            });
    }

    function initializeMosaicFocus() {
        document
            .querySelectorAll(".about-rooms__tile")
            .forEach(function (tile) {
                const image = tile.querySelector("img");

                if (!image) {
                    return;
                }

                tile.addEventListener("mouseenter", function () {
                    tile.classList.add("is-active");
                });

                tile.addEventListener("mouseleave", function () {
                    tile.classList.remove("is-active");
                });
            });
    }

    function initializeIndependentDisclosure(config) {
        const disclaimer = document.querySelector(
            ".about-independent__disclaimer"
        );

        if (disclaimer && config.aggregatorDisclaimer) {
            disclaimer.textContent =
                config.aggregatorDisclaimer;
        }
    }

    async function initializeAboutPage(config, helpers) {
        updateConfiguredImages(config);
        updateServiceRows(config, helpers);
        initializeIndependentDisclosure(config);
        initializeServiceRowKeyboard();
        initializeMosaicFocus();
        initializeImageStates();
        helpers.refreshIcons(document);
        helpers.safeRefreshAos();
    }

    window.ECHOFORM_PAGE_MODULE = {
        init: initializeAboutPage
    };
})();