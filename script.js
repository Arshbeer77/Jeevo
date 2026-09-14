/* ========================================
   JEEVO TOURS & TRAVELS - JAVASCRIPT
   Interactive functionality for the website
   ======================================== */

// ========== NAVIGATION SCROLL EFFECT ==========
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add shadow on scroll
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Active navigation link on scroll
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// ========== MOBILE NAVIGATION TOGGLE ==========
const navToggle = document.getElementById('navToggle');
const navLinksContainer = document.getElementById('navLinks');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// ========== SMOOTH HERO SLIDESHOW ==========
const heroSlides = document.querySelectorAll('.hero-slide');
let currentSlide = 0;

function nextSlide() {
    // Remove active class from current slide
    heroSlides[currentSlide].classList.remove('active');

    // Move to next slide
    currentSlide = (currentSlide + 1) % heroSlides.length;

    // Add active class to new slide
    heroSlides[currentSlide].classList.add('active');
}

// Change slide every 5 seconds with smooth transition
if (heroSlides.length > 1) {
    setInterval(nextSlide, 5000);
}

// ========== ANIMATED COUNTER ==========
const counters = document.querySelectorAll('.stat-num');
let counterAnimated = false;

function animateCounters() {
    if (counterAnimated) return;

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    });

    counterAnimated = true;
}

// Trigger counter animation when hero section is visible
const heroSection = document.querySelector('.hero');
const observerOptions = {
    threshold: 0.5
};

const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
        }
    });
}, observerOptions);

if (heroSection) {
    heroObserver.observe(heroSection);
}

// scroll reveals: handled in assets/jeevo-scroll.js

// ========== BACK TO TOP BUTTON ==========
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

// ========== CONTACT FORM HANDLING ==========
/* ============================================================
   CONTACT FORM  —  Web3Forms with a mailto fallback
   ------------------------------------------------------------
   SETUP (2 minutes, free, no account needed):
     1. Go to https://web3forms.com
     2. Enter the inbox that should receive enquiries
     3. They email you an Access Key - paste it below
   Until a key is set, the form falls back to opening the
   visitor's email client addressed to CONTACT_EMAIL.
   ============================================================ */
const _JV = (window.JEEVO_CONFIG || {});
const WEB3FORMS_KEY   = _JV.web3formsKey || "";
const CONTACT_EMAIL   = _JV.contactEmail || "hello@jeevotours.com";
const WHATSAPP_NUMBER = (_JV.whatsapp || "").replace(/[^0-9]/g, "");

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }

        const btn = document.getElementById('contactSubmit');
        const original = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'; }

        const d = {};
        new FormData(contactForm).forEach((v, k) => { d[k] = v; });
        const subject = 'Jeevo enquiry - ' + (d.reason || 'General') + ' - ' + (d.name || '');

        function succeeded(name) {
            const first = name ? ' ' + name.trim().split(' ')[0] : '';
            contactForm.outerHTML =
                '<div class="form-success">' +
                  '<i class="fas fa-circle-check"></i>' +
                  '<h3>Thank you' + first + '</h3>' +
                  '<p>We have got your enquiry and will reply within 24 hours. ' +
                  'If it is urgent, message us on WhatsApp and we will pick it up faster.</p>' +
                  '<a class="btn btn-whatsapp" target="_blank" rel="noopener" ' +
                     'href="https://wa.me/' + WHATSAPP_NUMBER + '?text=' +
                     encodeURIComponent('Hi Jeevo, I just sent an enquiry through your website.') + '">' +
                     '<i class="fab fa-whatsapp"></i> Message us on WhatsApp</a>' +
                '</div>';
        }

        // 1) try Web3Forms
        if (WEB3FORMS_KEY) {
            try {
                const r = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify(Object.assign({
                        access_key: WEB3FORMS_KEY,
                        subject: subject,
                        from_name: 'Jeevo website',
                        replyto: d.email
                    }, d))
                });
                if (r.ok) { succeeded(d.name); return; }
            } catch (_) { /* fall through to mailto */ }
        }

        // 2) fallback - open the visitor's mail client with everything filled in
        const body =
            'Name: ' + (d.name || '-') + '\n' +
            'Phone: ' + (d.phone || '-') + '\n' +
            'Email: ' + (d.email || '-') + '\n' +
            'Reason: ' + (d.reason || '-') + '\n\n' +
            (d.message || '');
        window.location.href = 'mailto:' + CONTACT_EMAIL +
            '?subject=' + encodeURIComponent(subject) +
            '&body=' + encodeURIComponent(body);

        if (btn) { btn.disabled = false; btn.innerHTML = original; }
        succeeded(d.name);
    });
}

// ========== NEWSLETTER FORM ==========
/* newsletter form: handled in assets/jeevo-forms.js */


// ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Don't prevent default for empty hash or just #
        if (href === '#' || href === '') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ========== LAZY LOADING IMAGES ==========
const images = document.querySelectorAll('img[loading="lazy"]');

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.src; // Trigger loading
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ========== PREVENT FLASH OF UNSTYLED CONTENT ==========
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

console.log('🕉 Jeevo Tours & Travels - Website Loaded Successfully!');


