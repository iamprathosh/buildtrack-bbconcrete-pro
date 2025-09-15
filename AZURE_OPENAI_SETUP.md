# Azure OpenAI Setup Guide for Voice Agent 🎤🤖

Complete guide to setting up Azure OpenAI Service for the Voice Agent system.

## 🚀 Why Azure OpenAI?

Azure OpenAI provides:
- **Enterprise Security**: Enhanced security and compliance
- **Private Networking**: VNet integration and private endpoints
- **Data Residency**: Control over data location and processing
- **SLA Guarantees**: Enterprise-grade service level agreements
- **Cost Management**: Better pricing and billing integration with Azure

## 📋 Prerequisites

- Active Azure subscription
- Azure CLI installed (optional but recommended)
- Appropriate permissions to create Azure OpenAI resources

## 🔧 Step 1: Create Azure OpenAI Resource

### Via Azure Portal

1. **Sign in** to [Azure Portal](https://portal.azure.com)

2. **Create Resource**:
   - Search for "Azure OpenAI"
   - Click "Azure OpenAI Service"
   - Click "Create"

3. **Configure Basic Settings**:
   ```
   Subscription: Your Azure subscription
   Resource Group: Create new or select existing
   Region: Choose region (e.g., East US, West Europe)
   Name: your-voice-agent-openai (must be globally unique)
   Pricing Tier: Standard S0
   ```

4. **Review and Create**:
   - Review settings
   - Click "Create"
   - Wait for deployment to complete

### Via Azure CLI (Alternative)

```bash
# Create resource group (if needed)
az group create --name voice-agent-rg --location eastus

# Create Azure OpenAI resource
az cognitiveservices account create \
  --name your-voice-agent-openai \
  --resource-group voice-agent-rg \
  --location eastus \
  --kind OpenAI \
  --sku s0
```

## 🚀 Step 2: Deploy Required Models

You need to deploy 3 models for the Voice Agent:

### 1. GPT-4 for Chat/NL-to-SQL

1. **Navigate** to your Azure OpenAI resource
2. **Go to** "Model deployments" or "Azure OpenAI Studio"
3. **Deploy Model**:
   ```
   Model: gpt-4 (or gpt-4-32k for longer contexts)
   Deployment name: gpt-4
   Version: Latest available
   Tokens per minute rate limit: 30K (or higher based on needs)
   ```

### 2. Whisper for Speech-to-Text

1. **Deploy Model**:
   ```
   Model: whisper
   Deployment name: whisper
   Version: Latest available
   Tokens per minute rate limit: 30K
   ```

### 3. TTS for Text-to-Speech

1. **Deploy Model**:
   ```
   Model: tts-1 (or tts-1-hd for higher quality)
   Deployment name: tts
   Version: Latest available
   Tokens per minute rate limit: 30K
   ```

## 🔑 Step 3: Get Configuration Details

### API Key and Endpoint

1. **Navigate** to your Azure OpenAI resource
2. **Go to** "Keys and Endpoint" section
3. **Copy** the following:
   - **Key 1** (API Key)
   - **Endpoint** URL
   - **Location/Region**

### Deployment Names

Verify your deployment names in "Model deployments" section:
- Chat deployment name (e.g., "gpt-4")
- Whisper deployment name (e.g., "whisper")  
- TTS deployment name (e.g., "tts")

## ⚙️ Step 4: Configure Environment Variables

Create/update your `.env` file:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=1234567890abcdef1234567890abcdef  # Your API Key
AZURE_OPENAI_ENDPOINT=https://your-voice-agent-openai.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Azure OpenAI Deployment Names (must match your deployments)
AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4
AZURE_OPENAI_WHISPER_DEPLOYMENT=whisper
AZURE_OPENAI_TTS_DEPLOYMENT=tts
```

## 🧪 Step 5: Test Your Setup

### Test Script

Create a test file `test_azure_openai.py`:

```python
import os
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

# Test chat completion
try:
    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT"),
        messages=[{"role": "user", "content": "Hello, Azure OpenAI!"}],
        max_tokens=50
    )
    print("✅ Chat model working:", response.choices[0].message.content)
except Exception as e:
    print("❌ Chat model error:", e)

# Test TTS
try:
    tts_response = client.audio.speech.create(
        model=os.getenv("AZURE_OPENAI_TTS_DEPLOYMENT"),
        voice="alloy",
        input="Hello from Azure OpenAI!"
    )
    print("✅ TTS model working")
except Exception as e:
    print("❌ TTS model error:", e)
```

Run the test:
```bash
python test_azure_openai.py
```

## 🔒 Step 6: Security Best Practices

### Network Security

1. **Enable Private Endpoints** (Production):
   - Configure VNet integration
   - Restrict public access
   - Use Azure Private Link

2. **Configure Firewall Rules**:
   - Whitelist specific IP ranges
   - Enable Azure services access

### Access Control

1. **Use Managed Identity** (Advanced):
   ```python
   from azure.identity import DefaultAzureCredential
   from openai import AzureOpenAI
   
   credential = DefaultAzureCredential()
   client = AzureOpenAI(
       azure_ad_token_provider=credential,
       api_version="2024-02-15-preview",
       azure_endpoint="https://your-resource.openai.azure.com/"
   )
   ```

2. **Key Rotation**:
   - Regularly rotate API keys
   - Use Azure Key Vault for key management

## 💰 Step 7: Cost Management

### Monitor Usage

1. **Set up Budgets**:
   - Configure spending alerts
   - Set monthly limits

2. **Monitor Metrics**:
   - Track token usage per model
   - Monitor request patterns

### Optimize Costs

1. **Right-size Deployments**:
   - Adjust TPM limits based on usage
   - Scale deployments as needed

2. **Choose Appropriate Models**:
   - Use GPT-3.5-turbo for simpler queries
   - Reserve GPT-4 for complex NL-to-SQL tasks

## 🚨 Troubleshooting

### Common Issues

**1. "The API deployment for this resource does not exist"**
- Verify deployment names in environment variables
- Check model deployment status in Azure Portal

**2. "Quota exceeded"**
- Check TPM limits in model deployments
- Request quota increase if needed

**3. "Invalid API key"**
- Verify API key is correct
- Check if key has been regenerated

**4. "Model not available in region"**
- Check model availability in your region
- Consider using different region or model version

### Debug Commands

```bash
# Check resource status
az cognitiveservices account show --name your-voice-agent-openai --resource-group voice-agent-rg

# List deployments
az cognitiveservices account deployment list --name your-voice-agent-openai --resource-group voice-agent-rg
```

## 📊 Model Specifications

| Model | Use Case | Max Tokens | Notes |
|-------|----------|------------|-------|
| GPT-4 | NL-to-SQL, Chat | 8,192 | Best for complex reasoning |
| GPT-4-32k | Long context queries | 32,768 | For complex database schemas |
| Whisper | Speech-to-Text | N/A | Supports multiple languages |
| TTS-1 | Text-to-Speech | N/A | Standard quality |
| TTS-1-HD | High-quality TTS | N/A | Better audio quality |

## 🎯 Production Recommendations

1. **Use separate resources for dev/prod**
2. **Enable diagnostic logging**
3. **Set up monitoring and alerting**
4. **Configure content filtering policies**
5. **Implement retry logic with exponential backoff**
6. **Use connection pooling for high-volume scenarios**

## 🔗 Useful Links

- [Azure OpenAI Service Documentation](https://docs.microsoft.com/azure/cognitive-services/openai/)
- [Azure OpenAI Studio](https://oai.azure.com/)
- [Model Availability by Region](https://docs.microsoft.com/azure/cognitive-services/openai/concepts/models)
- [Pricing Information](https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/)

## 🆘 Getting Help

1. **Azure Support**: Create support ticket in Azure Portal
2. **Documentation**: Check official Azure OpenAI docs  
3. **Community**: Azure OpenAI forums and Stack Overflow
4. **Status**: Check [Azure Status Page](https://status.azure.com/) for service issues

---

Once your Azure OpenAI resource is set up with all three model deployments, you're ready to run the Voice Agent system! 🎉
