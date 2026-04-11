import subprocess
import sys
subprocess.run([sys.executable, "-m", "pip", "install", "openai", "stable-baselines3", "gymnasium", "numpy", "-q"], check=True)

import os
import numpy as np
from openai import OpenAI
from env.carematch_env import CareMatchEnv

TASK_NAME = "caregiver_matching"

client = OpenAI(
    base_url=os.environ["API_BASE_URL"],
    api_key=os.environ["API_KEY"]
)

def load_model_prediction(observation):
    try:
        from stable_baselines3 import PPO
        model = PPO.load("carematch_ppo")
        action, _ = model.predict(observation, deterministic=True)
        return int(action)
    except:
        return None

def heuristic_prediction(observation):
    best, best_score = 0, -float('inf')
    for i in range(5):
        s = 3 + i * 7
        if observation[s+1] < 0.5:
            continue
        score = (0.30 * observation[s] + 0.20 * (1 - observation[s+2]) +
                 0.20 * observation[s+3] + 0.15 * observation[s+5] +
                 0.10 * (1 - observation[s+4]) + 0.05 * (1 - observation[s+6]))
        if score > best_score:
            best_score, best = score, i
    return best

env = CareMatchEnv()
obs, _ = env.reset()

print(f"[START] task={TASK_NAME}", flush=True)

total = 0.0
for i in range(1, 6):
    action = load_model_prediction(obs)
    if action is None:
        action = heuristic_prediction(obs)
    obs, reward, _, _, _ = env.step(action)
    print(f"[STEP] step={i} reward={reward:.4f}", flush=True)
    total += reward
    obs, _ = env.reset()

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Summarize the best caregiver match strategy"}]
)
print(f"LLM response: {response.choices[0].message.content}", flush=True)
print(f"[END] task={TASK_NAME} score={total/5:.4f} steps=5", flush=True)
