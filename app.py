from typing import Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from env.carematch_env import CareMatchEnv
import os
from openai import OpenAI

app = FastAPI(title="CareMatch RL OpenEnv API")
env = CareMatchEnv()
is_initialized = False

client = OpenAI(
    base_url=os.environ["API_BASE_URL"],
    api_key=os.environ["API_KEY"]
)

class StepRequest(BaseModel):
    action: int = Field(..., ge=0, le=4)

@app.get("/")
def root() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "CareMatch RL OpenEnv API",
        "endpoints": "POST /reset, POST /step",
    }

@app.post("/reset")
def reset_env() -> dict[str, Any]:
    global is_initialized
    observation, info = env.reset()
    is_initialized = True
    return {"observation": observation.tolist(), "info": info}

@app.post("/step")
def step_env(payload: StepRequest) -> dict[str, Any]:
    global is_initialized
    if not is_initialized:
        raise HTTPException(
            status_code=400, detail="Environment not initialized. Call /reset first."
        )
    
    observation, reward, terminated, truncated, info = env.step(payload.action)
    done = bool(terminated or truncated)
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": f"Caregiver action {payload.action} gave reward {reward:.2f}. Good match?"}]
    )
    llm_summary = response.choices[0].message.content

    return {
        "observation": observation.tolist(),
        "reward": float(reward),
        "done": done,
        "info": info,
        "llm_summary": llm_summary
    }
