```javascript
/* =========================================================
   NEXO CAFÉ — INTERAÇÕES
   ========================================================= */

"use strict";

/* =========================================================
   ELEMENTOS
   ========================================================= */

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");

const filterButtons = document.querySelectorAll(".filter-button");
const productCards = document.querySelectorAll(".product-card");

const revealElements = document.querySelectorAll(
    ".section-label, " +
    ".manifesto-content, " +
    ".experience-card, " +
    ".signature-content, " +
    ".product-card, " +
    ".space-content, " +
    ".space-zone, " +
    ".loyalty-card, " +
    ".loyalty-content, " +
    ".campaign-inner, " +
    ".about-content, " +
    ".location-info, " +
    ".location-map"
);


/* =========================================================
   HEADER — EFEITO AO ROLAR
   ========================================================= */

let ticking = false;

function updateHeader() {

    if (window.scrollY > 40) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

    ticking = false;
}

window.addEventListener(
    "scroll",
    () => {

        if (!ticking) {

            window.requestAnimationFrame(updateHeader);

            ticking = true;
        }

    },
    { passive: true }
);


/* =========================================================
   MENU MOBILE
   ========================================================= */

function closeMenu() {

    header.classList.remove("menu-open");

    menuButton.setAttribute(
        "aria-expanded",
        "false"
    );
}

function openMenu() {

    header.classList.add("menu-open");

    menuButton.setAttribute(
        "aria-expanded",
        "true"
    );
}

menuButton?.addEventListener("click", () => {

    const isOpen =
        header.classList.contains("menu-open");

    if (isOpen) {
        closeMenu();
    } else {
        openMenu();
    }

});


/* Fecha o menu ao clicar em um link */

navLinks?.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {
        closeMenu();
    });

});


/* Fecha ao clicar fora */

document.addEventListener("click", event => {

    if (!header.classList.contains("menu-open")) {
        return;
    }

    const clickedInsideHeader =
        header.contains(event.target);

    if (!clickedInsideHeader) {
        closeMenu();
    }

});


/* Fecha ao apertar ESC */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeMenu();
    }

});


/* =========================================================
   FILTRO DO CARDÁPIO
   ========================================================= */

function filterProducts(category) {

    productCards.forEach((card, index) => {

        const cardCategory =
            card.dataset.category;

        const shouldShow =
            category === "todos" ||
            cardCategory === category;

        if (shouldShow) {

            card.classList.remove("hidden");

            /*
             * Pequeno atraso escalonado.
             * Faz os produtos aparecerem em sequência.
             */

            card.style.animation =
                "productIn 450ms cubic-bezier(.16,1,.3,1) " +
                `${index * 35}ms both`;

        } else {

            card.classList.add("hidden");

            card.style.animation = "none";
        }

    });

}


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        const category =
            button.dataset.category;

        filterButtons.forEach(item => {

            item.classList.remove("active");

        });

        button.classList.add("active");

        filterProducts(category);

    });

});


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

revealElements.forEach(element => {

    element.classList.add("reveal");

});


const revealObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("visible");

                revealObserver.unobserve(
                    entry.target
                );

            });

        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -45px 0px"
        }
    );


revealElements.forEach(element => {

    revealObserver.observe(element);

});


/* =========================================================
   ATRASO AUTOMÁTICO NOS CARDS
   ========================================================= */

document
    .querySelectorAll(".experience-card")
    .forEach((card, index) => {

        card.style.transitionDelay =
            `${index * 70}ms`;

    });


document
    .querySelectorAll(".space-zone")
    .forEach((zone, index) => {

        zone.style.transitionDelay =
            `${index * 60}ms`;

    });


/* =========================================================
   NAVEGAÇÃO SUAVE
   ========================================================= */

document.querySelectorAll(
    'a[href^="#"]'
).forEach(link => {

    link.addEventListener("click", event => {

        const targetID =
            link.getAttribute("href");

        if (
            !targetID ||
            targetID === "#"
        ) {
            return;
        }

        const target =
            document.querySelector(targetID);

        if (!target) {
            return;
        }

        event.preventDefault();

        const headerHeight =
            header.offsetHeight;

        const targetPosition =
            target.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            15;

        window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
        });

    });

});


/* =========================================================
   PARALLAX LEVE DO HERO
   ========================================================= */

const heroBackground =
    document.querySelector(".hero-background");

let heroTicking = false;

function updateHeroParallax() {

    if (!heroBackground) {
        return;
    }

    /*
     * Limitamos o efeito aos primeiros 900px.
     * Evita trabalho desnecessário durante o resto
     * do scroll.
     */

    const scroll =
        Math.min(window.scrollY, 900);

    heroBackground.style.transform =
        `scale(1.05) translateY(${scroll * 0.08}px)`;

    heroTicking = false;
}


window.addEventListener(
    "scroll",
    () => {

        if (!heroTicking) {

            window.requestAnimationFrame(
                updateHeroParallax
            );

            heroTicking = true;
        }

    },
    { passive: true }
);


/* =========================================================
   CURSOR MAGNÉTICO — APENAS DESKTOP
   ========================================================= */

const supportsFinePointer =
    window.matchMedia(
        "(pointer: fine)"
    ).matches;


if (supportsFinePointer) {

    const magneticElements =
        document.querySelectorAll(
            ".button, .nav-button, .brand-mark"
        );

    magneticElements.forEach(element => {

        element.addEventListener(
            "mousemove",
            event => {

                const rect =
                    element.getBoundingClientRect();

                const x =
                    event.clientX -
                    rect.left -
                    rect.width / 2;

                const y =
                    event.clientY -
                    rect.top -
                    rect.height / 2;

                const strength =
                    element.classList.contains(
                        "brand-mark"
                    )
                        ? 0.12
                        : 0.08;

                element.style.transform =
                    `translate(${x * strength}px, ${y * strength}px)`;

            }
        );


        element.addEventListener(
            "mouseleave",
            () => {

                element.style.transform = "";

            }
        );

    });

}


/* =========================================================
   EFEITO DE TILT NOS CARTÕES
   ========================================================= */

if (supportsFinePointer) {

    const tiltCards =
        document.querySelectorAll(
            ".product-card, .loyalty-card"
        );

    tiltCards.forEach(card => {

        card.addEventListener(
            "mousemove",
            event => {

                const rect =
                    card.getBoundingClientRect();

                const x =
                    event.clientX -
                    rect.left;

                const y =
                    event.clientY -
                    rect.top;

                const centerX =
                    rect.width / 2;

                const centerY =
                    rect.height / 2;

                const rotateX =
                    ((y - centerY) / centerY) * -2;

                const rotateY =
                    ((x - centerX) / centerX) * 2;

                card.style.transform =
                    `translateY(-8px) perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            }
        );


        card.addEventListener(
            "mouseleave",
            () => {

                card.style.transform = "";

            }
        );

    });

}


/* =========================================================
   STATUS DE ABERTURA
   ========================================================= */

function updateOpeningStatus() {

    const now =
        new Date();

    const day =
        now.getDay();

    const hour =
        now.getHours();

    /*
     * Segunda = 1
     * Domingo = 0
     *
     * Horário fictício atual:
     * Segunda a sábado
     * 08:00 — 20:00
     */

    const isOpen =
        day >= 1 &&
        day <= 6 &&
        hour >= 8 &&
        hour < 20;

    document
        .querySelectorAll(
            "[data-opening-status]"
        )
        .forEach(element => {

            element.textContent =
                isOpen
                    ? "ABERTO AGORA"
                    : "FECHADO AGORA";

            element.dataset.status =
                isOpen
                    ? "open"
                    : "closed";

        });

}

updateOpeningStatus();


/* =========================================================
   PERFORMANCE
   ========================================================= */

/*
 * Quando a aba fica invisível, pausamos efeitos que
 * dependem de processamento contínuo.
 */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "hidden"
        ) {

            document
                .querySelectorAll(
                    ".hero-background"
                )
                .forEach(element => {

                    element.style.animationPlayState =
                        "paused";

                });

        } else {

            document
                .querySelectorAll(
                    ".hero-background"
                )
                .forEach(element => {

                    element.style.animationPlayState =
                        "running";

                });

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

updateHeader();

filterProducts("todos");

console.log(
    "%c☕ NEXO CAFÉ",
    "font-size:18px;font-weight:bold;"
);

console.log(
    "%cConecte-se ao seu momento.",
    "font-size:12px;"
);


/* =========================================================
   ANIMAÇÃO DOS PRODUTOS
   ========================================================= */

const style =
    document.createElement("style");

style.textContent = `
    @keyframes productIn {

        from {
            opacity: 0;
            transform: translateY(18px) scale(.98);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

    }
`;

document.head.appendChild(style);
```
