export function renderTangentVisualizer(container) {
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
    <h2 style="margin-bottom: 1rem;">Tangent Visualizer</h2>
    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
      Drag the point on the curve to see how the tangent line changes.
    </p>
    <div class="input-group">
      <label class="input-label">Function f(x):</label>
      <input type="text" id="func-input" class="slider-input" style="background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); padding: 0.5rem; color: #fff;" value="0.0001*x^3 - 0.05*x">
      <div id="func-error" style="color: #f87171; font-size: 0.75rem; margin-top: 5px;"></div>
    </div>
    <div class="input-group">
      <label class="input-label">Point X: <span id="pos-display">0</span></label>
      <input type="range" id="x-slider" class="slider-input" min="-1000" max="1000" value="0">
    </div>
    <div class="input-group">
      <label class="input-label">Zoom Scale: <span id="scale-display">1.0</span>x</label>
      <input type="range" id="scale-slider" class="slider-input" min="0.1" max="5" step="0.1" value="1">
    </div>
    <div id="math-display" style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px;">
      <div id="func-display">f(x) = ...</div>
      <div id="deriv-val" style="color: var(--accent-primary); margin-top: 0.5rem;">f'(x) = ...</div>
      <div id="tangent-eq" style="color: var(--accent-secondary); margin-top: 0.25rem;">Tangent: ...</div>
    </div>
    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
      <button id="reset-view" class="button-primary" style="flex: 1; padding: 0.5rem; font-size: 0.8rem;">Reset View</button>
    </div>
    <div style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-secondary);">
      Drag graph to PAN • Scroll to ZOOM • x as variable
    </div>
  `;

  section.appendChild(canvasContainer);
  section.appendChild(controls);
  container.appendChild(section);

  const slider = controls.querySelector('#x-slider');
  const scaleSlider = controls.querySelector('#scale-slider');
  const resetBtn = controls.querySelector('#reset-view');
  const funcInput = controls.querySelector('#func-input');
  const funcError = controls.querySelector('#func-error');
  const funcDisplay = controls.querySelector('#func-display');
  const posDisplay = controls.querySelector('#pos-display');
  const scaleDisplay = controls.querySelector('#scale-display');
  const derivDisplay = controls.querySelector('#deriv-val');
  const tangentDisplay = controls.querySelector('#tangent-eq');

  let currentF = (x) => 0.0001 * Math.pow(x, 3) - 0.05 * x;
  let viewOffset = { x: 0, y: 0 };
  let viewScale = 1.0;
  let isDragging = false;
  let lastMouse = { x: 0, y: 0 };

  function transformer(str) {
    let jsStr = str.toLowerCase()
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/pi/g, 'Math.PI')
      .replace(/e/g, 'Math.E');
    return new Function('x', `try { return ${jsStr}; } catch(e) { return NaN; }`);
  }

  function getDerivative(f, x) {
    const h = 0.001;
    return (f(x + h) - f(x - h)) / (2 * h);
  }

  function updateFunction() {
    const val = funcInput.value;
    try {
      const testF = transformer(val);
      if (isNaN(testF(0)) && isNaN(testF(1))) throw new Error('Invalid');
      currentF = testF;
      funcError.textContent = '';
      funcDisplay.textContent = `f(x) = ${val}`;
      draw();
    } catch (e) {
      funcError.textContent = 'Invalid expression.';
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const originX = canvas.width / 2 + viewOffset.x;
    const originY = canvas.height / 2 + viewOffset.y;

    // Draw grid
    const gridSize = 50 * viewScale;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    for (let x = originX % gridSize; x < canvas.width; x += gridSize) {
      ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
    }
    for (let y = originY % gridSize; y < canvas.height; y += gridSize) {
      ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // Draw axes
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, originY); ctx.lineTo(canvas.width, originY);
    ctx.moveTo(originX, 0); ctx.lineTo(originX, canvas.height);
    ctx.stroke();

    // Draw curve
    ctx.strokeStyle = 'var(--accent-primary)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    // Map canvas X to math X: mathX = (canvasX - originX) / viewScale
    for (let cx = 0; cx < canvas.width; cx++) {
      const mx = (cx - originX) / viewScale;
      const my = currentF(mx);
      if (isNaN(my) || !isFinite(my)) {
        first = true;
        continue;
      }
      const cy = originY - my * viewScale;
      if (cy < -1000 || cy > canvas.height + 1000) { // Limit drawing range
        first = true;
        continue;
      }
      if (first) {
        ctx.moveTo(cx, cy);
        first = false;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();

    // Point and Tangent
    const currentX = parseFloat(slider.value);
    const currentY = currentF(currentX);

    if (!isNaN(currentY) && isFinite(currentY)) {
      const slope = getDerivative(currentF, currentX);
      const cx = originX + currentX * viewScale;
      const cy = originY - currentY * viewScale;

      // Tangent line
      ctx.strokeStyle = 'var(--accent-secondary)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const tLen = 200 * viewScale;
      const x1 = cx - tLen;
      const y1 = cy + slope * (cx - x1); // Use screen slope
      const x2 = cx + tLen;
      const y2 = cy - slope * (x2 - cx);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Point
      ctx.fillStyle = 'var(--accent-primary)';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'var(--accent-primary)';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      posDisplay.textContent = currentX.toFixed(1);
      derivDisplay.textContent = `f'(x) = ${slope.toFixed(4)}`;
      const intercept = currentY - slope * currentX;
      tangentDisplay.textContent = `y = ${slope.toFixed(2)}x ${intercept >= 0 ? '+' : ''} ${intercept.toFixed(2)}`;
    }

    scaleDisplay.textContent = viewScale.toFixed(1);
  }

  // Interactions
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouse = { x: e.clientX, y: e.clientY };
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    viewOffset.x += dx;
    viewOffset.y += dy;
    lastMouse = { x: e.clientX, y: e.clientY };
    draw();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'crosshair';
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.001;
    viewScale = Math.min(Math.max(viewScale - e.deltaY * zoomSpeed, 0.1), 100);
    scaleSlider.value = viewScale;
    draw();
  });

  scaleSlider.addEventListener('input', () => {
    viewScale = parseFloat(scaleSlider.value);
    draw();
  });

  resetBtn.addEventListener('click', () => {
    viewOffset = { x: 0, y: 0 };
    viewScale = 1.0;
    scaleSlider.value = 1.0;
    draw();
  });

  slider.addEventListener('input', draw);
  funcInput.addEventListener('input', updateFunction);
  canvas.style.cursor = 'crosshair';

  updateFunction();
}
