// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =     
`precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;

uniform mat4 u_worldInverseTranspose;
    void main() {
      //gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position ;
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
      v_UV = a_UV;
      v_Normal = a_Normal;
      v_VertPos = u_ModelMatrix * a_Position; 

    }`


// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  varying vec3 v_Normal;
  uniform vec3 u_lightPos;
  
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;
uniform float u_shininess;
uniform vec3 u_lightDirection;
uniform float u_innerLimit; 
uniform float u_outerLimit; 
  uniform vec2 time;
 varying vec4 v_VertPos;
 uniform vec3 u_cameraPos;
 uniform bool u_lightOn;
 uniform bool u_spotOn;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
        uniform sampler2D u_Sampler4;
      uniform sampler2D u_Sampler5;
          uniform sampler2D u_Sampler6;
          uniform sampler2D u_Sampler7;
  uniform int u_whichTexture;
  const float cf_radius = 0.25;
const float cf_bright = 2.0;
float spotCosine;
uniform vec4 u_color;

  void main() {
  if(u_whichTexture == -3){
  	gl_FragColor = vec4((v_Normal+1.0)/2.0,1.0);
  }
  else if(u_whichTexture == -2){
  	  gl_FragColor = u_FragColor;
  }
  else if(u_whichTexture == -1){
	  gl_FragColor = vec4(v_UV,1.0,1.0);
  }
  else if(u_whichTexture == 0){
  	  gl_FragColor = texture2D(u_Sampler0,v_UV);
  }
  else if(u_whichTexture == 1){
  	  gl_FragColor = texture2D(u_Sampler1,v_UV);
  }
    else if(u_whichTexture == 2){
  	  gl_FragColor = texture2D(u_Sampler2,v_UV);
  }
    else if(u_whichTexture == 3){
  	  gl_FragColor = texture2D(u_Sampler3,v_UV);
  }
    else if(u_whichTexture == 4){
  	  gl_FragColor = texture2D(u_Sampler4,v_UV);
  }
  
else if(u_whichTexture == 5){
  	  gl_FragColor = texture2D(u_Sampler5,v_UV);
  }
  
  else if(u_whichTexture == 6){
  	  gl_FragColor = texture2D(u_Sampler6,v_UV);
  }
    else if(u_whichTexture == 7){
  	  gl_FragColor = texture2D(u_Sampler7,v_UV);
  }
  else{
	gl_FragColor = vec4(1,.2,.2,1);
  }
  
      vec3 lightVector = u_lightPos-vec3(v_VertPos);
    float r=length(lightVector);
    


    //if(r < 1.0) {
       //gl_FragColor = vec4(1,0,0,1);
     //}
    //else if(r < 2.0) {
       //gl_FragColor = vec4(0,1,0,1);
     //}
	//gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);
	
	vec3 L = normalize(lightVector);
	vec3 N = normalize(v_Normal);
	float nDotL = max(dot(N,L),0.0);
	
	vec3 R = reflect(-L,N);
	vec3 E = normalize(u_cameraPos-vec3(v_VertPos));
	
	float specular = pow(max(dot(E,R),0.0),10.0);

	vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
	vec3 ambient = vec3(gl_FragColor) * 0.3;
	if(u_lightOn){
		if(u_whichTexture == -2){
		gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
		}
		
		else{
		gl_FragColor = vec4(diffuse+ambient,1.0);
		}

	}
	if(u_spotOn){

  vec3 halfVector = normalize(L + E);

  float dotFromDirection = dot(L,-E);

  float light = dot(E, L);

  gl_FragColor.rgb *= light;

	}
	
  }`;

// global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let a_UV;
let u_Sampler0;
let u_whichTexture;
let textureNum;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
let u_Sampler6;
let g_camera;
let a_Normal;
let g_normalOn = false;
let g_lightPos = [0,1,-2];
let g_lightSpot = [0,1,-2];
let u_lightSpot;
let g_lightOn = true;
let g_lightOn2 = true;
let u_lightPos;
let u_lightOn;
let u_spotOn;
let u_cameraPos;
let g_spotOn = false;
//function that contains canvas and gl context
function setupWebGL(){
// Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl");
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);

}

//function that compiles shader program
function connectVariablesToGLSL(){
// Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if(a_UV < 0){
  	console.log('Failed to get the storage location of a_UV');
  	return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix ) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return -1;
    }
    
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return -1;
    }
    
u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return -1;
    }
    
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if(!u_ViewMatrix){
    	console.log('Failed to get the storage location of u_ViewMatrix');
    	return;
    }
    
      // Get the storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }
    
  	u_whichTexture =  gl.getUniformLocation(gl.program, "u_whichTexture");
	if(!u_whichTexture){
		console.log('Failed to get the storage location of u_whichTexture');
		return;
	}
	
	a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(a_Normal < 0){
  	console.log('Failed to get the storage location of a_Normal');
  	return;
  }
u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if(!u_lightPos) {
    console.log('Failed to get location of u_lightPos');
    return -1;
  }

  
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if(!u_cameraPos) {
    console.log('Failed to get location of u_cameraPos');
    return -1;
  }
  
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if(!u_lightOn) {
    console.log('Failed to get location of u_lightOn');
    return -1;
  }
  
    u_spotOn = gl.getUniformLocation(gl.program, 'u_spotOn');
  if(!u_spotOn) {
    console.log('Failed to get location of u_spotOn ');
    return -1;
  }
  
	     g_camera = new Camera();
      var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    

}

function initTextures() {

  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ loadTexture(0,image); };
  // Tell the browser to load an image

  
  
  return true;
}

function loadTexture(n,image) {
	var texture = gl.createTexture();

	if(!texture) {
		console.log('Failed to create the texture object');
		return false;
	}

if(n == 0){

  gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(u_Sampler0, 0);
}
else if(n== 1){
  
  gl.activeTexture(gl.TEXTURE1);
  gl.uniform1i(u_Sampler1, 1);
}
else if(n== 2){
  
  gl.activeTexture(gl.TEXTURE2);
  gl.uniform1i(u_Sampler2, 2);
}
else if(n== 3){
  
  gl.activeTexture(gl.TEXTURE3);
  gl.uniform1i(u_Sampler3, 3);
}

else if(n== 4){
  
  gl.activeTexture(gl.TEXTURE4);
  gl.uniform1i(u_Sampler4, 4);
}

else if(n== 5){
  
  gl.activeTexture(gl.TEXTURE5);
  gl.uniform1i(u_Sampler5, 5);
}

else if(n== 6){
  
  gl.activeTexture(gl.TEXTURE6);
  gl.uniform1i(u_Sampler6, 6);
}

else if(n== 7){
  
  gl.activeTexture(gl.TEXTURE7);
  gl.uniform1i(u_Sampler7, 7);
}
  	  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	    
    gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  
  console.log('finished loadTexture');

}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;


//globals related to UI
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegment = 10;
let g_globalAngle = 0;
let g_neckAngle = 0;
let g_headAngle = 0;
let g_animation = 1;
let g_tailAngle = 0;
let g_animationOn = true;

//let g_animation2On = true;

function addActionsForHTMLUI(){
    document.getElementById('angleSlide').addEventListener('mousemove', 
        function() { g_globalAngle = this.value; renderScene(); });
    document.getElementById('neckSlide').addEventListener('mousemove', 
        function() { g_neckAngle = this.value; renderScene(); }); 
    document.getElementById('headSlide').addEventListener('mousemove', 
        function() { g_headAngle = this.value; renderScene(); }); 
        
  document.getElementById('lightSlideX').addEventListener('mousemove', 
  function(ev) {if(ev.buttons == 1) {g_lightPos[0] = this.value/100; renderScene();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', 
  function(ev) {if(ev.buttons == 1) {g_lightPos[1] = this.value/100; renderScene();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', 
  function(ev) {if(ev.buttons == 1) { g_lightPos[2] = this.value/100; renderScene();}});
  
    document.getElementById('lightSpotX').addEventListener('mousemove', 
  function(ev) {if(ev.buttons == 1) {g_lightSpot[0] = this.value/100; renderScene();}});
  document.getElementById('lightSpotY').addEventListener('mousemove', 
  function(ev) {if(ev.buttons == 1) {g_lightSpot[1] = this.value/100; renderScene();}});
  document.getElementById('lightSpotZ').addEventListener('mousemove', 
  function(ev) {if(ev.buttons == 1) { g_lightSpot[2] = this.value/100; renderScene();}});
        
    document.getElementById('onOrOff').onclick = function() {
    if (g_animationOn) {
      g_animationOn = false;

    } else {
      g_animationOn = true;

    }
  }
  
    document.getElementById('normalOn').onclick = function() {g_normalOn = true;}
  document.getElementById('normalOff').onclick = function() {g_normalOn = false;}

  document.getElementById('lightOn').onclick = function() {g_lightOn = true};
  document.getElementById('lightOff').onclick = function() {g_lightOn = false};

  
    document.getElementById('spotOn').onclick = function() {g_spotOn = true};
  document.getElementById('spotOff').onclick = function() {g_spotOn = false};

}

function keydown(ev){

	if (ev.keyCode == 68){
		g_camera.moveRight();
	}
	if (ev.keyCode == 65){
		g_camera.moveLeft();
	}
	if (ev.keyCode == 87){
		g_camera.forward();
	}
	if (ev.keyCode == 83){ 
		g_camera.backward();
	}
	if (ev.keyCode == 81){
		g_camera.rotateLeft();
	}
	if (ev.keyCode == 69){
		g_camera.rotateRight();
	}

renderScene();
}


function main() {
  setupWebGL();
  
  connectVariablesToGLSL();
addActionsForHTMLUI();

document.onkeydown = keydown;
initTextures();

  gl.clearColor(0.0, 0.0, 0.0, 1);


    requestAnimationFrame(tick);
    return;
}


var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function renderScene(){

	var startTime = performance.now();
	var projMat = new Matrix4();
	projMat.setPerspective(90,1*canvas.width/canvas.height,.1,1000);

	var viewMat = new Matrix4();
		viewMat.setLookAt(
						g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2], 
						g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
						g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]   
	);
		gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
	var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.uniform3f(u_lightPos,g_lightPos[0],g_lightPos[1],g_lightPos[2]);
	//gl.uniform1i(u_lightPos,g_lightPos[2]);
	gl.uniform3f(u_spotOn,g_lightSpot[0],g_lightSpot[1],g_lightSpot[2]);
	 gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
gl.uniform1i(u_lightOn, g_lightOn);
gl.uniform1i(u_spotOn, g_spotOn);

	var sky = new Cube();
	if(g_normalOn) 
	{
	sky.textureNum = -3;
	}

	sky.color = [.8,.8,.8,1];

	sky.matrix.scale(-5,-5,-5);
	sky.matrix.translate(-.5,-.5,-.5);
	sky.render();
	
	  var sphere = new Sphere();
  sphere.color = [0.0,1.0,1.0,1.0];
  //sphere.textureNum = 0;
  if(g_normalOn) 
  {
  	sphere.textureNum = -3;
  }

  sphere.matrix.translate(-1,-1.5,-1.5);
  sphere.render();
  
  var cube = new Cube();
  cube.color = [1,1,1,1];
  if(g_normalOn){
  	cube.textureNum = -3;
  }
  cube.matrix.translate(1,-1.5,-1.5);
  cube.render();
  
    var light = new Cube();
  light.color = [2,2,0,1];

  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(.5,0.5,.5);
  light.render();
  
  /*
  
  var body = new Cube();
  body.color = [1,1,1,1];
    if(g_normalOn) 
  {
  	body.textureNum = -3;
  }
 body.matrix.scale(1,-.5,1.5);
  body.matrix.translate(0.5,1,-1); 
  body.render();
  
  var leg1 = new Cube();
  leg1.color = [1,1,1,1];
  	    if(g_normalOn) 
  {
  	leg1.textureNum = -3;
  }
  leg1.matrix.scale(0.3,-.8,0.3);
	leg1.matrix.translate(1.67,1,-1); 
	leg1.render();
	
	  var leg2 = new Cube();
  leg2.color = [1,1,1,1];
  	    if(g_normalOn) 
  {
  	leg2.textureNum = -3;
  }
  leg2.matrix.scale(0.3,-.8,0.3);
	leg2.matrix.translate(4,1,-1); 
	leg2.render();
	
	  var leg3 = new Cube();
  leg3.color = [1,1,1,1];
  	    if(g_normalOn) 
  {
  	leg3.textureNum = -3;
  }
  leg3.matrix.scale(0.3,-.8,0.3);
	leg3.matrix.translate(1.67,1,-5); 
	leg3.render();
	
	var leg4 = new Cube();
  leg4.color = [1,1,1,1];
  	    if(g_normalOn) 
  {
  	leg4.textureNum = -3;
  }
  leg4.matrix.scale(0.3,-.8,0.3);
	leg4.matrix.translate(4,1,-5); 
	leg4.render();
	
var face = new Cube();
face.color = [1,1,1,1];
  	 if(g_normalOn) 
  {
  	face.textureNum = -3;
  }
  face.matrix.scale(0.8,0.8,0.3);
  
  face.matrix.translate(0.7,-0.8,-0.5);
//face.matrix.rotate(-10 * Math.sin(g_seconds), 0, 0,1);
  face.render();
  */
  
  var neck= new Cube();
	neck.color = [0,0.5,0,1];

	neck.matrix.translate(0.4,-.12,0.05);
	neck.matrix.rotate(-10 * Math.sin(g_seconds), 0, 0,1);
	neck.matrix.rotate(g_neckAngle,0,0,1);
	var neckRel = new Matrix4(neck.matrix);
	neck.matrix.scale(0.13,0.7,0.15);
	neck.matrix.translate(-.12,-.9,0.3);
	neck.render();

	var head = new Cube();
	head.color = [0,0.5,0,1];
	head.matrix = new Matrix4(neckRel);
	head.matrix.translate(0.13,0.7,0.0);
	var headRel = new Matrix4(head.matrix);
	//magenta.matrix.setTranslate(0,-.5,0,0);
	//head.matrix.rotate(10 * Math.sin(g_seconds), 0, 0,1);
	//head.matrix.rotate(g_headAngle,0,0,1);
	//head.matrix.rotate(20 * Math.sin(g_seconds * 50),0, 0,1);
	//var yellowRel = new Matrix4(yellow.matrix);
	head.matrix.scale(0.2,0.2,0.15);
	head.matrix.translate(-0.74,-3.3,0.3);
	head.render();

	var eyes = new Cube();
	eyes.color = [0,0,0,1];
	eyes.matrix = new Matrix4(headRel);
	eyesRel = new Matrix4(eyes.matrix);
	//eyes.matrix.rotate(g_headAngle,0,0,1);
	//eyes.matrix.rotate(20 * Math.sin(g_seconds * 50),0, 0,1);
	//eyes.matrix.rotate(10 * Math.sin(g_seconds), 0, 0,1);

	eyes.matrix.scale(0.03,0.04,0.1);
	eyes.matrix.translate(-1,-14,0.44);
	eyes.render();
	
	var eyes2 = new Cube();
	eyes2.color = [0,0,0,1];
	eyes2.matrix = new Matrix4(headRel);
	eyes2Rel = new Matrix4(eyes2.matrix);
	//eyes2.matrix.rotate(g_headAngle, 0, 0,1);
	//eyes.matrix.rotate(10 * Math.sin(g_seconds), 0, 0,1);

	eyes2.matrix.scale(0.03,0.04,0.1);
	eyes2.matrix.translate(-1,-14,0.955);
	eyes2.render();
	
	var body = new Cube();
	body.color = [0,0.47,0,1];
	bodyRel = new Matrix4(body.matrix);
	body.matrix.rotate(1, 0, 0,1);
	body.matrix.translate(0.15,-1,0.03);
	body.matrix.scale(0.4,0.4,0.25);
	body.render();
	
	var body2 = new Cube();
	body2.color = [0,0.45,0,1];
	body2.matrix = new Matrix4(bodyRel);
	bodyRel2 = new Matrix4(body2.matrix);
	body2.matrix.rotate(1, 0, 0,1);
	body2.matrix.translate(0.05,-1.05,0);
	body2.matrix.scale(0.4,0.5,0.38);
	body2.render();
	
	
	var body3 = new Cube();
	body3.color = [0,0.43,0,1];
	body3.matrix = new Matrix4(bodyRel2);
	bodyRel3 = new Matrix4(body3.matrix);
	body3.matrix.rotate(1, 0, 0,1);
	body3.matrix.translate(-0.05,-1.05,-0.05);
	body3.matrix.scale(0.4,0.6,0.47);
	body3.render();
	
	var body4 = new Cube();
	body4.color = [0,0.42,0,1];
	body4.matrix = new Matrix4(bodyRel3);
	bodyRel4 = new Matrix4(body4.matrix);
	body4.matrix.rotate(1, 0, 0,1);
	body4.matrix.translate(-0.15,-1.05,-0.01);
	body4.matrix.scale(0.4,0.5,0.4);
	body4.render();

	var body5 = new Cube();
	body5.color = [0,0.395,0,1];
	body5.matrix = new Matrix4(bodyRel4);
	bodyRel5 = new Matrix4(body5.matrix);
	body5.matrix.rotate(1, 0, 0,1);
	body5.matrix.translate(-0.25,-1,0.01);
	body5.matrix.scale(0.4,0.4,0.35);
	body5.render();
	
	var body6 = new Cube();
	body6.color = [0,0.39,0,1];
	body6.matrix = new Matrix4(bodyRel5);
	bodyRel6 = new Matrix4(body6.matrix);
	body6.matrix.rotate(1, 0, 0,1);
	body6.matrix.translate(-0.35,-.95,0.025);
	body6.matrix.scale(0.4,0.3,0.3);
	body6.render();

	var tail1 = new Cube();
	tail1.color = [0,0.4,0,1];
	tail1.matrix = new Matrix4(bodyRel6);
	tail1Rel = new Matrix4(tail1.matrix);
	tail1.matrix.translate(-0.2,-0.85,0.28);
	tail1.matrix.rotate(10 * Math.sin(g_seconds * 3) + 180,-45, 10 * Math.sin(g_seconds * 3) + 180,1);
	tail1.matrix.scale(0.3,0.2,0.2);
	tail1.render();
	
	var tail2 = new Cube();
	tail2.color = [0,0.38,0,1];
	tail2.matrix = new Matrix4(tail1Rel);
	tail2Rel = new Matrix4(tail2.matrix);
	tail2.matrix.translate(-0.4,-0.9,0.24);
	tail2.matrix.rotate(10 * Math.sin(g_seconds * 3) + 180,-100, 10 * Math.sin(g_seconds * 3) + 180,1);
	tail2.matrix.scale(0.3,0.14,0.12);
	tail2.render();
	
	var tail3 = new Cube();
	tail3.color = [0,0.36,0,1];
	tail3.matrix = new Matrix4(tail2Rel);
	tail3Rel = new Matrix4(tail3.matrix);
	tail3.matrix.translate(-0.55,-1.15,0.2);
	tail3.matrix.rotate(12 * Math.sin(g_seconds * 3) + 180, -195, 10 * Math.sin(g_seconds * 3) + 180,1);
	tail3.matrix.scale(0.25,0.1,0.05);
	tail3.render();
	

	
	//LEGS
	var legs = new Cube();
	legs.color = [0,0.47,0,1]
	legs.matrix = new Matrix4(bodyRel4);
	legsRel = new Matrix4(legs.matrix);
	legs.matrix.translate(0,-1,0);
	legs.matrix.rotate(-20 * Math.sin(g_seconds * 3) + 180, 0, 0,1);
	legs.matrix.scale(0.12,0.5,0.08);
	legs.render();
	
	var legs2 = new Cube();
	legs2.color =[0,0.47,0,1]
	legs2.matrix = new Matrix4(bodyRel4);
	legs2Rel = new Matrix4(legs2.matrix);
	legs2.matrix.translate(0,-1,0.28);
	legs2.matrix.rotate(-20 * Math.sin(g_seconds * 3) + 180, 0, 0,1);
	legs2.matrix.scale(0.12,0.5,0.08);
	legs2.render();
	
	var legs3 = new Cube();
	legs3.color = [0,0.45,0,1]
	legs3.matrix = new Matrix4(bodyRel2);
	legs3Rel = new Matrix4(legs3.matrix);
	legs3.matrix.translate(0.45,-1,0);
	legs3.matrix.rotate(20 * Math.sin(g_seconds * 3) + 180, 0, 0,1);
	legs3.matrix.scale(0.12,0.5,0.08);
	legs3.render();
	
	var legs4 = new Cube();
	legs4.color = [0,0.45,0,1]
	legs4.matrix = new Matrix4(bodyRel2);
	legs4Rel = new Matrix4(legs4.matrix);
	legs4.matrix.translate(0.45,-1,0.28);
	legs4.matrix.rotate(20 * Math.sin(g_seconds * 3) + 180, 0, 0,1);
	legs4.matrix.scale(0.12,0.5,0.08);
	legs4.render();
}

function tick() {

    renderScene();
	
	if(g_animationOn){
		g_seconds = (performance.now() / 1000.0 - g_startTime);
	}
animation();
light();
    requestAnimationFrame(tick);
}
function light(){
	g_lightPos[0] = 2.3 * cos(g_seconds);
}
function animation(){
	if(g_animationOn){
		g_neckAngle = 10*(Math.sin(g_seconds));
		g_headAngle = 10*(Math.sin(g_seconds));
	}
	


}
