# CareMatch RL - Full Stack Application

A complete web application demonstrating an AI-powered caregiver matching system using **Reinforcement Learning (RL)**, **Node.js**, and **React**.

## 🎯 What This Does

This full-stack application lets you:
- Submit parent childcare requests (urgency, duration, child age)
- See the RL model analyze 5 caregivers in real-time
- Get an AI-recommended best match with detailed explanation
- View all caregivers and their attributes side-by-side

**Architecture:**
```
React Frontend (Port 3000)
       ↓
Node.js Express Backend (Port 5000)
       ↓
Python PPO Model (Inference)
```

---

## 📋 Prerequisites

- **Node.js** (v14+) - [Download](https://nodejs.org)
- **Python** (v3.10+) - Already set up in the project
- **npm** - Comes with Node.js

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 3: Start Everything

**Terminal 1 - Backend (Port 5000):**
```bash
cd backend
npm start
```

You should see:
```
✓ CareMatch Backend running on http://localhost:5000
```

**Terminal 2 - Frontend (Port 3000):**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in 250 ms

  ➜  Local:   http://localhost:3000/
```

**Open your browser to [http://localhost:3000](http://localhost:3000)**

---

## 📂 Project Structure

```
carematch-rl/
├── env/                      # RL environment (Gymnasium)
│   ├── __init__.py
│   └── carematch_env.py
├── backend/                  # Node.js Express API
│   ├── package.json
│   └── server.js            # Backend server (port 5000)
├── frontend/                # React app
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx          # Main React component
│       └── index.css
├── train.py                 # Training script
├── inference.py             # Model inference for backend
├── carematch_ppo.zip        # Trained model
└── requirements.txt         # Python dependencies
```

---

## 🔧 How It Works

### 1. **Frontend (React)**
- User enters parent request parameters using sliders
- Client sends HTTP request to backend `/api/predict`
- Displays results with visualization

### 2. **Backend (Node.js)**
- Express server receives request
- Spawns Python process running `inference.py`
- Passes observation data to the trained PPO model
- Returns prediction with explanation factors
- Frontend displays results

### 3. **Model (Python)**
- Trained PPO model (10,000 timesteps)
- Observation: 38-dimensional vector
  - 3 parent features
  - 5 caregivers × 7 features each
- Action: Select caregiver (0-4)

---

## 🎮 Using the App

1. **Adjust Parent Request:**
   - Slide **Urgency**: How urgent is the booking? (0-100%)
   - Slide **Duration**: How long is needed? (0-12 hours)
   - Slide **Child Age**: Age of child? (0-18 years)

2. **Click "Find Best Caregiver"**
   - Backend calls Python model
   - Model analyzes all 5 caregivers
   - Returns best match

3. **View Results:**
   - **Recommended Match**: Highlighted caregiver with score
   - **Factor Breakdown**: How the model weighed each attribute
   - **All Caregivers**: See all 5 options with stats

---

## 📊 API Endpoints

### `GET /api/health`
Health check endpoint.
```bash
curl http://localhost:5000/api/health
```

### `GET /api/caregivers`
Get 5 random simulated caregivers.
```bash
curl http://localhost:5000/api/caregivers
```

### `POST /api/predict`
Get model prediction for a parent request.
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"urgency": 0.7, "duration": 0.5, "childAge": 0.3}'
```

Response:
```json
{
  "success": true,
  "parentRequest": {
    "urgency": 0.7,
    "duration": 0.5,
    "childAge": 0.3
  },
  "caregivers": [
    {
      "id": 0,
      "name": "Caregiver 1",
      "rating": "0.82",
      "available": 1,
      ...
    }
  ],
  "prediction": {
    "recommendedCaregiverId": 2,
    "recommendedCaregiver": { ... },
    "confidence": "0.85",
    "explanation": {
      "rating": "0.25",
      "distance": "0.18",
      ...
    },
    "totalScore": "0.92"
  }
}
```

---

## 🧠 Model Details

- **Algorithm**: PPO (Proximal Policy Optimization)
- **Training Data**: 10,000 timesteps over 4 parallel environments
- **Framework**: Stable Baselines3
- **Observation Space**: 38 dimensions (normalized [0,1])
- **Action Space**: Discrete(5) - choose 1 of 5 caregivers

### Reward Structure
- ❌ Unavailable caregiver: **-20**
- ❌ Caregiver cancellation: **-8**
- ✅ Booking successful: **+10**
- ✅ Good quality outcome: **+5 (to -15 if complaint)**

### Quality Score Factors
```
Quality = 0.30 × rating
        + 0.20 × (1 - distance_normalized)
        + 0.20 × experience_normalized
        + 0.15 × bookings_completed_normalized
        + 0.10 × (1 - cancellation_rate)
        + 0.05 × (1 - response_time_normalized)
```

---

## 🔌 Troubleshooting

### "Failed to get prediction. Make sure the backend is running."
**Solution:** Start the backend first!
```bash
cd backend
npm start
```

### "Cannot find module 'express'"
**Solution:** Install backend dependencies:
```bash
cd backend
npm install
```

### "Cannot find module 'react'"
**Solution:** Install frontend dependencies:
```bash
cd frontend
npm install
```

### Python inference taking too long
**Solution:** Ensure virtual environment is activated:
```bash
.\.venv\Scripts\Activate.ps1
```

### Port already in use
**Solution:** Change ports in config:
- **Frontend**: Edit `frontend/vite.config.js` → change `port: 3000`
- **Backend**: Edit `backend/server.js` → change `PORT = 5000`

---

## 📈 Next Steps (Production)

1. **Connect Real Database**
   - Replace simulated caregivers with actual database
   - Track booking history and outcomes
   - Update ratings from real parent feedback

2. **Add Backend Logic**
   - Availability scheduling
   - Price calculation
   - Distance routing

3. **Deploy**
   - Frontend: Vercel, Netlify
   - Backend: Heroku, AWS, DigitalOcean
   - Python: AWS Lambda, Google Cloud Functions

4. **Monitor**
   - Track model prediction accuracy
   - Log parent satisfaction
   - Retrain on real outcomes quarterly

---

## 📝 Environment Variables

Create `.env` files if needed:

**`backend/.env`:**
```
PORT=5000
NODE_ENV=development
```

**`frontend/.env`:**
```
VITE_API_URL=http://localhost:5000
```

---

## 🎓 Learning Resources

- [Gymnasium (RL Environments)](https://gymnasium.farama.org/)
- [Stable Baselines3 (RL Training)](https://stable-baselines3.readthedocs.io/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)

---

## 📄 License

MIT

---

**Have fun testing the AI caregiver matching system! 🎉**
