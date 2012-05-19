function UIManager(scene) {
  this.scene = scene;
  this.ui = {};

  this.init = function(loader, options) {
    this.options = options;
    console.log(options);

    for (uiName in options) {
      console.log('UIManager.js:', 'Creating UI for:', uiName);
      // create Object3D that holds fruits
      this.ui[uiName] = new THREE.Object3D();

      // add fruits into ui
      for (var i = 0; i < options[uiName].length; i++) {
        this.ui[uiName].add(new Fruit(loader, options[uiName][i]['fruit'], options[uiName][i]['name']));
      }

      // reset current ui
      this.reset(uiName);
    }

    console.log('UIManager.js:', 'All UI created successfully.');
    console.log('\tDS:', this.ui);
  };

  this.add = function(name) {
    this.scene.add(this.ui[name]);
  }; 

  this.remove = function(name) {
    this.scene.remove(this.ui[name]);
  };

/*
 * Reset all fruit in ui
 */
  this.reset = function(uiName) {
    console.log('UIManager.js:', 'Resetting UI', uiName);
    console.log('\tDS:', this.options[uiName]);

    if (uiName == 'game') {
      this.ui[uiName].children = [];
    }
    for (var i = 0; i < this.options[uiName].length; i++) {
      var object = this.ui[uiName].getChildByName(this.options[uiName][i]['name']);
      object.reset();
      object.position.copy(this.options[uiName][i].position);
      if (this.options[uiName][i].rotation) {
        object.rotation.copy(this.options[uiName][i].rotation)
      }
      //console.log(this.options[uiName][i]['position']);
      //console.log(object)
      object.rotationDelta.copy(this.options[uiName][i].rotationDelta);
      if (this.options[uiName][i].eulerOrder) {
        object.eulerOrder = this.options[uiName][i].eulerOrder;
      }
    }
  };

  this.update = function(uiName) {
    this.ui[uiName].children.forEach(function(fruit) {
      fruit.update();
    });
  };

  this.getIntersectionList = function(uiName) {
    var intersectList = []; 

    this.ui[uiName].children.forEach(function(fruit) {
      if (!fruit.sliced) {
        intersectList = intersectList.concat(fruit.children); 
      }
    });
    return intersectList;
  };
}
