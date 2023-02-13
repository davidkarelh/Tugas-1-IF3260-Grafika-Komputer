/* eslint no-console:0 consistent-return:0 */
"use strict";

var canvas, gl, index = 0;

function main() {
  canvas = document.querySelector("canvas");

  // Get A WebGL context
  gl = WebGLUtils.setupWebGL( canvas );

  if (!gl) {
    alert( "WebGL isn't available" );
    return;
  }

  let createShapeRadio = document.getElementById("createShapeRadio");
  let selectShapeRadio = document.getElementById("selectShapeRadio");
  let dilationSlider = document.getElementById("dilation-slider");

  var arrayOfShapes = [];
  var shape_index = 0;
  var mouseDown = false;
  var mouseDownPosition = null;

  var clickMode = 0;
  var selected_shape = null;
  var selected_shape_center = null;

  var is_moving_shape = false;

  var t1, t2, t3, t4;
  var first = true;
  
  // Get the strings for our GLSL shaders
  var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
  var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;

  // create GLSL shaders, upload the GLSL source, compile the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  var program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // Create a buffer and put three 2d clip space points in it
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, 10240, gl.STATIC_DRAW);

  // code above this line is initialization code.
  // code below this line is rendering code.

  gl.canvas.width = (7 / 12) * window.innerWidth;
  gl.canvas.height = (7 / 12) * window.innerWidth;

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

  var oldDilationSliderValue = 1;
  dilationSlider.addEventListener("change", (e) => {
    // console.log(dilationSlider.value);
    if (selected_shape != null) {
      let dilateValue = (dilationSlider.value / oldDilationSliderValue);
      gl.bufferSubData(gl.ARRAY_BUFFER, 8*selected_shape.index, new Float32Array([selected_shape.t1[0] * dilateValue, selected_shape.t1[1] * dilateValue]));
      gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+1), new Float32Array([selected_shape.t3[0] * dilateValue, selected_shape.t3[1] * dilateValue]));
      gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+2), new Float32Array([selected_shape.t2[0] * dilateValue, selected_shape.t2[1] * dilateValue]));
      gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+3), new Float32Array([selected_shape.t4[0] * dilateValue, selected_shape.t4[1] * dilateValue]));

      arrayOfShapes[selected_shape.shape_index].t1 = [selected_shape.t1[0] * dilateValue, selected_shape.t1[1] * dilateValue];
      arrayOfShapes[selected_shape.shape_index].t3 = [selected_shape.t3[0] * dilateValue, selected_shape.t3[1] * dilateValue];
      arrayOfShapes[selected_shape.shape_index].t2 = [selected_shape.t2[0] * dilateValue, selected_shape.t2[1] * dilateValue];
      arrayOfShapes[selected_shape.shape_index].t4 = [selected_shape.t4[0] * dilateValue, selected_shape.t4[1] * dilateValue];
    }
    oldDilationSliderValue = dilationSlider.value;
  })

  createShapeRadio.addEventListener("click", (e) => {
    clickMode = 0;
    selected_shape = null;
    selected_shape_center = null;
    dilationSlider.disabled = true;
    dilationSlider.value = 1;
    oldDilationSliderValue = 1;
  });

  selectShapeRadio.addEventListener("click", (e) => {
    clickMode = 1;
  });

  canvas.addEventListener("mousedown", function(event) {
    mouseDown = true;
    mouseDownPosition = getPositionInCanvas(event);
    // console.log("mouedown");
  });
  
  canvas.addEventListener("mouseup", function(event) {
    mouseDown = false;
    // console.log("mouseup");
    if (is_moving_shape) {
      var position = getPositionInCanvas(event);
      is_moving_shape = false;
      // var old_difference = { x: selected_shape_center[0] - mouseDownPosition.x, y: selected_shape_center[1] - mouseDownPosition.y };
      // var new_difference = { x: selected_shape_center[0] - position.x, y: selected_shape_center[1] - position.y };
      // var correction = { x: old_difference.x - new_difference.x, y: old_difference.y - new_difference.y };

      // arrayOfShapes[selected_shape.shape_index].t1 = [selected_shape.t1[0] + correction.x, selected_shape.t1[1] + correction.y];
      // arrayOfShapes[selected_shape.shape_index].t3 = [selected_shape.t3[0] + correction.x, selected_shape.t3[1] + correction.y];
      // arrayOfShapes[selected_shape.shape_index].t2 = [selected_shape.t2[0] + correction.x, selected_shape.t2[1] + correction.y];
      // arrayOfShapes[selected_shape.shape_index].t4 = [selected_shape.t4[0] + correction.x, selected_shape.t4[1] + correction.y];

      arrayOfShapes[selected_shape.shape_index].t1 = t1;
      arrayOfShapes[selected_shape.shape_index].t3 = t3;
      arrayOfShapes[selected_shape.shape_index].t2 = t2;
      arrayOfShapes[selected_shape.shape_index].t4 = t4;
    }
  });

  canvas.addEventListener("mouseleave", function(event) {
    mouseDown = false;
  });

  canvas.addEventListener("click", function(event) {
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer);
    var position = getPositionInCanvas(event);
    if (clickMode == 0) {
      if (first) {
        first = false;     
        t1 = [position.x, position.y]
  
      } else {
        first = true;
        var abs_x = Math.abs(t1[0] - position.x);
        var abs_y = Math.abs(t1[1] - position.y);
        
        if (abs_x < abs_y) {
          t2 = [position.x, (position.y < t1[1]) ?  (t1[1] - abs_x): (t1[1] + abs_x)];
        } else {
          t2 = [(position.x < t1[0]) ?  (t1[0] - abs_y): (t1[0] + abs_y), position.y];
        }
  
        t3 = [t1[0], t2[1]];
        t4 = [t2[0], t1[1]];
  
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, new Float32Array(t1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+1), new Float32Array(t3));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+2), new Float32Array(t2));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+3), new Float32Array(t4));
        index += 4;
  
        arrayOfShapes.push({
          name: "square",
          shape_index,
          t1,
          t2,
          t3,
          t4,
          index : index - 4
        });

        shape_index += 1;

        // console.log(arrayOfShapes);
          
        // gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
        // var t = [0.0, 0.0, 1.0, 1.0];
  
        // gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index-4), t);
        // gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index-3), t);
        // gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index-2), t);
        // gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index-1), t);

      }
    } else if (clickMode == 1) {
      let shape = isInAShape(event, arrayOfShapes);

      if (shape != null) {
        selected_shape = shape;
        selected_shape_center = getCenterOfShape(selected_shape);
        dilationSlider.disabled = false;
      } else {
        selected_shape = null;
        selected_shape_center = null;
        dilationSlider.disabled = true;
        dilationSlider.value = 1;
        oldDilationSliderValue = 1;
      }
    }
  });

  canvas.addEventListener("mousemove", function(event) {
    let position = getPositionInCanvas(event);
    if (clickMode == 0) {
      canvas.style.cursor = "pointer";
  
      if(!first) {
        gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer);
  
        let abs_x = Math.abs(t1[0] - position.x);
        let abs_y = Math.abs(t1[1] - position.y);
        
        if (abs_x < abs_y) {
          t2 = [position.x, (position.y < t1[1]) ?  (t1[1] - abs_x): (t1[1] + abs_x)];
        } else {
          t2 = [(position.x < t1[0]) ?  (t1[0] - abs_y): (t1[0] + abs_y), position.y];
        }
  
        t3 = [t1[0], t2[1]];
        t4 = [t2[0], t1[1]];
  
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, new Float32Array(t1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+1), new Float32Array(t3));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+2), new Float32Array(t2));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+3), new Float32Array(t4));
      }
    } else if (clickMode == 1) {
      if (selected_shape != null && mouseDown && positionInShape(mouseDownPosition, selected_shape)) {
        let corner_position = positionInCornerShape(mouseDownPosition, selected_shape);
        is_moving_shape = true;
        let old_difference = { x: selected_shape_center[0] - mouseDownPosition.x, y: selected_shape_center[1] - mouseDownPosition.y };
        let new_difference = { x: selected_shape_center[0] - position.x, y: selected_shape_center[1] - position.y };
        let correction = { x: old_difference.x - new_difference.x, y: old_difference.y - new_difference.y };

        if (corner_position != null) {
          // let abs_x = Math.abs(t1[0] - position.x);
          // let abs_y = Math.abs(t1[1] - position.y);
          
          // if (abs_x < abs_y) {
          //   t2 = [position.x, (position.y < t1[1]) ?  (t1[1] - abs_x): (t1[1] + abs_x)];
          // } else {
          //   t2 = [(position.x < t1[0]) ?  (t1[0] - abs_y): (t1[0] + abs_y), position.y];
          // }
    
          // t3 = [t1[0], t2[1]];
          // t4 = [t2[0], t1[1]];

          console.log("corner");
          if (corner_position == "t1") {
            t1 = [selected_shape.t1[0] + correction.x, selected_shape.t1[1] + correction.y];
            t2 = selected_shape.t2;
            // t3 = [selected_shape.t3[0] + correction.x, selected_shape.t3[1]];
            // t4 = [selected_shape.t4[0], selected_shape.t4[1] + correction.y];

            let abs_x = Math.abs(t2[0] - position.x);
            let abs_y = Math.abs(t2[1] - position.y);
            
            if (abs_x < abs_y) {
              t1 = [position.x, (position.y < t2[1]) ?  (t2[1] - abs_x): (t2[1] + abs_x)];
            } else {
              t1 = [(position.x < t2[0]) ?  (t2[0] - abs_y): (t2[0] + abs_y), position.y];
            }
      
            t3 = [t1[0], t2[1]];
            t4 = [t2[0], t1[1]];

            gl.bufferSubData(gl.ARRAY_BUFFER, 8*selected_shape.index, new Float32Array(t1));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+1), new Float32Array(t3));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+3), new Float32Array(t4));
            
          } else if (corner_position == "t2") {
            t1 = selected_shape.t1;
            t2 = [selected_shape.t2[0] + correction.x, selected_shape.t2[1] + correction.y];
            // t3 = [selected_shape.t3[0], selected_shape.t3[1] + correction.y];
            // t4 = [selected_shape.t4[0] + correction.x, selected_shape.t4[1]];

            let abs_x = Math.abs(t1[0] - position.x);
            let abs_y = Math.abs(t1[1] - position.y);
            
            if (abs_x < abs_y) {
              t2 = [position.x, (position.y < t1[1]) ?  (t1[1] - abs_x): (t1[1] + abs_x)];
            } else {
              t2 = [(position.x < t1[0]) ?  (t1[0] - abs_y): (t1[0] + abs_y), position.y];
            }
      
            t3 = [t1[0], t2[1]];
            t4 = [t2[0], t1[1]];

            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+1), new Float32Array(t3));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+2), new Float32Array(t2));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+3), new Float32Array(t4));

          } else if (corner_position == "t3") {
            // t1 = [selected_shape.t1[0] + correction.x, selected_shape.t1[1]];
            // t2 = [selected_shape.t2[0], selected_shape.t2[1] + correction.y];
            t3 = [selected_shape.t3[0] + correction.x, selected_shape.t3[1] + correction.y];
            t4 = selected_shape.t4;

            let abs_x = Math.abs(t4[0] - position.x);
            let abs_y = Math.abs(t4[1] - position.y);
            
            if (abs_x < abs_y) {
              t3 = [position.x, (position.y < t4[1]) ?  (t4[1] - abs_x): (t4[1] + abs_x)];
            } else {
              t3 = [(position.x < t4[0]) ?  (t4[0] - abs_y): (t4[0] + abs_y), position.y];
            }
      
            t1 = [t3[0], t4[1]];
            t2 = [t4[0], t3[1]];

            gl.bufferSubData(gl.ARRAY_BUFFER, 8*selected_shape.index, new Float32Array(t1));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+1), new Float32Array(t3));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+2), new Float32Array(t2));

          } else if (corner_position == "t4") {
            // t1 = [selected_shape.t1[0], selected_shape.t1[1] + correction.y];
            // t2 = [selected_shape.t2[0] + correction.x, selected_shape.t2[1]];
            t3 = selected_shape.t3;
            t4 = [selected_shape.t4[0] + correction.x, selected_shape.t4[1] + correction.y];

            let abs_x = Math.abs(t3[0] - position.x);
            let abs_y = Math.abs(t3[1] - position.y);
            
            if (abs_x < abs_y) {
              t4 = [position.x, (position.y < t3[1]) ?  (t3[1] - abs_x): (t3[1] + abs_x)];
            } else {
              t4 = [(position.x < t3[0]) ?  (t3[0] - abs_y): (t3[0] + abs_y), position.y];
            }
      
            t1 = [t3[0], t4[1]];
            t2 = [t4[0], t3[1]];

            gl.bufferSubData(gl.ARRAY_BUFFER, 8*selected_shape.index, new Float32Array(t1));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+2), new Float32Array(t2));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+3), new Float32Array(t4));

          }

        } else {
          t1 = [selected_shape.t1[0] + correction.x, selected_shape.t1[1] + correction.y];
          t2 = [selected_shape.t2[0] + correction.x, selected_shape.t2[1] + correction.y];
          t3 = [selected_shape.t3[0] + correction.x, selected_shape.t3[1] + correction.y];
          t4 = [selected_shape.t4[0] + correction.x, selected_shape.t4[1] + correction.y];

          gl.bufferSubData(gl.ARRAY_BUFFER, 8*selected_shape.index, new Float32Array(t1));
          gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+1), new Float32Array(t3));
          gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+2), new Float32Array(t2));
          gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+3), new Float32Array(t4));
        }
      }
    }
  });

  render();

  function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    var drawLimit = first ? index : (index + 4);

    for(var i = 0; i < drawLimit; i+=4) {
      gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
    }

    window.requestAnimFrame(render);
  }
}

main();