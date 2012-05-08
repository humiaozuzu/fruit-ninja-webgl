function LayeredCanvas(n, width, height) {
  this.mainCanvas = document.createElement('canvas');
  this.mainContext = this.mainCanvas.getContext('2d');
  this.mainCanvas.width = this.width = width;
  this.mainCanvas.height = this.height = height;
  this.angle = 0;

  // create canvas layers
  this.canvases = new Array(n);
  this.contexts = new Array(n);

  for (var i = 0; i < this.canvases.length; ++i) {
    this.canvases[i] = document.createElement("canvas");
    this.contexts[i] = this.canvases[i].getContext("2d");
    this.canvases[i].width = 1280;
    this.canvases[i].height = 960;
  }

  this.init = function(loader, rate) {
    this.loader = loader;
    this.rate = rate;
    this.counter = 0;
    this.needUpdate = true;

    // add backgound image
    var image = this.loader.images['bg1'];
    this._drawLayer(0, image);
  }

  this.update = function(sceneName, freq) {
    this.counter += 1;
    if (this.counter % this.rate == 0) {
      return;
    }

    if (sceneName == 'home') {
      this.angle += 0.05;
      var start = this.loader.images['start'];
      var settings = this.loader.images['settings'];

      this._drawRotateLayer(1, this.loader.images['start'], this.angle, 0, 0, true);
      this._drawRotateLayer(1, this.loader.images['settings'], this.angle, -300, 0, false);
    } else if (sceneName == 'about') {
      this.angle += 0.05;
      var back = this.loader.images['back'];
      this._drawRotateLayer(1, this.loader.images['back'], this.angle, 300, -300, true);
    } else if (sceneName == 'game') {
      var bomb = this.loader.images['bomb'];      
      this._drawLayer(1, bomb, 450, -350);
    }

    for (var i = 0; i < this.canvases.length; ++i) {
      this.mainContext.drawImage(this.canvases[i], 0, 0, this.mainCanvas.width, this.mainCanvas.height);
    }
    this.needUpdate = true;
  };

  this._drawLayer = function(n, image, dx, dy) {
    this.contexts[n].clearRect(0, 0, 1280, 960);
    if (typeof dx == 'undefined') {
      this.contexts[n].drawImage(image, 0, 0);
    } else {
      this.contexts[n].drawImage(image, this._canvasX(dx), this._canvasY(dy));
    }
  };

  this._drawRotateLayer = function(n, image, angle, dx, dy, needClear) {
    if (needClear) {
      this.contexts[n].clearRect(0, 0, 1280, 960);
    }
    this.contexts[n].save();
    this.contexts[n].translate(this._canvasX(dx) , this._canvasY(dy));
    this.contexts[n].rotate(angle);
    this.contexts[n].drawImage(image, -(image.width / 2), -(image.height / 2));
    this.contexts[n].restore();
  };


  this._canvasX = function(x) {
    return x + 640;
  };

  this._canvasY = function(y) {
    return -y + 480;
  };
}
