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
        if (positionInShape(position, shape)) {
            return shape;
        }
    }
    return null;
}

function positionInShape(position, shape) {
    var left, right, top, bottom;

    if (shape.shape == 0) {
        let v1 = shape.vertices.v1;
        let v2 = shape.vertices.v2;
        let dist = (
            Math.abs((v2[0] - v1[0]) * (v1[1] - position.y) - (v1[0] - position.x) * (v2[1] - v1[1]))
            /
            Math.sqrt(Math.pow(v2[0] - v1[0], 2) + Math.pow(v2[1] - v2[1], 2))
        );
        return dist < 0.04;
    } else if (shape.shape == 1 || shape.shape == 2) {
        if (shape.vertices.v1[0] < shape.vertices.v2[0]) {
            left = shape.vertices.v1[0];
            right = shape.vertices.v2[0];
        } else {
            right = shape.vertices.v1[0];
            left = shape.vertices.v2[0];
        }

        if (shape.vertices.v1[1] < shape.vertices.v2[1]) {
            bottom = shape.vertices.v1[1];
            top = shape.vertices.v2[1];
        } else {
            top = shape.vertices.v1[1];
            bottom = shape.vertices.v2[1];
        }

        return (position.x <= right && position.x >= left && position.y >= bottom && position.y <= top);
    } else if (shape.shape == 3 || shape.shape == 4) {
        return isInsidePolygon(position, shape.vertices);
    }
}

function positionInCornerShape(position, shape) {
    if (shape.shape == 0) {
        if (Math.abs(position.x - shape.vertices.v1[0]) + Math.abs(position.y - shape.vertices.v1[1]) < 0.05) {
            return "v1";
        } else if (Math.abs(position.x - shape.vertices.v2[0]) + Math.abs(position.y - shape.vertices.v2[1]) < 0.05) {
            return "v2";
        }
    } else if (shape.shape == 1 || shape.shape == 2) {
        if (Math.abs(position.x - shape.vertices.v1[0]) + Math.abs(position.y - shape.vertices.v1[1]) < 0.05) {
            return "v1";
        } else if (Math.abs(position.x - shape.vertices.v2[0]) + Math.abs(position.y - shape.vertices.v2[1]) < 0.05) {
            return "v2";
        } else if (Math.abs(position.x - shape.vertices.v3[0]) + Math.abs(position.y - shape.vertices.v3[1]) < 0.05) {
            return "v3";
        } else if (Math.abs(position.x - shape.vertices.v4[0]) + Math.abs(position.y - shape.vertices.v4[1]) < 0.05) {
            return "v4";
        }
    } else if (shape.shape == 3 || shape.shape == 4) {
        for (let vertice in shape.vertices) {
            if (Math.abs(position.x - shape.vertices[vertice][0]) + Math.abs(position.y - shape.vertices[vertice][1]) < 0.05) {
                return vertice;
            }
        }
    }
    return null;
}

function getCenterOfShape(shape) {
    var left, right, top, bottom;

    if (shape.shape == 0) {
        return [(shape.vertices.v1[0] + shape.vertices.v2[0]) / 2, (shape.vertices.v1[1] + shape.vertices.v2[1]) / 2];
    } else if (shape.shape == 1 || shape.shape == 2) {

        if (shape.vertices.v1[0] < shape.vertices.v2[0]) {
            left = shape.vertices.v1[0];
            right = shape.vertices.v2[0];
        } else {
            right = shape.vertices.v1[0];
            left = shape.vertices.v2[0];
        }

        if (shape.vertices.v1[1] < shape.vertices.v2[1]) {
            bottom = shape.vertices.v1[1];
            top = shape.vertices.v2[1];
        } else {
            top = shape.vertices.v1[1];
            bottom = shape.vertices.v2[1];
        }

        var ret = [(right + left) / 2, (top + bottom) / 2];
        return ret;
    }
    return null;
}

String.prototype.convertToRGB = function () {
    if (this.length != 7) {
        throw "Only seven-digit hex colors are allowed.";
    }

    var aRgbHex = this.slice(1).match(/.{1,2}/g);
    var aRgb = [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16)
    ];
    return aRgb;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgb) {
    return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}

function isInsidePolygon(cur_coord, vertices) {
    let polygon = [];
    for (let key in vertices) {
        polygon.push(vertices[key]);
    }
    
    const x = cur_coord.x, y = cur_coord.y;
    var inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i][0], yi = polygon[i][1];
        var xj = polygon[j][0], yj = polygon[j][1];
        
        var intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}