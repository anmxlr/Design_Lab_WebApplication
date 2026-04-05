# PhysInteractive | Math & Physics Visualizers

**PhysInteractive** is a premium, interactive web application designed to help students and educators visualize complex mathematical and physics concepts across several interactive experiments. Built with a focus on modern aesthetics (glassmorphism) and real-time canvas rendering, the app allows users to bridge the gap between theoretical calculations and visual simulations.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Installation
1. Clone the repository (or extract the project files):
   ```bash
   cd DE_webapp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
To launch the development server and view the simulations:
```bash
npm run dev
```
The application will typically be available at `http://localhost:5173/`.

---

## 🧬 Interactive Experiments

### 1. Tangent Visualizer
Visualizes the relationship between a function, its derivative, and its tangent line.
- **Interaction**: Drag the point along the curve $f(x) = 0.0001x^3 - 0.05x$.
- **Real-time Math**: Displays the tangent equation and the instantaneous slope ($f'(x)$).

### 2. Hammer/Ball Collision (Projectile Motion)
Simulates a pendulum collision and the resulting projectile motion.
- **Bidirectional Swing**: Adjust the release angle between -90° and 90° for left/right launches.
- **Physics**: Uses elastic collision equations to calculate the ball's launch velocity based on hammer mass ($g$), ball mass ($g$), and pendulum length ($m$).
- **Verification**: Input measured experimental results to calculate error percentage against theoretical range.

### 3. Sand Cone Growth (3D Inverted)
An advanced 3D visualization of volume-to-height relationships in an inverted cone.
- **3D Rendering**: High-fidelity gradients and elliptical mouths provide a volumetric sense of depth.
- **Discrete Steps**: Add sand in fixed increments of milliliters ($ml$) and watch the height increase in centimeters ($cm$).
- **Insight**: Demonstrates why the height increment ($\Delta h$) decreases as the total volume grows.

### 4. Laser & Mirror (The Chain Rule)
A sophisticated optics setup illustrating the Chain Rule through a compound relationship.
- **Rotatable Components**: Both the mirror (via a slider) and the laser source itself are rotatable.
- **Law of Reflection**: Uses $\beta = 2\theta - \alpha$ to calculate the reflected spot position.
- **Chain Rule**: Explicitly breaks down the derivative $dy/ds = (dy/d\beta) \cdot (d\beta/d\theta) \cdot (d\theta/ds)$ in real-time.

---

## 🛠️ Technical Stack
- **Framework**: Vite
- **Language**: Vanilla JavaScript (ES6+)
- **Graphics**: HTML5 Canvas API (Custom 2D/3D visualizers)
- **Styling**: Vanilla CSS with CSS Variables and Glassmorphism effects
- **Typography**: Outfit & Inter (Google Fonts)

## 📄 License
This project is for educational purposes. All physics and math models are calculated using standard SI and derived units.
