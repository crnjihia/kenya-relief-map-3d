uniform sampler2D uColorRamp;
uniform float uMaxHeight;
varying float vHeight;
varying vec3 vNormal;

void main() {
  // Normalise height to [0,1]
  float t = clamp(vHeight / uMaxHeight, 0.0, 1.0);
  vec3 color = texture2D(uColorRamp, vec2(t, 0.0)).rgb;

  // Simple rim lighting based on view direction
  vec3 viewDir = normalize(cameraPosition - vec3(gl_FragCoord));
  float rim = 1.0 - max(dot(normalize(vNormal), viewDir), 0.0);
  color += rim * 0.2;

  gl_FragColor = vec4(color, 1.0);
}
