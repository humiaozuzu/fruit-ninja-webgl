function CanvasNumber(loader, num) {
  this.number = num;
  this.loader = loader;
  this.canvas = document.createElement('canvas');
  this.context = this.canvas.getContext('2d');
  this.canvas.width = 128 * 4;
  this.canvas.height = 64;

  this.update = function(n) {
    this.number = n;
    var table = [0, 9, 4, 1, 3, 2, 5, 6, 7, 8]; 
    n = n + '';
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i = 0; i < n.length; i++) {
      this.context.drawImage(this.loader.images['numbers'], 38 * table[n[i]], 0, 38, 64, i*38, 0, 38, 64);
    }
  };

  this.add = function(n) {
    this.update(this.number + n);
  };

  this.sub = function(n) {
    this.update(this.number - n);
  };

  this.update(num);
};
