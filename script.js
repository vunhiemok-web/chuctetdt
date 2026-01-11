document.addEventListener('DOMContentLoaded', () => {
    // === 1. PARALLAX EFFECT (Mobile Optimized) ===
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroSection = document.querySelector('.hero-section');
        // Only apply parallax if element exists and not too heavy
        if (heroSection) {
            heroSection.style.backgroundPositionY = -(scrolled * 0.3) + 'px';
        }
    });

    // === 2. SCROLL REVEAL ===
    const observerOptions = {
        threshold: 0.2, // Trigger when 20% visible
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });

    // === 3. FALLING PETALS ANIMATION (CANVAS) ===
    const canvas = document.getElementById('falling-effect');
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    const particleCount = 40; // Low count for mobile performance

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = -10;
            this.size = Math.random() * 5 + 3;
            this.speedY = Math.random() * 1.5 + 0.5; // Slow fall
            this.speedX = Math.random() * 1 - 0.5;   // Gentle drift
            this.angle = Math.random() * 360;
            this.spin = Math.random() < 0.5 ? 1 : -1;
            // Colors: Soft pink (peach) or Yellow (Ochna)
            const colors = ['rgba(255, 183, 178, 0.8)', 'rgba(255, 223, 0, 0.8)', 'rgba(255, 160, 122, 0.8)'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.01) * 0.5; // Swaying motion
            this.angle += this.spin;

            if (this.y > height) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            // Draw a petal shape (ellipse-ish)
            ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function initParticles() {
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    // Handle resize
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });

    initParticles();
    animateParticles();
});

// === 4. LUCKY MONEY INTERACTION ===
function openEnvelope(element) {
    if (!element.classList.contains('open')) {
        element.classList.add('open');
        const message = document.querySelector('.lucky-message');
        message.classList.remove('hidden');
        setTimeout(() => {
            message.classList.add('show');
            confettiExplosion(); // Bonus visual
        }, 300);
    }
}

// === 5. SHARING LOGIC ===
function shareTo(platform) {
    const url = window.location.href; // In production, use your actual canonical URL
    const text = "Chúc mừng năm mới 2026! Nhận lời chúc Tết tại đây: ";
    
    // Use Native Share API if available (Best for Mobile)
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        navigator.share({
            title: 'Chúc Mừng Năm Mới 2026',
            text: text,
            url: url
        }).catch(err => console.log('Share failed:', err));
        return;
    }

    // Fallback for Desktop / Browsers without navigator.share
    let shareUrl = '';
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + url)}`;
            break;
        case 'zalo':
            // Zalo doesn't have a direct public share URL API easily accessible.
            // We'll prompt to copy link or open Zalo web.
            // Attempt deep link for mobile
            if (/Android|iPhone/i.test(navigator.userAgent)) {
                 alert("Đã sao chép liên kết! Hãy mở Zalo để dán và gửi cho bạn bè.");
                 navigator.clipboard.writeText(text + url);
                 window.location.href = "zalo://"; // Try opening app
                 return;
            } else {
                 shareUrl = `https://chat.zalo.me/`;
                 alert("Đã sao chép liên kết! Bạn có thể dán vào Zalo.");
                 navigator.clipboard.writeText(text + url);
            }
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank');
    }
}

// Bonus: Tiny confetti explosion when opening envelope (CSS/JS hybrid)
function confettiExplosion() {
    const colors = ['#f00', '#ffd700', '#0f0'];
    const envelope = document.querySelector('.lucky-money');
    
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '8px';
        confetti.style.height = '8px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = '50%';
        confetti.style.top = '50%';
        confetti.style.transition = 'all 1s ease-out';
        
        // Random destination
        const destX = (Math.random() - 0.5) * 200;
        const destY = (Math.random() - 0.5) * 200;
        
        envelope.appendChild(confetti);
        
        // Trigger animation
        requestAnimationFrame(() => {
            confetti.style.transform = `translate(${destX}px, ${destY}px) rotate(${Math.random() * 360}deg)`;
            confetti.style.opacity = '0';
        });

        // Cleanup
        setTimeout(() => confetti.remove(), 1000);
    }
}
