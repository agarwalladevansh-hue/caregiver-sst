# CareMatch RL

A Gymnasium-compatible Reinforcement Learning environment where an agent learns to match parent childcare booking requests to the best of 5 available caregivers.

## Project Structure

```
carematch-rl/
├── env/
│   ├── __init__.py
│   └── carematch_env.py      # CareMatchEnv Gymnasium environment
├── train.py                   # PPO training script
├── requirements.txt
└── README.md
```

## Features

- **Observation Space**: 38-dimensional vector containing:
  - 3 parent features (urgency, duration, child age)
  - 5 caregivers × 7 features (rating, availability, distance, experience, cancellation rate, bookings completed, response time)

- **Action Space**: Discrete(5) — select one of 5 caregivers

- **Reward Logic**:
  - Unavailable caregiver: -20
  - Cancellation: -8
  - Successful booking: +10 (base) + quality bonus (+5 or -15)
  - Quality score factors: rating, distance, experience, bookings, cancellation rate, response time

- **Training**: PPO (Proximal Policy Optimization) via Stable Baselines3

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Train the Model

```bash
python train.py
```

This will:
- Verify the environment passes gymnasium compliance checks
- Train PPO for 10,000 timesteps using 4 parallel environments
- Save the trained model as `carematch_ppo.zip`
- Display a sample prediction from the trained model

### 3. Output

After successful training, you'll see:
- Training logs with policy losses and policy gradients
- A tensorboard log directory (`carematch_logs/`)
- The saved model file (`carematch_ppo.zip`)
- A sample prediction showing which caregiver the agent selected

## Design Principles

- ✓ No gender or sensitive demographic features
- ✓ All features normalized to [0, 1]
- ✓ Proper seeding using `self.np_random` for reproducibility
- ✓ Gymnasium-compliant environment structure
- ✓ Type hints throughout
