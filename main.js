// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
  if (theme === 'dark') {
    themeIcon.classList.replace('fa-moon', 'fa-sun');
  } else {
    themeIcon.classList.replace('fa-sun', 'fa-moon');
  }
}

// Sticky Header Logic
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('sticky');
  } else {
    header.classList.remove('sticky');
  }
});

// Mobile Menu Logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');
const overlay = document.getElementById('overlay');
const closeMenu = document.getElementById('close-menu');

function toggleMenu() {
  mobileNav.classList.toggle('active');
  overlay.classList.toggle('active');
}

mobileMenuBtn.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);
if (closeMenu) closeMenu.addEventListener('click', toggleMenu);

// Hero Slider Logic
const slides = document.querySelectorAll('.slide');
if (slides.length > 0) {
  let currentSlide = 0;
  function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }
  setInterval(nextSlide, 5000);
}

// WhatsApp Message Generator
function sendWhatsApp(productName = '') {
  const phone = '919000000000'; // Placeholder - user should update
  let message = "Hi, I'm interested in your furniture products.";
  if (productName) {
    message = `Hi, I'm interested in the ${productName} I saw on your website.`;
  }
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

window.sendWhatsApp = sendWhatsApp;
