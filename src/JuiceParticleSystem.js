JuiceParticleSystem = function(x, y, dir) {
  var particles = new THREE.Geometry(),
  pMaterial = 
    new THREE.ParticleBasicMaterial({
    color: 0xFFFFFF,
    size: 100,
    map: THREE.ImageUtils.loadTexture(
      "images/particles/m_big_juice.png"
    ),
    blending: THREE.AdditiveBlending,
    transparent: true
  });

  for (var i = 0; i < 10; i++) {
    var pX = Math.random() * 30 - 15,
    pY = Math.random() * -20,
    pZ = 1500,
    particle = new THREE.Vertex(
      new THREE.Vector3(pX, pY, pZ)
    );
    particle.velocity = new THREE.Vector3(
      Math.random() * 10 - 5,
      Math.random() * -5,
      Math.random() * 10 - 5).normalize().multiplyScalar(15);
      particles.vertices.push(particle);
  }

  for (var i = 0; i < 30; i++) {
    var pX = Math.random() * 50 - 25,
    pY = Math.random() * 40,
    pZ = -1500,
    particle = new THREE.Vertex(
      new THREE.Vector3(pX, pY, pZ)
    );
    particle.velocity = new THREE.Vector3(
      Math.random() * 10 - 5,
      Math.random() * 5,
      Math.random() * 10 - 5).normalize().multiplyScalar(15);
      particles.vertices.push(particle);
  }

  THREE.ParticleSystem.call(this, particles, pMaterial);
  this.rotation.z = dir;
  this.sortParticles = true;
  this.age = 0;
  this.life = 20;
  this.position.set(x, y, 100);
};

JuiceParticleSystem.prototype = new THREE.ParticleSystem();
JuiceParticleSystem.prototype.constructor = JuiceParticleSystem;

JuiceParticleSystem.prototype.update = function(scene) {
  this.age += 1;
  if (this.age == this.life) {
    scene.remove(this);
  }
  for (var i = 0; i < 40; i++) {
    var particle = this.geometry.vertices[i];
    particle.position.addSelf(particle.velocity);
    this.geometry.__dirtyVertices = true;
  }
}
