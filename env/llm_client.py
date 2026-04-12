"""
LLM client for CareMatch RL - uses submission proxy.
All API calls must go through API_BASE_URL and API_KEY.
"""

import os
from openai import OpenAI


def chat_via_submission_proxy(
    user_content: str,
    *,
    model: str = "gpt-3.5-turbo",
    max_tokens: int = 256
) -> str:
    """
    Make a chat completion call through the submission proxy.
    
    Args:
        user_content: The user message
        model: Model to use (default: gpt-3.5-turbo)
        max_tokens: Max tokens in response (default: 256)
    
    Returns:
        The assistant's response text
        
    Raises:
        KeyError: If API_BASE_URL or API_KEY environment variables not set
        Exception: If API call fails
    """
    # These will raise KeyError if not set (intentional for submission validation)
    api_base = os.environ["API_BASE_URL"]
    api_key = os.environ["API_KEY"]
    
    client = OpenAI(base_url=api_base, api_key=api_key)
    
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": user_content}],
        max_tokens=max_tokens
    )
    
    return response.choices[0].message.content
