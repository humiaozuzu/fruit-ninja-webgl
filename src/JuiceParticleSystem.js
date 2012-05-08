JuiceParticleSystem = function(x, y) {
  var particles = new THREE.Geometry(),
  pMaterial = 
    new THREE.ParticleBasicMaterial({
    color: 0xFFFFFF,
    size: 80,
    map: THREE.ImageUtils.loadTexture(
      "images/m_big_juice.png"
    ),
    blending: THREE.AdditiveBlending,
    transparent: true
  });

  for (var i = 0; i < 40; i++) {
    var pX = Math.random() * 50 -25,
    pY = Math.random() * 50 -25,
    pZ = 100,
    particle = new THREE.Vertex(
      new THREE.Vector3(pX, pY, pZ)
    );
    particle.velocity = new THREE.Vector3(
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
      Math.random() * 10 - 5).normalize().multiplyScalar(15);
      particles.vertices.push(particle);
  }

  THREE.ParticleSystem.call(this, particles, pMaterial);
  this.sortParticles = true;
  this.age = 0;
  this.life = 10;
  this.position.set(x, y, 100);
};

JuiceParticleSystem.prototype = new THREE.ParticleSystem();
JuiceParticleSystem.prototype.constructor = JuiceParticleSystem;

JuiceParticleSystem.prototype.update = function(scene) {
  this.age += 1;
  if (this.age == this.life) {
    console.log(123)
    scene.remove(this);
  }
  for (var i = 0; i < 40; i++) {
    var particle = this.geometry.vertices[i];
    particle.position.addSelf(particle.velocity);
    this.geometry.__dirtyVertices = true;
  }
}
