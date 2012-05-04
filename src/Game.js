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
  $('#container').mousedown(this.onDocumentMouseDown.bind(this));
  $('#container').mouseup(this.onDocumentMouseUp.bind(this));
  $('#container').mousemove(this.onDocumentMouseMove.bind(this));

  this.controls = new THREE.TrackballControls(this.camera);
}

Game.prototype = {
  initScene:function() {
    console.log(this.loader);
    //this.scene.add(new Fruit(this.loader, 'apple'));

    console.log('Initializing UI manager for game!')
    this.um = new UIManager(this.scene);
    this.um.init(this.loader);

    console.log('Initializing Canvas for game!')
    this._initCanvas();
    //this.um.add('home');
    //this._test();

    console.log('Creating fsm for game!')
    this.fsm = StateMachine.create({
      initial: 'home',
      events: [
        { name: 'enterAbout', from : 'home',  to: 'about'},
        { name: 'exitAbout',  from : 'about', to: 'home' },
        { name: 'startGame',  from : 'home',  to: 'game' },
        { name: 'exitGame',   from : 'game',  to: 'home' },
        //{ name: '' ,        from : '', to: ''          },
      ],
      callbacks: {
        onenterabout : this.enterAboutCallback.bind(this),
        onleaveabout : this.leaveAboutCallback.bind(this),
        onenterhome  : this.enterHomeCallback.bind(this),
        onleavehome  : this.leaveHomeCallback.bind(this),
        onentergame  : this.enterGameCallback.bind(this),
        onleavegame  : this.leaveGameCallback.bind(this),
      }
    });

  },

  enterAboutCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    this.um.reset(this.um['about']);
    this.um.add('about');
  },

  leaveAboutCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    this.um.remove('about');
  },

  enterHomeCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    this.um.reset(this.um['home']);
    this.um.add('home');
  },

  leaveHomeCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    this.um.remove('home');
  },

  enterGameCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    this.um.add('game');
    console.log(123)
    this._generateFruit();
  },

  leaveGameCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
  },

  _test: function() {
    var sparksEmitter = new SPARKS.Emitter(new SPARKS.SteadyCounter(500));

    var emitterpos = new THREE.Vector3(0,0,0);

    sparksEmitter.addInitializer(new SPARKS.Position( new SPARKS.PointZone( emitterpos ) ) );
    sparksEmitter.addInitializer(new SPARKS.Lifetime(1,4));
    sparksEmitter.addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0,-50,10))));
    // TOTRY Set velocity to move away from centroid

    sparksEmitter.addAction(new SPARKS.Age());
    sparksEmitter.addAction(new SPARKS.Accelerate(0,0,50));
    sparksEmitter.addAction(new SPARKS.Move()); 
    sparksEmitter.addAction(new SPARKS.RandomDrift(50,50,2000));

    sparksEmitter.start();
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

    image = this.loader.images['bg1'];
    start_ring_image = this.loader.images['ringStart'];

    this.bgCanvas.drawLayer(0, image);
    this.bgCanvas.drawLayer(1, start_ring_image);
    this.bgCanvas.angle = 0;
    this.bgCanvas.fps = 0;
    this.bgCanvas.needUpdate = true;
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
      //this.bgCanvas.drawRotateLayer(1, this.loader.images[1], this.bgCanvas.angle, 0, 0, true);
      //this.bgCanvas.drawRotateLayer(1, this.loader.images[2], this.bgCanvas.angle, -300, 0, false);
      //this.bgCanvas.drawRotateLayer(1, this.loader.images[3], this.bgCanvas.angle, 300, 0, false);
    }
     
    if (this.bgCanvas.needUpdate) {
      this.bgCanvas.update();
      this.bgCanvas.needUpdate = false;
    }
  },

  _updateUI: function() {
    this.um[this.fsm.current].children.forEach(function(fruit) {
      fruit.update();
    });
  },

  _updateCamera: function() {
    //this.controls.update();
    this.camera.lookAt(this.scene.position);
  },

  _render: function() {
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
  },

  onDocumentMouseUp: function(event) {
    this._mouseDown = false;
    console.log(event.offsetX, event.offsetY);
  },

  onDocumentMouseMove: function(event) {
    var self = this;
    //console.log(event.offsetX, event.offsetY);
    if (this._mouseDown) {
      var offX, offY;
      // compatible with eggcache Firefox
      if (!event.offsetX) {
        offX = event.clientX - $(event.target).position().left;
        offY = event.clientY - $(event.target).position().top;
      } else {
        offX = event.offsetX;
        offY = event.offsetY;
      }

      var intersects;
      if (intersects = this._hasIntersection(offX, offY)) {
        var parentObject = intersects[0].object.parent;
        console.log('Hitted:', parentObject.name);
        parentObject.drop(true);

        if (parentObject.name == 'about') {
          setTimeout(function() {
            self.fsm.enterAbout();
          }, 1000);
        } else if (parentObject.name == 'game') {
          setTimeout(function() {
            self.fsm.startGame();
          }, 1000);
        } else if (parentObject.name == 'return') {
          setTimeout(function() {
            self.fsm.exitAbout();
          }, 1000);
        }
      }
    }
  },

  onDocumentMouseDown: function(event) {
    this._mouseDown = true;
    event.preventDefault();
  },

  _generateFruit: function() {
    console.log(123)
    var self = this;
    var fruit = new Fruit(self.loader, 'apple');
    fruit.reset();
    fruit.rotationDelta = new THREE.Vector3(0, 0.1, 0);
    fruit.position.set(0, -500, 100);
    fruit.speed = new THREE.Vector3(Math.random() * 16 - 8, Math.random() * 2+20, 0);
    this.um.game.add(fruit);
    setTimeout(function() {self._generateFruit();}, 1500);
  },

  _buildIntersectList: function() {
    var intersectList = []; 

    this.um[this.fsm.current].children.forEach(function(fruit) {
      intersectList = intersectList.concat(fruit.children); 
    });
    return intersectList;
  },

  _hasIntersection: function(x, y) {
    var mouseX = (x/ this.width) * 2 - 1;
    var mouseY = -(y/ this.height) * 2 + 1;

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
