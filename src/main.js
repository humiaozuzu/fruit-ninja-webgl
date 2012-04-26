window.onload = function() {
  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  }

  // calculate width and height for game scene
  var width = window.innerWidth;
  var height = window.innerHeight;
  var aspect = 1.333;
  if (width / aspect > height) {
    height -= 20;
    width = height * aspect;
  } else {
    width -= 20;
    height = width / aspect -20;
  }

  var gameStart = function(x, y) {
    if (x == y) {
      console.log('loaded!!!')
      var opts = {
        width: width,
        height: height,
        container: document.getElementById('container'),
        loader: resourceLoader,
      };
      var game = new Game(opts);
      game.initScene();
      game.renderLoop();
    }
    console.log('Resource loading...')
  }

  var resourceLoader = new ResourceLoader();
  resourceLoader.load(gameStart);
};
