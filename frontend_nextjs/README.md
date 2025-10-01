# Connector Integration Hub - Frontend

A modern Next.js frontend application for the Connector Integration Hub, featuring Ocean Professional theme styling, smooth animations, and comprehensive user experience enhancements.

## 🎨 Design & Theme

The application follows the **Ocean Professional** design system with:
- **Primary Colors**: Blue tones (#1976D2, #1E88E5) 
- **Secondary**: Amber accents (#F59E0B)
- **Background**: Light neutral (#F5F7FA)
- **Surface**: Clean white cards with subtle shadows
- **Typography**: Helvetica Neue with carefully scaled font sizes

## ✨ UI/UX Enhancements

### 🔄 Loading States & Skeletons
- **Skeleton Loaders**: Animated loading placeholders for projects, connectors, and cards
- **Shimmer Effects**: Smooth gradient animations during loading
- **Progressive Loading**: Staggered animations for list items
- **Loading Indicators**: Contextual spinners for actions and forms

### 📢 Toast Notifications
- **React Hot Toast Integration**: Lightweight, accessible notifications
- **Styled Toasts**: Custom Ocean Professional theme styling
- **Smart Positioning**: Appears below app bar to avoid UI conflicts
- **Auto-dismiss**: Configurable timing based on message importance
- **Action Feedback**: Success, error, info, and loading states

### 🎭 Animations & Transitions
- **Framer Motion**: Smooth, performant animations throughout
- **Micro-interactions**: Hover effects, button presses, card interactions
- **Page Transitions**: Smooth entry animations for components
- **Staggered Lists**: Sequential animation of list items
- **Reduced Motion Support**: Respects user accessibility preferences

### ♿ Accessibility Improvements
- **Enhanced Focus Management**: Visible focus rings and logical tab order
- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility for all interactions
- **Color Contrast**: WCAG AA compliant color combinations
- **Semantic HTML**: Proper heading hierarchy and landmark roles
- **Error Announcements**: Live regions for dynamic content updates

### 🛡️ Error Handling
- **Global Error Boundary**: Catches and handles JavaScript errors gracefully
- **Friendly Error Pages**: Custom 404 and error fallback components
- **Development Debugging**: Detailed error information in development mode
- **Recovery Actions**: Clear paths for users to recover from errors
- **Toast Error Reporting**: User-friendly error notifications

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Flexible Grid**: Responsive project card layouts
- **Touch-Friendly**: Appropriate touch targets for mobile devices
- **Adaptive Navigation**: Sidebar collapses appropriately on mobile

## 🧩 Component Architecture

### Core Components
- **ConnectorCard**: Enhanced with loading states, animations, and status indicators
- **ProjectCard**: Interactive cards with hover effects and click animations
- **TokenModal**: Improved form validation, accessibility, and error handling
- **SkeletonLoader**: Configurable loading placeholders for different content types
- **ToastProvider**: Global notification system with theme integration
- **ErrorBoundary**: Comprehensive error catching and recovery

### Enhanced Features
- **Form Validation**: Real-time validation with error messaging
- **Smart Caching**: Session-based storage for improved performance
- **Progressive Enhancement**: Works without JavaScript for core functionality
- **Print Styling**: Optimized layouts for printing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Running backend_fastapi service (default at http://localhost:3001)

### Installation
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Configuration
Create a `.env` file in the frontend directory:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Development
```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📦 Dependencies

### Core
- **Next.js 15.2.3**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript 5**: Type safety and developer experience
- **Tailwind CSS 4**: Utility-first styling with custom theme

### UI/UX Enhancements
- **Framer Motion**: Animation library for smooth interactions
- **React Hot Toast**: Lightweight notification system

### Development
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing and optimization

## 🎯 Key Features

### Authentication Flow
- **OAuth 2.0 Integration**: Seamless Atlassian authentication
- **API Token Support**: Alternative authentication method with enhanced forms
- **Session Management**: Persistent connection status with localStorage
- **Callback Handling**: Smooth OAuth redirect processing with user feedback

### Project Management
- **Real-time Loading**: Live project fetching with skeleton loading states
- **Search Functionality**: Filter projects with instant results and disabled states
- **Error Recovery**: Graceful handling of API failures with retry actions
- **Status Indicators**: Clear connection and loading states with animations

### User Experience
- **Intuitive Navigation**: Clear information hierarchy with smooth transitions
- **Contextual Actions**: Smart button states based on connection status
- **Visual Feedback**: Immediate response to all user actions via toasts
- **Accessibility First**: Full keyboard and screen reader support

## 🔌 Backend Integration

### API Endpoints Used

#### Jira Integration
- `GET /status?session_id={id}` - Connection status
- `POST /auth/jira/oauth/start` - Start OAuth flow
- `POST /auth/jira/api-token` - API token authentication
- `GET /jira/projects?session_id={id}&q={query}` - Fetch projects

#### Confluence Integration
- `GET /status?session_id={id}` - Connection status
- `POST /auth/confluence/oauth/start` - Start OAuth flow
- `POST /auth/confluence/api-token` - API token authentication
- `GET /confluence/spaces?session_id={id}` - Fetch spaces

### OAuth Callback Handling
The backend performs OAuth callbacks and redirects back to the frontend. The application:
1. Detects OAuth parameters (`code`, `state`, etc.)
2. Shows processing notification
3. Refreshes connection status
4. Displays success/error feedback
5. Cleans URL for idempotent refreshes

### Session Management
- Uses `crypto.randomUUID()` for session generation
- Stores session ID in localStorage
- Passes session ID with all API requests
- Maintains session across page reloads

## 🔧 Configuration

### Theme Customization
Modify CSS variables in `src/app/globals.css`:
```css
:root {
  --bg-app: #F5F7FA;
  --surface-card: #FFFFFF;
  --brand-primary: #1976D2;
  --brand-accent: #1E88E5;
  /* ... more variables */
}
```

### Animation Settings
Adjust Framer Motion configurations in components:
```typescript
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -2, scale: 1.02 }
};
```

### Toast Configuration
Customize notification behavior in `ToastProvider`:
```typescript
const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 4000,
    style: { /* custom styles */ }
  });
};
```

## 🧪 Quality Assurance

### Accessibility Features
- ✅ WCAG AA color contrast compliance
- ✅ Full keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Focus management and visible focus indicators
- ✅ Semantic HTML structure
- ✅ ARIA labels and live regions

### Performance Optimizations
- ✅ Code splitting with Next.js App Router
- ✅ Optimized images and assets
- ✅ Efficient animations with Framer Motion
- ✅ Minimal bundle size with tree-shaking
- ✅ Hardware-accelerated transforms

### Error Handling
- ✅ Global error boundary for JavaScript errors
- ✅ Network error handling with retry mechanisms
- ✅ Form validation with user-friendly messages
- ✅ Loading states for all async operations
- ✅ Graceful degradation for offline scenarios

## 🐛 Troubleshooting

### Common Issues

**OAuth Flow Not Working**
- Verify `NEXT_PUBLIC_BACKEND_URL` is correct
- Check CORS configuration on backend
- Ensure backend returns proper OAuth URLs

**Loading States Not Showing**
- Check network connectivity to backend
- Verify session ID generation and storage
- Review browser console for JavaScript errors

**Animations Not Working**
- Check if user has reduced motion preferences
- Verify Framer Motion is properly installed
- Review browser support for modern CSS features

**Toast Notifications Missing**
- Ensure ToastProvider wraps the application
- Check console for React context errors
- Verify react-hot-toast installation

### Development Debugging
```bash
# Check bundle analysis
npm run build
npm run analyze

# Run with debugging
DEBUG=* npm run dev

# Type checking
npx tsc --noEmit
```

## 📚 Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [TypeScript Support](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

### Design System
- [Ocean Professional Theme Guide](../assets/connector_integration_hub_dashboard_design_notes.md)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion API](https://www.framer.com/motion/)

### Accessibility
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Best Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Keyboard Navigation Patterns](https://webaim.org/techniques/keyboard/)

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Docker
```bash
# Build Docker image
docker build -t connector-hub-frontend .

# Run container
docker run -p 3000:3000 connector-hub-frontend
```

### Static Export
```bash
# Generate static build
npm run build
npm run export
```

## 🤝 Contributing

1. **Code Style**: Follow existing TypeScript and React patterns
2. **Accessibility**: Ensure all new components are fully accessible
3. **Testing**: Add appropriate tests for new functionality
4. **Documentation**: Update README for significant changes
5. **Design System**: Maintain consistency with Ocean Professional theme

## 📄 License

This project is part of the Connector Integration Hub application suite.
