import logging
import os
from dotenv import load_dotenv
from mem0 import MemoryClient

# Setup logging with a cleaner format
logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

class MemoryManager:
    def __init__(self, user_id: str):
        load_dotenv()
        self.client = MemoryClient()
        self.user_id = user_id

    def save_chat(self, messages: list):
        try:
            self.client.add(messages, user_id=self.user_id)
            logger.info(f" Memory synced for user: {self.user_id}")
        except Exception as e:
            logger.error(f" Failed to save memory: {e}")

    def get_context(self, query: str = None) -> str:
        try:
            if query:
                response = self.client.search(
                    query=query,
                    filters={"user_id": self.user_id}
                )
                results = response.get("results", [])
            else:
                results = self.client.get_all(user_id=self.user_id)

            if not results:
                return ""

            memories = [r["memory"] for r in results if "memory" in r]

            return "\n".join(f"• {m}" for m in memories)

        except Exception as e:
            logger.error(f"Error loading memory: {e}")
            return ""


# --- Execution ---
if __name__ == "__main__":
    manager = MemoryManager(user_id="Murphx")

    # 1. Simulate Chat
    conversation = [
        {"role": "user", "content": "I really like black and gaming."},
        {"role": "assistant", "content": "Great combo! Hybrid Theory or Meteora?"}
    ]

    # 2. Save
    manager.save_chat(conversation)

    # 3. Retrieve specific context (Semantic Search)
    # This is better than loading ALL memories once your DB gets big.
    context = manager.get_context(query="What music does the user like?")

    print("\n RELEVANT AI CONTEXT:")
    print(context)