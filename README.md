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

- **Frontend**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS v3](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) + [Recharts](https://recharts.org/)
- **Backend**: [Python 3.10+](https://www.python.org/) + [Django 5](https://www.djangoproject.com/) + [Django REST Framework](https://www.django-rest-framework.org/) + [django-cors-headers](https://github.com/adamchainz/django-cors-headers)

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0 or higher) & [npm](https://www.npmjs.com/)
- [Python](https://www.python.org/) (v3.10 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/Umesh123971/Veterinary-AI-Diagnostics.git
cd Veterinary-AI-Diagnostics
```

---

### 2. Backend Setup (Django REST API)

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed initial clinical demo data
python seed_data.py

# Start Django development server
python manage.py runserver 8000
```
Backend API will be running at `http://localhost:8000/api/` (Admin at `http://localhost:8000/admin/`).

---

### 3. Frontend Setup (React + Vite)

In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build Frontend for Production
```bash
cd frontend
npm run build
```
The compiled static assets will be output in `frontend/dist/`.

---

## 📁 Project Structure

```
vetai-diagnostic-system/
├── backend/                  # Django REST Framework backend
│   ├── analytics/            # Analytics aggregation endpoints
│   ├── diagnostics/          # Multi-modal patient cases & AI models
│   ├── notifications/        # Real-time alert notifications
│   ├── users/                # Role-based user accounts & authentication
│   ├── vetai_backend/        # Django project settings and URLs
│   ├── manage.py
│   ├── requirements.txt
│   └── seed_data.py
│
├── frontend/                 # React + Vite frontend application
│   ├── src/
│   │   ├── components/       # Charts, common UI, diagnosis widgets
│   │   ├── context/          # Global AppContext state management
│   │   ├── data/             # Fallback mock data schemas
│   │   ├── layouts/          # Main Dashboard layout shell
│   │   ├── pages/            # Admin, Doctor, Technician & Patient pages
│   │   ├── routes/           # Role-based route definitions
│   │   ├── services/         # API integration layer (api.js)
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore                # Global gitignore for frontend and backend
└── README.md
```

---

## 📜 License

This project is open-source and available for educational and research purposes.
