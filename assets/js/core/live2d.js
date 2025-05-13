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

function handleWebGLContextError() {
  cleanupWebGL();
  errorMessage("WebGL context hilang. Mohon refresh browser anda.");
  loader.style.display = 'none';
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

    // Add error handlers
    app.renderer.on('context', handleWebGLContextError);
    canvas.addEventListener('webglcontextlost', handleWebGLContextError);
    canvas.addEventListener('webglcontextrestored', () => location.reload());

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

    // Add error handlers
    app.renderer.on('context', handleWebGLContextError);
    canvas.addEventListener('webglcontextlost', handleWebGLContextError);
    canvas.addEventListener('webglcontextrestored', () => location.reload());

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
  console.log("im called");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (true) APP.renderer.screen.width = window.innerWidth;
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