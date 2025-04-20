import { createApp } from 'vue';
import App from './App.vue';
import Tres from '@tresjs/core';

const app = createApp(App);

// Use Tres without extra options for now - we'll use the TresCanvas props instead
app.use(Tres);
app.mount('#app');
