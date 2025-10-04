# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

BuildTrack is a construction inventory and project management system for B&B Concrete, built with Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase, and Clerk authentication.

## Development Commands

### Primary Development
- `npm run dev` - Start development server with Turbopack (faster builds)
- `npm run build` - Build production application with Turbopack 
- `npm start` - Start production server
- `npm run lint` - Run ESLint (configured with warnings only)

### Voice Agent Backend
- `cd voice-agent-backend && python main.py` - Start Python FastAPI backend
- `cd voice-agent-backend && pip install -r requirements.txt` - Install Python dependencies

### Database Operations
- SQL migrations are located in `/migrations/` directory
- Apply migrations directly to Supabase database
- Database connection via Supabase client with Clerk authentication integration

## Architecture Overview

### Frontend Architecture
- **App Router**: Next.js 15 App Router with `/src/app/` structure
- **Authentication**: Clerk provider wraps entire application with Supabase integration
- **Database**: Singleton DatabaseManager pattern with authentication caching
- **UI Components**: Radix UI + Tailwind CSS with shadcn/ui patterns
- **State Management**: React hooks with context providers (UserProfileProvider)

### Key System Components

#### Authentication Flow
1. Clerk handles user authentication and session management
2. DatabaseManager singleton authenticates with Supabase using Clerk tokens
3. UserProfileProvider manages user context throughout app
4. Middleware protects routes and handles role-based access

#### Database Pattern
- **Client-side**: `useDatabase()` hook provides authenticated Supabase client
- **Server-side**: `createServerClient()` for API routes with token-based auth
- **Utilities**: `dbUtils` for consistent error handling and query patterns
- **Services**: BaseService pattern for business logic (ProductService, InventoryTransactionService)

### Module Structure

#### Core Pages & Views
- **Dashboard**: Statistics overview, recent activity, quick actions
- **Projects**: Project management with task tracking system
- **Inventory**: Product management with transaction history
- **Equipment**: Equipment tracking with checkout/checkin logs
- **Procurement**: Purchase order management
- **Reports**: Data analysis and reporting tools
- **Settings**: User and system configuration management

#### Component Organization
- `/components/[module]/` - Feature-specific components (inventory, projects, equipment, etc.)
- `/components/ui/` - Reusable UI components (shadcn/ui patterns)
- `/components/dashboard/` - Dashboard-specific components
- `/components/auth/` - Authentication components

#### API Architecture
- `/src/app/api/[resource]/route.ts` - RESTful API endpoints
- Zod validation schemas for type-safe API contracts
- Consistent error handling and response patterns
- Role-based access control middleware

### Voice Agent System
- **Backend**: FastAPI with Azure OpenAI + LangChain integration
- **Frontend**: VoiceAgentWidget with WebRTC audio capture
- **Security**: Admin-only access with JWT authentication
- **Database**: Read-only queries via natural language processing

## Development Guidelines

### Database Operations
- Use `useDatabase()` hook for client-side database operations
- Implement proper loading states and error handling
- Follow the DatabaseManager singleton pattern for consistent authentication
- Use `dbUtils.safeQuery()` for error-safe database operations

### API Development
- Follow RESTful conventions in `/src/app/api/` routes  
- Implement Zod schemas for request/response validation
- Use consistent error response format
- Include proper TypeScript types from `/src/types/database.ts`

### Component Development
- Use TypeScript with strict mode enabled
- Implement proper loading and error states
- Follow the established UI patterns (Radix UI + Tailwind)
- Use the toast system (`useToast`) for user feedback

### Authentication & Authorization
- All pages require Clerk authentication by default
- Use `useUserProfile()` hook for role-based UI logic
- Implement server-side permission checks in API routes
- Role hierarchy: Admin > Manager > Supervisor > Worker > Contractor

### Styling & UI
- Tailwind CSS with custom configuration in `tailwind.config.js`
- Component library: Radix UI with shadcn/ui patterns
- Custom animations with `tw-animate-css`
- Responsive design with mobile-first approach
- Dark/light theme support via `next-themes`

## Key Technical Decisions

### Build Configuration
- **Turbopack**: Enabled for faster development builds
- **TypeScript**: Build errors ignored for development speed (fix in production)
- **ESLint**: Warnings only to prevent build blocking

### Performance Optimizations
- Database authentication caching (5-minute intervals)
- Singleton database client pattern
- Debounced search implementations
- Pagination for large datasets
- Proper loading states throughout UI

### Error Handling
- Global error boundary with user-friendly messages
- Consistent API error format
- Client-side validation with server-side validation backup
- Toast notifications for user feedback

## Voice Agent Integration

### Setup Requirements
- Azure OpenAI service with GPT-4, Whisper, and TTS deployments
- Read-only database user for security
- JWT authentication matching main application

### Usage
- Admin-only floating action button in dashboard
- Natural language to SQL query translation
- Audio input/output with WebRTC
- All interactions logged for audit purposes

## Testing Strategy

### Manual Testing Focus
- User management (CRUD operations, role-based permissions)
- Project management (tasks, assignments, progress tracking)
- Inventory operations (transactions, stock levels)
- Equipment management (checkout/checkin workflows)
- Voice agent functionality (admin users only)

### Database Testing
- Verify all migrations apply correctly
- Test role-based access controls
- Validate data integrity constraints
- Check performance with large datasets

## Environment Configuration

### Required Environment Variables
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Voice Agent (Optional)
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
DATABASE_URL=
JWT_SECRET=
```

## Common Issues & Solutions

### Authentication Problems
- Verify Clerk and Supabase environment variables
- Check user role assignments in database
- Ensure JWT template is properly configured (if using custom tokens)

### Database Connection Issues
- DatabaseManager handles authentication automatically
- Check network connectivity to Supabase
- Verify database permissions for user operations

### Build Issues
- TypeScript errors are ignored during development builds
- ESLint warnings don't block builds
- Use `npm run build` to check production readiness

## Deployment Checklist

### Pre-Production
- Apply all database migrations
- Configure production environment variables
- Test role-based access controls
- Verify API rate limiting
- Enable proper logging and monitoring

### Security Considerations  
- All API routes require authentication
- Role-based permission checks
- Input validation with Zod schemas
- SQL injection protection via Supabase RLS
- Read-only database user for voice agent

This system is designed for scalability and maintainability with strong TypeScript patterns, comprehensive error handling, and production-ready security measures.