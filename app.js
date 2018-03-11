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
var OrbitControls = require('three-orbit-controls')(THREE);
var loader = new THREE.JSONLoader();

var fs = require('fs');

var camera, scene, renderer, controls;
var geometry, mesh, wall;

init();
animate();

function init() {

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 30 );
  camera.position.y = 3;
  camera.position.z = 6;
  camera.rotation.x = -0.35;

  controls = new OrbitControls( camera );
  controls.update();

  scene = new THREE.Scene();

  //geometry = new THREE.BoxGeometry( 0.5, 0.1, 0.5 );
  material = new THREE.MeshNormalMaterial();
  console.log(typeof(THREE.JSONLoader))
  loader.load("models/quad_x.json", function(geometry, materials) {
    var modelMaterial = new THREE.MeshFaceMaterial(materials);
    mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.1, 0.1, 0.1);
    mesh.position.y = 1.5;
    scene.add( mesh );
  });

  var floor_texture = new THREE.TextureLoader().load( 'textures/grass.jpg' );
  floor_texture.wrapS = floor_texture.wrapT = THREE.RepeatWrapping;
  floor_texture.offset.set( 0, 0 );
  floor_texture.repeat.set( 50, 50 );
  var floor_material = new THREE.MeshBasicMaterial( { map: floor_texture } );
  var floor = new THREE.BoxGeometry(100, 0.1, 100);

  var floor_mesh = new THREE.Mesh( floor, floor_material );
  scene.add(floor_mesh);

  var wall_texture = new THREE.TextureLoader().load( 'textures/wall.jpg' );
  wall_texture.wrapS = wall_texture.wrapT = THREE.RepeatWrapping;
  wall_texture.offset.set( 1, 5 );
  //wall_texture.repeat.set( 0, 0 );
  var wall_material = new THREE.MeshBasicMaterial( { map: wall_texture } );
  var wall_geometry = new THREE.BoxGeometry(1, 5, 0.1);

  wall = new THREE.Mesh( wall_geometry, wall_material );
  scene.add(wall);

  var canvas = document.getElementById('canvas');

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( canvas.clientWidth, canvas.clientHeight);
  canvas.appendChild( renderer.domElement );

}

function animate() {

  requestAnimationFrame( animate );
  controls.update();
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
  baudRate: 115200,
  //buffersize: 64
});

const mavlink = require('mavlink');

var myMAV = new mavlink(1, 100, "v1.0", ["common"]);
myMAV.on("ready", function() {
  //parse incoming serial data
  serialport.on('data', function(data) {
    myMAV.parse(data);
  });
  
  //listen for messages
  myMAV.on("message", function(message) {
    console.log(message);
  });
  myMAV.on("checksumFail", function(error) {
    console.log("checksum error");
  });
  myMAV.on("sequenceError", function(error) {
    console.log("sequence error");
  });

  myMAV.on("HEARTBEAT", function(message) {
    console.log("heartbeat");
  });

  myMAV.on("DISTANCE_SENSOR", function(message) {
    console.log("distance sensor");
    let data = myMAV.decodeMessage(message);
    wall.position.z = mesh.position.z - data.current_distance/100.0;
    wall.position.x = mesh.position.x;
    wall.rotation.z = mesh.rotation.z;
    console.log(data);
  });

  myMAV.on("VISION_POSITION_ESTIMATE", function(message) {
    console.log("vision position");
    let data = myMAV.decodeMessage(message);
    console.log(data);
    mesh.position.x = data.x/100.0;
    mesh.position.z = data.y/100.0; // swap axis
    mesh.position.y = data.z/100.0;

    mesh.rotation.x = data.pitch * Math.PI/-180;
    mesh.rotation.z = data.roll * Math.PI/-180; // yes, inverted
    mesh.rotation.y = data.yaw * Math.PI/180; // yes, inverted
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
      //if(message.length < 64)
      //  serialport.write((new Array(64 - message.length)).fill(0))
      serialport.drain();
    });
}, 1000);

function sendManualControl(throttle, pitch, roll, yaw, mode) {
  // args come in as [-1, 1]
  // expected range is [-1000, 1000]
  myMAV.createMessage("MANUAL_CONTROL", {
      'target': 1,
      'x': pitch * 200,
      'y': roll * -200,
      'z': (throttle + 1) * 500,
      'r': yaw * -200,
      'buttons': (mode > 0 ? 1 : 0)
    },
    function(message) {
      //console.log("writing message");
      //console.log(message);
      serialport.write(message.buffer);
      //if(message.length < 64)
      //  serialport.write((new Array(64 - message.length)).fill(0))
      serialport.drain();
    });
};

window.addEventListener("gamepadconnected", function(e) {
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length);
  window.setInterval(function() {
    var gp = navigator.getGamepads()[e.gamepad.index];
      if(gp) {
        console.log("%.2f %.2f %.2f %.2f %.2f", gp.axes[0], gp.axes[1], gp.axes[2], gp.axes[3], gp.axes[5]);
        // weird mapping
        sendManualControl(gp.axes[0], gp.axes[2], gp.axes[1], gp.axes[3], gp.axes[5]);
      }
    }, 75);
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

