// interactivity.js - Added for Enhanced 3D and Sound Interactivity

// 1. Web Audio API for interactive sounds
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  
  if (type === 'hover') {
    // Soft tick sound for hover
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    gainNode.gain.setValueAtTime(0.02, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    oscillator.start(now);
    oscillator.stop(now + 0.05);
  } else if (type === 'click') {
    // Pleasant pop sound for click
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  } else if (type === 'success') {
    // Success chime for registration
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, now); // A4
    oscillator.frequency.setValueAtTime(554.37, now + 0.1); // C#5
    oscillator.frequency.setValueAtTime(659.25, now + 0.2); // E5
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
    oscillator.start(now);
    oscillator.stop(now + 0.4);
  }
}

// Initialize interactivity once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {

  // 2. Add Audio Feedback to Buttons and Links
  const interactiveElements = document.querySelectorAll('button, a, select, input[type="checkbox"], .glass-panel');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => playSound('hover'));
    if(el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT') {
      el.addEventListener('click', () => playSound('click'));
    }
  });

  // Hook into form submission for success sound (assuming the button triggers the event, but we can also just wait for the toast)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.id === 'toastNotification' && !mutation.target.classList.contains('opacity-0')) {
        playSound('success');
      }
    });
  });
  
  const toastEl = document.getElementById('toastNotification');
  if (toastEl) {
    observer.observe(toastEl, { attributes: true, attributeFilter: ['class'] });
  }

  // 3. Initialize 3D Tilt Effect using VanillaTilt (imported via CDN in HTML)
  // Apply to cards and panels to make them interactive 3D images/elements
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('.glass-panel'), {
      max: 10,
      speed: 400,
      glare: true,
      "max-glare": 0.2,
      scale: 1.02
    });
    
    // Also add tilt to the images
    VanillaTilt.init(document.querySelectorAll('img'), {
      max: 15,
      speed: 300,
      scale: 1.05
    });
  }
  
  // 4. Add floating action button (Interactive Demo/Help)
  const fab = document.createElement('button');
  fab.innerHTML = '<i data-lucide="sparkles" class="w-6 h-6"></i>';
  fab.className = 'fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 text-white shadow-xl shadow-sky-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all';
  fab.title = 'Interactive Sparkles!';
  fab.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
  
  fab.addEventListener('click', () => {
    playSound('success');
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.9, x: 0.1 }
      });
    }
  });
  
  document.body.appendChild(fab);
  if (window.lucide) window.lucide.createIcons();
});
