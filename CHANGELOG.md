# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Testing infrastructure (Vitest + React Testing Library)
- Error boundary component for graceful error handling
- Route lazy loading for optimized bundle size
- Dark/Light theme context and provider with preference persistence
- GitHub Actions CI/CD pipeline with lint, test, and build stages
- ESLint and Prettier configuration for code quality
- Husky pre-commit hooks with lint-staged for automated linting
- Storybook setup for component library documentation
- NPM audit and Snyk integration for security scanning
- Environment configuration template (.env.example)
- Sample test and Storybook story

### Changed
- App.tsx wrapped with ErrorBoundary and ThemeProvider
- All page components switched to lazy loading with Suspense
- Navbar updated with mobile menu toggle and NFT link prioritization

### Fixed
- Mobile navigation now includes all routes including NFTs

## [1.0.0] - 2026-03-03

### Added
- Initial SUPLOCK protocol implementation
- Core UI components with Tailwind CSS and Radix UI
- Multi-page routing with React Router
- NFT gallery page with rarity tiers
- Governance, Locking, Vaults, and Reserve pages
- Cyber-punk/matrix themed styling
- Responsive mobile navigation

---

## Guidelines for Contributors

When adding new features:
1. Update this CHANGELOG.md with your changes under `[Unreleased]`
2. Use these sections: Added, Changed, Fixed, Removed, Deprecated, Security
3. Create a test for your feature in `src/__tests__/`
4. If adding UI components, add a Storybook story in `src/components/ui/ComponentName.stories.tsx`
5. Run `npm run lint` and `npm run test` before committing

When releasing a new version:
1. Update version in `package.json`
2. Move `[Unreleased]` section to a new version heading
3. Update the "## [Unreleased]" section header
4. Commit with message: `chore: release v<version>`
