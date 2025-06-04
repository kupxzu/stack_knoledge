# Billing System

A modern healthcare billing and patient management system built with Laravel and React.

## 🚀 Tech Stack

### Backend
- **PHP 8.2+** - Server-side programming language
- **Laravel 12** - PHP web application framework
- **MySQL 8.0** - Primary database
- **Laravel Sanctum** - API authentication
- **Laravel Excel** - Excel import/export functionality
- **Spatie/Laravel-Permission** - Role and permission management

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Recharts** - Composable charting library for React
- **Axios** - Promise-based HTTP client

### Development Tools
- **Composer** - PHP dependency manager
- **NPM/Yarn** - JavaScript package manager
- **Laravel Artisan** - Command-line interface
- **Laravel Tinker** - REPL for Laravel
- **Hot Module Replacement (HMR)** - Live reload during development

### Additional Libraries & Packages
- **React Router DOM** - Client-side routing
- **React Query/TanStack Query** - Data fetching and caching
- **Headless UI** - Unstyled, accessible UI components
- **Date-fns** - Modern JavaScript date utility library
- **Laravel Debugbar** - Debug toolbar for Laravel (development)

## 📋 Features

- **Patient Management** - Comprehensive patient registration and management
- **Admitting System** - Streamlined patient admission workflow
- **Billing & Invoicing** - Automated billing calculations and invoice generation
- **Dashboard Analytics** - Real-time insights with interactive charts
- **Role-based Access Control** - Multi-level user permissions
- **Geographic Analytics** - Patient distribution by Philippine cities
- **Physician Management** - Track admitting physicians and performance
- **Room Management** - Hospital room allocation and utilization
- **Responsive Design** - Mobile-first, modern UI/UX

## 🛠️ System Requirements

### Backend Requirements
- PHP >= 8.1
- MySQL >= 8.0
- Composer >= 2.0
- Apache/Nginx web server

### Frontend Requirements
- Node.js >= 16.0
- NPM >= 8.0 or Yarn >= 1.22

## 🏗️ Architecture

```
cas_billing/
├── app/                    # Laravel application files
│   ├── Http/Controllers/   # API controllers
│   ├── Models/            # Eloquent models
│   └── Services/          # Business logic services
├── database/              # Database migrations and seeders
├── react/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/           # Static assets
├── routes/               # Laravel routes
└── public/              # Web server document root
```

## 📊 Key Modules

### 1. Dashboard Module
- Real-time analytics and KPIs
- Interactive charts using Recharts
- Geographic patient distribution
- Physician performance metrics

### 2. Admitting Module
- Patient admission workflow
- Room assignment and management
- Physician assignment
- Insurance and billing setup

### 3. Patient Management
- Comprehensive patient profiles
- Medical history tracking
- Contact and address management
- Insurance information

### 4. Billing System
- Automated billing calculations
- Invoice generation and management
- Payment tracking
- Insurance claim processing

## 🎨 UI/UX Features

- **Modern Design System** - Clean, professional healthcare-focused interface
- **Responsive Layout** - Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode** - User preference-based theming
- **Interactive Charts** - Real-time data visualization with hover effects
- **Smooth Animations** - Micro-interactions for better user experience
- **Accessibility** - WCAG 2.1 compliant components

## 🔒 Security Features

- **JWT Authentication** - Secure API authentication with Laravel Sanctum
- **Role-based Permissions** - Granular access control using Spatie/Laravel-Permission
- **Data Validation** - Server-side and client-side validation
- **CSRF Protection** - Cross-site request forgery protection
- **SQL Injection Prevention** - Eloquent ORM with prepared statements
- **XSS Protection** - Input sanitization and output encoding

## 🌍 Localization

- **Philippine Healthcare Focus** - Optimized for Philippine medical institutions
- **City Database** - Comprehensive Philippine cities and municipalities
- **Currency Support** - PHP (Philippine Peso) billing calculations
- **Date Formats** - Localized date and time formatting

## 📈 Performance Optimizations

- **Lazy Loading** - Code splitting for optimal bundle sizes
- **Database Indexing** - Optimized database queries
- **Caching** - Redis/Memcached support for improved performance
- **Image Optimization** - Compressed and optimized assets
- **CDN Ready** - Static asset delivery optimization

## 🔧 Development Workflow

1. **Backend Development** - Laravel with Artisan commands
2. **Frontend Development** - React with Vite HMR
3. **Database Management** - Laravel migrations and seeders
4. **API Development** - RESTful APIs with Laravel
5. **Testing** - PHPUnit for backend, Jest for frontend
6. **Deployment** - Docker containerization support

---

Built with ❤️ for modern healthcare management
