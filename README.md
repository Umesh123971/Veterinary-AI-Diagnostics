# 🐾 VetAI - Multi-Modal Veterinary Diagnostic System

An advanced, role-based web platform designed for AI-assisted veterinary diagnostics. **VetAI** integrates multi-modal data inputs—including clinical symptoms, microscopic imagery, and Complete Blood Count (CBC) laboratory metrics—to provide intelligent diagnostic recommendations, automated risk assessments, and clinical decision support for veterinary medical professionals.

---

## 🌟 Key Features

### 👤 Role-Based Dashboards & Workflows
- **Administrator Dashboard**:
  - System performance analytics and diagnostic volume monitoring.
  - Comprehensive user account management (Doctors, Technicians, Admins).
- **Veterinary Technician Workflow**:
  - **Patient Onboarding Wizard**: Step-by-step registration of patient clinical history and metadata.
  - **Diagnostic Data Upload**: Multi-modal upload interface for microscopic slides and CBC lab values.
  - **Re-Diagnosis Portal**: Submit follow-up analyses and request re-assessments.
- **Veterinary Doctor / Clinician Review**:
  - Clinical review interface with confidence scoring and disease probability breakdowns.
  - Doctor feedback loop for AI diagnostic verification and diagnostic override.

---

### 🧬 Multi-Modal AI Diagnostic Engine
- **Clinical Data Fusion**: Combines patient demography, historical vitals, and presenting symptoms.
- **Microscopic Image Annotator**: Interactive image visualizer with annotated regions of interest.
- **CBC Lab Analysis**: Automated lab value range checking and graphical visualization.
- **Ensemble Risk Scoring**: Multi-disease probability classification and multi-modal fusion scoring.

---

### 📊 Reports & Interactive Analytics
- **Interactive Visualizations**: Powered by Recharts for disease distribution, outcome tracking, and monthly diagnostic volume.
- **PDF Report Viewer**: Native report previewer modal and export functionality for veterinary records.
- **Patient History Records**: Detailed timeline of past consultations, treatments, and diagnostic iterations.

---

## 🛠️ Technology Stack

- **Frontend Core**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Styling & UI**: [Tailwind CSS v3](https://tailwindcss.com/) + PostCSS + Autoprefixer
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v8.0 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/Umesh123971/Veterinary-AI-Diagnostics.git
cd Veterinary-AI-Diagnostics
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
The compiled output will be generated in the `dist/` directory.

---

## 📁 Project Structure

```
vetai-diagnostic-system/
├── src/
│   ├── components/
│   │   ├── charts/           # CBC, Disease Distribution & Outcome Charts
│   │   ├── common/           # Reusable UI components (Buttons, Badges, Modals)
│   │   ├── diagnosis/        # Microscopic Annotator, Fusion Cards, Workflow Diagrams
│   │   ├── layout/           # Top Navigation & Sidebar
│   │   └── users/            # User Management components
│   ├── context/              # Global AppContext state management
│   ├── data/                 # Diagnostic mock data & reference schemas
│   ├── layouts/              # Main Dashboard Layout Shell
│   ├── pages/
│   │   ├── admin/            # Admin Dashboard & User Management
│   │   ├── auth/             # Authentication & Login Page
│   │   ├── diagnosis/        # Diagnostic Workflows & Results Pages
│   │   ├── doctor/           # Doctor Review & Decision Support
│   │   ├── patients/         # Patient Lists & Detail Pages
│   │   ├── profile/          # User Profile Settings
│   │   ├── reports/          # Diagnostic Reports Catalog & Viewer
│   │   └── technician/       # Technician Dashboard & Patient Wizard
│   ├── routes/               # AppRoutes & Role-based redirect logic
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── public/
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 📜 License

This project is open-source and available for educational and research purposes.
