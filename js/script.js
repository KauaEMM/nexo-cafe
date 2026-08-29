/* =========================================================
   NEXO CAFÉ — INTERAÇÕES
   VERSION 2.0 — STABLE / RESPONSIVE / ACCESSIBLE
   ========================================================= */

"use strict";

/*
 * =========================================================
 * PRINCÍPIOS
 * =========================================================
 *
 * ✓ Compatível com GitHub Pages
 * ✓ Compatível com navegadores modernos
 * ✓ Mobile-first
 * ✓ Desktop + touch
 * ✓ Respeita prefers-reduced-motion
 * ✓ Não depende de bibliotecas externas
 * ✓ Evita loops de scroll desnecessários
 * ✓ Evita conflitos entre animações
 * ✓ IntersectionObserver com fallback
 * ✓ Menu mobile acessível
 * ✓ Filtros do cardápio
 * ✓ Navegação suave
 * ✓ Parallax controlado
 * ✓ Tilt somente quando realmente suportado
 * ✓ Magnetic buttons somente desktop
 * ✓ Status de funcionamento
 * ✓ Lazy loading automático de imagens
 * ✓ Tratamento de links
 * ✓ Tratamento de Service Worker
 * ✓ Tratamento de erros
 * ✓ Proteção contra elementos inexistentes
 *
 * =========================================================
 */


/* =========================================================
   CONFIGURAÇÃO GLOBAL
   ========================================================= */

const NEXO = Object.freeze({

    /*
     * Horário de funcionamento.
     *
     * 0 = Domingo
     * 1 = Segunda
     * ...
     * 6 = Sábado
     */

    opening: Object.freeze({
        days: [1, 2, 3, 4, 5, 6],
        openHour: 8,
        openMinute: 0,
        closeHour: 20,
        closeMinute: 0
    }),

    animation: Object.freeze({
        revealThreshold: 0.12,
        revealRootMargin: "0px 0px -50px 0px",
        filterDelay: 45,
        cardDelay: 70
    }),

    parallax: Object.freeze({
        maxScroll: 900,
        strength: 0.055,
        scale: 1.05
    }),

    magnetic: Object.freeze({
        buttonStrength: 0.08,
        markStrength: 0.12
    }),

    tilt: Object.freeze({
        maxRotation: 2.2,
        perspective: 900
    })

});


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

/**
 * Seleciona um único elemento.
 */
function $(selector, parent = document) {

    return parent.querySelector(selector);

}


/**
 * Seleciona vários elementos e transforma em Array.
 */
function $$(selector, parent = document) {

    return Array.from(
        parent.querySelectorAll(selector)
    );

}


/**
 * Verifica se um elemento existe.
 */
function exists(element) {

    return element instanceof Element;

}


/**
 * Verifica se uma função está disponível.
 */
function isFunction(value) {

    return typeof value === "function";

}


/**
 * Limita um número entre mínimo e máximo.
 */
function clamp(value, min, max) {

    return Math.min(
        Math.max(value, min),
        max
    );

}


/**
 * Executa callback no próximo frame.
 */
function nextFrame(callback) {

    if (isFunction(window.requestAnimationFrame)) {

        window.requestAnimationFrame(callback);

    } else {

        window.setTimeout(callback, 16);

    }

}


/**
 * Detecta preferência de redução de movimento.
 */
const reducedMotionQuery =
    window.matchMedia
        ? window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        )
        : null;


/**
 * Detecta pointer preciso.
 */
const finePointerQuery =
    window.matchMedia
        ? window.matchMedia(
            "(pointer: fine)"
        )
        : null;


/**
 * Detecta se o usuário possui pointer preciso.
 */
function hasFinePointer() {

    return Boolean(
        finePointerQuery &&
        finePointerQuery.matches
    );

}


/**
 * Detecta se animações devem ser reduzidas.
 */
function prefersReducedMotion() {

    return Boolean(
        reducedMotionQuery &&
        reducedMotionQuery.matches
    );

}


/**
 * Verifica suporte a touch.
 */
function isTouchDevice() {

    return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
    );

}


/**
 * Log seguro.
 */
function debugLog(...messages) {

    if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
    ) {

        console.log(
            "[Nexo Café]",
            ...messages
        );

    }

}


/* =========================================================
   ELEMENTOS PRINCIPAIS
   ========================================================= */

const header =
    $(".site-header");

const navbar =
    $(".navbar");

const menuButton =
    $(".menu-button");

const navLinks =
    $(".nav-links");

const hero =
    $(".hero");

const heroBackground =
    $(".hero-background");

const filterButtons =
    $$(".filter-button");

const productCards =
    $$(".product-card");


/* =========================================================
   ESTADO GLOBAL
   ========================================================= */

const state = {

    menuOpen: false,

    activeCategory: "todos",

    headerTicking: false,

    heroTicking: false,

    revealInitialized: false,

    pageLoaded: false,

    heroParallaxEnabled: true,

    pointerEffectsEnabled:
        hasFinePointer() &&
        !isTouchDevice() &&
        !prefersReducedMotion(),

    reducedMotion:
        prefersReducedMotion(),

    lastScrollY:
        window.scrollY || 0,

    isPageHidden:
        document.visibilityState === "hidden"

};


/* =========================================================
   BODY / HTML BASE
   ========================================================= */

document.documentElement.classList.add(
    "js-enabled"
);


/* =========================================================
   HEADER — SCROLL
   ========================================================= */

function updateHeader() {

    if (!exists(header)) {

        state.headerTicking = false;

        return;

    }

    const scrollY =
        window.scrollY || 0;

    const shouldScroll =
        scrollY > 40;

    header.classList.toggle(
        "scrolled",
        shouldScroll
    );

    /*
     * Pequena classe adicional para situações
     * em que o usuário está no topo.
     */

    header.classList.toggle(
        "at-top",
        scrollY <= 40
    );

    state.lastScrollY =
        scrollY;

    state.headerTicking =
        false;

}


/**
 * Agenda atualização do header.
 */
function requestHeaderUpdate() {

    if (state.headerTicking) {

        return;

    }

    state.headerTicking =
        true;

    nextFrame(updateHeader);

}


/* =========================================================
   HERO PARALLAX
   ========================================================= */

function updateHeroParallax() {

    state.heroTicking =
        false;

    if (
        !exists(heroBackground) ||
        !state.heroParallaxEnabled ||
        state.reducedMotion ||
        state.isPageHidden
    ) {

        return;

    }

    const scrollY =
        clamp(
            window.scrollY || 0,
            0,
            NEXO.parallax.maxScroll
        );

    const translateY =
        scrollY *
        NEXO.parallax.strength;

    /*
     * Usa variável CSS em vez de sobrescrever
     * diretamente toda a transformação.
     *
     * Isso deixa a implementação mais previsível.
     */

    heroBackground.style.setProperty(
        "--hero-scroll-y",
        `${translateY}px`
    );

}


function requestHeroParallax() {

    if (
        state.heroTicking ||
        state.reducedMotion ||
        !state.heroParallaxEnabled
    ) {

        return;

    }

    state.heroTicking =
        true;

    nextFrame(
        updateHeroParallax
    );

}


/* =========================================================
   EVENTO DE SCROLL
   ========================================================= */

window.addEventListener(
    "scroll",
    () => {

        requestHeaderUpdate();

        requestHeroParallax();

    },
    {
        passive: true
    }
);


/* =========================================================
   MENU MOBILE
   ========================================================= */

function setMenuAccessibility(isOpen) {

    if (!exists(menuButton)) {

        return;

    }

    menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

    menuButton.setAttribute(
        "aria-label",
        isOpen
            ? "Fechar menu"
            : "Abrir menu"
    );


    /*
     * aria-controls só é adicionado se existir
     * um ID válido no menu.
     */

    if (exists(navLinks)) {

        if (!navLinks.id) {

            navLinks.id =
                "nexo-mobile-navigation";

        }

        menuButton.setAttribute(
            "aria-controls",
            navLinks.id
        );

    }

}


function openMenu() {

    if (!exists(header)) {

        return;

    }

    state.menuOpen =
        true;

    header.classList.add(
        "menu-open"
    );

    setMenuAccessibility(
        true
    );


    /*
     * Impede scroll horizontal.
     * Não usamos overflow:hidden no body,
     * pois isso pode causar salto de layout
     * em alguns navegadores.
     */

    document.documentElement.classList.add(
        "menu-active"
    );

}


function closeMenu() {

    if (!exists(header)) {

        return;

    }

    state.menuOpen =
        false;

    header.classList.remove(
        "menu-open"
    );

    setMenuAccessibility(
        false
    );

    document.documentElement.classList.remove(
        "menu-active"
    );

}


function toggleMenu() {

    if (state.menuOpen) {

        closeMenu();

    } else {

        openMenu();

    }

}


/*
 * Inicialização da acessibilidade.
 */

if (exists(menuButton)) {

    setMenuAccessibility(
        false
    );

    menuButton.addEventListener(
        "click",
        toggleMenu
    );

}


/* =========================================================
   FECHAR MENU AO CLICAR EM LINK
   ========================================================= */

if (exists(navLinks)) {

    $$(
        "a",
        navLinks
    ).forEach(link => {

        link.addEventListener(
            "click",
            () => {

                closeMenu();

            }
        );

    });

}


/* =========================================================
   FECHAR MENU AO CLICAR FORA
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        if (!state.menuOpen) {

            return;

        }

        if (!exists(header)) {

            return;

        }

        if (
            event.target instanceof Node &&
            header.contains(event.target)
        ) {

            return;

        }

        closeMenu();

    }
);


/* =========================================================
   FECHAR MENU COM ESC
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape" ||
            !state.menuOpen
        ) {

            return;

        }

        closeMenu();

        if (exists(menuButton)) {

            menuButton.focus();

        }

    }
);


/* =========================================================
   FECHAR MENU AO REDIMENSIONAR
   ========================================================= */

let resizeTimer = null;

window.addEventListener(
    "resize",
    () => {

        window.clearTimeout(
            resizeTimer
        );

        resizeTimer =
            window.setTimeout(
                () => {

                    if (
                        window.innerWidth > 700 &&
                        state.menuOpen
                    ) {

                        closeMenu();

                    }

                },
                120
            );

    },
    {
        passive: true
    }
);


/* =========================================================
   NAVEGAÇÃO POR ÂNCORAS
   ========================================================= */

function getHeaderHeight() {

    if (!exists(header)) {

        return 0;

    }

    return header.offsetHeight || 0;

}


function scrollToTarget(target) {

    if (!exists(target)) {

        return;

    }

    const headerHeight =
        getHeaderHeight();

    const offset =
        18;

    const targetTop =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        offset;

    /*
     * Evita valores negativos.
     */

    const finalPosition =
        Math.max(
            0,
            targetTop
        );


    if (
        state.reducedMotion ||
        typeof window.scrollTo !== "function"
    ) {

        window.scrollTo(
            0,
            finalPosition
        );

        return;

    }

    window.scrollTo({

        top: finalPosition,

        behavior: "smooth"

    });

}


function handleAnchorClick(event) {

    const link =
        event.currentTarget;

    if (!(link instanceof HTMLAnchorElement)) {

        return;

    }

    const rawTarget =
        link.getAttribute("href");

    /*
     * Links vazios como href="#"
     * não devem quebrar a página.
     */

    if (
        !rawTarget ||
        rawTarget === "#"
    ) {

        event.preventDefault();

        return;

    }

    /*
     * Só processamos âncoras locais.
     */

    if (
        !rawTarget.startsWith("#")
    ) {

        return;

    }

    const target =
        document.querySelector(
            rawTarget
        );

    if (!target) {

        return;

    }

    event.preventDefault();

    closeMenu();

    scrollToTarget(
        target
    );

}


$$(
    'a[href^="#"]'
).forEach(link => {

    link.addEventListener(
        "click",
        handleAnchorClick
    );

});


/* =========================================================
   FILTRO DO CARDÁPIO
   ========================================================= */

function setActiveFilter(activeButton) {

    filterButtons.forEach(
        button => {

            const isActive =
                button === activeButton;

            button.classList.toggle(
                "active",
                isActive
            );

            button.setAttribute(
                "aria-pressed",
                String(isActive)
            );

        }
    );

}


function prepareFilterButtons() {

    filterButtons.forEach(
        button => {

            /*
             * Melhora acessibilidade.
             */

            if (
                !button.hasAttribute(
                    "aria-pressed"
                )
            ) {

                button.setAttribute(
                    "aria-pressed",
                    button.classList.contains(
                        "active"
                    )
                        ? "true"
                        : "false"
                );

            }

        }
    );

}


function showProduct(card, index) {

    if (!exists(card)) {

        return;

    }

    card.classList.remove(
        "hidden"
    );

    /*
     * Remove animação anterior.
     */

    card.style.animation =
        "none";

    /*
     * Força reflow para permitir
     * reiniciar a animação.
     */

    void card.offsetWidth;

    if (!state.reducedMotion) {

        card.style.animation =
            `productIn 450ms cubic-bezier(.16,1,.3,1) ${index * NEXO.animation.filterDelay}ms both`;

    } else {

        card.style.animation =
            "none";

    }

}


function hideProduct(card) {

    if (!exists(card)) {

        return;

    }

    card.classList.add(
        "hidden"
    );

    card.style.animation =
        "none";

}


function filterProducts(category = "todos") {

    state.activeCategory =
        category;

    let visibleIndex =
        0;

    productCards.forEach(
        card => {

            const cardCategory =
                card.dataset.category ||
                "";

            const shouldShow =
                category === "todos" ||
                cardCategory === category;

            if (shouldShow) {

                showProduct(
                    card,
                    visibleIndex
                );

                visibleIndex++;

            } else {

                hideProduct(
                    card
                );

            }

        }
    );

}


function handleFilterClick(event) {

    const button =
        event.currentTarget;

    if (!(button instanceof HTMLElement)) {

        return;

    }

    const category =
        button.dataset.category ||
        "todos";

    setActiveFilter(
        button
    );

    filterProducts(
        category
    );

}


filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            handleFilterClick
        );

    }
);


prepareFilterButtons();


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

const revealSelectors = [
    ".section-label",
    ".manifesto-content",
    ".experience-card",
    ".signature-content",
    ".signature-image",
    ".product-card",
    ".space-content",
    ".space-zone",
    ".loyalty-card",
    ".loyalty-content",
    ".campaign-inner",
    ".about-content",
    ".location-info",
    ".location-map"
];


const revealElements =
    $$(revealSelectors.join(", "));


function revealImmediately() {

    revealElements.forEach(
        element => {

            element.classList.add(
                "reveal",
                "visible"
            );

        }
    );

}


function initializeReveal() {

    if (
        state.revealInitialized
    ) {

        return;

    }

    state.revealInitialized =
        true;


    /*
     * Se o usuário prefere menos movimento,
     * não precisamos observar nada.
     */

    if (state.reducedMotion) {

        revealImmediately();

        return;

    }


    /*
     * Fallback para navegadores sem
     * IntersectionObserver.
     */

    if (
        !("IntersectionObserver" in window)
    ) {

        revealImmediately();

        return;

    }


    revealElements.forEach(
        element => {

            element.classList.add(
                "reveal"
            );

        }
    );


    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {

                            return;

                        }

                        entry.target.classList.add(
                            "visible"
                        );

                        revealObserver.unobserve(
                            entry.target
                        );

                    }
                );

            },
            {
                threshold:
                    NEXO.animation.revealThreshold,

                rootMargin:
                    NEXO.animation.revealRootMargin
            }
        );


    revealElements.forEach(
        element => {

            revealObserver.observe(
                element
            );

        }
    );

}


/* =========================================================
   DELAYS DOS CARDS
   ========================================================= */

function applyCardDelays() {

    $$(".experience-card")
        .forEach(
            (card, index) => {

                if (state.reducedMotion) {

                    card.style.transitionDelay =
                        "0ms";

                    return;

                }

                card.style.transitionDelay =
                    `${index * NEXO.animation.cardDelay}ms`;

            }
        );


    $$(".space-zone")
        .forEach(
            (zone, index) => {

                if (state.reducedMotion) {

                    zone.style.transitionDelay =
                        "0ms";

                    return;

                }

                zone.style.transitionDelay =
                    `${index * 60}ms`;

            }
        );

}


/* =========================================================
   MAGNETIC BUTTONS
   ========================================================= */

function resetMagnetic(element) {

    if (!exists(element)) {

        return;

    }

    element.style.removeProperty(
        "--magnetic-x"
    );

    element.style.removeProperty(
        "--magnetic-y"
    );

}


function applyMagneticEffect(
    element,
    event
) {

    if (
        !exists(element) ||
        state.reducedMotion ||
        !state.pointerEffectsEnabled
    ) {

        return;

    }

    const rect =
        element.getBoundingClientRect();

    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;

    const offsetX =
        event.clientX -
        centerX;

    const offsetY =
        event.clientY -
        centerY;


    const isBrandMark =
        element.classList.contains(
            "brand-mark"
        );


    const strength =
        isBrandMark
            ? NEXO.magnetic.markStrength
            : NEXO.magnetic.buttonStrength;


    const x =
        clamp(
            offsetX * strength,
            -12,
            12
        );


    const y =
        clamp(
            offsetY * strength,
            -12,
            12
        );


    element.style.setProperty(
        "--magnetic-x",
        `${x}px`
    );

    element.style.setProperty(
        "--magnetic-y",
        `${y}px`
    );


    /*
     * Como o CSS original usa transform diretamente,
     * precisamos aplicar o efeito somente quando
     * necessário.
     */

    element.style.transform =
        `translate(${x}px, ${y}px)`;

}


function initializeMagneticEffects() {

    if (
        !state.pointerEffectsEnabled
    ) {

        return;

    }


    const elements =
        $$(
            ".button, .nav-button, .brand-mark"
        );


    elements.forEach(
        element => {

            element.addEventListener(
                "mousemove",
                event => {

                    applyMagneticEffect(
                        element,
                        event
                    );

                }
            );


            element.addEventListener(
                "mouseleave",
                () => {

                    resetMagnetic(
                        element
                    );

                    element.style.transform =
                        "";

                }
            );


            element.addEventListener(
                "blur",
                () => {

                    resetMagnetic(
                        element
                    );

                    element.style.transform =
                        "";

                }
            );

        }
    );

}


/* =========================================================
   TILT DOS CARDS
   ========================================================= */

function resetTilt(card) {

    if (!exists(card)) {

        return;

    }

    card.style.transform =
        "";

    card.style.removeProperty(
        "--tilt-x"
    );

    card.style.removeProperty(
        "--tilt-y"
    );

}


function applyTilt(
    card,
    event
) {

    if (
        !exists(card) ||
        state.reducedMotion ||
        !state.pointerEffectsEnabled
    ) {

        return;

    }


    const rect =
        card.getBoundingClientRect();


    if (
        rect.width <= 0 ||
        rect.height <= 0
    ) {

        return;

    }


    const x =
        event.clientX -
        rect.left;


    const y =
        event.clientY -
        rect.top;


    const normalizedX =
        (x / rect.width) -
        0.5;


    const normalizedY =
        (y / rect.height) -
        0.5;


    const rotateX =
        clamp(
            normalizedY *
            -NEXO.tilt.maxRotation *
            2,
            -NEXO.tilt.maxRotation,
            NEXO.tilt.maxRotation
        );


    const rotateY =
        clamp(
            normalizedX *
            NEXO.tilt.maxRotation *
            2,
            -NEXO.tilt.maxRotation,
            NEXO.tilt.maxRotation
        );


    card.style.transform =
        `translateY(-8px) perspective(${NEXO.tilt.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

}


function initializeTiltEffects() {

    if (
        !state.pointerEffectsEnabled
    ) {

        return;

    }


    const cards =
        $$(
            ".product-card, .loyalty-card"
        );


    cards.forEach(
        card => {

            card.addEventListener(
                "mousemove",
                event => {

                    applyTilt(
                        card,
                        event
                    );

                }
            );


            card.addEventListener(
                "mouseleave",
                () => {

                    resetTilt(
                        card
                    );

                }
            );

        }
    );

}


/* =========================================================
   STATUS DE FUNCIONAMENTO
   ========================================================= */

/**
 * Retorna minutos desde meia-noite.
 */
function getMinutes(
    hours,
    minutes
) {

    return (
        hours * 60 +
        minutes
    );

}


/**
 * Retorna estado atual da cafeteria.
 */
function getOpeningState(
    date = new Date()
) {

    const day =
        date.getDay();

    const currentMinutes =
        getMinutes(
            date.getHours(),
            date.getMinutes()
        );


    const openingMinutes =
        getMinutes(
            NEXO.opening.openHour,
            NEXO.opening.openMinute
        );


    const closingMinutes =
        getMinutes(
            NEXO.opening.closeHour,
            NEXO.opening.closeMinute
        );


    const dayIsOpen =
        NEXO.opening.days.includes(
            day
        );


    if (!dayIsOpen) {

        return {
            open: false,
            reason: "closed-day"
        };

    }


    const isOpen =
        currentMinutes >= openingMinutes &&
        currentMinutes < closingMinutes;


    if (isOpen) {

        return {
            open: true,
            reason: "open"
        };

    }


    if (
        currentMinutes <
        openingMinutes
    ) {

        return {
            open: false,
            reason: "before-opening"
        };

    }


    return {
        open: false,
        reason: "after-closing"
    };

}


/**
 * Atualiza elementos [data-opening-status].
 */
function updateOpeningStatus() {

    const statusElements =
        $$(
            "[data-opening-status]"
        );


    if (
        statusElements.length === 0
    ) {

        return;

    }


    const openingState =
        getOpeningState();


    statusElements.forEach(
        element => {

            if (
                openingState.open
            ) {

                element.textContent =
                    "ABERTO AGORA";

                element.dataset.status =
                    "open";

                element.setAttribute(
                    "aria-label",
                    "Nexo Café está aberto agora"
                );

            } else {

                element.textContent =
                    "FECHADO AGORA";

                element.dataset.status =
                    "closed";

                element.setAttribute(
                    "aria-label",
                    "Nexo Café está fechado agora"
                );

            }

        }
    );

}


/* =========================================================
   ATUALIZAÇÃO DO STATUS
   ========================================================= */

let openingStatusTimer =
    null;


function startOpeningStatusUpdater() {

    updateOpeningStatus();


    /*
     * Atualiza aproximadamente a cada minuto.
     */

    if (
        openingStatusTimer !== null
    ) {

        window.clearInterval(
            openingStatusTimer
        );

    }


    openingStatusTimer =
        window.setInterval(
            () => {

                /*
                 * Não desperdiça processamento
                 * quando a página está oculta.
                 */

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    updateOpeningStatus();

                }

            },
            60 * 1000
        );

}


/* =========================================================
   LAZY LOADING DE IMAGENS
   ========================================================= */

function optimizeImages() {

    const images =
        $$("img");


    images.forEach(
        image => {

            /*
             * Não altera imagens que já
             * receberam configuração explícita.
             */

            if (
                !image.hasAttribute(
                    "loading"
                )
            ) {

                image.setAttribute(
                    "loading",
                    "lazy"
                );

            }


            if (
                !image.hasAttribute(
                    "decoding"
                )
            ) {

                image.setAttribute(
                    "decoding",
                    "async"
                );

            }


            /*
             * Imagens importantes acima
             * da dobra podem ser marcadas
             * pelo próprio HTML como eager.
             */

            if (
                image.dataset.priority ===
                "high"
            ) {

                image.setAttribute(
                    "loading",
                    "eager"
                );

                image.setAttribute(
                    "fetchpriority",
                    "high"
                );

            }

        }
    );

}


/* =========================================================
   LINKS EXTERNOS
   ========================================================= */

function prepareExternalLinks() {

    const links =
        $$("a[href]");


    links.forEach(
        link => {

            const href =
                link.getAttribute(
                    "href"
                );


            if (
                !href ||
                href.startsWith("#") ||
                href.startsWith("/")
            ) {

                return;

            }


            /*
             * Detecta URLs externas.
             */

            if (
                /^https?:\/\//i.test(
                    href
                )
            ) {

                /*
                 * Segurança caso algum link
                 * externo use target="_blank".
                 */

                if (
                    link.target ===
                    "_blank"
                ) {

                    const currentRel =
                        link.getAttribute(
                            "rel"
                        ) || "";


                    const relValues =
                        new Set(
                            currentRel
                                .split(/\s+/)
                                .filter(Boolean)
                        );


                    relValues.add(
                        "noopener"
                    );

                    relValues.add(
                        "noreferrer"
                    );


                    link.setAttribute(
                        "rel",
                        Array.from(
                            relValues
                        ).join(" ")
                    );

                }

            }

        }
    );

}


/* =========================================================
   PREVENÇÃO DE LINKS PLACEHOLDER
   ========================================================= */

function handlePlaceholderLinks() {

    $$(
        'a[href="#"]'
    ).forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    /*
                     * Impede o navegador de
                     * mandar a página para o topo.
                     */

                    event.preventDefault();

                }
            );

        }
    );

}


/* =========================================================
   DETECÇÃO DE IMAGENS QUEBRADAS
   ========================================================= */

function handleBrokenImages() {

    $$("img").forEach(
        image => {

            image.addEventListener(
                "error",
                () => {

                    image.classList.add(
                        "image-error"
                    );


                    /*
                     * Não tentamos substituir
                     * automaticamente a imagem,
                     * pois isso poderia mascarar
                     * um erro de URL.
                     */

                    debugLog(
                        "Imagem não carregada:",
                        image.currentSrc ||
                        image.src
                    );

                }
            );

        }
    );

}


/* =========================================================
   VISIBILIDADE DA ABA
   ========================================================= */

function handleVisibilityChange() {

    const hidden =
        document.visibilityState ===
        "hidden";


    state.isPageHidden =
        hidden;


    if (
        exists(heroBackground)
    ) {

        heroBackground.style.animationPlayState =
            hidden
                ? "paused"
                : "running";

    }


    /*
     * Quando volta para a página,
     * atualiza efeitos visuais.
     */

    if (!hidden) {

        requestHeaderUpdate();

        requestHeroParallax();

        updateOpeningStatus();

    }

}


document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
);


/* =========================================================
   REDUCED MOTION DINÂMICO
   ========================================================= */

function handleMotionPreferenceChange(event) {

    state.reducedMotion =
        event.matches;


    if (
        state.reducedMotion
    ) {

        state.heroParallaxEnabled =
            false;

        revealImmediately();

        /*
         * Remove transforms dinâmicos.
         */

        $$(".product-card, .loyalty-card")
            .forEach(
                resetTilt
            );


        $$(".button, .nav-button, .brand-mark")
            .forEach(
                element => {

                    element.style.transform =
                        "";

                }
            );

    } else {

        state.heroParallaxEnabled =
            true;

        requestHeroParallax();

    }

}


if (
    reducedMotionQuery &&
    isFunction(
        reducedMotionQuery.addEventListener
    )
) {

    reducedMotionQuery.addEventListener(
        "change",
        handleMotionPreferenceChange
    );

}


/* =========================================================
   POINTER DINÂMICO
   ========================================================= */

function updatePointerEffects() {

    state.pointerEffectsEnabled =
        hasFinePointer() &&
        !isTouchDevice() &&
        !state.reducedMotion;

}


/* =========================================================
   TECLADO — NAVEGAÇÃO MAIS AMIGÁVEL
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
         * Se o menu estiver aberto e o usuário
         * apertar Tab, mantemos o comportamento
         * padrão do navegador.
         *
         * Não implementamos focus trap agressivo,
         * pois isso pode causar problemas em
         * navegadores móveis.
         */

        if (
            event.key === "Tab" &&
            state.menuOpen
        ) {

            document.documentElement.classList.add(
                "keyboard-navigation"
            );

        }

    }
);


/* =========================================================
   DETECÇÃO DE MOUSE VS TECLADO
   ========================================================= */

document.addEventListener(
    "pointerdown",
    () => {

        document.documentElement.classList.remove(
            "keyboard-navigation"
        );

    },
    {
        passive: true
    }
);


/* =========================================================
   PERFORMANCE — IDLE CALLBACK
   ========================================================= */

function runWhenIdle(callback) {

    if (
        "requestIdleCallback" in window
    ) {

        window.requestIdleCallback(
            callback,
            {
                timeout: 1000
            }
        );

    } else {

        window.setTimeout(
            callback,
            120
        );

    }

}


/* =========================================================
   PREFETCH DE RECURSOS
   ========================================================= */

function prefetchImportantAnchors() {

    /*
     * Apenas inicializa referências importantes.
     *
     * Não usamos fetch() para não criar
     * chamadas de rede desnecessárias.
     */

    const importantTargets = [
        "#experiencia",
        "#cardapio",
        "#nexo-plus",
        "#sobre"
    ];


    importantTargets.forEach(
        selector => {

            const element =
                document.querySelector(
                    selector
                );

            if (element) {

                element.dataset.ready =
                    "true";

            }

        }
    );

}


/* =========================================================
   PROTEÇÃO CONTRA ERROS DE IMAGEM
   ========================================================= */

function validateImageSources() {

    $$("img").forEach(
        image => {

            const source =
                image.getAttribute(
                    "src"
                );


            if (
                !source ||
                source.trim() === ""
            ) {

                image.classList.add(
                    "image-error"
                );

            }

        }
    );

}


/* =========================================================
   SUPORTE PARA HASH NA URL
   ========================================================= */

function handleInitialHash() {

    const hash =
        window.location.hash;


    if (
        !hash ||
        hash === "#"
    ) {

        return;

    }


    /*
     * Espera o layout carregar.
     */

    window.setTimeout(
        () => {

            let target = null;

            try {

                target =
                    document.querySelector(
                        hash
                    );

            } catch {

                return;

            }


            if (target) {

                scrollToTarget(
                    target
                );

            }

        },
        100
    );

}


/* =========================================================
   HISTORY / HASH
   ========================================================= */

window.addEventListener(
    "hashchange",
    () => {

        handleInitialHash();

    }
);


/* =========================================================
   BOTÕES DE AÇÃO
   ========================================================= */

function prepareButtons() {

    $$(".button").forEach(
        button => {

            /*
             * Mantém botões acessíveis
             * quando usados como links.
             */

            if (
                button instanceof HTMLAnchorElement
            ) {

                button.setAttribute(
                    "role",
                    "button"
                );

            }

        }
    );

}


/* =========================================================
   INTERAÇÃO DO LOGOTIPO
   ========================================================= */

function initializeBrandInteraction() {

    const brand =
        $(".brand");


    if (!exists(brand)) {

        return;

    }


    brand.addEventListener(
        "focus",
        () => {

            brand.classList.add(
                "brand-focused"
            );

        }
    );


    brand.addEventListener(
        "blur",
        () => {

            brand.classList.remove(
                "brand-focused"
            );

        }
    );

}


/* =========================================================
   STATUS VISUAL DO CARDÁPIO
   ========================================================= */

function updateMenuCount() {

    const counter =
        $("[data-menu-count]");


    if (!exists(counter)) {

        return;

    }


    const visibleProducts =
        productCards.filter(
            card =>
                !card.classList.contains(
                    "hidden"
                )
        );


    counter.textContent =
        String(
            visibleProducts.length
        );

}


/*
 * Encapsula o filtro original para
 * atualizar o contador automaticamente.
 */

const originalFilterProducts =
    filterProducts;


/*
 * Não substituímos a função pública,
 * apenas atualizamos o contador depois
 * da inicialização inicial.
 */


/* =========================================================
   OBSERVER DE PRODUTOS
   ========================================================= */

function initializeProductObserver() {

    if (
        !("MutationObserver" in window)
    ) {

        return;

    }


    const menuGrid =
        $(".menu-grid");


    if (!exists(menuGrid)) {

        return;

    }


    const observer =
        new MutationObserver(
            () => {

                updateMenuCount();

            }
        );


    observer.observe(
        menuGrid,
        {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: [
                "class"
            ]
        }
    );

}


/* =========================================================
   SCROLL PARA O TOPO
   ========================================================= */

function initializeBackToTop() {

    const button =
        $("[data-back-to-top]");


    if (!exists(button)) {

        return;

    }


    const toggleVisibility =
        () => {

            const visible =
                window.scrollY >
                500;


            button.classList.toggle(
                "visible",
                visible
            );

        };


    window.addEventListener(
        "scroll",
        toggleVisibility,
        {
            passive: true
        }
    );


    button.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior:
                    state.reducedMotion
                        ? "auto"
                        : "smooth"

            });

        }
    );


    toggleVisibility();

}


/* =========================================================
   DETECÇÃO DE ONLINE / OFFLINE
   ========================================================= */

function updateConnectionState() {

    document.documentElement.classList.toggle(
        "offline",
        !navigator.onLine
    );

}


window.addEventListener(
    "online",
    updateConnectionState
);


window.addEventListener(
    "offline",
    updateConnectionState
);


/* =========================================================
   SERVICE WORKER
   ========================================================= */

function initializeServiceWorker() {

    /*
     * GitHub Pages suporta Service Worker,
     * mas somente quando servido via HTTPS
     * ou localhost.
     */

    if (
        !("serviceWorker" in navigator)
    ) {

        return;

    }


    if (
        location.protocol !== "https:" &&
        location.hostname !== "localhost" &&
        location.hostname !== "127.0.0.1"
    ) {

        debugLog(
            "Service Worker ignorado: contexto não seguro."
        );

        return;

    }


    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "./service-worker.js",
                    {
                        scope: "./"
                    }
                )
                .then(
                    registration => {

                        debugLog(
                            "Service Worker registrado:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    error => {

                        console.warn(
                            "Nexo Café — Service Worker:",
                            error
                        );

                    }
                );

        }
    );

}


/* =========================================================
   CSS DINÂMICO PARA ANIMAÇÃO DOS PRODUTOS
   ========================================================= */

function injectProductAnimation() {

    /*
     * Evita duplicação.
     */

    if (
        document.getElementById(
            "nexo-product-animation"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "nexo-product-animation";


    style.textContent = `

        @keyframes productIn {

            from {

                opacity: 0;

                transform:
                    translateY(18px)
                    scale(.98);

            }

            to {

                opacity: 1;

                transform:
                    translateY(0)
                    scale(1);

            }

        }


        /*
         * Variáveis utilizadas pelo
         * parallax do hero.
         */

        .hero-background {

            transform:
                scale(1.05)
                translateY(
                    var(--hero-scroll-y, 0px)
                );

            will-change:
                transform;

        }


        /*
         * Evita animações em elementos
         * quando o navegador detecta
         * preferência por redução.
         */

        @media (prefers-reduced-motion: reduce) {

            .hero-background {

                transform:
                    scale(1.03) !important;

            }

        }


        /*
         * Estado offline opcional.
         * Não altera visualmente a página
         * por padrão.
         */

        html.offline {

            --nexo-network-state:
                offline;

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   CORREÇÃO DE TRANSFORMAÇÕES
   ========================================================= */

function resetDynamicTransforms() {

    /*
     * Quando a janela perde foco,
     * evitamos deixar cards presos
     * em uma rotação.
     */

    if (
        !state.pointerEffectsEnabled
    ) {

        return;

    }


    $$(".product-card, .loyalty-card")
        .forEach(
            card => {

                resetTilt(
                    card
                );

            }
        );


    $$(".button, .nav-button, .brand-mark")
        .forEach(
            element => {

                element.style.transform =
                    "";

            }
        );

}


/* =========================================================
   WINDOW BLUR
   ========================================================= */

window.addEventListener(
    "blur",
    resetDynamicTransforms
);


/* =========================================================
   ORIENTATION CHANGE
   ========================================================= */

window.addEventListener(
    "orientationchange",
    () => {

        window.setTimeout(
            () => {

                requestHeaderUpdate();

                requestHeroParallax();

                if (
                    state.menuOpen &&
                    window.innerWidth > 700
                ) {

                    closeMenu();

                }

            },
            150
        );

    }
);


/* =========================================================
   CARREGAMENTO DO DOM
   ========================================================= */

function initializeNexo() {

    /*
     * 1 — CSS dinâmico
     */

    injectProductAnimation();


    /*
     * 2 — Estado inicial
     */

    updateConnectionState();

    updatePointerEffects();


    /*
     * 3 — Header
     */

    updateHeader();


    /*
     * 4 — Parallax
     */

    if (
        !state.reducedMotion
    ) {

        updateHeroParallax();

    }


    /*
     * 5 — Menu
     */

    closeMenu();


    /*
     * 6 — Filtros
     */

    filterProducts(
        "todos"
    );


    /*
     * 7 — Contagem
     */

    updateMenuCount();


    /*
     * 8 — Reveal
     */

    initializeReveal();


    /*
     * 9 — Delays
     */

    applyCardDelays();


    /*
     * 10 — Imagens
     */

    optimizeImages();

    handleBrokenImages();

    validateImageSources();


    /*
     * 11 — Links
     */

    prepareExternalLinks();

    handlePlaceholderLinks();


    /*
     * 12 — Botões
     */

    prepareButtons();


    /*
     * 13 — Marca
     */

    initializeBrandInteraction();


    /*
     * 14 — Efeitos desktop
     */

    initializeMagneticEffects();

    initializeTiltEffects();


    /*
     * 15 — Status
     */

    startOpeningStatusUpdater();


    /*
     * 16 — Extras
     */

    initializeProductObserver();

    initializeBackToTop();


    /*
     * 17 — Hash inicial
     */

    handleInitialHash();


    /*
     * 18 — Service Worker
     */

    initializeServiceWorker();


    /*
     * 19 — Marca como carregado
     */

    state.pageLoaded =
        true;

    document.documentElement.classList.add(
        "page-ready"
    );


    debugLog(
        "Nexo Café inicializado com sucesso."
    );

}


/* =========================================================
   DOM READY
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeNexo,
        {
            once: true
        }
    );

} else {

    initializeNexo();

}


/* =========================================================
   LOAD
   ========================================================= */

window.addEventListener(
    "load",
    () => {

        /*
         * Garante que elementos que dependem
         * do layout já estejam calculados.
         */

        requestHeaderUpdate();

        requestHeroParallax();

        updateOpeningStatus();

        runWhenIdle(
            () => {

                prefetchImportantAnchors();

            }
        );

    },
    {
        once: true
    }
);


/* =========================================================
   PAGE SHOW
   ========================================================= */

window.addEventListener(
    "pageshow",
    event => {

        /*
         * Útil quando o navegador restaura
         * a página através do Back/Forward Cache.
         */

        if (event.persisted) {

            state.isPageHidden =
                false;

            updateHeader();

            updateOpeningStatus();

            requestHeroParallax();

        }

    }
);


/* =========================================================
   PAGE HIDE
   ========================================================= */

window.addEventListener(
    "pagehide",
    () => {

        /*
         * Cancela timers desnecessários.
         */

        if (
            openingStatusTimer !== null
        ) {

            window.clearInterval(
                openingStatusTimer
            );

            openingStatusTimer =
                null;

        }

    }
);


/* =========================================================
   TRATAMENTO DE ERRO GLOBAL
   ========================================================= */

window.addEventListener(
    "error",
    event => {

        /*
         * Não interrompe o funcionamento
         * da página por causa de um recurso
         * individual quebrado.
         */

        debugLog(
            "Erro detectado:",
            event.message
        );

    }
);


/* =========================================================
   PROMISE REJECTION
   ========================================================= */

window.addEventListener(
    "unhandledrejection",
    event => {

        debugLog(
            "Promise rejeitada:",
            event.reason
        );

    }
);


/* =========================================================
   API INTERNA NEXO
   ========================================================= */

/*
 * Expõe somente funções úteis para
 * debug manual no console.
 *
 * Não depende disso para funcionar.
 */

window.NexoCafe =
    Object.freeze({

        version: "2.0.0",

        state,

        filter(category) {

            const button =
                filterButtons.find(
                    item =>
                        item.dataset.category ===
                        category
                );


            if (button) {

                setActiveFilter(
                    button
                );

            }


            filterProducts(
                category
            );

            updateMenuCount();

        },

        openMenu,

        closeMenu,

        updateOpeningStatus,

        scrollTo(selector) {

            const target =
                document.querySelector(
                    selector
                );


            if (target) {

                scrollToTarget(
                    target
                );

            }

        }

    });


/* =========================================================
   CONSOLE BRANDING
   ========================================================= */

console.log(
    "%c☕ NEXO CAFÉ",
    [
        "font-size:20px",
        "font-weight:700",
        "letter-spacing:2px"
    ].join(";")
);


console.log(
    "%cConecte-se ao seu momento.",
    [
        "font-size:12px",
        "font-weight:500"
    ].join(";")
);


console.log(
    "%cNexo Café Web v2.0",
    [
        "font-size:10px",
        "opacity:.65"
    ].join(";")
);
