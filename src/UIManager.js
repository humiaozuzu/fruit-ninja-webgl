function UIManager() {

  this.init = function(loader) {
    // init menu entry for uiHome
    this.uiHome = new THREE.Object3D();
    this.uiHome.name = 'home';
    var gameEntry = loader.cloneObject('kiwi');
    this.uiHome.add(gameEntry);
    var aboutEntry = loader.cloneObject('watermelon');
    this.uiHome.add(aboutEntry);
    var settingsEntry = loader.cloneObject('banana');
    this.uiHome.add(settingsEntry);
    // some shortcut
    this.uiHome.gameEntry = gameEntry;
    this.uiHome.aboutEntry = aboutEntry;
    this.uiHome.settingsEntry = settingsEntry;
    this.reset(this.uiHome);

    console.log(settingsEntry);

    // init uiAbout
    this.uiAbout = new THREE.Object3D();
    this.uiAbout.name = 'about';
    var returnEntry = loader.cloneObject('banana');
    console.log(returnEntry)
    this.uiAbout.add(returnEntry);
    // set shortcut
    this.uiAbout.returnEntry = returnEntry;
    this.reset(this.uiAbout);
  
    // init uiGame
    this.uiGame = new THREE.Object3D();
    this.uiGame.name = 'game';
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
