function Game(opts) {
  this.width     = opts.width;
  this.height    = opts.height;
  this.container = opts.container;

  // create scene
  this.scene = new THREE.Scene();

  // create camera
  //this.camera = new THREE.OrthographicCamera(40, this.width / this.height, 1, 1000000);
  this.camera = new THREE.OrthographicCamera(-960, 960, 640, -640, 1, 1000000);
  this.camera.position.set(0, 0, 2637);
  this.scene.add(this.camera);

  // create lights
  var ambient = new THREE.AmbientLight(0xcccccc);
  this.scene.add(ambient);

  var mainLight = new THREE.DirectionalLight(0xffffff, 0.3);
  mainLight.position.set(0, 0, 1);
  this.scene.add(mainLight);

  // create renderer
  this.renderer = new THREE.WebGLRenderer({ antialias: true });
  this.renderer.setSize(this.width, this.height);
  container.appendChild(this.renderer.domElement);

  // create stats
  this.stats = new Stats();
  this.stats.domElement.style.position = 'absolute';
  this.stats.domElement.style.top = '0px';
  container.appendChild(this.stats.domElement);

  // register events
  document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
  var gameScene = this.container.childNodes[0];
  console.log(gameScene);
  gameScene.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);

  this.controls = new THREE.TrackballControls(this.camera);
}

Game.prototype = {
  initScene:function() {
    this._initBackground();
    this._initFruits();
  },

  _initBackground: function() {
    var self = this;
    var canvas = this._backgroundCanvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    this._juice = new Image();
    this._juice.src = 'images/classic.png';

    var image = new Image();
    image.onload = function() {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, image.width, image.height);
      var conbined = context.getImageData( 0, 0, image.width, image.height);

      var texture = new THREE.Texture(
        conbined, 
        new THREE.UVMapping()
      );
      texture.needsUpdate = true;
      var material = new THREE.MeshBasicMaterial({
        color: 0xffffff, 
        map: texture,
      });
      var geometry = new THREE.PlaneGeometry(1920, 1280);
      var mesh = new THREE.Mesh(geometry, material);
      self.scene.add(mesh);
      self._backgroundMesh = mesh;
    };
    image.src = 'images/background.jpg';
  },

  _initFruits: function() {
    var self = this;

    this._fruits = [];
   
    var createFruit = function(geometry) {
      var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial());
      var x = (Math.random() - 0.5) * 1920;
      var y = -500;
      var nx = -x;
      var vy = 17;
      var vx = (nx - x) / 3 / 60;
      mesh.speed = new THREE.Vector3(vx, 17, 0);
      mesh.scale.set(2, 2, 2);
      mesh.position.set(x, y, 100);
      mesh.rotationDelta = new THREE.Vector3(
        (Math.random() - 0.5) / 10, 
        (Math.random() - 0.5) / 10, 
        (Math.random() - 0.5) / 10
      );
      self.scene.add(mesh);
      self._fruits.push(mesh);
    };

    var loader = new THREE.JSONLoader();
    var models = [
      "models/apple/apple.js",
      "models/banana/banana.js",
      "models/kiwi/kiwi.js",
      //"models/orange/orange.js",
      //"models/pear/pear.js",
      //"models/strawberry/strawbarry.js",
      //"models/watermelon/watermelon.js",
    ];
    models.forEach(function(model) {
      loader.load(model, createFruit);
    });

  },

  renderLoop: function() {
    var self = this;
    (function loop() {
      requestAnimationFrame(loop);
      self._update();
      self._render(); 
    })();
  },

  _update: function() {
    this._updateBackgroungMesh();
    this._updateFruits();
    this._updateCamera();
    this.stats.update();
  },

  _updateBackgroungMesh: function() {
    if (!this._backgroundMesh || !this._needBackgroundUpdate) { 
      return; 
    }

    var canvas = this._backgroundCanvas;
    var context = canvas.getContext('2d');

    var image = context.getImageData( 0, 0, canvas.width, canvas.height);
    var texture = new THREE.Texture(
      image, 
      new THREE.UVMapping()
    );
    texture.needsUpdate = true;
    this._backgroundMesh.material.map = texture;  
    this._backgroundMesh.material.needsUpdate = true;
    this._needBackgroundUpdate = false;
  },

  _updateFruits: function() {
    this._fruits.forEach(function(fruit) {
      fruit.position.addSelf(fruit.speed);
      fruit.speed.y -= 9.8 / 60;
      fruit.rotation.addSelf(fruit.rotationDelta);
    });
  },

  _updateCamera: function() {
    this.controls.update();
    this.camera.lookAt(this.scene.position);
  },

  _render: function() {
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
  },

  onDocumentMouseDown: function(event) {
    this._needBackgroundUpdate = true;
    event.preventDefault();
    if (this._isInserted(event)) {
      console.log(123)
      this._drawSplashedJuice(event.offsetX, event.offsetY);
    }
  },

  onDocumentMouseMove: function() {
  
  },

  _drawSplashedJuice: function(x, y) {
    var canvas = this._backgroundCanvas;
    var context = canvas.getContext('2d');

    var scale =  this._backgroundCanvas.width / this.width;

    context.drawImage(this._juice, x * scale - this._juice.width / 2, y * scale - this._juice.height / 2, this._juice.width, this._juice.height);
  },

  _isInserted: function(event) {
    console.log(event.clientX, event.clientY) 
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    var projector = new THREE.Projector();
    var vector = new THREE.Vector3( mouseX, mouseY, 1 );
    projector.unprojectVector( vector, this.camera );
    console.log(vector.x, vector.y, vector.z)

    var ray = new THREE.Ray( this.camera.position, vector.subSelf( this.camera.position ).normalize() );

    var intersects = ray.intersectObjects(this._fruits);
    if (intersects.length  > 0) {
      console.log(this._fruits);
      return true;
    }
    return false;
  },
};



//container.appendChild( renderer.domElement );

//projector = new THREE.Projector();





//function onDocumentMouseDown( event ) {
//event.preventDefault();

//var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
//var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

//var vector = new THREE.Vector3( mouseX, mouseY, 1 );
//projector.unprojectVector( vector, camera );
//console.log(vector.x, vector.y, vector.z)

//var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

//var intersects = ray.intersectObjects(fruitObjs);

//if ( intersects.length > 0 ) {
//console.log(intersects);
//}
