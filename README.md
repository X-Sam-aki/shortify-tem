# Shortify

Transform your content into engaging YouTube Shorts with AI-powered editing tools.

## Features

- 🎥 Create YouTube Shorts from existing content
- 🎨 AI-powered video editing
- 🔄 Direct YouTube integration
- 👤 User authentication with Supabase
- 🎯 SEO optimization
- 📱 Responsive design

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Supabase
- React Query
- React Router
- Framer Motion
- Vitest

## Getting Started

### Prerequisites

- Node.js 20.x
- npm 10.x

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/shortify.git
cd shortify
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your values.

### Development

Start the development server:
```bash
npm run dev
```

### Testing

Run tests:
```bash
npm run test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Building

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Analyze Bundle

Analyze the bundle size:
```bash
npm run analyze
```

## Deployment

The project is configured for deployment on Vercel. The deployment process is automated through GitHub Actions.

### Environment Variables

Make sure to set the following environment variables in your deployment platform:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_API_KEY`
- `VITE_CLOUDINARY_API_SECRET`
- `VITE_YOUTUBE_API_KEY`
- `VITE_YOUTUBE_CLIENT_ID`
- `VITE_YOUTUBE_CLIENT_SECRET`

### Deployment Steps

1. Push to the main branch to trigger automatic deployment
2. GitHub Actions will:
   - Run tests
   - Check types
   - Build the project
   - Deploy to Vercel (if on main branch)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
