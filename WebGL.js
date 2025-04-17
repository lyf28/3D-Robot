var VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        varying vec4 v_Color;
        uniform mat4 u_modelMatrix;
        void main(){
            gl_Position = u_modelMatrix * a_Position;
            gl_PointSize = 10.0;
            v_Color = a_Color;
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

function drawRectColor(gl, matrix, color) {
  let rectVertices = [
    -0.5, -0.5, 0.0,
     0.5, -0.5, 0.0,
    -0.5,  0.5, 0.0,
    -0.5,  0.5, 0.0,
     0.5, -0.5, 0.0,
     0.5,  0.5, 0.0,
  ];
  let rectColors = [];
  for (let i = 0; i < 6; i++) rectColors.push(...color);

  let rectModel = initVertexBufferForLaterUse(gl, rectVertices, rectColors);
  initAttributeVariable(gl, program.a_Position, rectModel.vertexBuffer);
  initAttributeVariable(gl, program.a_Color, rectModel.colorBuffer);
  gl.uniformMatrix4fv(program.u_modelMatrix, false, matrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, rectModel.numVertices);
}


function drawRect(gl, matrix, color) {
  let rectVertices = [
    -0.5, -0.5, 0.0,
     0.5, -0.5, 0.0,
    -0.5,  0.5, 0.0,
    -0.5,  0.5, 0.0,
     0.5, -0.5, 0.0,
     0.5,  0.5, 0.0
  ];
  let rectColors = [];
  for (let i = 0; i < 6; i++) rectColors.push(...color);

  let model = initVertexBufferForLaterUse(gl, rectVertices, rectColors);
  initAttributeVariable(gl, program.a_Position, model.vertexBuffer);
  initAttributeVariable(gl, program.a_Color, model.colorBuffer);
  gl.uniformMatrix4fv(program.u_modelMatrix, false, matrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, model.numVertices);
}


function drawTriangle(gl, matrix, points, color) {
  let converted = [];
  for (let i = 0; i < points.length; i += 2) {
    converted.push(points[i], points[i + 1], 0.0);
  }

  let colors = [];
  for (let i = 0; i < converted.length / 3; i++) {
    colors.push(...color);
  }

  let model = initVertexBufferForLaterUse(gl, converted, colors);
  initAttributeVariable(gl, program.a_Position, model.vertexBuffer);
  initAttributeVariable(gl, program.a_Color, model.colorBuffer);
  gl.uniformMatrix4fv(program.u_modelMatrix, false, matrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, model.numVertices);
}


function drawCircle(gl, matrix, radius, color) {
  const segments = 40;
  const angleStep = 2 * Math.PI / segments;

  let vertices = [0, 0, 0.0]; 
  
  for (let i = 0; i <= segments; i++) {
    const angle = i * angleStep;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    vertices.push(x, y, 0.0); 
  }

  let colors = [];
  for (let i = 0; i < vertices.length / 3; i++) {
    colors.push(...color);
  }

  let model = initVertexBufferForLaterUse(gl, vertices, colors);
  initAttributeVariable(gl, program.a_Position, model.vertexBuffer);
  initAttributeVariable(gl, program.a_Color, model.colorBuffer);
  gl.uniformMatrix4fv(program.u_modelMatrix, false, matrix.elements);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, model.numVertices);
}



/////END://///////////////////////////////////////////////////////////////////////////////////////////////
/////The folloing three function is for creating vertex buffer, but link to shader to user later//////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

var transformMat = new Matrix4(); //cuon 4x4 matrix
var transformMatCircle1 = new Matrix4(); //initial circle base transformation matrix
transformMatCircle1.setTranslate(0.5, 0, 0);

//NOTE: You are NOT allowed to change the vertex information here
var triangleVerticesA = [0.0, 0.2, 0.0, -0.1, -0.3, 0.0, 0.1, -0.3, 0.0]; //green rotating triangle vertices
var triangleColorA = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0 ]; //green trotating riangle color

//NOTE: You are NOT allowed to change the vertex information here
var triangleVerticesB = [0.0, 0.0, 0.0, -0.1, -0.5, 0.0, 0.1, -0.5, 0.0]; //green rotating triangle vertices
var triangleColorB= [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0 ]; //green trotating riangle color

   
var triangle1XMove = 0;
var triangle1YMove = 0;
var triangle2Angle = 125;
var triangle2HeightScale = 1;
var triangle3Angle = 0;
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
    if(program.a_Position<0 || program.a_Color<0 || program.u_modelMatrix < 0)  
        console.log('Error: f(program.a_Position<0 || program.a_Color<0 || .....');

    /////create vertex buffer of the two triangle models for later use
    triangleModelA = initVertexBufferForLaterUse(gl, triangleVerticesA, triangleColorA);
    triangleModelB = initVertexBufferForLaterUse(gl, triangleVerticesB, triangleColorB);

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

    ////For creating animation, in short this code segment will keep calling "draw(gl)" 
    ////btw, this needs "webgl-util.js" in the folder (we include it in index.html)
    var tick = function() {
        draw(gl);
        requestAnimationFrame(tick);
    }
    tick();
}

function draw(gl) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 💡 把移動、縮放加在機器人 base 的 transformMat
  transformMat.setIdentity();
  transformMat.translate(triangle1XMove, triangle1YMove, 0);
  transformMat.scale(scale, scale, 1);

  // draw robot base
  let robotBase = new Matrix4(transformMat);
  robotBase.translate(0, -0.1, 0);
  robotBase.scale(0.6, 0.3, 1);
  drawRect(gl, robotBase, [0, 1, 1]); 

  // wheels
  let wheel4 = new Matrix4(transformMat).translate(-0.22, -0.32, 0).scale(0.07, 0.07, 1);
  let wheel3 = new Matrix4(transformMat).translate(-0.07, -0.32, 0).scale(0.07, 0.07, 1);
  let wheel1 = new Matrix4(transformMat).translate(0.08, -0.32, 0).scale(0.07, 0.07, 1);
  let wheel2 = new Matrix4(transformMat).translate(0.23, -0.32, 0).scale(0.07, 0.07, 1);

  drawCircle(gl, wheel1, 1, [1, 0, 0]);
  drawCircle(gl, wheel2, 1, [1, 0, 0]);
  drawCircle(gl, wheel3, 1, [1, 0, 0]);
  drawCircle(gl, wheel4, 1, [1, 0, 0]);

  // yellow triangle (head)
  let head = new Matrix4(transformMat).translate(0, 0.05, 0).scale(0.15, 0.3, 1);
  drawTriangle(gl, head, [0, 1, -1, -1, 1, -1], [1, 1, 0]);

  // --- 機械手臂的三段連動 ---
  // J1
  let j1 = new Matrix4(transformMat).translate(0, 0.4, 0).rotate(joint1Angle, 0, 0, 1);
  drawCircle(gl, new Matrix4(j1).scale(0.05, 0.05, 1), 1, [1, 0, 1]);
  let arm1 = new Matrix4(j1).translate(0, 0.05 + 0.2, 0).scale(0.1, 0.4, 1);
  drawRect(gl, arm1, [1, 1, 1]);

  // J2
  let j2 = new Matrix4(j1).translate(0, 0.05 + 0.45, 0).rotate(joint2Angle, 0, 0, 1);
  drawCircle(gl, new Matrix4(j2).scale(0.05, 0.05, 1), 1, [1, 0, 1]);
  let arm2 = new Matrix4(j2).translate(0, 0.05 + 0.2, 0).scale(0.1, 0.4, 1);
  drawRect(gl, arm2, [1, 1, 1]);

  // J3
  let j3 = new Matrix4(j2).translate(0, 0.05 + 0.45, 0).rotate(joint3Angle, 0, 0, 1);
  drawCircle(gl, new Matrix4(j3).scale(0.05, 0.05, 1), 1, [1, 0, 1]);
  let claw = new Matrix4(j3).translate(0, 0, 0);
  drawTriangle(gl, claw, [0, 0, -0.2, 0.1, -0.2, -0.1], [1, 0, 0]);

  const triangleCornerWorld = new Matrix4(j3)
  .multiplyVector4(new Vector4([-0.2, -0.1, 0, 1]));

  let objectMat = new Matrix4(transformMatCircle1); 
  objectMat.scale(scale, scale, 1); 

  const circleCenterWorld = objectMat.multiplyVector4(new Vector4([0, 0, 0, 1]));

  const dx = triangleCornerWorld.elements[0] - circleCenterWorld.elements[0];
  const dy = triangleCornerWorld.elements[1] - circleCenterWorld.elements[1];
  const actualRadius = circleRadius * scale;
  canGrab = dx * dx + dy * dy < actualRadius * actualRadius;

  if (pendingGrab) {
    if (canGrab && !grab) {
      grab = true;
      const dx = triangleCornerWorld.elements[0] - circleCenterWorld.elements[0];
      const dy = triangleCornerWorld.elements[1] - circleCenterWorld.elements[1];
      transformMatCircle1.translate(dx, dy, 0);
    } else if (grab) {
      grab = false;
    }
    pendingGrab = false;
  }
  
  if (grab) {
    transformMatCircle1.setTranslate(triangleCornerWorld.elements[0], triangleCornerWorld.elements[1], 0);
  
    objectMat = new Matrix4(transformMatCircle1); 
    objectMat.scale(scale, scale, 1);             
  }

  let circleColor = [1, 0, 0];
  if (grab) circleColor = [0, 0.5, 0];
  else if (canGrab) circleColor = [0, 1, 0];
  drawCircle(gl, objectMat, circleRadius, circleColor);

  let baseArm = new Matrix4(objectMat).translate(0, 0.2 + 0.1, 0);
  drawRect(gl, new Matrix4(baseArm).scale(0.1, 0.4, 1), [0, 0.3, 1.0]);
  
  let jointA_mat = new Matrix4(objectMat).translate(0, 0.05 + 0.5, 0).rotate(jointA, 0, 0, 1);
  drawCircle(gl, new Matrix4(jointA_mat).scale(0.05, 0.05, 1), 1, [0, 1, 0]);
  let arm4 = new Matrix4(jointA_mat).translate(0, 0.05 + 0.2, 0).scale(0.1, 0.4, 1);
  drawRect(gl, arm4, [0, 0.3, 1.0]);

  let jointB_mat = new Matrix4(jointA_mat).translate(0, 0.05 + 0.45, 0).rotate(jointB, 0, 0, 1);
  drawCircle(gl, new Matrix4(jointB_mat).scale(0.05, 0.05, 1), 1, [0, 1, 0]);
  let arm5 = new Matrix4(jointB_mat).translate(0, 0.05 + 0.2, 0).scale(0.1, 0.4, 1);
  drawRect(gl, arm5, [0, 0.3, 1.0]);
}
