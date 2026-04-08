import gymnasium as gym
import numpy as np
from gymnasium import spaces


class CareMatchEnv(gym.Env):
    """
    Gymnasium-compatible environment for CareMatch RL.
    Agent learns to match parent childcare requests to the best of 5 caregivers.
    """

    metadata = {"render_modes": ["human"]}

    def __init__(self):
        super().__init__()
        
        # Observation space: 3 parent features + 5 caregivers * 7 features each = 38
        self.observation_space = spaces.Box(
            low=0.0, high=1.0, shape=(38,), dtype=np.float32
        )
        
        # Action space: select one of 5 caregivers
        self.action_space = spaces.Discrete(5)
        
        # Initialize observation
        self.obs = None
        self.parent_features = None
        self.caregiver_features = None

    def reset(self, seed=None, options=None):
        """Reset environment and return initial observation."""
        super().reset(seed=seed)
        
        # Generate parent features: urgency, duration_hours, child_age
        self.parent_features = self.np_random.uniform(0.0, 1.0, size=3)
        
        # Generate 5 caregivers with 7 features each
        # Features: rating, is_available, distance_km, experience_yrs, 
        #           cancellation_rate, bookings_completed, response_time
        self.caregiver_features = []
        for _ in range(5):
            rating = self.np_random.uniform(0.0, 1.0)
            is_available = float(self.np_random.random() < 0.8)  # 80% chance available
            distance_km = self.np_random.uniform(0.0, 1.0)
            experience_yrs = self.np_random.uniform(0.0, 1.0)
            cancellation_rate = self.np_random.uniform(0.0, 1.0)
            bookings_completed = self.np_random.uniform(0.0, 1.0)
            response_time = self.np_random.uniform(0.0, 1.0)
            
            caregiver = np.array(
                [
                    rating,
                    is_available,
                    distance_km,
                    experience_yrs,
                    cancellation_rate,
                    bookings_completed,
                    response_time,
                ],
                dtype=np.float32,
            )
            self.caregiver_features.append(caregiver)
        
        self.obs = self._get_observation()
        return self.obs, {}

    def step(self, action: int):
        """Execute one step of the environment."""
        # Get selected caregiver
        selected_caregiver = self.caregiver_features[action]
        is_available = selected_caregiver[1]
        cancel_rate = selected_caregiver[4]
        
        terminated = True
        reward = 0.0
        
        # Check if caregiver is available
        if is_available == 0:
            reward = -20.0
        # Check if cancellation occurs
        elif self.np_random.random() < cancel_rate:
            reward = -8.0
        else:
            # Booking successful
            reward = 10.0
            
            # Compute quality score
            rating = selected_caregiver[0]
            distance_km = selected_caregiver[2]
            experience_yrs = selected_caregiver[3]
            bookings_completed = selected_caregiver[5]
            response_time = selected_caregiver[6]
            
            quality_score = (
                0.30 * rating
                + 0.20 * (1.0 - distance_km)
                + 0.20 * experience_yrs
                + 0.15 * bookings_completed
                + 0.10 * (1.0 - cancel_rate)
                + 0.05 * (1.0 - response_time)
            )
            quality_score = np.clip(quality_score, 0.0, 1.0)
            
            # Quality-based outcome
            if self.np_random.random() < quality_score:
                reward += 5.0  # good_rating
            else:
                reward += -15.0  # complaint
        
        info = {"selected_caregiver": action}
        truncated = False
        
        return self.obs, float(reward), terminated, truncated, info

    def _get_observation(self) -> np.ndarray:
        """Construct observation from parent and caregiver features."""
        obs = np.concatenate([self.parent_features] + self.caregiver_features)
        return obs.astype(np.float32)

    def render(self):
        """Print formatted parent and caregiver features."""
        if self.parent_features is None or self.caregiver_features is None:
            print("Environment not initialized. Call reset() first.")
            return
        
        print("\n" + "=" * 70)
        print("PARENT REQUEST")
        print("=" * 70)
        print(f"  Urgency:       {self.parent_features[0]:.4f}")
        print(f"  Duration hrs:  {self.parent_features[1]:.4f}")
        print(f"  Child age:     {self.parent_features[2]:.4f}")
        
        print("\n" + "=" * 70)
        print("AVAILABLE CAREGIVERS")
        print("=" * 70)
        for i, caregiver in enumerate(self.caregiver_features):
            print(f"\nCaregiver {i}:")
            print(f"  Rating:             {caregiver[0]:.4f}")
            print(f"  Available:          {int(caregiver[1])}")
            print(f"  Distance (km):      {caregiver[2]:.4f}")
            print(f"  Experience (yrs):   {caregiver[3]:.4f}")
            print(f"  Cancellation rate:  {caregiver[4]:.4f}")
            print(f"  Bookings completed: {caregiver[5]:.4f}")
            print(f"  Response time:      {caregiver[6]:.4f}")
        print("=" * 70 + "\n")
