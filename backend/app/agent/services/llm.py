from langchain_openai import ChatOpenAI
from langchain_core.language_models import BaseChatModel
from typing import Optional
import app.settings as s
import logging

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, temperature: float = 0.7):
        self.api_key = api_key or s.OPENAI_API_KEY
        self.model = model or s.OPENAI_MODEL or "gpt-4o-mini"
        self.temperature = temperature
    
    def get_llm(self) -> BaseChatModel:
        import os
        if self.api_key:
            os.environ["OPENAI_API_KEY"] = self.api_key
        
        try:
            return ChatOpenAI(
                model=self.model,
                temperature=self.temperature,
                http_client=None,
            )
        except (TypeError, ValueError) as e:
            error_str = str(e)
            if "proxies" in error_str.lower():
                logger.warning(f"ChatOpenAI initialization failed with proxies error: {e}")
                logger.warning("Attempting to use OpenAI client directly as fallback...")
                
                from openai import OpenAI
                from langchain_core.language_models import BaseChatModel
                from langchain_core.outputs import LLMResult, Generation
                
                class OpenAIAdapter(BaseChatModel):
                    def __init__(self, client: OpenAI, model: str, temperature: float):
                        super().__init__()
                        self.client = client
                        self.model = model
                        self.temperature = temperature
                    
                    def _generate(self, messages, stop=None, run_manager=None, **kwargs):
                        openai_messages = []
                        for msg in messages:
                            if hasattr(msg, 'content'):
                                role = "user" if msg.__class__.__name__ == "HumanMessage" else "assistant"
                                if msg.__class__.__name__ == "SystemMessage":
                                    role = "system"
                                openai_messages.append({"role": role, "content": msg.content})
                        
                        response = self.client.chat.completions.create(
                            model=self.model,
                            messages=openai_messages,
                            temperature=self.temperature
                        )
                        
                        text = response.choices[0].message.content
                        return LLMResult(generations=[[Generation(text=text)]])
                    
                    def invoke(self, messages, config=None, **kwargs):
                        openai_messages = []
                        for msg in messages:
                            if hasattr(msg, 'content'):
                                role = "user" if msg.__class__.__name__ == "HumanMessage" else "assistant"
                                if msg.__class__.__name__ == "SystemMessage":
                                    role = "system"
                                openai_messages.append({"role": role, "content": msg.content})
                        
                        response = self.client.chat.completions.create(
                            model=self.model,
                            messages=openai_messages,
                            temperature=self.temperature
                        )
                        
                        from langchain_core.messages import AIMessage
                        return AIMessage(content=response.choices[0].message.content)
                    
                    @property
                    def _llm_type(self):
                        return "openai-adapter"
                
                client = OpenAI(api_key=self.api_key)
                return OpenAIAdapter(client, self.model, self.temperature)
            else:
                logger.warning(f"Failed to initialize ChatOpenAI: {e}")
                try:
                    return ChatOpenAI(model=self.model)
                except Exception as e2:
                    logger.error(f"All ChatOpenAI initialization attempts failed: {e2}")
                    raise
