// 0xrex Portal Logic
import { auth, db } from './firebase-init.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import {
  doc,
  getDoc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

var _currentUser = null;
var _userData = null;

// Auth guard
onAuthStateChanged(auth, (user) => {
  if (!user) {
    localStorage.removeItem('0xrex_logged_in');
    window.location.href = 'login.html';
    return;
  }
  document.body.classList.add('auth-ready');
  _currentUser = user;
  initPortal(user);
});

function generateLicenseKey(uid) {
  var hash = 0;
  for (var i = 0; i < uid.length; i++) {
    hash = ((hash << 5) - hash) + uid.charCodeAt(i);
    hash |= 0;
  }
  var hex = Math.abs(hash).toString(16).toUpperCase().padStart(12, '0');
  return '0XREX-PRO-' + hex.slice(0,4) + '-' + hex.slice(4,8) + '-' + hex.slice(8,12);
}

async function loadUserData(uid) {
  try {
    var snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data();
    }
  } catch (e) {
    console.warn('Firestore read failed, falling back to localStorage', e);
  }
  // Fallback to localStorage
  var settings = JSON.parse(localStorage.getItem('0xrex_settings_' + uid) || '{}');
  return { tier: settings.tier || 'free', licenseKey: settings.licenseKey || null };
}

async function saveUserData(uid, data) {
  try {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  } catch (e) {
    console.warn('Firestore write failed, saving to localStorage', e);
  }
  // Always mirror to localStorage
  var settings = JSON.parse(localStorage.getItem('0xrex_settings_' + uid) || '{}');
  Object.assign(settings, data);
  localStorage.setItem('0xrex_settings_' + uid, JSON.stringify(settings));
}

async function initPortal(user) {
  var email = user.email || 'Unknown';
  var created = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : '--';
  var uid = user.uid;

  _userData = await loadUserData(uid);
  var isPro = _userData.tier === 'pro';
  var licenseKey = isPro ? (_userData.licenseKey || generateLicenseKey(uid)) : null;

  // Populate account info
  document.getElementById('portalEmail').textContent = email;
  document.getElementById('accountEmail').textContent = email;
  document.getElementById('accountCreated').textContent = created;

  updateTierUI(isPro, licenseKey);

  // Load settings into form
  loadSettings(uid, _userData);

  // Populate placeholder trading data
  populateTradingData();
}

function updateTierUI(isPro, licenseKey) {
  // Tier badge in sidebar
  var tierEl = document.getElementById('portalTier');
  tierEl.textContent = isPro ? 'PRO' : 'FREE TIER';
  tierEl.className = 'portal-tier ' + (isPro ? 'portal-tier--pro' : 'portal-tier--free');
  document.getElementById('accountTier').textContent = isPro ? 'Pro' : 'Free';
  document.getElementById('accountTier').style.color = isPro ? 'var(--accent)' : 'var(--text-muted)';

  // Account license key
  var licenseEl = document.getElementById('accountLicense');
  if (isPro && licenseKey) {
    licenseEl.innerHTML = '<div class="portal-license-wrap">' +
      '<span class="portal-license">' + licenseKey + '</span>' +
      '<button class="portal-copy-btn" id="copyLicense">COPY</button>' +
      '</div>' +
      '<div class="portal-license-instructions">' +
      'Enter this key in the 0xrex desktop app:<br>' +
      'Live Trading tab or Settings > click ACTIVATE PRO > paste key' +
      '</div>';
    setTimeout(function() {
      var copyBtn = document.getElementById('copyLicense');
      if (copyBtn) {
        copyBtn.addEventListener('click', function() {
          navigator.clipboard.writeText(licenseKey).then(function() {
            copyBtn.textContent = 'COPIED';
            setTimeout(function() { copyBtn.textContent = 'COPY'; }, 2000);
          });
        });
      }
    }, 0);
  } else {
    licenseEl.innerHTML = '<span style="color:var(--text-muted);">Upgrade to Pro to receive your license key</span>';
  }

  // Subscription plan cards
  var freeCard = document.getElementById('planCardFree');
  var proCard = document.getElementById('planCardPro');
  var freeBadge = document.getElementById('freeBadge');
  var proBadge = document.getElementById('proBadge');
  var upgradeBtn = document.getElementById('upgradeBtn');

  if (isPro) {
    freeCard.classList.add('portal-plan--current');
    freeCard.classList.add('portal-plan--dimmed');
    freeBadge.textContent = 'FREE';
    freeBadge.className = 'demo-badge demo-badge--cyan';
    proCard.classList.remove('portal-plan--current');
    proBadge.textContent = 'CURRENT';
    proBadge.className = 'demo-badge demo-badge--green';
    upgradeBtn.textContent = 'Active';
    upgradeBtn.disabled = true;
    upgradeBtn.style.opacity = '0.5';
    upgradeBtn.style.cursor = 'default';
  } else {
    freeCard.classList.add('portal-plan--current');
    freeCard.classList.remove('portal-plan--dimmed');
    freeBadge.textContent = 'CURRENT';
    proCard.classList.remove('portal-plan--current');
    proBadge.textContent = 'PRO';
    upgradeBtn.textContent = 'Upgrade to Pro';
    upgradeBtn.disabled = false;
    upgradeBtn.style.opacity = '';
    upgradeBtn.style.cursor = '';
  }

  // Sub page license card
  var subCard = document.getElementById('subLicenseCard');
  var subWrap = document.getElementById('subLicenseWrap');
  if (isPro && licenseKey) {
    subCard.classList.remove('hidden');
    subWrap.innerHTML = '<span class="portal-license">' + licenseKey + '</span>' +
      '<button class="portal-copy-btn" onclick="copySubKey()">COPY</button>';
  } else {
    subCard.classList.add('hidden');
  }
}

// Purchase flow
window.startPurchase = function() {
  if (!_currentUser) return;
  var modal = document.getElementById('purchaseModal');
  var step1 = document.getElementById('purchaseStep1');
  var step2 = document.getElementById('purchaseStep2');
  step1.classList.remove('hidden');
  step2.classList.add('hidden');
  modal.classList.remove('hidden');
};

window.closePurchase = function() {
  document.getElementById('purchaseModal').classList.add('hidden');
};

window.confirmPurchase = async function() {
  if (!_currentUser) return;
  var btn = document.getElementById('purchaseConfirmBtn');
  btn.textContent = 'Processing...';
  btn.disabled = true;

  var uid = _currentUser.uid;
  var licenseKey = generateLicenseKey(uid);

  // Save to Firestore + localStorage
  await saveUserData(uid, {
    tier: 'pro',
    licenseKey: licenseKey,
    upgradedAt: new Date().toISOString()
  });

  _userData = Object.assign(_userData || {}, { tier: 'pro', licenseKey: licenseKey });

  // Show key
  document.getElementById('purchaseKeyDisplay').textContent = licenseKey;

  // Switch to step 2
  document.getElementById('purchaseStep1').classList.add('hidden');
  document.getElementById('purchaseStep2').classList.remove('hidden');

  // Update all UI
  updateTierUI(true, licenseKey);

  btn.textContent = 'Activate PRO';
  btn.disabled = false;
};

window.copyPurchaseKey = function() {
  var keyEl = document.getElementById('purchaseKeyDisplay');
  var btn = document.getElementById('purchaseKeyCopy');
  navigator.clipboard.writeText(keyEl.textContent).then(function() {
    btn.textContent = 'COPIED';
    setTimeout(function() { btn.textContent = 'COPY'; }, 2000);
  });
};

window.copySubKey = function() {
  var keyEl = document.getElementById('subLicenseWrap').querySelector('.portal-license');
  var btn = document.getElementById('subLicenseWrap').querySelector('.portal-copy-btn');
  if (keyEl) {
    navigator.clipboard.writeText(keyEl.textContent).then(function() {
      btn.textContent = 'COPIED';
      setTimeout(function() { btn.textContent = 'COPY'; }, 2000);
    });
  }
};

// Section navigation
document.addEventListener('DOMContentLoaded', function() {
  var navItems = document.querySelectorAll('.portal-nav-item');
  var sections = document.querySelectorAll('.portal-section');

  function showSection(id) {
    sections.forEach(function(s) { s.classList.remove('active'); });
    navItems.forEach(function(n) { n.classList.remove('active'); });
    var section = document.getElementById(id);
    if (section) section.classList.add('active');
    var navItem = document.querySelector('[data-section="' + id + '"]');
    if (navItem) navItem.classList.add('active');
  }

  navItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      showSection(this.dataset.section);
      history.replaceState(null, '', '#' + this.dataset.section);
    });
  });

  // Check URL hash
  var hash = location.hash.slice(1);
  if (hash && document.getElementById(hash)) {
    showSection(hash);
  }

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', function() {
    signOut(auth).then(function() {
      localStorage.removeItem('0xrex_logged_in');
      window.location.href = 'login.html';
    });
  });

  // Save settings button
  var saveKeysBtn = document.getElementById('saveKeysBtn');
  if (saveKeysBtn) {
    saveKeysBtn.addEventListener('click', function() {
      saveSettings();
      this.textContent = 'Saved';
      var btn = this;
      setTimeout(function() { btn.textContent = 'Save Keys'; }, 2000);
    });
  }
});

function loadSettings(uid, settings) {
  var themeEl = document.getElementById('settingTheme');
  var currencyEl = document.getElementById('settingCurrency');
  var notifEl = document.getElementById('settingNotifications');
  var riskEl = document.getElementById('settingRisk');
  var posEl = document.getElementById('settingPositions');
  var intervalEl = document.getElementById('settingInterval');

  if (themeEl && settings.theme) themeEl.value = settings.theme;
  if (currencyEl && settings.currency) currencyEl.value = settings.currency;
  if (notifEl) notifEl.checked = settings.notifications !== false;
  if (riskEl && settings.risk) riskEl.value = settings.risk;
  if (posEl && settings.maxPositions) posEl.value = settings.maxPositions;
  if (intervalEl && settings.interval) intervalEl.value = settings.interval;
}

function saveSettings() {
  if (!_currentUser) return;
  var uid = _currentUser.uid;
  var data = {
    theme: document.getElementById('settingTheme').value,
    currency: document.getElementById('settingCurrency').value,
    notifications: document.getElementById('settingNotifications').checked,
    risk: document.getElementById('settingRisk').value,
    maxPositions: document.getElementById('settingPositions').value,
    interval: document.getElementById('settingInterval').value
  };
  saveUserData(uid, data);
}

function populateTradingData() {
  var positions = [
    { asset: 'BTC/USDT', side: 'LONG', entry: '$67,432', current: '$68,190', pnl: '+$758', sl: '$65,800 / $72,000' },
    { asset: 'ETH/USDT', side: 'LONG', entry: '$3,421', current: '$3,388', pnl: '-$33', sl: '$3,280 / $3,650' },
    { asset: 'SOL/USDT', side: 'SHORT', entry: '$148.20', current: '$145.60', pnl: '+$26', sl: '$155.00 / $138.00' }
  ];

  var body = document.getElementById('positionsBody');
  if (body) {
    body.innerHTML = positions.map(function(p) {
      var pnlClass = p.pnl.startsWith('+') ? 'dm-green' : 'dm-red';
      return '<div class="portal-table-row">' +
        '<span>' + p.asset + '</span>' +
        '<span style="color:' + (p.side === 'LONG' ? 'var(--cyan)' : 'var(--red)') + '">' + p.side + '</span>' +
        '<span>' + p.entry + '</span>' +
        '<span>' + p.current + '</span>' +
        '<span class="' + pnlClass + '">' + p.pnl + '</span>' +
        '<span style="font-size:0.6rem;">' + p.sl + '</span>' +
        '</div>';
    }).join('');
  }

  var signals = [
    { time: '16:42', text: 'BTC/USDT -- BUY signal -- confidence 0.82', type: 'buy' },
    { time: '16:38', text: 'SOL/USDT -- SELL signal -- confidence 0.71', type: 'sell' },
    { time: '16:30', text: 'ETH/USDT -- HOLD -- confidence 0.45', type: 'hold' },
    { time: '16:22', text: 'DOGE/USDT -- BUY signal -- confidence 0.68', type: 'buy' },
    { time: '16:15', text: 'AVAX/USDT -- SELL signal -- confidence 0.74', type: 'sell' }
  ];

  var sigEl = document.getElementById('recentSignals');
  if (sigEl) {
    sigEl.innerHTML = signals.map(function(s) {
      var color = s.type === 'buy' ? 'var(--cyan)' : s.type === 'sell' ? 'var(--red)' : 'var(--text-muted)';
      return '<div class="portal-signal-item">' +
        '<span class="portal-signal-time">' + s.time + '</span>' +
        '<span style="color:' + color + '">' + s.text + '</span>' +
        '</div>';
    }).join('');
  }

  var nav = document.getElementById('dashNav');
  var pnl = document.getElementById('dashPnl');
  var win = document.getElementById('dashWin');
  var pos = document.getElementById('dashPositions');
  if (nav) nav.textContent = '$127,432';
  if (pnl) { pnl.textContent = '+$1,247'; pnl.className = 'dm-value dm-green'; }
  if (win) win.textContent = '64%';
  if (pos) pos.textContent = '3';
}
