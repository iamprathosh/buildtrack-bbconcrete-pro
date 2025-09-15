# 🎤🤖 Voice Agent Quick Setup Guide

Complete setup instructions for the Supabase + LangChain + Azure OpenAI + WebRTC Voice Agent system.

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites Setup

You'll need:
- **Azure OpenAI Service** - Create resource in Azure Portal with deployed models
- **Supabase Project** - Your existing Supabase project

### 2. Backend Setup

```bash
cd voice-agent-backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your API keys (see below)
```

### 3. Configure Environment Variables

Edit `voice-agent-backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Azure OpenAI Configuration  
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Azure OpenAI Deployment Names (must match your deployed models)
AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4
AZURE_OPENAI_WHISPER_DEPLOYMENT=whisper
AZURE_OPENAI_TTS_DEPLOYMENT=tts

# Database URL (same as Supabase but for direct connection)
DATABASE_URL=postgresql://postgres:your_db_password@db.your-project-id.supabase.co:5432/postgres

# Security
JWT_SECRET=your-random-secret-key-here
```

### 4. Database Setup

The voice agent logs table has already been created in your Supabase database via the migration. 

### 5. Start the Backend

```bash
# From voice-agent-backend directory
python start.py --reload

# Or use the simple command:
uvicorn main:app --reload --port 8000
```

You should see:
```
🎤🤖 Voice Agent Backend
========================
✅ All required environment variables are set
🚀 Starting server on 0.0.0.0:8000
```

### 6. Frontend Integration

The VoiceAgentWidget is already integrated into your React app! It will automatically appear as a floating button in the bottom-right corner for admin users.

## 🎯 Testing the System

### 1. Check Backend Health

Visit: http://localhost:8000/health

Should return:
```json
{
  "status": "healthy",
  "services": {
    "azure_openai": true,
    "azure_deployments": {
      "chat": true,
      "whisper": true,
      "tts": true
    },
    "supabase": true,
    "database": true
  }
}
```

### 2. Test with Admin User

1. Log in as an admin user in your React app
2. Look for the floating brain icon (🧠) in the bottom-right corner
3. Click it to open the Voice Agent dialog
4. Try asking: "Show me all active projects"

### 3. Voice Testing

1. Click the red microphone button
2. Grant microphone permissions when prompted
3. Speak your question clearly
4. Click the microphone again to stop recording
5. Wait for processing and audio response

### 4. Text Testing (Alternative)

1. Click "Show Text Input" in the dialog
2. Type: "How many projects do we have?"
3. Click "Process Query"

## 🔧 Configuration Options

### Backend URL Configuration

If running on different ports or domains, update the frontend fetch URLs in `VoiceAgentWidget.tsx`:

```tsx
// Change these lines if needed
const response = await fetch('http://localhost:8000/voice-query', {
const response = await fetch('http://localhost:8000/text-query', {
```

### Audio Settings

Customize voice and models in `main.py`:

```python
# Text-to-Speech settings
tts_response = openai.Audio.speech.create(
    model="tts-1",           # or "tts-1-hd" for higher quality
    voice="alloy",           # or "echo", "fable", "onyx", "nova", "shimmer"
    input=response_text
)
```

## 🚨 Troubleshooting

### Common Issues

**1. "No authentication token found"**
- Make sure you're logged in as an admin user
- Check that JWT_SECRET matches between backend and frontend

**2. "Admin access required"** 
- Verify user has `role = 'admin'` in user_profiles table
- Check RLS policies are working

**3. Microphone not working**
- Grant microphone permissions in browser
- Use Chrome or Firefox (best compatibility)
- Check HTTPS requirement for production

**4. Backend connection errors**
- Verify backend is running on port 8000
- Check CORS settings in main.py
- Update frontend URLs if using different ports

### Debug Mode

Start backend with debug logging:
```bash
python start.py --log-level debug --reload
```

### Database Queries Debug

Check what SQL is being generated:
```bash
# In your backend logs, look for LangChain agent output
# It will show the SQL queries being generated and executed
```

## 🎉 You're Ready!

Once everything is working, you'll have:

✅ **Voice input** - Speak questions naturally  
✅ **AI processing** - GPT-4 converts speech to SQL queries  
✅ **Database queries** - Safe, read-only access to your construction data  
✅ **Voice responses** - AI speaks the results back to you  
✅ **Admin security** - Only admins can access the system  
✅ **Query logging** - All interactions are logged for audit

## 📞 Example Voice Queries

Try these questions:

- "How many active projects do we have?"
- "Show me all equipment that's currently checked out"  
- "List any overdue tasks"
- "What inventory items are running low?"
- "Who are our top project managers?"
- "How much equipment does John have checked out?"

The AI will understand natural language and convert it to appropriate SQL queries against your database!

## 🚀 Production Deployment

For production deployment:

1. Set up proper environment variables
2. Use `gunicorn` instead of `uvicorn` for better performance
3. Set up HTTPS/SSL
4. Configure proper CORS origins
5. Set up monitoring and logging
6. Use Docker containers for easier deployment

See the full README.md for detailed production deployment instructions.
