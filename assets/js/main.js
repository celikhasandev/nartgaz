// ====================================================================================
// 1. BÖLÜM: DİNAMİK BİLEŞEN YÜKLEYİCİ & AKILLI YOL DÜZELTME MOTORU
// ====================================================================================
function nartBilesenleriYukle() {
  const prefix = window.location.pathname.includes('/products/') ? '../' : '';

  return fetch(prefix + 'components/header.html')
    .then(response => {
      if (!response.ok) throw new Error('Header dosyası bulunamadı.');
      return response.text();
    })
    .then(headerHtml => {
      const headerContainer = document.getElementById('nart-header');
      if (headerContainer) {
        headerContainer.innerHTML = headerHtml;

        if (prefix) {
          headerContainer.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('../')) {
              img.setAttribute('src', prefix + src);
            }
          });
          headerContainer.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('javascript') && !href.startsWith('#') && !href.startsWith('../')) {
              link.setAttribute('href', prefix + href);
            }
          });
        }
      }

      // Aktif Menü Linki Tespiti
      const currentPage = window.location.pathname.split("/").pop() || "index.html";
      const currentHash = window.location.hash;

      document.querySelectorAll("#nav > li > a").forEach(link => {
        let href = link.getAttribute("href");
        if (!href) return;

        if (prefix && href.startsWith(prefix)) { href = href.substring(prefix.length); }
        const hrefPage = href.split('#')[0] || "index.html";
        const hrefHash = href.includes('#') ? href.substring(href.indexOf('#')) : '';

        link.classList.remove("active");

        if (currentPage === "index.html") {
          if (currentHash && hrefHash === currentHash) link.classList.add("active");
          else if (!currentHash && hrefHash === "#home") link.classList.add("active");
        } else if (hrefPage === currentPage) {
          link.classList.add("active");
        }
      });

      // Megamenü Hover
      const megaIcon = document.getElementById('nart-mega-preview-icon');
      const megaImg = document.getElementById('nart-mega-preview-img');
      const megaText = document.getElementById('nart-mega-preview-text');

      if (megaIcon && megaImg && megaText) {
        document.querySelectorAll('.nart-mega-link').forEach(link => {
          link.addEventListener('mouseenter', function() {
            const targetImg = this.getAttribute('data-preview');
            const currentLang = localStorage.getItem('nart_secilen_dil') || 'tr';
            const targetTitle = currentLang === 'en'
              ? (this.getAttribute('data-en-title') || this.getAttribute('data-title'))
              : this.getAttribute('data-title');

            if (targetImg) {
              megaIcon.style.display = 'none';
              megaImg.src = prefix + targetImg;
              megaImg.style.display = 'block';
            }
            if (targetTitle) {
              megaText.textContent = targetTitle;
            }
          });
        });

        const megaMenuContainer = document.querySelector('.megamenu');
        if (megaMenuContainer) {
          megaMenuContainer.addEventListener('mouseleave', function() {
            megaIcon.style.display = 'none';
            megaImg.src = prefix + 'assets/img/hero/nartgaz-1.png';
            megaImg.style.display = 'block';

            const currentLang = localStorage.getItem('nart_secilen_dil') || 'tr';
            megaText.textContent = (currentLang === 'en')
              ? (megaText.getAttribute('data-en') || "Our Products")
              : (megaText.getAttribute('data-tr') || "Ürün Gruplarımız");
          });
        }
      }

      // 📱 KİLİTLENMEYİ ENGELLEYEN RESPONSIVE MOBİL AKORDEON MOTORU
      const nartNavRoot = document.getElementById('nav');
      if (nartNavRoot) {
        nartNavRoot.addEventListener('click', function(e) {
          if (window.innerWidth >= 992) return;

          // 1. Ana Menü Başlıkları (Ürünlerimiz & Hizmetler) Mobilde Tıklanınca Aç/Kapa
          const dropdownToggle = e.target.closest('.nav-item.dropdown > .dropdown-toggle');
          if (dropdownToggle) {
            e.preventDefault();
            e.stopPropagation();

            const parentDropdown = dropdownToggle.closest('.nav-item.dropdown');
            const targetMegamenu = parentDropdown.querySelector('.dropdown-menu');

            if (targetMegamenu) {
              // Diğer açık ana dropdown varsa kapat
              document.querySelectorAll('#nav .nav-item.dropdown').forEach(item => {
                if (item !== parentDropdown) {
                  item.classList.remove('show');
                  const otherMenu = item.querySelector('.dropdown-menu');
                  if (otherMenu) otherMenu.classList.remove('show');
                }
              });

              parentDropdown.classList.toggle('show');
              targetMegamenu.classList.toggle('show');
            }
            return;
          }

          // 2. Alt İstasyon ve Regülatör Akordeonları (RMS-B, RMS-C vb.)
          const toggleLink = e.target.closest('.has-sub-sub > a');
          if (toggleLink) {
            e.preventDefault();
            e.stopPropagation();

            const parentLi = toggleLink.parentElement;
            const subSubMenu = parentLi.querySelector('.sub-sub-menu');

            if (subSubMenu) {
              parentLi.parentElement.querySelectorAll('.has-sub-sub').forEach(li => {
                if (li !== parentLi) {
                  li.classList.remove('active-toggle');
                  const otherMenu = li.querySelector('.sub-sub-menu');
                  if (otherMenu) otherMenu.classList.remove('open-sub');
                }
              });
              parentLi.classList.toggle('active-toggle');
              subSubMenu.classList.toggle('open-sub');
            }
          }
        });
      }
    })
    .then(() => {
      return fetch(prefix + 'components/footer.html')
        .then(response => response.text())
        .then(footerHtml => {
          const footerContainer = document.getElementById('nart-footer');
          if (footerContainer) {
            footerContainer.innerHTML = footerHtml;

            if (prefix) {
              footerContainer.querySelectorAll('img').forEach(img => {
                const src = img.getAttribute('src');
                if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('../')) {
                  img.setAttribute('src', prefix + src);
                }
              });
              footerContainer.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('javascript') && !href.startsWith('#') && !href.startsWith('../')) {
                  link.setAttribute('href', prefix + href);
                }
              });
            }
          }
        });
    })
    .then(() => {
      return fetch(prefix + 'components/cookie.html')
        .then(response => {
          if (!response.ok) throw new Error('Cookie dosyası bulunamadı.');
          return response.text();
        })
        .then(cookieHtml => {
          if (!document.getElementById('nart-cookie-wrapper')) {
            const cookieWrapper = document.createElement('div');
            cookieWrapper.id = 'nart-cookie-wrapper';
            cookieWrapper.innerHTML = cookieHtml;
            document.body.appendChild(cookieWrapper);
          }
        });
    });
}

// ====================================================================================
// 2. BÖLÜM: BELLEK DOSTU TEMA & SCROLL MOTORU (THROTTLED & OPTIMIZED)
// ====================================================================================
function initOrijinalTemaMekanizmasi() {
  const prefix = window.location.pathname.includes('/products/') ? '../' : '';

  setTimeout(() => {
    const preloader = document.querySelector(".preloader");
    if (preloader) { preloader.style.opacity = "0"; preloader.style.display = "none"; }
  }, 300);

  // Performanslı Scroll (requestAnimationFrame ile RAM sızıntısı engellendi)
  let isScrolling = false;
  const header_navbar = document.querySelector(".navbar-area");
  const logo = document.querySelector(".navbar-brand img");
  const scrollText = document.querySelector(".scroll-only-text");
  const backToTop = document.querySelector(".scroll-top");
  const sections = Array.from(document.querySelectorAll(".page-scroll"))
    .map(link => {
      const href = link.getAttribute("href");
      if (href && href.includes("#")) {
        const target = document.querySelector(href.substring(href.indexOf('#')));
        return target ? { link, target } : null;
      }
      return null;
    })
    .filter(Boolean);

  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        const scrollPos = window.pageYOffset || document.documentElement.scrollTop;

        // Sticky Navbar & Logo
        if (header_navbar && logo) {
          if (scrollPos > 50) {
            header_navbar.classList.add("sticky");
            logo.src = prefix + "assets/img/logo/nart_renkli.svg";
            if (scrollText) scrollText.style.display = "inline-block";
          } else {
            header_navbar.classList.remove("sticky");
            logo.src = prefix + "assets/img/logo/nart_beyaz.svg";
            if (scrollText) scrollText.style.display = "none";
          }
        }

        // Back to top butonu
        if (backToTop) {
          backToTop.style.display = scrollPos > 200 ? "flex" : "none";
        }

        // Scroll Spy
        const scrollWithOffset = scrollPos + 100;
        for (let i = sections.length - 1; i >= 0; i--) {
          const item = sections[i];
          if (item.target.offsetTop <= scrollWithOffset) {
            document.querySelectorAll(".page-scroll.active").forEach(el => el.classList.remove("active"));
            item.link.classList.add("active");
            break;
          }
        }

        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  // Sayfalar arası pürüzsüz kaydırma
  document.querySelectorAll(".page-scroll").forEach((elem) => {
    elem.addEventListener("click", (e) => {
      e.preventDefault();
      const targetAttr = elem.getAttribute("href");
      const hashIndex = targetAttr.indexOf('#');
      const hash = hashIndex !== -1 ? targetAttr.substring(hashIndex) : '';

      if (hash) {
        const targetSection = document.querySelector(hash);
        if (targetSection) {
          const offsetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        } else {
          window.location.href = prefix + "index.html" + hash;
        }
      } else {
        window.location.href = prefix + targetAttr;
      }
    });
  });

  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarCollapse = document.querySelector(".navbar-collapse");
  if (navbarToggler && navbarCollapse) {
    document.querySelectorAll(".page-scroll").forEach(e =>
      e.addEventListener("click", () => {
        navbarToggler.classList.remove("active");
        navbarCollapse.classList.remove("show");
      })
    );
    navbarToggler.addEventListener("click", () => navbarToggler.classList.toggle("active"));
  }

  if (typeof WOW !== 'undefined') { new WOW().init(); }
  const heroCarousel = document.querySelector('#nartHeroSlider');
  if (heroCarousel && !bootstrap.Carousel.getInstance(heroCarousel)) {
    new bootstrap.Carousel(heroCarousel, { interval: 5000, pause: 'hover', wrap: true });
  }
}

// ====================================================================================
// 3. BÖLÜM: ÇEREZ SİSTEMİ
// ====================================================================================
const COOKIE_CONSENT_KEY = 'çerez_kabul_edildi';

window.toggleCookieModal = function() {
  const modalElement = document.getElementById('çerezAyarlariModal');
  if (!modalElement) return;
  let modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
  if (modalElement.classList.contains('show')) { modalInstance.hide(); } else { updateModalSwitchesFromStorage(); modalInstance.show(); }
};

window.checkCookieConsent = function() {
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  const banner = document.getElementById('çerez-uyarisi-banner');
  if (!consent && banner) banner.style.display = 'block';
};

window.acceptAllCookiesShort = function() { setCookieConsentShort({ gerekli: true, analitik: true, reklam: true, pazarlama: true }); };
window.acceptNecessaryCookiesShort = function() { setCookieConsentShort({ gerekli: true, analitik: false, reklam: false, pazarlama: false }); };

function setCookieConsentShort(settings) {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(settings));
  const banner = document.getElementById('çerez-uyarisi-banner');
  if (banner) banner.style.display = 'none';
}

function updateModalSwitchesFromStorage() {
  const settings = getCookieSettings();
  const chkGerekli = document.getElementById('checkGerekli');
  const chkAnalitik = document.getElementById('checkAnalitik');
  const chkReklam = document.getElementById('checkReklam');
  const chkPazarlama = document.getElementById('checkPazarlama');

  if (chkGerekli) chkGerekli.checked = settings.gerekli;
  if (chkAnalitik) chkAnalitik.checked = settings.analitik;
  if (chkReklam) chkReklam.checked = settings.reklam;
  if (chkPazarlama) chkPazarlama.checked = settings.pazarlama;
}

window.saveCookieSettings = function() {
  const chkAnalitik = document.getElementById('checkAnalitik');
  const chkReklam = document.getElementById('checkReklam');
  const chkPazarlama = document.getElementById('checkPazarlama');

  const settings = {
    gerekli: true,
    analitik: chkAnalitik ? chkAnalitik.checked : false,
    reklam: chkReklam ? chkReklam.checked : false,
    pazarlama: chkPazarlama ? chkPazarlama.checked : false
  };

  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(settings));
  const banner = document.getElementById('çerez-uyarisi-banner');
  if (banner) banner.style.display = 'none';

  const modalElement = document.getElementById('çerezAyarlariModal');
  if (modalElement) {
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();
  }
};

function getCookieSettings() {
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (consent) { try { return JSON.parse(consent); } catch (e) { return { gerekli: true, analitik: false, reklam: false, pazarlama: false }; } }
  return { gerekli: true, analitik: false, reklam: false, pazarlama: false };
}

// ====================================================================================
// 4. BÖLÜM: BELLEK DOSTU DİL MOTORU (8 DİL)
// ====================================================================================
const NART_LANG_KEY = 'nart_secilen_dil';

window.nartDilDegistir = function(dil) {
  localStorage.setItem(NART_LANG_KEY, dil);
  nartDiliUygula(dil);
};

function nartDiliUygula(dil) {
  const elements = document.querySelectorAll('[data-en], [data-ru], [data-ar], [data-zh], [data-es], [data-it], [data-hi]');
  elements.forEach(el => {
    const isSvgText = el.tagName.toLowerCase() === 'text';

    if (!el.getAttribute('data-tr')) {
      el.setAttribute('data-tr', isSvgText ? el.textContent : el.innerHTML);
    }

    let targetContent = (dil === 'tr') ? el.getAttribute('data-tr') : el.getAttribute('data-' + dil);
    if (!targetContent && dil !== 'tr') {
      targetContent = el.getAttribute('data-en') || el.getAttribute('data-tr');
    }

    if (targetContent) {
      if (isSvgText) {
        el.textContent = targetContent;
      } else if (targetContent.includes('<')) {
        el.innerHTML = targetContent;
      } else {
        el.textContent = targetContent;
      }
    }
  });

  const inputs = document.querySelectorAll('[data-en-placeholder], [data-ru-placeholder], [data-ar-placeholder], [data-zh-placeholder], [data-es-placeholder], [data-it-placeholder], [data-hi-placeholder]');
  inputs.forEach(input => {
    if (!input.getAttribute('data-tr-placeholder')) {
      input.setAttribute('data-tr-placeholder', input.getAttribute('placeholder') || '');
    }

    let targetPlaceholder = (dil === 'tr') ? input.getAttribute('data-tr-placeholder') : input.getAttribute('data-' + dil + '-placeholder');
    if (!targetPlaceholder && dil !== 'tr') {
      targetPlaceholder = input.getAttribute('data-en-placeholder') || input.getAttribute('data-tr-placeholder');
    }

    if (targetPlaceholder) {
      input.setAttribute('placeholder', targetPlaceholder);
    }
  });

  const textEl = document.getElementById('nart-active-lang-text');
  if (textEl) {
    const flags = {
      tr: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle;"><rect width="1200" height="800" fill="#e30a17"/><circle cx="400" cy="400" r="200" fill="#fff"/><circle cx="450" cy="400" r="160" fill="#e30a17"/><polygon points="575,400 516.2,419.1 552.5,369.1 552.5,430.9 516.2,380.9" fill="#fff"/></svg>',
      en: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle;"><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30M60 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" stroke-width="2"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></svg>',
      ru: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle;"><rect width="900" height="600" fill="#fff"/><rect width="900" height="400" y="200" fill="#0039a6"/><rect width="900" height="200" y="400" fill="#d52b1e"/></svg>',
      ar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle;"><rect width="3" height="2" fill="#fff"/><rect width="3" height="0.66" fill="#731412"/><rect width="3" height="0.66" y="1.33" fill="#000"/><path d="M 0,0 L 0.75,1 L 0,2 Z" fill="#114a2b"/></svg>',
      zh: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle;"><rect width="30" height="20" fill="#de2110"/><path d="M5 5L3.4 6.2l.6-1.9-1.6-1.2h2l.6-1.9.6 1.9h2l-1.6 1.2.6 1.9zm5-2.5l-.2 1 .4-.9.7.5-.9.1.2 1-.5-.8-.8.6.6-.7-.5-.8h1zm2 2.5l-.6.8.1-1 .9.2-.8-.6.6-.8-.3.9-.9-.5.9-.2zm1 3l-.9.4.5-.8.6.7-.9-.1-.2 1-.1-.9-.9.4.8-.5zm-3 2l-.9-.4.9-.1-.1-.9.6.8.9-.5-.5.9.6.7-1-.1z" fill="#ffde00"/></svg>',
      es: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle;"><rect width="3" height="2" fill="#c60b1e"/><rect width="3" height="1" y="0.5" fill="#ffc400"/></svg>',
      it: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle;"><rect width="1" height="2" fill="#009246"/><rect width="1" height="2" x="1" fill="#fff"/><rect width="1" height="2" x="2" fill="#ce2b37"/></svg>',
      hi: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle;"><rect width="900" height="600" fill="#f93"/><rect width="900" height="400" y="200" fill="#fff"/><rect width="900" height="200" y="400" fill="#128807"/><circle cx="450" cy="300" r="90" fill="none" stroke="#008" stroke-width="12"/></svg>'
    };
    const currentLang = dil.toLowerCase();
    textEl.innerHTML = (flags[currentLang] || '') + currentLang.toUpperCase();
  }

  const rmsGorsel = document.getElementById('nart-rms-gorsel');
  if (rmsGorsel) {
    const prefix = window.location.pathname.includes('/products/') ? '../' : '';
    rmsGorsel.setAttribute('src', prefix + 'assets/img/rms/rms-' + dil.toLowerCase() + '.svg');
  }
}

document.addEventListener("DOMContentLoaded", function() {
  nartBilesenleriYukle()
    .then(() => {
      initOrijinalTemaMekanizmasi();
      window.checkCookieConsent();

      const defaultLang = localStorage.getItem('nart_secilen_dil') || 'tr';
      nartDiliUygula(defaultLang);
    })
    .catch(err => { console.error("Sistem başlatma hatası:", err); });
});