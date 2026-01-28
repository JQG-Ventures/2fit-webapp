from app.agent.graph import FitnessCoachAgent
from app.agent.rag.vectorstore import VectorStoreManager
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class AgentService:
    _vectorstore: VectorStoreManager = None
    
    @classmethod
    def initialize_vectorstore(cls):
        if cls._vectorstore is None:
            try:
                docs_dir = Path(__file__).parent / "rag" / "docs"
                persist_dir = Path(__file__).parent / "rag" / "vectorstore"
                cls._vectorstore = VectorStoreManager(docs_dir, persist_dir)
                cls._vectorstore.initialize()
                logger.info("Vector store initialized")
            except Exception as e:
                logger.error(f"Failed to initialize vector store: {e}. Agent will work without RAG.")
                cls._vectorstore = None
    
    @classmethod
    def get_agent(cls, user_id: str) -> FitnessCoachAgent:
        if cls._vectorstore is None:
            cls.initialize_vectorstore()
        
        return FitnessCoachAgent(user_id, cls._vectorstore)
    
    @classmethod
    def process_message(cls, user_id: str, message: str) -> dict:
        agent = cls.get_agent(user_id)
        return agent.process_message(message)
