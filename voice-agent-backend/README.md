# Voice Agent Backend 🎤🤖

Complete Voice Agent implementation with Supabase + LangChain + Azure OpenAI + WebRTC integration for construction management database queries.

## 🚀 Features

- **Speech-to-Text**: Azure OpenAI Whisper integration for voice input
- **Natural Language to SQL**: LangChain with Azure OpenAI GPT-4 for query translation
- **Database Integration**: Secure read-only connection to Supabase Postgres
- **Text-to-Speech**: Azure OpenAI TTS for audio responses
- **Admin Authentication**: JWT-based security with admin-only access
- **Query Logging**: All interactions logged for audit purposes
- **Error Handling**: Robust error handling with user-friendly responses

## 🏗️ Architecture

```
Frontend (React) → FastAPI Backend → Azure OpenAI Services → Supabase Database
                                  ↓
                              LangChain Agent
```

## 📋 Prerequisites

- Python 3.9+
- Supabase project with database
- Azure OpenAI Service resource with deployed models
- Node.js (for frontend)

## 🔧 Installation

### 1. Backend Setup

```bash
cd voice-agent-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Azure OpenAI
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4
AZURE_OPENAI_WHISPER_DEPLOYMENT=whisper
AZURE_OPENAI_TTS_DEPLOYMENT=tts

# Database (Read-only connection)
DATABASE_URL=postgresql://readonly_user:password@db.supabaseproject.co:5432/postgres

# Security
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Database Setup

Run the migration to create the voice agent logs table:

```sql
-- Apply migration from migrations/001_voice_agent_logs.sql
-- This creates the voice_agent_logs table with proper RLS policies
```

### 4. Create Read-Only Database User

For security, create a read-only database user:

```sql
-- Connect to your Supabase database as admin
CREATE USER readonly_voice_agent WITH PASSWORD 'secure_password_here';

-- Grant read-only access to necessary tables
GRANT CONNECT ON DATABASE postgres TO readonly_voice_agent;
GRANT USAGE ON SCHEMA public TO readonly_voice_agent;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_voice_agent;

-- Ensure future tables are accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_voice_agent;
```

## 🚀 Running the Application

### Development

```bash
# Start the FastAPI backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production

```bash
# Using gunicorn (install with: pip install gunicorn)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 🔌 API Endpoints

### Health Check
```http
GET /
GET /health
```

### Voice Query Processing
```http
POST /voice-query
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Body: audio file (WAV/MP3)
Response: Audio stream (MP3)
```

### Text Query Processing (Testing)
```http
POST /text-query
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "text": "How many active projects do we have?"
}
```

## 🛡️ Security Features

- **JWT Authentication**: Validates user tokens from Supabase Auth
- **Admin-Only Access**: Checks user role before processing queries
- **Read-Only Database**: Separate database user with SELECT permissions only
- **SQL Injection Protection**: LangChain agent validates and sanitizes queries
- **Query Logging**: All interactions logged for audit and monitoring
- **CORS Protection**: Configurable origins for frontend integration

## 🎯 Frontend Integration

The React widget (`VoiceAgentWidget.tsx`) provides:

- **Floating Action Button**: Bottom-right corner for easy access
- **Voice Recording**: WebRTC audio capture with visual feedback
- **Audio Playback**: Automatic playback of AI responses
- **Text Alternative**: Text input option for testing
- **Admin-Only Visibility**: Automatically hidden for non-admin users

### Usage in React

```tsx
import VoiceAgentWidget from '@/components/VoiceAgentWidget';

// Widget automatically appears for admin users
// No additional configuration needed - it's integrated into AppLayout
```

## 📊 Database Schema Support

The AI agent understands these main tables:

- `projects` - Construction projects
- `tasks` - Project tasks and assignments
- `equipment` - Equipment inventory and status
- `equipment_logs` - Equipment checkout/checkin logs
- `user_profiles` - User information and roles
- `inventory` - Material inventory

### Example Queries

- "Show me all active projects"
- "How much equipment is currently checked out?"
- "List all overdue tasks"
- "What inventory items are below minimum stock?"
- "Who has the most equipment checked out?"

## 🔍 Monitoring & Logging

### Application Logs
```bash
# View real-time logs
tail -f logs/voice_agent.log
```

### Query Logs
All voice interactions are stored in the `voice_agent_logs` table:

```sql
SELECT * FROM voice_agent_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🚨 Troubleshooting

### Common Issues

**1. Authentication Errors**
- Verify JWT_SECRET matches frontend configuration
- Check user has 'admin' role in user_profiles table
- Ensure Supabase service key is correct

**2. Database Connection Issues**
- Verify DATABASE_URL format and credentials
- Check read-only user permissions
- Test connection manually with psql

**3. OpenAI API Errors**
- Verify API key is valid and has sufficient credits
- Check rate limits and quota
- Monitor usage in OpenAI dashboard

**4. Audio Issues**
- Ensure microphone permissions are granted
- Check browser compatibility (Chrome/Firefox recommended)
- Verify audio file format compatibility

## 🔧 Configuration Options

### Audio Settings
```python
# In main.py, customize audio processing
AUDIO_FORMAT = "wav"  # Supported: wav, mp3, m4a
MAX_AUDIO_SIZE = 25 * 1024 * 1024  # 25MB limit
```

### AI Model Settings
```python
# Customize models used
WHISPER_MODEL = "whisper-1"      # STT model
CHAT_MODEL = "gpt-4"             # NL to SQL model
TTS_MODEL = "tts-1"              # Text-to-speech model
TTS_VOICE = "alloy"              # Voice: alloy, echo, fable, onyx, nova, shimmer
```

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

```env
# Production settings
LOG_LEVEL=INFO
CORS_ORIGINS=https://yourdomain.com
DATABASE_URL=postgresql://readonly_user:secure_password@prod-db:5432/postgres
```

## 📈 Performance Optimization

- **Connection Pooling**: SQLAlchemy pool configuration
- **Async Processing**: FastAPI async endpoints
- **Caching**: LangChain agent caching for repeated queries
- **Rate Limiting**: Implement rate limiting for production use

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review application logs
3. Create an issue with detailed error information
