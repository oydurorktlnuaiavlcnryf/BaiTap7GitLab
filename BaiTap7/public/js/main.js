// BaiTap7 - CI/CD Pipeline Demo
// Dynamic features: timestamp, animations, Q&A accordion

document.addEventListener('DOMContentLoaded', function () {

    // ======= Update Timestamp =======
    const timestampEl = document.getElementById('timestamp');
    if (timestampEl) {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        timestampEl.textContent = now.toLocaleString('vi-VN', options);
    }

    // ======= Scroll Reveal Animation =======
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.card').forEach(function (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add visible class styles
    const style = document.createElement('style');
    style.textContent = '.card.visible { opacity: 1 !important; transform: translateY(0) !important; }';
    document.head.appendChild(style);

    // ======= Pipeline Stage Hover Effect =======
    document.querySelectorAll('.pipeline-stage').forEach(function (stage) {
        stage.addEventListener('mouseenter', function () {
            this.style.boxShadow = '0 0 25px rgba(34, 197, 94, 0.25)';
        });
        stage.addEventListener('mouseleave', function () {
            this.style.boxShadow = '';
        });
    });

    // ======= Header appear animation =======
    const header = document.getElementById('header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-15px)';
        header.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        requestAnimationFrame(function () {
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        });
    }

});

// ======= Q&A Accordion Toggle =======
function toggleAnswer(button) {
    const answer = button.nextElementSibling;
    const toggle = button.querySelector('.qa-toggle');
    const isOpen = answer.classList.contains('open');

    // Close all other answers
    document.querySelectorAll('.qa-answer.open').forEach(function (el) {
        el.classList.remove('open');
        el.previousElementSibling.querySelector('.qa-toggle').textContent = '+';
        el.previousElementSibling.querySelector('.qa-toggle').style.transform = 'rotate(0deg)';
    });

    if (!isOpen) {
        answer.classList.add('open');
        toggle.textContent = '−';
        toggle.style.transform = 'rotate(180deg)';
    }
}
