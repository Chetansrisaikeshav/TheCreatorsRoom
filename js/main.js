// ===================================
// THE WRITERS' ROOM - Immersive JS
// Cinematic scroll-driven experience
// ===================================

document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initMenuOverlay();
    initScrollReveal();
    initSmoothScroll();
    initFAQ();
    initWordCounter();
    initParallax();
    initCounterAnimation();
});

// ===== NAVIGATION =====
function initNavigation() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        // Hide/show nav based on scroll direction
        if (currentScroll > lastScroll && currentScroll > 100) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });
}

// ===== MENU OVERLAY =====
function initMenuOverlay() {
    const menuBtn = document.querySelector('.nav__menu-btn');
    const menuOverlay = document.querySelector('.menu-overlay');
    const closeBtn = document.querySelector('.menu-overlay__close');

    if (!menuBtn || !menuOverlay) return;

    menuBtn.addEventListener('click', () => {
        menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close on link click
    menuOverlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '-50px'
    });

    reveals.forEach(el => observer.observe(el));
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    // Smooth anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== PARALLAX EFFECT =====
function initParallax() {
    const heroBackground = document.querySelector('.hero__background img');
    if (!heroBackground) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const rate = scrolled * 0.3;

        heroBackground.style.transform = `scale(1.1) translateY(${rate}px)`;
    });
}

// ===== COUNTER ANIMATION =====
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-card__number');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.value || counter.textContent.replace(/,/g, ''));
                animateValue(counter, 0, target, 2000);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateValue(element, start, end, duration) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out quart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeProgress);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ===== FAQ ACCORDION =====
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        if (question) {
            question.addEventListener('click', () => {
                // Close others
                faqItems.forEach(other => {
                    if (other !== item) {
                        other.classList.remove('active');
                    }
                });

                // Toggle current
                item.classList.toggle('active');
            });
        }
    });
}

// ===== WORD COUNTER =====
function initWordCounter() {
    const textarea = document.getElementById('story-content');
    const wordCount = document.querySelector('.word-counter__count');

    if (!textarea || !wordCount) return;

    const maxWords = 1000;

    textarea.addEventListener('input', () => {
        const text = textarea.value.trim();
        const words = text ? text.split(/\s+/).length : 0;

        wordCount.textContent = `${words} / ${maxWords}`;

        // Color feedback
        if (words < 100) {
            wordCount.style.color = 'rgba(255, 255, 255, 0.4)';
        } else if (words > maxWords) {
            wordCount.style.color = '#ef4444';
        } else {
            wordCount.style.color = '#c9a227';
        }
    });
}

// ===== CURSOR GLOW (optional enhancement) =====
function initCursorGlow() {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    cursor.style.cssText = `
        position: fixed;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(201, 162, 39, 0.1), transparent 70%);
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s;
    `;
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
}

// ===== IMAGE LAZY LOADING =====
document.querySelectorAll('img[data-src]').forEach(img => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    observer.observe(img);
});

// ===== FORM VALIDATION =====
const form = document.getElementById('submission-form');
if (form) {
    form.addEventListener('submit', function (e) {
        const storyContent = document.getElementById('story-content');
        if (storyContent) {
            const text = storyContent.value.trim();
            const wordCount = text ? text.split(/\s+/).length : 0;

            if (wordCount < 100) {
                e.preventDefault();
                alert(`Your story should be at least 100 words. Currently: ${wordCount} words.`);
                return false;
            }

            if (wordCount > 1500) {
                e.preventDefault();
                alert(`Your story should be under 1000 words. Currently: ${wordCount} words.`);
                return false;
            }
        }

        // Show success after delay
        const formContainer = document.getElementById('submission-form-container');
        const successMessage = document.getElementById('success-message');

        if (formContainer && successMessage) {
            setTimeout(() => {
                formContainer.style.display = 'none';
                successMessage.classList.add('show');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1000);
        }
    });
}

// ===== TYPING EFFECT FOR HERO =====
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// ===== SCROLL PROGRESS INDICATOR =====
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 2px;
        background: linear-gradient(90deg, #c9a227, #f4d03f);
        z-index: 10000;
        transition: width 0.1s;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });
}

// Initialize scroll progress
initScrollProgress();
