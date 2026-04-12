// 0xrex Portal Logic
import { auth } from './firebase-init.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

// Auth guard
onAuthStateChanged(auth, (user) => {
  if (!user) {
    localStorage.removeItem('0xrex_logged_in');
    window.location.href = 'login.html';
    return;
  }
  document.body.classList.add('auth-ready');
  initPortal(user);
});

function generateLicenseKey(uid) {
  // Simple hash-based key from UID (will be server-generated in production)
  var hash = 0;
  for (var i = 0; i < uid.length; i++) {
    hash = ((hash << 5) - hash) + uid.charCodeAt(i);
    hash |= 0;
  }
  var hex = Math.abs(hash).toString(16).toUpperCase().padStart(12, '0');
  return '0XREX-PRO-' + hex.slice(0,4) + '-' + hex.slice(4,8) + '-' + hex.slice(8,12);
}

function initPortal(user) {
  var email = user.email || 'Unknown';
  var created = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : '--';
  var uid = user.uid;

  // Load tier from localStorage (will come from backend later)
  var settings = JSON.parse(localStorage.getItem('0xrex_settings_' + uid) || '{}');
  var tier = settings.tier || 'free';
  var isPro = tier === 'pro';
  var licenseKey = isPro ? generateLicenseKey(uid) : null;

  // Populate account info
  document.getElementById('portalEmail').textContent = email;
  document.getElementById('accountEmail').textContent = email;
  document.getElementById('accountCreated').textContent = created;

  // Tier badge
  var tierEl = document.getElementById('portalTier');
  tierEl.textContent = isPro ? 'PRO' : 'FREE TIER';
  tierEl.className = 'portal-tier ' + (isPro ? 'portal-tier--pro' : 'portal-tier--free');
  document.getElementById('accountTier').textContent = isPro ? 'Pro' : 'Free';
  document.getElementById('accountTier').style.color = isPro ? 'var(--accent)' : 'var(--text-muted)';

  // License key
  var licenseEl = document.getElementById('accountLicense');
  if (isPro && licenseKey) {
    licenseEl.innerHTML = '<div class="portal-license-wrap">' +
      '<span class="portal-license">' + licenseKey + '</span>' +
      '<button class="portal-copy-btn" id="copyLicense">COPY</button>' +
      '</div>' +
      '<div class="portal-license-instructions">' +
      'Enter this key in 0xrex app > Settings > License Key to activate Pro mode.' +
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

  // Load settings into form
  loadSettings(uid, settings);

  // Populate placeholder trading data
  populateTradingData();
}

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
  var user = auth.currentUser;
  if (!user) return;
  var settings = JSON.parse(localStorage.getItem('0xrex_settings_' + user.uid) || '{}');
  settings.theme = document.getElementById('settingTheme').value;
  settings.currency = document.getElementById('settingCurrency').value;
  settings.notifications = document.getElementById('settingNotifications').checked;
  settings.risk = document.getElementById('settingRisk').value;
  settings.maxPositions = document.getElementById('settingPositions').value;
  settings.interval = document.getElementById('settingInterval').value;
  localStorage.setItem('0xrex_settings_' + user.uid, JSON.stringify(settings));
}

function populateTradingData() {
  // Placeholder data — will connect to FastAPI WebSocket later
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

  // Metrics
  var nav = document.getElementById('dashNav');
  var pnl = document.getElementById('dashPnl');
  var win = document.getElementById('dashWin');
  var pos = document.getElementById('dashPositions');
  if (nav) nav.textContent = '$127,432';
  if (pnl) { pnl.textContent = '+$1,247'; pnl.className = 'dm-value dm-green'; }
  if (win) win.textContent = '64%';
  if (pos) pos.textContent = '3';
}
