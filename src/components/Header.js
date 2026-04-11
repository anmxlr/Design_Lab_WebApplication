export function renderHeader(experiments, activeId, onNavigate) {
  const header = document.createElement('header');
  header.className = 'glass-panel';
  header.style.margin = '1rem';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';

  const logoContainer = document.createElement('div');
  logoContainer.style.display = 'flex';
  logoContainer.style.alignItems = 'end';
  logoContainer.style.gap = '0.75rem';

  const logoWrapper = document.createElement('div');
  logoWrapper.style.display = 'flex';
  logoWrapper.style.flexDirection = 'column';
  logoWrapper.style.alignItems = 'center';

  const logoImg = document.createElement('img');
  logoImg.src = '/src/img/logo/logo.png';
  logoImg.alt = 'CalKit Logo';
  logoImg.style.width = '12rem';
  logoImg.style.height = '3rem';
  logoImg.style.objectFit = 'contain';

  const tagline = document.createElement('div');
  tagline.textContent = 'BUILD • CREATE • DISCOVER';
  tagline.style.fontSize = '0.6rem';
  tagline.style.color = '#000000';
  tagline.style.letterSpacing = '2px';
  tagline.style.fontWeight = '600';
  tagline.style.marginTop = '-0.25rem';

  logoWrapper.appendChild(logoImg);
  logoWrapper.appendChild(tagline);

  const subtitle = document.createElement('span');
  subtitle.textContent = 'by CookedByCalculus™';
  subtitle.style.fontSize = '0.75rem';
  subtitle.style.color = '#000000';
  subtitle.style.fontWeight = '600';
  subtitle.style.letterSpacing = '0.5px';
  subtitle.style.marginBottom = '0.4rem';

  logoContainer.appendChild(logoWrapper);
  logoContainer.appendChild(subtitle);

  header.appendChild(logoContainer);

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
