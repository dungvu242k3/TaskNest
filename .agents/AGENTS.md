# Project Guidelines & Git Workflow Rules

## Git Commit & Branching Strategy
- **Granular Atomic Commits**: Always group changes by specific logical unit of work (e.g., individual components, specific pages, store actions, or bug fixes). NEVER commit everything in a single bulk commit (`git add .`).
- **Feature-Specific Branches**: Create separate feature/bugfix branches for each discrete component or task (e.g., `feat/ui-components`, `feat/dashboard-page`, `feat/command-palette`, `fix/state-mutation`).
- **Conventional Commits**: Format all commit messages with clear, standard scope descriptions:
  - `feat(component-name): description`
  - `fix(bug-scope): description`
  - `docs(doc-scope): description`
  - `refactor(scope): description`
