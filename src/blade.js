var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var points = [];
var mousedown = false;
var counter = 0;

init();
animate();

function init() {

  canvas.width = 800;
  canvas.height = 600;
  $('#container').append(canvas);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );
  $('#container').append(stats.domElement);

  // register events
  $('#container').mousedown(this.onDocumentMouseDown);
  $('#container').mouseup(this.onDocumentMouseUp);
  $('#container').mousemove(this.onDocumentMouseMove);
}

//

function onDocumentMouseDown( event ) {
  event.preventDefault();
  mousedown = true;
}

function onDocumentMouseMove( event ) {
  if (mousedown) {
    console.log(event.offsetX, event.offsetY);
    points.push(new THREE.Vector2(event.offsetX, event.offsetY));
  }
}

function onDocumentMouseUp( event ) {
  mousedown = false;
  // clear all the points when mouse up
  points = [];
}


function animate() {
  requestAnimationFrame( animate );
  render();
  stats.update();
}

function render() {
  // update line queue
  counter += 1;
  if (counter % 2 == 0) {
    points.shift();
  }
  ctx.clearRect(0, 0, 800, 600);
  if (points.length) {
    // update line
    ctx.beginPath();
    ctx.moveTo(points[0].x,points[0].y);
    for (var i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x,points[i].y);
      // draw ~~
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(points[0].x,points[0].y);
    for (var i = 1; i < points.length-4; i++) {
      var angle = getDirection(points[i-1].x, points[i-1].y, points[i].x, points[i].y);
      //console.log(angle);
      var x = Math.sin(angle) * 15;
      var y = Math.cos(angle) * 15;
      ctx.lineTo(points[i].x + x,points[i].y - y);
      // draw ~~
    }
    ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
    ctx.stroke();
  }
}

function getDirection(x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;

  return Math.atan2(dy,  dx);
}
