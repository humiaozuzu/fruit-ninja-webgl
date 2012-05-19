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
    var i = this.options.indexOf(texture);
    console.log('iiiii', i)
    if (i !== -1) {
      this.options.splice(i, 1);
      console.log(this.options)
    }
  }

  this.update = function(sceneName) {
    if (this.lastScene == sceneName) {
      this.needUpdate = true;
    }
    if (this.needUpdate == true) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.type == 'static' && this.needUpdate == true) {
      if (this.scope == 'global') {
        // update each texture to canvas
        for (var i = 0; i < this.options.length; i++) {
          var texture = this.options[i]; 
          if (texture.noShortCut) {
            this.context.drawImage(texture.image, texture.x, texture.y);
          } else {
            this.context.drawImage(texture.image, this._canvasX(texture.x) - texture.image.width/2 , this._canvasY(texture.y) - texture.image.height/2);
          }
        }
      } else if (scope == 'sceneBased' && options.hasOwnProperty(sceneName)) {
        // update each texture to canvas
        for (var i = 0; i < this.options[sceneName].length; i++) {
          var texture = this.options[sceneName][i]; 
          if (texture.noShortCut) {
            this.context.drawImage(texture.image, texture.x, texture.y);
          } else {
            this.context.drawImage(texture.image, this._canvasX(texture.x) - texture.image.width/2 , this._canvasY(texture.y) - texture.image.height/2);
          }
        }
        // TODO
      }
      this.needUpdate = false;
    } else if (this.type == 'animated') {
      if (this.scope == 'global') {
        // update each animated texture to canvas
        for (var i = 0; i < this.options.length; i++) {
          var texture = this.options[i]; 
          if (texture.frame != undefined) {
            if (texture.frame == 0) {
              this.remove(texture); 
              i -= 1;
            }
            texture.frame -= 1;
          }
          this.context.save();
          this.context.translate(this._canvasX(texture.x) - texture.image.width/2, this._canvasY(texture.y) - texture.image.height/2);
          for (var j = 0; j < texture.animations.length; j++) {
            texture.animations[j].animateFuc(this.context, texture.image, texture.animations[j].timingFuc());
          }
          this.context.drawImage(texture.image, 0, 0);
          this.context.restore();
        }
      }  else if (scope == 'sceneBased' && options.hasOwnProperty(sceneName)) {
        // update each animated texture to canvas
        for (var i = 0; i < this.options[sceneName].length; i++) {
          var texture = this.options[sceneName][i]; 
          if (texture.frame != undefined) {
            if (texture.frame == 0) {
              this.remove(texture); 
              i -= 1;
            }
            texture.frame -= 1;
          }
          this.context.save();
          this.context.translate(this._canvasX(texture.x) - texture.image.width/2, this._canvasY(texture.y) - texture.image.height/2);
          for (var j = 0; j < texture.animations.length; j++) {
            texture.animations[j].animateFuc(this.context, texture.image, texture.animations[j].timingFuc());
          }
          this.context.drawImage(texture.image, 0, 0);
          this.context.restore();
        }
      }
    };
    this.lastScene = sceneName;
  };

  this._canvasX = function(x) {
    return x + this.width/2;
  };

  this._canvasY = function(y) {
    return -y + this.height/2;
  };
}

function LayeredCanvas(width, height) {
  this.mainCanvas = document.createElement('canvas');
  this.mainContext = this.mainCanvas.getContext('2d');
  this.mainCanvas.width = this.width = width;
  this.mainCanvas.height = this.height = height;
  this.counter = 0;
  this.rate = 2;
  this.layers = [];

  this.addLayer = function(type, scope, alias, options) {
    this.layers.push(new Layer(1280, 960, type, scope, options));    
    this.layers[alias] = this.layers[this.layers.length - 1];
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

    for (var i = 0; i < this.layers.length; ++i) {
      this.layers[i].update(sceneName);
      this.mainContext.drawImage(this.layers[i].canvas, 0, 0, this.mainCanvas.width, this.mainCanvas.height);
    }
  }; 

  this._canvasX = function(x) {
    return x + this.width/2;
  };

  this._canvasY = function(y) {
    return -y + this.height/2;
  };
}

