// Vertex Shader
#ifdef VERTEX
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
#endif

// Fragment Shader
#ifdef FRAGMENT
uniform float uTime;
uniform vec2 uResolution;
uniform float uSeed;

varying vec2 vUv;
varying vec3 vPosition;

// Simple random function
float random(float seed) {
    return fract(sin(seed) * 43758.5453123);
}

// Improved noise with more detail
float improvedNoise(vec2 uv, float seed, float time) {
    float x = uv.x * 10.0 + time + seed;
    float y = uv.y * 10.0 - time + seed;
    return (sin(x) * cos(y) + cos(x + y) + sin(x * 1.5) * 0.5) * 0.25 + 0.5;
}

void main() {
    // Center UVs and create circular mask
    vec2 uv = vUv * 2.0 - 1.0;
    float radius = length(uv);
    
    // Spherical effect - discard pixels outside a circle
    if(radius > 0.95) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        return;
    }
    
    // Spherical distortion - wrap the effect around a sphere
    float z = sqrt(1.0 - radius * radius); // Calculate Z coordinate on sphere
    
    // Create swirling vortex effect with enhanced noise
    float speed = 0.2; // Slightly slower for nebula feel
    vec2 p = uv * 1.5; // Start with scaled UV coordinates
    float seed = 0.5; // Base seed
    
    // Multi-layered noise effect with more detail for nebula look
    for (int i = 1; i < 10; i++) { // Increased iterations
        seed += float(i) * 12.0;
        // More intricate patterns
        float freq = float(i) * 2.8; // Higher frequency
        float amp = 0.35 / float(i); // Slightly higher amplitude
        
        // More complex harmonic motion for nebulous clouds
        p.x += amp * cos(freq * p.y + uTime * speed + random(seed)) + uv.x / 15.0;
        p.y += amp * sin(freq * p.x + uTime * speed + random(seed + 1.0)) + uv.y / 15.0;
        
        // Add secondary harmonics for more detail
        if (i < 5) {
            p.x += amp * 0.5 * sin(freq * 1.5 * p.y + uTime * speed * 0.7 + random(seed + 3.0));
            p.y += amp * 0.5 * cos(freq * 1.5 * p.x + uTime * speed * 0.7 + random(seed + 4.0));
        }
    }
    
    // Transform to spherical coordinates for the base pattern
    float phi = atan(p.y, p.x);
    float swirl = phi + uTime * 0.15;
    
    // Create additional pattern layer with more features
    vec2 swirledUv = vec2(
        radius * cos(swirl),
        radius * sin(swirl)
    );
    
    // Add additional noise layer for nebulous detail
    float extraNoise = improvedNoise(p * 2.0, seed + 10.0, uTime * 0.1);
    
    // Mix the noise with swirl pattern with more weight to noise
    p = mix(p, swirledUv, 0.4);
    
    // Create a dark core
    float darkCore = smoothstep(0.0, 0.4, radius); // Darker in center, lighter at edges
    
    // Define colors (aqua/teal palette with more vibrant aqua for nebula)
    vec3 color1 = vec3(40.0 / 255.0, 210.0 / 255.0, 230.0 / 255.0); // Bright aqua
    vec3 color2 = vec3(10.0 / 255.0, 160.0 / 255.0, 170.0 / 255.0); // Mid teal
    vec3 color3 = vec3(5.0 / 255.0, 20.0 / 255.0, 40.0 / 255.0);    // Dark blue (almost black)
    
    // More complex color mixing for nebula look
    float mixFactor1 = (sin(p.x * 4.0 + p.y * 4.0 + 1.0 + extraNoise) * 0.5 + 0.5);
    float mixFactor2 = (cos(p.x * 4.0 - p.y * 4.0 + 2.0) * 0.5 + 0.5);
    
    vec3 color = mix(color1, color2, mixFactor1);
    
    // Add dark core with more strength in center
    color = mix(color, color3, (1.0 - darkCore) * 0.9);
    
    // Add some variation from the extra noise
    color = mix(color, color1 * 1.2, extraNoise * 0.25 * darkCore);
    
    // Adjust brightness based on radius for nebula effect
    // Brighter in mid-radius, darker in center and edges
    float brightness = smoothstep(0.1, 0.4, radius) * (1.0 - smoothstep(0.7, 0.95, radius));
    brightness = mix(brightness, 0.7, z * 0.5); // Adjust based on Z depth
    color *= brightness * 1.1; // Slightly brighter overall
    
    // Add subtle outer glow (not center)
    float outerGlow = smoothstep(0.35, 0.6, radius) * (1.0 - smoothstep(0.7, 0.9, radius)) * 0.25;
    color += outerGlow * color1 * extraNoise;
    
    // Subtle pulsing effect
    float pulse = sin(uTime * 0.25) * 0.15 + 0.85; // Gentler pulse
    color *= pulse;
    
    // Adjust transparency to be more transparent in center
    float centerTransparency = smoothstep(0.0, 0.3, radius); // More transparent in center
    float alpha = smoothstep(0.95, 0.2, radius) * 0.7 * centerTransparency; // Max 0.7 opacity
    
    // Final color - nebulous aqua effect
    gl_FragColor = vec4(color, alpha);
}
#endif 