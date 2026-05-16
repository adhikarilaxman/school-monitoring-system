# Scholastic Archive - School Monitoring System   

A production-ready multi-role web application for managing a school cluster system under a central authority.

## Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React 18, Vite | UI built with Tailwind CSS, Chart.js for analytics |
| **Backend** | Node.js, Express | RESTful API server |
| **Database** | In-memory | Mock data store (Ready for MySQL) |
| **Storage** | Local Filesystem | Multer for handling file uploads (PDFs, Images) |
| **Auth** | JWT & Bcrypt | Role-based access control |
| **Deployment**| Docker, Nginx | Multi-stage Dockerized containers |

## How to Run in Docker (Recommended)

1. Clone the repository and navigate to the root directory.
2. Ensure you have Docker and Docker Compose installed.
3. Run the following command to build and start the containers:
   ```bash
   docker-compose up -d --build
   ```
4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
5. To stop the application, run:
   ```bash
   docker-compose down
   ```

## How to Run Locally (Without Docker)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend will run on http://localhost:5000*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on http://localhost:3000*

## Login Credentials

**Admin (Kendrapramukh)**
- **Email:** `kendrapramukh@eduauthority.gov.in`
- **Password:** `admin123`

**Headmasters (12 Schools)**
- **Email:** `headmaster1@school.edu` (up to `headmaster12@school.edu`)
- **Password:** `headmaster123`
