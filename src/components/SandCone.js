export function renderSandCone(container) {
  const section = document.createElement('section');
  section.className = 'exp-grid';

  const canvasContainer = document.createElement('div');
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  canvasContainer.appendChild(canvas);

  const controls = document.createElement('div');
  controls.className = 'glass-panel';
  controls.innerHTML = `
    <h2 style="margin-bottom: 1rem;">Sand Cone Growth</h2>
    <div class="input-group">
      <label class="input-label">Half Angle of Cone (φ°): <span id="angle-val">30</span></label>
      <input type="range" id="angle-slider" class="slider-input" min="15" max="60" value="30">
    </div>
    <div class="input-group">
      <label class="input-label">Sand per Iteration (ml): <span id="dv-val">50</span></label>
      <input type="range" id="dv-slider" class="slider-input" min="10" max="200" step="10" value="50">
    </div>
    <button id="add-sand-btn" class="button-primary" style="width: 100%; margin-top: 1rem;">Add Sand Unit</button>
    <button id="reset-btn" style="width: 100%; margin-top: 0.5rem; background: transparent; border: 1px solid var(--glass-border); color: #fff; padding: 0.5rem; border-radius: 8px; cursor: pointer;">Reset Cone</button>
    
    <div id="results" style="margin-top: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 8px; font-size: 0.85rem;">
      <div id="iter-count">Iterations: 0</div>
      <div id="h-val" style="color: var(--accent-primary); font-weight: 600; font-size: 1.1rem; margin-top: 0.5rem;">Height: 0.00 cm</div>
      <div id="dh-val" style="color: var(--text-secondary); margin-top: 0.25rem;">Last Δh: 0.00 cm</div>
      <div style="margin-top: 1rem; border-top: 1px solid #444; padding-top: 0.5rem;">
        <label class="input-label">Measured Height (cm):</label>
        <input type="number" id="measured-h" step="0.1" style="width: 100%; background: #222; border: 1px solid #444; color: #fff; padding: 5px; border-radius: 4px;">
        <div id="h-error" style="margin-top: 0.5rem; font-weight: 600;"></div>
      </div>
    </div>
  `;

  section.appendChild(canvasContainer);
  section.appendChild(controls);
  container.appendChild(section);

  const bottomGrid = document.createElement('div');
  bottomGrid.className = 'exp-grid';
  bottomGrid.style.marginTop = '1.5rem';

  const graphContainer = document.createElement('div');
  graphContainer.className = 'glass-panel';
  graphContainer.innerHTML = `
    <h3 style="margin-bottom: 1rem;">Analysis</h3>
    <div style="display: flex; gap: 1rem;">
      <div style="flex: 1; min-width: 0;">
        <div style="margin-bottom: 0.5rem; color: #bbb; font-size: 0.9em; text-align: center;">Height vs Volume (h-V)</div>
        <canvas id="h-v-graph" style="background: transparent; border: none; height: 200px; width: 100%;"></canvas>
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="margin-bottom: 0.5rem; color: #bbb; font-size: 0.9em; text-align: center;">Slope (dh/dV)</div>
        <canvas id="dh-dv-graph" style="background: transparent; border: none; height: 200px; width: 100%;"></canvas>
      </div>
    </div>
  `;

  const calcContainer = document.createElement('div');
  calcContainer.className = 'glass-panel';
  calcContainer.innerHTML = `
    <h3 style="margin-bottom: 1rem;">Calculations</h3>
    <div id="calc-steps" style="font-family: 'Inter', sans-serif; font-size: 0.85rem; color: var(--text-secondary);">
      <i>Add sand to see calculations...</i>
    </div>
  `;

  bottomGrid.appendChild(graphContainer);
  bottomGrid.appendChild(calcContainer);
  container.appendChild(bottomGrid);

  // State
  let currentVolume = 0;
  let iterations = 0;
  let lastHeight = 0;
  let dataHistory = [{ v: 0, h: 0 }];

  const sliders = {
    angle: controls.querySelector('#angle-slider'),
    dv: controls.querySelector('#dv-slider')
  };
  const displays = {
    angle: controls.querySelector('#angle-val'),
    dv: controls.querySelector('#dv-val'),
    iter: controls.querySelector('#iter-count'),
    h: controls.querySelector('#h-val'),
    dh: controls.querySelector('#dh-val')
  };
  const addBtn = controls.querySelector('#add-sand-btn');
  const resetBtn = controls.querySelector('#reset-btn');

  function update() {
    const angleGrad = (parseFloat(sliders.angle.value) * Math.PI) / 180;
    const tanPhi = Math.tan(angleGrad);
    const h = Math.pow((3 * currentVolume) / (Math.PI * tanPhi * tanPhi), 1 / 3);
    const dh = h - lastHeight;

    displays.angle.textContent = sliders.angle.value;
    displays.dv.textContent = sliders.dv.value;
    displays.iter.textContent = `Iterations: ${iterations}`;
    displays.h.textContent = `Height: ${h.toFixed(2)} cm`;
    displays.dh.textContent = `Last Δh: ${dh.toFixed(2)} cm`;

    const measured = parseFloat(controls.querySelector('#measured-h').value);
    const errorDisplay = controls.querySelector('#h-error');
    if (!isNaN(measured) && h > 0) {
      const error = Math.abs((measured - h) / h) * 100;
      errorDisplay.textContent = `Error: ${error.toFixed(2)}%`;
      errorDisplay.style.color = error < 5 ? '#4ade80' : '#f87171';
    } else {
      errorDisplay.textContent = '';
    }

    updateCalculations(h, currentVolume, angleGrad);
    drawGraph();

    return { h, tanPhi };
  }

  function updateCalculations(h, v, phi) {
    const calcSteps = section.parentElement.querySelector('#calc-steps');
    if (!calcSteps || v === 0) return;
    const tanPhi = Math.tan(phi);

    const getH = (_v, _phi) => Math.pow((3 * _v) / (Math.PI * Math.pow(Math.tan(_phi), 2)), 1 / 3);
    const dV_step = Number(sliders.dv.step) || 10;
    const dPhi_step = 1 * Math.PI / 180;

    const deltaH_dV = getH(v + dV_step, phi) - h;
    const deltaH_dPhi = getH(v, phi + dPhi_step) - h;

    calcSteps.innerHTML = `
      <div style="background: rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 8px; margin-bottom: 0.5rem;">
        <div style="color: var(--accent-tertiary); font-weight: 600; margin-bottom: 0.5rem;">1. Derivation & Dependence on φ:</div>
        <div style="font-size: 0.85em; color: #ccc; margin-bottom: 0.5rem; line-height: 1.4;">
           Base Cone Volume: <code style="color: #fff;">V = (1/3)πr²h</code><br/>
           Base Radius Dependence: <code style="color: #fff;">r = h · tan(φ)</code><br/>
           Substitute r: <code style="color: #fff;">V = (1/3)π(h·tan(φ))²h = (π/3)h³tan²(φ)</code><br/>
           Solve for h:
        </div>
        <code style="display: block; background: #000; padding: 0.5rem; border-radius: 4px; color: #fff;">
          h = ∛ [ (3V) / (π · tan²(φ)) ]
        </code>
      </div>

      <div style="background: rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 8px; margin-bottom: 0.5rem;">
        <div style="color: var(--accent-tertiary); font-weight: 600; margin-bottom: 0.5rem;">2. Sensitivity Derivative (dh/dV):</div>
        <div style="font-size: 0.85em; color: #ccc; line-height: 1.4;">
           The rate of height growth exponentially slows down as Volume grows:<br/>
           <code style="color: #fff; margin-top: 0.25rem; display: block;">dh/dV = ∛[ 1 / (9π·tan²(φ)) ] · V^(-2/3)</code>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem;">
        <div>V = <b>${v.toFixed(0)}</b> ml</div>
        <div>φ = <b>${(phi * 180 / Math.PI).toFixed(1)}°</b></div>
      </div>
      <div style="margin-top: 1rem; border-top: 1px solid var(--glass-border); padding-top: 1rem;">
        <div style="margin-bottom: 0.25rem; color: #888; font-size: 0.8em;">STEP 1: SUBSTITUTE VALUES</div>
        <div style="margin-bottom: 0.75rem; font-family: monospace; font-size: 1rem;">h = ∛ [ (3 · ${v}) / (π · ${tanPhi.toFixed(3)}²) ]</div>
        
        <div style="margin-bottom: 0.25rem; color: #888; font-size: 0.8em;">STEP 2: SIMPLIFY FRACTION</div>
        <div style="margin-bottom: 0.75rem; font-family: monospace; font-size: 1rem;">h = ∛ [ ${(3 * v).toFixed(1)} / ${(Math.PI * tanPhi * tanPhi).toFixed(3)} ]</div>
        
        <div style="margin-bottom: 0.25rem; color: #888; font-size: 0.8em;">STEP 3: EVALUATE INTERNAL RATIO</div>
        <div style="margin-bottom: 0.75rem; font-family: monospace; font-size: 1rem;">h = ∛ [ ${((3 * v) / (Math.PI * tanPhi * tanPhi)).toFixed(3)} ]</div>
        
        <div style="font-size: 1.1rem; color: var(--accent-primary); margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1);"><b>h = ${h.toFixed(3)} cm</b></div>
        
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed rgba(255,255,255,0.2);">
           <div style="color: #bbb; font-size: 0.9em; margin-bottom: 0.25rem;">Expected Δh (+${dV_step}ml V): <strong style="color: #fff;">${(deltaH_dV > 0 ? '+' : '')}${deltaH_dV.toFixed(3)} cm</strong></div>
           <div style="color: #bbb; font-size: 0.9em;">Expected Δh (+1° φ): <strong style="color: #fff;">${(deltaH_dPhi > 0 ? '+' : '')}${deltaH_dPhi.toFixed(3)} cm</strong></div>
        </div>
      </div>
    `;
  }

  function drawGraph() {
    const gCanvas = section.parentElement.querySelector('#h-v-graph');
    const dCanvas = section.parentElement.querySelector('#dh-dv-graph');
    if (!gCanvas || !dCanvas) return;

    const gCtx = gCanvas.getContext('2d');
    const dCtx = dCanvas.getContext('2d');

    // Scale canvas to its display size
    const rect = gCanvas.getBoundingClientRect();
    gCanvas.width = rect.width;
    gCanvas.height = 200;

    const dRect = dCanvas.getBoundingClientRect();
    dCanvas.width = dRect.width;
    dCanvas.height = 200;

    const padding = 30;
    const width = gCanvas.width - padding * 2;
    const height = gCanvas.height - padding * 2;

    gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);

    if (dataHistory.length <= 1) {
      gCtx.fillStyle = 'rgba(255,255,255,0.2)';
      gCtx.textAlign = 'center';
      gCtx.fillText('Add sand to see graph', gCanvas.width / 2, gCanvas.height / 2);
      return;
    }

    const maxV = Math.max(...dataHistory.map(d => d.v), 100);
    const maxH = Math.max(...dataHistory.map(d => d.h), 5);

    // Axes
    gCtx.strokeStyle = 'rgba(255,255,255,0.2)';
    gCtx.beginPath();
    gCtx.moveTo(padding, padding);
    gCtx.lineTo(padding, gCanvas.height - padding);
    gCtx.lineTo(gCanvas.width - padding, gCanvas.height - padding);
    gCtx.stroke();

    // Plot
    gCtx.strokeStyle = '#ff9900';
    gCtx.lineWidth = 2;
    gCtx.beginPath();
    dataHistory.forEach((d, i) => {
      const x = padding + (d.v / maxV) * width;
      const y = (gCanvas.height - padding) - (d.h / maxH) * height;
      if (i === 0) gCtx.moveTo(x, y);
      else gCtx.lineTo(x, y);
    });
    gCtx.stroke();

    // Trace effect
    const gradient = gCtx.createLinearGradient(0, padding, 0, gCanvas.height - padding);
    gradient.addColorStop(0, 'rgba(255, 153, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 153, 0, 0)');
    gCtx.fillStyle = gradient;
    gCtx.lineTo(padding + (dataHistory[dataHistory.length - 1].v / maxV) * width, gCanvas.height - padding);
    gCtx.lineTo(padding, gCanvas.height - padding);
    gCtx.fill();

    // Points
    gCtx.fillStyle = '#ff9900';
    dataHistory.forEach(d => {
      const x = padding + (d.v / maxV) * width;
      const y = (gCanvas.height - padding) - (d.h / maxH) * height;
      gCtx.beginPath();
      gCtx.arc(x, y, 3, 0, Math.PI * 2);
      gCtx.fill();
    });

    // Labels
    gCtx.fillStyle = '#777';
    gCtx.font = '10px Inter';
    gCtx.textAlign = 'left';
    gCtx.fillText('V (ml)', gCanvas.width - 30, gCanvas.height - padding + 15);
    gCtx.save();
    gCtx.translate(padding - 15, padding);
    gCtx.rotate(-Math.PI / 2);
    gCtx.fillText('h (cm)', 0, 0);
    gCtx.restore();

    // Slope indicator
    if (dataHistory.length >= 2) {
      const p1 = dataHistory[dataHistory.length - 2];
      const p2 = dataHistory[dataHistory.length - 1];

      const x1 = padding + (p1.v / maxV) * width;
      const y1 = (gCanvas.height - padding) - (p1.h / maxH) * height;
      const x2 = padding + (p2.v / maxV) * width;
      const y2 = (gCanvas.height - padding) - (p2.h / maxH) * height;

      gCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      gCtx.lineWidth = 1;
      gCtx.setLineDash([3, 3]);
      gCtx.beginPath();
      gCtx.moveTo(x1, y1);
      gCtx.lineTo(x2, y1);
      gCtx.lineTo(x2, y2);
      gCtx.stroke();
      gCtx.setLineDash([]);

      const dh = p2.h - p1.h;
      const dv = p2.v - p1.v;
      const slope = dh / dv;

      gCtx.fillStyle = '#fff';
      gCtx.font = '10px Inter';
      const align = x2 > gCanvas.width - 80 ? 'right' : 'left';
      const xOffset = align === 'right' ? -10 : 10;
      gCtx.textAlign = align;
      gCtx.fillText(`Slope = ${slope.toFixed(4)}`, x2 + xOffset, y2 - 10);

      gCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      if (Math.abs(y1 - y2) > 10) {
        gCtx.fillText(`Δh = ${dh.toFixed(2)}`, x2 + xOffset, y1 - (y1 - y2) / 2);
      }
      gCtx.textAlign = 'center';
      if (Math.abs(x2 - x1) > 20) {
        gCtx.fillText(`ΔV = ${dv.toFixed(0)}`, x1 + (x2 - x1) / 2, y1 + 12);
      }
    }

    // === DERIVATIVE GRAPH (dh/dV) ===
    dCtx.clearRect(0, 0, dCanvas.width, dCanvas.height);

    if (dataHistory.length <= 1) {
      dCtx.fillStyle = 'rgba(255,255,255,0.2)';
      dCtx.textAlign = 'center';
      dCtx.fillText('Add sand to see slope graph', dCanvas.width / 2, dCanvas.height / 2);
      return;
    }

    const dWidth = dCanvas.width - padding * 2;
    const dHeight = dCanvas.height - padding * 2;

    dCtx.strokeStyle = 'rgba(255,255,255,0.2)';
    dCtx.beginPath();
    dCtx.moveTo(padding, padding);
    dCtx.lineTo(padding, dCanvas.height - padding);
    dCtx.lineTo(dCanvas.width - padding, dCanvas.height - padding);
    dCtx.stroke();

    const getDhDv = (_v, _phi) => {
      const k = 3 / (Math.PI * Math.pow(Math.tan(_phi), 2));
      return (1 / 3) * Math.pow(k, 1 / 3) * Math.pow(_v, -2 / 3);
    };

    const currentPhi = (parseFloat(sliders.angle.value) * Math.PI) / 180;

    const slopePoints = dataHistory.filter(d => d.v > 0).map(d => ({
      v: d.v,
      slope: getDhDv(d.v, currentPhi)
    }));

    if (slopePoints.length === 0) return;

    const maxSlope = Math.max(...slopePoints.map(p => p.slope), 0.05);

    dCtx.strokeStyle = '#4ade80';
    dCtx.lineWidth = 2;
    dCtx.beginPath();
    const steps = 50;
    const vStart = Math.max(1, (maxV * 0.01));
    for (let i = 0; i <= steps; i++) {
      const vPlot = vStart + (maxV - vStart) * (i / steps);
      const sPlot = getDhDv(vPlot, currentPhi);
      const x = padding + (vPlot / maxV) * dWidth;
      const y = (dCanvas.height - padding) - Math.min(1, sPlot / maxSlope) * dHeight;
      if (i === 0) dCtx.moveTo(x, y);
      else dCtx.lineTo(x, y);
    }
    dCtx.stroke();

    dCtx.fillStyle = '#4ade80';
    slopePoints.forEach(p => {
      const x = padding + (p.v / maxV) * dWidth;
      const y = (dCanvas.height - padding) - Math.min(1, p.slope / maxSlope) * dHeight;
      dCtx.beginPath();
      dCtx.arc(x, y, 3, 0, Math.PI * 2);
      dCtx.fill();
    });

    dCtx.fillStyle = '#777';
    dCtx.font = '10px Inter';
    dCtx.textAlign = 'left';
    dCtx.fillText('V (ml)', dCanvas.width - 30, dCanvas.height - padding + 15);
    dCtx.save();
    dCtx.translate(padding - 15, padding);
    dCtx.rotate(-Math.PI / 2);
    dCtx.fillText('dh/dV', 0, 0);
    dCtx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { h, tanPhi } = update();
    const scale = 20; // 20 pixels per cm
    const hPx = h * scale;
    const rPx = hPx * tanPhi;

    const centerX = canvas.width / 2;
    const groundY = 450;
    const tipY = groundY - 50; // Tip of the main cone sits on the stand

    // Ground
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(centerX - 300, groundY);
    ctx.lineTo(centerX + 300, groundY);
    ctx.stroke();

    // Stand (Small Cone with 3D effect)
    const standGrad = ctx.createLinearGradient(centerX - 30, groundY, centerX + 30, groundY);
    standGrad.addColorStop(0, '#222');
    standGrad.addColorStop(0.5, '#444');
    standGrad.addColorStop(1, '#222');
    ctx.fillStyle = standGrad;
    ctx.beginPath();
    ctx.moveTo(centerX, tipY);
    ctx.lineTo(centerX + 30, groundY);
    ctx.lineTo(centerX - 30, groundY);
    ctx.closePath();
    ctx.fill();

    // Sand Cone (Inverted 3D)
    if (h > 0) {
      const scale = 20;
      const hPx = h * scale;
      const rPx = hPx * tanPhi;
      const topY = tipY - hPx;

      // Cone surface
      const coneGrad = ctx.createLinearGradient(centerX - rPx, topY, centerX + rPx, topY);
      coneGrad.addColorStop(0, '#d1a666'); // Darker sand
      coneGrad.addColorStop(0.5, '#feb47b'); // Lighter sand (var--accent-tertiary)
      coneGrad.addColorStop(1, '#d1a666');
      ctx.fillStyle = coneGrad;

      ctx.beginPath();
      ctx.moveTo(centerX, tipY);
      ctx.lineTo(centerX - rPx, topY);
      ctx.lineTo(centerX + rPx, topY);
      ctx.closePath();
      ctx.fill();

      // Top Ellipse (the "mouth" of the cone)
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; // Depth inside the cone mouth
      ctx.beginPath();
      ctx.ellipse(centerX, topY, rPx, rPx * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Top sand surface (inner)
      const innerGrad = ctx.createRadialGradient(centerX, topY, 0, centerX, topY, rPx);
      innerGrad.addColorStop(0, '#feb47b');
      innerGrad.addColorStop(1, '#c29656');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, topY, rPx, rPx * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  addBtn.addEventListener('click', () => {
    currentVolume += parseFloat(sliders.dv.value);
    const { h } = update();
    lastHeight = h;
    iterations++;
    dataHistory.push({ v: currentVolume, h: h });
    draw();
  });

  resetBtn.addEventListener('click', () => {
    currentVolume = 0;
    iterations = 0;
    lastHeight = 0;
    dataHistory = [{ v: 0, h: 0 }];
    draw();
  });

  sliders.angle.addEventListener('input', draw);
  sliders.dv.addEventListener('input', update);
  controls.querySelector('#measured-h').addEventListener('input', update);

  draw();
}
