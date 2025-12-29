# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive README.md with project overview and setup instructions
- CONTRIBUTING.md with contribution guidelines and coding standards
- SECURITY.md with security policy and best practices
- LICENSE file (MIT License)
- CHANGELOG.md for tracking changes
- Husky for git hooks (pre-commit and pre-push)
- Lint-staged configuration for automatic linting
- GitHub Actions workflows:
  - CI workflow for testing and building
  - Deploy workflow for automated deployments
  - CodeQL workflow for security analysis
- Back buttons on login and register pages
- Redirect functionality with query parameters
- Framer Motion animations throughout the application:
  - FadeIn component for smooth page transitions
  - StaggerContainer and StaggerItem for staggered list animations
  - HoverScale component for hover effects
  - Product cards with hover animations
  - Pagination buttons with scale animations
  - Back buttons with smooth transitions
- Enhanced security:
  - Input sanitization utilities
  - Form validation improvements
  - Secure redirect handling
- Environment variables example file (.env.example)

### Changed

- Improved authentication flow with redirect support
- Enhanced user experience with smooth animations
- Updated navbar to include redirect URLs in login/register links
- Store management page now redirects to login with redirect parameter
- Logout now clears all relevant localStorage data

### Fixed

- TypeScript compatibility issues
- Dependency conflicts resolved with legacy peer deps
- Navigation flow improvements

## [0.1.0] - 2024-12-28

### Added

- Initial marketplace template
- Multi-type support (products, services, pets, jobs)
- User authentication (login/register)
- Store management functionality
- Shopping cart and checkout
- Real-time search
- Advanced filtering and pagination
- Product detail pages
- Comprehensive footer with links
- Unit tests for components
