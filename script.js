
document.addEventListener('DOMContentLoaded', () => {

    
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const progressBar = document.getElementById('sliderProgress');
    
    let currentSlide = 0;
    let slideInterval;
    let progressInterval;
    const SLIDE_DURATION = 6000; // 6 seconds per slide
    const PROGRESS_STEP = 50; // Update every 50ms
    let progressWidth = 0;
    let isPaused = false;

    function goToSlide(index) {
        slides.forEach(s => s.classList.remove('prev'));
        
        slides[currentSlide].classList.add('prev');
        slides[currentSlide].classList.remove('active');
        
        currentSlide = index;
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;
        
        slides[currentSlide].classList.add('active');
        slides[currentSlide].classList.remove('prev');
        
        dots.forEach(d => d.classList.remove('active'));
        dots[currentSlide].classList.add('active');
        
        resetProgress();
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function resetProgress() {
        progressWidth = 0;
        if (progressBar) {
            progressBar.style.width = '0%';
        }
    }

    function startProgress() {
        clearInterval(progressInterval);
        progressInterval = setInterval(() => {
            if (!isPaused) {
                progressWidth += (PROGRESS_STEP / SLIDE_DURATION) * 100;
                if (progressBar) {
                    progressBar.style.width = progressWidth + '%';
                }
                if (progressWidth >= 100) {
                    nextSlide();
                }
            }
        }, PROGRESS_STEP);
    }

    function startAutoplay() {
        resetProgress();
        startProgress();
    }

    function pauseAutoplay() {
        isPaused = true;
    }

    function resumeAutoplay() {
        isPaused = false;
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
        });
    }

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.dataset.slide);
            goToSlide(slideIndex);
        });
    });

    const heroSlider = document.getElementById('heroSlider');
    if (heroSlider) {
        heroSlider.addEventListener('mouseenter', pauseAutoplay);
        heroSlider.addEventListener('mouseleave', resumeAutoplay);
    }

    let touchStartX = 0;
    let touchEndX = 0;
    
    if (heroSlider) {
        heroSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            pauseAutoplay();
        }, { passive: true });

        heroSlider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            resumeAutoplay();
        }, { passive: true });
    }

    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    startAutoplay();

    const header = document.getElementById('main-header');
    
    function handleScroll() {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function toggleMenu() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    overlay.addEventListener('click', closeMenu);

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const siblings = entry.target.parentElement.children;
                const index = Array.from(siblings).indexOf(entry.target);
                
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, index * 100);
                
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    document.querySelectorAll('.card').forEach(card => {
        if (!card.classList.contains('reveal-up') && 
            !card.classList.contains('reveal-left') && 
            !card.classList.contains('reveal-right')) {
            card.classList.add('reveal-up');
            revealObserver.observe(card);
        }
    });

    // 
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const btn = this.querySelector('button[type="submit"]');
            const statusEl = document.getElementById('formStatus');
            const originalText = btn.textContent;
            
            btn.textContent = 'Αποστολή...';
            btn.disabled = true;
            
            const formData = new FormData(this);
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    btn.textContent = '✔ Το μήνυμα στάλθηκε!';
                    btn.style.background = '#4caf50';
                    if (statusEl) statusEl.textContent = 'Ευχαριστούμε! Θα επικοινωνήσουμε μαζί σας σύντομα.';
                    if (statusEl) statusEl.style.color = '#4caf50';
                    contactForm.reset();
                } else {
                    throw new Error('Σφάλμα αποστολής');
                }
            })
            .catch(error => {
                btn.textContent = '✘ Σφάλμα αποστολής';
                btn.style.background = '#e53935';
                if (statusEl) statusEl.textContent = 'Κάτι πήγε στραβά. Δοκιμάστε ξανά ή καλέστε μας.';
                if (statusEl) statusEl.style.color = '#e53935';
            })
            .finally(() => {
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                    if (statusEl) {
                        setTimeout(() => { statusEl.textContent = ''; }, 5000);
                    }
                }, 3000);
            });
        });
    }

    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavOnScroll() {
        const scrollPos = window.scrollY + 200;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.querySelectorAll('a').forEach(link => {
                    link.classList.remove('active-link');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active-link');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavOnScroll);

});
