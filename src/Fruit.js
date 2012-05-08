function Fruit(loader, name) {
/*
 * A Fruit object is consist of 2 half-fruit models, when this class is initialized,
 * two half-fruit mesh to add into an Object3D.
 */
  THREE.Object3D.call(this);
  var object1 = new THREE.Mesh(loader.objects[name+'1'], new THREE.MeshFaceMaterial());
  var object2 = new THREE.Mesh(loader.objects[name+'2'], new THREE.MeshFaceMaterial());
  this.add(object1);
  this.add(object2);
  this.position.z = 100;
  this.scale.set(2, 2, 2);
  this.name = name;
};

Fruit.prototype = new THREE.Object3D();
Fruit.prototype.constructor = Fruit;

/*
 * If the fruit is not sliced, update it with its rotation delta and velocity;
 * If sliced, update its two half-fruit with rotation delta and velocity. 
 */
Fruit.prototype.update = function() {
  if (!this.sliced) {
    this.rotation.addSelf(this.rotationDelta);
    if (this.velocity) {
      this.position.addSelf(this.velocity);
      this.velocity.y -= 9.8 / 30;
    }
  }
  else {
    this.children.forEach(function(fruit) {
      fruit.rotation.addSelf(fruit.rotationDelta);
      fruit.position.addSelf(fruit.velocity);
      fruit.velocity.y -= 9.8 / 30;
    });        
  }
};

/*
 * Reset velocity/position of fruit and its composed half
 */
Fruit.prototype.reset = function() {
  this.sliced = false;
  this.position.set(0, 0, 100);
  this.velocity = undefined;
  this.children.forEach(function(fruit) {
    fruit.position.set(0, 0, 0);
  });
}

/*
 * Drop a fruit.
 * If this fruit is sliced, then drop its two half-fruit.
 * Otherwise, drop the complete fruit.
 */
Fruit.prototype.drop = function(sliced) {
  if (sliced) {
    this.sliced = true;
    this.children.forEach(function(fruit) {
      fruit.rotationDelta = fruit.parent.rotationDelta;
      fruit.velocity = new THREE.Vector3(Math.random() * 16 - 8, Math.random() * 5, 0);
    });
  } else {
    this.velocity = new THREE.Vector3(Math.random() * 5 - 10, Math.random() * 5, 0);
  }
}
