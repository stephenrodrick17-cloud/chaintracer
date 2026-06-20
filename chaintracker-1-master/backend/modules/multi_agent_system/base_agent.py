from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseAgent(ABC):
    """
    Base class for all fraud detection agents
    """
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.status = "idle"

    @abstractmethod
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Abstract method for processing data
        """
        pass

    def update_status(self, new_status: str):
        """
        Update the agent's status
        """
        self.status = new_status
