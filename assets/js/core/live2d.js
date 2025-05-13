const { Live2DModel, MotionPreloadStrategy } = PIXI.live2d;
import { errorMessage } from "../utility/alert.js";
const canvas = document.getElementById('canvas');
const loader = document.getElementById('loader');
export let app;
export let model;

(async function () {
  // Add WebGL support check
  if (!PIXI.utils.isWebGLSupported()) {
    loader.style.display = 'none';
    errorMessage('WebGL tidak didukung di browser ini. Model Live2D tidak dapat ditampilkan.');
    return;
  }

  app = new PIXI.Application({
    backgroundAlpha: 0,
    view: canvas,
    powerPreference: "high-performance", // Add power preference
    preserveDrawingBuffer: true, // Help prevent context loss
    antialias: true
  });

  // Add context lost handler
  canvas.addEventListener('webglcontextlost', handleContextLost, false);
  canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

  try {
    model = await Live2DModel.from('assets/live2d/shizuku.model.json', {
      autoInteract: true,
      motionPreload: MotionPreloadStrategy.IDLE
    });

    app.stage.addChild(model);

    let mousestate = false;
    canvas.addEventListener('pointerenter', () => (mousestate = true));
    canvas.addEventListener('pointerleave', () => {
      model.internalModel.focusController.focus(0, 0);
      mousestate = false;
    });

    canvas.addEventListener('pointermove', ({ clientX, clientY }) => {
      if (mousestate) model.focus(clientX, clientY);
    });

    // expressions
    // interaction
    model.on('hit', (hitAreas) => {
      if (hitAreas.includes('body')) {
        model.motion('tap_body');
        console.log("tapped");
      }
    });

    window.MODEL = model;
    window.APP = app;

    // Fit model on model loaded
    fitModel();
    setTimeout(() => fitModel(), 250);

    // Trigger modelLoaded event
    document.dispatchEvent(new CustomEvent('modelLoaded'));
  } catch (error) {
    console.error('Failed to load the model', error);
    loader.style.display = 'none';
  }
})();

// Add context handlers
function handleContextLost(event) {
  event.preventDefault();
  console.warn('WebGL context lost. Attempting to restore...');
}

async function handleContextRestored() {
  console.log('WebGL context restored. Reloading model...');
  try {
    // Recreate application
    app.destroy(true);
    await initializeModel();
  } catch (error) {
    console.error('Failed to restore context:', error);
    loader.style.display = 'none';
  }
}

async function initializeModel() {
  app = new PIXI.Application({
    backgroundAlpha: 0,
    view: canvas,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true,
    antialias: true
  });

  model = await Live2DModel.from('assets/live2d/shizuku.model.json', {
    autoInteract: true,
    motionPreload: MotionPreloadStrategy.IDLE
  });

  app.stage.addChild(model);
  fitModel();
  
  // Restore event listeners and other setup
  let mousestate = false;
  canvas.addEventListener('pointerenter', () => (mousestate = true));
  canvas.addEventListener('pointerleave', () => {
    model.internalModel.focusController.focus(0, 0);
    mousestate = false;
  });

  canvas.addEventListener('pointermove', ({ clientX, clientY }) => {
    if (mousestate) model.focus(clientX, clientY);
  });

  model.on('hit', (hitAreas) => {
    if (hitAreas.includes('body')) {
      model.motion('tap_body');
      console.log("tapped");
    }
  });

  window.MODEL = model;
  window.APP = app;

  setTimeout(() => fitModel(), 250);
  document.dispatchEvent(new CustomEvent('modelLoaded'));
}

document.addEventListener('modelLoaded', () => {
  loader.style.display = 'none';
  console.log('Model has been successfully loaded and displayed.');
});

function fitModel() {
  console.log("im called");
  // set canvas and renderer before model
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Lebar layar tidak masalah pada md dan lg
  if (true) APP.renderer.screen.width = window.innerWidth;
  APP.renderer.screen.height = window.innerHeight;

  // Anchor di tengah untuk semua ukuran layar
  const anchor = {
    x: 0.5,
    y: 0.8
  };

  // Skala tetap sama untuk md dan lg, sedikit lebih kecil untuk sm
  const scale = {
    x: 0.2,
    y: 0.25
  };

  // Posisi x dan y di tengah layar
  const width = APP.renderer.screen.width / 2;
  const height = APP.renderer.screen.height / 2;

  MODEL.anchor.set(anchor.x, anchor.y);
  MODEL.scale.set(scale.x, scale.y);
  MODEL.x = width;
  MODEL.y = height;
}

window.addEventListener('resize', fitModel);