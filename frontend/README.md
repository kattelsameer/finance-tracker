# Finance Tracker - Frontend

React + TypeScript + Vite frontend for the Personal Finance Tracker application.

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Recharts** - Chart library for data visualization
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Backend server running on `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```plaintext
frontend/
├── src/
│   ├── assets/          # Static assets
│   ├── components/      # Reusable components
│   ├── config/          # Configuration files
│   ├── contexts/        # React contexts
│   ├── lib/             # Utility libraries
│   ├── pages/           # Page components
│   ├── services/        # API service layer
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Public static files
└── package.json         # Dependencies
```

## Features

- ✅ JWT Authentication with HttpOnly cookies
- ✅ Protected routes with automatic redirect
- ✅ Responsive design with TailwindCSS
- ✅ Form validation with React Hook Form + Zod
- ✅ API error handling
- ✅ Type-safe API client

## Development

The frontend is configured to proxy API requests to the backend server. Make sure the backend is running before starting the frontend development server.

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/MainLayout.tsx`

### Adding New API Services

1. Define types in `src/types/api.ts`
2. Create service in `src/services/`
3. Use with TanStack Query hooks in components

## License

MIT
