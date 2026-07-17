varying vec2 v_texCoord;
varying vec4 v_color;

void main() {
    v_texCoord = gl_MultiTexCoord0.xy;
    v_color = gl_Color;
    gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}
