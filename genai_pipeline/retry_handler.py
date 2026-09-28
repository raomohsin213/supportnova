"""Exponential Backoff and Retry Handler for LLM APIs."""
import time
from typing import Callable, Any

class RetryHandler:
    @staticmethod
    def execute_with_retry(func: Callable, max_attempts: int = 3, backoff: float = 1.5) -> Any:
        attempts = 0
        while attempts < max_attempts:
            try:
                return func()
            except Exception as e:
                attempts += 1
                if attempts >= max_attempts:
                    raise e
                time.sleep(backoff ** attempts)

retry_handler = RetryHandler()
