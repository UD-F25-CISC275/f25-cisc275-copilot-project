# Copilot Instructions for CoFlowCode Project

## Project Overview

This is a React + TypeScript web application for creating and delivering interactive classroom assignments. The application allows instructors to author assignments with mixed content types (text, multiple choice, code cells, essays) and enables students to complete these assignments with immediate feedback.

**Project Name:** CoFlowCode (Classwork Creation Tool)
**Type:** Educational Technology - Frontend Application
**Course Context:** Introduction to Software Engineering (CISC 275)

## Tech Stack

- **Framework:** React 19.1+ with Hooks (no class components)
- **Language:** TypeScript 5.9+ (strict type checking - `any` and `unknown` are forbidden)
- **Build Tool:** Vite 7.1+
- **Testing:** Jest 29+ with @testing-library/react and jsdom
- **Linting:** ESLint 9+ with TypeScript ESLint rules
- **Formatting:** Prettier 3.6+
- **E2E Testing:** Cypress 10+ (optional, may have installation issues)
- **Deployment:** GitHub Pages via GitHub Actions

## Critical Constraints

These constraints are **non-negotiable** and enforced by the course:

1. **TypeScript Types:** Must use explicit types. `any` and `unknown` types are **forbidden** and will fail linting. While `unknown` is typically type-safe, this course requires more specific typing to encourage better type definition practices.
2. **React Hooks Only:** Class-based components are not allowed.
3. **Linting:** All code must pass ESLint checks. Cannot override linter settings or disable rules.
4. **Testing:** Main branch must always pass all tests. High code coverage is expected.
5. **Branching:** Use feature branches; main branch must remain stable and deployable.
6. **Formatting:** All code must follow Prettier formatting rules.

## Development Commands

```bash
# Install dependencies (workaround for Cypress issue)
CYPRESS_INSTALL_BINARY=0 npm ci

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Generate linting report HTML
npm run eslint-output

# Format code with Prettier
npm run format

# Run tests in watch mode
npm run test

# Run tests with coverage report
npm run test:cov

# Preview production build locally
npm run preview

# Cypress E2E tests (may not work due to installation issues)
npm run cy:open
npm run cy:run
```

## File Structure

```
/
├── .github/
│   └── workflows/
│       └── deploy.yaml          # GitHub Actions deployment workflow
├── src/
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   ├── assets/                  # Static assets (images, etc.)
│   ├── App.css                  # Application styles
│   └── index.css                # Global styles
├── tests/
│   ├── setupTests.ts            # Jest configuration
│   └── *.spec.tsx               # Unit tests
├── docs/
│   └── index.md                 # Additional documentation
├── public/                      # Public static assets
├── eslint.config.js             # ESLint configuration
├── jest.config.js               # Jest configuration
├── tsconfig.json                # TypeScript configuration (root)
├── tsconfig.app.json            # TypeScript config for app
├── tsconfig.node.json           # TypeScript config for build tools
├── vite.config.ts               # Vite configuration
└── package.json                 # Dependencies and scripts
```

## Testing Guidelines

### Test File Naming
- Test files should be named `*.spec.tsx` or `*.spec.ts`
- Place tests in the `/tests` directory

### Test Structure
- Use `@testing-library/react` for component testing
- Use `@testing-library/jest-dom` for DOM assertions
- Example test pattern:
  ```typescript
  import { render, screen } from "@testing-library/react";
  import { MyComponent } from "../src/MyComponent";

  test("description of what is being tested", () => {
      render(<MyComponent />);
      const element = screen.getByText(/expected text/i);
      expect(element).toBeInTheDocument();
  });
  ```

### Coverage
- Coverage reports are generated in `/coverage` directory
- Main entry point (`src/main.tsx`) is excluded from coverage
- Aim for high coverage on all other source files

## Linting and Type Checking

### ESLint Rules (Enforced)
The project uses strict TypeScript ESLint rules:

- **No `any` or `unknown` types:** `@typescript-eslint/no-restricted-types` explicitly forbids both `any` and `unknown`. While `unknown` is typically considered type-safe, this course requires more specific typing as a pedagogical choice to encourage explicit type definitions.
- **No unused variables:** Must clean up all unused imports and variables
- **Type safety:** All functions must have explicit return types when not inferred
- **No unsafe operations:** Cannot assign `any` values, return `any` values, or perform unsafe operations

### Running Linting
```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors where possible
npm run lint:fix

# Generate HTML report (used in CI/CD)
npm run eslint-output
```

## Known Issues and Workarounds

### Cypress Installation Failure
**Issue:** Cypress binary download fails in sandboxed/restricted network environments.

**Workaround:** Install dependencies with:
```bash
CYPRESS_INSTALL_BINARY=0 npm ci
```

This skips the Cypress binary download. The package is still installed for type definitions, but E2E tests cannot be run. This is acceptable for most development tasks.

### NPM Audit Warnings
The project has some dependency vulnerabilities reported by `npm audit`. These are in dev dependencies and do not affect the production build. No action is required unless instructed otherwise.

## GitHub Actions Deployment

The repository automatically deploys to GitHub Pages on every push to `main`:

1. Installs dependencies
2. Runs linter (creates `dist/lint.html`)
3. Builds the application
4. Runs tests with coverage
5. Generates various reports (git inspector, commits, etc.)
6. Deploys to GitHub Pages

**Dashboard:** The deployment creates a dashboard accessible at `/dashboard.html` or `/quick.html` with links to:
- Deployed site
- Linting report
- Build log
- Test results
- Git history
- Integrity checks

## Project Requirements Summary

The application must support:

### Dashboard View
- List all assignments
- Create new assignments
- Navigate to Creator or Taker views

### Assignment Creator View (Instructor)
- Add/edit/reorder question items:
  - Text blocks (Markdown/rich text)
  - Multiple choice questions
  - Fill-in-the-blank questions
  - Essay/free response questions
  - Code cells (multi-file support with Pyodide)
  - Page breaks with gating criteria
- Attach rubrics to questions
- Configure auto-grading (answer keys, unit tests)
- Add AI grading prompts
- Import/export assignments as JSON
- Export rubrics as CSV for Canvas

### Assignment Taker View (Student)
- Answer all question types
- Submit pages and receive immediate feedback
- Progress bar showing completion
- Page gating (cannot proceed until requirements met)
- List collaborators
- Import/export submissions as JSON
- Export submission as DOCX

## Common Development Workflows

### Adding a New Component
1. Create component file in `src/` directory
2. Use TypeScript with explicit types
3. Use React Hooks (not class components)
4. Create corresponding test file in `tests/`
5. Run linter and tests to verify
6. Commit to a feature branch

### Adding a New Feature
1. Create a feature branch from `main`
2. Implement the feature following constraints
3. Write tests for the feature
4. Ensure all tests pass: `npm run test:cov`
5. Ensure linting passes: `npm run lint`
6. Format code: `npm run format`
7. Build to verify no errors: `npm run build`
8. Push branch and create PR
9. Merge only when all checks pass

### Fixing Linting Errors
1. Run `npm run lint` to see errors
2. Try auto-fix: `npm run lint:fix`
3. Manually fix remaining issues
4. Common issues:
   - Remove unused imports/variables
   - Add explicit types to function parameters/returns
   - Replace `any` with proper types
   - Handle all promise rejections

### Running the Application Locally
1. Install dependencies: `CYPRESS_INSTALL_BINARY=0 npm ci`
2. Start dev server: `npm run dev`
3. Open browser to `http://localhost:5173` (or port shown in terminal)
4. Make changes and see hot reload

## Best Practices for This Project

### TypeScript
- Always define interfaces for component props
- Use union types for state that has multiple possible values
- Use enums for fixed sets of values
- Avoid type assertions (`as`) unless absolutely necessary
- Use `typeof` and type guards for runtime type checking

### React
- Use functional components with hooks
- Use `useState` for local component state
- Use `useEffect` for side effects
- Keep components focused and small
- Lift state up when sharing between components
- Use prop drilling or context for deep state sharing

### Testing
- Test user-facing behavior, not implementation details
- Use `screen.getByRole` or `screen.getByLabelText` over `getByTestId`
- Test accessibility (proper labels, roles, etc.)
- Mock external dependencies
- Keep tests fast and isolated

### Code Organization
- One component per file (unless very small helper components)
- Group related components in directories
- Keep business logic separate from presentation
- Use clear, descriptive names for functions and variables

### Git Workflow
- Create descriptive branch names: `feature/add-dashboard`, `fix/lint-errors`
- Write clear commit messages
- Keep commits small and focused
- Never commit directly to `main`
- Ensure all checks pass before merging

## Formatting Configuration

Prettier is configured with:
- Tab width: 4 spaces
- Experimental ternaries: enabled

Format command will automatically apply these rules.

## Additional Notes

- The application is client-side only (no backend)
- Data persistence uses localStorage or file import/export (JSON)
- Deployment base path is computed from repository name
- The build process creates a `dist/` directory
- Git and node_modules are ignored in version control
- Coverage reports are excluded from git

## Getting Help

When stuck:
1. Review this instructions file
2. Check the README.md for project requirements
3. Review ESLint error messages carefully
4. Check TypeScript compiler errors
5. Look at existing code patterns in the repository
6. Review the test files for examples

## Quick Reference

| Task | Command |
|------|---------|
| Install | `CYPRESS_INSTALL_BINARY=0 npm ci` |
| Dev Server | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Test | `npm run test:cov` |
| All Checks | `npm run lint && npm run build && npm run test:cov` |
