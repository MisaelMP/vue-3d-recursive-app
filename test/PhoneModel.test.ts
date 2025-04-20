// add tests for PhoneModel.vue

import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import PhoneModel from '../src/components/PhoneModel.vue';

describe('PhoneModel', () => {
	it('renders correctly', () => {
		const wrapper = mount(PhoneModel);
		expect(wrapper.exists()).toBe(true);
	});
});
