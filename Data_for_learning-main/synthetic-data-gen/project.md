# SyntheticEngine

**SyntheticEngine** is a powerful, AI-driven synthetic data generation platform designed to help developers, data scientists, and QA engineers quickly build realistic, highly-relational datasets for testing and development.

## 🚀 Key Features

### 1. Intuitive Schema Canvas
- **Spreadsheet-style Interface:** A full-width, Mockaroo-inspired workspace for quickly defining tables, fields, data types, and blank percentages.
- **Advanced Field Configuration:** Slide-in settings panel to define prefixes, suffixes, data subtypes, and specific constraints for individual fields.
- **State Management:** Seamless row-level management (add, duplicate, delete) powered by Zustand.

### 2. AI Schema Builder
- **Prompt-to-Schema:** Powered by Google Gemini 1.5 Flash. Users can type a natural language prompt (e.g., "An e-commerce system with Users, Orders, and Products"), and the AI will automatically design the tables, fields, and relationships.
- **Smart Mapping:** Automatically maps the AI-generated fields to the correct internal data generators.

### 3. Visual Relationship Graph
- **Interactive Diagram:** A stunning, glassmorphic node-based graph view that visualizes Primary Key (PK) to Foreign Key (FK) relationships.
- **Premium Aesthetics:** Features glowing Bezier curves, drop shadows, and dark-mode styling for a highly professional look.
- **Auto-linking:** Effortlessly connect parent tables to child tables to enforce referential integrity.

### 4. Robust Backend Generation Engine
- **Referential Integrity:** The backend strictly honors PK/FK relationships. If a `User` has `Orders`, the foreign keys will match perfectly, and the generation order is topologically sorted.
- **Fallback Mechanisms:** Robust error handling that falls back to default text generators if an invalid type is requested, preventing server crashes.
- **High Performance:** Built on Python, FastAPI, Pandas, and Numpy for incredibly fast batch generation of thousands of rows.

### 5. Industry-Specific Templates
Pre-built, production-ready schemas available directly from the landing page:
- 🛒 **E-commerce System** (Users, Products, Orders, Reviews)
- 🎓 **Student Management** (Students, Courses, Enrollments)
- 📡 **IoT Sensor Network** (Devices, Readings)
- 🏥 **Healthcare EMR** (Patients, Doctors, Appointments)
- 🏦 **Banking & Finance** (Customers, Accounts, Transactions)
- ☁️ **B2B SaaS Platform** (Organizations, Users, Subscriptions)
- 👥 **HR & Payroll** (Departments, Employees, Payroll)
- 🚚 **Logistics & Fleet** (Warehouses, Vehicles, Shipments)

### 6. Local Storage & Schema Management
- **Save & Load:** Built-in dashboard header tool to save work-in-progress schemas directly to the browser's local storage and load them back instantly.

### 7. Preview & Export
- **Live Preview:** Quickly generate and preview 10 rows of data per table directly in the UI.
- **Flexible Exports:** Supports exporting the generated data to **CSV**, **JSON**, **Excel**, or **SQL** (INSERT statements), with configurable delimiters and quote characters.

---

## 🛠️ Technology Stack

**Frontend:**
- Next.js (React)
- TailwindCSS (Styling)
- Framer Motion (Animations)
- Zustand (State Management)
- Lucide React (Icons)
- dnd-kit (Drag and Drop functionality)

**Backend:**
- FastAPI (Python API)
- Uvicorn (ASGI Server)
- Pandas & Numpy (Data manipulation and distributions)
- Faker (Synthetic text/data generation)
- Google Generative AI (Gemini integration)
- python-dotenv (Environment management)

---

## 🔮 Future Architecture & Extensibility
The pipeline is designed with a 6-stage extensible architecture:
1. Base Generation (Faker/Providers)
2. Distribution Application (Normal, Uniform, Exponential curves)
3. Noise Injection (Simulating messy data)
4. Missing Value Injection (MCAR or Block missingness)
5. Validation Engine
6. Final Formatting
