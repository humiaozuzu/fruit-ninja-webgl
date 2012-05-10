function Game(opts) {
/*
 * Create 3D webgl scene and 2d canvas and status monitor
 */
  this.width     = opts.width;
  this.height    = opts.height;
  this.container = opts.container;
  this.loader    = opts.loader;

  // create projector for cordinate transform
  this.projector = new THREE.Projector();

  // create scene
  this.scene = new THREE.Scene();

  // store splashed juice particle systems
  this.splashedJuice = [];

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

  // create background 2d canvas
  this.bgCanvas = new LayeredCanvas(2, this.width, this.height);
  $(this.bgCanvas.mainCanvas).css({
    'position'   : 'absolute',
    'left'       : (window.innerWidth - this.width) / 2,
    'top'        : (window.innerHeight - this.height) / 2,
    'box-shadow' : '5px 5px 25px #000',
  });
  $(this.container).append(this.bgCanvas.mainCanvas);

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

    console.log('Initializing UI manager for game!')
    this.um = new UIManager(this.scene);
    this.um.init(this.loader, {
      home: [
        { name: 'about', fruit: 'apple', position: new THREE.Vector3(300, 0, 100) },
        { name: 'game', fruit: 'watermelon', position: new THREE.Vector3(0, 0, 200) },
        { name: 'swag', fruit: 'banana', position: new THREE.Vector3(-300, 0, 100) },
      ],
      about: [
        { name: 'back', fruit : 'banana', position: new THREE.Vector3(450, -350, 100) },
      ],
      swag: [
        { name: 'back', fruit : 'banana', position: new THREE.Vector3(400, -300, 100) },
      ],
      game: [],
      pausedGame: []
    });

    console.log('Initializing Canvas for game!')
    this.bgCanvas.init(this.loader, 2);

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
    this.um.reset('about');
    this.um.add('about');
  },

  leaveAboutCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    this.um.remove('about');
  },

  enterHomeCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    this.um.reset('home');
    this.um.add('home');
  },

  leaveHomeCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    this.um.remove('home');
  },

  enterGameCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    this.um.add('game');
    this._generateFruit();
  },

  leaveGameCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
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
    var self = this;
    this.splashedJuice.forEach(function(juice) {
      juice.update(self.scene);
    })
    this._updateUI();
    this._updateCanvas();
    this._updateCamera();
    this.stats.update();
  },

  _updateCanvas: function() {
    if (this.bgCanvas.needUpdate) {
      this.bgCanvas.update(this.fsm.current);
    }
  },

  _updateUI: function() {
    this.um.update(this.fsm.current);
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

      var dir = this._getDirection(this.prevMouse[0], this.prevMouse[1], offX, offY);
      //console.log(dir)

      var intersects;
      if (intersects = this._hasIntersection(offX, offY)) {
        var parentObject = intersects[0].object.parent;
        console.log(intersects)
        // splashed juice particle effect
        this.ps = new JuiceParticleSystem(parentObject.position.x, parentObject.position.y, dir);
        this.scene.add(this.ps);
        this.splashedJuice.push(this.ps);

        console.log('Hitted:', parentObject.name);
        parentObject.drop(true, dir);

        if (parentObject.name == 'about') {
          setTimeout(function() {
            self.fsm.enterAbout();
          }, 1000);
        } else if (parentObject.name == 'game') {
          setTimeout(function() {
            console.log(1234)
            self.fsm.startGame();
          }, 1000);
        } else if (parentObject.name == 'back') {
          setTimeout(function() {
            self.fsm.exitAbout();
          }, 1000);
        }
      }
      this.prevMouse = [offX, offY];
    }
  },

  onDocumentMouseDown: function(event) {
    this._mouseDown = true;
    event.preventDefault();
    var offX, offY;
    // compatible with eggcache Firefox
    if (!event.offsetX) {
      offX = event.clientX - $(event.target).position().left;
      offY = event.clientY - $(event.target).position().top;
    } else {
      offX = event.offsetX;
      offY = event.offsetY;
    }
    this.prevMouse = [offX, offY];
  },

  _generateFruit: function() {
    console.log(123)
    var self = this;
    var fruit = new Fruit(self.loader, 'apple');
    fruit.reset();
    fruit.rotationDelta = new THREE.Vector3(0.1, 0.1, 0);
    fruit.position.set(0, -500, 100);
    fruit.velocity = new THREE.Vector3(Math.random() * 16 - 8, Math.random() * 4+20, 0);
    this.um.ui.game.add(fruit);
    setTimeout(function() {self._generateFruit();}, 1200);
  },

  _getDirection: function(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;

    return Math.atan2(dx,  dy);
  },

  _hasIntersection: function(x, y) {
    var mouseX = (x/ this.width) * 2 - 1;
    var mouseY = -(y/ this.height) * 2 + 1;

    var vector = new THREE.Vector3( mouseX, mouseY, 1 );
    this.projector.unprojectVector( vector, this.camera );

    var ray = new THREE.Ray(vector, new THREE.Vector3(0, 0, 1));

    var intersects = ray.intersectObjects(this.um.getIntersectionList(this.fsm.current));
    if (intersects.length  > 0) {
      return intersects;
    }
    return false;
  },
};
