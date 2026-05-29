(function() {
    'use strict';

    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursor-follower');
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const statNumbers = document.querySelectorAll('.stat-number');
    const currentYearEl = document.getElementById('current-year');

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        const ease = 0.2;
        const followerEase = 0.1;

        cursorX += (mouseX - cursorX) * ease;
        cursorY += (mouseY - cursorY) * ease;
        followerX += (mouseX - followerX) * followerEase;
        followerY += (mouseY - followerY) * followerEase;

        if (cursor && cursorFollower) {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            cursorFollower.style.left = followerX + 'px';
            cursorFollower.style.top = followerY + 'px';
        }

        requestAnimationFrame(animateCursor);
    }

    if (window.matchMedia("(pointer: fine)").matches) {
        animateCursor();
    }

    const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-card, .timeline-card, .contact-link');

    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    let lastScrollY = 0;
    let ticking = false;

    function updateNav() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
            requestAnimationFrame(updateNav);
            ticking = true;
        }
    });

    navToggle.addEventListener('click', () => {
        const isActive = navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll', isActive);
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });

    let counterAnimated = false;

    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        function updateCounter() {
            current += step;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + '+';
            }
        }

        updateCounter();
    }

    function checkCounterVisibility() {
        if (counterAnimated) return;
        const statsSection = document.querySelector('.hero-stats');
        if (statsSection) {
            const rect = statsSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                counterAnimated = true;
                statNumbers.forEach(stat => animateCounter(stat));
            }
        }
    }

    window.addEventListener('scroll', checkCounterVisibility);
    setTimeout(checkCounterVisibility, 500);

    function createObserver() {
        const elementObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    if (entry.target.classList.contains('timeline-item')) {
                        const cards = entry.target.querySelectorAll('.timeline-card');
                        cards.forEach((card, index) => card.style.transitionDelay = (index * 0.1) + 's');
                    }
                    if (entry.target.classList.contains('project-card')) {
                        entry.target.style.transitionDelay = '0.1s';
                    }
                    elementObserver.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.1 });

        const revealElements = document.querySelectorAll('.timeline-item, .project-card, .about-content > div, .contact-content > div, .section-header');
        revealElements.forEach(el => {
            el.classList.add('reveal');
            elementObserver.observe(el);
        });

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { root: null, rootMargin: '-10% 0px -10% 0px', threshold: 0.05 });

        sections.forEach(section => {
            if(section.id !== 'hero') {
                sectionObserver.observe(section);
            } else {
                section.classList.add('is-visible');
            }
        });
    }

    createObserver();

    function animateCodeBlocks() {
        const codeBlocks = document.querySelectorAll('.code-preview code');

        codeBlocks.forEach(block => {
            const lines = block.innerHTML.split('<br>');
            block.innerHTML = '';

            lines.forEach((line, index) => {
                const lineEl = document.createElement('span');
                lineEl.innerHTML = line + '<br>';
                lineEl.style.opacity = '0';
                lineEl.style.display = 'block';
                lineEl.style.transition = 'opacity 0.4s ease';

                setTimeout(() => {
                    lineEl.style.opacity = '1';
                }, index * 100);

                block.appendChild(lineEl);
            });
        });
    }

    const visualCodeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCodeBlocks();
                visualCodeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.visual-code, .image-placeholder').forEach(el => {
        visualCodeObserver.observe(el);
    });

    window.addEventListener('scroll', () => {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const targetColor = scrollPercent > 0.5 ? '#0c0c14' : '#0a0a0a';
        document.body.style.backgroundColor = targetColor;
    });

    function parallaxHero() {
        const heroBg = document.querySelector('.hero-bg');
        if (!heroBg) return;

        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    }

    window.addEventListener('scroll', () => {
        requestAnimationFrame(parallaxHero);
    });

    if (window.matchMedia("(pointer: fine)").matches) {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('*').forEach(el => {
            el.style.animationDuration = '0.01ms';
            el.style.transitionDuration = '0.01ms';
        });
    }

})();