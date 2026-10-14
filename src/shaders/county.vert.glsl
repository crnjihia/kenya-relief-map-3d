varying float vHeight;
varying vec3 vNormal;

void main() {
  vHeight = position.y;
  vNormal = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

