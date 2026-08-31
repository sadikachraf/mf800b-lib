'use strict';

// Commercial and integration values live here so every price and payload stays in sync.
const PRODUCT_CONFIG = Object.freeze({
  sku: 'MF800B-LY',
  name: 'MF800B 4G LTE Portable WiFi',
  orderPrefix: 'MIFI-LY-',
  country: 'Libya',
  currency: 'LYD',
  currencyLabel: 'د.ل',
  startingBatchQuantity: 155,
  sheetEndpoint: 'https://script.google.com/macros/s/AKfycbzfZDgIcM8TmzY9XgFE349EM4yMcE0U3TB70NpiXP_fF7RMUYxPxLIwKW_4Qg8m4XJc/exec',
  pixelIds: ['778731385018899', '1298885441635850'],
  offers: {
    single: {
      id: 'single',
      label: 'جهاز واحد',
      description: 'MF800B واحد للحوش أو التنقل',
      quantity: 1,
      price: 349,
      unitPrice: 349,
      tag: null
    },
    double: {
      id: 'double',
      label: 'جهازين',
      description: 'واحد للحوش وواحد للشغل أو السفر',
      quantity: 2,
      price: 599,
      unitPrice: 299.5,
      tag: 'الأوفر'
    }
  }
});

let selectedOfferId = 'single';
let checkoutTracked = false;
let currentGalleryIndex = 0;
let galleryScrollFrame = 0;
let lastFocusedElement = null;

function currentOffer() {
  return PRODUCT_CONFIG.offers[selectedOfferId];
}

function money(value) {
  return new Intl.NumberFormat('ar-LY', { maximumFractionDigits: 1 }).format(value);
}

function track(eventName, data = {}) {
  if (typeof window.fbq === 'function') window.fbq('track', eventName, data);
}

function commerceData(offer) {
  return {
    value: offer.price,
    currency: PRODUCT_CONFIG.currency,
    content_ids: [PRODUCT_CONFIG.sku],
    content_name: PRODUCT_CONFIG.name,
    content_type: 'product',
    num_items: offer.quantity
  };
}

function fireInitiateCheckout() {
  if (checkoutTracked) return;
  checkoutTracked = true;
  track('InitiateCheckout', commerceData(currentOffer()));
}

function offerMarkup(offer) {
  const unit = offer.quantity > 1
    ? `<span class="unit-price">${money(offer.unitPrice)} د.ل للقطعة</span>`
    : '';
  return `
    <span class="offer-radio" aria-hidden="true"></span>
    <span class="offer-info">
      <b>${offer.label}</b>
      <small>${offer.description}</small>
      ${unit}
    </span>
    <span class="offer-price">
      <b>${money(offer.price)} ${PRODUCT_CONFIG.currencyLabel}</b>
      <small>${offer.quantity === 1 ? 'جهاز واحد' : `${offer.quantity} أجهزة`}</small>
    </span>
    ${offer.tag ? `<span class="offer-tag">${offer.tag}</span>` : ''}`;
}

function renderOffers() {
  document.querySelectorAll('[data-offers]').forEach((holder) => {
    holder.innerHTML = '';
    Object.values(PRODUCT_CONFIG.offers).forEach((offer) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'offer-option';
      button.dataset.offer = offer.id;
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', String(offer.id === selectedOfferId));
      button.innerHTML = offerMarkup(offer);
      button.addEventListener('click', () => selectOffer(offer.id));
      holder.appendChild(button);
    });
  });
  refreshPrices();
}

function selectOffer(id) {
  if (!PRODUCT_CONFIG.offers[id]) return;
  selectedOfferId = id;
  document.querySelectorAll('.offer-option').forEach((button) => {
    button.setAttribute('aria-checked', String(button.dataset.offer === id));
  });
  refreshPrices();
  fireInitiateCheckout();
}

function refreshPrices() {
  const offer = currentOffer();
  document.querySelectorAll('[data-price]').forEach((node) => {
    node.textContent = money(offer.price);
  });
}

function setGalleryIndex(index, shouldScroll = false) {
  const slides = [...document.querySelectorAll('[data-slide]')];
  if (!slides.length) return;
  const next = Math.max(0, Math.min(index, slides.length - 1));
  currentGalleryIndex = next;
  slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === next));
  document.querySelectorAll('[data-dot]').forEach((dot, dotIndex) => {
    const active = dotIndex === next;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-thumb]').forEach((thumb, thumbIndex) => {
    thumb.classList.toggle('active', thumbIndex === next);
  });
  if (shouldScroll && window.matchMedia('(max-width: 980px)').matches) {
    slides[next].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

function updateGalleryFromScroll() {
  const track = document.querySelector('[data-gallery-track]');
  const slides = [...document.querySelectorAll('[data-slide]')];
  if (!track || !slides.length || !window.matchMedia('(max-width: 980px)').matches) return;
  const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
  let closestIndex = 0;
  let closestDistance = Infinity;
  slides.forEach((slide, index) => {
    const rect = slide.getBoundingClientRect();
    const distance = Math.abs(rect.left + rect.width / 2 - trackCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  setGalleryIndex(closestIndex, false);
}

function initGallery() {
  const track = document.querySelector('[data-gallery-track]');
  if (!track) return;
  document.querySelectorAll('[data-dot]').forEach((dot) => {
    dot.addEventListener('click', () => setGalleryIndex(Number(dot.dataset.dot), true));
  });
  document.querySelectorAll('[data-thumb]').forEach((thumb) => {
    thumb.addEventListener('click', () => setGalleryIndex(Number(thumb.dataset.thumb), false));
  });
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(galleryScrollFrame);
    galleryScrollFrame = requestAnimationFrame(updateGalleryFromScroll);
  }, { passive: true });
  track.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const delta = event.key === 'ArrowLeft' ? 1 : -1;
    setGalleryIndex(currentGalleryIndex + delta, true);
  });
  setGalleryIndex(0, false);
}

function normalizeLibyanPhone(value) {
  let phone = String(value || '').replace(/[\s().-]/g, '');
  if (phone.startsWith('+218')) phone = `0${phone.slice(4)}`;
  else if (phone.startsWith('00218')) phone = `0${phone.slice(5)}`;
  else if (phone.startsWith('218')) phone = `0${phone.slice(3)}`;
  return phone;
}

function validPhone(phone) {
  return /^09\d{8}$/.test(phone);
}

function orderReference() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const entropy = `${String(now.getTime()).slice(-5)}${Math.floor(Math.random() * 90 + 10)}`;
  return `${PRODUCT_CONFIG.orderPrefix}${date}-${entropy}`;
}

function formValues(form) {
  const data = new FormData(form);
  return {
    name: String(data.get('name') || '').trim(),
    phone: normalizeLibyanPhone(data.get('phone')),
    city: String(data.get('city') || '').trim(),
    address: String(data.get('address') || '').trim()
  };
}

function validateForm(form, values) {
  const error = form.querySelector('.form-error');
  form.querySelectorAll('.invalid').forEach((field) => field.classList.remove('invalid'));
  error.textContent = '';
  const missing = [];
  ['name', 'phone', 'city', 'address'].forEach((name) => {
    if (!values[name]) {
      form.elements[name].classList.add('invalid');
      missing.push(name);
    }
  });
  if (missing.length) {
    error.textContent = 'رجاءً كمّل كل البيانات المطلوبة.';
    return false;
  }
  if (values.name.length < 3) {
    form.elements.name.classList.add('invalid');
    error.textContent = 'اكتب اسمك الكامل بشكل صحيح.';
    return false;
  }
  if (!validPhone(values.phone)) {
    form.elements.phone.classList.add('invalid');
    error.textContent = 'رقم الهاتف لازم يبدأ بـ 09 ويتكوّن من 10 أرقام، مثال: 0912345678.';
    return false;
  }
  if (values.address.length < 4) {
    form.elements.address.classList.add('invalid');
    error.textContent = 'اكتب المنطقة أو أقرب نقطة دالة بشكل أوضح.';
    return false;
  }
  return true;
}

function duplicateSignature(values, offer) {
  return `${values.phone}|${values.city}|${offer.id}`;
}

function isRecentDuplicate(signature) {
  try {
    const saved = JSON.parse(localStorage.getItem('mf800b_last_order') || 'null');
    return Boolean(saved && saved.signature === signature && Date.now() - saved.time < 10 * 60 * 1000);
  } catch (_) {
    return false;
  }
}

function rememberOrder(signature, reference) {
  try {
    localStorage.setItem('mf800b_last_order', JSON.stringify({ signature, reference, time: Date.now() }));
  } catch (_) {}
}

function buildPayload(values, offer, reference) {
  const now = new Date().toISOString();
  const localQa = ['localhost', '127.0.0.1'].includes(location.hostname);
  return {
    order_date: now,
    orderDate: now,
    date: now,
    order_id: reference,
    orderId: reference,
    country: PRODUCT_CONFIG.country,
    name: values.name,
    customer_name: values.name,
    phone: values.phone,
    customer_phone: values.phone,
    city: values.city,
    address: `${values.city} - ${values.address}`,
    customer_address: `${values.city} - ${values.address}`,
    url: location.href,
    sku: PRODUCT_CONFIG.sku,
    product: `${PRODUCT_CONFIG.name} - ${offer.label}`,
    offer_id: offer.id,
    quantity: offer.quantity,
    total_price: offer.price,
    totalPrice: offer.price,
    price: offer.price,
    currency: PRODUCT_CONFIG.currency,
    notes: `${localQa ? 'TEST ORDER — DELETE | ' : ''}المدينة: ${values.city} | المنطقة: ${values.address} | العرض: ${offer.label}`
  };
}

async function postOrder(payload) {
  if (['localhost', '127.0.0.1'].includes(location.hostname)) {
    console.info('Local QA: Google Sheets submission skipped.', payload);
    return;
  }
  await fetch(PRODUCT_CONFIG.sheetEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify(payload)
  });
}

function showSuccess(reference, trigger) {
  lastFocusedElement = trigger;
  const modal = document.getElementById('success-modal');
  document.getElementById('order-reference').textContent = reference;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('success-close').focus();
}

function closeSuccess() {
  const modal = document.getElementById('success-modal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocusedElement) lastFocusedElement.focus();
}

async function submitOrder(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = formValues(form);
  if (!validateForm(form, values)) return;

  const offer = currentOffer();
  const signature = duplicateSignature(values, offer);
  const error = form.querySelector('.form-error');
  if (isRecentDuplicate(signature)) {
    error.textContent = 'الطلب بنفس الرقم تسجّل قبل شوية. استنى اتصال فريق التأكيد وما تعاودش الإرسال.';
    return;
  }

  const submit = form.querySelector('button[type="submit"]');
  const originalLabel = submit.textContent;
  submit.disabled = true;
  submit.textContent = 'جاري تسجيل طلبك...';
  const reference = orderReference();
  const payload = buildPayload(values, offer, reference);

  fireInitiateCheckout();
  track('Lead', commerceData(offer));
  try {
    await postOrder(payload);
    rememberOrder(signature, reference);
    form.reset();
    showSuccess(reference, submit);
  } catch (_) {
    error.textContent = 'صار خلل في الاتصال. تأكد من الإنترنت وحاول مرة ثانية.';
  } finally {
    submit.disabled = false;
    submit.textContent = originalLabel;
  }
}

function initStickyButton() {
  const sticky = document.querySelector('.mobile-sticky');
  const protectedZones = [...document.querySelectorAll('.product-panel, .final-order')];
  if (!sticky || !protectedZones.length || !('IntersectionObserver' in window)) return;
  const visibleZones = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleZones.add(entry.target);
      else visibleZones.delete(entry.target);
    });
    sticky.classList.toggle('is-hidden', visibleZones.size > 0);
  }, { threshold: .01 });
  protectedZones.forEach((zone) => observer.observe(zone));
}

document.addEventListener('DOMContentLoaded', () => {
  renderOffers();
  initGallery();
  initStickyButton();

  document.querySelectorAll('.track-checkout').forEach((link) => {
    link.addEventListener('click', fireInitiateCheckout);
  });
  document.querySelectorAll('.order-form').forEach((form) => {
    form.addEventListener('submit', submitOrder);
    form.addEventListener('focusin', fireInitiateCheckout, { once: true });
    form.elements.phone.addEventListener('input', (event) => {
      event.target.value = event.target.value.replace(/[^0-9+ .()-]/g, '');
    });
  });

  document.getElementById('success-close').addEventListener('click', closeSuccess);
  document.getElementById('success-modal').addEventListener('click', (event) => {
    if (event.target.id === 'success-modal') closeSuccess();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.getElementById('success-modal').classList.contains('open')) closeSuccess();
  });
});
