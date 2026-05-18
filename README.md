<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/SaaS-Platform-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

# 🏥 MedFlow AI — Clinic Management + Smart Diagnosis SaaS

> A modern, AI-powered Clinic Management SaaS platform that digitizes clinic operations, improves efficiency, and provides intelligent AI-assisted diagnosis for doctors and patients.

**Live Demo:** [https://medflow-ai.vercel.app](https://medflow-ai.vercel.app)  
**Demo Video:** [YouTube / LinkedIn Demo](#)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [User Roles](#-user-roles)
- [AI Features](#-ai-features)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [SaaS Plans](#-saas-subscription-plans)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

**MedFlow AI** is a full-stack SaaS platform built with the MERN stack that transforms how small and medium clinics operate. It replaces paper-based workflows with a modern digital system and augments doctor decision-making with AI-powered diagnosis assistance.

---

## ❌ Problem Statement

Small and medium clinics still suffer from:

| Problem | Impact |
|---------|--------|
| Paper-based prescriptions | Data loss, illegibility |
| Manual patient records | Time waste, duplication |
| No digital appointment tracking | Scheduling conflicts |
| No analytics or reporting | Zero performance visibility |
| No AI support for diagnosis | Missed patterns, slower care |

---

## ✅ Solution

MedFlow AI addresses every pain point:

- **Digital Patient Records** — Searchable, secure, always accessible
- **Smart Appointments** — Book, track, and manage with real-time status
- **AI-Powered Diagnosis** — Symptom analysis, risk flagging, predictive analytics
- **PDF Prescriptions** — Generate, download, and share digitally
- **Analytics Dashboards** — Real-time insights for admins and doctors
- **SaaS Model** — Subscription-based access with feature gating

---

## 🏗 Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Admin   │ │  Doctor  │ │Reception │ │    Patient        │   │
│  │Dashboard │ │Dashboard │ │Dashboard │ │    Portal         │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘   │
│       └─────────────┴────────────┴────────────────┘             │
│                          │ Axios HTTP                           │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx /   │
                    │   Vercel    │
                    │  (Reverse   │
                    │   Proxy)    │
                    └──────┬──────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    SERVER (Node.js + Express)                   │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │  Auth       │  │  Route       │  │   Middleware        │     │
│  │  (JWT)      │  │  Handlers    │  │  (RBAC, Validate)  │     │
│  └──────┬──────┘  └──────┬───────┘  └────────┬───────────┘     │
│         └────────────────┼───────────────────┘                  │
│                          │                                      │
│  ┌───────────────────────▼──────────────────────────────────┐   │
│  │                  Service Layer                           │   │
│  │  ┌──────────┐ ┌───────────┐ ┌────────┐ ┌─────────────┐  │   │
│  │  │ Patient  │ │Appointment│ │Prescrip│ │  Analytics   │  │   │
│  │  │ Service  │ │  Service  │ │Service │ │  Service     │  │   │
│  │  └──────────┘ └───────────┘ └────────┘ └─────────────┘  │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                       │
│  ┌──────────────────────▼───────────────────────────────────┐   │
│  │                    AI Layer                              │   │
│  │  ┌──────────────┐ ┌────────────┐ ┌───────────────────┐  │   │
│  │  │  Symptom     │ │Prescription│ │  Risk Flagging     │  │   │
│  │  │  Checker     │ │ Explainer  │ │  + Predictive      │  │   │
│  │  │  (Gemini)    │ │ (Gemini)   │ │  Analytics         │  │   │
│  │  └──────────────┘ └────────────┘ └───────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
   │  MongoDB    │ │ Cloudinary  │ │ Gemini API  │
   │  Atlas      │ │ (Storage)   │ │ (AI Engine) │
   └─────────────┘ └─────────────┘ └─────────────┘
```

### Request Flow

```
Client Request
     │
     ▼
Rate Limiter → CORS → Body Parser
     │
     ▼
Auth Middleware (JWT Verify)
     │
     ▼
RBAC Middleware (Role Check)
     │
     ▼
Input Validation (Joi/Express-Validator)
     │
     ▼
Route Controller
     │
     ▼
Service Layer → (AI Service if needed)
     │
     ▼
Database (Mongoose ODM → MongoDB)
     │
     ▼
Response → Client
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Library |
| Vite | Build Tool |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Recharts | Analytics charts |
| React-PDF | Prescription PDF generation |
| React Hook Form | Form management |
| React Hot Toast | Notifications |
| CSS Modules | Scoped styling |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB + Mongoose | Database + ODM |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Joi | Request validation |
| Multer + Cloudinary | File uploads |
| PDFKit | Server-side PDF generation |
| node-cron | Scheduled tasks |
| helmet + cors | Security |

### AI / External APIs
| Technology | Purpose |
|------------|---------|
| Google Gemini API | AI diagnosis + explanations |
| Nodemailer | Email notifications |

### DevOps
| Technology | Purpose |
|------------|---------|
| Vercel | Frontend deployment |
| Render | Backend deployment |
| MongoDB Atlas | Cloud database |
| GitHub Actions | CI/CD (optional) |

---

## ✨ Features

### Core Features

- ✅ **Authentication & Authorization** — JWT login, role-based dashboards, protected routes
- ✅ **Patient Management** — CRUD operations, medical history timeline
- ✅ **Appointment System** — Book, cancel, update status (pending → confirmed → completed)
- ✅ **Prescription System** — Add medicines, dosage, notes, generate & download PDF
- ✅ **Medical History Timeline** — Full patient journey with timestamps
- ✅ **Analytics Dashboards** — Admin & doctor level insights with charts

### AI-Powered Features

- 🤖 **Smart Symptom Checker** — AI analyzes symptoms, age, gender, history → returns conditions, risk, tests
- 🤖 **Prescription Explainer** — Patient-friendly explanation with lifestyle tips
- 🤖 **Risk Flagging** — Detects repeated infections, chronic symptoms, high-risk combos
- 🤖 **Predictive Analytics** — Monthly disease trends, patient load forecast, doctor performance

> ⚠️ **Graceful Degradation:** If AI API fails, the system continues to function normally with all core features.

---

## 👥 User Roles

### 🔴 Admin
- Manage doctors & receptionists
- View system-wide analytics
- Manage subscription plans
- Monitor system usage

### 🔵 Doctor
- View assigned appointments
- Access patient history
- Add diagnosis & prescriptions
- Use AI-assisted diagnosis
- View personal performance stats

### 🟢 Receptionist
- Register new patients
- Book & manage appointments
- Update patient information
- Manage daily schedule

### 🟡 Patient
- Secure login & profile
- View appointment history
- View & download prescriptions (PDF)
- See AI-generated health explanations

---

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    Users     │       │   Appointments   │       │  Prescriptions   │
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ _id          │◄──┐   │ _id              │   ┌──►│ _id              │
│ name         │   │   │ patientId ───────┼───┤   │ patientId        │
│ email        │   ├───┤ doctorId         │   │   │ doctorId         │
│ password     │   │   │ date             │   │   │ appointmentId    │
│ role         │   │   │ timeSlot         │   │   │ medicines[]      │
│ phone        │   │   │ status           │   │   │  ├─ name         │
│ avatar       │   │   │ notes            │   │   │  ├─ dosage       │
│ subscription │   │   │ createdAt        │   │   │  ├─ frequency    │
│ isActive     │   │   └──────────────────┘   │   │  └─ duration     │
│ createdAt    │   │                          │   │ instructions     │
└──────────────┘   │   ┌──────────────────┐   │   │ aiExplanation    │
                   │   │    Patients      │   │   │ createdAt        │
                   │   ├──────────────────┤   │   └──────────────────┘
                   │   │ _id              │◄──┘
                   │   │ name             │       ┌──────────────────┐
                   │   │ age              │       │ DiagnosisLogs    │
                   │   │ gender           │       ├──────────────────┤
                   │   │ contact          │       │ _id              │
                   │   │ email            │       │ patientId        │
                   └───┤ createdBy        │       │ doctorId         │
                       │ bloodGroup       │       │ symptoms[]       │
                       │ allergies[]      │       │ aiResponse       │
                       │ medicalHistory   │       │ conditions[]     │
                       │ createdAt        │       │ riskLevel        │
                       └──────────────────┘       │ suggestedTests[] │
                                                  │ createdAt        │
                                                  └──────────────────┘
```

### Mongoose Models

#### User Model
```javascript
{
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  password:         { type: String, required: true },
  role:             { type: String, enum: ['admin', 'doctor', 'receptionist', 'patient'] },
  phone:            { type: String },
  avatar:           { type: String },
  specialization:   { type: String },  // doctors only
  subscriptionPlan: { type: String, enum: ['free', 'pro'], default: 'free' },
  isActive:         { type: Boolean, default: true },
  createdAt:        { type: Date, default: Date.now }
}
```

#### Patient Model
```javascript
{
  name:           { type: String, required: true },
  age:            { type: Number, required: true },
  gender:         { type: String, enum: ['male', 'female', 'other'] },
  contact:        { type: String, required: true },
  email:          { type: String },
  bloodGroup:     { type: String },
  allergies:      [{ type: String }],
  medicalHistory: { type: String },
  address:        { type: String },
  createdBy:      { type: ObjectId, ref: 'User' },
  userId:         { type: ObjectId, ref: 'User' },  // linked patient account
  createdAt:      { type: Date, default: Date.now }
}
```

#### Appointment Model
```javascript
{
  patientId:  { type: ObjectId, ref: 'Patient', required: true },
  doctorId:   { type: ObjectId, ref: 'User', required: true },
  date:       { type: Date, required: true },
  timeSlot:   { type: String, required: true },
  status:     { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  notes:      { type: String },
  createdBy:  { type: ObjectId, ref: 'User' },
  createdAt:  { type: Date, default: Date.now }
}
```

#### Prescription Model
```javascript
{
  patientId:     { type: ObjectId, ref: 'Patient', required: true },
  doctorId:      { type: ObjectId, ref: 'User', required: true },
  appointmentId: { type: ObjectId, ref: 'Appointment' },
  medicines: [{
    name:      { type: String, required: true },
    dosage:    { type: String, required: true },
    frequency: { type: String, required: true },
    duration:  { type: String, required: true }
  }],
  instructions:  { type: String },
  aiExplanation: { type: String },
  pdfUrl:        { type: String },
  createdAt:     { type: Date, default: Date.now }
}
```

#### DiagnosisLog Model
```javascript
{
  patientId:      { type: ObjectId, ref: 'Patient' },
  doctorId:       { type: ObjectId, ref: 'User', required: true },
  symptoms:       [{ type: String, required: true }],
  age:            { type: Number },
  gender:         { type: String },
  patientHistory: { type: String },
  aiResponse:     { type: String },
  conditions:     [{ name: String, probability: String }],
  riskLevel:      { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  suggestedTests: [{ type: String }],
  createdAt:      { type: Date, default: Date.now }
}
```

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:5000/api/v1
Production:  https://medflow-api.onrender.com/api/v1
```

### Authentication Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/me` | Get current user | Authenticated |
| PUT | `/auth/update-profile` | Update profile | Authenticated |
| PUT | `/auth/change-password` | Change password | Authenticated |

### Patient Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/patients` | List all patients | Admin, Doctor, Receptionist |
| GET | `/patients/:id` | Get patient details | Admin, Doctor, Receptionist |
| POST | `/patients` | Create patient | Receptionist |
| PUT | `/patients/:id` | Update patient | Receptionist |
| GET | `/patients/:id/timeline` | Medical history timeline | Doctor, Patient |

### Appointment Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/appointments` | List appointments | Role-filtered |
| POST | `/appointments` | Book appointment | Receptionist, Patient |
| PUT | `/appointments/:id` | Update appointment | Doctor, Receptionist |
| PUT | `/appointments/:id/status` | Update status | Doctor |
| GET | `/appointments/doctor/:id` | Doctor schedule | Doctor |

### Prescription Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/prescriptions` | List prescriptions | Role-filtered |
| POST | `/prescriptions` | Create prescription | Doctor |
| GET | `/prescriptions/:id` | Get prescription | Doctor, Patient |
| GET | `/prescriptions/:id/pdf` | Download PDF | Doctor, Patient |

### AI Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/ai/symptom-check` | Smart symptom analysis | Doctor |
| POST | `/ai/explain-prescription` | Generate explanation | Doctor |
| GET | `/ai/risk-flags/:patientId` | Patient risk flags | Doctor |
| GET | `/ai/predictive-analytics` | Predictive insights | Admin |

### Analytics Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/analytics/admin` | Admin dashboard stats | Admin |
| GET | `/analytics/doctor` | Doctor personal stats | Doctor |
| GET | `/analytics/common-diagnosis` | Top diagnoses | Admin |
| GET | `/analytics/patient-load` | Load forecast | Admin |

---

## 📁 Project Structure

```
AI_Clinic_Management/
├── frontend/                    # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Images, icons, fonts
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/          #   Buttons, Inputs, Modal, Loader
│   │   │   ├── layout/          #   Sidebar, Header, DashboardLayout
│   │   │   ├── charts/          #   Chart wrapper components
│   │   │   └── pdf/             #   Prescription PDF template
│   │   ├── pages/               # Route-level pages
│   │   │   ├── auth/            #   Login, Register
│   │   │   ├── admin/           #   Admin Dashboard, Manage Doctors
│   │   │   ├── doctor/          #   Doctor Dashboard, Diagnosis
│   │   │   ├── receptionist/    #   Receptionist Dashboard
│   │   │   └── patient/         #   Patient Portal
│   │   ├── context/             # React Context (Auth, Theme)
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API service functions (Axios)
│   │   ├── utils/               # Helpers, constants, formatters
│   │   ├── styles/              # Global CSS, variables, themes
│   │   ├── App.jsx              # Root component + Router
│   │   └── main.jsx             # Entry point
│   ├── .env                     # Frontend env variables
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/              # DB connection, env config
│   │   │   ├── db.js
│   │   │   └── cloudinary.js
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Patient.js
│   │   │   ├── Appointment.js
│   │   │   ├── Prescription.js
│   │   │   └── DiagnosisLog.js
│   │   ├── routes/              # Express route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── patientRoutes.js
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── prescriptionRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   └── analyticsRoutes.js
│   │   ├── controllers/         # Route handler logic
│   │   │   ├── authController.js
│   │   │   ├── patientController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── prescriptionController.js
│   │   │   ├── aiController.js
│   │   │   └── analyticsController.js
│   │   ├── middleware/          # Custom middleware
│   │   │   ├── auth.js          #   JWT verification
│   │   │   ├── rbac.js          #   Role-based access
│   │   │   ├── validate.js      #   Input validation
│   │   │   └── errorHandler.js  #   Global error handler
│   │   ├── services/            # Business logic layer
│   │   │   ├── aiService.js     #   Gemini API integration
│   │   │   ├── pdfService.js    #   PDF generation
│   │   │   └── emailService.js  #   Email notifications
│   │   └── utils/               # Helpers
│   │       ├── apiError.js
│   │       ├── apiResponse.js
│   │       └── constants.js
│   ├── server.js                # Express app entry point
│   ├── .env                     # Backend env variables
│   └── package.json
│
├── .gitignore
└── README.md                    # ← You are here
```

---

## 🚀 Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))
- Cloudinary Account ([Sign up](https://cloudinary.com))

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/medflow-ai.git
cd medflow-ai
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file (see Environment Variables section)
cp .env.example .env

# Seed admin user (optional)
npm run seed

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

### 4. Access the Application
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/medflow

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# AI - Gemini
GEMINI_API_KEY=your-gemini-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=MedFlow AI
```

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

### Backend → Render
1. Connect GitHub repo to [Render](https://render.com)
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add all environment variables
5. Deploy

### Database → MongoDB Atlas
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Whitelist IPs (or allow all: `0.0.0.0/0`)
3. Copy connection string to `MONGODB_URI`

---

## 📸 Screenshots

> _Screenshots will be added after UI implementation_

| Screen | Description |
|--------|-------------|
| Login Page | Secure role-based authentication |
| Admin Dashboard | System-wide analytics & management |
| Doctor Dashboard | Appointments, diagnosis, AI tools |
| Patient Portal | View history, download prescriptions |
| AI Symptom Checker | Smart diagnosis assistance |
| Prescription PDF | Generated prescription document |

---

## 💳 SaaS Subscription Plans

| Feature | Free Plan | Pro Plan |
|---------|-----------|----------|
| Patients | Up to 50 | Unlimited |
| Appointments | Up to 100/month | Unlimited |
| AI Symptom Checker | ❌ | ✅ |
| AI Prescription Explainer | ❌ | ✅ |
| Risk Flagging | ❌ | ✅ |
| Predictive Analytics | ❌ | ✅ |
| PDF Prescriptions | ✅ | ✅ |
| Analytics Dashboard | Basic | Advanced |
| Priority Support | ❌ | ✅ |

---

## 🗺 Future Roadmap

- [ ] SMS appointment reminders
- [ ] WhatsApp integration for notifications
- [ ] Billing & invoicing module
- [ ] Multi-language support (Urdu, Arabic)
- [ ] Telemedicine video consultations
- [ ] Mobile app (React Native)
- [ ] Lab reports upload & tracking
- [ ] Insurance claim management
- [ ] Multi-clinic support (franchise mode)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Team

| Name | Role | GitHub |
|------|------|--------|
| Your Name | Full Stack Developer | [@your-github](https://github.com/your-github) |

---

<p align="center">
  Built with ❤️ for the AI Hackathon 2026
</p>
