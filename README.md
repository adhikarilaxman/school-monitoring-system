# Scholastic Archive - School Management System

A production-ready multi-role web application for managing a school cluster system under a central authority (Kendrapramukh).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Support](https://img.shields.io/badge/Docker-Supported-2496ED?logo=docker)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)

© 2026 Scholastic Archive Management System. All rights reserved.

## Features

### User Roles

1. **Kendrapramukh (Admin / Central Head)**
   - Full access dashboard with executive overview
   - Upload Government Resolutions (GRs) as PDF
   - Create events/programs
   - Send meeting notifications
   - Create dynamic reporting forms
   - Track all headmasters' responses
   - Export reports as Excel files
   - Monitor attendance across all schools

2. **Headmaster (12 Schools)**
   - School-specific dashboard
   - Attendance management (daily/weekly/monthly with charts)
   - View and download GRs with seen/not seen status
   - Participate in events and submit completion reports
   - Accept/decline meeting invitations
   - Fill dynamic reporting forms
   - Receive real-time notifications

3. **Public Interface (No Login Required)**
   - View school directories with details
   - Browse programs gallery with event photos
   - Academic Wall of Fame (toppers section)
   - Attendance analytics view-only

### Key Features

- **Multi-language Support**: English and Marathi (i18n)
- **Real-time Notifications**: Bell notifications for GR uploads, events, meetings, forms
- **Attendance Analytics**: Daily, weekly, monthly views with bar/line charts
- **File Management**: PDF uploads for GRs, image uploads for events
- **Excel Export**: Generate consolidated reports
- **Responsive Design**: Modern UI with Tailwind CSS
- **Role-based Access Control**: Secure authentication and authorization

## Tech Stack

### Frontend
- React.js 18
- Tailwind CSS
- Chart.js (react-chartjs-2)
- React Router DOM
- i18next (internationalization)
- Lucide React (icons)
- Axios (HTTP client)
- React Hot Toast (notifications)

### Backend
- Node.js with Express
- JWT Authentication
- Multer (file uploads)
- XLSX (Excel generation)
- Bcrypt.js (password hashing)
- CORS enabled

### Data Storage
- In-memory data store (ready for MySQL integration)
- Local file storage for uploads
- Mock data for 12 schools with attendance, events, and GRs

## Project Structure

```
SE Project/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/      # Auth, upload middleware
│   │   ├── models/          # Data store
│   │   ├── routes/          # API routes
│   │   └── server.js        # Entry point
│   ├── uploads/             # File storage
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom hooks
│   │   ├── context/          # React context
│   │   ├── i18n/             # Translations
│   │   └── App.jsx           # Main app
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### Prerequisites

#### For Development
- Node.js (v18 or higher)
- npm or yarn
- Git

#### For Docker Deployment
- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)

### Option 1: Quick Start with Docker (Recommended for Production)

Docker provides the fastest and most reliable way to get the application running in production.

**Prerequisites:**
- Docker installed ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed ([Install Docker Compose](https://docs.docker.com/compose/install/))

**Steps:**

1. **Clone the repository and navigate to root:**
   ```bash
   cd SE\ Project
   ```

2. **Build and start containers:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

4. **Stop containers:**
   ```bash
   docker-compose down
   ```

**Docker Commands:**

```bash
# Build images
docker-compose build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Stop services
docker-compose stop

# Remove containers and volumes
docker-compose down -v

# Execute command in running container
docker-compose exec backend npm run dev
docker-compose exec frontend npm run build
```

**Environment Configuration for Docker:**

Create `.env` files for configuration:

**Backend (.env):**
```bash
cp backend/.env.example backend/.env
# Update backend/.env with your settings
```

**Frontend (.env.local):**
```bash
cp frontend/.env.example frontend/.env.local
# Update frontend/.env.local with your settings
```

### Option 2: Development Setup (Local)

For local development without Docker:

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server (with auto-reload)
npm run dev

# Or start production server
npm start
```

The backend server will start on `http://localhost:5000`

**Available npm scripts:**
- `npm start` - Start production server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm test` - Run tests

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

The frontend development server will start on `http://localhost:3000`

**Available npm scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Option 3: Production Deployment

#### Using Docker (Recommended)

1. **Build for production:**
   ```bash
   docker-compose build --no-cache
   ```

2. **Start containers:**
   ```bash
   docker-compose up -d
   ```

3. **Verify health:**
   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost:3000/health
   ```

#### Manual Deployment

**Backend:**
```bash
cd backend
npm ci --only=production
npm start
```

**Frontend:**
```bash
cd frontend
npm ci
npm run build
# Serve dist/ folder using Nginx or your web server
```

## Demo Credentials

### Kendrapramukh (Admin)
- Email: `kendrapramukh@eduauthority.gov.in`
- Password: `admin123`

### Headmaster
- Email: `headmaster1@school.edu`
- Password: `headmaster123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/change-password` - Change password

### Schools
- `GET /api/schools` - Get all schools
- `GET /api/schools/:id` - Get school by ID
- `GET /api/schools/stats` - Get school statistics
- `GET /api/schools/my-school` - Get headmaster's school

### Attendance
- `GET /api/attendance/summary` - Get all schools attendance
- `GET /api/attendance/:schoolId` - Get school attendance
- `GET /api/attendance/trends` - Get attendance trends
- `PUT /api/attendance/:schoolId` - Update attendance

### Government Resolutions (GRs)
- `GET /api/grs` - Get all GRs
- `POST /api/grs` - Upload new GR (PDF)
- `POST /api/grs/:id/seen` - Mark GR as seen
- `GET /api/grs/stats` - Get GR statistics

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `POST /api/events/:id/submit` - Submit event completion

### Meetings
- `GET /api/meetings` - Get all meetings
- `POST /api/meetings` - Schedule meeting
- `POST /api/meetings/:id/respond` - Respond to meeting

### Reports
- `GET /api/reports` - Get all forms
- `POST /api/reports` - Create new form
- `POST /api/reports/:id/submit` - Submit form
- `GET /api/reports/:id/download` - Download Excel

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

### Public (No Auth Required)
- `GET /api/public/schools` - Get public school list
- `GET /api/public/programs` - Get programs gallery
- `GET /api/public/toppers` - Get toppers list
- `GET /api/public/attendance` - Get attendance summary
- `GET /api/public/stats` - Get public stats

## Docker Architecture

### Services Overview

**Frontend Service:**
- Nginx-based static server with React SPA support
- Port: 3000
- Built from source with multi-stage builds
- Includes security headers and caching strategies
- Health check: `/health` endpoint

**Backend Service:**
- Node.js Express application
- Port: 5000
- Multi-stage Docker build for optimization
- Non-root user execution for security
- Health check: `/api/health` endpoint
- Volume for persistent uploads

### Docker File Structure

```
backend/
├── Dockerfile           # Multi-stage build configuration
├── .dockerignore        # Files to exclude from image
└── ...

frontend/
├── Dockerfile           # Multi-stage Nginx build
├── nginx.conf          # Nginx configuration
├── .dockerignore       # Files to exclude from image
└── ...

docker-compose.yml      # Orchestration configuration
```

### Dockerfile Features

**Backend Dockerfile:**
- Multi-stage build to reduce image size
- Alpine Linux for minimal footprint
- Non-root user (nodejs) for security
- Health check configuration
- Proper signal handling with dumb-init
- Volume mount for uploads persistence

**Frontend Dockerfile:**
- Multi-stage build (builder + nginx)
- Nginx Alpine for small image size
- Gzip compression enabled
- Security headers configured
- SPA routing support
- Health check configuration

## Database Integration (Future)

The current implementation uses in-memory storage. To integrate MySQL:

1. **Install MySQL driver:**
   ```bash
   npm install mysql2
   ```

2. **Create database connection:**
   Create `backend/src/models/db.js` with your MySQL connection

3. **Update data store queries:**
   Replace in-memory data store queries with SQL queries

4. **Run migrations:**
   Create tables using SQL migrations

**Example table structure:**
- `users` - Store user accounts
- `schools` - Store school information
- `attendance` - Store attendance records
- `grs` - Store government resolutions
- `events` - Store event information
- `meetings` - Store meeting schedules
- `forms` - Store dynamic forms
- `form_responses` - Store form submissions
- `notifications` - Store user notifications

## Production Checklist

Before deploying to production, ensure:

### Security
- [ ] Environment variables are properly configured (not in code)
- [ ] CORS is restricted to trusted domains only
- [ ] JWT secrets are strong and unique
- [ ] File uploads are validated and stored securely
- [ ] API rate limiting is configured
- [ ] Security headers are in place (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] HTTPS is enforced (use reverse proxy/load balancer)
- [ ] Database credentials are secure
- [ ] Regular security audits are scheduled

### Performance
- [ ] Frontend is built and optimized (`npm run build`)
- [ ] Images and assets are compressed
- [ ] Caching headers are configured
- [ ] API responses are paginated for large datasets
- [ ] Database indexes are created
- [ ] CDN is configured for static assets
- [ ] Load balancing is set up if needed

### Monitoring & Logging
- [ ] Error logging is configured
- [ ] Health checks are monitored
- [ ] Application metrics are tracked
- [ ] Log aggregation is set up
- [ ] Alerting system is in place
- [ ] Backup strategy is implemented

### Deployment
- [ ] Database is migrated (if applicable)
- [ ] Docker images are built and tested
- [ ] Environment files are properly configured
- [ ] Volumes/persistent storage is set up
- [ ] Reverse proxy/load balancer is configured
- [ ] SSL certificates are installed
- [ ] DNS is properly configured
- [ ] Automated backups are scheduled

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Check which process is using the port
# Linux/Mac:
lsof -i :5000
# Windows:
netstat -ano | findstr :5000

# Change ports in docker-compose.yml
```

**Container won't start:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild images
docker-compose build --no-cache

# Start with verbose output
docker-compose up
```

**Permission issues:**
```bash
# Fix volume permissions
docker-compose exec backend chown -R nodejs:nodejs /app/uploads
```

### Application Issues

**API connection errors:**
- Ensure backend container is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Verify API URL is correct in frontend configuration
- Test API directly: `curl http://localhost:5000/api/health`

**File upload not working:**
- Check upload directory permissions
- Verify upload volume is mounted correctly
- Check file size limits in nginx.conf
- Review multer configuration in backend

**Frontend not loading:**
- Clear browser cache (Ctrl+Shift+Del)
- Check frontend logs: `docker-compose logs frontend`
- Verify Nginx is running: `docker-compose logs frontend`
- Test API proxy: `curl http://localhost:3000/api/health`

**Database connection issues (if using MySQL):**
- Verify database is running and accessible
- Check credentials in .env file
- Review MySQL error logs
- Test connection: `mysql -u user -p password -h host`

## Image Assets & File Uploads

### Supported File Types

**Images:**
- JPG, JPEG, PNG, GIF, WebP
- Maximum size: 100MB (configurable in nginx.conf)

**Documents:**
- PDF (for Government Resolutions)
- XLSX (exported reports)

### Upload Paths

```
uploads/
├── events/          # Event photos
├── gr/              # Government Resolutions PDFs
├── meetings/        # Meeting attachments
├── reports/         # Report documents
├── schools/         # School logos/images
├── staff/           # Staff photos
├── toppers/         # Toppers images
└── users/           # User avatars
```

### Image Optimization

All images in the application are optimized for web:
- Responsive design (mobile-first)
- Lazy loading supported
- Fallback for missing images
- Compression applied in nginx

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Admin login works
- [ ] Headmaster login works
- [ ] Invalid credentials show error
- [ ] Logout works correctly
- [ ] Session persists on page refresh

**Core Features:**
- [ ] Dashboard loads all data
- [ ] Attendance records display correctly
- [ ] Charts render properly
- [ ] Buttons trigger correct actions
- [ ] File uploads work
- [ ] File downloads work
- [ ] Notifications appear

**UI/UX:**
- [ ] Responsive design on mobile/tablet/desktop
- [ ] All images load correctly
- [ ] Language switching works (English/Marathi)
- [ ] Loading states display
- [ ] Error messages are clear
- [ ] Forms validate input

**Performance:**
- [ ] Page loads within 3 seconds
- [ ] No console errors
- [ ] Smooth scrolling
- [ ] No memory leaks

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `MAX_FILE_SIZE` | Max upload file size | `10485760` |

### Frontend (.env.local)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_APP_NAME` | Application name | `Scholastic Archive` |

## Performance Optimization

### Frontend Optimizations
- Code splitting and lazy loading
- Image compression and WebP support
- CSS minification and tree-shaking
- Gzip compression for static assets
- Browser caching with service workers

### Backend Optimizations
- Response compression (gzip)
- Connection pooling
- Request/response caching
- Query optimization
- Rate limiting

### Docker Optimizations
- Multi-stage builds reduce image size
- Alpine Linux for minimal footprint
- Layer caching for faster builds
- Non-root user execution reduces attack surface

## Scaling Considerations

For production at scale:

1. **Database:** Migrate to MySQL/PostgreSQL
2. **Caching:** Implement Redis for session/data caching
3. **Load Balancing:** Use Nginx or HAProxy in front of multiple backend instances
4. **File Storage:** Use S3 or similar for scalable file storage
5. **CDN:** Serve static assets from CDN
6. **Monitoring:** Implement APM (Application Performance Monitoring)
7. **Containerization:** Use Kubernetes for orchestration at scale

## License

MIT

## Support

For support or inquiries, contact the development team.
