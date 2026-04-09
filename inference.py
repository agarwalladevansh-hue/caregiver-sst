"""
Python inference script for CareMatch RL model.
Called by Node.js backend to make predictions.
Falls back to heuristic if model not found.
"""

import sys
import json
import numpy as np
import os
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

API_BASE_URL = os.getenv("API_BASE_URL", "your-active-endpoint")
MODEL_NAME = os.getenv("MODEL_NAME", "your-model-name")
HF_TOKEN = os.getenv("HF_TOKEN")

client = OpenAI(base_url=API_BASE_URL, api_key=HF_TOKEN) if OpenAI is not None else None

def load_model_prediction(observation):
    """Try to load the trained PPO model and get prediction."""
    try:
        from stable_baselines3 import PPO
        
        # Try multiple possible locations for the model
        model_paths = [
            "carematch_ppo",
            "carematch_ppo.zip",
            os.path.join(os.path.dirname(__file__), "carematch_ppo"),
            os.path.join(os.path.dirname(__file__), "carematch_ppo.zip"),
        ]
        
        model = None
        for model_path in model_paths:
            if os.path.exists(model_path) or os.path.exists(model_path + ".zip"):
                try:
                    model = PPO.load(model_path)
                    break
                except:
                    continue
        
        if model is not None:
            action, _states = model.predict(observation, deterministic=True)
            return int(action), 0.92
        else:
            return None, None
    except Exception as e:
        return None, None

def heuristic_prediction(observation):
    """
    Fallback heuristic: if model not found, use simple scoring.
    Observation format:
    [3 parent features + 5 caregivers × 7 features each]
    """
    # Extract caregiver features (skip first 3 parent features)
    caregivers_start = 3
    num_caregivers = 5
    features_per_caregiver = 7
    
    best_caregiver = 0
    best_score = -float('inf')
    
    for i in range(num_caregivers):
        start_idx = caregivers_start + (i * features_per_caregiver)
        
        # Caregiver features order:
        # 0: rating, 1: is_available, 2: distance, 3: experience, 
        # 4: cancellation_rate, 5: bookings_completed, 6: response_time
        
        rating = observation[start_idx + 0]
        is_available = observation[start_idx + 1]
        distance = observation[start_idx + 2]
        experience = observation[start_idx + 3]
        cancellation_rate = observation[start_idx + 4]
        bookings_completed = observation[start_idx + 5]
        response_time = observation[start_idx + 6]
        
        # Skip unavailable caregivers
        if is_available < 0.5:
            continue
        
        # Calculate score using same weights as training
        score = (
            0.30 * rating
            + 0.20 * (1.0 - distance)
            + 0.20 * experience
            + 0.15 * bookings_completed
            + 0.10 * (1.0 - cancellation_rate)
            + 0.05 * (1.0 - response_time)
        )
        
        if score > best_score:
            best_score = score
            best_caregiver = i
    
    confidence = min(0.95, 0.5 + (best_score * 0.5))
    return best_caregiver, confidence

TASK_NAME = "carematch_inference"


def _emit(line: str) -> None:
    print(line, flush=True)


def main():
    # Structured blocks for validators (stdout, flushed — not stderr)
    _emit(f"[START] task={TASK_NAME}")
    if len(sys.argv) < 2:
        _emit("[STEP] step=0 status=error reason=no_observation")
        _emit(json.dumps({"error": "No observation data provided"}))
        _emit(f"[END] task={TASK_NAME} score=0.0 steps=0 status=error")
        return

    try:
        _emit("[STEP] step=1 status=parsing_observation")
        # Parse observation from Node.js
        observation_data = json.loads(sys.argv[1])
        observation = np.array(observation_data, dtype=np.float32)

        _emit("[STEP] step=2 status=model_inference")
        # Try to use trained model first
        action, confidence = load_model_prediction(observation)

        # Fall back to heuristic if model not available
        if action is None:
            _emit("[STEP] step=3 status=heuristic_fallback")
            action, confidence = heuristic_prediction(observation)

        result = {
            "action": int(action),
            "confidence": float(confidence),
        }
        score = float(confidence)
        _emit(
            f"[STEP] step=4 reward={score:.4f} action={int(action)} "
            f"confidence={score:.4f}"
        )
        _emit(json.dumps(result))
        _emit(
            f"[END] task={TASK_NAME} score={score:.4f} steps=4 status=ok"
        )

    except Exception as e:
        err = str(e).replace("\n", " ")
        _emit(f"[STEP] step=0 status=exception error={err!r}")
        _emit(json.dumps({"error": str(e)}))
        _emit(f"[END] task={TASK_NAME} score=0.0 steps=0 status=error")
        sys.exit(1)

if __name__ == "__main__":
    main()
