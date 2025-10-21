# Comprehensive Hackathon System Sitemap

## Overview
This document provides a detailed sitemap of the hackathon management system, including all pages, routes, API endpoints, and functionality.

## 1. Client-Side Routes (/client/*)

### 1.1 Hackathon Management
- **/client/hackathons**
  - Main hackathon management dashboard
  - Lists all user's hackathons with filtering and search
  - Bulk operations (publish, unpublish, delete, duplicate)
  - Status indicators (draft, active, upcoming, ended)
  - Quick actions for each hackathon

- **/client/create-hackathon**
  - Multi-step hackathon creation wizard
  - State management with auto-save
  - Tab-based navigation (overview, prizes, judges, schedule)
  - Real-time validation and error handling
  - Preview functionality
  - Cross-tab state preservation

- **/client/hackathon/preview**
  - Live preview of hackathon before publishing
  - Share and export functionality
  - Edit navigation
  - Responsive design

- **/client/hackathon/[id]/**
  - Dynamic hackathon view/edit pages
  - `/client/hackathon/[id]` - View details
  - `/client/hackathon/[id]/edit` - Edit hackathon
  - `/client/hackathon/[id]/analytics` - View analytics
  - `/client/hackathon/[id]/participants` - Manage participants
  - `/client/hackathon/[id]/teams` - Manage teams
  - `/client/hackathon/[id]/schedule` - Manage schedule
  - `/client/hackathon/[id]/judges` - Manage judges

### 1.2 User Dashboard
- **/client/dashboard**
  - Overview of all hackathon activities
  - Recent notifications
  - Quick stats and metrics
  - Action items

### 1.3 Profile Management
- **/client/profile**
  - User profile management
  - Settings and preferences
  - Authentication status

### 1.4 Communications
- **/client/chat**
  - Chat interface for hackathon participants
  - Real-time messaging
  - Team chat rooms
  - Direct messages

## 2. API Endpoints (/api/*)

### 2.1 Hackathon CRUD Operations
- **GET /api/hackathon**
  - List all hackathons with pagination
  - Query parameters: limit, offset, status, mode

- **POST /api/hackathon**
  - Create new hackathon
  - Validates required fields
  - Returns created hackathon data

- **GET /api/hackathon/[id]**
  - Get specific hackathon by ID
  - Returns detailed hackathon information

- **PUT /api/hackathon/[id]**
  - Update existing hackathon
  - Validates update permissions

- **DELETE /api/hackathon/[id]**
  - Delete hackathon
  - Authorization checks required

### 2.2 User-Specific Operations
- **GET /api/hackathons/user/[userId]**
  - Get hackathons created by specific user
  - Pagination and filtering support
  - Authentication required

- **POST /api/hackathons/drafts**
  - Save hackathon draft
  - Auto-save functionality
  - Cross-tab synchronization

- **PUT /api/hackathons/drafts**
  - Update existing draft
  - Timestamp tracking

- **DELETE /api/hackathons/drafts**
  - Delete specific draft
  - Cleanup functionality

### 2.3 Participant Management
- **GET /api/hackathon/participants**
  - List all participants
  - Filtering and pagination

- **POST /api/hackathon/participants**
  - Create new participant
  - Validation checks

- **GET /api/hackathon/participants/[id]**
  - Get specific participant details

- **PUT /api/hackathon/participants/[id]**
  - Update participant information

- **DELETE /api/hackathon/participants/[id]**
  - Delete participant

### 2.4 Team Management
- **GET /api/hackathon/teams**
  - List all teams
  - Filter by hackathon

- **POST /api/hackathon/teams**
  - Create new team
  - Team validation

- **GET /api/hackathon/teams/[id]**
  - Get team details
  - Member information

- **PUT /api/hackathon/teams/[id]**
  - Update team information
  - Member management

- **POST /api/hackathon/teams/[id]/join**
  - Join team as participant
  - Validation checks

- **POST /api/hackathon/teams/[id]/leave**
  - Leave team
  - Authorization checks

- **DELETE /api/hackathon/teams/[id]**
  - Delete team
  - Only team leader or admin

### 2.5 Registration Management
- **GET /api/hackathon/registrations**
  - List all registrations
  - Filter by hackathon and status

- **POST /api/hackathon/registrations**
  - Create new registration
  - Payment processing

- **GET /api/hackathon/registrations/[id]**
  - Get registration details

- **PUT /api/hackathon/registrations/[id]/status**
  - Update registration status
  - Admin functionality

- **DELETE /api/hackathon/registrations/[id]**
  - Cancel registration
  - Refund processing

### 2.6 Analytics and Statistics
- **GET /api/hackathon/stats/hackathons**
  - Get hackathon statistics
  - Total counts by status

- **GET /api/hackathon/stats/participants**
  - Get participant statistics
  - Team and registration counts

- **GET /api/hackathon/[id]/analytics**
  - Get detailed analytics for specific hackathon
  - Engagement metrics
  - Participation data

### 2.7 Testing and Health Checks
- **GET /api/hackathon/test**
  - Health check endpoint
  - Connection testing
  - Performance metrics

## 3. Component Architecture

### 3.1 State Management
- **lib/hackathon-state-manager.ts**
  - Centralized state management
  - localStorage persistence
  - Cross-tab synchronization
  - Auto-save functionality
  - Draft management

### 3.2 UI Components
- **components/hackathon/**
  - CreateHackathonNav - Navigation sidebar
  - CreateHackathonOverview - Main information form
  - CreateHackathonPrizes - Prize configuration
  - CreateHackathonJudges - Judge management
  - CreateHackathonSchedule - Event scheduling
  - HackathonCard - Display card for lists
  - HackathonManagementList - Management interface
  - HackathonPreview - Preview component

### 3.3 Data Management
- **lib/hackathon-canister.ts**
  - Blockchain interaction layer
  - API wrapper functions
  - Error handling
  - Type definitions

- **lib/hackathon-agent.ts**
  - Internet Computer agent setup
  - Canister connection management
  - Configuration validation

## 4. Authentication & Authorization

### 4.1 Authentication Flow
- Session management via getSession()
- User context throughout application
- Protected routes and API endpoints
- Automatic token refresh

### 4.2 Authorization Levels
- **Owner**: Full control over hackathon
- **Admin**: Management privileges
- **Participant**: Viewing and participation rights
- **Public**: Read-only access to published hackathons

## 5. Database Schema

### 5.1 Hackathon Entity
```typescript
interface Hackathon {
  id: string;
  title: string;
  tagline: string;
  description: string;
  theme: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  location: string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  min_team_size: number;
  max_team_size: number;
  prize_pool: string;
  rules: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  created_at: string;
  updated_at: string;
  owner_id: string;
}
```

### 5.2 Participant Entity
```typescript
interface Participant {
  id: string;
  hackathon_id: string;
  user_id: string;
  team_id?: string;
  registration_date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  payment_status: 'Free' | 'Paid' | 'Pending' | 'Failed';
  transaction_id?: string;
}
```

### 5.3 Team Entity
```typescript
interface Team {
  id: string;
  hackathon_id: string;
  name: string;
  leader_id: string;
  project_title: string;
  project_idea: string;
  member_ids: string[];
  created_at: string;
}
```

## 6. Features Matrix

### 6.1 Core Features
- ✅ Hackathon creation and management
- ✅ Multi-step form with validation
- ✅ Auto-save and draft management
- ✅ Cross-tab state preservation
- ✅ Real-time preview
- ✅ Participant registration
- ✅ Team formation
- ✅ Judge management
- ✅ Scheduling system
- ✅ Prize configuration

### 6.2 Advanced Features
- ✅ Blockchain integration (Internet Computer)
- ✅ Real-time notifications
- ✅ Analytics dashboard
- ✅ Bulk operations
- ✅ Export functionality
- ✅ Share capabilities
- ✅ Search and filtering
- ✅ Status management
- ✅ Role-based access control

### 6.3 User Experience Features
- ✅ Responsive design
- ✅ Progressive enhancement
- ✅ Offline draft support
- ✅ Auto-save indicators
- ✅ Undo/redo functionality
- ✅ Keyboard shortcuts
- ✅ Accessibility compliance
- ✅ Error boundary handling
- ✅ Loading states

## 7. Integration Points

### 7.1 External Services
- **Internet Computer**: Blockchain backend
- **Email Service**: Notification delivery
- **Payment Processors**: Registration fees
- **File Storage**: Images and documents
- **Analytics**: Usage tracking

### 7.2 Internal Systems
- **User Management**: Authentication and profiles
- **Marketplace**: Service integration
- **Chat System**: Communication
- **Notifications**: Real-time updates

## 8. Security Considerations

### 8.1 Authentication
- Session-based authentication
- JWT token management
- Secure cookie handling
- CSRF protection

### 8.2 Authorization
- Role-based access control
- Resource ownership validation
- API endpoint protection
- Input sanitization

### 8.3 Data Protection
- Input validation
- XSS prevention
- SQL injection protection
- Secure file uploads

## 9. Performance Optimizations

### 9.1 Frontend
- Code splitting
- Lazy loading
- Memoization (React.memo, useMemo, useCallback)
- Image optimization
- Bundle size optimization

### 9.2 Backend
- API response caching
- Database indexing
- Pagination
- Connection pooling
- CDN integration

## 10. Testing Strategy

### 10.1 Unit Testing
- Component testing
- Hook testing
- Utility function testing
- API endpoint testing

### 10.2 Integration Testing
- API integration
- Component integration
- Database integration
- Authentication flow

### 10.3 End-to-End Testing
- User journey testing
- Cross-browser testing
- Mobile responsiveness
- Performance testing

## 11. Deployment Architecture

### 11.1 Frontend
- Next.js application
- Static site generation
- Edge deployment
- CDN distribution

### 11.2 Backend
- Internet Computer canisters
- API gateway
- Load balancing
- Monitoring and logging

## 12. Monitoring and Analytics

### 12.1 Application Monitoring
- Error tracking
- Performance metrics
- User behavior analytics
- System health checks

### 12.2 Business Intelligence
- Hackathon engagement metrics
- User adoption tracking
- Conversion funnels
- Revenue analytics

---

**Last Updated**: October 2025
**Version**: 1.0
**Status**: Production Ready