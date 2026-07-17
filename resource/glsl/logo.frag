uniform sampler2D u_texture;
uniform float u_time;
uniform int u_mode;
uniform float u_seed;

varying vec2 v_texCoord;
varying vec4 v_color;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// Simple noise function
float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    fp = fp*fp*(3.0-2.0*fp);
    float a = rand(ip);
    float b = rand(ip + vec2(1.0, 0.0));
    float c = rand(ip + vec2(0.0, 1.0));
    float d = rand(ip + vec2(1.0, 1.0));
    return mix(mix(a, b, fp.x), mix(c, d, fp.x), fp.y);
}

void main() {
    vec2 uv = v_texCoord;
    vec4 finalColor = vec4(0.0);
    
    // Global jitter factor that periodically shakes everything
    float globalShake = step(0.85, rand(vec2(floor(u_time * 25.0), 33.3)));
    
    if (u_mode == 0) {
        // --- MODE 0: Cyberpunk Hologram / Noise Corruption ---
        // Fast, high-frequency horizontal scanning displacement
        float scanShift = sin(gl_FragCoord.y * 0.4 + u_time * 20.0) * 0.015;
        if (rand(vec2(floor(gl_FragCoord.y / 4.0), floor(u_time * 15.0))) > 0.7) {
            scanShift += (rand(vec2(u_time, gl_FragCoord.y)) - 0.5) * 0.04;
        }
        uv.x += scanShift;
        
        // Jittery chromatic split
        float abShift = 0.015 + sin(u_time * 12.0) * 0.008 + globalShake * 0.02;
        vec4 colR = texture2D(u_texture, uv + vec2(abShift, 0.0));
        vec4 colG = texture2D(u_texture, uv);
        vec4 colB = texture2D(u_texture, uv - vec2(abShift, 0.0));
        
        finalColor = vec4(colR.r, colG.g, colB.b, colG.a);
        
        // Scanlines and noise
        float scanline = sin(gl_FragCoord.y * 1.2 + u_time * 8.0) * 0.25;
        float noiseVal = rand(gl_FragCoord.xy + u_time) * 0.3;
        
        if (finalColor.a > 0.0) {
            // Cyan-purple cyberpunk color shifting
            vec3 neonColor = mix(vec3(0.0, 0.9, 1.0), vec3(1.0, 0.0, 0.8), sin(u_time * 4.0) * 0.5 + 0.5);
            finalColor.rgb = mix(finalColor.rgb, neonColor, 0.45);
            finalColor.rgb -= vec3(scanline) - vec3(noiseVal * 0.5);
        }
        
    } else if (u_mode == 1) {
        // --- MODE 1: Liquid Acid Warp ---
        // Extreme liquid distortion parameters
        float freqY = 0.15 + u_seed * 0.2;
        float freqX = 0.12 + u_seed * 0.15;
        float ampX = 0.04 + u_seed * 0.03;
        float speed = 8.0 + u_seed * 6.0;
        
        uv.x += sin(gl_FragCoord.y * freqY + u_time * speed) * ampX;
        uv.y += cos(gl_FragCoord.x * freqX + u_time * speed * 0.9) * (ampX * 0.6);
        
        // Chromatic split that waves along with the displacement
        vec4 colR = texture2D(u_texture, uv + vec2(ampX * 0.3, 0.0));
        vec4 colG = texture2D(u_texture, uv);
        vec4 colB = texture2D(u_texture, uv - vec2(ampX * 0.3, 0.0));
        finalColor = vec4(colR.r, colG.g, colB.b, colG.a);
        
        if (finalColor.a > 0.0) {
            // Trippy shifting rainbow color gradient
            float hue = fract(u_time * 0.2 + uv.x * 0.5 + uv.y * 0.5);
            vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (hue + vec3(0.0, 0.33, 0.67)));
            finalColor.rgb = mix(finalColor.rgb, rainbow, 0.4);
        }
        
    } else if (u_mode == 2) {
        // --- MODE 2: Heavy Digital Glitch & Data Corruption ---
        // Jumpy screen-shaking UV offsets
        float glitchTime = floor(u_time * 24.0);
        
        // Large slice displacements
        float sliceDisplace = step(0.5, rand(vec2(floor(gl_FragCoord.y / 12.0), glitchTime)));
        if (sliceDisplace > 0.0) {
            uv.x += (rand(vec2(glitchTime, floor(gl_FragCoord.y / 15.0))) - 0.5) * 0.15;
            uv.y += (rand(vec2(glitchTime + 4.5, floor(gl_FragCoord.y / 30.0))) - 0.5) * 0.04;
        }
        
        // Micro slice displacements for digital noise look
        float microDisplace = step(0.9, rand(vec2(floor(gl_FragCoord.y / 2.0), glitchTime + 1.2)));
        if (microDisplace > 0.0) {
            uv.x += (rand(vec2(glitchTime + 7.7, gl_FragCoord.y)) - 0.5) * 0.25;
        }
        
        // Extreme chromatic split
        float splitAmt = 0.035 * step(0.4, rand(vec2(glitchTime, 88.8)));
        vec4 colR = texture2D(u_texture, uv + vec2(splitAmt, splitAmt * 0.2));
        vec4 colG = texture2D(u_texture, uv);
        vec4 colB = texture2D(u_texture, uv - vec2(splitAmt, -splitAmt * 0.2));
        
        finalColor = vec4(colR.r, colG.g, colB.b, colG.a);
        
        // Extreme color alterations
        if (finalColor.a > 0.0) {
            float randColor = rand(vec2(glitchTime, 7.7));
            if (randColor > 0.92) {
                // Invert colors fully
                finalColor.rgb = vec3(1.0) - finalColor.rgb;
            } else if (randColor > 0.84) {
                // Swap red and blue channels, tint green
                finalColor.rgb = vec3(finalColor.b, finalColor.r * 1.5, finalColor.g * 0.1);
            } else if (randColor > 0.75) {
                // Solid magenta/cyan digital block overlay
                vec3 blockTint = rand(vec2(glitchTime, 3.3)) > 0.5 ? vec3(1.0, 0.0, 1.0) : vec3(0.0, 1.0, 1.0);
                finalColor.rgb = mix(finalColor.rgb, blockTint, 0.8);
            }
        }
        
    } else if (u_mode == 3) {
        // --- MODE 3: Hyper Chromatic Aberration & Diagonal Split ---
        float vibSpeed = 50.0;
        float splitStrength = 0.025 + sin(u_time * 8.0) * 0.015 + globalShake * 0.03;
        float angle = u_time * vibSpeed;
        
        // Diagonal oscillating offsets
        vec2 offsetR = vec2(cos(angle), sin(angle)) * splitStrength;
        vec2 offsetB = vec2(sin(angle * 1.3), cos(angle * 1.3)) * -splitStrength;
        
        vec4 colR = texture2D(u_texture, uv + offsetR);
        vec4 colG = texture2D(u_texture, uv);
        vec4 colB = texture2D(u_texture, uv + offsetB);
        
        finalColor = vec4(colR.r, colG.g, colB.b, colG.a);
        
        // Random white flash lines
        if (finalColor.a > 0.0) {
            float flash = step(0.96, rand(vec2(floor(gl_FragCoord.y / 5.0), floor(u_time * 30.0))));
            if (flash > 0.0) {
                finalColor.rgb = vec3(1.5);
            }
        }
        
    } else if (u_mode == 4) {
        // --- MODE 4: Broken CRT / Signal Loss ---
        // Screen shaking
        float shakeX = (rand(vec2(floor(u_time * 50.0), 12.3)) - 0.5) * 0.04 * globalShake;
        float shakeY = (rand(vec2(floor(u_time * 50.0), 45.6)) - 0.5) * 0.04 * globalShake;
        uv += vec2(shakeX, shakeY);
        
        // Rolling signal bend
        float rollPos = fract(u_time * 0.6);
        float distToRoll = abs(uv.y - rollPos);
        if (distToRoll < 0.15) {
            float wave = sin((0.15 - distToRoll) * 30.0) * 0.05;
            uv.x += wave;
        }
        
        // CRT barrel distortion
        vec2 cc = uv - 0.5;
        float dist = dot(cc, cc);
        uv = 0.5 + cc * (1.0 + dist * (0.15 + u_seed * 0.15));
        
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            finalColor = vec4(0.0);
        } else {
            finalColor = texture2D(u_texture, uv);
            
            // Scanlines + flickering
            float scanline = sin(gl_FragCoord.y * 2.0) * 0.2;
            float flicker = 0.8 + 0.2 * sin(u_time * 80.0);
            
            if (finalColor.a > 0.0) {
                finalColor.rgb *= flicker;
                finalColor.rgb -= vec3(scanline);
                
                // Add high frequency analog static noise
                float noiseVal = rand(gl_FragCoord.xy + u_time) * 0.25;
                finalColor.rgb += vec3(noiseVal);
                
                // High contrast color distortion inside rolling bar
                if (distToRoll < 0.1) {
                    finalColor.r *= 1.8;
                    finalColor.g *= 0.2;
                    finalColor.b *= 1.8;
                }
            }
        }
        
    } else if (u_mode == 5) {
        // --- MODE 5: Matrix Dissolve & Pixel Corruption ---
        // Downscale pixelation dynamically based on time
        float pixelScale = 64.0 + sin(u_time * 4.0) * 32.0;
        vec2 pixelUV = floor(uv * pixelScale) / pixelScale;
        
        finalColor = texture2D(u_texture, pixelUV);
        
        if (finalColor.a > 0.0) {
            // Falling code rain noise
            float rainNoise = rand(vec2(floor(pixelUV.x * 20.0), floor(pixelUV.y * 10.0 + u_time * 15.0)));
            
            // Blocky dissolve effect
            float dissolve = step(0.7 + sin(u_time * 2.0) * 0.25, rainNoise);
            if (dissolve > 0.0) {
                // High brightness neon green data block
                finalColor.rgb = vec3(0.0, 1.8, 0.2);
            } else {
                // Rapid rainbow hue shift
                float hue = fract(u_time * 0.8 + uv.x * 0.5);
                vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (hue + vec3(0.0, 0.33, 0.67)));
                finalColor.rgb = mix(finalColor.rgb, rainbow, 0.3);
            }
            
            // Add blocky digital static lines
            if (rand(vec2(floor(u_time * 15.0), floor(gl_FragCoord.y / 16.0))) > 0.9) {
                finalColor.rgb = vec3(1.5, 0.0, 0.0); // solid red lines
            }
        }
    } else {
        finalColor = texture2D(u_texture, uv);
    }
    
    // Apply final vertex color tint
    gl_FragColor = finalColor * v_color;
}
