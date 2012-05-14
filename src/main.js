/*
 * Main function that dectect screen size, preload resouces and init the game
 */

window.onload = function() {
  // check browser webgl support
  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  }

  // calculate width and height for game scene
  var width = window.innerWidth;
  var height = window.innerHeight;
  var aspect = 1.333;
  if (width / aspect > height) {
    height -= 40;
    width = height * aspect;
  } else {
    width -= 40;
    height = width / aspect -20;
  }

/*
 * callback function that start the game with screen size and loaded resouces
 */
  function startGame() {
    var opts = {
      width: width,
      height: height,
      container: document.getElementById('container'),
      loader: loader
    };
    var game = new Game(opts);
    game.initScene();
    game.renderLoop();
  }

/*
 * Callback function that showing the progress of loading resouces
 */
  function showProgress(total, loaded) {
    console.log(loaded+'/'+total);
  }

  // initialize the prelaoder with resouces paths
  var loader = new ThreePreloader({
    images: {
      // textures for 2d canvas
      bg1: 'images/bg_i_heart_sensei_1280_960.jpg',
      bg2: 'images/bg_store_1280_960.jpg',
      game: 'images/ring_start.png',
      about: 'images/ring_about.png',
      swag: 'images/ring_senseis_swag.png',
      back: 'images/ring_back.png',
      quit: 'images/quit_button.png',
      pause: 'images/pause_button.png',
      play: 'images/play_button.png',
      retry: 'images/retry_button.png',
      numbers: 'images/arcade_numbers.png',
      score: 'images/hud_fruit.png',
      splash1: 'images/slashed_juice2.png',
      // textures for 3d objects
      apple1: 'models/apple/apple_skin.jpg',
      apple2: 'models/apple/apple_stem.jpg',
      apple3: 'models/apple/apple_half.jpg',
      banana1: 'models/banana/banana_skin.jpg',
      banana2: 'models/banana/banana_half.jpg',
      watermelon1 : 'models/watermelon/watermelon_skin.jpg',
      watermelon2 : 'models/watermelon/watermelon_half.jpg',
      kiwi1: 'models/kiwi/kiwi_skin.jpg',
      kiwi2: 'models/kiwi/kiwi_half.jpg',
      kiwi3: 'models/kiwi/kiwi_bottom.jpg',
      // textures particle systems
      watermelonJuice: 'images/particles/w_big_juice.png',
      orangeJuice: 'images/particles/o_big_juice.png'
    },
    objects: {
      apple1: 'models/apple/apple_half1.js',
      apple2: 'models/apple/apple_half2.js',
      banana1: 'models/banana/banana_half1.js',
      banana2: 'models/banana/banana_half2.js',
      watermelon1 : 'models/watermelon/watermelon_half1.js',
      watermelon2 : 'models/watermelon/watermelon_half2.js',
      kiwi1: 'models/kiwi/kiwi_half1.js',
      kiwi2: 'models/kiwi/kiwi_half2.js'
    },
    sounds: {},
    onSuccess: startGame,
    onProgress: showProgress
  });
  loader.load();
};
