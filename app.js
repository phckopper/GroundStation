/*
 *    A simple ground staton for autonomous drones
 *    Copyright (C) 2018  Pedro Henrique Kopper
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 *  SWITCHERY STUFF
 */

var Switchery = require('switchery');
var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));

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
  camera.position.y = 3;
  camera.position.z = 6;
  camera.rotation.x = -0.35;

  scene = new THREE.Scene();

  geometry = new THREE.BoxGeometry( 0.5, 0.1, 0.5 );
  material = new THREE.MeshNormalMaterial();

  mesh = new THREE.Mesh( geometry, material );
  mesh.position.y = 1.5;
  scene.add( mesh );

  var floor_material = new THREE.MeshBasicMaterial( {color: 0xaa33aa} );
  var floor = new THREE.BoxGeometry(10, 0.1, 10);

  var floor_mesh = new THREE.Mesh( floor, floor_material );
  scene.add(floor_mesh)

  var canvas = document.getElementById('canvas');

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( canvas.clientWidth, canvas.clientHeight);
  canvas.appendChild( renderer.domElement );

}

function animate() {

  requestAnimationFrame( animate );

  renderer.render( scene, camera );

}


/*
 *  SERIALPORT STUFF
 */

const SerialPort = require('serialport');
var serialPortsEl = document.getElementById('serial-ports');
SerialPort.list(function(err, ports) {
  for (var i = 0; i < ports.length; i++) {
    //var li = document.createElement('li');
    //li.appendChild(document.createTextNode(ports[i].comName));
    //serialPortsEl.appendChild(li);
  }
});

const serialport = SerialPort('/dev/tty.usbserial-A50285BI', {
  baudRate: 115200
});

const mavlink = require('mavlink');

var myMAV = new mavlink(1, 100, "v1.0", ["common"]);
myMAV.on("ready", function() {
  //parse incoming serial data
  serialport.on('data', function(data) {
    myMAV.parse(data);
    console.log(data);
  });
  
  //listen for messages
  myMAV.on("message", function(message) {
    console.log(message);
  });
});

setInterval(function() {
  myMAV.createMessage("HEARTBEAT", {
      'type': 0,
      'autopilot': 0,
      'base_mode': 0,
      'custom_mode': 0,
      'system_status': 0,
      'mavlink_version': 1
    },
    function(message) {
      console.log("writing message");
      serialport.write(message.buffer);
    });
}, 1000);

document.getElementById("send-message").addEventListener("click", function(e) {
  myMAV.createMessage("MANUAL_CONTROL", {
      'target': 1,
      'x': 100,
      'y': 0,
      'z': 0,
      'r': 0,
      'buttons': 0
    },
    function(message) {
      console.log("writing message");
      serialport.write(message.buffer);
    });
});
/*
parser.on('data', function(data) {
  var t = data.split(' ');
  //var x = t[0]/100.0;
  //var y = t[1]/100.0;

  //mesh.position.x = t[0]/100.0;
  //mesh.position.z = t[1]/100.0; // yes, inverted

  mesh.rotation.x = parseFloat(t[0]) * Math.PI/-180;
  mesh.rotation.z = parseFloat(t[1]) * Math.PI/-180; // yes, inverted
  mesh.rotation.y = parseFloat(t[2]) * Math.PI/180; // yes, inverted
  //console.log("%s %s", mesh.rotation.x, mesh.rotation.y);
  //console.log(data.toString());
})*/

