import * as THREE from 'three';
import vortexShader from './vortex.glsl';

export class VortexShaderMaterial extends THREE.ShaderMaterial {
	constructor() {
		const uniforms = {
			uTime: { value: 0.0 },
			uResolution: { value: new THREE.Vector2(4, 4) },
			uSeed: { value: Math.random() },
		};

		super({
			vertexShader: vortexShader
				.replace('#ifdef VERTEX', '')
				.split('#endif')[0]
				.trim(),
			fragmentShader: vortexShader
				.replace('#ifdef FRAGMENT', '')
				.split('#endif')[1]
				.trim(),
			uniforms,
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
			depthTest: false, // Disable depth testing to ensure visibility
			blending: THREE.AdditiveBlending,
		});
	}

	/**
	 * Update the time uniform for animation
	 * @param delta Time delta
	 */
	update(delta: number = 0.01): void {
		this.uniforms.uTime.value += delta;
	}

	/**
	 * Set shader resolution
	 * @param width Width
	 * @param height Height
	 */
	setResolution(width: number, height: number): void {
		this.uniforms.uResolution.value.set(width, height);
	}

	/**
	 * Set primary color
	 * @param color THREE.Color or hex string
	 */
	setColor1(color: THREE.Color | string): void {
		if (typeof color === 'string') {
			this.uniforms.uColor1.value = new THREE.Color(color);
		} else {
			this.uniforms.uColor1.value = color;
		}
	}

	/**
	 * Set secondary color
	 * @param color THREE.Color or hex string
	 */
	setColor2(color: THREE.Color | string): void {
		if (typeof color === 'string') {
			this.uniforms.uColor2.value = new THREE.Color(color);
		} else {
			this.uniforms.uColor2.value = color;
		}
	}

	/**
	 * Set the density of the spiral effect
	 * @param value Density value
	 */
	setDensity(value: number): void {
		this.uniforms.uDensity.value = value;
	}

	/**
	 * Set the speed of the animation
	 * @param value Speed value
	 */
	setSpeed(value: number): void {
		this.uniforms.uSpeed.value = value;
	}

	/**
	 * Set the strength of the vortex effect
	 * @param value Strength value
	 */
	setStrength(value: number): void {
		this.uniforms.uStrength.value = value;
	}

	/**
	 * Set the brightness of the colors
	 * @param value Brightness value
	 */
	setBrightness(value: number): void {
		this.uniforms.uBrightness.value = value;
	}

	/**
	 * Set the opacity of the vortex
	 * @param value Opacity value (0-1)
	 */
	setOpacity(value: number): void {
		this.uniforms.uOpacity.value = value;
	}
}
