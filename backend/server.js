const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 7860;

// Middleware
app.use(cors());
app.use(express.json());

// Store caregiver data (in production, this would come from a database)
const generateCaregivers = () => {
  const caregivers = [];
  for (let i = 0; i < 5; i++) {
    caregivers.push({
      id: i,
      name: `Caregiver ${i + 1}`,
      rating: (Math.random() * 0.5 + 0.5).toFixed(2),
      available: Math.random() > 0.2 ? 1 : 0,
      distance: (Math.random() * 10).toFixed(2),
      experience: (Math.random() * 20).toFixed(1),
      cancellationRate: (Math.random() * 0.5).toFixed(2),
      bookingsCompleted: Math.floor(Math.random() * 100),
      responseTime: (Math.random() * 2).toFixed(1),
    });
  }
  return caregivers;
};

// Python inference handler
const runPythonInference = (observationData) => {
  return new Promise((resolve, reject) => {
    // Use python3 directly (works in Docker and on Linux)
    // For Windows, adapt as needed
    const pythonCmd = process.platform === 'win32' && !process.env.DOCKER_ENV 
      ? path.join(__dirname, "..", ".venv", "Scripts", "python.exe")
      : "python3";
    
    // In Docker, files are in /app, so use __dirname directly
    // Locally, they're in ../inference.py from backend/
    const inferencePath = process.platform === 'win32'
      ? path.join(__dirname, "..", "inference.py")
      : path.join(__dirname, "inference.py");
    
    const pythonProcess = spawn(pythonCmd, [
      inferencePath,
      JSON.stringify(observationData),
    ]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python error: ${stderr}`));
      } else {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      }
    });

    pythonProcess.on("error", (error) => {
      reject(new Error(`Failed to spawn Python process: ${error.message}`));
    });
  });
};

// API Endpoints

/**
 * GET /api/caregivers
 * Returns 5 simulated caregivers
 */
app.get("/api/caregivers", (req, res) => {
  const caregivers = generateCaregivers();
  res.json(caregivers);
});

/**
 * POST /api/predict
 * Accepts parent request and returns model prediction
 * Body: { urgency, duration, childAge }
 */
app.post("/api/predict", async (req, res) => {
  try {
    const { urgency, duration, childAge } = req.body;

    // Validate inputs
    if (
      urgency === undefined ||
      duration === undefined ||
      childAge === undefined
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: urgency, duration, childAge (all 0-1)",
      });
    }

    // Get caregivers
    const caregivers = generateCaregivers();

    // Build observation array matching the env's format
    const observation = [
      parseFloat(urgency),
      parseFloat(duration),
      parseFloat(childAge),
      ...caregivers.flatMap((c) => [
        parseFloat(c.rating),
        parseFloat(c.available),
        parseFloat(c.distance) / 10, // normalize to 0-1
        parseFloat(c.experience) / 20, // normalize to 0-1
        parseFloat(c.cancellationRate),
        parseFloat(c.bookingsCompleted) / 100, // normalize to 0-1
        parseFloat(c.responseTime) / 2, // normalize to 0-1
      ]),
    ];

    // Get model prediction
    const prediction = await runPythonInference(observation);

    // Return prediction with caregiver details
    const selectedCaregiver = caregivers[prediction.action];
    const explanationFactors = {
      rating: (parseFloat(selectedCaregiver.rating) * 0.3).toFixed(2),
      distance: ((1 - parseFloat(selectedCaregiver.distance) / 10) * 0.2).toFixed(
        2
      ),
      experience: ((parseFloat(selectedCaregiver.experience) / 20) * 0.2).toFixed(
        2
      ),
      bookings: ((parseFloat(selectedCaregiver.bookingsCompleted) / 100) * 0.15).toFixed(
        2
      ),
      cancellation: ((1 - parseFloat(selectedCaregiver.cancellationRate)) * 0.1).toFixed(
        2
      ),
      response: ((1 - parseFloat(selectedCaregiver.responseTime) / 2) * 0.05).toFixed(
        2
      ),
    };

    const totalScore = Object.values(explanationFactors)
      .reduce((a, b) => a + parseFloat(b), 0)
      .toFixed(2);

    res.json({
      success: true,
      parentRequest: {
        urgency: parseFloat(urgency),
        duration: parseFloat(duration),
        childAge: parseFloat(childAge),
      },
      caregivers: caregivers,
      prediction: {
        recommendedCaregiverId: prediction.action,
        recommendedCaregiver: selectedCaregiver,
        confidence: (prediction.confidence || 0.85).toFixed(2),
        explanation: explanationFactors,
        totalScore: totalScore,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running", timestamp: new Date().toISOString() });
});

// Serve frontend assets when bundled in a single container (Hugging Face Spaces).
const frontendDistPath = path.join(__dirname, "dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    return res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`✓ CareMatch server running on http://localhost:${PORT}`);
  console.log(`  API available at http://localhost:${PORT}/api`);
});
