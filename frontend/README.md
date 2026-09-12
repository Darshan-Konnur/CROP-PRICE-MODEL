# KrishiPrice AI — Crop Modal Price Prediction Frontend

A modern, production-ready React + Vite + Tailwind dashboard for APMC Mandi crop price forecasting powered by Machine Learning.

---

## 🚀 Quick Start (Local Development)

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   The frontend runs at: [http://localhost:5174](http://localhost:5174)

3. **Start FastAPI backend (in another terminal)**:
   ```bash
   uvicorn app:app --reload --port 8000
   ```

---

## 🌐 Connecting to Deployed Backend

You can connect to your deployed ML backend in two easy ways:

### Option 1: In-App Connection Dialog (No rebuild required)
1. Open the frontend in your browser.
2. Click **"Connect Backend"** in the top navigation bar.
3. Paste your deployed API base URL (e.g. `https://crop-price-api.onrender.com` or `http://localhost:8000`).
4. Click **"Test Ping"** to verify connection, then click **"Save Connection"**.
5. Your custom URL is saved in `localStorage` and will persist across refreshes!

### Option 2: Environment Variable
Create or edit `.env` in the `frontend/` folder:
```env
VITE_API_BASE=https://crop-price-api.onrender.com
```

---

## 🚢 Deploying the Frontend

### Method A: Deploy to Vercel (1-Click & Free)
1. Push your project to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In Project Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Environment Variable**: `VITE_API_BASE` = `https://your-deployed-backend-url`
4. Click **Deploy**. Vercel will build and serve your app globally with HTTPS!

### Method B: Deploy to Netlify (Drag & Drop or Git)
1. Run `npm run build` inside `frontend`.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the `frontend/dist` directory.
4. Your frontend is live immediately!

---

## ✨ Features
- **Smart Crop & Market Selector**: Quick presets for crops (Tomato, Wheat, Onion, Potato, Rice, etc.) and regional mandis (Davangere, Nashik, Pune, Mumbai, etc.).
- **Live Connection Monitor**: Real-time health badge (🟢 Connected / 🟡 Checking / 🔴 Offline).
- **Interactive Price Chart**: SVG trend line plotting historical data transitioning to the predicted future price.
- **Price Breakdown**: Displays price in ₹/Quintal and ₹/kg, along with expected trading bands.
- **Agricultural Advisory**: Market timing advice based on projected price momentum.
- **Demo / Fallback Mode**: Test the UI with simulated realistic data even when backend is offline.
- **Print & Export**: One-click printable report slips and clipboard copy formatted for SMS/WhatsApp.
- **Prediction History**: Persists previous lookups in `localStorage` for easy comparison.
