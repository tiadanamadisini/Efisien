
// DOM Elements
const settingsButton = document.getElementById('settingsButton');
const settingsPopup = document.getElementById('settingsPopup');
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');
const themeSelect = document.getElementById('themeSelect');
const premiumToggle = document.getElementById('premiumToggle');
const notifToggle = document.getElementById('notifToggle');
const qualitySelect = document.getElementById('qualitySelect');

// Load settings from localStorage
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('gallerySettings')) || {};

  if (settings.theme) {
    themeSelect.value = settings.theme;
  }

  if (settings.showPremium !== undefined) {
    premiumToggle.checked = settings.showPremium;
  }

  if (settings.notifications !== undefined) {
    notifToggle.checked = settings.notifications;
  }

  if (settings.quality) {
    qualitySelect.value = settings.quality;
  }

  // Apply immediately on load
  applySettings(settings);
}

// Save settings to localStorage
function saveSettingsToStorage() {
  const settings = {
    theme: themeSelect.value,
    showPremium: premiumToggle.checked,
    notifications: notifToggle.checked,
    quality: qualitySelect.value
  };

  localStorage.setItem('gallerySettings', JSON.stringify(settings));

  // Apply settings immediately
  applySettings(settings);

  // Show confirmation
  alert('Tetapan telah disimpan!');
  settingsPopup.classList.remove('active');
}

// Fungsi compress imej
function compressImage(imgElement, quality = 0.5) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;

  ctx.drawImage(imgElement, 0, 0);

  return canvas.toDataURL('image/jpeg', quality);
}

// Apply settings to the app
function applySettings(settings) {
  // Apply theme
  document.body.className = settings.theme || 'dark';

  // Show or hide premium content
  const premiumElements = document.querySelectorAll('.premium');
  premiumElements.forEach(el => {
    el.style.display = settings.showPremium ? 'block' : 'none';
  });

  // Handle notifications (example: toggle a bell icon visibility)
  const notifIcon = document.getElementById('notifIcon');
  if (notifIcon) {
    notifIcon.style.display = settings.notifications ? 'inline-block' : 'none';
  }

  // Handle image quality compression if needed
  const images = document.querySelectorAll('.gallery-image');
  images.forEach(img => {
    if (img.dataset.originalSrc) {
      const original = new Image();
      original.src = img.dataset.originalSrc;
      original.onload = () => {
        const quality = parseFloat(settings.quality || 0.8);
        const compressed = compressImage(original, quality);
        img.src = compressed;
      };
    } else {
      img.dataset.originalSrc = img.src;
    }
  });
}

// Event listeners
settingsButton.addEventListener('click', () => {
  settingsPopup.classList.add('active');
});

closeSettings.addEventListener('click', () => {
  settingsPopup.classList.remove('active');
});

saveSettings.addEventListener('click', saveSettingsToStorage);

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);
