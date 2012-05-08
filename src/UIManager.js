function UIManager(scene) {
  this.scene = scene;
  this.ui = {};

  this.init = function(loader, options) {
    this.options = options;

    //for (uiName in options) {
      //console.log('Creating UI for:', name);
      //this.ui[uiName] = new THREE.Object3D();
      //for (fruitName in options[uiName]) {
        //this.ui[uiName].add(new Fruit(loader, options))
      //}
    //}

    // init menu entry for home
    this.home = new THREE.Object3D();
    this.home.name = 'home';
    var gameEntry = new Fruit(loader, 'banana');
    this.home.add(gameEntry);
    var aboutEntry = new Fruit(loader, 'apple');
    this.home.add(aboutEntry);
    var settingsEntry = new Fruit(loader, 'watermelon');
    this.home.add(settingsEntry);
    // some shortcut
    this.home.gameEntry = gameEntry;
    this.home.aboutEntry = aboutEntry;
    this.home.settingsEntry = settingsEntry;
    this.reset(this.home);

    console.log(settingsEntry);

    // init about
    this.about = new THREE.Object3D();
    this.about.name = 'about';
    var returnEntry = new Fruit(loader, 'banana');
    console.log(returnEntry)
    this.about.add(returnEntry);
    // set shortcut
    this.about.returnEntry = returnEntry;
    this.reset(this.about);
  
    // init game
    this.game = new THREE.Object3D();
    this.game.name = 'game';
  };

  this.add = function(name) {
    this.scene.add(this[name]);
  }; 

  this.remove = function(name) {
    this.scene.remove(this[name]);
  };

  this.reset = function(uiObject) {
    var name = uiObject.name;

    if (name == 'home') {
      uiObject.gameEntry.reset();
      uiObject.gameEntry.rotation.set(0, 0, 0.4);
      uiObject.gameEntry.rotationDelta = new THREE.Vector3(0, 0.1, 0);
      uiObject.gameEntry.position.x = -300;
      uiObject.gameEntry.name = 'game';

      uiObject.aboutEntry.reset();
      uiObject.aboutEntry.rotation.set(0, 0, 0);
      uiObject.aboutEntry.rotationDelta = new THREE.Vector3(0, 0.1, 0);
      uiObject.aboutEntry.position.x = 300;
      uiObject.aboutEntry.name = 'about';

      uiObject.settingsEntry.reset();
      uiObject.settingsEntry.rotation.set(1.57, -0.5, 0)
      uiObject.settingsEntry.rotationDelta = new THREE.Vector3(0, 0, 0.1);
      uiObject.settingsEntry.name = 'settings';
    } else if (name = 'about') {
      uiObject.returnEntry.reset();
      uiObject.returnEntry.rotationDelta = new THREE.Vector3(0, 0.1, 0);
      uiObject.returnEntry.position.x = 450;
      uiObject.returnEntry.position.y = -350;
      uiObject.returnEntry.name = 'return';
    }
  };
};
