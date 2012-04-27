function Game(opts) {
  this.width     = opts.width;
  this.height    = opts.height;
  this.container = opts.container;
  this.loader    = opts.loader;

  // create projector for cordinate transform
  this.projector = new THREE.Projector();

  // create scene
  this.scene = new THREE.Scene();

  // create camera
  //this.camera = new THREE.OrthographicCamera(40, this.width / this.height, 1, 1000000);
  this.camera = new THREE.OrthographicCamera(-640, 640, 480, -480, 1, 1000000);
  this.camera.position.set(0, 0, 2500);
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
  $(this.container).append(this.renderer.domElement);
  $(this.renderer.domElement).css({
    'position'    : 'absolute',
    'left' : (window.innerWidth - this.width) / 2,
    'top'  : (window.innerHeight - this.height) / 2,
    'z-index': '11',
  });


  // create stats
  this.stats = new Stats();
  this.stats.domElement.style.position = 'absolute';
  this.stats.domElement.style.top = '0px';
  $(this.container).append(this.stats.domElement);

  // register events
  //document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
  //var gameScene = this.container.childNodes[0];
  //gameScene.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);
  $('#container').mousedown(this.onDocumentMouseDown.bind(this));

  this.controls = new THREE.TrackballControls(this.camera);
}

Game.prototype = {
  initScene:function() {
    this._currentScene = 'home';
    this._initUI();
    this._initCanvas();
    this._openHomeUI();
  },

  _initUI: function() {
    // init menu entry for uiHome
    this.uiHome = new THREE.Object3D();
    var startEntry = this.loader.cloneObject('apple');
    startEntry.rotationDelta = new THREE.Vector3(0, 0.1, 0);
    startEntry.position.x = -300;
    startEntry.rotation.x = 0.2;
    startEntry.rotation.z = 0.2;
    //startEntry.speed = new THREE.Vector3(10, 5, 0);
    this.uiHome.add(startEntry);
    this.uiHome.allChildren = startEntry.children.slice();
    console.log(this.uiHome.allChildren)

    var helpEntry = this.loader.cloneObject('watermelon');
    helpEntry.rotationDelta = new THREE.Vector3(0, 0.1, 0);
    helpEntry.rotation.x = 0.2;
    helpEntry.rotation.z = 0.2;
    this.uiHome.add(helpEntry);
    this.uiHome.allChildren = this.uiHome.allChildren.concat(helpEntry.children);

    // init uiAbout
    this.uiAbout = new THREE.Object3D();
    var returnEntry = this.loader.cloneObject('kiwi');
    returnEntry.rotationDelta = new THREE.Vector3(0, 0.1, 0);
    returnEntry.position.x = -300;
    this.uiAbout.add(returnEntry);
    this.uiAbout.allChildren = this.uiAbout.children.slice();

    // TODO: uiGame, uiConfig
  },
  
  _initCanvas: function() {
    var self = this;

    // create background canvas
    this.bgCanvas = new LayeredCanvas(2, this.width, this.height);
    $(this.bgCanvas.mainCanvas).css({
      'position'   : 'absolute',
      'left'       : (window.innerWidth - this.width) / 2,
      'top'        : (window.innerHeight - this.height) / 2,
      'box-shadow' : '0px 0px 25px rgba(0, 0, 0, 0.85)',
    });
    $(this.container).append(this.bgCanvas.mainCanvas);

    image = this.loader.images[0];
    start_ring_image = this.loader.images[1];

    this.bgCanvas.drawLayer(0, image, 0, 0, this.width, this.height);
    this.bgCanvas.drawLayer(1, start_ring_image);
    this.bgCanvas.angle = 0;
    this.bgCanvas.fps = 0;
    this.bgCanvas.needUpdate = true;
  },

  _openHomeUI: function() {
    this.scene.add(this.uiHome);
  },

  _openAboutUI: function() {
    this.scene.add(this.uiAbout);
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
    this._updateUI();
    this._updateCanvas();
    this._updateCamera();
    this.stats.update();
  },

  _updateCanvas: function() {
    this.bgCanvas.fps += 1;
    if (this.bgCanvas.fps % 2 == 0) {
      this.bgCanvas.needUpdate = true;
      this.bgCanvas.angle += 0.05;
      this.bgCanvas.drawRotateLayer(1, this.loader.images[1], this.bgCanvas.angle, 0, 0);
    }
     
    if (this.bgCanvas.needUpdate) {
      this.bgCanvas.update();
      this.bgCanvas.needUpdate = false;
    }
  },

  _updateUI: function() {
    if (this._currentScene == 'home') {
      this.uiHome.children.forEach(function(fruit) {
        fruit.update();
      });
    }
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
    event.preventDefault();

    if (this._currentScene == 'home') {
      var intersects;
      if (intersects = this._hasIntersection(event)) {
        console.log('hitted!')
        var parentObject = intersects[0].object.parent;
        console.log(parentObject)
        parentObject.sliced = true;
        parentObject.children.forEach(function(fruit) {
          fruit.rotationDelta = fruit.parent.rotationDelta;
          fruit.speed = new THREE.Vector3(Math.random() * 10 - 6, Math.random() * 5 -10, 0);
        });
        //this.uiHome.children[0].sliced = true;
        //this.scene.remove(this.uiHome);
        //this._openAboutUI();
      }
    }
    //this._needBackgroundUpdate = true;
    //if (this._hasIntersection(event)) {
      //this._drawSplashedJuice(event.offsetX, event.offsetY);
    //}
  },

  onDocumentMouseMove: function() {
  
  },

  _hasIntersection: function(event) {
    var mouseX = (event.offsetX/ this.width) * 2 - 1;
    var mouseY = -(event.offsetY/ this.height) * 2 + 1;

    var vector = new THREE.Vector3( mouseX, mouseY, 0.5 );
    this.projector.unprojectVector( vector, this.camera );

    var ray = new THREE.Ray( vector, new THREE.Vector3(0, 0, 1));

    var intersects = ray.intersectObjects(this.uiHome.allChildren);
    if (intersects.length  > 0) {
      return intersects;
    }
    return false;
  },
};

