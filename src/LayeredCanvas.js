function LayeredCanvas(n, width, height) {
  this.mainCanvas = document.createElement('canvas');
  this.mainContext = this.mainCanvas.getContext('2d');
  this.mainCanvas.width = this.width = width;
  this.mainCanvas.height = this.height = height;
  this.score = 0;
  this.time = 60;

  // create canvas layers
  this.canvases = new Array(n);
  this.contexts = new Array(n);

  for (var i = 0; i < this.canvases.length; ++i) {
    this.canvases[i] = document.createElement("canvas");
    this.contexts[i] = this.canvases[i].getContext("2d");
    this.canvases[i].width = 1280;
    this.canvases[i].height = 960;
  }

  this.init = function(loader, rate, options) {
    this.loader = loader;
    this.rate = rate;
    this.counter = 0;
    this.needUpdate = true;

    // add backgound image
    this._drawOnLayer(0, loader.images['bg1']); // First layer
    this.updateScore();

    // slashed juice on the second layer
    this.juice = [];

    // menu entries in the third layer
    this.options = {
      home: [
        {image: loader.images['game'], x: 0, y: 0, animations: [
          { animateFuc: this.animations.rotate, timingFuc: this.timingFuctions.linear(0.02, 0) },
      ]},
      {image: loader.images['swag'], x: -300, y: 0, animations: [
        { animateFuc: this.animations.rotate, timingFuc: this.timingFuctions.linear(0.02, 0) },
      ]},
      {image: loader.images['about'], x: 300, y: 0, animations: [
        { animateFuc: this.animations.rotate, timingFuc: this.timingFuctions.linear(0.02, 0) },
      ]},
      ],
      game: [
        {image: loader.images['pause'], x: -600, y: -450},
        {image: loader.images['score'], x: 0, y: 0, noShortCut: true},
        {image: this.scoreCanvas, x: 64, y: 10, noShortCut: true},
        {image: this.timeCanvas, x: 640, y: 440 },
      ],
      about: [
        {image: loader.images['back'], x: 450, y: -350, animations: [
          { animateFuc: this.animations.rotate, timingFuc: this.timingFuctions.linear(0.02, 0) },
      ]},
      ]
    }
  };

  this.scoreCanvas = document.createElement('canvas');
  this.scoreContext = this.scoreCanvas.getContext('2d');
  this.scoreCanvas.width = 128 * 4;
  this.scoreCanvas.height = 64;

  this.timeCanvas = document.createElement('canvas');
  this.timeContext = this.timeCanvas.getContext('2d');
  this.timeCanvas.width = 128 * 2;
  this.timeCanvas.height = 64;

  this.updateScore = function() {
    var score = this.score;
    var table = [0, 9, 4, 1, 3, 2, 5, 6, 7, 8]; 
    score = score + '';
    this.scoreContext.clearRect(0, 0, this.scoreCanvas.width, this.scoreCanvas.height);
    for (var i = 0; i < score.length; i++) {
      this.scoreContext.drawImage(this.loader.images['numbers'], 38 * table[score[i]], 0, 38, 64, i*38, 0, 38, 64);
    }
  };

  this.updateTime = function() {
    var time = this.time;
    var table = [0, 9, 4, 1, 3, 2, 5, 6, 7, 8]; 
    time = time + '';
    this.timeContext.clearRect(0, 0, this.timeCanvas.width, this.timeCanvas.height);
    for (var i = 0; i < time.length; i++) {
      this.timeContext.drawImage(this.loader.images['numbers'], 38 * table[time[i]], 0, 38, 64, i*38, 0, 38, 64);
    }
    this.time -= 1;
  };

  this.addSplashedJuice = function(x, y, color, type, rotation) {
    //console.log(x, y);
    console.log(color+type);

    this.juice.push({image: this.loader.images['splash'+color+type], x: x, y: y, animations: [
                    { animateFuc: this.animations.alpha, timingFuc: this.timingFuctions.linear(-0.01, 1) },
                    { animateFuc: this.animations.rotate, timingFuc: this.timingFuctions.linear(0, rotation) },
    ]});
  };

  this.addNotice = function(name) {
    this.juice.push({image: this.loader.images[name], x: 0, y: 0, animations: [
                    { animateFuc: this.animations.alpha, timingFuc: this.timingFuctions.linear(-0.02, 1) },
    ]});
  };

  this.animations = {
    alpha: function(ctx, image, alpha) {
        //tmpContext.clearRect(0, 0, image.width, image.height);
        ctx.globalAlpha = alpha;
      },

    rotate: function(ctx, image, angle) {
      ctx.translate(image.width / 2 , image.height / 2);
      ctx.rotate(angle);
      ctx.translate(-image.width / 2 , -image.height / 2);
    },

  };

  this.timingFuctions = {
    linear: function(k, b) {
      var counter = 0;
      return function() {
        counter += 1;
        return k*counter + b;
      };
    },
  };

  this.update = function(sceneName, freq) {
    this.counter += 1;
    if (this.counter % this.rate == 0) {
      return;
    }
    // clear the 1 layer canvas
    //console.log('juice number', this.juice.length);
    this.contexts[1].clearRect(0, 0, 1280, 960);
    for (var i = 0; i < this.juice.length; i++) {
      var texture = this.juice[i];
      var alpha = texture.animations[0].timingFuc();
      if (alpha < 0) {
        this.juice[i] = this.juice[this.juice.length - 1];
        this.juice.pop();
        i--;
      } else {
        this.contexts[1].save();
        this.contexts[1].translate(this._canvasX(texture.x) - texture.image.width/2, this._canvasY(texture.y) - texture.image.height/2);
        for (var j = 0; j < texture.animations.length; j++) {
          texture.animations[j].animateFuc(this.contexts[1], texture.image, texture.animations[j].timingFuc());
        }
        this.contexts[1].drawImage(texture.image, 0, 0);
        this.contexts[1].restore();
      }
    }

    // clear the 2 layer canvas
    this.contexts[2].clearRect(0, 0, 1280, 960);

    for (var i in this.options[sceneName]) {
      var texture = this.options[sceneName][i];
      if (texture.animations) {
        this.contexts[2].save();
        this.contexts[2].translate(this._canvasX(texture.x) - texture.image.width/2, this._canvasY(texture.y) - texture.image.height/2);
        for (var j = 0; j < texture.animations.length; j++) {
          texture.animations[j].animateFuc(this.contexts[2], texture.image, texture.animations[j].timingFuc());
        }
        this.contexts[2].drawImage(texture.image, 0, 0);
        this.contexts[2].restore();
      } else {
        this._drawOnLayer(2, texture.image, texture.x, texture.y, texture.noShortCut);
        //console.log(texture);
      } 
    }

    //this.contexts[1].globalAlpha -= 0.01;
    for (var i = 0; i < this.canvases.length; ++i) {
      this.mainContext.drawImage(this.canvases[i], 0, 0, this.mainCanvas.width, this.mainCanvas.height);
    }
    this.needUpdate = true;
  };

  this._drawOnLayer = function(n, image, dx, dy, noShortCut) {
    if (typeof dx == 'undefined') {
      this.contexts[n].drawImage(image, 0, 0);
    } else {
      if (noShortCut) {
        this.contexts[n].drawImage(image, dx, dy);
      } else {
        this.contexts[n].drawImage(image, this._canvasX(dx) - image.width/2 , this._canvasY(dy) - image.height/2);
      }
    }
  };

  this._canvasX = function(x) {
    return x + 640;
  };

  this._canvasY = function(y) {
    return -y + 480;
  };

}

new Layer(0, 0, 'static', 'global', [
  { image: loader.images['bg1'], x: 0, y: 0, noShortCut: true}
]);

function Layer(width, height, type, scope, options) {
  this.type = type;
  this.scope = scope;
  this.options = options;
  this.needUpdate = true;
  this.lastScene = 'nothing';

  this.canvas = document.createElement('canvas');
  this.context = this.canvas.getContext('2d');
  this.canvas.width = this.width = width;
  this.canvas.height = this.height = height;

  this.add = function(texture) {
    this.options.push(texture); 
    this.needUpdate = true;
  };

  this.remove = function(texture) {
    var i = this.options(texture);
    if (i !== -1) {
      this.options.splice(i, 1);
    }
  }

  this.update = function(sceneName) {
    if (this.lastScene == sceneName) {
      this.needUpdate = true;
    }

    if (this.type == 'static' && this.needUpdate == true) {
      if (this.scope == 'global') {
        // update each texture to canvas
        for (var i; i < this.options.length; i++) {
          var texture = this.options[i]; 
          if (texture.noShortCut) {
            this.context.drawImage(texture.image, texture.x, texture.y);
          } else {
            this.context.drawImage(texture.image, this._canvasX(texture.x) - texture.image.width/2 , this._canvasY(texture.y) - texture.image.height/2);
          }
        }
      } else if (scope == 'sceneBased') {
        // TODO
      }
      this.needUpdate = false;
    } else if (this.type == 'animated') {
      if (this.scope == 'global') {
        // update each animated texture to canvas
        for (var i; i < this.options.length; i++) {
          var texture = this.options[i]; 
          this.context.save();
          this.context.translate(this._canvasX(texture.x) - texture.image.width/2, this._canvasY(texture.y) - texture.image.height/2);
          for (var j = 0; j < texture.animations.length; j++) {
            texture.animations[j].animateFuc(this.contexts, texture.image, texture.animations[j].timingFuc());
          }
          this.contexts[2].drawImage(texture.image, 0, 0);
          this.contexts[2].restore();
        }
      } 
    };
    this.lastScene = sceneName;

    this._canvasX = function(x) {
      return x + this.width/2;
    };

    this._canvasY = function(y) {
      return -y + this.height/2;
  };
}
