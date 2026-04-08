from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from env.carematch_env import CareMatchEnv


app = FastAPI(title="CareMatch RL OpenEnv API")
env = CareMatchEnv()
is_initialized = False


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
    return {
        "observation": observation.tolist(),
        "reward": float(reward),
        "done": done,
        "info": info,
    }
