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

// === 4. LUCKY MONEY INTERACTION & DATA ===
const wishes = [
    "Tiền vào như nước sông Đà\nTiền ra nhỏ giọt như cà phê phin",
    "Sống khỏe như trâu\nSống dai như đỉa\nSống lâu như rùa",
    "Chúc bạn 12 tháng phú quý\n365 ngày phát tài\n8760 giờ sung túc",
    "Hay ăn chóng béo\nTiền nhiều như kẹo\nTình chặt như keo",
    "Vạn sự như ý\nTỷ sự như mơ\nTriệu triệu bất ngờ",
    "Năm mới năm me\nGia đình mạnh khỏe\nMọi người tươi trẻ",
    "Tân niên tân phúc tân phú quý\nTấn tài tấn lộc tấn bình an",
    "Cầu được ước thấy\nXuân mới vui vầy\nCái gì cũng hay!",
    "Lộc biếc, mai vàng, xuân hạnh phúc\nĐời vui, sức khỏe, tết an khang",
    "Tiền đầy túi\nTim đầy tình\nXăng đầy bình\nGạo đầy lu"
];

const envelopeElement = document.getElementById('lucky-money-container'); // Need to update HTML ID
const redEnvelope = document.querySelector('.red-envelope');
const luckyMessageContainer = document.querySelector('.lucky-message');
const messageContent = luckyMessageContainer.querySelector('p');
const luckyTitle = luckyMessageContainer.querySelector('h3');

let isEnvelopeOpen = false;

function getRandomWish() {
    return wishes[Math.floor(Math.random() * wishes.length)];
}

function openEnvelope() {
    if (isEnvelopeOpen) return;

    // 1. Animation State
    isEnvelopeOpen = true;
    redEnvelope.classList.add('open');

    // 2. Random Wish
    const wish = getRandomWish();
    // Wrap new lines in <br>
    messageContent.innerHTML = wish.replace(/\n/g, '<br>');
    luckyTitle.innerText = "Chúc Mừng Năm Mới!";

    // 3. Show Result
    luckyMessageContainer.classList.remove('hidden');

    // 4. Effects
    setTimeout(() => {
        luckyMessageContainer.classList.add('show');
        confettiExplosion();
        // Vibrate toggle
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }, 300);
}

// Reset function for testing or re-shaking
function resetEnvelope() {
    if (!isEnvelopeOpen) return;

    luckyMessageContainer.classList.remove('show');
    setTimeout(() => {
        luckyMessageContainer.classList.add('hidden');
        redEnvelope.classList.remove('open');
        isEnvelopeOpen = false;
    }, 300);
}

// Global exposure for HTML onclick
window.openEnvelope = openEnvelope;

// === 5. SHAKE MOTION SENSOR ===
let lastX = 0, lastY = 0, lastZ = 0;
let lastShakeTime = 0;
const SHAKE_THRESHOLD = 15; // Validation needed on real device, 15 is reasonable for "deliberate shake"

function initMotionSensor() {
    // Check if Request Permission is needed (iOS 13+)
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        // Show a helper UI or just bind to first click (Best UX: Bind to a "Shake Enable" button or the Envelope click)
        // For now, we assume user clicks the envelope/page content first.
        // We will expose a visible button in HTML to enable this explicitly.
    } else if ('ondevicemotion' in window) {
        window.addEventListener('devicemotion', handleMotion, false);
    }
}

function requestMotionPermission() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', handleMotion, false);
                    alert("Đã bật tính năng Lắc điện thoại! 📳");
                    // Hide permission button if exists
                    const btn = document.getElementById('btn-enable-shake');
                    if (btn) btn.style.display = 'none';
                } else {
                    alert("Bạn đã từ chối quyền cảm biến. Hãy bật lại trong cài đặt Safari.");
                }
            })
            .catch(console.error);
    } else {
        alert("Thiết bị của bạn không cần cấp quyền hoặc không hỗ trợ.");
    }
}
window.requestMotionPermission = requestMotionPermission;

function handleMotion(event) {
    const current = event.accelerationIncludingGravity;
    if (!current) return;

    const currentTime = new Date().getTime();
    if ((currentTime - lastShakeTime) < 1500) return; // Debounce 1.5s

    const deltaX = Math.abs(lastX - current.x);
    const deltaY = Math.abs(lastY - current.y);
    const deltaZ = Math.abs(lastZ - current.z);

    if ((deltaX > SHAKE_THRESHOLD && deltaY > SHAKE_THRESHOLD) ||
        (deltaX > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD) ||
        (deltaY > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD)) {

        // Shake Detected!
        lastShakeTime = currentTime;
        onShakeDetected();
    }

    lastX = current.x;
    lastY = current.y;
    lastZ = current.z;
}

function onShakeDetected() {
    console.log("Shake detected!");

    // Add CSS Shake visual to body
    document.body.classList.add('shaking');
    setTimeout(() => document.body.classList.remove('shaking'), 500);

    // Interaction
    if (!isEnvelopeOpen) {
        // Scroll to envelope if valid
        const section = document.getElementById('lucky');
        if (section) section.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => openEnvelope(), 500);
    } else {
        // If already open, shake to get a NEW wish?
        // Let's do a reset-then-open effect specifically for Shake
        luckyMessageContainer.classList.remove('show');
        setTimeout(() => {
            const wish = getRandomWish();
            messageContent.innerHTML = wish.replace(/\n/g, '<br>');
            luckyMessageContainer.classList.add('show');
            confettiExplosion();
            if (navigator.vibrate) navigator.vibrate(200);
        }, 300);
    }
}

// Initialize
initMotionSensor();

// === 6. SHARING LOGIC ===
// (Keep existing code but ensure 'shareTo' is correct)
function shareTo(platform) {
    // ... existing code ...
    const url = window.location.href;
    const text = "Chúc mừng năm mới 2026! Nhận lì xì ngay: ";

    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        navigator.share({
            title: 'Chúc Mừng Năm Mới 2026',
            text: text,
            url: url
        }).catch(err => console.log('Share failed:', err));
        return;
    }

    let shareUrl = '';
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + url)}`;
            break;
        case 'zalo':
            if (/Android|iPhone/i.test(navigator.userAgent)) {
                navigator.clipboard.writeText(text + url);
                alert("Đã sao chép! Mở Zalo để gửi ngay.");
                window.location.href = "zalo://";
                return;
            } else {
                shareUrl = `https://chat.zalo.me/`;
                navigator.clipboard.writeText(text + url);
                alert("Đã sao chép liên kết!");
            }
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank');
    }
}

// ... Confetti (Keep existing) ...

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
