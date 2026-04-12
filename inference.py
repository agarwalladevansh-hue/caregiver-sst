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

TASK_NAME = "caregiver_matching"


def main():
    if len(sys.argv) < 2:
        print(f"[START] task={TASK_NAME}", flush=True)
        print(f"[STEP] step=0 reward=0.0", flush=True)
        print(f"[END] task={TASK_NAME} score=0.0 steps=0 status=error", flush=True)
        return

    print(f"[START] task={TASK_NAME}", flush=True)
    
    try:
        from env.carematch_env import CareMatchEnv
        
        observation_data = json.loads(sys.argv[1])
        observation = np.array(observation_data, dtype=np.float32)

        env = CareMatchEnv()
        env.reset()
        
        # Inject initial observation for the first step
        env.parent_features = observation[:3]
        env.caregiver_features = [observation[3 + i*7 : 3 + (i+1)*7] for i in range(5)]
        env.obs = observation
        
        total_score = 0.0
        for i in range(1, 6):
            action, confidence = load_model_prediction(observation)
            if action is None:
                action, confidence = heuristic_prediction(observation)

            _, reward, _, _, _ = env.step(action)
            print(f"[STEP] step={i} reward={reward:.4f}", flush=True)
            total_score += reward
            
            # Since CareMatchEnv episodes end in 1 step, we reset to generate a new scenario
            observation, _ = env.reset()

        avg_score = total_score / 5

    except Exception as e:
        print(f"[STEP] step=0 reward=0.0", flush=True)
        avg_score = 0.0
    
    # ✅ API CALL MUST ALWAYS EXECUTE - OUTSIDE EXCEPTION HANDLER
    try:
        # Debug: Verify environment variables exist
        api_base_url = os.environ.get("API_BASE_URL")
        api_key = os.environ.get("API_KEY")
        
        print(f"DEBUG: API_BASE_URL={api_base_url}", flush=True)
        print(f"DEBUG: API_KEY={'***' if api_key else 'NOT SET'}", flush=True)
        
        if not api_base_url or not api_key:
            raise ValueError("Missing API_BASE_URL or API_KEY environment variables")
        
        print(f"DEBUG: Importing OpenAI...", flush=True)
        from openai import OpenAI
        
        print(f"DEBUG: Creating OpenAI client with base_url={api_base_url}", flush=True)
        client = OpenAI(
            base_url=api_base_url,
            api_key=api_key
        )
        
        print(f"DEBUG: Making chat completion request...", flush=True)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": f"Caregiver selected. Average reward {avg_score:.2f}. Summary?"}]
        )
        
        print(f"DEBUG: API call successful", flush=True)
        print(f"LLM response: {response.choices[0].message.content}", flush=True)
        
    except ValueError as e:
        print(f"ERROR: {e}", flush=True)
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: API call failed: {type(e).__name__}: {e}", flush=True)
        sys.exit(1)
    
    # ✅ ALWAYS REACH HERE (API call completed successfully)
    print(f"[END] task={TASK_NAME} score={avg_score:.4f} steps=5", flush=True)

if __name__ == "__main__":
    main()
