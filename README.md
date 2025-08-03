# Mutual Fund Manager - Angular UI

A modern, responsive Angular application for managing mutual fund portfolios, built with Angular 20 and Angular Material.

## 🚀 Features

### Authentication & Security
- **Secure Login** with username/password authentication
- **Role-based Access Control** (Admin vs User)
- **JWT Token Management** with automatic logout
- **Route Guards** protecting sensitive areas

### Admin Features
- **Portfolio Management**
  - Create and manage portfolios
  - Add/remove investors
  - Monitor portfolio performance
- **User Management**
  - Create, edit, and manage users
  - Activate/deactivate user accounts
  - View user investment summaries
- **Holdings Management**
  - Buy/sell shares
  - Update stock prices
  - Add new holdings to portfolios
- **Comprehensive Dashboard**
  - Overview of all portfolios and users
  - Recent transaction monitoring
  - Quick action buttons

### User Features
- **Personal Dashboard**
  - Investment summary with returns
  - Portfolio performance tracking
  - Recent transaction count
- **Portfolio View**
  - List of invested portfolios
  - Current NAV and unit values
  - Performance metrics
- **Transaction History**
  - Complete transaction log
  - Filtering by date and type
  - Investment and withdrawal tracking

## 🛠️ Technology Stack

- **Angular 20** - Latest Angular framework
- **Angular Material** - Modern UI components
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming
- **SCSS** - Enhanced styling
- **Responsive Design** - Mobile-first approach

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v20 or higher)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mutual-fund-manager-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## 🏗️ Build

### Development Build
```bash
npm run build
```

### Production Build
```bash
npm run build --prod
```

## 🧪 Testing Credentials

The application is designed to work with the Spring Boot backend. Use these test credentials:

### Admin Access
- **Username:** `admin`
- **Password:** `admin123`

### User Access
- **Username:** `john_doe`
- **Password:** `password123`

Additional test users:
- `jane_smith` / `password123`
- `bob_wilson` / `password123`

## 🔗 Backend Integration

This frontend is designed to work with the Spring Boot Mutual Fund Manager backend:

- **Backend URL:** `http://localhost:8080`
- **API Base:** `http://localhost:8080/api`

### Key API Endpoints Used:
- `POST /api/auth/login` - User authentication
- `GET /api/dashboard/admin` - Admin dashboard data
- `GET /api/dashboard/user/{id}` - User dashboard data
- `GET /api/portfolios` - Portfolio list
- `GET /api/users` - User management
- `GET /api/transactions/user/{id}` - Transaction history

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1200px+) - Full feature set with tables
- **Tablet** (768px-1199px) - Adapted layouts
- **Mobile** (320px-767px) - Card-based layouts

## 🎨 UI/UX Features

### Design Elements
- **Material Design** principles
- **Professional color scheme** suitable for financial applications
- **Smooth animations** and transitions
- **Loading states** for better user experience
- **Error handling** with user-friendly messages

### Navigation
- **Sidebar navigation** with role-based menu items
- **Breadcrumb navigation** for complex workflows
- **Quick action buttons** for common tasks
- **User profile menu** with logout option

### Data Visualization
- **Summary cards** with key metrics
- **Data tables** with sorting and filtering
- **Progress indicators** for loading states
- **Status badges** for transaction types

## 📁 Project Structure

```
src/app/
├── core/                    # Core functionality
│   ├── guards/             # Route guards
│   ├── interceptors/       # HTTP interceptors
│   ├── models/            # TypeScript interfaces
│   └── services/          # Business logic services
├── features/              # Feature modules
│   ├── auth/             # Authentication
│   ├── dashboard/        # Dashboard components
│   ├── portfolios/       # Portfolio management
│   ├── users/           # User management
│   ├── transactions/    # Transaction history
│   └── holdings/        # Holdings management
├── layout/              # Layout components
│   ├── header/         # Application header
│   ├── sidebar/        # Navigation sidebar
│   └── main-layout/    # Main layout wrapper
└── shared/             # Shared components
    ├── components/     # Reusable components
    ├── directives/     # Custom directives
    └── pipes/         # Custom pipes
```

## 🔒 Security Features

- **JWT Token Storage** in localStorage
- **Automatic Token Refresh** handling
- **Route Protection** with guards
- **Role-based Access Control**
- **CORS Configuration** for backend communication

## 🚀 Performance Optimizations

- **Lazy Loading** for feature modules
- **OnPush Change Detection** where applicable
- **Tree Shaking** for smaller bundle sizes
- **Code Splitting** for optimal loading
- **Service Workers** ready (can be enabled)

## 🐛 Error Handling

- **Global Error Interceptor** for HTTP errors
- **User-friendly Error Messages** via snackbars
- **Loading States** to prevent user confusion
- **Retry Mechanisms** for failed requests

## 📊 Features Status

### ✅ Completed Features
- Authentication system
- Role-based dashboards
- Portfolio listing
- User management
- Transaction history
- Holdings management
- Responsive design
- Error handling

### 🚧 Future Enhancements
- Real-time price updates
- Advanced charts and graphs
- Export functionality
- Dark/light theme toggle
- Advanced filtering options
- Notification system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Check the documentation
- Review the Spring Boot backend integration
- Ensure all dependencies are properly installed
- Verify the backend is running on `http://localhost:8080`

---

**Built with ❤️ using Angular 20 and Angular Material**
