# Contributing to Morphlex AI

Thank you for your interest in contributing to Morphlex AI! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/morphlex-ai.git
   cd morphlex-ai
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment**
   ```bash
   cp packages/server/.env.example packages/server/.env
   cp packages/hands/.env.example packages/hands/.env
   # Add your GEMINI_API_KEY to both files
   ```

4. **Start Development**
   ```bash
   pnpm dev:full
   ```

## Project Structure

- `packages/types/` - Shared TypeScript types
- `packages/server/` - Express API server
- `packages/brain/` - React web UI
- `packages/hands/` - VS Code extension

## Coding Standards

### TypeScript

- Use strict type checking
- Prefer interfaces over types for objects
- Use explicit return types for functions
- Use enums for constants with multiple values

### React

- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Use TypeScript for all components

### Naming Conventions

- Components: PascalCase (`MigrationWorkflow.tsx`)
- Files: camelCase for utilities, PascalCase for components
- Functions: camelCase (`handleImageUpload`)
- Constants: UPPER_SNAKE_CASE (`MCP_METHODS`)

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

Example:
```
feat(brain): add dark mode toggle
fix(server): resolve Gemini API timeout issue
docs(readme): update installation instructions
```

## Testing

Before submitting a PR:

```bash
# Type check all packages
pnpm type-check

# Lint code
pnpm lint

# Build all packages
pnpm build
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Add tests if applicable
4. Update documentation
5. Ensure all checks pass
6. Submit PR with clear description

## Questions?

Open an issue or join our [Discord](https://discord.gg/morphlex)
