// ── DALIOS Docs — Sidebar active state + smooth scroll ──

document.addEventListener('DOMContentLoaded', () => {
  const sidebarLinks = document.querySelectorAll('.docs-sidebar-section a');
  const sections = [];

  sidebarLinks.forEach(link => {
    const id = link.getAttribute('href')?.replace('#', '');
    const section = id ? document.getElementById(id) : null;
    if (section) sections.push({ id, el: section, link });
  });

  // Highlight active sidebar link on scroll
  function updateActive() {
    const scrollY = window.scrollY + 120;
    let current = sections[0];

    for (const s of sections) {
      if (s.el.offsetTop <= scrollY) {
        current = s;
      }
    }

    sidebarLinks.forEach(l => l.classList.remove('active'));
    if (current) current.link.classList.add('active');
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
});
