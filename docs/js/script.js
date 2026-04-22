document.addEventListener('DOMContentLoaded', () => {
  // Reveal animations on scroll
  const observerOptions = {
    threshold: 0.1,
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Apply reveal to sections
  document
    .querySelectorAll('section, .hero-content, .hero-image')
    .forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.8s ease-out';
      observer.observe(el);
    });

  // Handle Reveal logic on scroll
  const handleScroll = () => {
    document
      .querySelectorAll('section, .hero-content, .hero-image')
      .forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      });
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') {
        return;
      }

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
        });
      }
    });
  });

  // Navbar transparency logic
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(10, 10, 10, 0.95)';
      navbar.style.padding = '10px 0';
    } else {
      navbar.style.background = 'rgba(10, 10, 10, 0.8)';
      navbar.style.padding = '0';
    }
  });

  // Screenshot Slider Navigation
  const slider = document.getElementById('screenshotSlider');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (slider && prevBtn && nextBtn) {
    nextBtn.addEventListener('click', () => {
      const scrollAmount = slider.clientWidth * 0.8;
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
      const scrollAmount = slider.clientWidth * 0.8;
      slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
  }

  // Ensure Lucide icons are initialized
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
