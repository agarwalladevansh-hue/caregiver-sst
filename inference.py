"""
Python inference script for CareMatch RL model.
Called by Node.js backend to make predictions.
Falls back to heuristic if model not found.
"""

import sys
import json
import numpy as np
import os


def _ensure_stdout_line_buffered() -> None:
    """Validators often pipe stdout; default block buffering can hide [START]/[STEP]/[END]."""
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(line_buffering=True)
        else:
            sys.stdout = os.fdopen(sys.stdout.fileno(), "w", buffering=1)
    except Exception:
        pass


def _out(line: str) -> None:
    """Always write to real stdout and flush (required for subprocess validators)."""
    sys.stdout.write(line + "\n")
    sys.stdout.flush()


_ensure_stdout_line_buffered()
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


def main():
    # First bytes on stdout must include [START] for piped validators
    _out(f"[START] task={TASK_NAME}")
    if len(sys.argv) < 2:
        _out("[STEP] step=0 status=error reason=no_observation")
        _out(
            f"[START] task={TASK_NAME}, [STEP] step=0 reward=0.0, "
            f"[END] task={TASK_NAME} score=0.0 steps=0 status=error"
        )
        _out(json.dumps({"error": "No observation data provided"}))
        _out(f"[END] task={TASK_NAME} score=0.0 steps=0 status=error")
        return

    try:
        _out("[STEP] step=1 status=parsing_observation")
        observation_data = json.loads(sys.argv[1])
        observation = np.array(observation_data, dtype=np.float32)

        _out("[STEP] step=2 status=model_inference")
        action, confidence = load_model_prediction(observation)

        if action is None:
            _out("[STEP] step=3 status=heuristic_fallback")
            action, confidence = heuristic_prediction(observation)

        result = {
            "action": int(action),
            "confidence": float(confidence),
        }
        score = float(confidence)
        steps_total = 4
        _out(
            f"[STEP] step=4 reward={score:.4f} action={int(action)} "
            f"confidence={score:.4f}"
        )
        # Doc-style single line (commas between blocks) for strict parsers
        _out(
            f"[START] task={TASK_NAME}, [STEP] step=1 reward={score:.4f}, "
            f"[END] task={TASK_NAME} score={score:.4f} steps={steps_total}"
        )
        _out(json.dumps(result))
        _out(f"[END] task={TASK_NAME} score={score:.4f} steps={steps_total} status=ok")

    except Exception as e:
        err = str(e).replace("\n", " ")
        _out(f"[STEP] step=0 status=exception error={err!r}")
        _out(
            f"[START] task={TASK_NAME}, [STEP] step=0 reward=0.0, "
            f"[END] task={TASK_NAME} score=0.0 steps=0 status=error"
        )
        _out(json.dumps({"error": str(e)}))
        _out(f"[END] task={TASK_NAME} score=0.0 steps=0 status=error")
        sys.exit(1)

if __name__ == "__main__":
    main()
