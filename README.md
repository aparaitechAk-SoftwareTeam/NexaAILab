# NexaAI Lab Full Stack EdTech Platform

A complete, modern, production-grade fullstack web application for NexaAI Lab, featuring:
- **Public Website** (`frontend/`) — React + Vite on `http://localhost:5173`
- **REST API Backend** (`backend/`) — Node.js + Express on `http://localhost:5000` (supports MongoDB + automatic embedded JSON fallback)
- **Admin Dashboard** (`admin/`) — React + Vite on `http://localhost:5174`

---

## Key Highlights

1. **All Pages & Real Links Working**:
   - **Home**: Hero with NASSCOM FutureSkills Prime & AI Industry Council accreditations, Free Masterclass card with 3 preview tracks, Course tabs, Recruiter logos (EY, BCG, Fractal, Flipkart, Bluepi, Conviva), Career comparison (Aspiring Students vs Working Professionals), Cyan 3D CTA banner, Learning Modes, Stats banner, Real stories & Student Quote carousel, Request a Callback form, Industry whitepapers, and FAQs.
   - **Explore Courses**: Filterable catalog with keyword search, category pills, tools covered, syllabus breakdown, fees, and enrollment.
   - **Upcoming Batches**: Complete timetable by campus (Bangalore, Gurgaon, Noida, Interactive Live Online) with seat counters.
   - **Why Us**: 14-year legacy, placement assurance, 1-on-1 mentorship, and faculty philosophy.
   - **For Corporates**: Enterprise workforce upskilling and custom proposal inquiry form.
   - **Blog / Reports**: Industry research whitepapers with download & preview modal.
   - **Contact Us**: Campus locations, phone helpline (`+91 72188 02129`), and interactive callback form.

2. **Interactive Features & Modals**:
   - **Course Details Modal**: Curriculum modules, tools covered, upcoming batches, and syllabus download.
   - **Free Masterclass Reservation**: Select from 3 tracks with instant confirmation pass.
   - **Talk to Counselor Modal**: 1-on-1 career consultation booking with preferred slot selection.
   - **Student Auth Modal**: Sign In & Create Account tabs with local profile session.
   - **AI Admissions Assistant**: Floating bottom-right chatbot with instant prompt suggestions.
   - **Quick Floating Actions**: Call button, AI Chatbot button, and Smooth Back-to-Top.

3. **Zero-Crash Resilient Backend**:
   - Automatically connects to **MongoDB** if available.
   - If MongoDB is offline, it seamlessly activates the **embedded persistent JSON store** (`backend/data/store.json`).
   - Automatically seeds initial courses, testimonials, reports, FAQs, and the super admin account on first launch.

4. **Complete Admin Dashboard**:
   - **Dashboard**: High-level metrics, system status, and recent leads feed.
   - **Courses Management**: Add new courses, edit courses, delete, manage batch schedules.
   - **Leads Management**: Filter by status (`New`, `Contacted`, `Qualified`, `Closed`), view details, update status inline, delete leads.
   - **Testimonials, Reports & FAQs Management**: Add, update, and remove content dynamically.
   - **One-Click Auto-Fill**: Test login credentials instantly on the login page.

---

## Quick Start

### 1-Click Launch (Windows)
Double-click `start-windows.bat` in the project root:
```cmd
start-windows.bat
```

### Manual Launch

#### Terminal 1 — Backend
```bash
cd backend
npm install
npm run dev
```
Runs at: `http://localhost:5000`

#### Terminal 2 — Public Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at: `http://localhost:5173`

#### Terminal 3 — Admin Frontend
```bash
cd admin
npm install
npm run dev
```
Runs at: `http://localhost:5174`

---

## Default Admin Credentials
- **Email**: `admin@example.com`
- **Password**: `Admin@123`
*(A convenient "Auto-fill Demo Credentials" button is also provided on the admin login screen)*
