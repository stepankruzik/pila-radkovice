(function () {
  const years = document.querySelectorAll('#y');
  years.forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const hamburger = document.querySelector('.hamburger');
  const nav = document.getElementById('main-nav');

  const closeNav = () => {
    if (!hamburger || !nav) return;
    hamburger.classList.remove('active');
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 993) closeNav();
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 993) closeNav();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeNav();
    });
  }

  const slides = Array.from(document.querySelectorAll('.main-slide'));
  const dots = Array.from(document.querySelectorAll('.ind-dot'));
  let slideIndex = 0;
  let carouselTimer = null;

  const showSlide = (index) => {
    if (!slides.length) return;

    if (index >= slides.length) slideIndex = 0;
    else if (index < 0) slideIndex = slides.length - 1;
    else slideIndex = index;

    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === slideIndex);
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === slideIndex);
    });
  };

  const restartCarousel = () => {
    if (carouselTimer) window.clearInterval(carouselTimer);
    if (slides.length > 1) {
      carouselTimer = window.setInterval(() => {
        showSlide(slideIndex + 1);
      }, 5500);
    }
  };

  window.changeSlide = (step) => {
    showSlide(slideIndex + Number(step || 0));
    restartCarousel();
  };

  window.setSlide = (index) => {
    showSlide(Number(index || 0));
    restartCarousel();
  };

  showSlide(0);
  restartCarousel();

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  let currentLightboxIndex = 0;

  const updateLightbox = () => {
    if (!lightbox || !galleryItems.length || !lightboxImg) return;

    const item = galleryItems[currentLightboxIndex];
    const image = item.querySelector('img');
    const caption = item.querySelector('.gallery-overlay span');

    if (!image) return;

    lightboxImg.src = image.src;
    lightboxImg.alt = image.alt || 'Galerie Pily Radkovice';
    if (lightboxCaption) {
      lightboxCaption.textContent = caption ? caption.textContent : image.alt || '';
    }
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  };

  window.openLightbox = (element) => {
    if (!lightbox || !galleryItems.length || !element) return;
    currentLightboxIndex = Math.max(galleryItems.indexOf(element), 0);
    updateLightbox();
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.changeLightboxImage = (direction) => {
    if (!galleryItems.length) return;
    currentLightboxIndex = (currentLightboxIndex + Number(direction) + galleryItems.length) % galleryItems.length;
    updateLightbox();
  };

  window.closeLightbox = closeLightbox;

  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (event) => {
      if (lightbox.style.display !== 'flex') return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowRight') window.changeLightboxImage(1);
      if (event.key === 'ArrowLeft') window.changeLightboxImage(-1);
    });
  }

  const inquiryMessage = document.getElementById('f_msg');

  if (inquiryMessage) {
    try {
      const storedSummary = window.sessionStorage.getItem('kubiraceSummary');
      if (storedSummary && !inquiryMessage.value.trim()) {
        inquiryMessage.value = storedSummary;
        window.sessionStorage.removeItem('kubiraceSummary');
      }
    } catch (_error) {
      // Ignored: storage may be unavailable in some browser modes.
    }

    if (window.location.hash === '#poptavka') {
      window.setTimeout(() => {
        inquiryMessage.focus();
      }, 120);
    }
  }

  window.sendEmail = (event) => {
    if (event) event.preventDefault();

    const name = document.getElementById('f_name')?.value?.trim() || '';
    const contact = document.getElementById('f_contact')?.value?.trim() || '';
    const message = document.getElementById('f_msg')?.value?.trim() || '';

    if (!name || !contact || !message) return;

    const subject = encodeURIComponent(`Poptávka z webu – ${name}`);
    const body = encodeURIComponent(
      `Dobrý den,\n\n` +
      `jméno: ${name}\n` +
      `kontakt: ${contact}\n\n` +
      `zpráva:\n${message}\n\n` +
      `Odesláno z webu Pily Radkovice.`
    );

    window.location.href = `mailto:zdenda.kruzik@seznam.cz?subject=${subject}&body=${body}`;
  };
})();