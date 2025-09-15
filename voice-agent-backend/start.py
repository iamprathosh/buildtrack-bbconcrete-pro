#!/usr/bin/env python3
"""
Voice Agent Backend Startup Script
Provides different startup modes and configuration validation
"""

import os
import sys
import argparse
from pathlib import Path
import uvicorn
from dotenv import load_dotenv

def load_environment():
    """Load environment variables from .env file"""
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        load_dotenv(env_file)
        print(f"✅ Loaded environment from {env_file}")
    else:
        print(f"⚠️  No .env file found at {env_file}")
        print("   Please create .env file from .env.example")

def validate_config():
    """Validate required configuration"""
    required_vars = [
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY', 
        'AZURE_OPENAI_API_KEY',
        'AZURE_OPENAI_ENDPOINT',
        'AZURE_OPENAI_CHAT_DEPLOYMENT',
        'AZURE_OPENAI_WHISPER_DEPLOYMENT',
        'AZURE_OPENAI_TTS_DEPLOYMENT',
        'DATABASE_URL',
        'JWT_SECRET'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n💡 Please check your .env file and ensure all required variables are set.")
        return False
    
    print("✅ All required environment variables are set")
    return True

def print_banner():
    """Print startup banner"""
    banner = """
🎤🤖 Voice Agent Backend
========================
Supabase + LangChain + Azure OpenAI + WebRTC

Features:
• Speech-to-Text with Azure OpenAI Whisper
• Natural Language to SQL with LangChain  
• Secure database queries with Supabase
• Text-to-Speech responses with Azure OpenAI
• Admin-only access control
"""
    print(banner)

def main():
    parser = argparse.ArgumentParser(description='Voice Agent Backend Server')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8000, help='Port to bind to')
    parser.add_argument('--reload', action='store_true', help='Enable auto-reload for development')
    parser.add_argument('--workers', type=int, default=1, help='Number of worker processes')
    parser.add_argument('--log-level', choices=['debug', 'info', 'warning', 'error'], 
                       default='info', help='Log level')
    parser.add_argument('--validate-only', action='store_true', 
                       help='Only validate configuration and exit')
    
    args = parser.parse_args()
    
    print_banner()
    load_environment()
    
    if not validate_config():
        sys.exit(1)
    
    if args.validate_only:
        print("✅ Configuration validation successful!")
        sys.exit(0)
    
    print(f"\n🚀 Starting server on {args.host}:{args.port}")
    print(f"📊 Log level: {args.log_level}")
    
    if args.reload:
        print("🔄 Auto-reload enabled (development mode)")
    
    try:
        uvicorn.run(
            "main:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
            workers=args.workers if not args.reload else 1,
            log_level=args.log_level,
            access_log=True,
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down gracefully...")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
