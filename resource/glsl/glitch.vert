varying vec2 v_texCoord;
varying vec2 v_lightmapCoord;
varying vec4 v_color;

void main() {
    v_texCoord = gl_MultiTexCoord0.xy;
    v_lightmapCoord = (gl_TextureMatrix[1] * gl_MultiTexCoord1).xy;
    v_color = gl_Color;
    gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}
