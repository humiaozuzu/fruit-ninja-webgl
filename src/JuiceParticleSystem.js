JuiceParticleSystem = function(x, y, dir, fruit, hasBigJuice) {
  var particles = new THREE.Geometry(),
  map = {
    'apple': 'images/particles/p_big_juice.png',
    'kiwi': 'images/particles/k_big_juice.png',
    'lemon': 'images/particles/p_big_juice.png',
    'orange': 'images/particles/o_big_juice.png',
    'watermelon': 'images/particles/w_big_juice.png',
    'pear': 'images/particles/p_big_juice.png',
    'pineapple': 'images/particles/p_big_juice.png',
  }   
  pMaterial = 
    new THREE.ParticleBasicMaterial({
    color: 0xFFFFFF,
    size: 100,
    map: THREE.ImageUtils.loadTexture(map[fruit]),
    blending: THREE.AdditiveBlending,
    transparent: true
  });

  if (hasBigJuice) {
    for (var i = 0; i < 15; i++) {
      var pX = Math.random() * 100 - 20,
      pY = Math.random() * -70 -30,
      pZ = 2000,
      particle = new THREE.Vertex(
        new THREE.Vector3(pX, pY, pZ)
      );
      particle.velocity = new THREE.Vector3(
        Math.random() * 12 - 6,
        Math.random() * -6,
        -150);
        particles.vertices.push(particle);
    }
  }

  for (var i = 0; i < 35; i++) {
    var pX = Math.random() * 50 - 25,
    pY = Math.random() * 40,
    pZ = 500,
    particle = new THREE.Vertex(
      new THREE.Vector3(pX, pY, pZ)
    );
    particle.velocity = new THREE.Vector3(
      Math.random() * 20 - 10,
      Math.random() * 10 - 4,
      - 300);
      particles.vertices.push(particle);
  }

  THREE.ParticleSystem.call(this, particles, pMaterial);
  this.rotation.z = -dir + Math.PI/2;
  this.sortParticles = true;
  this.age = 0;
  this.life = 40;
  this.position.set(x, y, 100);
};

JuiceParticleSystem.prototype = new THREE.ParticleSystem();
JuiceParticleSystem.prototype.constructor = JuiceParticleSystem;

JuiceParticleSystem.prototype.update = function(scene) {
  this.age += 1;
  if (this.age == this.life) {
    scene.remove(this);
  }
  for (var i = 0; i < this.geometry.vertices.length; i++) {
    var particle = this.geometry.vertices[i];
    particle.position.addSelf(particle.velocity);
    this.geometry.__dirtyVertices = true;
  }
}
