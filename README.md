# Komuna Marketplace

A modern, full-featured marketplace platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS. Komuna supports products, services, pets, and job listings with a beautiful UI inspired by popular marketplaces like Amazon, AliExpress, and Temu.

## 🚀 Features

### Core Functionality

- **Multi-type Marketplace**: Browse and sell products, services, pets, and jobs
- **User Authentication**: Secure login and registration with role-based access (buyer/seller)
- **Store Management**: Complete store setup and product/item management for sellers
- **Shopping Cart**: Add items to cart with quantity management
- **Checkout Process**: Complete checkout flow with form validation
- **Real-time Search**: Live search with autocomplete and results preview
- **Advanced Filtering**: Filter by category, price range, and item type
- **Pagination**: Navigate through items with customizable items per page (8, 10, 20)
- **Product Details**: Detailed item pages with type-specific information

### User Experience

- **Responsive Design**: Mobile-first design that works on all devices
- **Beautiful Animations**: Smooth transitions powered by Framer Motion
- **Salvadoran Flag Colors**: White and blue color scheme throughout
- **Type-safe**: Full TypeScript implementation
- **Accessibility**: ARIA labels and keyboard navigation support

### Developer Experience

- **Unit Tests**: Comprehensive test coverage with Jest and React Testing Library
- **Code Quality**: ESLint configuration for code consistency
- **Git Hooks**: Husky for pre-commit checks
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Security**: Input sanitization, XSS protection, and secure form handling

## 📋 Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun
- Git

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd komuna
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables** (if needed)

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run prepare` - Set up Husky git hooks

## 🏗️ Project Structure

```
komuna/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── faq/               # FAQ page
│   ├── help/              # Help center
│   ├── item/              # Item detail pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── profile/           # User profile page
│   ├── store/             # Store pages
│   ├── data/              # Sample data
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Auth/              # Authentication components
│   ├── Cart/              # Shopping cart components
│   ├── Checkout/          # Checkout components
│   ├── FilterPanel/       # Filter components
│   ├── Navbar/            # Navigation bar
│   ├── Pagination/        # Pagination component
│   ├── ProductCard/       # Product card components
│   ├── ProductList/       # Product list components
│   ├── Profile/           # Profile components
│   ├── SearchBar/         # Search components
│   ├── Store/             # Store display components
│   └── StoreManagement/   # Store management components
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
│   ├── auth.ts           # Authentication utilities
│   └── security.ts       # Security utilities
├── public/                # Static assets
└── tests/                 # Test files

```

## 🧪 Testing

The project includes comprehensive unit tests for all components:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔒 Security

The application implements several security measures:

- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **Form Validation**: Client-side and server-side validation
- **Secure Authentication**: Password validation and secure session handling
- **Content Security**: HTML escaping and safe rendering
- **Type Safety**: TypeScript prevents many common security issues

See [SECURITY.md](./SECURITY.md) for more details.

## 🎨 Styling

The project uses:

- **Tailwind CSS v4** for utility-first styling
- **DaisyUI** for component library
- **Custom Theme**: Salvadoran flag colors (white and blue)
- **Framer Motion** for smooth animations

## 📱 Responsive Design

The application is fully responsive and optimized for:

- Mobile devices (320px+)
- Tablets (768px+)
- Desktops (1024px+)
- Large screens (1280px+)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 👥 Authors

- **Komuna Team** - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- DaisyUI for the component library
- All open-source contributors

## 📞 Support

For support, email support@komuna.com or visit our [Help Center](/help).

## 🔗 Links

- [About Us](/about)
- [Contact](/contact)
- [FAQ](/faq)
- [Terms of Service](/terms)
- [Privacy Policy](/privacy)
