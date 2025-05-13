const { Live2DModel, MotionPreloadStrategy } = PIXI.live2d;
import { errorMessage } from "../utility/alert.js";
const canvas = document.getElementById('canvas');
const loader = document.getElementById('loader');
export let app;
export let model;

// Add failsafe cleanup
function cleanupWebGL() {
  if (app) {
    app.destroy(true, { children: true, texture: true, baseTexture: true });
  }
  if (model) {
    model.destroy();
  }
}

// Add WebGL context error monitoring
PIXI.utils.skipHello();
PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;

function handleWebGLContextError(event) {
  if (event && event.preventDefault) event.preventDefault();
  cleanupWebGL();
  errorMessage("WebGL context hilang. Mohon tunggu, sedang mencoba memulihkan...");
  loader.style.display = 'block';
  // Remove resize listener when WebGL fails
  window.removeEventListener('resize', fitModel);
}

// Handler untuk context restored
async function handleWebGLContextRestored(event) {
  // Bersihkan dan inisialisasi ulang model
  try {
    await initializeModel();
    loader.style.display = 'none';
    errorMessage("WebGL berhasil dipulihkan. Model telah dimuat ulang.");
  } catch (e) {
    errorMessage("Gagal memulihkan WebGL. Silakan refresh browser.");
  }
}

// Add renderer lost listener
function addRendererListeners() {
  if (app && app.renderer) {
    app.renderer.on('webglcontextlost', handleWebGLContextError);
    app.renderer.on('webglcontextrestored', handleWebGLContextRestored);
  }
}

(async function () {
  try {
    // Cleanup any existing instance
    cleanupWebGL();

    // Force PIXI to use WebGL 1
    PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL;
    
    if (!PIXI.utils.isWebGLSupported()) {
      throw new Error('WebGL tidak didukung');
    }

    app = new PIXI.Application({
      backgroundAlpha: 0,
      view: canvas,
      powerPreference: "default",
      preserveDrawingBuffer: true,
      antialias: true,
      failIfMajorPerformanceCaveat: false,
      depth: false,
      stencil: false
    });

    // Add renderer listeners right after app creation
    addRendererListeners();

    // Tambahkan event listener pada canvas dengan passive: false
    canvas.addEventListener('webglcontextlost', handleWebGLContextError, { passive: false });
    canvas.addEventListener('webglcontextrestored', handleWebGLContextRestored, { passive: false });

    // Verify context is valid
    if (!app.renderer.gl || app.renderer.gl.isContextLost()) {
      throw new Error('WebGL context tidak valid');
    }

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

    model.on('hit', (hitAreas) => {
      if (hitAreas.includes('body')) {
        model.motion('tap_body');
        console.log("tapped");
      }
    });

    window.MODEL = model;
    window.APP = app;

    // Only add resize listener after successful initialization
    window.addEventListener('resize', fitModel);

    fitModel();
    setTimeout(() => fitModel(), 250);

    document.dispatchEvent(new CustomEvent('modelLoaded'));

  } catch (error) {
    console.error('Model loading failed:', error);
    handleWebGLContextError();
  }
})();

async function initializeModel() {
  try {
    cleanupWebGL();

    app = new PIXI.Application({
      backgroundAlpha: 0,
      view: canvas,
      powerPreference: "default",
      preserveDrawingBuffer: true,
      antialias: true,
      failIfMajorPerformanceCaveat: false,
      depth: false,
      stencil: false
    });

    // Add renderer listeners right after app creation
    addRendererListeners();

    // Tambahkan event listener pada canvas dengan passive: false
    canvas.addEventListener('webglcontextlost', handleWebGLContextError, { passive: false });
    canvas.addEventListener('webglcontextrestored', handleWebGLContextRestored, { passive: false });

    model = await Live2DModel.from('assets/live2d/shizuku.model.json', {
      autoInteract: true,
      motionPreload: MotionPreloadStrategy.IDLE
    });

    app.stage.addChild(model);
    fitModel();
    
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

    // Only add resize listener after successful initialization
    window.addEventListener('resize', fitModel);

    setTimeout(() => fitModel(), 250);
    document.dispatchEvent(new CustomEvent('modelLoaded'));
  } catch (error) {
    console.error('Failed to initialize model:', error);
    handleWebGLContextError();
  }
}

document.addEventListener('modelLoaded', () => {
  loader.style.display = 'none';
  console.log('Model has been successfully loaded and displayed.');
});

function fitModel() {
  // Guard against undefined APP/MODEL and ensure model is ready
  if (!window.APP || !window.MODEL || typeof window.MODEL.update !== "function") {
    console.warn('APP or MODEL not initialized or not ready');
    return;
  }

  console.log("im called");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  APP.renderer.screen.width = window.innerWidth;
  APP.renderer.screen.height = window.innerHeight;

  const anchor = {
    x: 0.5,
    y: 0.8
  };

  const scale = {
    x: 0.2,
    y: 0.25
  };

  const width = APP.renderer.screen.width / 2;
  const height = APP.renderer.screen.height / 2;

  MODEL.anchor.set(anchor.x, anchor.y);
  MODEL.scale.set(scale.x, scale.y);
  MODEL.x = width;
  MODEL.y = height;
}

window.addEventListener('resize', fitModel);