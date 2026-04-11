export function renderProjectileMotion(container) {
  const section = document.createElement('section');
  section.className = 'exp-grid';

  const canvasContainer = document.createElement('div');
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  canvasContainer.appendChild(canvas);

  const controls = document.createElement('div');
  controls.className = 'glass-panel';
  controls.innerHTML = `
    <h2 style="margin-bottom: 1rem;">Hammer/Ball Collision</h2>
    <div class="input-group">
      <label class="input-label">Hammer Mass (g): <span id="mh-val">100</span></label>
      <input type="range" id="mh-slider" class="slider-input" min="30" max="150" step="7.5" value="7.5">
    </div>
    <div class="input-group">
      <label class="input-label">Hammer Length (cm): <span id="l-val">2.0</span></label>
      <input type="range" id="l-slider" class="slider-input" min="1" max="20" step="0.5" value="17">
    </div>
    <div class="input-group">
      <label class="input-label">Release Angle (°): <span id="angle-val">-45</span></label>
      <input type="range" id="angle-slider" class="slider-input" min="-90" max="90" step="15" value="-45">
    </div>
    <div class="input-group">
      <label class="input-label">Ball Mass (g): <span id="mb-val">50</span></label>
      <input type="range" id="mb-slider" class="slider-input" min="10" max="100" step="5" value="35">
    </div>
    <button id="fire-btn" class="button-primary" style="width: 100%; margin-top: 1rem;">Launch Hammer</button>
    <div id="results" style="margin-top: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 8px; font-size: 0.85rem;">
      <div id="v-impact">Impact Velocity: 0 m/s</div>
      <div id="v-ball">Ball Launch Velocity: 0 m/s</div>
      <div id="range-calc" style="color: var(--accent-primary); font-weight: 600;">Expected Range: 0 m</div>
      <div style="margin-top: 1rem; border-top: 1px solid #444; padding-top: 0.5rem;">
        <label class="input-label">Measured Range (cm):</label>
        <input type="number" id="measured-range" step="1" style="width: 100%; background: #222; border: 1px solid #444; color: #fff; padding: 5px; border-radius: 4px;">
        <div id="range-error" style="margin-top: 0.5rem; font-weight: 600;"></div>
      </div>
    </div>
  `;

  const analysisContainer = document.createElement('div');
  analysisContainer.className = 'glass-panel';
  analysisContainer.style.marginTop = '1.5rem';
  analysisContainer.innerHTML = `
    <div id="physics-explanation" style="font-family: monospace; background: rgba(70, 70, 70, 0.1); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(56, 56, 56, 0.2); font-size: 1rem;">
      <div style="color: var(--accent-primary); font-weight: bold; margin-bottom: 1rem; font-size: 1.3rem; border-bottom: 1px solid rgba(35, 35, 35, 0.2); padding-bottom: 0.75rem;">Calculations & Sensitivity</div>
      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: stretch;">
        
        <div id="exp-impact" style="flex: 1; min-width: 250px; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 6px;">
          <div style="color: var(--accent-secondary); font-weight: bold; margin-bottom: 0.75rem; font-size: 1.1rem;">1. Impact Velocity</div>
          <div style="padding-left: 0.25rem; color: #ddd; line-height: 1.8;">
            <div style="color: var(--text-secondary); font-size: 1em;">vᵢ = √[2gL(1-cosθ)]</div>
            <div>vᵢ = √[2·9.8·<span id="exp-l">0.17</span>·(1-cos<span id="exp-ang">45</span>°)]</div>
            <div style="margin-top: 0.75rem; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 0.75rem;">
              <strong>vᵢ = <span id="exp-vi" style="color: var(--accent-secondary); font-size: 1.25em;">0</span> m/s</strong>
              <div style="margin-top: 0.5rem; color: #bbb; font-size: 0.9em;">Δvᵢ (+0.5cm L): <strong style="color: #fff;"><span id="exp-vi-dl">0</span> m/s</strong></div>
              <div style="color: #bbb; font-size: 0.9em;">Δvᵢ (+15° θ): <strong style="color: #fff;"><span id="exp-vi-dtheta">0</span> m/s</strong></div>
            </div>
          </div>
        </div>

        <div id="exp-collision" style="flex: 1; min-width: 250px; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 6px;">
          <div style="color: var(--accent-primary); font-weight: bold; margin-bottom: 0.75rem; font-size: 1.1rem;">2. Momentum Transfer</div>
          <div style="padding-left: 0.25rem; color: #ddd; line-height: 1.8;">
            <div style="color: var(--text-secondary); font-size: 1em;">vᵦ = [2mₕ/(mₕ+mᵦ)]vᵢ</div>
            <div>vᵦ = [2·<span id="exp-mh">7</span>/(<span id="exp-mh2">7</span>+<span id="exp-mb">35</span>)]·vᵢ</div>
            <div style="margin-top: 0.75rem; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 0.75rem;">
              <strong>vᵦ = <span id="exp-vb" style="color: var(--accent-tertiary); font-size: 1.25em;">0</span> m/s</strong>
              <div style="margin-top: 0.5rem; color: #bbb; font-size: 0.9em;">Δvᵦ (+7.5g mₕ): <strong style="color: #fff;"><span id="exp-vb-dmh">0</span> m/s</strong></div>
              <div style="color: #bbb; font-size: 0.9em;">Δvᵦ (+5g mᵦ): <strong style="color: #fff;"><span id="exp-vb-dmb">0</span> m/s</strong></div>
            </div>
          </div>
        </div>

        <div id="exp-range" style="flex: 1; min-width: 250px; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 6px;">
          <div style="color: var(--accent-primary); font-weight: bold; margin-bottom: 0.75rem; font-size: 1.1rem;">3. Range Projection</div>
          <div style="padding-left: 0.25rem; color: #ddd; line-height: 1.8;">
            <div style="color: var(--text-secondary); font-size: 1em;">R = vᵦ√(2h/g)</div>
            <div>R = vᵦ·√[2·<span id="exp-h">0.16</span>/9.8]</div>
            <div style="margin-top: 0.75rem; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 0.75rem;">
              <strong>R = <span id="exp-range-final" style="color: var(--accent-primary); font-size: 1.25em;">0</span> cm</strong>
              <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem;">
                 <div style="color: #bbb; font-size: 0.9em;">ΔR (+0.5cm L): <strong style="color: #fff;"><span id="exp-r-dl">0</span> cm</strong></div>
                 <div style="color: #bbb; font-size: 0.9em;">ΔR (+15° θ): <strong style="color: #fff;"><span id="exp-r-dtheta">0</span> cm</strong></div>
                 <div style="color: #bbb; font-size: 0.9em;">ΔR (+7.5g mₕ): <strong style="color: #fff;"><span id="exp-r-dmh">0</span> cm</strong></div>
                 <div style="color: #bbb; font-size: 0.9em;">ΔR (+5g mᵦ): <strong style="color: #fff;"><span id="exp-r-dmb">0</span> cm</strong></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  section.appendChild(canvasContainer);
  section.appendChild(controls);
  container.appendChild(section);
  container.appendChild(analysisContainer);

  // Parameters
  const g = 9.81;
  const scale = 15;

  // Elements
  const sliders = {
    mh: controls.querySelector('#mh-slider'),
    l: controls.querySelector('#l-slider'),
    angle: controls.querySelector('#angle-slider'),
    mb: controls.querySelector('#mb-slider')
  };
  const displays = {
    mh: controls.querySelector('#mh-val'),
    l: controls.querySelector('#l-val'),
    angle: controls.querySelector('#angle-val'),
    mb: controls.querySelector('#mb-val'),
    vImpact: controls.querySelector('#v-impact'),
    vBall: controls.querySelector('#v-ball'),
    range: controls.querySelector('#range-calc'),
    expL: analysisContainer.querySelector('#exp-l'),
    expAng: analysisContainer.querySelector('#exp-ang'),
    expVi: analysisContainer.querySelector('#exp-vi'),
    expViDl: analysisContainer.querySelector('#exp-vi-dl'),
    expViDtheta: analysisContainer.querySelector('#exp-vi-dtheta'),
    expMh: analysisContainer.querySelector('#exp-mh'),
    expMh2: analysisContainer.querySelector('#exp-mh2'),
    expMb: analysisContainer.querySelector('#exp-mb'),
    expVb: analysisContainer.querySelector('#exp-vb'),
    expVbDm: analysisContainer.querySelector('#exp-vb-dmh'),
    expVbDmb: analysisContainer.querySelector('#exp-vb-dmb'),
    expH: analysisContainer.querySelector('#exp-h'),
    expRangeFinal: analysisContainer.querySelector('#exp-range-final'),
    expRDl: analysisContainer.querySelector('#exp-r-dl'),
    expRDtheta: analysisContainer.querySelector('#exp-r-dtheta'),
    expRDmh: analysisContainer.querySelector('#exp-r-dmh'),
    expRDmb: analysisContainer.querySelector('#exp-r-dmb')
  };
  const fireBtn = controls.querySelector('#fire-btn');

  let animationId = null;
  let startTime = 0;
  let state = 'idle'; // idle, swinging, flying
  let ballPos = { x: 0, y: 0 };
  let ballVel = { x: 0, y: 0 };

  function updateMath() {
    const mh = parseFloat(sliders.mh.value) / 1000; // convert g to kg
    const l = parseFloat(sliders.l.value);
    const angleRad = (parseFloat(sliders.angle.value) * Math.PI) / 180;
    const mb = parseFloat(sliders.mb.value) / 1000; // convert g to kg

    // Velocity at bottom: v = sqrt(2 * g * L * (1 - cos(theta)))
    const vImpact = Math.sqrt(2 * g * (l / 100) * (1 - Math.cos(angleRad)));
    // Elastic collision: v_ball = (2 * m_h / (m_h + m_b)) * v_h
    const vBall = (2 * mh / (mh + mb)) * vImpact;
    const hi = (33 - l) / 100;
    const tof = Math.sqrt(2 * hi / g);
    const range = vBall * tof;

    displays.mh.textContent = sliders.mh.value;
    displays.l.textContent = l;
    displays.angle.textContent = sliders.angle.value;
    displays.mb.textContent = sliders.mb.value;
    displays.vImpact.textContent = `Impact Velocity: ${vImpact.toFixed(2)} m/s`;
    displays.vBall.textContent = `Ball Launch Velocity: ${vBall.toFixed(2)} m/s`;
    displays.range.textContent = `Expected Range: ${range.toFixed(2) * 100} cm`;

    const getR = (_l, _ang, _mh, _mb) => {
      const _vi = Math.sqrt(2 * g * (_l / 100) * (1 - Math.cos(_ang)));
      const _vb = (2 * _mh / (_mh + _mb)) * _vi;
      const _hi = (33 - _l) / 100;
      const _tof = _hi > 0 ? Math.sqrt(2 * _hi / g) : 0;
      return _vb * _tof;
    };

    const vImpact_l_plus = Math.sqrt(2 * g * ((l + 0.5) / 100) * (1 - Math.cos(angleRad)));
    const delta_vI_L = vImpact_l_plus - vImpact;

    const angleRad_plus = angleRad + (15 * Math.PI / 180);
    const vImpact_ang_plus = Math.sqrt(2 * g * (l / 100) * (1 - Math.cos(angleRad_plus)));
    const delta_vI_ang = vImpact_ang_plus - vImpact;

    const mh_plus = mh + (7.5 / 1000);
    const vBall_mh_plus = (2 * mh_plus / (mh_plus + mb)) * vImpact;
    const delta_vB_mh = vBall_mh_plus - vBall;

    const mb_plus = mb + (5 / 1000);
    const vBall_mb_plus = (2 * mh / (mh + mb_plus)) * vImpact;
    const delta_vB_mb = vBall_mb_plus - vBall;

    const rBaseCm = range * 100;
    const delta_R_L = getR(l + 0.5, angleRad, mh, mb) * 100 - rBaseCm;
    const delta_R_ang = getR(l, angleRad_plus, mh, mb) * 100 - rBaseCm;
    const delta_R_mh = getR(l, angleRad, mh_plus, mb) * 100 - rBaseCm;
    const delta_R_mb = getR(l, angleRad, mh, mb_plus) * 100 - rBaseCm;

    // Fill Breakdown
    displays.expL.textContent = (l / 100).toFixed(2);
    displays.expAng.textContent = Math.abs(sliders.angle.value);
    displays.expVi.textContent = vImpact.toFixed(2);

    displays.expViDl.textContent = (delta_vI_L > 0 ? '+' : '') + delta_vI_L.toFixed(3);
    displays.expViDtheta.textContent = (delta_vI_ang > 0 ? '+' : '') + delta_vI_ang.toFixed(3);

    displays.expMh.textContent = sliders.mh.value;
    displays.expMh2.textContent = sliders.mh.value;
    displays.expMb.textContent = sliders.mb.value;
    displays.expVb.textContent = vBall.toFixed(2);

    displays.expVbDm.textContent = (delta_vB_mh > 0 ? '+' : '') + delta_vB_mh.toFixed(3);
    displays.expVbDmb.textContent = (delta_vB_mb > 0 ? '+' : '') + delta_vB_mb.toFixed(3);

    displays.expH.textContent = hi.toFixed(2);
    displays.expRangeFinal.textContent = rBaseCm.toFixed(1);

    displays.expRDl.textContent = (delta_R_L > 0 ? '+' : '') + delta_R_L.toFixed(2);
    displays.expRDtheta.textContent = (delta_R_ang > 0 ? '+' : '') + delta_R_ang.toFixed(2);
    displays.expRDmh.textContent = (delta_R_mh > 0 ? '+' : '') + delta_R_mh.toFixed(2);
    displays.expRDmb.textContent = (delta_R_mb > 0 ? '+' : '') + delta_R_mb.toFixed(2);

    const measuredInput = controls.querySelector('#measured-range').value;
    const errorDisplay = controls.querySelector('#range-error');
    if (measuredInput.trim() !== '' && !isNaN(parseFloat(measuredInput))) {
      const measured = parseFloat(measuredInput) / 100;
      const error = Math.abs((measured - range) / range) * 100;
      errorDisplay.textContent = `Error: ${error.toFixed(2)}%`;
      errorDisplay.style.color = error < 5 ? '#4ade80' : '#f87171';
    } else {
      errorDisplay.textContent = '';
    }

    return { vImpact, vBall, range, l, angleRad };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pivotX = canvas.width / 2 - 200;
    const pivotY = 50;
    const groundY = 545;

    const { l, angleRad, vBall } = updateMath();
    const lPx = l * scale;

    // Draw Ground & Scale
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, groundY); ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    for (let cm = -20; cm <= 60; cm += 5) {
      const px = pivotX + cm * (scale + 7.7);
      if (px < 0 || px > canvas.width) continue;

      const isMajor = cm % 5 === 0;
      ctx.beginPath();
      ctx.moveTo(px, groundY);
      ctx.lineTo(px, groundY + (isMajor ? 10 : 5));
      ctx.stroke();

      if (isMajor) {
        ctx.fillStyle = '#888';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${cm}`, px, groundY + 15);
      }
    }

    let currentAngle = angleRad;
    let hammerX = pivotX + lPx * Math.sin(currentAngle);
    let hammerY = pivotY + lPx * Math.cos(currentAngle);

    if (state === 'swinging') {
      const elapsed = (Date.now() - startTime) / 1000;
      // Simple harmonic motion approx or better: energy-based angle
      // For simplicity, let's just animate angle from alpha to 0
      const duration = 0.4; // Fixed swing duration for animation
      const progress = Math.min(elapsed / duration, 1);
      currentAngle = angleRad * (1 - progress);
      hammerX = pivotX + lPx * Math.sin(currentAngle);
      hammerY = pivotY + lPx * Math.cos(currentAngle);

      if (progress === 1) {
        state = 'flying';
        startTime = Date.now();
        ballPos = { x: hammerX, y: hammerY };
        // Launch direction depends on starting angle
        const launchDir = angleRad > 0 ? -1 : 1;
        ballVel = { x: launchDir * vBall * scale, y: 0 };
      }
    }

    if (state === 'flying') {
      const elapsed = (Date.now() - startTime) / 1000;
      // Ball projectile motion
      const launchDir = angleRad > 0 ? -1 : 1;
      const initialX = pivotX + (launchDir === 1 ? 0 : 0); // Ball is at center pivotX when hit
      ballPos.x = pivotX + ballVel.x * scale * elapsed;
      ballPos.y = (pivotY + lPx) + 0.5 * g * scale * elapsed * elapsed;

      // Draw Ball
      ctx.fillStyle = 'var(--accent-secondary)';
      ctx.beginPath();
      ctx.arc(ballPos.x, ballPos.y, 8, 0, Math.PI * 2);
      ctx.fill();

      if (ballPos.y >= groundY) {
        state = 'idle';
      }

      // Keep hammer at bottom
      currentAngle = 0;
      hammerX = pivotX + lPx * Math.sin(0);
      hammerY = pivotY + lPx * Math.cos(0);
    }

    // Draw Hammer
    ctx.strokeStyle = 'var(--text-secondary)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(hammerX, hammerY);
    ctx.stroke();

    // Hammer Head
    ctx.fillStyle = '#666';
    ctx.fillRect(hammerX - 20, hammerY - 10, 40, 20);

    // Pivot
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
    ctx.fill();

    if (state !== 'idle') {
      animationId = requestAnimationFrame(draw);
    }
  }

  fireBtn.addEventListener('click', () => {
    if (state !== 'idle') return;
    state = 'swinging';
    startTime = Date.now();
    draw();
  });

  Object.values(sliders).forEach(s => s.addEventListener('input', () => {
    if (state === 'idle') {
      updateMath();
      draw();
    }
  }));

  controls.querySelector('#measured-range').addEventListener('input', updateMath);

  draw();
}
