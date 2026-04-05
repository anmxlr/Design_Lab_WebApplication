export function renderLaserMirror(container) {
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
    <h2 style="margin-bottom: 1rem;">Double-Mirror Setup</h2>
    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.85rem;">
      Reflect the laser off two mirrors to a scaled screen. Measure deflection and total path.
    </p>
    <div class="input-group">
      <label class="input-label">Laser Angle (α°): <span id="alpha-val">0</span></label>
      <input type="range" id="alpha-slider" class="slider-input" min="-20" max="20" step="1" value="0">
    </div>
    <div class="input-group">
      <label class="input-label">Mirror 1 Angle (θ₁°): <span id="theta1-val">45</span></label>
      <input type="range" id="theta1-slider" class="slider-input" min="0" max="90" step="15" value="60">
    </div>
    <div class="input-group">
      <label class="input-label">Mirror 2 Angle (θ₂°): <span id="theta2-val">-45</span></label>
      <input type="range" id="theta2-slider" class="slider-input" min="-90" max="0" step="15" value="-45">
    </div>
    
    <div id="math-display" style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; font-size: 0.8rem;">
      <div style="color: var(--accent-primary);">Experimental Data:</div>
      <div id="path-length" style="color: var(--text-primary); margin-top: 0.5rem;">Total Path: 0 units</div>
      <div id="screen-pos" style="color: var(--accent-secondary); margin-top: 0.25rem;">Spot Position: 0 cm</div>
      
      <div style="margin-top: 1rem; border-top: 1px solid #444; padding-top: 0.5rem;">
        <label class="input-label">Verify Spot Pos (cm):</label>
        <input type="number" id="measured-pos" step="0.1" style="width: 100%; background: #222; border: 1px solid #444; color: #fff; padding: 5px; border-radius: 4px;">
        <div id="pos-error" style="margin-top: 0.5rem; font-weight: 600;"></div>
      </div>
    </div>
  `;

  section.appendChild(canvasContainer);
  section.appendChild(controls);
  container.appendChild(section);

  const alphaSlider = controls.querySelector('#alpha-slider');
  const theta1Slider = controls.querySelector('#theta1-slider');
  const theta2Slider = controls.querySelector('#theta2-slider');
  const measuredInput = controls.querySelector('#measured-pos');

  const displays = {
    alpha: controls.querySelector('#alpha-val'),
    theta1: controls.querySelector('#theta1-val'),
    theta2: controls.querySelector('#theta2-val'),
    path: controls.querySelector('#path-length'),
    spot: controls.querySelector('#screen-pos'),
    error: controls.querySelector('#pos-error')
  };

  function getIntersection(rayOrigin, rayAngle, segmentA, segmentB) {
    const dx = Math.cos(rayAngle);
    const dy = -Math.sin(rayAngle); // Canvas Y is down

    const x1 = segmentA.x;
    const y1 = segmentA.y;
    const x2 = segmentB.x;
    const y2 = segmentB.y;

    const x3 = rayOrigin.x;
    const y3 = rayOrigin.y;
    const x4 = rayOrigin.x + dx;
    const y4 = rayOrigin.y + dy;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denominator === 0) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    if (t >= 0 && t <= 1 && u > 0) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1),
        dist: u
      };
    }
    return null;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const alphaDeg = parseFloat(alphaSlider.value);
    const theta1Deg = parseFloat(theta1Slider.value);
    const theta2Deg = parseFloat(theta2Slider.value);

    const alpha = alphaDeg * Math.PI / 180;
    const theta1 = -theta1Deg * Math.PI / 180;
    const theta2 = -theta2Deg * Math.PI / 180;

    // Optical Bench Layout
    const m1Pos = { x: 150, y: 400 };
    const m2Pos = { x: 150, y: 200 };
    const screenX = 350;
    const mLen = 300; // Mirror segment length

    const getMirrorEdges = (pos, angle) => ({
      a: { x: pos.x - (mLen / 2) * Math.sin(angle), y: pos.y + (mLen / 2) * Math.cos(angle) },
      b: { x: pos.x + (mLen / 2) * Math.sin(angle), y: pos.y - (mLen / 2) * Math.cos(angle) }
    });

    const m1Edges = getMirrorEdges(m1Pos, theta1 + Math.PI / 2);
    const m2Edges = getMirrorEdges(m2Pos, theta2);

    const sourceLen = 150;
    const sourcePos = {
      x: m1Pos.x - sourceLen * Math.cos(alpha),
      y: m1Pos.y - sourceLen * Math.sin(alpha)
    };

    // Draw Screen & Scale
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screenX, 0); ctx.lineTo(screenX, canvas.height);
    ctx.stroke();

    for (let y = 0; y <= canvas.height; y += 100) {
      ctx.beginPath();
      ctx.moveTo(screenX, y); ctx.lineTo(screenX + 10, y);
      ctx.stroke();
      const cm = (y) / 20;
      if (y % 1 === 0) {
        ctx.fillStyle = '#888';
        ctx.fillText(`${cm.toFixed(0)}`, screenX + 15, y + 3);
      }
    }

    // Step 0: Mirror Graphics (Base Layer)
    const drawMirror = (pos, angle, edges) => {
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(edges.a.x, edges.a.y);
      ctx.lineTo(edges.b.x, edges.b.y);
      ctx.stroke();
      //
    };

    drawMirror(m1Pos, theta1, m1Edges);
    drawMirror(m2Pos, theta2, m2Edges);

    // Step 1: Laser Source to Mirror 1
    ctx.save();
    ctx.translate(sourcePos.x, sourcePos.y);
    ctx.rotate(-alpha);
    ctx.fillStyle = '#666';
    ctx.fillRect(-20, -10, 40, 20);
    ctx.restore();

    ctx.strokeStyle = '#ff5100ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff4444ff';

    let totalPath = 0;
    let currentPos = sourcePos;
    let currentAngle = alpha;

    // Ray 1: Source to M1
    const hit1 = getIntersection(currentPos, currentAngle, m1Edges.a, m1Edges.b);
    if (hit1) {
      ctx.beginPath();
      ctx.moveTo(currentPos.x, currentPos.y);
      ctx.lineTo(hit1.x, hit1.y);
      ctx.stroke();
      totalPath += hit1.dist;

      // Reflection 1: theta_refl = 2*theta_mirror - theta_inc
      currentAngle -= (2 * theta1);
      currentPos = hit1;

      // Ray 2: M1 to M2
      const hit2 = getIntersection(currentPos, currentAngle, m2Edges.a, m2Edges.b);
      if (hit2) {
        ctx.beginPath();
        ctx.moveTo(currentPos.x, currentPos.y);
        ctx.lineTo(hit2.x, hit2.y);
        ctx.stroke();
        totalPath += hit2.dist;

        // Reflection 2: theta_refl = 2*theta_mirror - (theta_inc + PI)
        currentAngle = -(2 * theta2) - currentAngle - Math.PI;
        currentPos = hit2;

        // Ray 3: M2 to Screen (at screenX)
        const dx = Math.cos(currentAngle);
        const dy = -Math.sin(currentAngle);
        if (dx > 0) {
          const t_screen = (screenX - currentPos.x) / dx;
          const endY = currentPos.y + t_screen * dy;

          ctx.beginPath();
          ctx.moveTo(currentPos.x, currentPos.y);
          ctx.lineTo(screenX, endY);
          ctx.stroke();

          totalPath += Math.sqrt(Math.pow(screenX - currentPos.x, 2) + Math.pow(endY - currentPos.y, 2));

          // Spot
          ctx.fillStyle = '#ff0000ff';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(screenX, endY, 5, 0, Math.PI * 2);
          ctx.fill();

          const spotCM = (endY) / 20;
          displays.spot.textContent = `Spot Position: ${spotCM.toFixed(2)} cm`;

          const measured = parseFloat(measuredInput.value);
          if (!isNaN(measured)) {
            const error = Math.abs(measured - spotCM);
            displays.error.textContent = `Error: ${error.toFixed(2)} cm`;
            displays.error.style.color = error < 0.5 ? '#4ade80' : '#f87171';
          }
        } else {
          displays.spot.textContent = 'Spot Position: Out of bonds';
        }
      } else {
        // Missed Mirror 2
        const distToEdge = 1000;
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.3)'; // Dimmer if missed
        ctx.beginPath();
        ctx.moveTo(currentPos.x, currentPos.y);
        ctx.lineTo(currentPos.x + distToEdge * Math.cos(currentAngle), currentPos.y - distToEdge * Math.sin(currentAngle));
        ctx.stroke();
        displays.spot.textContent = 'Spot Position: Missed Mirror 2';
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(currentPos.x, currentPos.y);
      ctx.lineTo(currentPos.x + 1000 * Math.cos(alpha), currentPos.y - 1000 * Math.sin(alpha));
      ctx.stroke();
      displays.spot.textContent = 'Spot Position: Missed Mirror 1';
    }

    displays.alpha.textContent = alphaDeg;
    displays.theta1.textContent = theta1Deg;
    displays.theta2.textContent = theta2Deg;
    displays.path.textContent = `Total Path: ${(totalPath / 20).toFixed(1)} cm`;
  }

  alphaSlider.addEventListener('input', draw);
  theta1Slider.addEventListener('input', draw);
  theta2Slider.addEventListener('input', draw);
  measuredInput.addEventListener('input', draw);

  draw();
}
