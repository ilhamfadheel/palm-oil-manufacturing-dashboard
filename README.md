# Palm Oil Manufacturing Dashboard

AI-powered dashboard for palm oil manufacturing optimization with real-time supply chain management and predictive analytics.

## 🚀 Quick Start

Follow these steps to run the application locally from start to finish.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Supabase CLI** - Already installed ✅
- **Git** (optional, for version control)

---

## Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note:** We use `--legacy-peer-deps` due to React 19 RC compatibility.

**Expected output:**
```
added 900+ packages in 30s
```

---

## Step 2: Start Supabase Local Instance

```bash
supabase start
```

**Expected output:**
```
Started supabase local development setup.

API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Important:** Keep this terminal window open. Supabase needs to run in the background.

---

## Step 3: Verify Environment Variables

Check that `.env.local` exists and contains:

```bash
cat .env.local
```

**Should show:**
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Note:** These values are from when you run `supabase start`.

---

## Step 4: Apply Database Migrations

```bash
supabase db reset
```

**Expected output:**
```
Resetting local database...
Applying migration 001_initial_schema.sql...
Applying migration 002_disable_rls_public_access.sql...
Seeding data from supabase/seed.sql...
✓ Finished supabase db reset
```

**What this does:**
- Creates all database tables (farms, warehouses, vehicles, etc.)
- Disables Row Level Security for public access
- Seeds initial test data

---

## Step 5: Start Development Server

Open a **new terminal window** (keep Supabase running) and run:

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 16.0.1-canary.6 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.1.15:3000

✓ Ready in 4.6s
```

---

## Step 6: Open the Application

Open your browser and navigate to:

**Homepage:**
```
http://localhost:3000
```

**Dashboard:**
```
http://localhost:3000/dashboard
```

**Supabase Studio (Database UI):**
```
http://localhost:54323
```

---

## Step 7: Test the AI Projection Feature

1. Go to the **Dashboard** page
2. Click the **"Generate AI Projection"** button (top right)
3. Wait 10-30 seconds for the AI model to train
4. View the 30-day forecast with:
   - Production predictions
   - Demand forecasts
   - Inventory projections
   - AI recommendations

---

## 🧪 Running Tests

### Run All Tests

```bash
npm test
```

**Expected output:**
```
Test Suites: 3 passed, 3 total
Tests:       32 passed, 32 total
Time:        0.999s
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

---

## 📁 Project Structure

```
palm-oil-manufacturing-dashboard/
├── src/
│   ├── app/                    # Next.js 16 App Router
│   │   ├── page.tsx           # Homepage
│   │   ├── dashboard/         # Dashboard page
│   │   ├── layout.tsx         # Root layout with navbar
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── charts/            # Recharts visualizations
│   │   ├── ui/                # shadcn/ui components
│   │   ├── navbar.tsx         # Global navigation
│   │   └── projection-dialog.tsx  # AI projection modal
│   ├── lib/                   # Utilities and services
│   │   ├── ai/                # AI/ML models
│   │   │   ├── time-series-model.ts      # LSTM forecaster
│   │   │   ├── projection-service.ts     # Projection service
│   │   │   └── types.ts                  # TypeScript types
│   │   ├── supabase/          # Supabase client
│   │   └── utils.ts           # Helper functions
│   └── __tests__/             # Jest tests
│       ├── components/        # Component tests
│       ├── pages/             # Page tests
│       └── lib/               # Logic tests
├── supabase/
│   ├── migrations/            # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   └── 002_disable_rls_public_access.sql
│   └── seed.sql              # Seed data
├── .env.local                # Environment variables
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind CSS config
├── jest.config.js            # Jest configuration
└── README.md                 # This file
```

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 16** (App Router with Turbopack)
- **React 19 RC**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (Radix UI components)
- **Recharts** (Data visualization)
- **Lucide React** (Icons)

### **Backend**
- **Supabase** (Local PostgreSQL database)
- **No authentication** (Public access for demo)

### **AI/ML**
- **TensorFlow.js** (LSTM neural networks)
- **Time series forecasting**
- **Trend detection**
- **Seasonality analysis**

### **Testing**
- **Jest** (Unit tests)
- **React Testing Library** (Component tests)
- **32 tests** (All passing ✅)

---

## 🎯 Key Features

### **1. Dashboard**
- Real-time KPI cards (Revenue, Production, Inventory, Orders)
- Interactive charts (Production, Demand, Inventory)
- Supply chain flow visualization

### **2. AI Projections**
- 30-day forecasts using LSTM neural networks
- Production, demand, and inventory predictions
- Trend detection (increasing/decreasing/stable)
- Confidence scoring
- Seasonality detection
- Actionable AI recommendations

### **3. Charts & Visualizations**
- Production bar chart
- Inventory area chart
- Orders pie chart
- Responsive design
- Interactive tooltips

### **4. Database**
- 13 tables for complete supply chain
- Farms, harvests, warehouses, vehicles
- Shipments, refineries, production batches
- Clients, work orders, demand forecasts
- Public access (no authentication required)

---

## 🔧 Common Commands

### **Development**
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### **Testing**
```bash
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # With coverage report
```

### **Supabase**
```bash
supabase start       # Start local instance
supabase stop        # Stop local instance
supabase status      # Check status
supabase db reset    # Reset database
```

---

## 📊 Database Schema

### **Main Tables**

1. **farms** - Farm locations and data
2. **harvests** - Harvest records
3. **harvest_forecasts** - AI predictions
4. **warehouses** - Storage facilities
5. **vehicles** - Transportation fleet
6. **shipments** - Logistics tracking
7. **refineries** - Processing plants
8. **production_batches** - Production records
9. **clients** - Customer database
10. **field_representatives** - Sales team
11. **work_orders** - Customer orders
12. **demand_forecasts** - Demand predictions
13. **excess_analysis** - Waste analysis

### **Access Database**

View and edit data in Supabase Studio:
```
http://localhost:54323
```

---

## 🚀 Deployment

### **Build for Production**

```bash
npm run build
```

### **Run Production Build Locally**

```bash
npm run start
```

---

## 📚 Documentation

### **Next.js 16**
- [Next.js Docs](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)

### **Supabase**
- [Supabase Docs](https://supabase.com/docs)
- [Local Development](https://supabase.com/docs/guides/cli/local-development)

### **TensorFlow.js**
- [TensorFlow.js Docs](https://www.tensorflow.org/js)
- [LSTM Guide](https://www.tensorflow.org/js/guide/models_and_layers)

### **Tailwind CSS**
- [Tailwind Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 📄 License

This project is for educational and demonstration purposes.
