# Virtual Fitness Coach Agent

A LangChain and LangGraph-based agentic system for providing personalized fitness coaching through conversational AI.

## Overview

This agent implements a Virtual Fitness Coach that:
- Responds to questions about exercise and nutrition
- Remembers conversation context and user profile
- Uses RAG (Retrieval Augmented Generation) for fitness knowledge
- Provides personalized workout and nutrition recommendations
- Maintains user profiles with goals, fitness level, dietary preferences, and injuries

## Architecture

### Components

```
agent/
├── main.py                  # Entry point and service wrapper
├── graph.py                 # LangGraph workflow definition
├── memory.py               # Conversation and profile memory management
├── models.py               # Pydantic models for validation
├── prompts/                # System prompts
│   ├── coach_system.txt
│   ├── workout.txt
│   └── nutrition.txt
├── rag/                    # RAG system
│   ├── loader.py           # Document loading and chunking
│   ├── vectorstore.py      # FAISS vector store management
│   └── docs/              # Knowledge base documents
│       ├── exercises.md
│       ├── beginner_workouts.md
│       └── nutrition_basics.md
├── tools/                  # LangChain tools
│   ├── user_tools.py       # User profile management
│   └── fitness_tools.py    # Workout and nutrition recommendations
└── services/
    └── llm.py              # LLM service abstraction
```

## Features

### Memory Management

**Conversation Memory**: Stores recent chat messages in MongoDB
- Retrieves last N messages for context
- Automatically saves user and assistant messages

**User Profile Memory**: Persistent user information
- Name, fitness goal, fitness level
- Dietary preferences
- Injuries and limitations
- Stored in MongoDB and updated by the agent

### RAG (Retrieval Augmented Generation)

- Loads fitness knowledge from markdown files
- Chunks documents for efficient retrieval
- Uses FAISS vector store with OpenAI embeddings
- Retrieves relevant context based on user queries
- Optional per-request (not always invoked)

### Tools

1. **get_user_profile**: Retrieves current user profile
2. **update_user_profile**: Updates user profile fields
3. **recommend_workout**: Generates workout plans based on goal and level
4. **recommend_nutrition**: Provides nutrition guidance based on goals

### LangGraph Workflow

The agent uses LangGraph to control flow:

1. **analyze_input**: Determines if RAG is needed
2. **query_rag**: Retrieves relevant knowledge (if needed)
3. **respond**: Generates response using LLM with tools

Routing:
- Factual fitness/nutrition questions → RAG
- Personal info updates → Tools
- Workout/nutrition requests → Tools
- General coaching → Direct response

## Setup

### Prerequisites

- Python 3.11+
- MongoDB (for memory storage)
- OpenAI API key

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini  # or your preferred model
MONGO_URI=your_mongodb_uri
```

3. Initialize vector store (happens automatically on first use):
The vector store will be built from documents in `rag/docs/` on first agent initialization.

### Usage

#### From Flask Route

```python
from app.agent import AgentService

# Process a message
response = AgentService.process_message(user_id="user123", message="I want to lose weight")
# Returns: {"message": "...", "recommendations": [], "follow_up_question": None}
```

#### API Endpoints

- `POST /api/agent/chat` - Send message to agent
- `GET /api/agent/conversation` - Get conversation history
- `POST /api/agent/conversation/clear` - Clear conversation

## Response Format

All responses conform to `CoachResponse` model:

```python
{
    "message": str,              # Main response
    "recommendations": [str],    # List of actionable recommendations
    "follow_up_question": str   # Optional follow-up question
}
```

## Extending the Agent

### Adding New Tools

1. Create tool in `tools/` directory:
```python
from langchain_core.tools import tool

@tool
def my_new_tool(user_id: str, param: str) -> dict:
    """Tool description."""
    # Implementation
    return {"result": "..."}
```

2. Add to `graph.py`:
```python
self.tools = [
    get_user_profile,
    update_user_profile,
    recommend_workout,
    recommend_nutrition,
    my_new_tool  # Add here
]
```

### Adding RAG Documents

1. Add markdown file to `rag/docs/`
2. Vector store will automatically rebuild on next initialization
3. Or manually rebuild by deleting `rag/vectorstore/faiss_index`

### Customizing Prompts

Edit prompt files in `prompts/`:
- `coach_system.txt`: Main system prompt
- `workout.txt`: Workout-specific instructions
- `nutrition.txt`: Nutrition-specific instructions

### Changing LLM

Update `services/llm.py` to use different LLM provider. The service uses abstraction, so you can swap implementations.

## Design Decisions

1. **Modular Architecture**: Separated concerns (memory, RAG, tools, graph) for maintainability
2. **Pydantic Validation**: All outputs validated with Pydantic v2
3. **Tool-based Actions**: Uses LangChain tools for side effects (profile updates, recommendations)
4. **Optional RAG**: RAG only invoked when needed, not on every request
5. **MongoDB Storage**: Persistent memory for conversations and profiles
6. **FAISS Vector Store**: Local, fast vector search without external dependencies
7. **Simple but Extensible**: Clean base that can grow with new features

## Limitations

- Vector store is local (FAISS) - consider cloud storage for production
- Tool execution is synchronous - could be async for better performance
- RAG documents are static - could add dynamic document loading
- No streaming responses - could add streaming for better UX

## Future Enhancements

- [ ] Streaming responses
- [ ] Multi-modal support (images for form checks)
- [ ] Integration with workout tracking
- [ ] Advanced analytics and insights
- [ ] Multi-language support
- [ ] Cloud vector store (Pinecone, Weaviate)
- [ ] Fine-tuned models for fitness domain

## Troubleshooting

### Vector Store Not Building
- Check that `rag/docs/` contains `.md` files
- Verify OpenAI API key is set
- Check file permissions

### Tools Not Working
- Verify user_id is passed correctly
- Check MongoDB connection
- Review tool logs for errors

### Memory Issues
- Check MongoDB connection
- Verify collections are created
- Review memory manager logs

