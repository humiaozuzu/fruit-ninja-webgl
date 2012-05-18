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
  this.bgCanvas = new LayeredCanvas(this.width, this.height);
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
  $('#paused').mousedown(this.onPausedFrameMouseDown.bind(this));
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
        { name: 'about', fruit: 'orange', position: new THREE.Vector3(300, 0, 100), rotation: new THREE.Vector3(0, 0, 0), rotationDelta: new THREE.Vector3(0.02, 0, 0.01), eulerOrder: 'ZYX' },
        { name: 'game', fruit: 'apple', position: new THREE.Vector3(0, 0, 200), rotation: new THREE.Vector3(0, 0, 0.3), rotationDelta: new THREE.Vector3(0, 0.04, 0) },
        { name: 'swag', fruit: 'watermelon', position: new THREE.Vector3(-300, 0, 100), rotation: new THREE.Vector3(0, 0, 0), rotationDelta: new THREE.Vector3(0.02, 0.01, 0) },
      ],
      about: [
        { name: 'back', fruit : 'banana', position: new THREE.Vector3(450, -350, 100), rotation: new THREE.Vector3(0, 0, 0.3), rotationDelta: new THREE.Vector3(0, 0.08, 0)},
      ],
      swag: [
        { name: 'back', fruit : 'banana', position: new THREE.Vector3(400, -300, 100), rotation: new THREE.Vector3(0, 0, 0.3), rotationDelta: new THREE.Vector3(0, 0.08, 0)},
      ],
      score: [
        { name: 'back', fruit : 'banana', position: new THREE.Vector3(200, -300, 100), rotation: new THREE.Vector3(0, 0, 0.3), rotationDelta: new THREE.Vector3(0, 0.08, 0)},
        { name: 'retry', fruit : 'watermelon', position: new THREE.Vector3(-200, -300, 100), rotation: new THREE.Vector3(0, 0, 0.3), rotationDelta: new THREE.Vector3(0, 0.08, 0)},
      ],
      game: [],
      paused: []
    });

    this.gametime = 3;
    console.log('Initializing Canvas for game!')
    //this.bgCanvas.init(this.loader, 2);
    // background image
    this.bgCanvas.addLayer('static', 'global', [
                           { image: this.loader.images['bg1'], x: 0, y: 0, noShortCut: true}
    ]);
    // slashed juice
    this.bgCanvas.addLayer('animated', 'global', []);
    // scene-based rotating circle
    this.bgCanvas.addLayer('animated', 'sceneBased', {
      home: [
        {image: this.loader.images['game'], x: 0, y: 0, animations: [
          { animateFuc: this.bgCanvas.animations.rotate, timingFuc: this.bgCanvas.timingFuctions.linear(0.02, 0) },
      ]},
      {image: this.loader.images['swag'], x: -300, y: 0, animations: [
        { animateFuc: this.bgCanvas.animations.rotate, timingFuc: this.bgCanvas.timingFuctions.linear(0.02, 0) },
      ]},
      {image: this.loader.images['about'], x: 300, y: 0, animations: [
        { animateFuc: this.bgCanvas.animations.rotate, timingFuc: this.bgCanvas.timingFuctions.linear(0.02, 0) },
      ]}
      ],
      about: [
        {image: this.loader.images['back'], x: 450, y: -350, animations: [
        { animateFuc: this.bgCanvas.animations.rotate, timingFuc: this.bgCanvas.timingFuctions.linear(0.02, 0) },
      ]}
      ],
      score: [
        {image: this.loader.images['back'], x: 200, y: -300, animations: [
        { animateFuc: this.bgCanvas.animations.rotate, timingFuc: this.bgCanvas.timingFuctions.linear(0.02, 0) },
      ]},
        {image: this.loader.images['retry2'], x: -200, y: -300, animations: [
        { animateFuc: this.bgCanvas.animations.rotate, timingFuc: this.bgCanvas.timingFuctions.linear(0.02, 0) },
      ]}
      ]
    });
    this.score = new CanvasNumber(this.loader, 0);
    this.time = new CanvasNumber(this.loader, this.gametime);
    this.bgCanvas.addLayer('static', 'sceneBased', {
      game: [
        {image: this.loader.images['pause'], x: -600, y: -450},
        {image: this.loader.images['score'], x: 0, y: 0, noShortCut: true},
        {image: this.score.canvas, x: 64, y: 10, noShortCut: true},
        {image: this.time.canvas, x: 640, y: 440 }
      ],
    });
    this.loadPausedFrame();

    console.log('Creating fsm for game!')
    this.fsm = StateMachine.create({
      initial: 'home',
      events: [
        { name: 'enterAbout', from : 'home',  to: 'about'},
        { name: 'exitAbout',  from : 'about', to: 'home' },
        { name: 'startGame',  from : 'home',  to: 'game' },
        { name: 'pauseGame',   from : 'game',  to: 'paused' },
        { name: 'returnGame',   from : 'paused',  to: 'game' },
        { name: 'exitGame',   from : ['paused', 'game'],  to: 'home' },
        { name: 'retryGame',   from : ['paused', 'score'],  to: 'game' },
        { name: 'endGame',   from : 'game',  to: 'score' },
        { name: 'returnHome',   from : 'score',  to: 'home' },
        //{ name: '' ,        from : '', to: ''          },
      ],
      callbacks: {
        onenterabout : this.enterAboutCallback.bind(this),
        onleaveabout : this.leaveAboutCallback.bind(this),
        onenterhome  : this.enterHomeCallback.bind(this),
        onleavehome  : this.leaveHomeCallback.bind(this),
        onentergame  : this.enterGameCallback.bind(this),
        onleavegame  : this.leaveGameCallback.bind(this),
        onenterpaused: this.enterPausedCallback.bind(this),
        onleavepaused: this.leavePausedCallback.bind(this),
        onenterscore: this.enterScoreCallback.bind(this),
        onleavescore: this.leaveScoreCallback.bind(this),
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
    if (from == 'paused' || from == 'score') {
      this.score.update(0);
      this.time.update(this.gametime);
    }
  },

  leaveHomeCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    this.um.remove('home');
  },

  enterGameCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    if (from != 'paused') {
      this.um.reset('game');
      this.um.add('game');
      //this.bgCanvas.updateScore();
      //this.bgCanvas.addNotice('time');
      //setTimeout(this.bgCanvas.addNotice('go'), 2000);
      this._updateTime();
      setTimeout(this._generateFruit(), 160000);
    } else {
      this._updateTime();
      this._generateFruit();
    }
  },

  leaveGameCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    if (to == 'score') {
      this.um.remove('game');
    }
  },

  enterPausedCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    $('#paused').css({
      'left'             : (window.innerWidth - this.width) / 2,
      'top'              : (window.innerHeight - this.height) / 2,
      'width': this.width,
      'height': this.height,
    });
  },

  leavePausedCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    $('#paused').css({
      'left'             : 10000,
      'top'              : 10000,
    });
    if (to == 'home') {
      this.um.remove('game');
    }
  },

  enterScoreCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    this.um.reset('score');
    this.um.add('score');
  },

  leaveScoreCallback: function(event, from, to, msg) {
    console.log('from:', from, 'to:', to);
    this.um.remove('score');
    this.score.update(0);
    this.time.update(this.gametime);
  },

  loadPausedFrame: function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 960;
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";  
    ctx.fillRect (0, 0, 1280, 960); 
    ctx.drawImage(this.loader.images['play'], this.bgCanvas._canvasX(-200)-128, this.bgCanvas._canvasY(0)-128, 256, 256);
    ctx.drawImage(this.loader.images['retry'], this.bgCanvas._canvasX(200)-128, this.bgCanvas._canvasY(0)-128, 256, 256);
    ctx.drawImage(this.loader.images['quit'], this.bgCanvas._canvasX(550)-64, this.bgCanvas._canvasY(-400)-64);

    // scaled canvas
    var canvas2 = document.createElement('canvas');
    var ctx2 = canvas2.getContext('2d');
    canvas2.width = this.width;
    canvas2.height = this.height;
    ctx2.drawImage(canvas, 0, 0, this.width, this.height);
    var pausedFrame = $('#paused');
    $(pausedFrame).append(canvas2);
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
    this.bgCanvas.update(this.fsm.current);
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
        if (parentObject.kind != 'banana') {
          this.ps = new JuiceParticleSystem(parentObject.position.x, parentObject.position.y, dir, parentObject.kind, true);
          this.scene.add(this.ps);
          this.splashedJuice.push(this.ps);
        }

        // add score
        if (this.fsm.current == 'game') {
          this.score.add(4);
          this.bgCanvas.layers[3].needUpdate = true;
          //this.bgCanvas.updateScore();
        }

        // add splashed juice to background
        if (parentObject.kind == 'watermelon') {
          var juiceColor = 'Red';
          var juiceType = Math.ceil(Math.random()*2);
          this.bgCanvas.layers[1].add(
            {image: this.loader.images['splash'+juiceColor+juiceType], x: parentObject.position.x, y: parentObject.position.y, frame: 60, animations: [
                { animateFuc: this.bgCanvas.animations.alpha, timingFuc: this.bgCanvas.timingFuctions.linear(-0.01, 1) },
                { animateFuc: this.bgCanvas.animations.rotate, timingFuc: this.bgCanvas.timingFuctions.linear(0, dir) }
          ]}
          );
        } else if (parentObject.kind == 'apple' ||
                   parentObject.kind == 'lemon' || 
                   parentObject.kind == 'pear'
                  ) {
          var juiceColor = 'Yellow';
          var juiceType = Math.ceil(Math.random()*2);
          this.bgCanvas.layers[1].add(
            {image: this.loader.images['splash'+juiceColor+juiceType], x: parentObject.position.x, y: parentObject.position.y, frame: 60, animations: [
                { animateFuc: this.bgCanvas.animations.alpha, timingFuc: this.bgCanvas.timingFuctions.linear(-0.01, 1) },
                { animateFuc: this.bgCanvas.animations.rotate, timingFuc: this.bgCanvas.timingFuctions.linear(0, dir) }
          ]}
          );
        } else if (parentObject.kind == 'orange') {
          var juiceColor = 'Orange';
          var juiceType = Math.ceil(Math.random()*2);
          this.bgCanvas.layers[1].add(
            {image: this.loader.images['splash'+juiceColor+juiceType], x: parentObject.position.x, y: parentObject.position.y, frame: 60, animations: [
                { animateFuc: this.bgCanvas.animations.alpha, timingFuc: this.bgCanvas.timingFuctions.linear(-0.01, 1) },
                { animateFuc: this.bgCanvas.animations.rotate, timingFuc: this.bgCanvas.timingFuctions.linear(0, dir) }
          ]}
          );
        }

        console.log('Hitted:', parentObject.name);
        parentObject.drop(true, dir);

        if (parentObject.name == 'about') {
          setTimeout(function() {
            self.fsm.enterAbout();
          }, 1000);
        } else if (parentObject.name == 'game') {
          setTimeout(function() {
            self.fsm.startGame();
          }, 1000);
        } else if (parentObject.name == 'back') {
          setTimeout(function() {
            if (self.fsm.current == 'about') {
              self.fsm.exitAbout();
            } else if (self.fsm.current == 'score') {
              self.fsm.returnHome(); 
            }
          }, 1000);
        } else if (parentObject.name == 'retry') {
          setTimeout(function() {
            self.fsm.retryGame();
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

    // 
    var mouseX = (offX/ this.width) * 2 - 1;
    var mouseY = -(offY/ this.height) * 2 + 1;

    var vector = new THREE.Vector3( mouseX, mouseY, 1 );
    this.projector.unprojectVector( vector, this.camera );
    
    if (this.fsm.current == 'game') {
      // check if clicked pause button
      if (this._clicked(vector.x, vector.y, -600, -450, 'square', 22)) {
        this.fsm.pauseGame();
      }

    }
  },

  onPausedFrameMouseDown: function(event) {
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

    // 
    var mouseX = (offX/ this.width) * 2 - 1;
    var mouseY = -(offY/ this.height) * 2 + 1;

    var vector = new THREE.Vector3( mouseX, mouseY, 1 );
    this.projector.unprojectVector( vector, this.camera );
    
    if (this.fsm.current == 'paused') {
      console.log(vector.x, vector.y)
      // check if clicked pause button
      if (this._clicked(vector.x, vector.y, 550, -405, 'round', 55)) {
        console.log(123) 
        this.fsm.exitGame();
      }

      // check if clicked play button
      if (this._clicked(vector.x, vector.y, -200, 0, 'square', 128)) {
        this.fsm.returnGame();
      }

      // check if clicked retry button
      if (this._clicked(vector.x, vector.y, 200, 0, 'square', 128)) {
        this.fsm.exitGame();
      }
    }
  },

  _clicked: function(mouseX, mouseY, centerX, centerY, shape, radius) {
    var diffX = Math.abs(mouseX - centerX);
    var diffY = Math.abs(mouseY - centerY);

    if (shape == 'round') {
      var distanceSquare = Math.pow(diffX, 2) + Math.pow(diffY, 2); 
      if (Math.sqrt(distanceSquare) < radius) {
        return true;
      } else {
        return false;
      }
    } else if (shape == 'square') {
      if (diffX < radius && diffY < radius) {
        return true;
      } else {
        return false;
      }
    }
  },

  _generateFruit: function() {
    //console.log(123)
    if (this.fsm.current != 'game') { 
      return;
    }
    var self = this;
    var ran = Math.random() * 3;
    if (ran < 1) {
      var fruit = new Fruit(self.loader, 'apple');
    } else if (ran < 2) {
      var fruit = new Fruit(self.loader, 'banana');
    } else if (ran < 3) {
      var fruit = new Fruit(self.loader, 'watermelon');
    }
    fruit.reset();
    fruit.rotationDelta = new THREE.Vector3(0.1, 0.1, 0);
    fruit.position.set(0, -500, 100);
    fruit.velocity = new THREE.Vector3(Math.random() * 16 - 8, Math.random() * 4+20, 0);
    this.um.ui.game.add(fruit);
    setTimeout(function() {self._generateFruit();}, 1200);
  },

  _updateTime: function() {
    if (this.fsm.current != 'game') { 
      return;
    }
    if (this.time.number == 0) {
      this.fsm.endGame();
    }
    var self = this;
    this.time.sub(1);
    this.bgCanvas.layers[3].needUpdate = true;
    setTimeout(function() {self._updateTime();}, 1000);
  },

  _getDirection: function(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;

    return Math.atan2(dy, dx);
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
