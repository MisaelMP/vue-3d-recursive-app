import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VortexEffect from '../src/components/VortexEffect.vue';

// Define a type for the window to extend it with our custom property
declare global {
	interface Window {
		__renderLoopCallback?: (delta: number, elapsed: number) => void;
	}
}

interface VortexEffectInstance {
	vortexShaderMaterial: {
		update: () => void;
		uniforms: {
			uTime: { value: number };
		};
		transparent: boolean;
		side: string;
		depthWrite: boolean;
		depthTest: boolean;
		blending: string;
	};
}

// Mock THREE components
vi.mock('three', async () => {
	const actual = await vi.importActual('three');

	return {
		...actual,
		Group: class MockGroup {
			constructor() {
				return {
					add: vi.fn(),
					position: { set: vi.fn() },
					rotation: { set: vi.fn(), x: 0, y: 0, z: 0 },
				};
			}
		},
		Mesh: class MockMesh {
			constructor() {
				return {
					position: { set: vi.fn() },
					rotation: { set: vi.fn(), x: 0, y: 0, z: 0 },
				};
			}
		},
		SphereGeometry: class MockSphereGeometry {
			constructor() {
				return {};
			}
		},
		ShaderMaterial: class MockShaderMaterial {
			constructor(options) {
				return {
					...options,
					uniforms: options?.uniforms || {},
					vertexShader: options?.vertexShader || '',
					fragmentShader: options?.fragmentShader || '',
					needsUpdate: false,
					update: vi.fn(),
				};
			}
		},
		DoubleSide: 'DoubleSide',
	};
});

// Mock TresJS components
vi.mock('@tresjs/core', () => ({
	useRenderLoop: vi.fn(() => ({
		onLoop: vi.fn((callback) => {
			// Store the callback for manual triggering in tests
			window.__renderLoopCallback = callback;
			return { stop: vi.fn() };
		}),
	})),
}));

// Mock VortexShaderMaterial
vi.mock('../src/shaders/VortexShaderMaterial', () => ({
	VortexShaderMaterial: class MockVortexShaderMaterial {
		constructor() {
			return {
				update: vi.fn(),
				uniforms: {
					uTime: { value: 0 },
				},
				transparent: true,
				side: 'DoubleSide',
				depthWrite: false,
				depthTest: false,
				blending: 'AdditiveBlending',
			};
		}
	},
}));

// Mock glsl import if needed
vi.mock('../src/shaders/vortex.glsl', () => 'mocked shader code');

describe('VortexEffect', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.__renderLoopCallback = undefined;
	});

	it('renders correctly', async () => {
		const wrapper = mount(VortexEffect);
		await flushPromises();
		expect(wrapper.exists()).toBe(true);
	});

	it('sets up a TresMesh with correct components', async () => {
		const wrapper = mount(VortexEffect);
		await flushPromises();

		// Check for TresMesh component
		expect(wrapper.find('TresMesh').exists()).toBe(true);

		// Check for TresSphereGeometry
		expect(wrapper.find('TresSphereGeometry').exists()).toBe(true);

		// Check for TresMeshBasicMaterial
		expect(wrapper.find('TresMeshBasicMaterial').exists()).toBe(true);

		// Check for primitive component
		expect(wrapper.find('primitive').exists()).toBe(true);
	});

	it('initializes vortexShaderMaterial on mount', async () => {
		const wrapper = mount(VortexEffect);
		await flushPromises();

		const vm = wrapper.vm as unknown as VortexEffectInstance;
		expect(vm.vortexShaderMaterial).toBeDefined();
	});

	it('updates rotation in the render loop', async () => {
		const wrapper = mount(VortexEffect);
		await flushPromises();

		const vm = wrapper.vm as unknown as VortexEffectInstance;
		const initialRotation = vm.rotation;

		// Manually trigger the render loop callback
		if (window.__renderLoopCallback) {
			window.__renderLoopCallback(0.016, 1); // Simulate 16ms delta time
		}

		// Check that rotation was updated
		expect(vm.rotation).not.toBe(initialRotation);
	});

	it('updates the shader material in the render loop', async () => {
		const wrapper = mount(VortexEffect);
		await flushPromises();

		const vm = wrapper.vm as unknown as VortexEffectInstance;
		const updateSpy = vi.spyOn(vm.vortexShaderMaterial, 'update');

		// Manually trigger the render loop callback
		if (window.__renderLoopCallback) {
			window.__renderLoopCallback(0.016, 1); // Simulate 16ms delta time
		}

		// Check that the shader material's update method was called
		expect(updateSpy).toHaveBeenCalled();
	});
});
