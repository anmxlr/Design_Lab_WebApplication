export function renderHeader(experiments, activeId, onNavigate) {
  const header = document.createElement('header');
  header.className = 'glass-panel';
  header.style.margin = '1rem';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';

  const logo = document.createElement('h1');
  logo.textContent = 'Cooked By Calculus';
  logo.style.fontSize = '1.5rem';
  logo.style.background = 'linear-gradient(135deg, #ff8400ff, #ffea00ff)';
  logo.style.webkitBackgroundClip = 'text';
  logo.style.webkitTextFillColor = 'transparent';
  header.appendChild(logo);

  const nav = document.createElement('nav');
  nav.style.display = 'flex';
  nav.style.gap = '1.5rem';

  Object.keys(experiments).forEach(id => {
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = experiments[id].title;
    link.style.textDecoration = 'none';
    link.style.color = id === activeId ? 'var(--accent-primary)' : 'var(--text-secondary)';
    link.style.fontWeight = id === activeId ? '600' : '400';
    link.style.fontSize = '0.9rem';
    link.style.transition = 'color 0.2s';

    link.addEventListener('click', (e) => {
      e.preventDefault();
      onNavigate(id);
    });

    nav.appendChild(link);
  });

  header.appendChild(nav);
  return header;
}
