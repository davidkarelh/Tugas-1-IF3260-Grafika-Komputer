var dilateLine = (gl, arrayOfShapes, selected_shape, dilateValue) => {
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array([selected_shape.vertices.v1[0] * dilateValue, selected_shape.vertices.v1[1] * dilateValue]));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array([selected_shape.vertices.v2[0] * dilateValue, selected_shape.vertices.v2[1] * dilateValue]));

    arrayOfShapes[selected_shape.shape_index].vertices.v1 = [selected_shape.vertices.v1[0] * dilateValue, selected_shape.vertices.v1[1] * dilateValue];
    arrayOfShapes[selected_shape.shape_index].vertices.v2 = [selected_shape.vertices.v2[0] * dilateValue, selected_shape.vertices.v2[1] * dilateValue];
}

var changeColorVertexLine = (gl, arrayOfShapes, selected_shape, rgb) => {
    if (clicked_vertex == "v1") {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * selected_shape.index, new Float32Array(rgb));
    } else if (clicked_vertex == "v2") {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (selected_shape.index + 1), new Float32Array(rgb));
    }

    selected_shape.colors[clicked_vertex] = rgb;

    arrayOfShapes[selected_shape.shape_index].colors[clicked_vertex] = rgb;
}

var firstClickCreateLine = (gl, index, default_color) => {
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, new Float32Array(default_color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + 1), new Float32Array(default_color));
}

var secondClickCreateLine = (gl, position, v1, v2, arrayOfShapes) => {
    v2 = [position.x, position.y];
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, new Float32Array(v1));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 1), new Float32Array(v2));

    arrayOfShapes.push({
        shape: 0,
        shape_index,
        vertices: {
            v1, v2
        },
        colors: {
            v1: default_color,
            v2: default_color
        },
        index
    });
    rotationSpeeds.push(0);

    return { v1, v2 };
}

var mouseMoveCreateLine = (gl, position, v1, v2) => {
    v2 = [position.x, position.y];

    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, new Float32Array(v1));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 1), new Float32Array(v2));

    return { v1, v2 };
}

var moveLineVertex = (gl, selected_shape, position, corner_position, v1, v2) => {
    if (corner_position == "v1") {
        v1 = [position.x, position.y];
        v2 = selected_shape.vertices.v2;

        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array(v1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array(v2));

    } else if (corner_position == "v2") {
        v1 = selected_shape.vertices.v1;
        v2 = [position.x, position.y];

        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array(v1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array(v2));

    }

    return { v1, v2 };
}

var moveLine = (gl, selected_shape, correction, v1, v2) => {
    v1 = [selected_shape.vertices.v1[0] + correction.x, selected_shape.vertices.v1[1] + correction.y];
    v2 = [selected_shape.vertices.v2[0] + correction.x, selected_shape.vertices.v2[1] + correction.y];

    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array(v1));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array(v2));
    return { v1, v2 };
}

var stopMovingLine = (arrayOfShapes, selected_shape, v1, v2) => {
    arrayOfShapes[selected_shape.shape_index].vertices.v1 = v1;
    arrayOfShapes[selected_shape.shape_index].vertices.v2 = v2;
}

var rotateLineAroundCenter = (gl, selected_shape, angle) => {
    var center = [(selected_shape.vertices.v1[0] + selected_shape.vertices.v2[0]) / 2, (selected_shape.vertices.v1[1] + selected_shape.vertices.v2[1]) / 2];
    var v1 = rotatePointAroundCenter(selected_shape.vertices.v1, center, angle);
    var v2 = rotatePointAroundCenter(selected_shape.vertices.v2, center, angle);

    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * selected_shape.index, new Float32Array(v1));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + 1), new Float32Array(v2));

    arrayOfShapes[selected_shape.shape_index].vertices.v1 = v1;
    arrayOfShapes[selected_shape.shape_index].vertices.v2 = v2;
    return { v1, v2 };
}