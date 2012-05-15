function Fruit(loader, kind, name) {
/*
 * A Fruit object consists of 2 half-fruit models, when this class is initialized,
 * two half-fruit mesh are added into one Object3D.
 */
  THREE.Object3D.call(this);
  var object1 = new THREE.Mesh(loader.objects[kind+'1'], new THREE.MeshFaceMaterial());
  var object2 = new THREE.Mesh(loader.objects[kind+'2'], new THREE.MeshFaceMaterial());
  this.add(object1);
  this.add(object2);
  this.position.z = 100;
  this.scale.set(2, 2, 2);
  this.rotationDelta = new THREE.Vector3(0, 0, 0);
  this.name = name;
  this.kind = kind;
}

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
    fruit.rotation.set(0, 0, 0);
  });
};

/*
 * Drop a fruit.
 * If this fruit is sliced, then drop its two half-fruit.
 * Otherwise, drop the complete fruit.
 */
Fruit.prototype.drop = function(sliced, direction) {
  if (sliced) {
    this.sliced = true;
    var x = this.rotation.x % (Math.PI * 2);
    var y = this.rotation.y % (Math.PI * 2);
    this.rotation.set(0, 0, 0);
    this.children.forEach(function(fruit) {
      // TODO: set direction accroding to different fruit kind
      //direction = direction < 0 ? direction : direction + Math.PI;
      // 1/2 PI ~ 3/2 PI set to PI
      var counter = 0;
      if (Math.abs(x - Math.PI) < (Math.PI / 2)) {
        fruit.rotation.x = Math.PI; 
        counter += 1;
      } else {
        fruit.rotation.x = 0;
      }
      if (Math.abs(y - Math.PI) < (Math.PI / 2)) {
        fruit.rotation.y = Math.PI; 
        counter += 1;
      } else {
        fruit.rotation.y = 0;
      }

      if (fruit.parent.kind == 'apple' || 
          fruit.parent.kind == 'watermelon' || 
          fruit.kind == 'orange') 
      {
        fruit.rotation.z = -direction + Math.PI / 2 + Math.PI / 2 * counter;
      } else {
        fruit.rotation.z = direction;
      }

      fruit.rotationDelta = new THREE.Vector3(0, Math.random() * 0.2 - 0.1, 0);
      fruit.velocity = new THREE.Vector3(Math.random() * 16 - 8, Math.random() * 5, 0);
    });
  } else {
    this.velocity = new THREE.Vector3(Math.random() * 5 - 10, Math.random() * 5, 0);
  }
};
