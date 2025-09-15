"""
Voice Agent FastAPI Backend
Supabase + LangChain + OpenAI + WebRTC Integration

This backend provides:
1. Speech-to-Text using OpenAI Whisper
2. Natural Language to SQL using LangChain
3. SQL execution against Supabase Postgres
4. Response generation with OpenAI
5. Text-to-Speech conversion
"""

import os
import io
import json
import tempfile
from typing import Optional
from datetime import datetime, timedelta

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from openai import AzureOpenAI
from langchain.sql_database import SQLDatabase
from langchain.agents import create_sql_agent
from langchain.agents.agent_toolkits import SQLDatabaseToolkit
from langchain.agents.agent_types import AgentType
from langchain_openai import AzureChatOpenAI
from langchain.schema import HumanMessage
import psycopg2
from pydub import AudioSegment
import jwt
from supabase import create_client, Client
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Voice Agent Backend",
    description="Complete Voice Agent with Supabase + LangChain + OpenAI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
AZURE_OPENAI_CHAT_DEPLOYMENT = os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT")
AZURE_OPENAI_WHISPER_DEPLOYMENT = os.getenv("AZURE_OPENAI_WHISPER_DEPLOYMENT")
AZURE_OPENAI_TTS_DEPLOYMENT = os.getenv("AZURE_OPENAI_TTS_DEPLOYMENT")

DATABASE_URL = os.getenv("DATABASE_URL")  # Read-only connection string
JWT_SECRET = os.getenv("JWT_SECRET", "your-jwt-secret")

# Initialize Azure OpenAI client
azure_openai_client = AzureOpenAI(
    api_key=AZURE_OPENAI_API_KEY,
    api_version=AZURE_OPENAI_API_VERSION,
    azure_endpoint=AZURE_OPENAI_ENDPOINT
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Initialize database connection for LangChain with Azure OpenAI
if DATABASE_URL and AZURE_OPENAI_CHAT_DEPLOYMENT:
    db = SQLDatabase.from_uri(DATABASE_URL)
    llm = AzureChatOpenAI(
        api_key=AZURE_OPENAI_API_KEY,
        api_version=AZURE_OPENAI_API_VERSION,
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        deployment_name=AZURE_OPENAI_CHAT_DEPLOYMENT,
        temperature=0
    )
    toolkit = SQLDatabaseToolkit(db=db, llm=llm)
    agent = create_sql_agent(
        llm=llm,
        toolkit=toolkit,
        verbose=True,
        agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        handle_parsing_errors=True,
    )

# Authentication middleware
async def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and check if user is admin"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        
        # Check if user is admin in Supabase
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        # Query user profile to check admin status
        result = supabase.table("user_profiles").select("role").eq("id", user_id).single().execute()
        
        if not result.data or result.data.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
            
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Voice Agent Backend is running", "status": "healthy"}

@app.post("/voice-query")
async def process_voice_query(
    audio_file: UploadFile = File(...),
    user_id: str = Depends(verify_admin_token)
):
    """
    Complete voice query processing pipeline:
    1. Convert audio to text (Whisper)
    2. Convert natural language to SQL (LangChain)
    3. Execute SQL safely
    4. Generate response
    5. Convert response to speech
    """
    try:
        # Step 1: Speech-to-Text using OpenAI Whisper
        logger.info("Processing audio file for STT")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Convert to text using Azure OpenAI Whisper
        with open(temp_file_path, "rb") as audio:
            transcript = azure_openai_client.audio.transcriptions.create(
                model=AZURE_OPENAI_WHISPER_DEPLOYMENT,
                file=audio
            )
            user_query = transcript.text
        
        logger.info(f"Transcribed query: {user_query}")
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        # Step 2: Natural Language to SQL using LangChain
        logger.info("Converting natural language to SQL")
        
        # Add context about the database schema
        schema_context = """
        You are working with a construction management database with the following main tables:
        - projects: Contains construction projects (id, name, description, status, start_date, end_date)
        - tasks: Contains project tasks (id, project_id, name, status, priority, assignee_id)
        - equipment: Contains equipment information (id, name, category, status, condition)
        - equipment_logs: Contains equipment usage logs (id, equipment_id, user_id, checkout_time, checkin_time)
        - user_profiles: Contains user information (id, full_name, role, email)
        - inventory: Contains inventory items (id, name, category, quantity, unit_price)
        
        Generate safe, read-only SQL queries only. Do not use INSERT, UPDATE, DELETE, DROP, or other modifying statements.
        """
        
        enhanced_query = f"{schema_context}\n\nUser question: {user_query}"
        
        try:
            # Use the SQL agent to generate and execute query
            result = agent.run(enhanced_query)
            
            # Step 3: Generate human-readable response
            logger.info("Generating response summary")
            
            summary_prompt = f"""
            Based on the following database query result, provide a clear, concise summary in natural language:
            
            User asked: {user_query}
            Database result: {result}
            
            Please provide a helpful summary that directly answers the user's question in a conversational tone.
            """
            
            response = azure_openai_client.chat.completions.create(
                model=AZURE_OPENAI_CHAT_DEPLOYMENT,
                messages=[{"role": "user", "content": summary_prompt}],
                max_tokens=500,
                temperature=0.7
            )
            
            response_text = response.choices[0].message.content
            logger.info(f"Generated response: {response_text}")
            
            # Step 4: Text-to-Speech using Azure OpenAI
            logger.info("Converting response to speech")
            
            tts_response = azure_openai_client.audio.speech.create(
                model=AZURE_OPENAI_TTS_DEPLOYMENT,
                voice="alloy",
                input=response_text
            )
            
            # Convert to audio stream
            audio_stream = io.BytesIO(tts_response.content)
            
            # Log the interaction
            supabase.table("voice_agent_logs").insert({
                "user_id": user_id,
                "query": user_query,
                "response": response_text,
                "sql_result": str(result),
                "created_at": datetime.utcnow().isoformat()
            }).execute()
            
            return StreamingResponse(
                io.BytesIO(tts_response.content),
                media_type="audio/mpeg",
                headers={"Content-Disposition": "attachment; filename=response.mp3"}
            )
            
        except Exception as e:
            logger.error(f"SQL processing error: {e}")
            error_message = "I'm sorry, I couldn't process your database query. Please try rephrasing your question."
            
            # Generate TTS for error message
            tts_response = azure_openai_client.audio.speech.create(
                model=AZURE_OPENAI_TTS_DEPLOYMENT,
                voice="alloy",
                input=error_message
            )
            
            return StreamingResponse(
                io.BytesIO(tts_response.content),
                media_type="audio/mpeg",
                headers={"Content-Disposition": "attachment; filename=error.mp3"}
            )
            
    except Exception as e:
        logger.error(f"Voice query processing error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/text-query")
async def process_text_query(
    query: dict,
    user_id: str = Depends(verify_admin_token)
):
    """
    Process text-based queries (for testing without audio)
    """
    try:
        user_query = query.get("text", "")
        if not user_query:
            raise HTTPException(status_code=400, detail="Query text is required")
        
        logger.info(f"Processing text query: {user_query}")
        
        # Same processing as voice query but skip STT
        schema_context = """
        You are working with a construction management database with the following main tables:
        - projects: Contains construction projects (id, name, description, status, start_date, end_date)
        - tasks: Contains project tasks (id, project_id, name, status, priority, assignee_id)
        - equipment: Contains equipment information (id, name, category, status, condition)
        - equipment_logs: Contains equipment usage logs (id, equipment_id, user_id, checkout_time, checkin_time)
        - user_profiles: Contains user information (id, full_name, role, email)
        - inventory: Contains inventory items (id, name, category, quantity, unit_price)
        
        Generate safe, read-only SQL queries only.
        """
        
        enhanced_query = f"{schema_context}\n\nUser question: {user_query}"
        result = agent.run(enhanced_query)
        
        return {
            "query": user_query,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Text query processing error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "azure_openai": bool(AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT),
            "azure_deployments": {
                "chat": bool(AZURE_OPENAI_CHAT_DEPLOYMENT),
                "whisper": bool(AZURE_OPENAI_WHISPER_DEPLOYMENT),
                "tts": bool(AZURE_OPENAI_TTS_DEPLOYMENT)
            },
            "supabase": bool(SUPABASE_URL and SUPABASE_SERVICE_KEY),
            "database": bool(DATABASE_URL)
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
