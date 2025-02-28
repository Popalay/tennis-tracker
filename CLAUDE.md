# Tennis Tracker Project Guidelines

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Stack & Technologies
- React 19
- Vite 6
- TailwindCSS
- Firebase
- React Router
- Recharts for data visualization

## Code Style
- Use JSX for React components with .jsx extension
- Follow ESLint recommended rules for React
- Prefer functional components with hooks
- Use named exports for components
- Follow component-per-file pattern
- Use TailwindCSS for styling
- Implement responsive design using TailwindCSS breakpoints
- Organize imports: React first, then libraries, then local components/utilities

## Naming Conventions
- Components: PascalCase (e.g., `MatchHistory.jsx`)
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case for utilities, PascalCase for components

## Error Handling
- Use try/catch for async operations
- Implement error boundaries at appropriate component levels
- Provide user-friendly error messages