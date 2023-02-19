var mouseMoveCreatePolygon = (gl, index, position) => {
  gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, new Float32Array([position.x, position.y]));
}

var addPolygonPoint = (gl, position, index, default_color, positionBuffer) => {
  gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, new Float32Array(default_color));
  gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index+1), new Float32Array(default_color));
  
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index+1), new Float32Array([position.x, position.y]));
  
  if (!polygonPointsArray[shape_index]) {
    document.getElementById("polygon-save").hidden = false;
    polygonPointsArray[shape_index] = [];
  }
  
  polygonPointsArray[shape_index].push([position.x, position.y]);
}

var finalizePolygon = (gl, shape, positionBuffer) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const polArr = polygonPointsArray[shape_index];
  const idx = index - polArr.length;
  
  for (let i = 0; i < polArr.length; i++) {
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (idx+i), new Float32Array(polArr[i]));
  }

  const vertices = Object.assign({}, ...polArr.map((_, i) => ({ [i]: polArr[i] })));
  const colors = Object.assign({}, ...polArr.map((_, i) => ({ [i]: default_color })));
  const nPolygon = polArr.length;
  
  arrayOfShapes.push({
    shape,
    shape_index,
    vertices,
    colors,
    index: idx,
    nPolygon
  });

  document.getElementById("polygon-save").hidden = true;
}

var changeColorVertexPolygon = (gl, selected_shape, rgb) => {
  gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (selected_shape.index + parseInt(clicked_vertex)), new Float32Array(rgb));

  arrayOfShapes[selected_shape.shape_index].colors[clicked_vertex] = rgb;
}

var movePolygonVertex = (gl, selected_shape, position) => {
  gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + parseInt(clicked_vertex)), new Float32Array([position.x, position.y])); 

  polygonPointsArray[selected_shape.shape_index][parseInt(clicked_vertex)] = [position.x, position.y];
}

var movePolygon = (gl, selected_shape, position, mouseDownPosition) => {
  const idx = selected_shape.index;
  
  for (let i = 0; i < selected_shape.nPolygon; i++) {
    let diff = [position.x - mouseDownPosition.x, position.y - mouseDownPosition.y];
    let newPoint = [selected_shape.vertices[i][0] + diff[0], selected_shape.vertices[i][1] + diff[1]];
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (idx+i), new Float32Array(newPoint));
    polygonPointsArray[selected_shape.shape_index][i] = newPoint;
  }
}

var dilatePolygon = (gl, dilateValue) => {
  const idx = selected_shape.index;
  
  for (let i = 0; i < selected_shape.nPolygon; i++) {
    let newPoint = [selected_shape.vertices[i][0] * dilateValue, selected_shape.vertices[i][1] * dilateValue];
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (idx+i), new Float32Array(newPoint));
    polygonPointsArray[selected_shape.shape_index][i] = newPoint;
    arrayOfShapes[selected_shape.shape_index].vertices[i] = newPoint;
  }
}

var stopMovingPolygon = (selected_shape) => {
  for (let i = 0; i < selected_shape.nPolygon; i++) {
    arrayOfShapes[selected_shape.shape_index].vertices[i] = polygonPointsArray[selected_shape.shape_index][i];
  }
}