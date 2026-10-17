document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. GERENCIAMENTO DE CONSENTIMENTO (LGPD)
    // ==========================================
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const declineBtn = document.getElementById('decline-cookies');

    function checkConsent() {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setTimeout(() => cookieBanner.classList.add('show'), 1000);
        }
        return consent === 'accepted';
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieBanner.classList.remove('show');
        initializeTracking();
    });

    declineBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        cookieBanner.classList.remove('show');
    });

    // ==========================================
    // 2. RASTREAMENTO DE EVENTOS (GA4 / Pixel)
    // ==========================================
    function trackEvent(eventName, params = {}) {
        if (localStorage.getItem('cookieConsent') === 'accepted') {
            // Exemplo: gtag('event', eventName, params);
            // Exemplo: fbq('track', eventName, params);
            console.log(`[TRACK] ${eventName}`, params);
        }
    }

    function initializeTracking() {
        // Disparar visualização de página se consentido
        trackEvent('page_view', { page_location: window.location.href });
    }

    // Rastrear cliques em CTAs
    document.querySelectorAll('[data-track]').forEach(el => {
        el.addEventListener('click', () => {
            trackEvent(el.dataset.track, { element: el.textContent.trim() });
        });
    });

    // ==========================================
    // 3. HEADER GLASSMORPHISM NO SCROLL
    // ==========================================
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // ==========================================
    // 4. MENU MOBILE
    // ==========================================
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.getElementById('main-nav');
    const hamburger = document.querySelector('.hamburger');

    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        hamburger.classList.toggle('active');
        const isExpanded = nav.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Fechar menu ao clicar em link
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            hamburger.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // ==========================================
    // 5. SCROLL REVEAL (Intersection Observer)
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Anima apenas uma vez
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ==========================================
    // 6. FAQ ACCORDION ANIMADO
    // ==========================================
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.parentElement;
            const isActive = item.classList.contains('active');
            
            // Fechar todos os outros
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Abrir o clicado (se não estava aberto)
            if (!isActive) {
                item.classList.add('active');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ==========================================
    // 7. WHATSAPP CONTEXTUAL
    // ==========================================
    const whatsappBtn = document.getElementById('whatsapp-float');
    const baseURL = "https://wa.me/5511960966646?text="; // [Sugestão - VALIDAR Número]
    
    function updateWhatsAppMessage() {
        const scrollY = window.scrollY;
        let message = "Olá! Vim pelo site e gostaria de mais informações.";
        
        if (scrollY > 800 && scrollY < 2000) {
            message = "Olá! Vi os serviços no site e gostaria de saber mais detalhes e valores.";
        } else if (scrollY >= 2000 && scrollY < 3500) {
            message = "Olá! Gostaria de agendar um horário no Studio E&J.";
        } else if (scrollY >= 3500) {
            message = "Olá! Tenho uma dúvida sobre o formulário de contato do site.";
        }
        
        whatsappBtn.href = baseURL + encodeURIComponent(message);
    }

    window.addEventListener('scroll', updateWhatsAppMessage, { passive: true });
    updateWhatsAppMessage(); // Inicializar

    // ==========================================
    // 8. FORMULÁRIO: RASCUNHO NO LOCALSTORAGE
    // ==========================================
    const form = document.getElementById('contact-form');
    const formFields = form.querySelectorAll('input, select, textarea');
    const formStatus = form.querySelector('.form-status');

    // Carregar rascunho
    formFields.forEach(field => {
        const saved = localStorage.getItem(`form_draft_${field.name}`);
        if (saved) field.value = saved;
        
        // Salvar ao digitar
        field.addEventListener('input', () => {
            localStorage.setItem(`form_draft_${field.name}`, field.value);
        });
    });

    // Envio simulado
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validação simples
        if (!form.checkValidity()) {
            formStatus.textContent = "Por favor, preencha todos os campos obrigatórios.";
            formStatus.style.color = "red";
            return;
        }

        // Simular envio
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Enviando...";
        submitBtn.disabled = true;

        setTimeout(() => {
            formStatus.textContent = "Mensagem enviada com sucesso! Entraremos em contato em breve.";
            formStatus.style.color = "green";
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Limpar rascunho
            formFields.forEach(field => localStorage.removeItem(`form_draft_${field.name}`));
            
            trackEvent('form_submit', { form_name: 'contato_geral' });
        }, 1500);
    });

    // Inicializar verificação de cookies
    checkConsent();
});