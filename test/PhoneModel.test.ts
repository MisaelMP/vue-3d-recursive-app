import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	defineComponent,
	h,
	Suspense,
	ComponentPublicInstance,
	Component,
} from 'vue';
import PhoneModel from '../src/components/PhoneModel.vue';

// Globals for testing environment
declare global {
	var document: Document;
}

// Wrapper component that uses Suspense to handle async components
const AsyncWrapper = defineComponent({
	props: {
		component: {
			type: Object as () => Component,
			required: true,
		},
	},
	setup(props) {
		return () =>
			h(
				Suspense,
				{},
				{
					default: () => h(props.component),
					fallback: () => h('div', 'Loading...'),
				}
			);
	},
});

// Mock useGLTF to return a sync result instead of async
vi.mock('@tresjs/cientos', () => ({
	useGLTF: vi.fn(() => {
		const mockScene = {
			position: { set: vi.fn() },
			rotation: { set: vi.fn() },
			scale: { set: vi.fn() },
			traverse: vi.fn(),
			getObjectByName: vi.fn(() => ({
				material: {
					emissive: { set: vi.fn() },
					emissiveIntensity: 0,
				},
			})),
		};
		// Return a Promise to simulate async behavior but resolves immediately
		return Promise.resolve({ scene: mockScene });
	}),
}));

// Mock vueuse core interval function
vi.mock('@vueuse/core', () => ({
	useIntervalFn: vi.fn((fn, interval) => {
		// Just execute the function once for the test
		fn();
		return { pause: vi.fn(), resume: vi.fn() };
	}),
}));

vi.mock('@tresjs/core', () => ({
	useRenderLoop: vi.fn(() => ({
		onLoop: vi.fn(),
	})),
}));

// Mock THREE completely to avoid ShaderMaterial issues
vi.mock('three', () => {
	return {
		Mesh: class MockMesh {
			constructor() {
				return {
					position: { set: vi.fn() },
					rotation: { x: 0, y: 0, z: 0 },
					scale: { x: 1, y: 1, z: 1 },
					material: {
						map: null,
						needsUpdate: false,
					},
				};
			}
		},
		Color: class MockColor {
			constructor(colorVal: string) {
				return { value: colorVal, set: () => this };
			}
		},
		PlaneGeometry: class MockPlaneGeometry {
			constructor() {
				return {};
			}
		},
		MeshBasicMaterial: class MockMeshBasicMaterial {
			constructor(options: any) {
				return {
					...options,
					needsUpdate: false,
				};
			}
		},
		MeshStandardMaterial: class MockMeshStandardMaterial {
			constructor(options: any) {
				return {
					...options,
					emissive: { set: vi.fn() },
					emissiveIntensity: 0,
					needsUpdate: false,
				};
			}
		},
		ShaderMaterial: class MockShaderMaterial {
			constructor(options: any) {
				return {
					...options,
					uniforms: options?.uniforms || {},
					vertexShader: options?.vertexShader || '',
					fragmentShader: options?.fragmentShader || '',
					needsUpdate: false,
				};
			}
		},
		TextureLoader: class MockTextureLoader {
			load(url: string, onLoad?: Function) {
				const mockTexture = {
					needsUpdate: true,
					image: { width: 256, height: 256 },
				};
				if (onLoad) onLoad(mockTexture);
				return mockTexture;
			}
		},
		CanvasTexture: class MockCanvasTexture {
			constructor() {
				return {
					needsUpdate: true,
				};
			}
		},
		Vector3: class MockVector3 {
			set() {}
			clone() {
				return this;
			}
			project() {}
		},
		Object3D: class MockObject3D {},
		DoubleSide: 'DoubleSide',
		AdditiveBlending: 'AdditiveBlending',
	};
});

// Mock canvas and context creation
const originalCreateElement = document.createElement.bind(document);
document.createElement = vi.fn((tagName: string) => {
	if (tagName.toLowerCase() === 'canvas') {
		const mockCanvas = originalCreateElement(tagName);
		// Provide a fake getContext that returns an object with necessary methods
		mockCanvas.getContext = vi.fn(() => ({
			clearRect: vi.fn(),
			fillRect: vi.fn(),
			fillText: vi.fn(),
			roundRect: vi.fn(() => ({})),
			fill: vi.fn(),
			stroke: vi.fn(),
			font: '',
			textAlign: '',
			textBaseline: '',
			fillStyle: '',
		}));
		return mockCanvas;
	}
	return originalCreateElement(tagName);
});

// Mock the VortexShaderMaterial
vi.mock('../src/shaders/VortexShaderMaterial', () => ({
	VortexShaderMaterial: class MockVortexShaderMaterial {
		constructor() {
			return {
				update: vi.fn(),
				uniforms: {
					uTime: { value: 0 },
				},
			};
		}
	},
}));

// Mock glsl import
vi.mock('../src/shaders/vortex.glsl', () => 'mocked shader code');

// Mock gsap for animations
vi.mock('gsap', () => ({
	default: {
		to: vi.fn().mockReturnValue({
			duration: vi.fn().mockReturnValue({
				ease: vi.fn().mockReturnValue({
					onComplete: vi.fn((fn) => {
						// Execute the callback immediately for testing
						if (fn) fn();
					}),
				}),
			}),
		}),
	},
}));

// Mock VortexEffect component
vi.mock('../src/components/VortexEffect.vue', () => ({
	default: {
		name: 'VortexEffect',
		setup() {
			return {};
		},
		render() {
			return null;
		},
	},
}));

// Type for our component instance
interface PhoneModelInstance extends ComponentPublicInstance {
	showVortex: boolean;
	buttonText: string;
	buttonColour: string;
	buttonColourText: string;
	iconRefs: Record<number, any>;
	handleAppClick: () => void;
	handleIconClick: (url: string, index: number) => void;
}

describe('PhoneModel', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders correctly', async () => {
		// Mount the PhoneModel in the Suspense wrapper
		const wrapper = mount(AsyncWrapper, {
			props: {
				component: PhoneModel,
			},
			global: {
				stubs: {
					TresGroup: true,
					TresMesh: true,
					TresPlaneGeometry: true,
					TresDirectionalLight: true,
					TresMeshBasicMaterial: true,
					primitive: true,
				},
			},
		});

		// Initially it should render the loading state
		expect(wrapper.html()).toContain('Loading...');

		// Wait for all promises to resolve
		await flushPromises();
		expect(wrapper.exists()).toBe(true);
	});

	it('toggles vortex visibility when button is clicked', async () => {
		// Mount with suspense wrapper
		const wrapper = mount(AsyncWrapper, {
			props: {
				component: PhoneModel,
			},
			global: {
				stubs: {
					TresGroup: true,
					TresMesh: true,
					TresPlaneGeometry: true,
					TresDirectionalLight: true,
					TresMeshBasicMaterial: true,
					primitive: true,
				},
			},
		});

		await flushPromises();

		// Get the PhoneModel component within the suspense
		const phoneModelComponent = wrapper.findComponent(PhoneModel);
		expect(phoneModelComponent.exists()).toBe(true);

		// Access the vm directly
		const vm = phoneModelComponent.vm as PhoneModelInstance;

		// Set initial states for testing
		vm.showVortex = false;
		vm.buttonText = 'Open';
		vm.buttonColour = '#2f84ff';

		// Call method directly since we can't reliably find the button
		await vm.handleAppClick();

		// Check that the state was updated
		expect(vm.showVortex).toBe(true);
		expect(vm.buttonText).toBe('Close');
		expect(vm.buttonColour).toBe('#ff5252');

		// Click again to toggle back
		await vm.handleAppClick();

		// Check that it toggled back
		expect(vm.showVortex).toBe(false);
		expect(vm.buttonText).toBe('Open');
		expect(vm.buttonColour).toBe('#2f84ff');
	});

	it('handles icon clicks correctly', async () => {
		// Mount with suspense wrapper
		const wrapper = mount(AsyncWrapper, {
			props: {
				component: PhoneModel,
			},
			global: {
				stubs: {
					TresGroup: true,
					TresMesh: true,
					TresPlaneGeometry: true,
					TresDirectionalLight: true,
					TresMeshBasicMaterial: true,
					primitive: true,
				},
			},
		});

		await flushPromises();

		// Get the PhoneModel component within the suspense
		const phoneModelComponent = wrapper.findComponent(PhoneModel);
		const vm = phoneModelComponent.vm as PhoneModelInstance;

		// Initialize iconRefs with mock object
		vm.iconRefs = {};
		vm.iconRefs[0] = {
			scale: {
				x: 1,
				y: 1,
				z: 1,
			},
		};

		// Call handleIconClick
		await vm.handleIconClick('https://misaelm.com', 0);

		// Check that window.open was called with the correct URL
		expect(window.open).toHaveBeenCalledWith('https://misaelm.com', '_blank');
	});
});
