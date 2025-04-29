import { vi } from 'vitest';
import { config } from '@vue/test-utils';

// Define the global type
declare const global: {
	ResizeObserver: typeof ResizeObserver;
	requestAnimationFrame: (callback: FrameRequestCallback) => number;
	cancelAnimationFrame: (handle: number) => void;
	HTMLCanvasElement: typeof HTMLCanvasElement;
} & typeof globalThis;

// Setup global mocks before all tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
	setTimeout(callback, 0);
	return 0;
});

global.cancelAnimationFrame = vi.fn();

// Mock HTMLCanvasElement
if (!global.HTMLCanvasElement.prototype.getContext) {
	global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
		clearRect: vi.fn(),
		fillRect: vi.fn(),
		fillText: vi.fn(),
		measureText: vi.fn(() => ({ width: 10 })),
		roundRect: vi.fn(),
		fill: vi.fn(),
		stroke: vi.fn(),
		beginPath: vi.fn(),
		closePath: vi.fn(),
		arc: vi.fn(),
		clip: vi.fn(),
		drawImage: vi.fn(),
		font: '',
		textAlign: '',
		textBaseline: '',
		fillStyle: '',
		strokeStyle: '',
		lineWidth: 0,
		// Add required properties for interface compatibility
		canvas: document.createElement('canvas'),
		getTransform: vi.fn(),
		save: vi.fn(),
		restore: vi.fn(),
		scale: vi.fn(),
		rotate: vi.fn(),
		translate: vi.fn(),
		getImageData: vi.fn(() => ({
			data: new Uint8ClampedArray(4),
			width: 1,
			height: 1,
			colorSpace: 'srgb',
		})),
		putImageData: vi.fn(),
	}));
}

// Mock window.open
window.open = vi.fn();

// Configure Vue Test Utils
config.global.stubs = {
	// Common TresJS components
	TresCanvas: true,
	TresGroup: true,
	TresMesh: true,
	TresPlaneGeometry: true,
	TresSphereGeometry: true,
	TresDirectionalLight: true,
	TresMeshBasicMaterial: true,
	TresMeshStandardMaterial: true,
	TresMeshStandardNodeMaterial: true,
	// Primitive component for custom materials
	primitive: true,
};
