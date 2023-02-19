var mouseMoveCreatePolygon = (gl, index, position) => {
  gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, new Float32Array([position.x, position.y]));
}

var addPolygonPoint = (gl, position, polygonPointsArray, index, default_color, positionBuffer) => {
  gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, new Float32Array(default_color));
  gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index+1), new Float32Array(default_color));
  
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index+1), new Float32Array([position.x, position.y]));
  
  if (polygonPointsArray.length == 0) {
    document.getElementById("polygon-save").hidden = false;
  }
  
  polygonPointsArray.push([position.x, position.y]);
}

var finalizePolygon = (gl, arrayOfShapes, shape, positionBuffer) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const idx = index - polygonPointsArray.length;
  
  for (let i = 0; i < polygonPointsArray.length; i++) {
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (idx+i), new Float32Array(polygonPointsArray[i]));
  }

  const vertices = Object.assign({}, ...polygonPointsArray.map((_, i) => ({ [i]: polygonPointsArray[i] })));
  const colors = Object.assign({}, ...polygonPointsArray.map((_, i) => ({ [i]: default_color })));
  const nPolygon = polygonPointsArray.length;

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

var changeColorVertexPolygon = (gl, arrayOfShapes, selected_shape, rgb) => {
  gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (selected_shape.index + parseInt(clicked_vertex)), new Float32Array(rgb));

  selected_shape.colors[clicked_vertex] = rgb;
  arrayOfShapes[selected_shape.shape_index].colors[clicked_vertex] = rgb;
}

var movePolygonVertex = (gl, selected_shape, position) => {
  const offSet = getOffset(selected_shape);

  gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (selected_shape.index + parseInt(clicked_vertex)), new Float32Array([position.x, position.y]));
  
  selected_shape.vertices[clicked_vertex] = [position.x, position.y];
  arrayOfShapes[selected_shape.shape_index].vertices[clicked_vertex] = [position.x, position.y];
}