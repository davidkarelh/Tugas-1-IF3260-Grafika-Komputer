var firstClickCreateRectangle = (gl, index, default_color) => {
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, new Float32Array(default_color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + 1), new Float32Array(default_color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + 2), new Float32Array(default_color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + 3), new Float32Array(default_color));
}

var secondClickCreateRectangle = (gl, position, v1, v2, v3, v4, arrayOfShapes) => {
    v2 = [position.x, position.y];

    v3 = [v1[0], v2[1]];
    v4 = [v2[0], v1[1]];

    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, new Float32Array(v1));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 1), new Float32Array(v3));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 2), new Float32Array(v2));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 3), new Float32Array(v4));

    arrayOfShapes.push({
        shape: 2,
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

var mouseMoveCreateRectangle = (gl, position, v1, v2, v3, v4) => {
    v2 = [position.x, position.y];

    v3 = [v1[0], v2[1]];
    v4 = [v2[0], v1[1]];

    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, new Float32Array(v1));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 1), new Float32Array(v3));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 2), new Float32Array(v2));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 3), new Float32Array(v4));

    return { v1, v2, v3, v4 };
}

var moveRectangle = (gl, selected_shape, correction, v1, v2, v3, v4) => {
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

var stopMovingRectangle = (arrayOfShapes, selected_shape, v1, v2, v3, v4) => {
    arrayOfShapes[selected_shape.shape_index].vertices.v1 = v1;
    arrayOfShapes[selected_shape.shape_index].vertices.v3 = v3;
    arrayOfShapes[selected_shape.shape_index].vertices.v2 = v2;
    arrayOfShapes[selected_shape.shape_index].vertices.v4 = v4;
}

var moveRectangleCorner = (gl, selected_shape, position, corner_position, correction, v1, v2, v3, v4) => {
    if (corner_position == "v1") {
        v1 = [selected_shape.vertices.v1[0] + correction.x, selected_shape.vertices.v1[1] + correction.y];
        v2 = selected_shape.vertices.v2;

        v3 = [v1[0], v2[1]];
        v4 = [v2[0], v1[1]];

        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array(v1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array(v3));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 3), new Float32Array(v4));

    } else if (corner_position == "v2") {
        v1 = selected_shape.vertices.v1;
        v2 = [selected_shape.vertices.v2[0] + correction.x, selected_shape.vertices.v2[1] + correction.y];

        v3 = [v1[0], v2[1]];
        v4 = [v2[0], v1[1]];

        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array(v3));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 2), new Float32Array(v2));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 3), new Float32Array(v4));

    } else if (corner_position == "v3") {
        v3 = [selected_shape.vertices.v3[0] + correction.x, selected_shape.vertices.v3[1] + correction.y];
        v4 = selected_shape.vertices.v4;

        v1 = [v3[0], v4[1]];
        v2 = [v4[0], v3[1]];

        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array(v1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array(v3));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 2), new Float32Array(v2));

    } else if (corner_position == "v4") {
        v3 = selected_shape.vertices.v3;
        v4 = [selected_shape.vertices.v4[0] + correction.x, selected_shape.vertices.v4[1] + correction.y];

        v1 = [v3[0], v4[1]];
        v2 = [v4[0], v3[1]];

        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array(v1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 2), new Float32Array(v2));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 3), new Float32Array(v4));
    }
    return { v1, v2, v3, v4 };
}

var dilateRectangle = (gl, arrayOfShapes, selected_shape, dilateValue) => {
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array([selected_shape.vertices.v1[0] * dilateValue, selected_shape.vertices.v1[1] * dilateValue]));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array([selected_shape.vertices.v3[0] * dilateValue, selected_shape.vertices.v3[1] * dilateValue]));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 2), new Float32Array([selected_shape.vertices.v2[0] * dilateValue, selected_shape.vertices.v2[1] * dilateValue]));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 3), new Float32Array([selected_shape.vertices.v4[0] * dilateValue, selected_shape.vertices.v4[1] * dilateValue]));

    arrayOfShapes[selected_shape.shape_index].vertices.v1 = [selected_shape.vertices.v1[0] * dilateValue, selected_shape.vertices.v1[1] * dilateValue];
    arrayOfShapes[selected_shape.shape_index].vertices.v3 = [selected_shape.vertices.v3[0] * dilateValue, selected_shape.vertices.v3[1] * dilateValue];
    arrayOfShapes[selected_shape.shape_index].vertices.v2 = [selected_shape.vertices.v2[0] * dilateValue, selected_shape.vertices.v2[1] * dilateValue];
    arrayOfShapes[selected_shape.shape_index].vertices.v4 = [selected_shape.vertices.v4[0] * dilateValue, selected_shape.vertices.v4[1] * dilateValue];
}

var changeColorVertexRectangle = (gl, arrayOfShapes, selected_shape, rgb) => {
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

var rotateRectangleAroundCenter = (gl, selected_shape, angle) => {
    var center = [(selected_shape.vertices.v1[0] + selected_shape.vertices.v2[0]) / 2, (selected_shape.vertices.v1[1] + selected_shape.vertices.v2[1]) / 2];
    var v1 = rotatePointAroundCenter(selected_shape.vertices.v1, center, angle);
    var v2 = rotatePointAroundCenter(selected_shape.vertices.v2, center, angle);
    var v3 = rotatePointAroundCenter(selected_shape.vertices.v3, center, angle);
    var v4 = rotatePointAroundCenter(selected_shape.vertices.v4, center, angle);

    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array(v1));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array(v3));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 2), new Float32Array(v2));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 3), new Float32Array(v4));

    arrayOfShapes[selected_shape.shape_index].vertices.v1 = v1;
    arrayOfShapes[selected_shape.shape_index].vertices.v2 = v2;
    arrayOfShapes[selected_shape.shape_index].vertices.v3 = v3;
    arrayOfShapes[selected_shape.shape_index].vertices.v4 = v4;
}