var dilateSquare = (gl, arrayOfShapes, selected_shape, dilateValue) => {
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array([selected_shape.vertices.v1[0] * dilateValue, selected_shape.vertices.v1[1] * dilateValue]));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array([selected_shape.vertices.v3[0] * dilateValue, selected_shape.vertices.v3[1] * dilateValue]));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 2), new Float32Array([selected_shape.vertices.v2[0] * dilateValue, selected_shape.vertices.v2[1] * dilateValue]));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 3), new Float32Array([selected_shape.vertices.v4[0] * dilateValue, selected_shape.vertices.v4[1] * dilateValue]));

    arrayOfShapes[selected_shape.shape_index].vertices.v1 = [selected_shape.vertices.v1[0] * dilateValue, selected_shape.vertices.v1[1] * dilateValue];
    arrayOfShapes[selected_shape.shape_index].vertices.v3 = [selected_shape.vertices.v3[0] * dilateValue, selected_shape.vertices.v3[1] * dilateValue];
    arrayOfShapes[selected_shape.shape_index].vertices.v2 = [selected_shape.vertices.v2[0] * dilateValue, selected_shape.vertices.v2[1] * dilateValue];
    arrayOfShapes[selected_shape.shape_index].vertices.v4 = [selected_shape.vertices.v4[0] * dilateValue, selected_shape.vertices.v4[1] * dilateValue];
}

var changeColorVertexSquare = (gl, arrayOfShapes, selected_shape, rgb) => {
    if (clicked_vertex == "v1") {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * selected_shape.index, new Float32Array(rgb));
    } else if (clicked_vertex == "v2") {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (selected_shape.index + 2), new Float32Array(rgb));
    } else if (clicked_vertex == "v3") {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (selected_shape.index + 1), new Float32Array(rgb));
    } else if (clicked_vertex == "v4") {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (selected_shape.index + 3), new Float32Array(rgb));
    }

    selected_shape.colors[clicked_vertex] = rgb;

    arrayOfShapes[selected_shape.shape_index].colors[clicked_vertex] = rgb;
}

var firstClickCreateSquare = (gl, index, default_color) => {
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, new Float32Array(default_color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + 1), new Float32Array(default_color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + 2), new Float32Array(default_color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + 3), new Float32Array(default_color));
}

var secondClickCreateSquare = (gl, position, v1, v2, v3, v4, arrayOfShapes) => {
    let abs_x = Math.abs(v1[0] - position.x);
    let abs_y = Math.abs(v1[1] - position.y);

    if (abs_x < abs_y) {
        v2 = [position.x, (position.y < v1[1]) ? (v1[1] - abs_x) : (v1[1] + abs_x)];
    } else {
        v2 = [(position.x < v1[0]) ? (v1[0] - abs_y) : (v1[0] + abs_y), position.y];
    }

    v3 = [v1[0], v2[1]];
    v4 = [v2[0], v1[1]];


    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, new Float32Array(v1));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 1), new Float32Array(v3));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 2), new Float32Array(v2));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 3), new Float32Array(v4));

    arrayOfShapes.push({
        shape: 1,
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
        index
    });
    rotationSpeeds.push(0);

    return { v1, v2, v3, v4 };
}

var mouseMoveCreateSquare = (gl, position, v1, v2, v3, v4) => {
    let abs_x = Math.abs(v1[0] - position.x);
    let abs_y = Math.abs(v1[1] - position.y);

    if (abs_x < abs_y) {
        v2 = [position.x, (position.y < v1[1]) ? (v1[1] - abs_x) : (v1[1] + abs_x)];
    } else {
        v2 = [(position.x < v1[0]) ? (v1[0] - abs_y) : (v1[0] + abs_y), position.y];
    }

    v3 = [v1[0], v2[1]];
    v4 = [v2[0], v1[1]];

    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, new Float32Array(v1));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 1), new Float32Array(v3));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 2), new Float32Array(v2));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 3), new Float32Array(v4));

    return { v1, v2, v3, v4 };
}

var moveSquareCorner = (gl, selected_shape, position, corner_position, correction, v1, v2, v3, v4) => {
    if (corner_position == "v1") {
        v1 = [selected_shape.vertices.v1[0] + correction.x, selected_shape.vertices.v1[1] + correction.y];
        v2 = selected_shape.vertices.v2;

        let abs_x = Math.abs(v2[0] - position.x);
        let abs_y = Math.abs(v2[1] - position.y);

        if (abs_x < abs_y) {
            v1 = [position.x, (position.y < v2[1]) ? (v2[1] - abs_x) : (v2[1] + abs_x)];
        } else {
            v1 = [(position.x < v2[0]) ? (v2[0] - abs_y) : (v2[0] + abs_y), position.y];
        }

        v3 = [v1[0], v2[1]];
        v4 = [v2[0], v1[1]];

        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array(v1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array(v3));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 3), new Float32Array(v4));

    } else if (corner_position == "v2") {
        v1 = selected_shape.vertices.v1;
        v2 = [selected_shape.vertices.v2[0] + correction.x, selected_shape.vertices.v2[1] + correction.y];

        let abs_x = Math.abs(v1[0] - position.x);
        let abs_y = Math.abs(v1[1] - position.y);

        if (abs_x < abs_y) {
            v2 = [position.x, (position.y < v1[1]) ? (v1[1] - abs_x) : (v1[1] + abs_x)];
        } else {
            v2 = [(position.x < v1[0]) ? (v1[0] - abs_y) : (v1[0] + abs_y), position.y];
        }

        v3 = [v1[0], v2[1]];
        v4 = [v2[0], v1[1]];

        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array(v3));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 2), new Float32Array(v2));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 3), new Float32Array(v4));

    } else if (corner_position == "v3") {
        v3 = [selected_shape.vertices.v3[0] + correction.x, selected_shape.vertices.v3[1] + correction.y];
        v4 = selected_shape.vertices.v4;

        let abs_x = Math.abs(v4[0] - position.x);
        let abs_y = Math.abs(v4[1] - position.y);

        if (abs_x < abs_y) {
            v3 = [position.x, (position.y < v4[1]) ? (v4[1] - abs_x) : (v4[1] + abs_x)];
        } else {
            v3 = [(position.x < v4[0]) ? (v4[0] - abs_y) : (v4[0] + abs_y), position.y];
        }

        v1 = [v3[0], v4[1]];
        v2 = [v4[0], v3[1]];

        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array(v1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array(v3));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 2), new Float32Array(v2));

    } else if (corner_position == "v4") {
        v3 = selected_shape.vertices.v3;
        v4 = [selected_shape.vertices.v4[0] + correction.x, selected_shape.vertices.v4[1] + correction.y];

        let abs_x = Math.abs(v3[0] - position.x);
        let abs_y = Math.abs(v3[1] - position.y);

        if (abs_x < abs_y) {
            v4 = [position.x, (position.y < v3[1]) ? (v3[1] - abs_x) : (v3[1] + abs_x)];
        } else {
            v4 = [(position.x < v3[0]) ? (v3[0] - abs_y) : (v3[0] + abs_y), position.y];
        }

        v1 = [v3[0], v4[1]];
        v2 = [v4[0], v3[1]];

        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array(v1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 2), new Float32Array(v2));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 3), new Float32Array(v4));
    }
    return { v1, v2, v3, v4 };
}

var moveSquare = (gl, selected_shape, correction, v1, v2, v3, v4) => {
    v1 = [selected_shape.vertices.v1[0] + correction.x, selected_shape.vertices.v1[1] + correction.y];
    v2 = [selected_shape.vertices.v2[0] + correction.x, selected_shape.vertices.v2[1] + correction.y];
    v3 = [selected_shape.vertices.v3[0] + correction.x, selected_shape.vertices.v3[1] + correction.y];
    v4 = [selected_shape.vertices.v4[0] + correction.x, selected_shape.vertices.v4[1] + correction.y];
    // console.log(v1);

    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array(v1));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array(v3));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 2), new Float32Array(v2));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 3), new Float32Array(v4));
    return { v1, v2, v3, v4 };
}

var stopMovingSquare = (arrayOfShapes, selected_shape, v1, v2, v3, v4) => {
    arrayOfShapes[selected_shape.shape_index].vertices.v1 = v1;
    arrayOfShapes[selected_shape.shape_index].vertices.v3 = v3;
    arrayOfShapes[selected_shape.shape_index].vertices.v2 = v2;
    arrayOfShapes[selected_shape.shape_index].vertices.v4 = v4;
}

var rotateSquareAroundCenter = (gl, selected_shape, angle) => {
    let center = [(selected_shape.vertices.v1[0] + selected_shape.vertices.v2[0]) / 2, (selected_shape.vertices.v1[1] + selected_shape.vertices.v2[1]) / 2];
    let v1 = rotatePointAroundCenter(selected_shape.vertices.v1, center, angle);
    let v2 = rotatePointAroundCenter(selected_shape.vertices.v2, center, angle);
    let v3 = rotatePointAroundCenter(selected_shape.vertices.v3, center, angle);
    let v4 = rotatePointAroundCenter(selected_shape.vertices.v4, center, angle);
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array(v1));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array(v3));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 2), new Float32Array(v2));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 3), new Float32Array(v4));
    arrayOfShapes[selected_shape.shape_index].vertices.v1 = v1;
    arrayOfShapes[selected_shape.shape_index].vertices.v3 = v3;
    arrayOfShapes[selected_shape.shape_index].vertices.v2 = v2;
    arrayOfShapes[selected_shape.shape_index].vertices.v4 = v4;
    return { v1, v2, v3, v4 };
}