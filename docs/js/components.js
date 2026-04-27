/**
 * MotoLog Documentation Components
 * Handles reusable Header and Footer injection
 */

const components = {
  navbar: `
    <nav class="navbar" id="navbar">
        <div class="container">
            <a href="index.html" class="logo">
                <span class="logo-icon"><i data-lucide="bike"></i></span>
                <span class="logo-text">MotoLog</span>
            </a>
            <ul class="nav-links">
                <li><a href="index.html#features">Fitur</a></li>
                <li><a href="index.html#motoai">MotoAI</a></li>
                <li><a href="index.html#screenshots">Tampilan</a></li>
                <li><a href="index.html#tech">Teknologi</a></li>
                <li><a href="https://github.com/rukys/motolog" class="btn-github"><i data-lucide="github"></i> GitHub</a></li>
            </ul>
            <button class="hamburger" id="hamburger" aria-label="Menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </nav>

    <div class="mobile-menu" id="mobileMenu">
        <a href="index.html#features" class="mobile-link">Fitur</a>
        <a href="index.html#motoai" class="mobile-link">MotoAI</a>
        <a href="index.html#screenshots" class="mobile-link">Tampilan</a>
        <a href="index.html#tech" class="mobile-link">Teknologi</a>
        <a href="https://github.com/rukys/motolog">GitHub</a>
    </div>
    `,
  footer: `
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <div class="logo">
                        <span class="logo-icon"><i data-lucide="bike"></i></span>
                        <span class="logo-text">MotoLog</span>
                    </div>
                    <p class="brand-desc">Asisten cerdas untuk manajemen perawatan motor yang lebih teratur dan efisien.</p>
                    <div class="social-links">
                        <a href="https://github.com/rukys" target="_blank" class="social-icon" title="GitHub">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                        </a>
                        <a href="https://www.linkedin.com/in/rukys" target="_blank" class="social-icon" title="LinkedIn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                        <a href="mailto:sektyawan33@gmail.com" class="social-icon" title="Email"><i data-lucide="mail"></i></a>
                        <a href="https://rukysektiawan.vercel.app/" target="_blank" class="social-icon" title="Portfolio"><i data-lucide="globe"></i></a>
                    </div>
                </div>
                
                <div class="footer-links">
                    <h4>Menu Utama</h4>
                    <ul>
                        <li><a href="index.html#features">Fitur Utama</a></li>
                        <li><a href="index.html#motoai">MotoAI Assistant</a></li>
                        <li><a href="index.html#screenshots">Tampilan Aplikasi</a></li>
                        <li><a href="index.html#tech">Teknologi</a></li>
                    </ul>
                </div>
                
                <div class="footer-links">
                    <h4>Tentang Kami</h4>
                    <ul>
                        <li><a href="https://github.com/rukys/motolog">Dokumentasi</a></li>
                        <li><a href="guide.html">Panduan Pengguna</a></li>
                        <li><a href="privacy.html">Privasi & Kebijakan</a></li>
                        <li><a href="mailto:sektyawan33@gmail.com">Kontak Kami</a></li>
                    </ul>
                </div>
                
                <div class="footer-cta">
                    <h4>Siap untuk berkendara?</h4>
                    <p>Unduh MotoLog sekarang juga!</p>
                    <a href="https://github.com/rukys/motolog" class="btn-primary btn-sm"><i data-lucide="github"></i> Download App</a>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2026 MotoLog by Rukysektiawan. Dibuat dengan ❤️ untuk Riders Indonesia.</p>
            </div>
        </div>
    </footer>
    `,
};

function injectComponents() {
  const navPlaceholder = document.getElementById('navbar-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  if (navPlaceholder) {
    navPlaceholder.innerHTML = components.navbar;
  }

  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = components.footer;
  }

  // Highlight active link based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a, .footer-links a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  // Re-initialize Lucide icons for injected content
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Execute immediately or on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectComponents);
} else {
  injectComponents();
}
