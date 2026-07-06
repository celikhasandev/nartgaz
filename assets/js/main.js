// ====================================================================================
// 1. BÖLÜM: DİNAMİK BİLEŞEN YÜKLEYİCİ & AKILLI YOL DÜZELTME MOTORU (ROUTE AUTO-FIX)
// ====================================================================================
function nartBilesenleriYukle() {
  // 🌐 KLASÖR DERİNLİK KALKANI: Eğer /products/ klasöründeysek otomatik '../' prefix üretir
  const prefix = window.location.pathname.includes('/products/') ? '../' : '';

  // 1. Üst Menüyü (Header) İnternetten Çekiyoruz
  return fetch(prefix + 'components/header.html')
    .then(response => {
      if (!response.ok) throw new Error('Header dosyası bulunamadı.');
      return response.text();
    })
    .then(headerHtml => {
      const headerContainer = document.getElementById('nart-header');
      if (headerContainer) {
        headerContainer.innerHTML = headerHtml;

        // Eğer alt klasördeysek header içindeki tüm göreli resim ve link yollarını otomatik tamir et
        if (prefix) {
          // Logoları ve görselleri düzelt (products/assets/... hatasını engeller)
          headerContainer.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('../')) {
              img.setAttribute('src', prefix + src);
            }
          });
          // Menü linklerini düzelt (products/certificates.html hatasını kökten çözer)
          headerContainer.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('javascript') && !href.startsWith('#') && !href.startsWith('../')) {
              link.setAttribute('href', prefix + href);
            }
          });
        }
      }

      // 🌟 FIX: Nokta Atışı Kök Link Aktiflik Kontrolü (Çoklu Çizgi Hatası Çözüldü)
      const currentPage = window.location.pathname.split("/").pop() || "index.html";
      const currentHash = window.location.hash;

      document.querySelectorAll("#nav > li > a").forEach(link => {
        let href = link.getAttribute("href");
        if (!href) return;

        // Eğer alt klasör kalkanı linkin başına '../' eklediyse temizle ki saf karşılaştırma yapalım
        if (prefix && href.startsWith(prefix)) { href = href.substring(prefix.length); }

        // Link yollarını parçala (Örn: 'index.html#why' -> Sayfa: 'index.html', Hash: '#why')
        const hrefPage = href.split('#')[0] || "index.html";
        const hrefHash = href.includes('#') ? href.substring(href.indexOf('#')) : '';

        // İlk yüklemede kafasına göre eklenen tüm aktif sınıflarını temizle
        link.classList.remove("active");

        if (currentPage === "index.html") {
          // Eğer ana sayfadaysak ve adreste özel bir hash (#why vb.) varsa sadece onu yakala
          if (currentHash) {
            if (hrefHash === currentHash) link.classList.add("active");
          } else {
            // Eğer doğrudan logoya basıp düz ana sayfaya geldiysek SADECE Anasayfa (#home) çizilsin
            if (hrefHash === "#home") link.classList.add("active");
          }
        } else {
          // Diğer iç sayfalardaysak (about.html, certificates.html vb.) tam dosya adı eşleşmesine bak
          if (hrefPage === currentPage) {
            link.classList.add("active");
          }
        }
      });

      // 🌐 DİL DUYARLI MEGAMENÜ TAKİP MOTORU
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
              megaImg.src = prefix + targetImg; // Alt klasör görsel önizleme fix'i
              megaImg.style.display = 'block';
            }
            if (targetTitle) {
              megaText.textContent = targetTitle;
            }
          });
        });

        // Mouse megamenü dışına çıktığında varsayılan fabrika görseline geri döndürme motoru
        const megaMenuContainer = document.querySelector('.megamenu');
        if (megaMenuContainer) {
          megaMenuContainer.addEventListener('mouseleave', function() {
            // İkonu gizli tutuyoruz, resim alanına default görselimizi basıyoruz
            megaIcon.style.display = 'none';
            megaImg.src = prefix + 'assets/img/hero/nartgaz-1.png'; // Alt klasör korumalı yol yapısı
            megaImg.style.display = 'block';

            const currentLang = localStorage.getItem('nart_secilen_dil') || 'tr';
            if (currentLang === 'en') {
              megaText.textContent = megaText.getAttribute('data-en') || "Our Products";
            } else {
              megaText.textContent = megaText.getAttribute('data-tr') || "Ürün Gruplarımız";
            }
          });
        }
      }

      // 📱 RESPONSIVE MOBİL AKORDEON MOTORU
      const nartNavRoot = document.getElementById('nav');
      if (nartNavRoot) {
        nartNavRoot.addEventListener('click', function(e) {
          const toggleLink = e.target.closest('.has-sub-sub > a');
          if (toggleLink && window.innerWidth < 992) {
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
      // 2. Alt Bilgiyi (Footer) Çekiyoruz
      return fetch(prefix + 'components/footer.html')
        .then(response => response.text())
        .then(footerHtml => {
          const footerContainer = document.getElementById('nart-footer');
          if (footerContainer) {
            footerContainer.innerHTML = footerHtml;

            // 🌟 SİHİRLİ DOKUNUŞ: Alt klasördeysek footer içindeki logo resmini ve linkleri otomatik tamir et
            if (prefix) {
              // Footer içi resimleri tamir et (Kırık beyaz logo sorununu kökten çözer)
              footerContainer.querySelectorAll('img').forEach(img => {
                const src = img.getAttribute('src');
                if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('../')) {
                  img.setAttribute('src', prefix + src);
                }
              });

              // Footer içi linkleri tamir et
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
      // 3. Çerez Sözleşmesini (Cookie) Çekiyoruz
      return fetch(prefix + 'components/cookie.html')
        .then(response => {
          if (!response.ok) throw new Error('Cookie HTML dosyası bulunamadı.');
          return response.text();
        })
        .then(cookieHtml => {
          const cookieWrapper = document.createElement('div');
          cookieWrapper.id = 'nart-cookie-wrapper';
          cookieWrapper.innerHTML = cookieHtml;
          document.body.appendChild(cookieWrapper);
        });
    });
}

// ====================================================================================
// 2. BÖLÜM: ORİJİNAL TEMA FONKSİYONLARI (SCROLL VE ÇAPRAZ SAYFA GEÇİŞ ÇÖZÜMÜ)
// ====================================================================================
function initOrijinalTemaMekanizmasi() {
  // 🌟 FIX: Prefix değişkenini en tepeye taşıdık ki çapraz link kalkanı hata vermesin
  const prefix = window.location.pathname.includes('/products/') ? '../' : '';

  window.setTimeout(fadeout, 500);
  function fadeout() {
    const preloader = document.querySelector(".preloader");
    if(preloader) { preloader.style.opacity = "0"; preloader.style.display = "none"; }
  }

  // Sticky Navbar Efekti & Aşağı Kaydırınca Derinlik Uyumlu Logo Değişimi
  window.onscroll = function () {
    const header_navbar = document.querySelector(".navbar-area");
    const logo = document.querySelector(".navbar-brand img");
    const scrollText = document.querySelector(".scroll-only-text");
    const backToTo = document.querySelector(".scroll-top");

    if(header_navbar && logo) {
      const sticky = header_navbar.offsetTop || 0;
      if (window.pageYOffset > sticky) {
          header_navbar.classList.add("sticky");
          logo.src = prefix + "assets/img/logo/nart_renkli.svg";
          if(scrollText) scrollText.style.display = "inline-block";
      } else {
          header_navbar.classList.remove("sticky");
          logo.src = prefix + "assets/img/logo/nart_beyaz.svg";
          if(scrollText) scrollText.style.display = "none";
      }
    }

    if(backToTo) {
      if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        backToTo.style.display = "flex";
      } else {
        backToTo.style.display = "none";
      }
    }
  };

  // 🌟 SİHİRLİ DOKUNUŞ: Sayfalar Arası Çapraz Geçişli Smooth Scroll Mekanizması
  const pageLink = document.querySelectorAll(".page-scroll");
  pageLink.forEach((elem) => {
    elem.addEventListener("click", (e) => {
      e.preventDefault();
      const targetAttr = elem.getAttribute("href");

      // Linkin içindeki hash'i (#contact, #why) tespit edelim
      const hashIndex = targetAttr.indexOf('#');
      const hash = hashIndex !== -1 ? targetAttr.substring(hashIndex) : '';

      if (hash) {
        const targetSection = document.querySelector(hash);

        if (targetSection) {
          // 1. DURUM (Aynı Sayfadayız): Sadece aşağı kaydır (Menünün arkasında kalmaması için 80px boşluk)
          const headerOffset = 80;
          const elementPosition = targetSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        } else {
          // 2. DURUM (Başka Sayfadayız): Hiç düşünmeden doğrudan anasayfadaki hedef bölüme zıplat!
          window.location.href = prefix + "index.html" + hash;
        }
      } else {
        // Hedefte hiç '#' yoksa normal sayfa geçişidir, standart aç
        window.location.href = prefix + targetAttr;
      }
    });
  });

  // 🌟 BONUS: Dışarıdan Anasayfaya (#contact vb.) ile gelinirse başlığın menü altında gizlenmesini engeller
  if (window.location.hash) {
    setTimeout(() => {
      const targetSection = document.querySelector(window.location.hash);
      if (targetSection) {
        const headerOffset = 80;
        const elementPosition = targetSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }, 600); // Sayfa ve preloader tam yüklenince pürüzsüzce kaydırır
  }

  // Scroll Spy (Aşağı indikçe sarı çizginin otomatik yer değiştirmesi) Mekanizması
  function onScroll(event) {
    const sections = document.querySelectorAll(".page-scroll");
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;

    for (let i = 0; i < sections.length; i++) {
      const currLink = sections[i];
      let val = currLink.getAttribute("href");
      if(val && val.includes("#")) {
        val = val.substring(val.indexOf('#'));
        const refElement = document.querySelector(val);
        if(refElement) {
          const scrollTopMinus = scrollPos + 85; // Header ofseti
          if (refElement.offsetTop <= scrollTopMinus && refElement.offsetTop + refElement.offsetHeight > scrollTopMinus) {
            const activeActive = document.querySelector(".page-scroll.active");
            if(activeActive) activeActive.classList.remove("active");
            currLink.classList.add("active");
          } else {
            currLink.classList.remove("active");
          }
        }
      }
    }
  }
  window.document.addEventListener("scroll", onScroll);

  let navbarToggler = document.querySelector(".navbar-toggler");
  const navbarCollapse = document.querySelector(".navbar-collapse");

  if(navbarToggler && navbarCollapse) {
    document.querySelectorAll(".page-scroll").forEach((e) =>
      e.addEventListener("click", () => {
        navbarToggler.classList.remove("active");
        navbarCollapse.classList.remove("show");
      })
    );
    navbarToggler.addEventListener("click", function () {
      navbarToggler.classList.toggle("active");
    });
  }

  if (typeof WOW !== 'undefined') { new WOW().init(); }
  const heroCarousel = document.querySelector('#nartHeroSlider');
  if (heroCarousel) { new bootstrap.Carousel(heroCarousel, { interval: 4000, pause: false, wrap: true }).cycle(); }
}

// ====================================================================================
// 3. BÖLÜM: ÇEREZ RIZA SÖZLEŞME VE ONAY MEKANİZMASI (COOKIE LOGIC SYSTEM)
// ====================================================================================
const COOKIE_CONSENT_KEY = 'çerez_kabul_edildi';

window.toggleCookieModal = function() {
    let modalElement = document.getElementById('çerezAyarlariModal');
    if (!modalElement) return;
    let modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (!modalInstance) { modalInstance = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false }); }
    if (modalElement.classList.contains('show')) { modalInstance.hide(); } else { updateModalSwitchesFromStorage(); modalInstance.show(); }
};

window.checkCookieConsent = function() {
    let consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const banner = document.getElementById('çerez-uyarisi-banner');
    if (!consent) { if(banner) banner.style.display = 'block'; } else { loadThirdPartyScripts(); }
};

window.acceptAllCookiesShort = function() { setCookieConsentShort({ gerekli: true, analitik: true, reklam: true, pazarlama: true }); };
window.acceptNecessaryCookiesShort = function() { setCookieConsentShort({ gerekli: true, analitik: false, reklam: false, pazarlama: false }); };

function setCookieConsentShort(settings) {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(settings));
    const banner = document.getElementById('çerez-uyarisi-banner');
    if(banner) banner.style.display = 'none';
    loadThirdPartyScripts();
}

function updateModalSwitchesFromStorage() {
    let settings = getCookieSettings();
    const chkGerekli = document.getElementById('checkGerekli');
    const chkAnalitik = document.getElementById('checkAnalitik');
    const chkReklam = document.getElementById('checkReklam');
    const chkPazarlama = document.getElementById('checkPazarlama');

    if(chkGerekli) chkGerekli.checked = settings.gerekli;
    if(chkAnalitik) chkAnalitik.checked = settings.analitik;
    if(chkReklam) chkReklam.checked = settings.reklam;
    if(chkPazarlama) chkPazarlama.checked = settings.pazarlama;
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
    if(banner) banner.style.display = 'none';

    let modalElement = document.getElementById('çerezAyarlariModal');
    if (modalElement) { let modalInstance = bootstrap.Modal.getInstance(modalElement); if(modalInstance) modalInstance.hide(); }
    loadThirdPartyScripts();
};

function getCookieSettings() {
    let consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent) { try { return JSON.parse(consent); } catch (e) { return { gerekli: true, analitik: false, reklam: false, pazarlama: false }; } }
    return { gerekli: true, analitik: false, reklam: false, pazarlama: false };
}

function loadThirdPartyScripts() {
    const settings = getCookieSettings();
    if (settings.analitik) { loadScript("https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"); }
}

function loadScript(src) {
    let script = document.createElement('script'); script.src = src; script.async = true; document.head.appendChild(script);
}

// ====================================================================================
// 4. BÖLÜM: DİL MOTORU VE ANA BAŞLATICI SENKRONİZASYONU (7-LANGUAGE MASTER LOCALIZATION)
// ====================================================================================
const NART_LANG_KEY = 'nart_secilen_dil';

window.nartDilDegistir = function(dil) {
  localStorage.setItem(NART_LANG_KEY, dil);
  nartDiliUygula(dil);
};

function nartDiliUygula(dil) {
  // 1. Metin, Megamenu ve SVG Grafik İçerik Çevirileri (TR, EN, RU, AR, ZH, ES, IT)
  const elements = document.querySelectorAll('[data-en], [data-ru], [data-ar], [data-zh], [data-es], [data-it]');
  elements.forEach(el => {
    // 🔑 AKILLI SVG KALKANI: Elemanın bir SVG <text> düğümü olup olmadığını kontrol ediyoruz
    const isSvgText = el.tagName.toLowerCase() === 'text';

    if (!el.getAttribute('data-tr')) {
      // SVG düğümleri innerHTML kabul etmediği için textContent ile ilk dil kaydını yedekliyoruz
      el.setAttribute('data-tr', isSvgText ? el.textContent : el.innerHTML);
    }

    let targetContent = (dil === 'tr') ? el.getAttribute('data-tr') : el.getAttribute('data-' + dil);

    if (!targetContent && dil !== 'tr') {
      targetContent = el.getAttribute('data-en') || el.getAttribute('data-tr');
    }

    if (targetContent) {
      // 🔑 AKILLI YAZMA MOTORU: SVG elemanlarına textContent ile güvenli atama yapıyoruz
      if (isSvgText) {
        el.textContent = targetContent;
      } else if (targetContent.includes('<')) {
        el.innerHTML = targetContent;
      } else {
        el.textContent = targetContent;
      }
    }
  });

  // 2. İletişim Formu Giriş Alanları (Placeholder) Çevirileri
  const inputs = document.querySelectorAll('[data-en-placeholder], [data-ru-placeholder], [data-ar-placeholder], [data-zh-placeholder], [data-es-placeholder], [data-it-placeholder]');
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

  // 3. Üst Menüdeki Bayrak ve Yazı Motoru (Sözdizimi Tamamen Güvenli)
  var textEl = document.getElementById('nart-active-lang-text');
  if (textEl) {
    var flags = {
      tr: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"><rect width="1200" height="800" fill="#e30a17"/><circle cx="400" cy="400" r="200" fill="#fff"/><circle cx="450" cy="400" r="160" fill="#e30a17"/><polygon points="575,400 516.2,419.1 552.5,369.1 552.5,430.9 516.2,380.9" fill="#fff"/></svg>',
      en: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30M60 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" stroke-width="2"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></svg>',
      ru: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"><rect width="900" height="600" fill="#fff"/><rect width="900" height="400" y="200" fill="#0039a6"/><rect width="900" height="200" y="400" fill="#d52b1e"/></svg>',
      ar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"><rect width="3" height="2" fill="#fff"/><rect width="3" height="0.66" fill="#731412"/><rect width="3" height="0.66" y="1.33" fill="#000"/><path d="M 0,0 L 0.75,1 L 0,2 Z" fill="#114a2b"/></svg>',
      zh: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"><rect width="30" height="20" fill="#de2110"/><path d="M5 5L3.4 6.2l.6-1.9-1.6-1.2h2l.6-1.9.6 1.9h2l-1.6 1.2.6 1.9zm5-2.5l-.2 1 .4-.9.7.5-.9.1.2 1-.5-.8-.8.6.6-.7-.5-.8h1zm2 2.5l-.6.8.1-1 .9.2-.8-.6.6-.8-.3.9-.9-.5.9-.2zm1 3l-.9.4.5-.8.6.7-.9-.1-.2 1-.1-.9-.9.4.8-.5zm-3 2l-.9-.4.9-.1-.1-.9.6.8.9-.5-.5.9.6.7-1-.1z" fill="#ffde00"/></svg>',
      es: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"><rect width="3" height="2" fill="#c60b1e"/><rect width="3" height="1" y="0.5" fill="#ffc400"/></svg>',
      it: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" style="width: 16px; height: auto; margin-right: 8px; border-radius: 2px; vertical-align: middle; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"><rect width="1" height="2" fill="#009246"/><rect width="1" height="2" x="1" fill="#fff"/><rect width="1" height="2" x="2" fill="#ce2b37"/></svg>'
    };

    var displayTexts = { tr: 'TR', en: 'EN', ru: 'RU', ar: 'AR', zh: 'ZH', es: 'ES', it: 'IT' };
    var currentLang = dil.toLowerCase();

    textEl.innerHTML = (flags[currentLang] || '') + (displayTexts[currentLang] || dil.toUpperCase());
  }
  // 4. Harici Dinamik SVG Görsel Değiştirici Motoru (7 Dil - Alt Klasör Korumalı)
  const rmsGorsel = document.getElementById('nart-rms-gorsel');
  if (rmsGorsel) {
    const prefix = window.location.pathname.includes('/products/') ? '../' : '';
    // Klasör yolunun arasına jilet gibi 'rms/' dizinini ekledik
    rmsGorsel.setAttribute('src', prefix + 'assets/img/rms/rms-' + dil.toLowerCase() + '.svg');
  }
}

document.addEventListener("DOMContentLoaded", function() {
  nartBilesenleriYukle()
    .then(() => {
      initOrijinalTemaMekanizmasi();
      window.checkCookieConsent();

      // ⚙️ Kapsam (Scope) hatası yaşanmaması için doğrudan string key ile dili çekiyoruz
      const defaultLang = localStorage.getItem('nart_secilen_dil') || 'tr';
      nartDiliUygula(defaultLang);

      console.log("Nart Gaz: 6 Dilli lokalizasyon ve bileşen kalkanı başarıyla devreye alındı.");
    })
    .catch(err => { console.error("Sistem başlatma hatası:", err); });
});