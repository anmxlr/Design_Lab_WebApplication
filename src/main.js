import './style.css';
import { renderHeader } from './components/Header.js';
import { renderProjectileMotion } from './components/ProjectileMotion.js';
import { renderSandCone } from './components/SandCone.js';
import { renderLaserMirror } from './components/LaserMirror.js';

const app = document.querySelector('#app');

const state = {
  currentExperiment: 'projectile'
};

const experiments = {
  projectile: { title: 'Hammer/Ball Collision', render: renderProjectileMotion },
  cone: { title: 'Sand Cone Growth', render: renderSandCone },
  laser: { title: 'Laser & Chain Rule', render: renderLaserMirror },
};

function init() {
  render();
}

function render() {
  app.innerHTML = '';
  app.appendChild(renderHeader(experiments, state.currentExperiment, (id) => {
    state.currentExperiment = id;
    render();
  }));

  const main = document.createElement('main');
  main.className = 'container';
  app.appendChild(main);

  const exp = experiments[state.currentExperiment];
  exp.render(main);
}

init();
