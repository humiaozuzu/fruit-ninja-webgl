/*
 * Resource preloader for fruit-ninja-webgl, mainly preload images, 
 * sounds and json fruit models for the game. 
 */

function ThreePreloader(options) {
  this.options = options;
  this.images = {};
  this.objects = {};
  this.sounds = {};
  this.loadedCount = 0;
  this.totalCount = 0;

/*
 * Load all resources with the paramenter with options parameter
 */
  this.load = function() {
    var self = this;
    // get total resource count
    this.totalCount += Object.keys(this.options.images).length;
    this.totalCount += Object.keys(this.options.objects).length;
    this.totalCount += Object.keys(this.options.sounds).length;

    // load images
    for (var imageName in this.options.images) {
      console.log('Loading:', this.options.images[imageName]);
      var image = new Image();
      image.onload = (function(imageName, image) {
        return function(){
          self.images[imageName] = image; 
          self.loaded();
        };
      })(imageName, image);
      image.src = this.options.images[imageName];
    }

    // load models
    for (var objectName in this.options.objects) {
      console.log('Loading:', this.options.objects[objectName]);
      var loader = new THREE.JSONLoader();
      loader.load(this.options.objects[objectName], function(objectName) {
        return function(geometry) {
          self.objects[objectName] = geometry;
          self.loaded();
        }
      }(objectName));
    }
  };

/*
 * When an image/json/sound is loaded, this function is called to
 * calculate loaded resources count and invoke callback functions
 */
  this.loaded = function() {
    this.loadedCount += 1;
    this.options.onProgress(this.totalCount, this.loadedCount);
    if (this.totalCount == this.loadedCount) {
      this.options.onSuccess();
    }
  };
}
