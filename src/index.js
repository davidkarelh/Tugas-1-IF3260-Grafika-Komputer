/* eslint no-console:0 consistent-return:0 */
"use strict";

var gl;
var index = 0;

var canvas = document.querySelector("canvas");

let createShapeRadio = document.getElementById("createShapeRadio");
let selectShapeRadio = document.getElementById("selectShapeRadio");
let dilationSliderContainer = document.getElementById("dilation-slider-container");
let dilationSlider = document.getElementById("dilation-slider");
let dilationSliderLabel = document.querySelector("label[for='dilation-slider']");
let rotationSpeedSliderContainer = document.getElementById("rotation-speed-container");
let rotationSpeedSlider = document.getElementById("rotation-speed-slider");
let rotationSpeedSliderLabel = document.querySelector("label[for='rotation-speed-slider']");
let stopSpinButton = document.getElementById("stop-spin");
let colorPickerContainer = document.getElementById("colorPicker-container");
let colorPicker = document.getElementById("colorPicker");
let colorPickerLabel = document.querySelector("label[for='colorPicker']");
let shapeCreateSelector = document.getElementById("shape-selector");
let polygonSaveButton = document.getElementById("polygon-save");
let saveModelButton = document.getElementById("save-model");
let loadModelButton = document.getElementById("load-model");
let selectedCreateShape = 0;
var shape_enum = {
  0: "line",
  1: "square",
  2: "rectangle"
};

var arrayOfShapes = [];
var rotationSpeeds = [];
var shape_index = 0;
var mouseDown = false;
var mouseDownPosition = null;
var polygonMode = false;
var polygonPointsArray = {};

var clickMode = 0;
var selected_shape = null;
var selected_shape_center = null;

var is_moving_shape = false;
var clicked_vertex = null;

var v1, v2, v3, v4;
var default_color = [1, 1, 0, 1]; // yellow
var first = true;

var oldDilationSliderValue = 1;

function main() {
  // Get A WebGL context
  var gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert("WebGL isn't available");
    return;
  }

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

  shapeCreateSelector.addEventListener("change", (e) => {
    selectedCreateShape = parseInt(shapeCreateSelector.value);
    index -= polygonPointsArray[shape_index] ? polygonPointsArray[shape_index].length : 0;
    delete polygonPointsArray[shape_index];
    polygonMode = selectedCreateShape == 3 || selectedCreateShape == 4;
  });

  dilationSlider.addEventListener("input", (e) => {
    if (selected_shape != null) {
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      let dilateValue = (dilationSlider.value / oldDilationSliderValue);
      if (selected_shape.shape == 0) {
        dilateLine(gl, arrayOfShapes, selected_shape, dilateValue);
      } else if (selected_shape.shape == 1) {
        dilateSquare(gl, arrayOfShapes, selected_shape, dilateValue);
      } else if (selected_shape.shape == 2) {
        dilateRectangle(gl, arrayOfShapes, selected_shape, dilateValue);
      } else if (selected_shape.shape == 3 || selected_shape.shape == 4) {
        dilatePolygon(gl, dilateValue);
      }
    }
    oldDilationSliderValue = dilationSlider.value;
  })

  rotationSpeedSlider.addEventListener("input", (e) => {
    if (selected_shape != null) {
      let rotateValue = rotationSpeedSlider.value * 0.2;
      rotationSpeeds[selected_shape.shape_index] = rotateValue;
    }
  })

  stopSpinButton.addEventListener("click", (e) => {
    rotationSpeeds[selected_shape.shape_index] = 0;
    rotationSpeedSlider.value = 0;
  })

  createShapeRadio.addEventListener("click", (e) => {
    clickMode = 0;
    selected_shape = null;
    selected_shape_center = null;
    dilationSliderContainer.hidden = true;
    rotationSpeedSliderContainer.hidden = true;
    // dilationSlider.disabled = true;
    // dilationSliderLabel.innerText = "Shape Dilation (disabled, click a shape to use)";
    dilationSlider.value = 1;
    rotationSpeedSlider.value = 0;
    oldDilationSliderValue = 1;
    let rgb = default_color.map((element) => Math.round(element * 255));
    colorPicker.value = rgbToHex(rgb);
  });

  selectShapeRadio.addEventListener("click", (e) => {
    clickMode = 1;
  });

  colorPicker.addEventListener("input", (e) => {
    if (clicked_vertex != null && clickMode == 1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      let rgb255 = colorPicker.value.convertToRGB();
      let rgb = rgb255.map((element) => element / 255).concat([1]);
      if (selected_shape.shape == 0) {
        changeColorVertexLine(gl, arrayOfShapes, selected_shape, rgb);
      } else if (selected_shape.shape == 1) {
        changeColorVertexSquare(gl, arrayOfShapes, selected_shape, rgb);
      } else if (selected_shape.shape == 2) {
        changeColorVertexRectangle(gl, arrayOfShapes, selected_shape, rgb);
      } else if (selected_shape.shape == 3 || selected_shape.shape == 4) {
        changeColorVertexPolygon(gl, selected_shape, rgb);
      }
    }
  });

  polygonSaveButton.addEventListener("click", (e) => {
    finalizePolygon(gl, selectedCreateShape, positionBuffer);
    shape_index++;
  })

  saveModelButton.addEventListener("click", (e) => {
    saveModel();
  });

  loadModelButton.addEventListener("click", (e) => {
    loadModel(gl, positionBuffer, colorBuffer);
  });

  canvas.addEventListener("mousedown", function (event) {
    mouseDown = true;
    mouseDownPosition = getPositionInCanvas(event);
    // console.log("mousedown");
  });

  canvas.addEventListener("mouseup", function (event) {
    mouseDown = false;
    // console.log("mouseup");
    if (is_moving_shape) {
      is_moving_shape = false;

      if (selected_shape.shape == 0) {
        stopMovingLine(arrayOfShapes, selected_shape, v1, v2);
      } else if (selected_shape.shape == 1) {
        stopMovingSquare(arrayOfShapes, selected_shape, v1, v2, v3, v4);
      } else if (selected_shape.shape == 2) {
        stopMovingRectangle(arrayOfShapes, selected_shape, v1, v2, v3, v4);
      } else if (selected_shape.shape == 3 || selected_shape.shape == 4) {
        stopMovingPolygon(selected_shape);
      }

    }
  });

  canvas.addEventListener("mouseleave", function (event) {
    mouseDown = false;
  });

  canvas.addEventListener("click", function (event) {
    let position = getPositionInCanvas(event);

    if (clickMode == 0) {
      if (polygonMode) {
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

        addPolygonPoint(gl, position, index, default_color, positionBuffer);
        index++;
      } else if (first) {
        first = false;
        v1 = [position.x, position.y]

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

        if (selectedCreateShape == 0) {
          firstClickCreateLine(gl, index, default_color);
        } else if (selectedCreateShape == 1) {
          firstClickCreateSquare(gl, index, default_color);
        } else if (selectedCreateShape == 2) {
          firstClickCreateRectangle(gl, index, default_color);
        }

      } else {
        first = true;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        if (selectedCreateShape == 0) {
          let result = secondClickCreateLine(gl, position, v1, v2, arrayOfShapes);
          v1 = result.v1;
          v2 = result.v2;
          index += 2;
        } else if (selectedCreateShape == 1) {
          let result = secondClickCreateSquare(gl, position, v1, v2, v3, v4, arrayOfShapes);
          v1 = result.v1;
          v2 = result.v2;
          v3 = result.v3;
          v4 = result.v4;
          index += 4;

        } else if (selectedCreateShape == 2) {
          let result = secondClickCreateRectangle(gl, position, v1, v2, v3, v4, arrayOfShapes);
          v1 = result.v1;
          v2 = result.v2;
          v3 = result.v3;
          v4 = result.v4;
          index += 4;
        }


        shape_index += 1;
      }
    } else if (clickMode == 1) {
      let shape = isInAShape(event, arrayOfShapes);
      if (shape != null) {
        selected_shape = shape;
        selected_shape_center = getCenterOfShape(selected_shape);
        dilationSliderContainer.hidden = false;
        rotationSpeedSliderContainer.hidden = false;
        rotationSpeedSlider.value = rotationSpeeds[shape.shape_index] / 0.2;

        let corner_position = positionInCornerShape(position, selected_shape);
        if (corner_position != null) {
          clicked_vertex = corner_position;
          colorPickerContainer.hidden = false;
          let color = arrayOfShapes[selected_shape.shape_index].colors[corner_position];
          let rgb = color.map((element) => Math.round(element * 255));
          colorPicker.value = rgbToHex(rgb);
        } else {
          clicked_vertex = null;
          colorPickerContainer.hidden = true;
        }

      } else {
        selected_shape = null;
        selected_shape_center = null;
        dilationSliderContainer.hidden = true;
        rotationSpeedSliderContainer.hidden = true;
        dilationSlider.value = 1;
        rotationSpeedSlider.value = 0;
        oldDilationSliderValue = 1;
        clicked_vertex = null;
        colorPickerContainer.hidden = true;
      }
    }
  });

  canvas.addEventListener("mousemove", function (event) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    let position = getPositionInCanvas(event);
    if (clickMode == 0) {
      canvas.style.cursor = "pointer";

      if (polygonMode) {
        mouseMoveCreatePolygon(gl, index, position);
      } else if (!first) {
        if (selectedCreateShape == 0) {
          let result = mouseMoveCreateLine(gl, position, v1, v2);
          v1 = result.v1;
          v2 = result.v2;
        } else if (selectedCreateShape == 1) {
          let result = mouseMoveCreateSquare(gl, position, v1, v2, v3, v4);
          v1 = result.v1;
          v2 = result.v2;
          v3 = result.v3;
          v4 = result.v4;
        } else if (selectedCreateShape == 2) {
          let result = mouseMoveCreateRectangle(gl, position, v1, v2, v3, v4);
          v1 = result.v1;
          v2 = result.v2;
          v3 = result.v3;
          v4 = result.v4;
        }
      }
    } else if (clickMode == 1) {
      if (selected_shape != null && mouseDown && positionInShape(mouseDownPosition, selected_shape)) {
        is_moving_shape = true;
        let corner_position = positionInCornerShape(mouseDownPosition, selected_shape);

        // Bypass buat polygon
        let old_difference, new_difference, correction;
        if (selected_shape_center !== null) {
          old_difference = { x: selected_shape_center[0] - mouseDownPosition.x, y: selected_shape_center[1] - mouseDownPosition.y };
          new_difference = { x: selected_shape_center[0] - position.x, y: selected_shape_center[1] - position.y };
          correction = { x: old_difference.x - new_difference.x, y: old_difference.y - new_difference.y };
        }

        if (corner_position != null) {
          if (selected_shape.shape == 0) {
            let result = moveLineVertex(gl, selected_shape, position, corner_position, v1, v2);
            v1 = result.v1;
            v2 = result.v2;
          } else if (selected_shape.shape == 1) {
            let result = moveSquareCorner(gl, selected_shape, position, corner_position, correction, v1, v2, v3, v4);
            v1 = result.v1;
            v2 = result.v2;
            v3 = result.v3;
            v4 = result.v4;
          } else if (selected_shape.shape == 2) {
            let result = moveRectangleCorner(gl, selected_shape, position, corner_position, correction, v1, v2, v3, v4);
            v1 = result.v1;
            v2 = result.v2;
            v3 = result.v3;
            v4 = result.v4;
          } else if (selected_shape.shape == 3 || selected_shape.shape == 4) {
            movePolygonVertex(gl, selected_shape, position);
          }
        } else {
          if (selected_shape.shape == 0) {
            let result = moveLine(gl, selected_shape, correction, v1, v2);
            v1 = result.v1;
            v2 = result.v2;
          } else if (selected_shape.shape == 1) {
            let result = moveSquare(gl, selected_shape, correction, v1, v2, v3, v4);
            v1 = result.v1;
            v2 = result.v2;
            v3 = result.v3;
            v4 = result.v4;
          } else if (selected_shape.shape == 2) {
            let result = moveRectangle(gl, selected_shape, correction, v1, v2, v3, v4);
            v1 = result.v1;
            v2 = result.v2;
            v3 = result.v3;
            v4 = result.v4;
          } else if (selected_shape.shape == 3 || selected_shape.shape == 4) {
            movePolygon(gl, selected_shape, position, mouseDownPosition);
          }
        }
      }
    }
  });

  render();

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // var drawLimit = first ? index : (index + 4);

    // for(var i = 0; i < drawLimit; i+=4) {
    //   gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
    // }

    // var drawLimit = first ? index : (index + 2);

    // for(var i = 0; i < drawLimit; i+=2) {
    //   gl.drawArrays( gl.LINES, i, 2 );
    // }
    let j = 0;
    for (let speed of rotationSpeeds) {
      if (speed != 0) {
        if (arrayOfShapes[j].shape == 0) {
          rotateLineAroundCenter(gl, arrayOfShapes[j], speed);
        } else if (arrayOfShapes[j].shape == 1) {
          rotateSquareAroundCenter(gl, arrayOfShapes[j], speed);
        } else if (arrayOfShapes[j].shape == 2) {
          rotateRectangleAroundCenter(gl, arrayOfShapes[j], speed);
        } else if (arrayOfShapes[j].shape == 3 || arrayOfShapes[j].shape == 4) {
          rotatePolygonAroundCenter(gl, arrayOfShapes[j], speed);
        }
      }
      j += 1;
    }

    let i = 0;
    for (let shape of arrayOfShapes) {
      if (shape.shape == 0) {
        gl.drawArrays(gl.LINES, i, 2);
        i += 2;
      } else if (shape.shape == 1) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
        i += 4;
      } else if (shape.shape == 2) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
        i += 4;
      } else if (shape.shape == 3) {
        gl.drawArrays(gl.TRIANGLE_STRIP, i, shape.nPolygon);
        i += shape.nPolygon;
      } else if (shape.shape == 4) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, shape.nPolygon);
        i += shape.nPolygon;
      }

    }

    let polygonLength = polygonPointsArray[shape_index] ? polygonPointsArray[shape_index].length : 0;
    if (clickMode == 0 && (!first || polygonMode)) {
      if (selectedCreateShape == 0) {
        gl.drawArrays(gl.LINES, i, 2);
      } else if (selectedCreateShape == 1) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
      } else if (selectedCreateShape == 2) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
      } else if (selectedCreateShape == 3) {
        gl.drawArrays(gl.TRIANGLE_STRIP, i, polygonLength + 1);
      } else if (selectedCreateShape == 4) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, polygonLength + 1);
      }
    }

    window.requestAnimFrame(render);
  }
}

main();