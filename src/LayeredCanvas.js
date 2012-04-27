function LayeredCanvas(n, width, height) {
  this.mainCanvas = document.createElement('canvas');
  this.mainContext = this.mainCanvas.getContext('2d');
  this.mainCanvas.width = this.width = width;
  this.mainCanvas.height = this.height = height;

  // create canvas layers
  this.canvases = new Array(n);
  this.contexts = new Array(n);

  for (var i = 0; i < this.canvases.length; ++i) {
    this.canvases[i] = document.createElement("canvas");
    this.contexts[i] = this.canvases[i].getContext("2d");
    this.canvases[i].width = this.mainCanvas.width;
    this.canvases[i].height = this.mainCanvas.height;
  }

  this.drawLayer = function(n, image, dx, dy, dw, dh) {
    if ( typeof dx != 'undefined') {
      this.contexts[n].drawImage(image, dx, dy, dw, dh);
    } else {
      this.contexts[n].drawImage(image, 0, 0);
    }
  };

  this.drawRotateLayer = function(n, image, angle, dx, dy, dw, dh) {
    this.contexts[n].clearRect(0, 0, 256, 256);
    this.contexts[n].save();
    this.contexts[n].translate(dx + image.width / 2, dy + image.height / 2);
    this.contexts[n].rotate(angle);
    this.contexts[n].drawImage(image, -(image.width / 2), -(image.height / 2));
    this.contexts[n].restore();
  }

  this.update = function() {
    for (var i = 0; i < this.canvases.length; ++i) {
      this.mainContext.drawImage(this.canvases[i], 0, 0);
    }
  }
}
