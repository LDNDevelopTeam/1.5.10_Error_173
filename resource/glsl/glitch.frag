uniform sampler2D u_texture;
uniform sampler2D u_lightmap;
uniform bool u_useLightmap;
uniform vec2 u_resolution;
uniform float u_time;
uniform bool u_useTexture;
uniform float u_glitchIntensity;
uniform float u_rotationAngle;
uniform float u_shakeIntensity;

varying vec2 v_texCoord;
varying vec2 v_lightmapCoord;
varying vec4 v_color;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    // Increased glitch frequency dynamically based on mic volume
    float glitchTrigger = step(0.76 - u_glitchIntensity * 0.25, rand(vec2(floor(u_time * 18.0), 12.3)));
    
    // Grid setup for block displacement
    vec2 gridSize = vec2(24.0, 13.5); // block grid size
    vec2 blockId = floor(v_texCoord * gridSize);
    
    // Determine if this block is currently displaced
    float blockGlitchActive = step(0.85 - u_glitchIntensity * 0.2, rand(blockId + floor(u_time * 10.0)));
    
    // UV offset computation
    vec2 uvOffset = vec2(0.0);
    if (u_useTexture && glitchTrigger > 0.0 && blockGlitchActive > 0.0) {
        // Displace the block horizontally by a random amount (-0.03 to 0.03) scaled by intensity
        uvOffset.x = (rand(blockId + 1.7) - 0.5) * (0.06 + u_glitchIntensity * 0.12);
    }
    
    vec2 finalUV = fract(v_texCoord + uvOffset);
    if (u_rotationAngle != 0.0) {
        vec2 center = vec2(0.5);
        vec2 d = finalUV - center;
        float s = sin(u_rotationAngle);
        float c = cos(u_rotationAngle);
        finalUV = fract(vec2(d.x * c - d.y * s, d.x * s + d.y * c) + center);
    }
    if (u_shakeIntensity > 0.0) {
        float shakeX = (rand(vec2(floor(u_time * 60.0), 17.3)) - 0.5) * u_shakeIntensity;
        float shakeY = (rand(vec2(floor(u_time * 60.0), 38.9)) - 0.5) * u_shakeIntensity;
        finalUV = fract(finalUV + vec2(shakeX, shakeY));
    }
    
    // Scanline glitch lines frequency increases with mic volume
    float lineNoise = step(0.94 - u_glitchIntensity * 0.15, rand(vec2(floor(gl_FragCoord.y / 6.0), floor(u_time * 24.0))));
    
    vec4 texColor;
    if (u_useTexture) {
        // Chromatic aberration shift, enhanced on displaced blocks and scaled by intensity
        float abShift = (0.0025 + u_glitchIntensity * 0.015) * glitchTrigger * (rand(vec2(floor(u_time * 12.0), 4.5)) - 0.5);
        if (blockGlitchActive > 0.0) {
            abShift *= 2.5; // shift colors even more inside displaced blocks
        }
        
        vec4 colR = texture2D(u_texture, finalUV + vec2(abShift, 0.0));
        vec4 colG = texture2D(u_texture, finalUV);
        vec4 colB = texture2D(u_texture, finalUV - vec2(abShift, 0.0));
        texColor = vec4(colR.r, colG.g, colB.b, colG.a);
    } else {
        texColor = vec4(1.0);
    }
    
    if (u_useLightmap) {
        vec4 lightColor = texture2D(u_lightmap, v_lightmapCoord);
        texColor.rgb *= lightColor.rgb;
    }
    
    vec4 finalColor = texColor * v_color;
    
    // CRT scanline shading
    float scanline = sin(gl_FragCoord.y * 2.2) * 0.07;
    finalColor.rgb -= vec3(scanline);
    
    // Dynamic glitch coloring
    if (glitchTrigger > 0.0) {
        if (lineNoise > 0.0) {
            // Intense digital color distortion (inversion and tinting)
            finalColor.rgb = vec3(0.9) - finalColor.rgb;
            finalColor.r *= 0.1;
            finalColor.g = finalColor.g * 1.5 + 0.1;
            finalColor.b *= 0.4;
        } else if (blockGlitchActive > 0.0) {
            // Give displaced blocks a slight green scanline corruption tint
            finalColor.g += 0.12;
            finalColor.r *= 0.8;
            finalColor.b *= 0.8;
        } else if (rand(vec2(gl_FragCoord.y, u_time)) > 0.4) {
            // Luma noise static
            float noise = rand(gl_FragCoord.xy + u_time) * 0.4;
            finalColor.rgb = mix(finalColor.rgb, vec3(noise), 0.3);
        }
    }
    
    // Random signal loss bands (magenta/cyan shift)
    float signalLoss = step(0.985, rand(vec2(floor(u_time * 6.0), 88.8)));
    if (signalLoss > 0.0 && abs(gl_FragCoord.y - u_resolution.y * 0.5) < u_resolution.y * 0.25) {
        finalColor.r = finalColor.r * 1.5;
        finalColor.b = finalColor.b * 1.5;
        finalColor.g = finalColor.g * 0.2;
    }
    
    // Screen green flash
    float flashTrigger = step(0.988, rand(vec2(u_time, 77.7)));
    if (flashTrigger > 0.0) {
        finalColor.rgb = vec3(finalColor.r * 0.05, finalColor.g * 2.2 + 0.3, finalColor.b * 0.05);
    }
    
    gl_FragColor = finalColor;
}
