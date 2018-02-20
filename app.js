/*
 *  SWITCHERY STUFF
 */

var Switchery = require('switchery');
var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));

console.log(elems);

elems.forEach(function(html) {
  var switchery = new Switchery(html, { size: 'small' });
});


/*
 *  THREE.JS STUFF
 */

var THREE = require('three');

var camera, scene, renderer;
var geometry, material, mesh;

init();
animate();

function init() {

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
  camera.position.z = 0.85;

  scene = new THREE.Scene();

  geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
  material = new THREE.MeshNormalMaterial();

  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.getElementById('canvas').appendChild( renderer.domElement );

}

function animate() {

  requestAnimationFrame( animate );

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;

  renderer.render( scene, camera );

}