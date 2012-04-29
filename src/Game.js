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
    //this._initUI();
    //
    this.um = new UIManager();
    console.log('initing UIs');
    this.um.init(this.loader);
    this._initCanvas();
    this._openHomeUI();
    this._openTestUI();
  },

  _initUI: function() {
    var self = this;
    // init menu entry for uiHome
    this.uiHome = new THREE.Object3D();
    var startEntry = this.loader.cloneObject('kiwi');
    startEntry.rotationDelta = new THREE.Vector3(0, 0.1, 0);
    startEntry.position.x = -300;
    startEntry.rotation.x = 0.2;
    startEntry.rotation.z = 0.2;
    startEntry.name = 'start';
    //startEntry.speed = new THREE.Vector3(10, 5, 0);
    this.uiHome.add(startEntry);
    this.uiHome.allChildren = startEntry.children.slice();
    console.log(this.uiHome.allChildren)

    var helpEntry = this.loader.cloneObject('watermelon');
    helpEntry.rotationDelta = new THREE.Vector3(0, 0.1, 0);
    helpEntry.rotation.x = 0.2;
    helpEntry.rotation.z = 0.2;
    helpEntry.name = 'about';
    this.uiHome.add(helpEntry);
    this.uiHome.allChildren = this.uiHome.allChildren.concat(helpEntry.children);

    // init uiAbout
    this.uiAbout = new THREE.Object3D();
    var returnEntry = this.loader.cloneObject('banana');
    returnEntry.rotationDelta = new THREE.Vector3(0, 0.1, 0);
    returnEntry.position.x = -300;
    returnEntry.name = 'return';
    this.uiAbout.add(returnEntry);
    this.uiAbout.allChildren = this.uiAbout.children.slice();

    var objectName = 'kiwi';
    var loader = new THREE.JSONLoader();
    loader.load('models/'+objectName+'/'+objectName+'_half1.js', function(geometry) {
      object = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial());
      object.rotationDelta = new THREE.Vector3(0, 0.1, 0);
      object.position.z = 100;
      object.position.x = 300;
      object.scale.set(2, 2, 2);
      object.sliced = false;
      self.scene.add(object);
    });

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
      'box-shadow' : '0px 2px 35px rgba(0, 0, 0, 0.85)',
    });
    $(this.container).append(this.bgCanvas.mainCanvas);

    image = this.loader.images[0];
    start_ring_image = this.loader.images[1];

    this.bgCanvas.drawLayer(0, image);
    this.bgCanvas.drawLayer(1, start_ring_image);
    this.bgCanvas.angle = 0;
    this.bgCanvas.fps = 0;
    this.bgCanvas.needUpdate = true;
  },

  _openHomeUI: function() {
    this.scene.add(this.um.uiHome);
  },

  _openTestUI: function() {
    //this.scene.add(this.uiTest);
  },

  _openAboutUI: function() {
    this.scene.add(this.um.uiAbout);
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
      this.bgCanvas.drawRotateLayer(1, this.loader.images[1], this.bgCanvas.angle, 0, 0, true);
      this.bgCanvas.drawRotateLayer(1, this.loader.images[2], this.bgCanvas.angle, -300, 0, false);
      this.bgCanvas.drawRotateLayer(1, this.loader.images[3], this.bgCanvas.angle, 300, 0, false);
    }
     
    if (this.bgCanvas.needUpdate) {
      this.bgCanvas.update();
      this.bgCanvas.needUpdate = false;
    }
  },

  _updateUI: function() {
    if (this._currentScene == 'home') {
      this.um.uiHome.children.forEach(function(fruit) {
        fruit.update();
      });
    }
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
        console.log(parentObject.name)
        if (parentObject.name == 'about') {
          console.log(123)
          this.scene.remove(this.um.uiHome);
          this._openAboutUI();
          this._currentScene = 'about';
        }
        console.log(parentObject.name)
      }
    } else if (this._currentScene == 'about') {
      var intersects;
      if (intersects = this._hasIntersection(event)) {
        console.log('hitted!')
        var parentObject = intersects[0].object.parent;
        console.log(parentObject.name)
        parentObject.sliced = true;
        parentObject.children.forEach(function(fruit) {
          fruit.rotationDelta = fruit.parent.rotationDelta;
          fruit.speed = new THREE.Vector3(Math.random() * 10 - 6, Math.random() * 5 -10, 0);
        });
        //this.uiHome.children[0].sliced = true;
        if (parentObject.name == 'return') {
          this.scene.remove(this.um.uiAbout);
          this.um.reset(this.um.uiHome);
          console.log(this.um.uiHome.aboutEntry)
          this._openHomeUI();
          this._currentScene = 'home';
        }
      }
    }
  },

  onDocumentMouseMove: function() {
  
  },

  _buildIntersectList: function() {
    var intersectList = []; 

    if (this._currentScene == 'home') {
      this.um.uiHome.children.forEach(function(fruit) {
        intersectList = intersectList.concat(fruit.children); 
      });
    }
    if (this._currentScene == 'about') {
      this.um.uiAbout.children.forEach(function(fruit) {
        intersectList = intersectList.concat(fruit.children); 
      });
    }
    return intersectList;
  },

  _hasIntersection: function(event) {
    var mouseX = (event.offsetX/ this.width) * 2 - 1;
    var mouseY = -(event.offsetY/ this.height) * 2 + 1;

    var vector = new THREE.Vector3( mouseX, mouseY, 0.5 );
    this.projector.unprojectVector( vector, this.camera );

    var ray = new THREE.Ray( vector, new THREE.Vector3(0, 0, 1));

    var intersects = ray.intersectObjects(this._buildIntersectList());
    if (intersects.length  > 0) {
      return intersects;
    }
    return false;
  },
};

