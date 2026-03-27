// ── REGISTRO DEL SERVICE WORKER ──────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('✅ Service Worker registrado:', reg.scope);

        // Detectar actualización disponible
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 Nueva versión disponible — recarga para actualizar');
            }
          });
        });
      })
      .catch(err => console.warn('❌ Service Worker falló:', err));
  });
}

// ── BANNER DE INSTALACIÓN (A2HS) ─────────────────────────
let deferredPrompt = null;
const banner        = document.getElementById('install-banner');
const btnInstall    = document.getElementById('btn-install');
const btnDismiss    = document.getElementById('btn-install-dismiss');

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;

  // No mostrar si ya fue rechazado antes
  if (localStorage.getItem('pwa-dismissed') === '1') return;

  // Mostrar el banner con un pequeño delay
  setTimeout(() => {
    banner.style.display = 'flex';
    banner.classList.add('banner-show');
  }, 2000);
});

btnInstall?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log('Resultado instalación:', outcome);
  deferredPrompt = null;
  hideBanner();
});

btnDismiss?.addEventListener('click', () => {
  localStorage.setItem('pwa-dismissed', '1');
  hideBanner();
});

function hideBanner() {
  banner.classList.remove('banner-show');
  banner.classList.add('banner-hide');
  setTimeout(() => banner.style.display = 'none', 400);
}

// Cuando ya está instalada (standalone) ocultar el banner
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA instalada correctamente');
  hideBanner();
});

// ── ESTADO DE CONEXIÓN ────────────────────────────────────
const offlineToast = document.getElementById('offline-toast');

function showOfflineToast() {
  if (!offlineToast) return;
  offlineToast.style.display = 'flex';
  offlineToast.classList.add('toast-show');
}

function hideOfflineToast() {
  if (!offlineToast) return;
  offlineToast.classList.remove('toast-show');
  setTimeout(() => offlineToast.style.display = 'none', 400);
}

if (!navigator.onLine) showOfflineToast();

window.addEventListener('online',  hideOfflineToast);
window.addEventListener('offline', showOfflineToast);
