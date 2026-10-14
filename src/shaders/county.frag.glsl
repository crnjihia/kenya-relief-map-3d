uniform sampler2D uColorRamp;
uniform float uNormalizedValue;
uniform float uHover;
uniform float uSelected;
uniform float uMaxHeight;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vHeight;

void main() {
  // Clamp and sample color ramp based on normalized indicator value
  float t = clamp(uNormalizedValue, 0.0, 1.0);
  vec3 rampColor = texture2D(uColorRamp, vec2(t, 0.5)).rgb;

  // Differentiate top face (horizontal) from extruded sides
  float isTop = smoothstep(0.65, 0.95, vNormal.y);
  vec3 surfaceColor = mix(rampColor * 0.80, rampColor * 1.06, isTop);

  // Subtle elevation contour lines on extruded side walls
  float contour = sin(vHeight * 6.28318 * 2.0);
  surfaceColor += vec3(0.04) * smoothstep(0.88, 0.98, contour) * (1.0 - isTop);

  // Directional sun light
  vec3 lightDir = normalize(vec3(0.55, 1.25, 0.75));
  float NdotL = max(dot(vNormal, lightDir), 0.0);
  vec3 ambient = vec3(0.35, 0.38, 0.44);
  vec3 diffuse = vec3(0.65) * NdotL;
  vec3 litColor = surfaceColor * (ambient + diffuse);

  // Subtle rim lighting for depth perception
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
  rim = pow(rim, 3.0);
  litColor += rim * vec3(0.35, 0.45, 0.55);

  // Hover effect: warm bright emissive glow
  if (uHover > 0.001) {
    vec3 hoverGlow = vec3(1.0, 0.92, 0.35);
    litColor = mix(litColor, hoverGlow, uHover * 0.45) + (uHover * 0.25 * hoverGlow);
  }

  // Selected effect: electric cyan highlight
  if (uSelected > 0.001) {
    vec3 selectGlow = vec3(0.2, 0.85, 1.0);
    litColor = mix(litColor, selectGlow, uSelected * 0.5) + (uSelected * 0.30 * selectGlow);
  }

  gl_FragColor = vec4(litColor, 1.0);
}
