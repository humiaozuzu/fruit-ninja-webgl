function Fruit(loader, name) {
  THREE.Object3D.call(this);
  var object1 = new THREE.Mesh(loader.objects[name+'1'], new THREE.MeshFaceMaterial());
  var object2 = new THREE.Mesh(loader.objects[name+'2'], new THREE.MeshFaceMaterial());
  this.add(object1);
  this.add(object2);
  this.position.z = 100;
  this.scale.set(2, 2, 2);
};

Fruit.prototype = new THREE.Object3D();

Fruit.prototype.update = function() {
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
};

Fruit.prototype.reset = function() {
  this.sliced = false;
  this.position.set(0, 0, 0);
  this.speed = undefined;
  this.children.forEach(function(fruit) {
    fruit.position.set(0, 0, 0);
  });
}

Fruit.prototype.drop = function(sliced) {
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
