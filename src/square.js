/* eslint no-console:0 consistent-return:0 */
"use strict";

canvas;
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
  let dilationSliderLabel = document.querySelector("label[for='dilation-slider']");
  let colorPicker = document.getElementById("colorPicker");
  let colorPickerLabel = document.querySelector("label[for='colorPicker']");

  var arrayOfShapes = [];
  var shape_index = 0;
  var mouseDown = false;
  var mouseDownPosition = null;

  var clickMode = 0;
  var selected_shape = null;
  var selected_shape_center = null;

  var is_moving_shape = false;
  var vertex_clicked = false;
  var clicked_vertex = null;

  var v1, v2, v3, v4;
  var default_color = [1, 1, 0, 1]; // yellow
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

  // look up where the color data needs to go.
  var colorAttributeLocation = gl.getAttribLocation(program, "a_color");

  // Create a buffer for color
  var colorBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, 20480, gl.STATIC_DRAW);

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

  // Turn on the attribute
  gl.enableVertexAttribArray(colorAttributeLocation);

  // Bind the color buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
  var size = 4;          // 4 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);

  var oldDilationSliderValue = 1;
  dilationSlider.addEventListener("change", (e) => {
    if (selected_shape != null) {
      let dilateValue = (dilationSlider.value / oldDilationSliderValue);
      gl.bufferSubData(gl.ARRAY_BUFFER, 8*selected_shape.index, new Float32Array([selected_shape.vertices.v1[0] * dilateValue, selected_shape.vertices.v1[1] * dilateValue]));
      gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+1), new Float32Array([selected_shape.vertices.v3[0] * dilateValue, selected_shape.vertices.v3[1] * dilateValue]));
      gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+2), new Float32Array([selected_shape.vertices.v2[0] * dilateValue, selected_shape.vertices.v2[1] * dilateValue]));
      gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+3), new Float32Array([selected_shape.vertices.v4[0] * dilateValue, selected_shape.vertices.v4[1] * dilateValue]));

      arrayOfShapes[selected_shape.shape_index].vertices.v1 = [selected_shape.vertices.v1[0] * dilateValue, selected_shape.vertices.v1[1] * dilateValue];
      arrayOfShapes[selected_shape.shape_index].vertices.v3 = [selected_shape.vertices.v3[0] * dilateValue, selected_shape.vertices.v3[1] * dilateValue];
      arrayOfShapes[selected_shape.shape_index].vertices.v2 = [selected_shape.vertices.v2[0] * dilateValue, selected_shape.vertices.v2[1] * dilateValue];
      arrayOfShapes[selected_shape.shape_index].vertices.v4 = [selected_shape.vertices.v4[0] * dilateValue, selected_shape.vertices.v4[1] * dilateValue];
    }
    oldDilationSliderValue = dilationSlider.value;
  })

  createShapeRadio.addEventListener("click", (e) => {
    clickMode = 0;
    selected_shape = null;
    selected_shape_center = null;
    dilationSlider.disabled = true;
    dilationSliderLabel.innerText = "Shape Dilation (disabled, click a shape to use)";
    dilationSlider.value = 1;
    oldDilationSliderValue = 1;
  });

  selectShapeRadio.addEventListener("click", (e) => {
    clickMode = 1;
  });

  colorPicker.addEventListener("input", (e) => {
    if (clicked_vertex != null && clickMode == 1) {
      gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer);
      let rgb255 = colorPicker.value.convertToRGB();
      let rgb = rgb255.map((element) => element / 255).concat([1]);

      if (clicked_vertex == "v1") {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*selected_shape.index, new Float32Array(rgb));
      } else if (clicked_vertex == "v2") {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*(selected_shape.index + 2), new Float32Array(rgb));
      } else if (clicked_vertex == "v3") {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*(selected_shape.index + 1), new Float32Array(rgb));
      } else if (clicked_vertex == "v4") {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*(selected_shape.index + 3), new Float32Array(rgb));
      }
      selected_shape.colors[clicked_vertex] = rgb;
      
      arrayOfShapes[selected_shape.shape_index].colors[clicked_vertex] = rgb;
    }
  });

  canvas.addEventListener("mousedown", function(event) {
    mouseDown = true;
    mouseDownPosition = getPositionInCanvas(event);
    // console.log("mousedown");
  });
  
  canvas.addEventListener("mouseup", function(event) {
    mouseDown = false;
    // console.log("mouseup");
    if (is_moving_shape) {
      is_moving_shape = false;
      arrayOfShapes[selected_shape.shape_index].vertices.v1 = v1;
      arrayOfShapes[selected_shape.shape_index].vertices.v3 = v3;
      arrayOfShapes[selected_shape.shape_index].vertices.v2 = v2;
      arrayOfShapes[selected_shape.shape_index].vertices.v4 = v4;
    }
  });

  canvas.addEventListener("mouseleave", function(event) {
    mouseDown = false;
  });

  canvas.addEventListener("click", function(event) {
    let position = getPositionInCanvas(event);

    if (clickMode == 0) {
      if (first) {
        first = false;     
        v1 = [position.x, position.y]

        gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, new Float32Array(default_color));
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index+1), new Float32Array(default_color));
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index+2), new Float32Array(default_color));
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index+3), new Float32Array(default_color));
  
      } else {
        first = true;
        var abs_x = Math.abs(v1[0] - position.x);
        var abs_y = Math.abs(v1[1] - position.y);
        
        if (abs_x < abs_y) {
          v2 = [position.x, (position.y < v1[1]) ?  (v1[1] - abs_x): (v1[1] + abs_x)];
        } else {
          v2 = [(position.x < v1[0]) ?  (v1[0] - abs_y): (v1[0] + abs_y), position.y];
        }
  
        v3 = [v1[0], v2[1]];
        v4 = [v2[0], v1[1]];

        gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, new Float32Array(v1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+1), new Float32Array(v3));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+2), new Float32Array(v2));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+3), new Float32Array(v4));

        index += 4;
  
        arrayOfShapes.push({
          name: "square",
          shape_index,
          vertices: {
            v1, v2, v3, v4
          },
          colors: {
            v1: default_color,
            v2: default_color,
            v3: default_color,
            v4: default_color
          },
          index : index - 4
        });

        shape_index += 1;
      }
    } else if (clickMode == 1) {
      let shape = isInAShape(event, arrayOfShapes);

      if (shape != null) {
        selected_shape = shape;
        selected_shape_center = getCenterOfShape(selected_shape);
        dilationSlider.disabled = false;
        dilationSliderLabel.innerText = "Shape Dilation";

        let corner_position = positionInCornerShape(position, selected_shape);
        if (corner_position != null) {
          clicked_vertex = corner_position;
          colorPickerLabel.innerText = "Select Vertex Color";
          colorPicker.disabled = false;
          let color = arrayOfShapes[selected_shape.shape_index].colors[corner_position];
          let rgb = color.map((element) => Math.round(element * 255));
          colorPicker.value = rgbToHex(rgb);
        } else {
          clicked_vertex = null;
          colorPickerLabel.innerText = "Select Vertex Color (disabled, click a vertex to use)";
          colorPicker.disabled = true;
        }

      } else {
        selected_shape = null;
        selected_shape_center = null;
        dilationSlider.disabled = true;
        dilationSliderLabel.innerText = "Shape Dilation (disabled, click a shape to use)";
        dilationSlider.value = 1;
        oldDilationSliderValue = 1;
        clicked_vertex = null;
        colorPickerLabel.innerText = "Select Vertex Color (disabled, click a vertex to use)";
        colorPicker.disabled = true;
      }
    }
  });

  canvas.addEventListener("mousemove", function(event) {
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer);
    let position = getPositionInCanvas(event);
    if (clickMode == 0) {
      canvas.style.cursor = "pointer";
  
      if(!first) {  
        let abs_x = Math.abs(v1[0] - position.x);
        let abs_y = Math.abs(v1[1] - position.y);
        
        if (abs_x < abs_y) {
          v2 = [position.x, (position.y < v1[1]) ?  (v1[1] - abs_x): (v1[1] + abs_x)];
        } else {
          v2 = [(position.x < v1[0]) ?  (v1[0] - abs_y): (v1[0] + abs_y), position.y];
        }
  
        v3 = [v1[0], v2[1]];
        v4 = [v2[0], v1[1]];
  
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, new Float32Array(v1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+1), new Float32Array(v3));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+2), new Float32Array(v2));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+3), new Float32Array(v4));

      }
    } else if (clickMode == 1) {
      if (selected_shape != null && mouseDown && positionInShape(mouseDownPosition, selected_shape)) {
        
        let corner_position = positionInCornerShape(mouseDownPosition, selected_shape);
        is_moving_shape = true;
        let old_difference = { x: selected_shape_center[0] - mouseDownPosition.x, y: selected_shape_center[1] - mouseDownPosition.y };
        let new_difference = { x: selected_shape_center[0] - position.x, y: selected_shape_center[1] - position.y };
        let correction = { x: old_difference.x - new_difference.x, y: old_difference.y - new_difference.y };

        if (corner_position != null) {
          if (corner_position == "v1") {
            v1 = [selected_shape.vertices.v1[0] + correction.x, selected_shape.vertices.v1[1] + correction.y];
            v2 = selected_shape.vertices.v2;

            let abs_x = Math.abs(v2[0] - position.x);
            let abs_y = Math.abs(v2[1] - position.y);
            
            if (abs_x < abs_y) {
              v1 = [position.x, (position.y < v2[1]) ?  (v2[1] - abs_x): (v2[1] + abs_x)];
            } else {
              v1 = [(position.x < v2[0]) ?  (v2[0] - abs_y): (v2[0] + abs_y), position.y];
            }
      
            v3 = [v1[0], v2[1]];
            v4 = [v2[0], v1[1]];

            gl.bufferSubData(gl.ARRAY_BUFFER, 8*selected_shape.index, new Float32Array(v1));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+1), new Float32Array(v3));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+3), new Float32Array(v4));
            
          } else if (corner_position == "v2") {
            v1 = selected_shape.vertices.v1;
            v2 = [selected_shape.vertices.v2[0] + correction.x, selected_shape.vertices.v2[1] + correction.y];

            let abs_x = Math.abs(v1[0] - position.x);
            let abs_y = Math.abs(v1[1] - position.y);
            
            if (abs_x < abs_y) {
              v2 = [position.x, (position.y < v1[1]) ?  (v1[1] - abs_x): (v1[1] + abs_x)];
            } else {
              v2 = [(position.x < v1[0]) ?  (v1[0] - abs_y): (v1[0] + abs_y), position.y];
            }
      
            v3 = [v1[0], v2[1]];
            v4 = [v2[0], v1[1]];

            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+1), new Float32Array(v3));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+2), new Float32Array(v2));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+3), new Float32Array(v4));

          } else if (corner_position == "v3") {
            v3 = [selected_shape.vertices.v3[0] + correction.x, selected_shape.vertices.v3[1] + correction.y];
            v4 = selected_shape.vertices.v4;

            let abs_x = Math.abs(v4[0] - position.x);
            let abs_y = Math.abs(v4[1] - position.y);
            
            if (abs_x < abs_y) {
              v3 = [position.x, (position.y < v4[1]) ?  (v4[1] - abs_x): (v4[1] + abs_x)];
            } else {
              v3 = [(position.x < v4[0]) ?  (v4[0] - abs_y): (v4[0] + abs_y), position.y];
            }
      
            v1 = [v3[0], v4[1]];
            v2 = [v4[0], v3[1]];

            gl.bufferSubData(gl.ARRAY_BUFFER, 8*selected_shape.index, new Float32Array(v1));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+1), new Float32Array(v3));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+2), new Float32Array(v2));

          } else if (corner_position == "v4") {
            v3 = selected_shape.vertices.v3;
            v4 = [selected_shape.vertices.v4[0] + correction.x, selected_shape.vertices.v4[1] + correction.y];

            let abs_x = Math.abs(v3[0] - position.x);
            let abs_y = Math.abs(v3[1] - position.y);
            
            if (abs_x < abs_y) {
              v4 = [position.x, (position.y < v3[1]) ?  (v3[1] - abs_x): (v3[1] + abs_x)];
            } else {
              v4 = [(position.x < v3[0]) ?  (v3[0] - abs_y): (v3[0] + abs_y), position.y];
            }
      
            v1 = [v3[0], v4[1]];
            v2 = [v4[0], v3[1]];

            gl.bufferSubData(gl.ARRAY_BUFFER, 8*selected_shape.index, new Float32Array(v1));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+2), new Float32Array(v2));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+3), new Float32Array(v4));

          }

        } else {
          v1 = [selected_shape.vertices.v1[0] + correction.x, selected_shape.vertices.v1[1] + correction.y];
          v2 = [selected_shape.vertices.v2[0] + correction.x, selected_shape.vertices.v2[1] + correction.y];
          v3 = [selected_shape.vertices.v3[0] + correction.x, selected_shape.vertices.v3[1] + correction.y];
          v4 = [selected_shape.vertices.v4[0] + correction.x, selected_shape.vertices.v4[1] + correction.y];
          
          gl.bufferSubData(gl.ARRAY_BUFFER, 8*selected_shape.index, new Float32Array(v1));
          gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+1), new Float32Array(v3));
          gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+2), new Float32Array(v2));
          gl.bufferSubData(gl.ARRAY_BUFFER, 8*(selected_shape.index+3), new Float32Array(v4));
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