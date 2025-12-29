# Contributing to Komuna Marketplace

Thank you for your interest in contributing to Komuna! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in the Issues section
2. If not, create a new issue with:
   - A clear, descriptive title
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (browser, OS, etc.)

### Suggesting Features

1. Check if the feature has already been suggested
2. Create a new issue with:
   - A clear description of the feature
   - Use cases and benefits
   - Potential implementation approach (if you have ideas)

### Pull Requests

1. **Fork the repository**

   ```bash
   git clone https://github.com/your-username/komuna.git
   cd komuna
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the coding standards
   - Write tests for new features
   - Update documentation if needed
   - Ensure all tests pass

4. **Commit your changes**

   ```bash
   git commit -m "feat: add your feature description"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for test additions/changes
   - `chore:` for maintenance tasks

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear description of your changes
   - Reference any related issues
   - Wait for code review and feedback

## Development Setup

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Run tests: `npm test`
4. Run linter: `npm run lint`

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` types when possible
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Follow the component structure pattern:
  ```
  ComponentName/
    ComponentName.component.tsx
    ComponentName.test.tsx
    ComponentSubComponent.component.tsx
  ```
- Keep components focused and reusable
- Use proper prop types/interfaces

### Styling

- Use Tailwind CSS utility classes
- Follow the white and blue color scheme
- Ensure responsive design
- Use DaisyUI components when appropriate

### Testing

- Write tests for all new components
- Aim for good test coverage
- Test both happy paths and edge cases
- Use descriptive test names

## Git Workflow

1. Always work on a feature branch, never directly on `main`
2. Keep commits focused and atomic
3. Write clear commit messages
4. Sync with the main branch regularly
5. Ensure all tests pass before pushing

## Review Process

- All PRs require at least one approval
- Address feedback promptly
- Be open to suggestions and improvements
- Keep PRs focused and reasonably sized

Thank you for contributing to Komuna! 🎉
