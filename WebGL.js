var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute vec3 a_Normal;

    uniform mat4 u_modelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;
    uniform vec3 u_LightPosition;
    uniform vec3 u_ViewPosition;

    varying vec4 v_Color;

    void main() {
      vec4 worldPos = u_modelMatrix * a_Position;
      vec3 normal = normalize(mat3(u_modelMatrix) * a_Normal);

      vec3 lightDir = normalize(u_LightPosition - worldPos.xyz);
      vec3 viewDir = normalize(u_ViewPosition - worldPos.xyz);
      vec3 reflectDir = reflect(-lightDir, normal);

      float ambientStrength = 0.3;
      float diffuseStrength = max(dot(normal, lightDir), 0.0);
      float specularStrength = pow(max(dot(viewDir, reflectDir), 0.0), 8.0);

      vec3 ambient = ambientStrength * a_Color.rgb * 0.8;  
      vec3 diffuse = diffuseStrength * a_Color.rgb * 0.9;  

      vec3 specular = specularStrength * vec3(0.8, 0.9, 1.0); 

      vec3 finalColor = ambient + diffuse + specular;
      v_Color = vec4(finalColor, 1.0);

      gl_Position = u_ProjMatrix * u_ViewMatrix * worldPos;
    }
`;


var FSHADER_SOURCE = `
        precision mediump float;
        varying vec4 v_Color;
        void main(){
            gl_FragColor = v_Color;
        }
`;


function createProgram(gl, vertexShader, fragmentShader){
    //create the program and attach the shaders
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    //if success, return the program. if not, log the program info, and delete it.
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        return program;
    }
    alert(gl.getProgramInfoLog(program) + "");
    gl.deleteProgram(program);
}

function compileShader(gl, vShaderText, fShaderText){
    //////Build vertex and fragment shader objects
    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    //The way to  set up shader text source
    gl.shaderSource(vertexShader, vShaderText)
    gl.shaderSource(fragmentShader, fShaderText)
    //compile vertex shader
    gl.compileShader(vertexShader)
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.log('vertex shader ereror');
        var message = gl.getShaderInfoLog(vertexShader); 
        console.log(message);//print shader compiling error message
    }
    //compile fragment shader
    gl.compileShader(fragmentShader)
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.log('fragment shader ereror');
        var message = gl.getShaderInfoLog(fragmentShader);
        console.log(message);//print shader compiling error message
    }

    /////link shader to program (by a self-define function)
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    //if not success, log the program info, and delete it.
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        alert(gl.getProgramInfoLog(program) + "");
        gl.deleteProgram(program);
    }

    return program;
}

/////BEGIN:///////////////////////////////////////////////////////////////////////////////////////////////
/////The folloing three function is for creating vertex buffer, but link to shader to user later//////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function initAttributeVariable(gl, a_attribute, buffer){
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

function initArrayBufferForLaterUse(gl, data, num, type) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return null;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  
    // Store the necessary information to assign the object to the attribute variable later
    buffer.num = num;
    buffer.type = type;
  
    return buffer;
}

function initVertexBufferForLaterUse(gl, vertices, colors){
    var nVertices = vertices.length / 3;

    var o = new Object();
    o.vertexBuffer = initArrayBufferForLaterUse(gl, new Float32Array(vertices), 3, gl.FLOAT);
    o.colorBuffer = initArrayBufferForLaterUse(gl, new Float32Array(colors), 3, gl.FLOAT);
    if (!o.vertexBuffer || !o.colorBuffer) 
        console.log("Error: in initVertexBufferForLaterUse(gl, vertices, colors)"); 
    o.numVertices = nVertices;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return o;
}

function drawCube(gl, matrix, color) {
  const vertices = [
    // 前面
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,
    // 後面
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
    -0.5,  0.5, -0.5
  ];

  const normals = [
    // 前面 (0, 0, 1)
    0, 0, 1,  0, 0, 1,  0, 0, 1,
    0, 0, 1,  0, 0, 1,  0, 0, 1,
    // 後面 (0, 0, -1)
    0, 0, -1,  0, 0, -1,  0, 0, -1,
    0, 0, -1,  0, 0, -1,  0, 0, -1,
    // 上面 (0, 1, 0)
    0, 1, 0,  0, 1, 0,  0, 1, 0,
    0, 1, 0,  0, 1, 0,  0, 1, 0,
    // 下面 (0, -1, 0)
    0, -1, 0,  0, -1, 0,  0, -1, 0,
    0, -1, 0,  0, -1, 0,  0, -1, 0,
    // 右面 (1, 0, 0)
    1, 0, 0,  1, 0, 0,  1, 0, 0,
    1, 0, 0,  1, 0, 0,  1, 0, 0,
    // 左面 (-1, 0, 0)
   -1, 0, 0, -1, 0, 0, -1, 0, 0,
   -1, 0, 0, -1, 0, 0, -1, 0, 0
  ];
  

  const indices = [
    // 前面
    0, 1, 2,   0, 2, 3,
    // 後面
    4, 5, 6,   4, 6, 7,
    // 上面
    3, 2, 6,   3, 6, 7,
    // 下面
    0, 1, 5,   0, 5, 4,
    // 右面
    1, 2, 6,   1, 6, 5,
    // 左面
    0, 3, 7,   0, 7, 4,
  ];

  const colors = [];
  for (let i = 0; i < 8; i++) colors.push(...color);

  const vertexBuffer = initArrayBufferForLaterUse(gl, new Float32Array(vertices), 3, gl.FLOAT);
  const colorBuffer = initArrayBufferForLaterUse(gl, new Float32Array(colors), 3, gl.FLOAT);
  const normalBuffer = initArrayBufferForLaterUse(gl, new Float32Array(normals), 3, gl.FLOAT);
  program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
  initAttributeVariable(gl, program.a_Normal, normalBuffer);


  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  initAttributeVariable(gl, program.a_Position, vertexBuffer);
  initAttributeVariable(gl, program.a_Color, colorBuffer);
  gl.uniformMatrix4fv(program.u_modelMatrix, false, matrix.elements);

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function drawSphere(gl, matrix, radius, color) {
  const latBands = 30;
  const longBands = 30;
  let vertices = [];
  let normals = [];
  let colors = [];

  for (let lat = 0; lat <= latBands; lat++) {
    let theta = lat * Math.PI / latBands;
    let sinTheta = Math.sin(theta);
    let cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= longBands; lon++) {
      let phi = lon * 2 * Math.PI / longBands;
      let sinPhi = Math.sin(phi);
      let cosPhi = Math.cos(phi);

      let x = cosPhi * sinTheta;
      let y = cosTheta;
      let z = sinPhi * sinTheta;

      vertices.push(radius * x, radius * y, radius * z);
      normals.push(x, y, z);
      colors.push(...color);
    }
  }

  let indices = [];
  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < longBands; lon++) {
      let first = (lat * (longBands + 1)) + lon;
      let second = first + longBands + 1;
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  const vertexBuffer = initArrayBufferForLaterUse(gl, new Float32Array(vertices), 3, gl.FLOAT);
  const normalBuffer = initArrayBufferForLaterUse(gl, new Float32Array(normals), 3, gl.FLOAT);
  const colorBuffer = initArrayBufferForLaterUse(gl, new Float32Array(colors), 3, gl.FLOAT);
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
  initAttributeVariable(gl, program.a_Normal, normalBuffer);
  initAttributeVariable(gl, program.a_Position, vertexBuffer);
  initAttributeVariable(gl, program.a_Color, colorBuffer);
  gl.uniformMatrix4fv(program.u_modelMatrix, false, matrix.elements);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function drawPyramid(gl, matrix, color) {
  const vertices = [
    // 底部（逆時針）
    -0.1, 0.0, -0.1,
     0.1, 0.0, -0.1,
     0.0, 0.0,  0.1,
  
    // 側面三角形 1
    -0.1, 0.0, -0.1,
     0.1, 0.0, -0.1,
     0.0, 0.2,  0.0,
  
    // 側面三角形 2
     0.1, 0.0, -0.1,
     0.0, 0.0,  0.1,
     0.0, 0.2,  0.0,
  
    // 側面三角形 3
     0.0, 0.0,  0.1,
    -0.1, 0.0, -0.1,
     0.0, 0.2,  0.0,
  
    // 側面三角形 4
    -0.1, 0.0, -0.1,
     0.0, 0.0,  0.1,
     0.0, 0.2,  0.0,
  ];
  
  const colors = [
    // 底部三角形
    1, 0, 0,   
    0, 1, 0,   
    0, 0, 1,   
  
    // 側面三角形 1
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  
    // 側面三角形 2
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  
    // 側面三角形 3
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ];
  
  for (let i = 0; i < vertices.length / 3; i++) {
    colors.push(...color);
  }

  const normals = [
    // 底部三角形 normal（朝下）
    0, 0, -1,  0, 0, -1,  0, 0, -1,
    // 側面 1 normal
    0, -0.5, 1,  0, -0.5, 1,  0, -0.5, 1,
    // 側面 2 normal
    1, 0.5, 1,  1, 0.5, 1,  1, 0.5, 1,
    // 側面 3 normal
    -1, 0.5, 1,  -1, 0.5, 1,  -1, 0.5, 1
  ];
  
  for (let i = 0; i < vertices.length / 3; i++) {
    normals.push(0, 0, 1); 
  }

  const model = initVertexBufferForLaterUse(gl, vertices, colors);
  const normalBuffer = initArrayBufferForLaterUse(gl, new Float32Array(normals), 3, gl.FLOAT);

  program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
  initAttributeVariable(gl, program.a_Normal, normalBuffer);
  initAttributeVariable(gl, program.a_Position, model.vertexBuffer);
  initAttributeVariable(gl, program.a_Color, model.colorBuffer);
  gl.uniformMatrix4fv(program.u_modelMatrix, false, matrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, model.numVertices);
}

/////END://///////////////////////////////////////////////////////////////////////////////////////////////
/////The folloing three function is for creating vertex buffer, but link to shader to user later//////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

var transformMat = new Matrix4(); //cuon 4x4 matrix
var transformMatCircle1 = new Matrix4(); //initial circle base transformation matrix
transformMatCircle1.setTranslate(1, 0.5, -1);
   
var triangle1XMove = 0;
var triangle1YMove = 0;
var grab = false;
var canGrab = false;

circle1Angle = 0; //the angle of the triangle on the circle

let scale = 1;
let joint1Angle = 0;
let joint2Angle = 0;
let joint3Angle = 0;
let jointA = 0;
let jointB = 0;
let pendingGrab = false;
let camAngleX = 0; // 左右旋轉
let camAngleY = 20; // 上下仰角
let isDragging = false;
let lastMouseX, lastMouseY;
let cameraDistance = 5;

/////// create circle model
var circleVertices = []
var circleColors = []
var circleColorsTouch = []
var circleColorsGrab = []
var circleRadius = 0.1;
for (i = 0; i <= 1000; i++){
  circleRadius = 0.1
  x = circleRadius*Math.cos(i * 2 * Math.PI / 200)
  y = circleRadius*Math.sin(i * 2 * Math.PI / 200) 
  circleVertices.push(x, y);
  circleColors.push(1, 0, 0); //circle normal color
  circleColorsTouch.push(0, 1, 0); //color when the circle connect with the triangle corner
  circleColorsGrab.push(0, 0.5, 0); //color when the circle is grabbed by the triangle corner
}


function main(){
    //////Get the canvas context
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    gl.enable(gl.DEPTH_TEST); // 開啟深度測試

    /////compile shader and use it
    program = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    gl.useProgram(program);

    /////prepare attribute reference of the shader
    program.a_Position = gl.getAttribLocation(program, 'a_Position');
    program.a_Color = gl.getAttribLocation(program, 'a_Color');
    program.u_modelMatrix = gl.getUniformLocation(program, 'u_modelMatrix');
    program.u_ViewMatrix = gl.getUniformLocation(program, 'u_ViewMatrix');
    program.u_ProjMatrix = gl.getUniformLocation(program, 'u_ProjMatrix');
    program.u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
    program.u_ViewPosition = gl.getUniformLocation(program, 'u_ViewPosition');

  if (program.a_Position < 0 || program.a_Color < 0 || program.a_Normal < 0 ||
    program.u_modelMatrix < 0 || program.u_ViewMatrix < 0 || 
    program.u_ProjMatrix < 0 || program.u_LightPosition < 0 || 
    program.u_ViewPosition < 0) {
      console.log('Error: Failed to get uniform/attribute location');
    }

    ////create vertex buffer of the circle with red color, light green and dark green color
    circleModel = initVertexBufferForLaterUse(gl, circleVertices, circleColors);
    circleModelTouch = initVertexBufferForLaterUse(gl, circleVertices, circleColorsTouch);
    circleModelGrab = initVertexBufferForLaterUse(gl, circleVertices, circleColorsGrab);

    function setupSliders() {
      document.getElementById("moveX").oninput = e => triangle1XMove = parseFloat(e.target.value);
      document.getElementById("moveY").oninput = e => triangle1YMove = parseFloat(e.target.value);
      document.getElementById("scale").oninput = e => scale = parseFloat(e.target.value);
      document.getElementById("joint1").oninput = e => joint1Angle = parseFloat(e.target.value);
      document.getElementById("joint2").oninput = e => joint2Angle = parseFloat(e.target.value);
      document.getElementById("joint3").oninput = e => joint3Angle = parseFloat(e.target.value);
      document.getElementById("jointA").oninput = e => jointA = parseFloat(e.target.value);
      document.getElementById("jointB").oninput = e => jointB = parseFloat(e.target.value);
    }
    setupSliders();

    document.addEventListener('keydown', (event)=> {    
        if ( event.key == 'g' || event.key == 'G'){ //shorten the second triangle
          pendingGrab = true;
            draw(gl)
        }
    });

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
    
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    
      camAngleX += deltaX * 0.5;
      camAngleY += deltaY * 0.5;
      camAngleY = Math.max(-85, Math.min(85, camAngleY)); // 限制上下視角範圍
    });
    
    canvas.addEventListener('mouseup', () => {
      isDragging = false;
    });
    canvas.addEventListener('mouseleave', () => {
      isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault(); // 防止畫面捲動
      cameraDistance += e.deltaY * 0.01;
      cameraDistance = Math.max(2, Math.min(20, cameraDistance)); // 限制範圍
    });
    
    ////For creating animation, in short this code segment will keep calling "draw(gl)" 
    ////btw, this needs "webgl-util.js" in the folder (we include it in index.html)
    var tick = function() {
        draw(gl);
        requestAnimationFrame(tick);
    }
    tick();
}

function draw(gl) {
  let radX = camAngleX * Math.PI / 180;
  let radY = camAngleY * Math.PI / 180;
  let camX = cameraDistance * Math.sin(radX) * Math.cos(radY);
  let camY = cameraDistance * Math.sin(radY);
  let camZ = cameraDistance * Math.cos(radX) * Math.cos(radY);

  let viewMatrix = new Matrix4();
  viewMatrix.setLookAt(camX, camY, camZ,  0, 0, 0,  0, 1, 0);

  let projMatrix = new Matrix4();
  projMatrix.setPerspective(60, 1, 1, 100);
  gl.uniformMatrix4fv(program.u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(program.u_ProjMatrix, false, projMatrix.elements);
  gl.uniform3f(program.u_LightPosition, 0, 5, 2);
  gl.uniform3f(program.u_ViewPosition, 0, 3, 3);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let floorMat = new Matrix4();
  floorMat.setTranslate(0, -0.1, 0); 
  floorMat.scale(4, 0.2, 4);
  drawCube(gl, floorMat, [0.3, 0.3, 0.6]);

  let lightMarker = new Matrix4().setTranslate(0, 5, 2).scale(0.3, 0.3, 0.3);
  drawSphere(gl, lightMarker, 1, [1, 1, 1]);

  triangle1XMove = Math.max(-1.5, Math.min(1.5, triangle1XMove));
  triangle1YMove = Math.max(-1.5, Math.min(1.5, triangle1YMove));

  let estimatedBottomToCenter = 0.418;
  transformMat.setIdentity();
  transformMat.translate(triangle1XMove, estimatedBottomToCenter * scale, triangle1YMove);
  transformMat.scale(scale, scale, scale);

  // draw robot base
  let robotBase = new Matrix4(transformMat);
  robotBase.translate(0, -0.1, 0);
  robotBase.scale(0.6, 0.3, 1);
  drawCube(gl, robotBase, [0, 1, 1]); 

  // wheels
  let wheel1 = new Matrix4(transformMat).translate(0.23, -0.32,  0.3).scale(0.1, 0.1, 0.1); // 右前
  let wheel2 = new Matrix4(transformMat).translate(0.23, -0.32, -0.3).scale(0.1, 0.1, 0.1); // 右後
  let wheel3 = new Matrix4(transformMat).translate(-0.23, -0.32,  0.3).scale(0.1, 0.1, 0.1); // 左前
  let wheel4 = new Matrix4(transformMat).translate(-0.23, -0.32, -0.3).scale(0.1, 0.1, 0.1); // 左後

  drawSphere(gl, wheel1, 1, [1, 0, 0]);
  drawSphere(gl, wheel2, 1, [1, 0, 0]);
  drawSphere(gl, wheel3, 1, [1, 0, 0]);
  drawSphere(gl, wheel4, 1, [1, 0, 0]);

  // yellow triangle (head)
  let head = new Matrix4(transformMat).translate(0, 0.05, 0).scale(1.5, 1.5, 1.5);
  drawPyramid(gl, head, [0, 1, -1, -1, 1, -1], [1, 1, 0]);

  // --- 機械手臂的三段連動 ---
  // J1
  let j1 = new Matrix4(transformMat).translate(0, 0.4, 0).rotate(joint1Angle, 0, 0, 1);
  drawSphere(gl, new Matrix4(j1).scale(0.05, 0.05, 0.05), 1, [1, 0, 1]);
  let arm1 = new Matrix4(j1).translate(0, 0.05 + 0.2, 0).scale(0.05, 0.4, 0.05);
  drawCube(gl, arm1, [1, 1, 1]);

  // J2
  let j2 = new Matrix4(j1).translate(0, 0.05 + 0.45, 0).rotate(joint2Angle, 0, 0, 1);
  drawSphere(gl, new Matrix4(j2).scale(0.05, 0.05, 0.05), 1, [1, 0, 1]);
  let arm2 = new Matrix4(j2).translate(0, 0.05 + 0.2, 0).scale(0.05, 0.4, 0.05);
  drawCube(gl, arm2, [1, 1, 1]);

  // J3
  let j3 = new Matrix4(j2).translate(0, 0.05 + 0.45, 0).rotate(joint3Angle, 0, 0, 1);
  drawSphere(gl, new Matrix4(j3).scale(0.05, 0.05, 0.05), 1, [1, 0, 1]);
  let claw = new Matrix4(j3).translate(0, 0 + 0.05, 0);
  drawPyramid(gl, claw, [0, 0, -0.2, 0.1, -0.2, -0.1], [1, 0, 0]);

  const triangleCornerWorld = new Matrix4(j3)
  .multiplyVector4(new Vector4([0, 0.2, 0, 1]));

  let objectMat = new Matrix4(transformMatCircle1); 
  objectMat.scale(scale, scale, scale); 

  const circleCenterWorld = objectMat.multiplyVector4(new Vector4([0, 0, 0, 1]));

  const dx = triangleCornerWorld.elements[0] - circleCenterWorld.elements[0];
  const dy = triangleCornerWorld.elements[1] - circleCenterWorld.elements[1];
  const dz = triangleCornerWorld.elements[2] - circleCenterWorld.elements[2];
  const actualRadius = circleRadius * scale;
  canGrab = dx * dx + dy * dy + dz * dz < actualRadius * actualRadius;

  if (pendingGrab) {
    if (canGrab && !grab) {
      grab = true;
      transformMatCircle1.setTranslate(
        triangleCornerWorld.elements[0],
        triangleCornerWorld.elements[1],
        triangleCornerWorld.elements[2]  
      );
    }
     else if (grab) {
      grab = false;
    }
    pendingGrab = false;
  }
  
  if (grab) {
    transformMatCircle1.setTranslate(
      triangleCornerWorld.elements[0],
      triangleCornerWorld.elements[1],
      triangleCornerWorld.elements[2]  
    );
  
    objectMat = new Matrix4(transformMatCircle1); 
    objectMat.scale(scale, scale, scale);             
  }
  
  let circleColor = [1, 0, 0];
  if (grab) circleColor = [0, 0.5, 0];
  else if (canGrab) circleColor = [0, 1, 0];
  drawSphere(gl, objectMat, circleRadius, circleColor);

  let baseArm = new Matrix4(objectMat).translate(0, 0.2 + 0.1, 0);
  drawCube(gl, new Matrix4(baseArm).scale(0.05, 0.4, 0.05), [0, 0.3, 1.0]);
  
  let jointA_mat = new Matrix4(objectMat).translate(0, 0.05 + 0.5, 0).rotate(jointA, 0, 0, 1);
  drawSphere(gl, new Matrix4(jointA_mat).scale(0.05, 0.05, 0.05), 1, [0, 1, 0]);
  let arm4 = new Matrix4(jointA_mat).translate(0, 0.05 + 0.2, 0).scale(0.05, 0.4, 0.05);
  drawCube(gl, arm4, [0, 0.3, 1.0]);

  let jointB_mat = new Matrix4(jointA_mat).translate(0, 0.05 + 0.45, 0).rotate(jointB, 0, 0, 1);
  drawSphere(gl, new Matrix4(jointB_mat).scale(0.05, 0.05, 0.05), 1, [0, 1, 0]);
  let arm5 = new Matrix4(jointB_mat).translate(0, 0.05 + 0.2, 0).scale(0.05, 0.4, 0.05);
  drawCube(gl, arm5, [0, 0.3, 1.0]);
}
