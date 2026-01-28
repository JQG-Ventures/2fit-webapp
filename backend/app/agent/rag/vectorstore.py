from pathlib import Path
from typing import List, Optional
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from app.agent.rag.loader import DocumentLoader
import app.settings as s
import logging

logger = logging.getLogger(__name__)


class VectorStoreManager:
    def __init__(self, docs_dir: Path, persist_dir: Optional[Path] = None):
        self.docs_dir = Path(docs_dir)
        self.persist_dir = Path(persist_dir) if persist_dir else Path("backend/app/agent/rag/vectorstore")
        self.persist_dir.mkdir(parents=True, exist_ok=True)
        
        self._embeddings = None
        self.vectorstore: Optional[FAISS] = None
        self._api_key = s.OPENAI_API_KEY
    
    @property
    def embeddings(self):
        if self._embeddings is None:
            import os
            if self._api_key:
                os.environ["OPENAI_API_KEY"] = self._api_key
            
            try:
                self._embeddings = OpenAIEmbeddings(
                    model="text-embedding-ada-002",
                    http_client=None,
                )
            except Exception as e:
                logger.warning(f"Failed to initialize embeddings with model: {e}")
                try:
                    self._embeddings = OpenAIEmbeddings(http_client=None)
                except Exception as e2:
                    logger.error(f"Failed to initialize embeddings: {e2}")
                    raise
        return self._embeddings
    
    def initialize(self) -> None:
        vectorstore_path = self.persist_dir / "faiss_index"
        
        if vectorstore_path.exists():
            try:
                self.vectorstore = FAISS.load_local(
                    str(vectorstore_path),
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
                logger.info("Loaded existing vector store")
            except Exception as e:
                logger.warning(f"Error loading vector store: {e}. Rebuilding...")
                self._build_vectorstore()
        else:
            self._build_vectorstore()
    
    def _build_vectorstore(self) -> None:
        loader = DocumentLoader(self.docs_dir)
        documents = loader.load_documents()
        
        if not documents:
            logger.warning("No documents found to build vector store")
            self.vectorstore = None
            return
        
        try:
            self.vectorstore = FAISS.from_documents(documents, self.embeddings)
            vectorstore_path = self.persist_dir / "faiss_index"
            self.vectorstore.save_local(str(vectorstore_path))
            logger.info(f"Built vector store with {len(documents)} document chunks")
        except Exception as e:
            logger.error(f"Error building vector store: {e}")
            self.vectorstore = None
    
    def search(self, query: str, k: int = 3) -> List[Document]:
        if not self.vectorstore:
            logger.warning("Vector store not initialized")
            return []
        
        try:
            results = self.vectorstore.similarity_search(query, k=k)
            return results
        except Exception as e:
            logger.error(f"Error searching vector store: {e}")
            return []
    
    def get_context(self, query: str, k: int = 3) -> str:
        documents = self.search(query, k)
        
        if not documents:
            return ""
        
        context_parts = []
        for doc in documents:
            context_parts.append(doc.page_content)
        
        return "\n\n---\n\n".join(context_parts)
