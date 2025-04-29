# Vue 3D Recursive App

A modern 3D web application built with Vue 3, TresJS, and Three.js, featuring an interactive phone model with a mesmerizing vortex effect.

## Features

- 🎮 Interactive 3D phone model with dynamic lighting and shadows
- 🌀 Custom shader-based vortex effect with dynamic colors
- 🎨 Glass sphere material with realistic reflections and refractions
- 📱 Responsive design that works across devices
- ⚡ Real-time animations and interactions
- 🔗 Social media and portfolio links integration

## Tech Stack

- Vue 3 with Composition API
- TypeScript for type safety
- TresJS for Vue + Three.js integration
- Three.js for 3D graphics
- GLSL for custom shaders
- Vite for fast development and building
- Vitest for unit testing

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/vue-3d-recursive-app.git
cd vue-3d-recursive-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

### Running Tests

```bash
npm run test
```

## Project Structure

```
src/
├── components/         # Vue components
├── shaders/           # GLSL shaders and materials
├── assets/           # Static assets
└── App.vue           # Main application component

public/
├── models/           # 3D models
├── textures/        # Textures and HDRIs
└── fonts/           # Font files

test/                # Unit tests
```

## Features in Detail

### Phone Model

- Realistic 3D iPhone model
- Dynamic shadows and reflections
- Interactive screen content

### Vortex Effect

- Custom GLSL shader implementation
- Dynamic color transitions
- Realistic glass sphere container
- Adjustable parameters (speed, strength, brightness)

### Lighting

- HDR environment mapping
- Real-time shadows
- Multiple light sources for dramatic effect

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- TresJS team for the amazing Vue + Three.js integration
- Three.js community for the incredible 3D graphics library
- Vue team for the reactive framework
