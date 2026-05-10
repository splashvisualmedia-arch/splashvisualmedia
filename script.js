/* ================= MOBILE MENU ================= */
const navMenu = document.getElementById('nav-menu'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close');

/* Show Menu */
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
        navToggle.setAttribute('aria-expanded', 'true');
    });
}

/* Hide Menu */
if (navClose && navMenu) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
        navToggle?.setAttribute('aria-expanded', 'false');
    });
}

[navToggle, navClose].forEach(control => {
    if (!control) return;

    control.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            control.click();
        }
    });
});

/* Remove Menu Mobile when clicking a link */
const navLink = document.querySelectorAll('.nav-link');

const linkAction = () => {
    const navMenu = document.getElementById('nav-menu');
    navMenu?.classList.remove('show-menu');
    navToggle?.setAttribute('aria-expanded', 'false');
}
navLink.forEach(n => n.addEventListener('click', linkAction));

/* ================= STICKY HEADER ================= */
const scrollHeader = () => {
    const header = document.getElementById('header');
    // When the scroll is greater than 50 viewport height, add the scroll-header class
    if (!header) return;

    window.scrollY >= 50 ? header.classList.add('scroll-header')
        : header.classList.remove('scroll-header');
}
window.addEventListener('scroll', scrollHeader, { passive: true });

/* ================= HERO IMAGE REVEAL ================= */
const hero = document.querySelector('.hero');
const heroImageStage = document.querySelector('.hero-images');

const setHeroReveal = progress => {
    if (!hero) return;

    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    hero.style.setProperty('--hero-reveal', clampedProgress.toFixed(3));
    hero.classList.toggle('is-swapped', clampedProgress > 0.34);
};

const getPointerReveal = event => {
    const rect = heroImageStage.getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    const revealIntent = ((1 - x) * 0.7) + (y * 0.3);

    return (revealIntent - 0.22) / 0.55;
};

const updateHeroReveal = event => {
    if (!heroImageStage) return;

    const progress = event.pointerType === 'touch'
        ? (getPointerReveal(event) > 0.34 ? 1 : 0)
        : getPointerReveal(event);

    setHeroReveal(progress);
};

if (hero && heroImageStage) {
    setHeroReveal(0);
    heroImageStage.addEventListener('pointermove', updateHeroReveal, { passive: true });
    heroImageStage.addEventListener('pointerdown', updateHeroReveal, { passive: true });
    heroImageStage.addEventListener('pointerleave', () => setHeroReveal(0));
}

/* ================= PORTFOLIO FILTER ================= */
const filterItems = document.querySelectorAll('.filter-item');
const portfolioCards = document.querySelectorAll('.portfolio-card');
const portfolioContainer = document.querySelector('.portfolio-container');
let portfolioFilterTimer;

const filterPortfolio = filterValue => {
    portfolioCards.forEach(card => {
        const shouldShow = filterValue === 'all' || card.classList.contains(filterValue.substring(1));
        card.classList.toggle('is-hidden', !shouldShow);
    });
};

filterItems.forEach(item => {
    item.addEventListener('click', () => {
        if (item.classList.contains('active-filter')) return;

        // Remove active class from all
        filterItems.forEach(filter => filter.classList.remove('active-filter'));
        // Add active class to clicked
        item.classList.add('active-filter');

        const filterValue = item.getAttribute('data-filter');

        if (!portfolioContainer) {
            filterPortfolio(filterValue);
            return;
        }

        clearTimeout(portfolioFilterTimer);
        portfolioContainer.classList.add('is-filtering');

        portfolioFilterTimer = setTimeout(() => {
            filterPortfolio(filterValue);

            requestAnimationFrame(() => {
                portfolioContainer.classList.remove('is-filtering');
            });
        }, 220);
    });
});

/* ================= SCROLL SECTIONS ACTIVE LINK ================= */
const sections = document.querySelectorAll('section[id]');

const scrollActive = () => {
    const scrollY = window.scrollY;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight,
            sectionTop = current.offsetTop - 100,
            sectionId = current.getAttribute('id'),
            sectionsClass = document.querySelector('.nav-menu a[href*=' + sectionId + ']');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            if (sectionsClass) sectionsClass.classList.add('active-link');
        } else {
            if (sectionsClass) sectionsClass.classList.remove('active-link');
        }
    });
}
window.addEventListener('scroll', scrollActive, { passive: true });

/* ================= CONTACT FORM ================= */
const contactForm = document.querySelector('.contact-form');
const formStatus = document.querySelector('.form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async event => {
        event.preventDefault();

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const formData = new FormData(contactForm);

        if (formStatus) {
            formStatus.textContent = 'Sending your message...';
            formStatus.className = 'form-status';
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
        }

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Unable to send message.');
            }

            contactForm.reset();

            if (formStatus) {
                formStatus.textContent = 'Message sent successfully. We will get back to you shortly.';
                formStatus.classList.add('success');
            }
        } catch (error) {
            if (formStatus) {
                formStatus.textContent = 'Message could not be sent. Please try again or chat with us on WhatsApp.';
                formStatus.classList.add('error');
            }
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            }
        }
    });
}
