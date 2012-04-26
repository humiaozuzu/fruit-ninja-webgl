function ResourceLoader() {
  this.objects = [];
  this.images = [];

  this.total = 4;
  this.loaded = 0;

  this.load = function(callbackFunc) {
    var self = this;
    this.loadedCallBack = callbackFunc;

    var fruitNames = ['apple', 'banana'];
    fruitNames.forEach(function(name) {
      self._loadObject(name);
    });

    var imageNames = ['bg_fruit_ninja_1280_960.jpg', 'ring_start.png'];
    imageNames.forEach(function(name) {
      self._loadImage(name);
    });
  };

  this._loadObject = function(objectName) {
    var self = this;
    //this.total += 1;
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

        self.objects.push(object);
        console.log(object);
        self.loaded += 1;
        self.loadedCallBack(self.total, self.loaded);
      });
    });
  };

  this.cloneObject = function(name) {
    mesh1 = this.objects[0].children[0]; 
    mesh2 = this.objects[0].children[1]; 

    var object = new THREE.Object3D();
    object1 = new THREE.Mesh(mesh1.geometry, new THREE.MeshFaceMaterial());
    object2 = new THREE.Mesh(mesh2.geometry, new THREE.MeshFaceMaterial());
    object.add(object1);
    object.add(object2);
    object.position.z = 100;
    object.scale.set(2, 2, 2);
    return object;
  };

  this._loadImage = function(imageName) {
    var self = this;
    //this.total += 1;

    var image = new Image();
    image.onload = function() {
      self.images.push(image);
      self.loaded += 1;
      self.loadedCallBack(self.total, self.loaded);
    };
    image.src = 'images/' + imageName;
  }
}
