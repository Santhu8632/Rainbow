// ============================================
// RAINBOW CONSULTANTS - RESPONSIVE + ANIMATIONS
// ============================================

document.addEventListener('DOMContentLoaded', function () {

    // ============ MOBILE MENU TOGGLE ============
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    function closeMenu() {
        if (hamburger) hamburger.classList.remove('active');
        if (navLinks) navLinks.classList.remove('open');
        if (navOverlay) navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function openMenu() {
        if (hamburger) hamburger.classList.add('active');
        if (navLinks) navLinks.classList.add('open');
        if (navOverlay) navOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            if (navLinks.classList.contains('open')) closeMenu();
            else openMenu();
        });
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', closeMenu);
    }

    // Close menu on link click
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // Close menu on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // Close menu on resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) closeMenu();
    });

    // ============ NAVBAR SCROLL EFFECT ============
    const navbar = document.getElementById('navbar');
    if (navbar) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            navbar.classList.toggle('scrolled', scrollY > 40);
            lastScroll = scrollY;
        }, { passive: true });
    }

    // ============ REVEAL ON SCROLL ============
    const revealEls = document.querySelectorAll(
        '.section, .service-card, .area-card, .trust-item, .founder-card, .contact-item, .apt-point, .feature'
    );
    revealEls.forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = (i % 6) * 0.08 + 's';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(el => observer.observe(el));

    // ============ 3D TILT — desktop only ============
    if (window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const rx = ((y - cy) / cy) * -6;
                const ry = ((x - cx) / cx) * 6;
                card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-12px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ============ COUNTER ANIMATION ============
    const counters = document.querySelectorAll('.stat h3');
    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObs.observe(c));

    function animateCounter(el) {
        const text = el.textContent.trim();
        const match = text.match(/^(\d+)/);
        if (!match) return;
        const target = parseInt(match[1]);
        const suffix = text.replace(match[1], '');
        const duration = 1500;
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
    }

    // ============ SMOOTH SCROLL ============
    document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const targetId = href.replace('/', '');
            if (targetId.startsWith('#')) {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const offset = 80;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }
        });
    });

    // ============ PARALLAX SHAPES (desktop only) ============
    const shapes = document.querySelectorAll('.floating-shape');
    if (shapes.length && window.innerWidth > 900) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            shapes.forEach((shape, i) => {
                const speed = 0.15 + i * 0.08;
                shape.style.transform = `translateY(${scrollY * speed}px)`;
            });
        }, { passive: true });
    }

    // ============ QUICK ENQUIRY FORM ============
    const qf = document.getElementById('quickForm');
    if (qf) {
        qf.addEventListener('submit', async function (e) {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(this));
            data.source = 'quick_form';
            const btn = this.querySelector('button');
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;
            try {
                const res = await fetch('/api/enquiry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const r = await res.json();
                btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                setTimeout(() => {
                    qf.reset();
                    btn.innerHTML = orig;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 2500);
            } catch (err) {
                btn.innerHTML = '<i class="fas fa-times"></i> Error';
                btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                setTimeout(() => {
                    btn.innerHTML = orig;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 2500);
            }
        });
    }

    // ============ APPOINTMENT FORM ============
    const af = document.getElementById('aptForm');
    if (af) {
        af.addEventListener('submit', async function (e) {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(this));
            const btn = this.querySelector('button[type="submit"]');
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
            btn.disabled = true;
            try {
                const res = await fetch('/api/appointment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const r = await res.json();
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Booked!';
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                setTimeout(() => {
                    af.reset();
                    btn.innerHTML = orig;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            } catch (err) {
                btn.innerHTML = '<i class="fas fa-times"></i> Error';
                btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                setTimeout(() => {
                    btn.innerHTML = orig;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 2500);
            }
        });
    }

    // ============ MIN DATE ============
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // ============ SMOOTH TOUCH FEEDBACK (mobile) ============
    if (window.matchMedia('(hover: none)').matches) {
        document.querySelectorAll('.btn, .service-card, .area-card, .trust-item, .contact-item').forEach(el => {
            el.addEventListener('touchstart', function () {
                this.style.transform = 'scale(0.98)';
            }, { passive: true });
            el.addEventListener('touchend', function () {
                this.style.transform = '';
            }, { passive: true });
        });
    }

    // ============ SWIPE FROM LEFT EDGE TO OPEN MENU ============
    let touchStartX = 0;
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        // Swipe right from left edge opens menu
        if (touchStartX < 40 && dx > 80 && Math.abs(dy) < 80) {
            openMenu();
        }
        // Swipe left closes menu
        if (navLinks && navLinks.classList.contains('open') && dx < -80 && Math.abs(dy) < 80) {
            closeMenu();
        }
    }, { passive: true });

    // ============ FIX VIEWPORT HEIGHT ON MOBILE (address bar issue) ============
    function setVH() {
        document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
    }
    setVH();
    window.addEventListener('resize', setVH);
});