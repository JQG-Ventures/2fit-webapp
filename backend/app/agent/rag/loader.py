from pathlib import Path
from typing import List
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import logging

logger = logging.getLogger(__name__)


class DocumentLoader:
    def __init__(self, docs_dir: Path):
        self.docs_dir = Path(docs_dir)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
    
    def load_documents(self) -> List:
        documents = []
        
        if not self.docs_dir.exists():
            logger.warning(f"Documents directory {self.docs_dir} does not exist")
            return documents
        
        for doc_path in self.docs_dir.glob("*.md"):
            try:
                loader = TextLoader(str(doc_path), encoding="utf-8")
                docs = loader.load()
                chunks = self.text_splitter.split_documents(docs)
                documents.extend(chunks)
                logger.info(f"Loaded {len(chunks)} chunks from {doc_path.name}")
            except Exception as e:
                logger.error(f"Error loading {doc_path}: {e}")
        
        return documents
