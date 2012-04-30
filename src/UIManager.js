function UIManager(scene) {
  this.scene = scene;

  this.init = function(loader) {
    // init menu entry for home
    this.home = new THREE.Object3D();
    this.home.name = 'home';
    var gameEntry = new Fruit(loader, 'apple');
    this.home.add(gameEntry);
    var aboutEntry = new Fruit(loader, 'watermelon');
    this.home.add(aboutEntry);
    var settingsEntry = new Fruit(loader, 'banana');
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
      uiObject.gameEntry.rotationDelta = new THREE.Vector3(0, 0.1, 0);
      uiObject.gameEntry.position.x = -300;
      uiObject.gameEntry.name = 'game';

      uiObject.aboutEntry.reset();
      uiObject.aboutEntry.rotationDelta = new THREE.Vector3(0, 0.1, 0);
      uiObject.aboutEntry.position.x = 300;
      uiObject.aboutEntry.name = 'about';

      uiObject.settingsEntry.reset();
      uiObject.settingsEntry.rotationDelta = new THREE.Vector3(0, 0.1, 0);
      uiObject.settingsEntry.name = 'settings';
    } else if (name = 'about') {
      uiObject.returnEntry.reset();
      uiObject.returnEntry.rotationDelta = new THREE.Vector3(0, 0.1, 0);
      uiObject.returnEntry.position.x = 300;
      uiObject.returnEntry.position.y = -300;
      uiObject.returnEntry.name = 'return';
    }
  };
};
