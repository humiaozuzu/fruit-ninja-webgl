function ResourceLoader() {
  this.objects = {};
  this.images = [];

  this.total = 0;
  this.loaded = 0;

  this.load = function(callbackFunc) {
    var self = this;
    this.loadedCallBack = callbackFunc;

    var fruitNames = ['apple', 'banana', 'kiwi', 'orange', 'pear', 'watermelon'];
    fruitNames.forEach(function(name) {
      self._loadObject(name);
    });

    var imageNames = [
      //'bg_fruit_ninja_1280_960.jpg',
      'bg_greatwave_1280_960.jpg',
      'ring_start.png',
      'ring_dojo.png',
      'ring_settings.png',
      //'bg_fruit_ninja_1280_960.jpg',
      //'bg_i_heart_sensei_1280_960.jpg',
      //'bg_greatwave_1280_960.jpg',
      //'bg_store_1280_960.jpg',
    ];
    imageNames.forEach(function(name) {
      self._loadImage(name);
    });
  };

  // functions extengs fruit object
  function updateObject() {
    if (!this.sliced) {
      this.rotation.addSelf(this.rotationDelta);
      if (this.speed) {
        this.position.addSelf(this.speed);
        this.speed.y -= 9.8 / 30;
      }
    }
    else {
      this.children.forEach(function(fruit) {
        fruit.rotation.addSelf(fruit.rotationDelta);
        fruit.position.addSelf(fruit.speed);
        fruit.speed.y -= 9.8 / 30;
      });        
    }
  }

  function resetObject() {
    this.sliced = false;
    this.position.set(0, 0, 0);
    this.speed = undefined;
    this.children.forEach(function(fruit) {
      fruit.position.set(0, 0, 0);
    });
  }

  function dropObject(sliced) {
    if (sliced) {
      this.sliced = true;
      this.children.forEach(function(fruit) {
        fruit.rotationDelta = fruit.parent.rotationDelta;
        fruit.speed = new THREE.Vector3(Math.random() * 16 - 8, Math.random() * 5, 0);
      });
    } else {
      this.speed = new THREE.Vector3(Math.random() * 5 - 10, Math.random() * 5, 0);
    }
  }

  this._loadObject = function(objectName) {
    var self = this;
    this.total += 1;
    var loader = new THREE.JSONLoader();
    var object = new THREE.Object3D();
    var object1, object2;
    loader.load('models/'+objectName+'/'+objectName+'_half1.js', function(geometry) {
      object1 = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial());
      object.add(object1);

      loader.load('models/'+objectName+'/'+objectName+'_half2.js', function(geometry) {
        object2 = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial());
        object.add(object2);
        object.position.z = 100;
        object.scale.set(2, 2, 2);
        object.sliced = false;

        self.objects[objectName] = object;
        self.loaded += 1;
        self.loadedCallBack(self.total, self.loaded);
      });
    });
  };

  this.cloneObject = function(name) {
    var mesh1 = this.objects[name].children[0]; 
    var mesh2 = this.objects[name].children[1]; 

    var object = new THREE.Object3D();
    object1 = new THREE.Mesh(mesh1.geometry, new THREE.MeshFaceMaterial());
    object2 = new THREE.Mesh(mesh2.geometry, new THREE.MeshFaceMaterial());
    object.add(object1);
    object.add(object2);
    // extend 
    object.update = updateObject;
    object.reset = resetObject;
    object.drop = dropObject;
    object.position.z = 100;
    object.scale.set(2, 2, 2);
    return object;
  };

  this._loadImage = function(imageName) {
    var self = this;
    this.total += 1;

    var image = new Image();
    image.onload = function() {
      self.images.push(image);
      self.loaded += 1;
      self.loadedCallBack(self.total, self.loaded);
    };
    image.src = 'images/' + imageName;
  }
}
