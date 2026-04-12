// -- 0xrex Website -- Shared JavaScript --

// Cursor fireflies
(function() {
  let throttle = 0;
  document.addEventListener('mousemove', (e) => {
    if (Date.now() - throttle < 70) return;
    throttle = Date.now();
    var count = 1;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('div');
      p.className = 'cursor-firefly';
      var ox = (Math.random() - 0.5) * 50;
      var oy = (Math.random() - 0.5) * 50;
      p.style.left = (e.clientX - 1.5 + ox) + 'px';
      p.style.top = (e.clientY - 1.5 + oy) + 'px';
      var dx = (Math.random() - 0.5) * 100;
      var dy = (Math.random() - 0.5) * 100 - 10;
      var dur = 2.5 + Math.random() * 1.5;
      p.style.setProperty('--fly-x', dx + 'px');
      p.style.setProperty('--fly-y', dy + 'px');
      p.style.setProperty('--fly-dur', dur + 's');
      document.body.appendChild(p);
      setTimeout(function(el) { el.remove(); }.bind(null, p), dur * 1000);
    }
  });
})();

// Nav portal link auth state
(function() {
  var link = document.getElementById('navPortalLink');
  if (link) {
    var loggedIn = localStorage.getItem('0xrex_logged_in') === 'true';
    link.textContent = loggedIn ? 'Portal' : 'Login';
    link.href = loggedIn ? 'portal.html' : 'login.html';
  }
})();

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  // Scroll animations (intersection observer)
  const animateEls = document.querySelectorAll('.animate-in');
  if (animateEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    animateEls.forEach(el => {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  }

  // Generate 3D coin edge segments (cylinder wall)
  function buildCoinEdge(id, segments, radius) {
    const el = document.getElementById(id);
    if (!el) return;
    for (let i = 0; i < segments; i++) {
      const angle = (i * 360) / segments;
      const seg = document.createElement('div');
      seg.className = 'coin3d-edge-seg';
      seg.style.transform = 'rotateZ(' + angle + 'deg) translateY(-' + radius + 'px) rotateX(90deg)';
      el.appendChild(seg);
    }
  }
  buildCoinEdge('coinEdge', 60, 60);
  buildCoinEdge('coinEdgeNav', 36, 14);
});

// -- Hero Tag Typing + Glitch Swap Animation --
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('heroTagTyping');
  const cursor = document.querySelector('.tag-cursor');
  if (!el) return;
  const lines = [
    'AGENT ONLINE -- AUTONOMOUS TRADING ACTIVATED',
    'SCANNING 1,000+ CRYPTO ASSETS...',
    'SIGNAL ENGINE ARMED -- 9 EXCHANGES CONNECTED',
    'CRYPTOCRED TA + GCR RULESET ENGAGED',
    'RISK MATRIX NOMINAL -- CIRCUIT BREAKERS SET',
    'SL/TP MONITOR ACTIVE -- 30s INTERVAL',
  ];
  const glitchChars = '!@#$%&*_+=<>?/\\|';
  let lineIdx = 0;

  let i = 0;
  function typeFirst() {
    el.textContent = lines[0].slice(0, i + 1);
    i++;
    if (i < lines[0].length) {
      setTimeout(typeFirst, 40);
    } else {
      if (cursor) cursor.style.animation = 'blink-cursor 0.7s step-end infinite';
      setTimeout(nextLine, 3000);
    }
  }

  function glitchSwap(newText) {
    const len = newText.length;
    let step = 0;
    const totalSteps = 6;
    function frame() {
      if (step < totalSteps) {
        let out = '';
        for (let c = 0; c < len; c++) {
          out += Math.random() < 0.6
            ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
            : newText[c];
        }
        el.textContent = out;
        el.style.opacity = Math.random() < 0.3 ? '0.4' : '1';
        step++;
        setTimeout(frame, 50);
      } else {
        el.textContent = newText;
        el.style.opacity = '1';
        setTimeout(nextLine, 4000);
      }
    }
    frame();
  }

  function nextLine() {
    lineIdx = (lineIdx + 1) % lines.length;
    glitchSwap(lines[lineIdx]);
  }

  typeFirst();
});

// -- Legal Modal --
const _LEGAL_CONTENT = {
  privacy: {
    title: 'PRIVACY POLICY',
    html: `
      <h2>Information We Collect</h2>
      <p>0xrex operates entirely on your local machine. We do not collect, store, or transmit any personal data to external servers. All trading data, portfolio information, and configuration settings remain on your device.</p>
      <h2>Exchange API Credentials</h2>
      <p>API keys and secrets you provide for exchange connections are stored locally on your device using encryption. They are never transmitted to 0xrex servers or any third party. Credentials are used solely to communicate directly between your device and your chosen exchange.</p>
      <h2>Market Data</h2>
      <p>Market data is fetched from public APIs directly from your device. These services may log your IP address per their own privacy policies.</p>
      <h2>Analytics & Telemetry</h2>
      <p>0xrex does not include any analytics, telemetry, tracking pixels, or third-party scripts. No usage data leaves your machine.</p>
      <h2>Data Retention</h2>
      <p>All data is stored in local databases and JSON files within the application directory. You can delete all data at any time by removing the data folder.</p>
    `
  },
  terms: {
    title: 'TERMS & CONDITIONS',
    html: `
      <h2>Acceptance of Terms</h2>
      <p>By using 0xrex ("the Software"), you agree to these terms. If you do not agree, do not use the Software.</p>
      <h2>Nature of the Software</h2>
      <p>0xrex is an experimental trading analysis and automation tool. It is provided for educational and research purposes only. It is not a registered financial advisor, broker-dealer, or investment service.</p>
      <h2>No Financial Advice</h2>
      <p>Nothing in this Software constitutes financial, investment, tax, or legal advice. All signals, recommendations, and analysis generated by 0xrex are algorithmic outputs and should not be treated as professional advice.</p>
      <h2>Risk Disclosure</h2>
      <ul>
        <li>Trading cryptocurrencies involves substantial risk of loss.</li>
        <li>Past performance of any algorithm does not guarantee future results.</li>
        <li>You may lose some or all of your invested capital.</li>
        <li>Automated trading systems can malfunction, execute unintended trades, or fail to execute intended trades.</li>
        <li>Cryptocurrency markets operate 24/7 and can be extremely volatile.</li>
      </ul>
      <h2>Limitation of Liability</h2>
      <p>The authors and contributors of 0xrex are not liable for any financial losses, damages, or other consequences arising from the use of this Software. You use 0xrex entirely at your own risk.</p>
      <h2>No Warranty</h2>
      <p>The Software is provided "AS IS" without warranty of any kind.</p>
    `
  },
  transparency: {
    title: 'TRANSPARENCY REPORT',
    html: `
      <h2>How 0xrex Works</h2>
      <p>0xrex is an autonomous crypto trading agent that analyses market conditions and generates trade signals using a combination of technical indicators, market regime classification, and risk-adjusted position sizing.</p>
      <h2>Signal Generation</h2>
      <p>Trade signals are generated using:</p>
      <ul>
        <li><strong>RSI (Relative Strength Index)</strong> -- momentum and overbought/oversold conditions.</li>
        <li><strong>MACD</strong> -- trend direction and crossover signals.</li>
        <li><strong>Bollinger Bands</strong> -- volatility and mean reversion detection.</li>
        <li><strong>ATR</strong> -- average true range for stop-loss/take-profit placement.</li>
        <li><strong>Market regime classification</strong> -- Bull, Bear, Accumulation, Distribution, Ranging.</li>
        <li><strong>Confidence scoring</strong> -- composite score with minimum threshold filtering (default 60%).</li>
      </ul>
      <h2>Trading Methodology</h2>
      <ul>
        <li><strong>CryptoCred TA</strong> -- technical analysis principles for crypto-specific market structure.</li>
        <li><strong>GCR Contrarian</strong> -- contrarian investing rules: fade extreme sentiment, buy boredom, sell euphoria.</li>
      </ul>
      <h2>Limitations</h2>
      <ul>
        <li>Price data may have slight delays depending on the data source.</li>
        <li>Signal confidence scores are statistical estimates, not certainties.</li>
        <li>The system does not account for all market risks (liquidity, regulatory, smart contract).</li>
      </ul>
    `
  }
};

function openLegalModal(type) {
  const content = _LEGAL_CONTENT[type];
  if (!content) return;
  document.getElementById('legalModalTitle').textContent = content.title;
  document.getElementById('legalModalBody').innerHTML = content.html;
  document.getElementById('legalModalOverlay').classList.remove('hidden');
}

function closeLegalModal() {
  document.getElementById('legalModalOverlay').classList.add('hidden');
}

// -- Demo Radar Telemetry --
document.addEventListener('DOMContentLoaded', () => {
  const telem = document.getElementById('demoRadarTelem');
  if (!telem) return;

  const lines = [
    'SYS.INIT 0x4F2A OK', 'WS.LINK CONNECTED',
    'SCAN CRYPTO — 1,000+ ASSETS', 'RSI CALC BTC 34.2',
    'SIG BUY ETH 0.82', 'RISK CHK NOMINAL',
    'RGM BULL DETECTED', 'NET.PING 8ms',
    'ORD FILL 0.5 BTC @ 67432', 'CIRC.BRK ARMED',
    'SCAN FULL UNIVERSE 108', 'HASH 0xA3F1 VERIFIED',
    'SIG SELL DOGE 0.71', 'VaR -1.8% OK',
    'CORR BTC/ETH 0.87', 'SENT BEARISH -0.12',
    'ALLOC REBAL 8 POS', 'LOOP CYCLE 42 DONE',
    'SOL $142.8 +3.2%', 'ARB $1.24 +1.8%',
  ];
  let idx = 0;

  function addTelem() {
    const div = document.createElement('div');
    const cls = Math.random() < 0.15 ? ' tl-red' : Math.random() < 0.3 ? ' tl-green' : '';
    div.className = 'demo-telem-line' + cls;
    div.textContent = '> ' + lines[idx % lines.length];
    telem.appendChild(div);
    if (telem.children.length > 12) telem.removeChild(telem.firstChild);
    idx++;
    setTimeout(addTelem, 800 + Math.random() * 1500);
  }
  addTelem();
});

// -- Demo Ops Log --
document.addEventListener('DOMContentLoaded', () => {
  const log = document.getElementById('demoOpsLog');
  if (!log) return;

  const entries = [
    { cmd: 'SYS.BOOT', msg: '0xrex agent initialising...' },
    { cmd: 'WS.LINK', msg: 'WebSocket connected to Binance' },
    { cmd: 'MKT.SCAN', msg: 'Loading 1,000+ crypto assets...' },
    { cmd: 'RGM.CALC', msg: 'Regime: BULL TREND -- momentum rising' },
    { cmd: 'SIG.GEN', msg: 'BTC/USDT -- BUY signal -- confidence 0.82' },
    { cmd: 'SIG.GEN', msg: 'DOGE/USDT -- HOLD -- confidence 0.48', cls: 'warn' },
    { cmd: 'RSK.CHK', msg: 'Portfolio drawdown: -1.8% -- within limits' },
    { cmd: 'ORD.EXEC', msg: 'BTC/USDT -- BUY 0.5 @ $67,432 -- FILLED' },
    { cmd: 'MKT.SCAN', msg: 'Scanning full crypto universe (108 tickers)...' },
    { cmd: 'SIG.GEN', msg: 'ETH/USDT -- BUY signal -- confidence 0.76' },
    { cmd: 'SIG.GEN', msg: 'PEPE/USDT -- SELL signal -- confidence 0.69', cls: 'err' },
    { cmd: 'COR.CHK', msg: 'BTC/ETH correlation: 0.87 -- adjusting size' },
    { cmd: 'RSK.CHK', msg: 'Circuit breaker: nominal -- daily P&L +2.1%' },
    { cmd: 'SIG.GEN', msg: 'SOL/USDT -- BUY signal -- confidence 0.84' },
    { cmd: 'ORD.EXEC', msg: 'ETH/USDT -- BUY 2.0 @ $3,521 -- FILLED' },
    { cmd: 'SL.TP', msg: 'Monitoring 4 positions -- next check 30s' },
    { cmd: 'RGM.CALC', msg: 'Sector rotation: AI tokens gaining momentum', cls: 'warn' },
    { cmd: 'RSK.PAR', msg: 'Risk parity rebalance: 8 positions adjusted' },
    { cmd: 'AGT.LOOP', msg: 'Autonomous cycle complete -- next scan in 5m' },
    { cmd: 'SIG.GEN', msg: 'RNDR/USDT -- BUY signal -- confidence 0.73' },
    { cmd: 'GCR.RULE', msg: 'Contrarian filter: SHIB euphoria detected -- skip' },
    { cmd: 'WS.FEED', msg: 'Broadcasting 3 new signals to WebSocket clients' },
  ];

  const maxLines = 14;
  let idx = 0;

  function now() {
    const d = new Date();
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(n => String(n).padStart(2, '0')).join(':');
  }

  function addLine() {
    const e = entries[idx % entries.length];
    const div = document.createElement('div');
    div.className = 'ops-demo-line';
    div.innerHTML =
      '<span class="ops-demo-ts">' + now() + '</span>' +
      '<span class="ops-demo-cmd">' + e.cmd + '</span>' +
      '<span class="ops-demo-msg' + (e.cls ? ' ' + e.cls : '') + '">' + e.msg + '</span>';
    log.appendChild(div);
    if (log.children.length > maxLines) log.removeChild(log.firstChild);
    idx++;
    setTimeout(addLine, 1800 + Math.random() * 2200);
  }

  for (let i = 0; i < 5; i++) {
    const e = entries[i];
    const div = document.createElement('div');
    div.className = 'ops-demo-line';
    div.innerHTML =
      '<span class="ops-demo-ts">' + now() + '</span>' +
      '<span class="ops-demo-cmd">' + e.cmd + '</span>' +
      '<span class="ops-demo-msg' + (e.cls ? ' ' + e.cls : '') + '">' + e.msg + '</span>';
    log.appendChild(div);
    idx++;
  }
  setTimeout(addLine, 2000);
});

// -- Asset Scanner Counter + Particles --
document.addEventListener('DOMContentLoaded', () => {
  const counter = document.getElementById('assetCounter');
  const particles = document.getElementById('assetParticles');
  if (!counter) return;

  // Animate counter from 0 to 1000+
  let started = false;
  function animateCount() {
    if (started) return;
    started = true;
    const target = 1247;
    const duration = 2500;
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
      else counter.textContent = '1,247';
    }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { animateCount(); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(counter);
  } else {
    animateCount();
  }

  // Floating scan particles
  if (particles) {
    function spawnParticle() {
      const el = document.createElement('div');
      el.className = 'scan-particle';
      const angle = Math.random() * Math.PI * 2;
      const radius = 80 + Math.random() * 160;
      const cx = particles.offsetWidth / 2;
      const cy = particles.offsetHeight / 2;
      const endX = cx + Math.cos(angle) * radius;
      const endY = cy + Math.sin(angle) * radius;
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      el.style.setProperty('--tx', (endX - cx) + 'px');
      el.style.setProperty('--ty', (endY - cy) + 'px');
      el.style.animation = 'none';
      particles.appendChild(el);
      requestAnimationFrame(() => {
        el.style.animation = '';
        el.style.left = endX + 'px';
        el.style.top = endY + 'px';
      });
      setTimeout(() => el.remove(), 3000);
    }
    setInterval(spawnParticle, 200);
  }
});

// -- Demo Module Animations --
document.addEventListener('DOMContentLoaded', () => {

  // === Module 01: Autonomous Agent ===
  const agentLog = document.getElementById('agentLog');
  const cycleFill = document.getElementById('agentCycleFill');
  const cycleText = document.getElementById('agentCycleText');
  if (agentLog) {
    const agentEntries = [
      { cmd: 'MKT.SCAN', msg: 'Scanning 1,247 pairs...', cls: '' },
      { cmd: 'SIG.GEN', msg: 'BTC/USDT -- BUY -- conf 0.84', cls: 'log-green' },
      { cmd: 'RSK.CHK', msg: 'Portfolio risk nominal', cls: '' },
      { cmd: 'ORD.EXEC', msg: 'BUY 0.5 BTC @ $67,432 -- FILLED', cls: 'log-green' },
      { cmd: 'SL.TP', msg: 'Monitoring 4 positions -- 30s', cls: '' },
      { cmd: 'SIG.GEN', msg: 'ETH/USDT -- HOLD -- conf 0.52', cls: '' },
      { cmd: 'RGM.CALC', msg: 'Regime: BULL TREND', cls: 'log-green' },
      { cmd: 'SIG.GEN', msg: 'DOGE/USDT -- SELL -- conf 0.71', cls: 'log-red' },
      { cmd: 'COR.CHK', msg: 'BTC/ETH corr 0.87 -- size adj', cls: '' },
      { cmd: 'AGT.LOOP', msg: 'Cycle complete -- next in 5m', cls: '' },
    ];
    let aIdx = 0, cycle = 48;
    function agentTick() {
      const e = agentEntries[aIdx % agentEntries.length];
      const d = new Date();
      const ts = [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');
      const div = document.createElement('div');
      div.className = 'demo-agent-log-line ' + e.cls;
      div.innerHTML = '<span class="log-ts">' + ts + '</span><span class="log-cmd">' + e.cmd + '</span>' + e.msg;
      agentLog.insertBefore(div, agentLog.firstChild);
      if (agentLog.children.length > 5) agentLog.removeChild(agentLog.lastChild);
      aIdx++;
      if (aIdx % agentEntries.length === 0) cycle++;
    }
    // Cycle progress bar
    let progress = 0;
    setInterval(() => {
      progress = (progress + 2) % 100;
      if (cycleFill) cycleFill.style.width = progress + '%';
      if (cycleText) cycleText.textContent = 'CYCLE ' + cycle + (progress < 60 ? ' -- scanning...' : ' -- executing...');
    }, 120);
    setInterval(agentTick, 2200);
    agentTick();
  }

  // === Module 02: Signal Generator ===
  const signalCards = document.getElementById('signalCards');
  if (signalCards) {
    const signals = [
      { ticker: 'BTC', action: 'BUY', conf: 84, rsi: 42, entry: '$67,432', sl: '$65,200', tp: '$72,100' },
      { ticker: 'ETH', action: 'BUY', conf: 76, rsi: 38, entry: '$3,521', sl: '$3,310', tp: '$3,890' },
      { ticker: 'SOL', action: 'BUY', conf: 81, rsi: 45, entry: '$142.8', sl: '$134.0', tp: '$162.5' },
      { ticker: 'DOGE', action: 'SELL', conf: 69, rsi: 72, entry: '$0.142', sl: '$0.158', tp: '$0.118' },
      { ticker: 'RNDR', action: 'BUY', conf: 73, rsi: 35, entry: '$8.42', sl: '$7.80', tp: '$9.60' },
      { ticker: 'PEPE', action: 'SELL', conf: 67, rsi: 78, entry: '$0.0000124', sl: '$0.0000138', tp: '$0.0000098' },
      { ticker: 'AVAX', action: 'BUY', conf: 79, rsi: 41, entry: '$38.2', sl: '$35.5', tp: '$43.8' },
    ];
    let sIdx = 0;
    function renderSignals() {
      signalCards.innerHTML = '';
      const show = [];
      for (let i = 0; i < 3; i++) show.push(signals[(sIdx + i) % signals.length]);
      show.forEach(s => {
        const isBuy = s.action === 'BUY';
        const div = document.createElement('div');
        div.className = 'demo-signal-card';
        div.innerHTML =
          '<div><span class="demo-sig-ticker">' + s.ticker + '</span><br>' +
          '<span class="demo-badge demo-badge--' + (isBuy ? 'green' : 'red') + '">' + s.action + '</span></div>' +
          '<div class="demo-sig-mid"><span class="dm-label">RSI ' + s.rsi + ' | Entry ' + s.entry + '</span>' +
          '<span class="dm-label">SL ' + s.sl + ' | TP ' + s.tp + '</span></div>' +
          '<div class="demo-sig-conf ' + (isBuy ? 'dm-green' : 'dm-red') + '">' + s.conf + '%</div>';
        signalCards.appendChild(div);
      });
      sIdx++;
    }
    renderSignals();
    setInterval(renderSignals, 4000);
  }

  // === Module 04: Market Scanner ===
  const scannerRows = document.getElementById('scannerRows');
  if (scannerRows) {
    const tickers = [
      { t: 'BTC', p: 67432, c: 2.4 }, { t: 'ETH', p: 3521, c: 1.8 },
      { t: 'SOL', p: 142.8, c: 3.2 }, { t: 'DOGE', p: 0.142, c: -1.3 },
      { t: 'AVAX', p: 38.2, c: 4.1 }, { t: 'LINK', p: 14.8, c: -0.6 },
      { t: 'DOT', p: 7.42, c: 1.1 }, { t: 'MATIC', p: 0.89, c: -2.1 },
      { t: 'ARB', p: 1.24, c: 1.8 }, { t: 'RNDR', p: 8.42, c: 5.2 },
      { t: 'FET', p: 2.18, c: 3.7 }, { t: 'PEPE', p: 0.0000124, c: -4.2 },
      { t: 'INJ', p: 24.6, c: 2.9 }, { t: 'SUI', p: 1.82, c: 1.4 },
    ];
    function renderScanner() {
      tickers.forEach(tk => {
        tk.c += (Math.random() - 0.48) * 0.5;
        tk.p *= 1 + (Math.random() - 0.48) * 0.002;
      });
      scannerRows.innerHTML = '';
      tickers.slice(0, 8).forEach(tk => {
        const isUp = tk.c >= 0;
        const div = document.createElement('div');
        div.className = 'demo-scanner-row';
        const priceStr = tk.p >= 1 ? tk.p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : tk.p.toFixed(7);
        div.innerHTML =
          '<span class="scan-ticker">' + tk.t + '</span>' +
          '<span class="scan-price">$' + priceStr + '</span>' +
          '<span class="scan-chg ' + (isUp ? 'dm-green' : 'dm-red') + '">' +
          (isUp ? '+' : '') + tk.c.toFixed(1) + '%</span>';
        scannerRows.appendChild(div);
      });
    }
    renderScanner();
    setInterval(renderScanner, 2000);
  }

  // === Module 05: Regime Engine ===
  const regimeLabel = document.getElementById('regimeLabel');
  if (regimeLabel) {
    const regimes = [
      { id: 'Bull', label: 'BULL TREND', desc: 'Momentum rising -- buy pullbacks to support', color: 'var(--green)', fg: 72, fgLabel: 'GREED', seg: 'segBull' },
      { id: 'Accum', label: 'ACCUMULATION', desc: 'Volatility compressing -- build positions slowly', color: 'var(--cyan)', fg: 45, fgLabel: 'NEUTRAL', seg: 'segAccum' },
      { id: 'Range', label: 'RANGING', desc: 'Sideways chop -- reduce size, trade edges only', color: 'var(--yellow)', fg: 50, fgLabel: 'NEUTRAL', seg: 'segRange' },
      { id: 'Dist', label: 'DISTRIBUTION', desc: 'Smart money exiting -- tighten stops, reduce exposure', color: 'var(--purple)', fg: 62, fgLabel: 'GREED', seg: 'segDist' },
      { id: 'Bear', label: 'BEAR TREND', desc: 'Lower highs confirmed -- short rallies into resistance', color: 'var(--red)', fg: 24, fgLabel: 'FEAR', seg: 'segBear' },
    ];
    let rIdx = 0;
    function setRegime() {
      const r = regimes[rIdx % regimes.length];
      regimeLabel.textContent = r.label;
      regimeLabel.style.color = r.color;
      regimeLabel.style.textShadow = '0 0 10px ' + r.color;
      document.getElementById('regimeDesc').textContent = r.desc;
      document.querySelectorAll('.demo-regime-seg').forEach(s => s.classList.remove('active'));
      document.getElementById(r.seg).classList.add('active');
      document.getElementById('fgFill').style.width = r.fg + '%';
      document.getElementById('fgVal').textContent = r.fg + ' -- ' + r.fgLabel;
      document.getElementById('fgVal').className = 'dm-value ' + (r.fg > 55 ? 'dm-green' : r.fg < 35 ? 'dm-red' : 'dm-cyan');
      rIdx++;
    }
    setInterval(setRegime, 6000);
  }

  // === Module 06: Paper Trading Equity Chart ===
  const eqCanvas = document.getElementById('paperEquityChart');
  if (eqCanvas) {
    const ctx = eqCanvas.getContext('2d');
    const w = eqCanvas.width, h = eqCanvas.height;
    let equity = [100000];
    for (let i = 1; i < 50; i++) equity.push(equity[i - 1] * (1 + (Math.random() - 0.42) * 0.008));
    function drawEquity() {
      ctx.clearRect(0, 0, w, h);
      const min = Math.min(...equity) * 0.999;
      const max = Math.max(...equity) * 1.001;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      equity.forEach((v, i) => {
        const x = (i / (equity.length - 1)) * w;
        const y = h - ((v - min) / (max - min)) * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Fill under
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = 'rgba(245,158,11,0.06)';
      ctx.fill();
    }
    drawEquity();
    setInterval(() => {
      equity.push(equity[equity.length - 1] * (1 + (Math.random() - 0.42) * 0.005));
      if (equity.length > 60) equity.shift();
      drawEquity();
    }, 2000);
  }

  // === Matrix Rain behind coin ===
  const mc = document.getElementById('matrixRain');
  if (mc) {
    const ctx = mc.getContext('2d');
    const size = 280;
    mc.width = size;
    mc.height = size;
    const fontSize = 10;
    const cols = Math.floor(size / fontSize);
    const drops = new Array(cols).fill(0).map(() => Math.random() * -size / fontSize);
    const chars = '01₿$%&@#=+<>{}[]|/\\~';
    function drawMatrix() {
      ctx.fillStyle = 'rgba(12, 10, 8, 0.15)';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.font = fontSize + 'px monospace';
      for (var i = 0; i < cols; i++) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        var x = i * fontSize;
        var y = drops[i] * fontSize;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.25)';
        ctx.fillText(ch, x, y);
        if (y > size && Math.random() > 0.97) drops[i] = 0;
        drops[i] += 0.4 + Math.random() * 0.3;
      }
      requestAnimationFrame(drawMatrix);
    }
    drawMatrix();
  }
});
