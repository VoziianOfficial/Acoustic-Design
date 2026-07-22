(function () {
    "use strict";

    const serviceDefaults = {
        "home-studio-acoustics": {
            name: "Home Studio Acoustics",
            eyebrow: "Listening and Recording Rooms",
            heroText:
                "Shape a clearer studio around speaker placement, listening position, reflections, desk interaction, rear-wall energy, and low-frequency behaviour.",
            heroImage: "assets/images/soundproofing-overview.webp",
            overviewImage: "assets/images/material-fabric-panel.webp",
            overviewImageAlt:
                "Home studio arranged around speakers, a centered desk, listening position, and acoustic treatment",
            icon: "audio-waveform",
            url: "home-studio-acoustics.html",
            description:
                "Plan speaker position, listening geometry, reflections, bass behaviour, desk interaction, and treatment priorities."
        },
        "streaming-room-setup": {
            name: "Streaming Room Setup",
            eyebrow: "Voice, Video and Live Content",
            heroText:
                "Shape a clearer voice environment around microphone position, desk reflections, wall and ceiling surfaces, camera framing, equipment noise, and shared-room use.",
            heroImage: "assets/images/about-hero.webp",
            overviewImage:
                "assets/images/acoustic-plan-hero.webp",
            overviewImageAlt:
                "Streaming room arranged around a microphone, workstation, camera, lighting, and acoustic treatment",
            icon: "radio",
            url: "streaming-room-setup.html",
            description:
                "Plan microphone position, speech reflections, desk surfaces, equipment noise, and camera-ready treatment."
        },
        "soundproofing-guidance": {
            name: "Soundproofing Guidance",
            eyebrow: "Sound Transmission and Isolation",
            heroText:
                "Understand how airborne sound, impact noise, gaps, doors, windows, mass, decoupling, ventilation, and flanking paths influence realistic sound-isolation decisions.",
            heroImage:
                "assets/images/contact-hero.webp",
            overviewImage:
                "assets/images/soundproofing-overview.webp",
            overviewImageAlt:
                "Architectural room detail showing layered walls, ceiling junctions, doors, windows, and possible sound-transmission routes",
            icon: "layers",
            url: "soundproofing-guidance.html",
            description:
                "Understand airborne sound, impact noise, openings, mass, decoupling, services, and connected transmission paths."
        },
        "acoustic-panels": {
            name: "Acoustic Panel Planning",
            eyebrow:
                "Placement, Depth and Interior Integration",
            heroText:
                "Plan panel purpose, thickness, air gaps, wall and ceiling zones, finishes, mounting, bass control, and visual integration around the actual room.",
            heroImage: "assets/images/home-hero-studio.webp",
            overviewImage:
                "assets/images/home-problem-detail.webp",
            overviewImageAlt:
                "Modern interior with fabric acoustic panels integrated across walls and ceiling zones",
            icon: "layout-panel-top",
            url: "acoustic-panels.html",
            description:
                "Compare panel purpose, depth, placement, air gaps, mounting, finishes, and low-frequency treatment."
        }
    };

    const zoneDefaults = {
        "home-studio-acoustics": {
            "listening-position": {
                title: "Listening Position",
                description:
                    "The listening position influences symmetry, distance from boundaries, speaker angle, stereo image, desk relationship, and where low-frequency peaks or nulls may be experienced.",
                priorities: [
                    "Begin with a symmetrical left-to-right relationship where the room allows it.",
                    "Avoid assuming the exact centre of the room is automatically the best listening location.",
                    "Adjust the listener and speaker positions before relying on treatment alone."
                ]
            },
            "first-reflections": {
                title: "First Reflections",
                description:
                    "Nearby side walls and the ceiling can return sound shortly after the direct speaker signal, influencing imaging, clarity, tonal balance, and spatial judgement.",
                priorities: [
                    "Locate reflection zones from the actual speakers and listening position.",
                    "Review both side walls and the ceiling rather than treating only one visible surface.",
                    "Compare panel size, depth, placement height, and available air gap."
                ]
            },
            "rear-wall": {
                title: "Rear-Wall Energy",
                description:
                    "The wall behind the listener can create strong returns, especially in compact studios where the listening position is close to the rear boundary.",
                priorities: [
                    "Review the distance between the listener and rear wall.",
                    "Consider deeper absorption where the available room depth allows it.",
                    "Coordinate treatment with storage, doors, windows, and circulation."
                ]
            },
            "bass-control": {
                title: "Bass Control",
                description:
                    "Low-frequency behaviour varies strongly across a small room and usually requires more treatment depth than thin decorative wall products can provide.",
                priorities: [
                    "Compare several speaker and listening positions before finalising treatment.",
                    "Use corners, rear boundaries, front boundaries, or ceiling zones strategically.",
                    "Review tested range, complete depth, and realistic room limitations."
                ]
            },
            "desk-interaction": {
                title: "Desk Interaction",
                description:
                    "The desk, screens, racks, stands, and nearby equipment create reflective surfaces and can obstruct or alter the speaker-to-listener relationship.",
                priorities: [
                    "Review desk height, depth, material, and angle.",
                    "Keep the direct speaker path clear of unnecessary equipment.",
                    "Coordinate screen position, speaker stands, and working comfort."
                ]
            }
        },
        "streaming-room-setup": {
            "microphone-position": {
                title: "Microphone Position",
                description:
                    "Microphone position influences the balance between direct voice, room reflections, keyboard noise, computer noise, desk interaction, and visual framing.",
                priorities: [
                    "Keep the microphone close enough to support a healthy direct-to-room balance.",
                    "Orient the microphone according to its polar pattern and nearby noise sources.",
                    "Review boom-arm vibration, keyboard noise, screen position, and camera obstruction."
                ]
            },
            "voice-reflections": {
                title: "Voice Reflections",
                description:
                    "Walls, ceiling, floor, windows, screens, and furniture can return the voice to the microphone shortly after the direct sound.",
                priorities: [
                    "Review the surfaces behind, beside, and above the speaking position.",
                    "Place treatment according to the microphone orientation rather than camera appearance alone.",
                    "Use movable treatment where the speaking position or room layout changes."
                ]
            },
            "desk-equipment": {
                title: "Desk and Equipment",
                description:
                    "The desk, screens, keyboard, control surfaces, lights, computer, and accessories create nearby reflection, vibration, and noise sources.",
                priorities: [
                    "Review microphone height and angle relative to the desk surface.",
                    "Reduce avoidable reflective clutter close to the microphone.",
                    "Move fans and mechanical equipment away from the capture zone where practical."
                ]
            },
            "camera-background": {
                title: "Camera Background",
                description:
                    "Visible treatment can support both acoustic control and visual identity when its location, scale, material, lighting, and camera crop are planned together.",
                priorities: [
                    "Coordinate panel rhythm, colour, texture, and depth with the camera frame.",
                    "Keep strong microphone reflection paths more important than decorative symmetry.",
                    "Avoid bright reflective finishes close to the voice and microphone zone."
                ]
            },
            "noise-control": {
                title: "Noise Control",
                description:
                    "Computer fans, air systems, keyboards, chairs, doors, windows, household activity, and street sound may become more noticeable as room reflections are reduced.",
                priorities: [
                    "Identify constant, intermittent, mechanical, and external noise separately.",
                    "Reduce vibration and move noisy equipment where practical.",
                    "Keep internal noise control separate from structural soundproofing expectations."
                ]
            }
        },
        "soundproofing-guidance": {
            "airborne-sound": {
                title: "Airborne Sound",
                description:
                    "Speech, music, television, and other sounds begin in the air, excite room boundaries, and may be re-radiated into an adjacent space.",
                priorities: [
                    "Identify the source level, frequency content, duration, and time of day.",
                    "Review the complete wall, floor, ceiling, door, window, and junction relationship.",
                    "Consider mass, airtightness, cavities, structural connections, and flanking transmission together."
                ]
            },
            "impact-noise": {
                title: "Impact Noise",
                description:
                    "Footsteps, dropped objects, moving furniture, doors, equipment, and plumbing can excite building surfaces directly and travel through connected structure.",
                priorities: [
                    "Identify the physical impact source and the surface it excites.",
                    "Consider source-side control, resilient layers, and structural separation.",
                    "Review load, floor height, finishes, moisture, and building requirements."
                ]
            },
            "openings-gaps": {
                title: "Openings and Gaps",
                description:
                    "Doors, windows, thresholds, frames, sockets, pipes, cable routes, and junctions can allow sound to bypass heavier room boundaries.",
                priorities: [
                    "Inspect perimeter seals, frames, thresholds, glazing, and penetrations.",
                    "Use materials compatible with movement, moisture, fire, ventilation, and access.",
                    "Do not block required exits, ventilation routes, or regulated services."
                ]
            },
            "flanking-paths": {
                title: "Flanking Paths",
                description:
                    "Sound can travel around the main separating surface through continuous floors, ceilings, side walls, framing, cavities, ducts, and other connected elements.",
                priorities: [
                    "Trace how the source and receiving rooms are structurally connected.",
                    "Review junctions and adjacent surfaces instead of one wall in isolation.",
                    "Expect limited improvement if the dominant indirect path remains unchanged."
                ]
            },
            "building-services": {
                title: "Building Services",
                description:
                    "Ventilation, ducts, sockets, recessed fixtures, pipes, cable penetrations, and mechanical equipment may create sound routes and operational constraints.",
                priorities: [
                    "Maintain safe ventilation, cooling, access, and equipment operation.",
                    "Coordinate fire, electrical, moisture, and maintenance requirements.",
                    "Seek qualified input before altering regulated building services."
                ]
            }
        },
        "acoustic-panels": {
            "side-wall-panels": {
                title: "Side-Wall Panels",
                description:
                    "Side-wall panels may help manage early reflections between a source and listener or microphone, but their useful position depends on the actual geometry and intended room use.",
                priorities: [
                    "Locate the zone from the real source and listening or speaking position.",
                    "Consider panel size, depth, height, spacing, and left-to-right balance.",
                    "Review doors, windows, furniture, lighting, and mounting restrictions before final placement."
                ]
            },
            "rear-wall-treatment": {
                title: "Rear-Wall Treatment",
                description:
                    "Rear-wall treatment may reduce strong returns behind a listener, speaker, or microphone, especially where the receiving position is close to the boundary.",
                priorities: [
                    "Review the distance between the active position and rear wall.",
                    "Consider deeper treatment when low-frequency control is part of the goal.",
                    "Coordinate panels with storage, doors, artwork, furniture, and circulation."
                ]
            },
            "ceiling-clouds": {
                title: "Ceiling Clouds",
                description:
                    "Suspended or surface-mounted ceiling treatment may address strong overhead reflections while preserving valuable wall area.",
                priorities: [
                    "Locate the cloud from the actual source and listener or microphone relationship.",
                    "Check panel weight, substrate, fixings, suspension, and safe clearance.",
                    "Coordinate lighting, detectors, sprinklers, ventilation, and electrical services."
                ]
            },
            "bass-treatment": {
                title: "Bass Treatment",
                description:
                    "Low-frequency treatment normally requires greater depth and volume than thin decorative panels and may use corners, boundaries, ceilings, or purpose-built systems.",
                priorities: [
                    "Review room dimensions, source position, listening area, and available treatment volume.",
                    "Compare tested frequency range rather than relying on product labels alone.",
                    "Keep expectations realistic when available depth is limited."
                ]
            },
            "feature-wall": {
                title: "Feature Wall",
                description:
                    "A feature wall can combine acoustic treatment with colour, timber, fabric, lighting, pattern, and architectural rhythm when the complete assembly supports the room goal.",
                priorities: [
                    "Connect the feature-wall location to an actual reflection or room-control priority.",
                    "Review the backing, cavity, core, slats, perforations, and mounting as one system.",
                    "Coordinate module joints, sockets, doors, lighting, furniture, and maintenance."
                ]
            }
        }
    };

    function normalizeSlug(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .split("?")[0]
            .split("#")[0]
            .replace(/^.*\//, "")
            .replace(/\.html?$/, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function toLucideName(value) {
        return String(value || "audio-waveform")
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .replace(/[\s_]+/g, "-")
            .toLowerCase();
    }

    function getCurrentSlug() {
        const bodySlug =
            document.body.dataset.serviceSlug;

        if (bodySlug) {
            return normalizeSlug(bodySlug);
        }

        return normalizeSlug(
            window.location.pathname
        );
    }

    function findService(config, slug) {
        if (!Array.isArray(config.services)) {
            return null;
        }

        const normalizedSlug =
            normalizeSlug(slug);

        return (
            config.services.find(function (service) {
                const candidates = [
                    service.id,
                    service.slug,
                    service.key,
                    service.url,
                    service.href
                ];

                return candidates.some(
                    function (candidate) {
                        return (
                            normalizeSlug(candidate) ===
                            normalizedSlug
                        );
                    }
                );
            }) || null
        );
    }

    function getImageSet(config, slug) {
        const detailImages =
            config.images?.serviceDetails;
        const serviceImages =
            config.images?.services;

        if (
            detailImages &&
            typeof detailImages === "object"
        ) {
            const direct =
                detailImages[slug];

            if (direct) {
                return direct;
            }
        }

        if (
            serviceImages &&
            typeof serviceImages === "object" &&
            !Array.isArray(serviceImages)
        ) {
            const direct =
                serviceImages[slug];

            if (direct) {
                return direct;
            }
        }

        return {};
    }

    function getServiceData(config, slug) {
        const fallback =
            serviceDefaults[slug] || {};
        const service =
            findService(config, slug) || {};
        const images =
            getImageSet(config, slug);

        return {
            slug,
            name:
                service.name ||
                service.title ||
                fallback.name ||
                "Acoustic Solution",
            eyebrow:
                service.detailEyebrow ||
                service.eyebrow ||
                fallback.eyebrow ||
                "Acoustic Planning",
            heroText:
                service.heroText ||
                service.detailDescription ||
                service.description ||
                fallback.heroText ||
                "",
            heroImage:
                service.heroImage ||
                service.detailHeroImage ||
                images.hero ||
                fallback.heroImage ||
                "",
            overviewImage:
                service.overviewImage ||
                service.detailImage ||
                images.overview ||
                service.image ||
                fallback.overviewImage ||
                "",
            overviewImageAlt:
                service.overviewImageAlt ||
                service.detailImageAlt ||
                images.overviewAlt ||
                service.imageAlt ||
                fallback.overviewImageAlt ||
                service.name ||
                "",
            icon:
                service.icon ||
                fallback.icon ||
                "audio-waveform",
            url:
                service.url ||
                service.href ||
                fallback.url ||
                `${slug}.html`,
            description:
                service.shortDescription ||
                service.description ||
                fallback.description ||
                ""
        };
    }

    function findZoneOverride(
        service,
        zoneId
    ) {
        const sources = [
            service?.zones,
            service?.detailZones,
            service?.roomZones,
            service?.interactiveZones
        ];

        for (const source of sources) {
            if (!source) {
                continue;
            }

            if (Array.isArray(source)) {
                const match = source.find(
                    function (zone) {
                        return (
                            normalizeSlug(
                                zone.id ||
                                zone.slug ||
                                zone.key
                            ) === zoneId
                        );
                    }
                );

                if (match) {
                    return match;
                }
            } else if (
                typeof source === "object"
            ) {
                if (source[zoneId]) {
                    return source[zoneId];
                }

                const key = Object.keys(
                    source
                ).find(function (item) {
                    return (
                        normalizeSlug(item) ===
                        zoneId
                    );
                });

                if (key) {
                    return source[key];
                }
            }
        }

        return null;
    }

    function getZoneData(
        config,
        serviceSlug,
        zoneId
    ) {
        const service =
            findService(config, serviceSlug);
        const fallback =
            zoneDefaults[serviceSlug]?.[
            zoneId
            ] || {};
        const override =
            findZoneOverride(
                service,
                zoneId
            ) || {};

        const priorities =
            override.priorities ||
            override.points ||
            override.items ||
            fallback.priorities ||
            [];

        return {
            id: zoneId,
            title:
                override.title ||
                override.name ||
                fallback.title ||
                "Room Priority",
            description:
                override.description ||
                override.text ||
                fallback.description ||
                "",
            priorities: Array.isArray(
                priorities
            )
                ? priorities
                : []
        };
    }

    function updateHero(
        serviceData
    ) {
        const hero = document.querySelector(
            "[data-service-hero]"
        );
        const title = document.querySelector(
            "[data-service-title]"
        );
        const eyebrow =
            document.querySelector(
                "[data-service-eyebrow]"
            );
        const text = document.querySelector(
            "[data-service-hero-text]"
        );

        if (
            hero &&
            serviceData.heroImage
        ) {
            hero.style.backgroundImage =
                `url("${serviceData.heroImage}")`;
        }

        if (title) {
            title.textContent =
                serviceData.name;
        }

        if (eyebrow) {
            eyebrow.textContent =
                serviceData.eyebrow;
        }

        if (text) {
            text.textContent =
                serviceData.heroText;
        }

        document
            .querySelectorAll(
                "[data-service-name]"
            )
            .forEach(function (element) {
                element.textContent =
                    serviceData.name;
            });
    }

    function updateOverview(
        serviceData
    ) {
        const image = document.querySelector(
            "[data-service-overview-image]"
        );

        if (
            !image ||
            !serviceData.overviewImage
        ) {
            return;
        }

        image.src =
            serviceData.overviewImage;
        image.alt =
            serviceData.overviewImageAlt;
    }

    function updateRelatedCards(
        config
    ) {
        document
            .querySelectorAll(
                "[data-related-service]"
            )
            .forEach(function (card) {
                const slug = normalizeSlug(
                    card.dataset.relatedService
                );
                const data =
                    getServiceData(config, slug);
                const image =
                    card.querySelector(
                        ".service-related__media img"
                    );
                const title =
                    card.querySelector(
                        ".service-related__content h3"
                    );
                const description =
                    card.querySelector(
                        ".service-related__content p"
                    );
                const icon =
                    card.querySelector(
                        ".service-related__icon [data-lucide]"
                    );

                if (data.url) {
                    card.href = data.url;
                }

                if (
                    image &&
                    data.overviewImage
                ) {
                    image.src =
                        data.overviewImage;
                    image.alt =
                        data.overviewImageAlt;
                }

                if (title) {
                    title.textContent =
                        data.name;
                }

                if (
                    description &&
                    data.description
                ) {
                    description.textContent =
                        data.description;
                }

                if (icon) {
                    icon.setAttribute(
                        "data-lucide",
                        toLucideName(data.icon)
                    );
                }
            });
    }

    function renderPriorities(
        target,
        items
    ) {
        if (!target) {
            return;
        }

        const fragment =
            document.createDocumentFragment();

        items.forEach(function (item) {
            const value =
                typeof item === "string"
                    ? item
                    : item?.text ||
                    item?.title ||
                    item?.label ||
                    "";

            if (!value) {
                return;
            }

            const listItem =
                document.createElement("li");

            listItem.textContent = value;
            fragment.appendChild(listItem);
        });

        target.replaceChildren(fragment);
    }

    function initializeZoneSelector(
        config,
        helpers,
        serviceSlug
    ) {
        const selector =
            document.querySelector(
                "[data-service-zones]"
            );

        if (!selector) {
            return;
        }

        const tabs = Array.from(
            selector.querySelectorAll(
                "[data-zone-tab]"
            )
        );
        const markers = Array.from(
            selector.querySelectorAll(
                "[data-zone-option]"
            )
        );
        const panel =
            selector.querySelector(
                '[role="tabpanel"]'
            );
        const title =
            selector.querySelector(
                "[data-zone-title]"
            );
        const description =
            selector.querySelector(
                "[data-zone-description]"
            );
        const priorities =
            selector.querySelector(
                "[data-zone-priorities]"
            );
        const hoverQuery =
            window.matchMedia(
                "(hover: hover) and (pointer: fine)"
            );

        if (
            tabs.length === 0 ||
            !panel
        ) {
            return;
        }

        const panelId =
            panel.id ||
            `${serviceSlug}-zone-panel`;

        panel.id = panelId;

        let activeId =
            normalizeSlug(
                tabs.find(function (tab) {
                    return (
                        tab.classList.contains(
                            "is-active"
                        ) ||
                        tab.getAttribute(
                            "aria-selected"
                        ) === "true"
                    );
                })?.dataset.zoneTab ||
                tabs[0]?.dataset.zoneTab
            );

        function updateControlStates(
            zoneId,
            focusTab
        ) {
            tabs.forEach(
                function (tab, index) {
                    const tabId =
                        tab.id ||
                        `${serviceSlug}-zone-tab-${index + 1
                        }`;
                    const active =
                        normalizeSlug(
                            tab.dataset.zoneTab
                        ) === zoneId;

                    tab.id = tabId;
                    tab.setAttribute(
                        "aria-controls",
                        panelId
                    );
                    tab.setAttribute(
                        "aria-selected",
                        active ? "true" : "false"
                    );
                    tab.setAttribute(
                        "tabindex",
                        active ? "0" : "-1"
                    );
                    tab.classList.toggle(
                        "is-active",
                        active
                    );

                    if (active) {
                        panel.setAttribute(
                            "aria-labelledby",
                            tabId
                        );

                        if (focusTab) {
                            tab.focus();
                        }
                    }
                }
            );

            markers.forEach(
                function (marker) {
                    const active =
                        normalizeSlug(
                            marker.dataset.zoneOption
                        ) === zoneId;

                    marker.setAttribute(
                        "aria-controls",
                        panelId
                    );
                    marker.setAttribute(
                        "aria-pressed",
                        active ? "true" : "false"
                    );
                    marker.classList.toggle(
                        "is-active",
                        active
                    );
                }
            );
        }

        function renderZone(zoneId) {
            const zone = getZoneData(
                config,
                serviceSlug,
                zoneId
            );

            if (title) {
                title.textContent =
                    zone.title;
            }

            if (description) {
                description.textContent =
                    zone.description;
            }

            renderPriorities(
                priorities,
                zone.priorities
            );
        }

        function activateZone(
            value,
            options
        ) {
            const zoneId =
                normalizeSlug(value);

            if (!zoneId) {
                return;
            }

            const changed =
                activeId !== zoneId;

            activeId = zoneId;
            updateControlStates(
                zoneId,
                Boolean(options?.focusTab)
            );

            if (!changed) {
                renderZone(zoneId);
                return;
            }

            panel.classList.add(
                "is-changing"
            );

            window.requestAnimationFrame(
                function () {
                    renderZone(zoneId);

                    window.requestAnimationFrame(
                        function () {
                            panel.classList.remove(
                                "is-changing"
                            );
                            helpers.safeRefreshAos();
                        }
                    );
                }
            );
        }

        tabs.forEach(
            function (tab, index) {
                const zoneId =
                    normalizeSlug(
                        tab.dataset.zoneTab
                    );

                tab.addEventListener(
                    "click",
                    function () {
                        activateZone(zoneId);
                    }
                );

                tab.addEventListener(
                    "focus",
                    function () {
                        activateZone(zoneId);
                    }
                );

                tab.addEventListener(
                    "keydown",
                    function (event) {
                        let nextIndex = index;

                        if (
                            event.key ===
                            "ArrowRight" ||
                            event.key === "ArrowDown"
                        ) {
                            nextIndex =
                                index <
                                    tabs.length - 1
                                    ? index + 1
                                    : 0;
                        } else if (
                            event.key ===
                            "ArrowLeft" ||
                            event.key === "ArrowUp"
                        ) {
                            nextIndex =
                                index > 0
                                    ? index - 1
                                    : tabs.length - 1;
                        } else if (
                            event.key === "Home"
                        ) {
                            nextIndex = 0;
                        } else if (
                            event.key === "End"
                        ) {
                            nextIndex =
                                tabs.length - 1;
                        } else {
                            return;
                        }

                        event.preventDefault();

                        const nextTab =
                            tabs[nextIndex];

                        if (nextTab) {
                            activateZone(
                                nextTab.dataset.zoneTab,
                                {
                                    focusTab: true
                                }
                            );
                        }
                    }
                );
            }
        );

        markers.forEach(
            function (marker) {
                const zoneId =
                    normalizeSlug(
                        marker.dataset.zoneOption
                    );

                marker.addEventListener(
                    "click",
                    function () {
                        activateZone(zoneId);
                    }
                );

                marker.addEventListener(
                    "mouseenter",
                    function () {
                        if (
                            hoverQuery.matches
                        ) {
                            activateZone(zoneId);
                        }
                    }
                );

                marker.addEventListener(
                    "focus",
                    function () {
                        activateZone(zoneId);
                    }
                );
            }
        );

        panel.setAttribute(
            "aria-live",
            "polite"
        );
        panel.setAttribute(
            "aria-atomic",
            "false"
        );

        updateControlStates(
            activeId,
            false
        );
        renderZone(activeId);
    }

    function initializeSmoothAnchors(
        helpers
    ) {
        document
            .querySelectorAll(
                'a[href^="#"]'
            )
            .forEach(function (link) {
                const href =
                    link.getAttribute("href");

                if (
                    !href ||
                    href === "#"
                ) {
                    return;
                }

                link.addEventListener(
                    "click",
                    function (event) {
                        const target =
                            document.querySelector(
                                href
                            );

                        if (!target) {
                            return;
                        }

                        event.preventDefault();

                        target.scrollIntoView({
                            behavior:
                                helpers.reducedMotion
                                    .matches
                                    ? "auto"
                                    : "smooth",
                            block: "start"
                        });

                        window.history.replaceState(
                            null,
                            "",
                            href
                        );
                    }
                );
            });
    }

    function initializeSliderKeyboard() {
        document
            .querySelectorAll(
                "[data-swiper]"
            )
            .forEach(function (slider) {
                if (
                    !slider.hasAttribute(
                        "tabindex"
                    )
                ) {
                    slider.setAttribute(
                        "tabindex",
                        "0"
                    );
                }

                slider.addEventListener(
                    "keydown",
                    function (event) {
                        if (
                            event.key !==
                            "ArrowLeft" &&
                            event.key !==
                            "ArrowRight"
                        ) {
                            return;
                        }

                        const swiper =
                            slider.swiper;

                        if (!swiper) {
                            return;
                        }

                        event.preventDefault();

                        if (
                            event.key ===
                            "ArrowLeft"
                        ) {
                            swiper.slidePrev();
                        } else {
                            swiper.slideNext();
                        }
                    }
                );
            });
    }

    function initializeImageStates() {
        document
            .querySelectorAll(
                ".service-overview img, .service-priority-row img, .service-layout-card img, .service-faq img, .service-related img"
            )
            .forEach(function (image) {
                function markLoaded() {
                    image.classList.add(
                        "is-loaded"
                    );
                    image.classList.remove(
                        "has-error"
                    );
                }

                function markFailed() {
                    image.classList.add(
                        "has-error"
                    );
                    image.classList.remove(
                        "is-loaded"
                    );
                }

                if (
                    image.complete &&
                    image.naturalWidth > 0
                ) {
                    markLoaded();
                } else if (
                    image.complete
                ) {
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

    function initializeDiagramObserver(
        helpers
    ) {
        const diagrams =
            document.querySelectorAll(
                ".service-zones__diagram, .service-reflections__diagram"
            );

        if (
            diagrams.length === 0
        ) {
            return;
        }

        if (
            helpers.reducedMotion.matches ||
            typeof window
                .IntersectionObserver !==
            "function"
        ) {
            diagrams.forEach(
                function (diagram) {
                    diagram.classList.add(
                        "is-visible"
                    );
                }
            );
            return;
        }

        const observer =
            new IntersectionObserver(
                function (entries) {
                    entries.forEach(
                        function (entry) {
                            if (
                                !entry.isIntersecting
                            ) {
                                return;
                            }

                            entry.target.classList.add(
                                "is-visible"
                            );
                            observer.unobserve(
                                entry.target
                            );
                        }
                    );
                },
                {
                    threshold: 0.2
                }
            );

        diagrams.forEach(
            function (diagram) {
                observer.observe(diagram);
            }
        );
    }

    function initializeRelatedCardKeyboard() {
        document
            .querySelectorAll(
                ".service-related__card"
            )
            .forEach(function (card) {
                card.addEventListener(
                    "keydown",
                    function (event) {
                        if (
                            event.key !== " "
                        ) {
                            return;
                        }

                        event.preventDefault();
                        card.click();
                    }
                );
            });
    }

    function updateDocumentMetadata(
        serviceData
    ) {
        const titleSuffix = " | Echoform";
        const expectedTitle =
            `${serviceData.name}${titleSuffix}`;

        if (
            serviceData.name &&
            document.title !== expectedTitle
        ) {
            document.title =
                expectedTitle;
        }

        const description =
            document.querySelector(
                'meta[name="description"]'
            );

        if (
            description &&
            serviceData.description
        ) {
            description.setAttribute(
                "content",
                serviceData.description
            );
        }
    }

    async function initializeServiceDetailPage(
        config,
        helpers
    ) {
        const serviceSlug =
            getCurrentSlug();
        const serviceData =
            getServiceData(
                config,
                serviceSlug
            );

        updateHero(serviceData);
        updateOverview(serviceData);
        updateRelatedCards(config);
        updateDocumentMetadata(
            serviceData
        );
        initializeZoneSelector(
            config,
            helpers,
            serviceSlug
        );
        initializeSmoothAnchors(
            helpers
        );
        initializeImageStates();
        initializeDiagramObserver(
            helpers
        );
        initializeRelatedCardKeyboard();
        helpers.refreshIcons(document);
        helpers.initializeSwipers(
            document
        );
        initializeSliderKeyboard();
        helpers.safeRefreshAos();
    }

    window.ECHOFORM_PAGE_MODULE = {
        init: initializeServiceDetailPage
    };
})();