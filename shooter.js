// Shaders (GLSL)
// https://en.wikipedia.org/wiki/Phong_reflection_model
let VSHADER=`
    precision mediump float;
    attribute vec3 a_Position;
    attribute vec3 a_Normal;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;

    uniform vec3 u_Color;
    uniform vec3 u_ambientColor;
    uniform vec3 u_diffuseColor1;
    uniform vec3 u_diffuseColor2;
    uniform vec3 u_specularColor;
    uniform float u_specularAlpha;

    uniform vec3 u_eyePosition;
    uniform vec3 u_lightPosition;
    uniform vec3 u_lightDirection;

    varying vec4 v_Color;

    vec3 calcAmbient() {
        return u_ambientColor * u_Color;
    }

    vec3 calcDiffuse(vec3 l, vec3 n, vec3 lColor) {
        float nDotL = max(dot(l, n), 0.0);
        return lColor * u_Color * nDotL;
    }

    vec3 calcSpecular(vec3 r, vec3 v) {
        float rDotV = max(dot(r, v), 0.0);
        float rDotVPowAlpha = pow(rDotV, u_specularAlpha);
        return u_specularColor * u_Color * rDotVPowAlpha;
    }

    void main() {
        // Mapping obj coord system to world coord system
        vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);

        vec3 n = normalize(u_NormalMatrix * vec4(a_Normal, 0.0)).xyz; // Normal

        vec3 l1 = normalize(u_lightPosition - worldPos.xyz); // Light direction 1
        vec3 l2 = normalize(u_lightDirection); // Light direction 2

        vec3 v = normalize(u_eyePosition - worldPos.xyz);   // View direction

        vec3 r1 = reflect(l1, n); // Reflected light direction
        vec3 r2 = reflect(l2, n); // Reflected light direction

        // Smooth shading (Goraud)
        vec3 ambient = calcAmbient();

        vec3 diffuse1 = calcDiffuse(l1, n, u_diffuseColor1);
        vec3 diffuse2 = calcDiffuse(l2, n, u_diffuseColor2);

        vec3 specular1 = calcSpecular(r1, v);
        vec3 specular2 = calcSpecular(r2, v);

        v_Color = vec4(ambient + (diffuse1 + diffuse2) + (specular1 + specular2), 1.0);

        gl_Position = u_ProjMatrix * u_ViewMatrix * worldPos;
    }
`;

let FSHADER=`
    precision mediump float;
    uniform vec3 u_Color;
    varying vec4 v_Color;

    void main() {
        gl_FragColor = v_Color;
    }
`;

let modelMatrix = new Matrix4();
let normalMatrix = new Matrix4();

let lightPosition = new Vector3([0.0, 0.0, 1.0]);
let lightDirection = new Vector3([1.0, 1.0, 1.0]);
let lightRotation = new Matrix4().setRotate(1, 0,1,0);

let models = [];

// Uniform locations
let u_ModelMatrix = null;
let u_NormalMatrix = null;
let u_ViewMatrix = null;
let u_ProjMatrix = null;

let u_Color = null;
let u_ambientColor = null;
let u_diffuseColor1 = null;
let u_diffuseColor2 = null;
let u_specularColor = null;
let u_specularAlpha = null;

let u_lightPosition = null;
let u_eyePosition = null;

function drawModel(model) {
    // Update model matrix combining translate, rotate and scale from cube
    modelMatrix.setIdentity();

    // Apply translation for this part of the animal
    modelMatrix.translate(model.translate[0], model.translate[1], model.translate[2]);

    // Apply rotations for this part of the animal
    modelMatrix.rotate(model.rotate[0], 1, 0, 0);
    modelMatrix.rotate(model.rotate[1], 0, 1, 0);
    modelMatrix.rotate(model.rotate[2], 0, 0, 1);

    // Apply scaling for this part of the animal
    modelMatrix.scale(model.scale[0], model.scale[1], model.scale[2]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Compute normal matrix N_mat = (M^-1).T
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // Set u_Color variable from fragment shader
    gl.uniform3f(u_Color, model.color[0], model.color[1], model.color[2]);

    // Send vertices and indices from model to the shaders
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indices, gl.STATIC_DRAW);

    // Draw model
    if(model.type == "lines")
    {
        gl.drawElements(gl.LINE_STRIP, model.indices.length, gl.UNSIGNED_SHORT, 0);
    }
    else
    {
        gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0); 
    }
    
}

function initBuffer(attibuteName, n) {
    let shaderBuffer = gl.createBuffer();
    if(!shaderBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);

    let shaderAttribute = gl.getAttribLocation(gl.program, attibuteName);
    gl.vertexAttribPointer(shaderAttribute, n, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderAttribute);

    return shaderBuffer;
}

function draw() {
    // Draw frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update eye position in the shader
    gl.uniform3fv(u_eyePosition, camera.eye.elements);

    // Update View matrix in the shader
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);

    // Update Projection matrix in the shader
    gl.uniformMatrix4fv(u_ProjMatrix, false, camera.projMatrix.elements);

    for(let m of models) {
        drawModel(m);
    }

    requestAnimationFrame(draw);
}

function addModel(color, shapeType) {
    let model = null;
    switch (shapeType) {
        case "cylinder":
            model = new Cylinder(200,color,"smooth");
            break;
        case "sphere":
            model = new Sphere(color, 13);
            break;
    }

    if(model) {
        models.push(model);
    }

    return model;
}

window.addEventListener("keydown", function(event) {
    
    let speed = 1.0;

    switch (event.key) {

        case "p":
            console.log("linear animation");
            camera.linear();
            break;

    }
});

var speed = 0.1;


kd.W.down(function () {
    camera.moveForward(speed);
  });

  kd.S.down(function () {
    camera.moveForward(-speed);
  });

  kd.A.down(function () {
    camera.moveSideways(-speed);
  });

  kd.D.down(function () {
    camera.moveSideways(speed);
  });

//   kd.MOUSE.down(function () {
//     audio.play();
//   });


// This update loop is the heartbeat of Keydrown
kd.run(function () {
    kd.tick();
  });

function main() {
    

    // Retrieving the canvas tag from html document
    canvas = document.getElementById("canvas");
    

    // Get the rendering context for 2D drawing (vs WebGL)
    gl = canvas.getContext("webgl");
    if(!gl) {
        console.log("Failed to get webgl context");
        return -1;
    }

    // Clear screen
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compiling both shaders and sending them to the GPU
    if(!initShaders(gl, VSHADER, FSHADER)) {
        console.log("Failed to initialize shaders.");
        return -1;
    }

    
    // Retrieve uniforms from shaders
    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");

    u_Color = gl.getUniformLocation(gl.program, "u_Color");
    u_ambientColor = gl.getUniformLocation(gl.program, "u_ambientColor");
    u_diffuseColor1 = gl.getUniformLocation(gl.program, "u_diffuseColor1");
    u_diffuseColor2 = gl.getUniformLocation(gl.program, "u_diffuseColor2");
    u_specularColor = gl.getUniformLocation(gl.program, "u_specularColor");
    u_specularAlpha = gl.getUniformLocation(gl.program, "u_specularAlpha");

    u_lightPosition = gl.getUniformLocation(gl.program, "u_lightPosition");
    u_lightDirection = gl.getUniformLocation(gl.program, "u_lightDirection");


    let ground = addModel([0.1, 0.1, 1.0], "cylinder");
    ground.type = "lines";
    ground.setScale(100, 0.1, 1000);
    ground.setRotate(0,0,0);
    ground.setTranslate(0,-6,-100);

    let table = addModel([1, 1, 1], "cylinder");
    table.type = "triangles";
    table.setScale(3, 3, 3);
    table.setRotate(90,0,0);
    table.setTranslate(0,-3.2,-1);



    

    target = addModel([1.0, 0.0, 0.0], "sphere");
    target.setScale(0.3, 0.3, 0.3);
    target.setRotate(90,90,0);

    rand_min = -2;
    rand_max = 2;

    trans_x = getRandomInt(rand_min, rand_max);
    trans_y = getRandomInt(rand_min, rand_max);
    trans_z = getRandomInt(rand_min, 0);


    target.setTranslate(trans_x,
                        trans_y,
                        trans_z);


    vertexBuffer = initBuffer("a_Position", 3);
    normalBuffer = initBuffer("a_Normal", 3);

    indexBuffer = gl.createBuffer();
    if(!indexBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    // Set light data
    gl.uniform3f(u_ambientColor, 0.2, 0.2, 0.2);
    gl.uniform3f(u_diffuseColor1, 0.8, 0.8, 0.8);
    gl.uniform3f(u_diffuseColor2, 0.8, 0.8, 0.8);
    gl.uniform3f(u_specularColor, 1.0, 1.0, 1.0);

    gl.uniform1f(u_specularAlpha, 32.0);
    gl.uniform3fv(u_lightPosition, lightPosition.elements);
    gl.uniform3fv(u_lightDirection, lightDirection.elements);

    // Set camera data
    camera = new Camera();

    draw();
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }


var mouse_x = 0.0;
var mouse_y = 0.0;
var sensitivity = 10*0.02;

function changeSensitivity(sens)
{
    sensitivity = sens*0.02;

}

function canvasLoop(e) {
    var movementX = e.movementX ||
        e.mozMovementX          ||
        e.webkitMovementX       ||
        0;
  
    var movementY = e.movementY ||
        e.mozMovementY      ||
        e.webkitMovementY   ||
        0;
  
    mouse_x += (movementX*sensitivity);
    mouse_y += (movementY*sensitivity);

    camera.pan(-movementX*sensitivity);
    camera.tilt(-movementY*sensitivity);
  }

function lockChangeAlert() {
    if(document.pointerLockElement === canvas) {
      document.addEventListener("mousemove", canvasLoop, false);
    } else {  
      document.removeEventListener("mousemove", canvasLoop, false);
    }
  }

var target;

var rand_min = 0;
var rand_max = 0;

var trans_x = 0;
var trans_y = 0;
var trans_z = 0;

var gunshot = new Audio("gunshot.mp3");
gunshot.preload = 'auto';
gunshot.load();

var ding = new Audio("ding.mp3");
ding.preload = 'auto';
ding.load();

function playSound(volume,sound) {
  var click=sound.cloneNode();
  click.volume=volume;
  click.play();
}

function mouseLock()
{
    
    document.getElementById("canvas").requestPointerLock();

    
    playSound(1,gunshot);

    let targetDir = new Vector3([trans_x, trans_y, trans_z]);

    let target_vector = targetDir.sub(camera.eye);

    target_dist = target_vector.magnitude();
    
    let angle = Math.acos((Vector3.dot(targetDir,camera.center))/( (targetDir.magnitude())*(camera.center.magnitude()) ));

    angle = angle*(180/(Math.PI));

    let factor = 16;

    if(angle < factor/target_dist)
    {
        console.log("on target!");
        playSound(1,ding);


        models.pop();

        target = addModel([1.0, 0.0, 0.0], "sphere");
        target.type = "triangles";
        target.setScale(0.3, 0.3, 0.3);
        target.setRotate(90,90,0);

        rand_min = -2;
        rand_max = 2;

        trans_x = getRandomInt(rand_min, rand_max);
        trans_y = getRandomInt(rand_min, rand_max);
        trans_z = getRandomInt(rand_min, 0);

        target.setTranslate(trans_x,
                            trans_y,
                            trans_z);
    }

    else
    {
        console.log("# you missed #");
    }
}

document.addEventListener('pointerlockchange', lockChangeAlert, false);