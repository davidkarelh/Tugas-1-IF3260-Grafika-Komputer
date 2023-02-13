function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
  
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function getPositionInCanvas(event) {
    return {
        x: (2 * event.clientX) / canvas.width - 1,
        y: (2 * (canvas.height - event.clientY)) / canvas.height - 1,
    }
}

function isInAShape(event, arrayOfShapes) {
    var position = getPositionInCanvas(event);
    
    for (shape of arrayOfShapes) {
        // if (position.x <= shape.bottom_right_corner[0] && position.x >= shape.upper_left_corner[0] && position.y >= shape.bottom_right_corner[1] && position.y <= shape.upper_left_corner[1]) {
        if (positionInShape(position, shape)) {
            return shape;
        }
    }
    return null;
}

function positionInShape(position, shape) {
    // return (position.x <= shape.bottom_right_corner[0] && position.x >= shape.upper_left_corner[0] && position.y >= shape.bottom_right_corner[1] && position.y <= shape.upper_left_corner[1]);
    var left, right, top, bottom;

    if (shape.t1[0] < shape.t2[0]) {
        left = shape.t1[0];
        right = shape.t2[0];
    } else {
        right = shape.t1[0];
        left = shape.t2[0];
    }

    if (shape.t1[1] < shape.t2[1]) {
        bottom = shape.t1[1];
        top = shape.t2[1];
    } else {
        top = shape.t1[1];
        bottom = shape.t2[1];
    }

    return (position.x <= right && position.x >= left && position.y >= bottom && position.y <= top);
}

function positionInCornerShape(position, shape) {
    if (Math.abs(position.x - shape.t1[0]) + Math.abs(position.y - shape.t1[1]) < 0.05) {
        return "t1";
    } else if (Math.abs(position.x - shape.t2[0]) + Math.abs(position.y - shape.t2[1]) < 0.05) {
        return "t2";
    } else if (Math.abs(position.x - shape.t3[0]) + Math.abs(position.y - shape.t3[1]) < 0.05) {
        return "t3";
    } else if (Math.abs(position.x - shape.t4[0]) + Math.abs(position.y - shape.t4[1]) < 0.05) {
        return "t4";
    }
    return null;
}

function getCenterOfShape(shape) {
    var left, right, top, bottom;

    if (shape.t1[0] < shape.t2[0]) {
        left = shape.t1[0];
        right = shape.t2[0];
    } else {
        right = shape.t1[0];
        left = shape.t2[0];
    }

    if (shape.t1[1] < shape.t2[1]) {
        bottom = shape.t1[1];
        top = shape.t2[1];
    } else {
        top = shape.t1[1];
        bottom = shape.t2[1];
    }

    var ret = [(right + left) / 2, (top + bottom) / 2];
    return ret;
}