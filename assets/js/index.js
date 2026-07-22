(function () {
    "use strict";

    function findRoom(config, id) {
        if (!Array.isArray(config.roomSelector)) {
            return null;
        }

        return (
            config.roomSelector.find(function (room) {
                return room.id === id;
            }) || null
        );
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

    function renderPriorities(target, priorities, escapeHtml) {
        if (!target || !Array.isArray(priorities)) {
            return;
        }

        target.innerHTML = priorities
            .map(function (priority) {
                return `<li>${escapeHtml(priority)}</li>`;
            })
            .join("");
    }

    function initializeRoomSelector(config, helpers) {
        const selector = document.querySelector("[data-room-selector]");

        if (!selector || !Array.isArray(config.roomSelector)) {
            return;
        }

        const options = Array.from(
            selector.querySelectorAll("[data-room-option]")
        );
        const image = selector.querySelector("[data-room-image]");
        const label = selector.querySelector("[data-room-label]");
        const description = selector.querySelector("[data-room-description]");
        const priorities = selector.querySelector("[data-room-priorities]");
        const panel = selector.querySelector('[role="tabpanel"]');
        const hoverSupported = window.matchMedia(
            "(hover: hover) and (pointer: fine)"
        );
        let activeId =
            options.find(function (option) {
                return option.classList.contains("is-active");
            })?.dataset.roomOption || config.roomSelector[0]?.id;
        let updateToken = 0;

        if (panel) {
            panel.setAttribute("aria-live", "polite");
            panel.setAttribute("aria-atomic", "false");
        }

        function updateOptionStates(id, focusOption) {
            options.forEach(function (option) {
                const active = option.dataset.roomOption === id;

                option.classList.toggle("is-active", active);
                option.setAttribute("aria-selected", active ? "true" : "false");
                option.setAttribute("tabindex", active ? "0" : "-1");

                if (active && focusOption) {
                    option.focus();
                }
            });
        }

        async function activateRoom(id, focusOption) {
            const room = findRoom(config, id);

            if (!room || id === activeId) {
                updateOptionStates(id, focusOption);
                return;
            }

            activeId = id;
            updateOptionStates(id, focusOption);

            const token = ++updateToken;

            if (image) {
                image.classList.add("is-changing");
            }

            const loaded = await preloadImage(room.image);

            if (token !== updateToken) {
                return;
            }

            if (image && loaded) {
                image.src = room.image;
                image.alt = room.imageAlt || "";
            }

            if (label) {
                label.textContent = room.label;
            }

            if (description) {
                description.textContent = room.description;
            }

            renderPriorities(
                priorities,
                room.priorities,
                helpers.escapeHtml
            );

            window.requestAnimationFrame(function () {
                if (image) {
                    image.classList.remove("is-changing");
                }

                helpers.refreshIcons(selector);
                helpers.safeRefreshAos();
            });
        }

        options.forEach(function (option, index) {
            const roomId = option.dataset.roomOption;

            option.addEventListener("click", function () {
                activateRoom(roomId, false);
            });

            option.addEventListener("focus", function () {
                activateRoom(roomId, false);
            });

            option.addEventListener("mouseenter", function () {
                if (hoverSupported.matches) {
                    activateRoom(roomId, false);
                }
            });

            option.addEventListener("keydown", function (event) {
                let nextIndex = index;

                if (
                    event.key === "ArrowDown" ||
                    event.key === "ArrowRight"
                ) {
                    nextIndex = index < options.length - 1 ? index + 1 : 0;
                } else if (
                    event.key === "ArrowUp" ||
                    event.key === "ArrowLeft"
                ) {
                    nextIndex = index > 0 ? index - 1 : options.length - 1;
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
                    activateRoom(nextOption.dataset.roomOption, true);
                }
            });
        });

        const initialRoom = findRoom(config, activeId);

        if (initialRoom) {
            updateOptionStates(initialRoom.id, false);

            if (image) {
                image.src = initialRoom.image;
                image.alt = initialRoom.imageAlt || "";
            }

            if (label) {
                label.textContent = initialRoom.label;
            }

            if (description) {
                description.textContent = initialRoom.description;
            }

            renderPriorities(
                priorities,
                initialRoom.priorities,
                helpers.escapeHtml
            );
        }
    }

    function initializeReflectionDiagram(helpers) {
        const diagram = document.querySelector(
            "[data-reflection-diagram]"
        );

        if (!diagram) {
            return;
        }

        const paths = Array.from(
            diagram.querySelectorAll(".home-reflections__path")
        );

        paths.forEach(function (path) {
            const length =
                typeof path.getTotalLength === "function"
                    ? path.getTotalLength()
                    : 0;

            if (length > 0) {
                path.style.setProperty(
                    "--reflection-path-length",
                    String(length)
                );
            }
        });

        if (
            helpers.reducedMotion.matches ||
            typeof window.IntersectionObserver !== "function"
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

                    diagram.classList.add("is-visible");
                    observer.disconnect();
                });
            },
            {
                threshold: 0.28
            }
        );

        observer.observe(diagram);
    }

    function initializeHeroContent(config) {
        const hero = document.querySelector(".home-hero");

        if (!hero || !config.homeHero) {
            return;
        }

        const slides = Array.from(
            hero.querySelectorAll(".home-hero__slide")
        );

        slides.forEach(function (slide, index) {
            const data = config.homeHero.slides[index];

            if (!data) {
                return;
            }

            const image = slide.querySelector(".home-hero__background img");
            const primary = slide.querySelector(
                ".home-hero__actions .site-button"
            );
            const secondary = slide.querySelector(
                ".home-hero__text-link"
            );

            if (image) {
                image.src = data.image;
                image.alt = data.imageAlt || "";
            }

            if (primary) {
                primary.href = data.primaryUrl;
            }

            if (secondary) {
                secondary.href = data.secondaryUrl;
            }
        });

        const contourCards = Array.from(
            hero.querySelectorAll(".home-contour-card")
        );

        contourCards.forEach(function (card, index) {
            const data = config.homeHero.contourCards[index];

            if (data?.url) {
                card.href = data.url;
            }
        });
    }

    function initializeRoomRail(config) {
        const railLinks = Array.from(
            document.querySelectorAll(".home-room-rail__link")
        );

        railLinks.forEach(function (link, index) {
            const service = config.services[index];

            if (!service) {
                return;
            }

            link.href = service.url;

            const label = link.querySelector("span");

            if (label) {
                label.textContent = service.shortName;
            }
        });
    }

    function initializeMaterialContent(config) {
        const cards = Array.from(
            document.querySelectorAll(".home-material-card")
        );

        if (!Array.isArray(config.materials)) {
            return;
        }

        cards.forEach(function (card, index) {
            const material = config.materials[index];

            if (!material) {
                return;
            }

            const image = card.querySelector("img");
            const label = card.querySelector(".home-material-card__media span");
            const title = card.querySelector("h3");
            const text = card.querySelector("p");

            if (image) {
                image.src = material.image;
                image.alt = material.imageAlt || "";
            }

            if (label) {
                label.textContent = material.label;
            }

            if (title) {
                title.textContent = material.title;
            }

            if (text) {
                text.textContent = material.text;
            }
        });
    }

    function initializeTicker(config) {
        const ticker = document.querySelector(".site-ticker");

        if (
            !ticker ||
            !config.ticker ||
            !Array.isArray(config.ticker.items)
        ) {
            return;
        }

        const groups = Array.from(
            ticker.querySelectorAll(".site-ticker__group")
        );

        groups.forEach(function (group) {
            group.innerHTML = config.ticker.items
                .map(function (item) {
                    return `
            <span class="site-ticker__item">
              ${String(item)
                            .replaceAll("&", "&amp;")
                            .replaceAll("<", "&lt;")
                            .replaceAll(">", "&gt;")}
              <i data-lucide="${String(
                                config.ticker.separatorIcon || "audio-waveform"
                            )
                            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
                            .toLowerCase()}" aria-hidden="true"></i>
            </span>
          `;
                })
                .join("");
        });
    }

    function initializeImageLoadStates() {
        document
            .querySelectorAll(
                ".home-hero img, .home-problem img, .home-shape img, .home-guides img, .home-partnership img"
            )
            .forEach(function (image) {
                function markLoaded() {
                    image.classList.add("is-loaded");
                }

                if (image.complete) {
                    markLoaded();
                } else {
                    image.addEventListener("load", markLoaded, {
                        once: true
                    });
                }
            });
    }

    function initializeHomeAcousticSlider() {
        const section = document.querySelector("[data-home-acoustic-slider]");

        if (
            !section ||
            typeof window.Swiper !== "function" ||
            section.dataset.swiperReady === "true"
        ) {
            return;
        }

        const slider = section.querySelector(".home-acoustic-slider__swiper");
        const pagination = section.querySelector(".home-acoustic-slider__pagination");

        if (!slider || !pagination) {
            return;
        }

        section.dataset.swiperReady = "true";

        new Swiper(slider, {
            slidesPerView: 1,
            speed: 750,
            loop: true,
            grabCursor: true,
            watchOverflow: true,
            effect: "fade",
            fadeEffect: {
                crossFade: true
            },
            autoplay: {
                delay: 6000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            pagination: {
                el: pagination,
                clickable: true
            },
            keyboard: {
                enabled: true,
                onlyInViewport: true
            }
        });
    }

    async function initializeIndexPage(config, helpers) {
        initializeHeroContent(config);
        initializeRoomRail(config);
        initializeMaterialContent(config);
        initializeTicker(config);
        initializeRoomSelector(config, helpers);
        initializeReflectionDiagram(helpers);
        initializeImageLoadStates();
        helpers.refreshIcons(document);
        helpers.safeRefreshAos();
        initializeHomeAcousticSlider();
    }

    window.ECHOFORM_PAGE_MODULE = {
        init: initializeIndexPage
    };
})();