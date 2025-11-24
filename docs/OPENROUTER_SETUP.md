# OpenRouter Setup Guide

## Why OpenRouter?

OpenRouter gives you access to the best AI models (Claude, GPT-4, etc.) at **significantly lower costs** than direct APIs:

- **Claude 3.5 Sonnet**: ~$3/1M tokens (vs $15+ via Anthropic direct)
- **Claude 3 Haiku**: ~$0.25/1M tokens (ultra fast, cheap)
- **Llama 3.1 70B**: ~$0.50/1M tokens (great quality, cheap)
- **GPT-4 Turbo**: Available if needed

**Plus**: Unified API, automatic failover, and pay-as-you-go billing.

---

## Quick Setup (5 minutes)

### 1. Get Your API Key

1. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up (GitHub OAuth is easiest)
3. Create a new API key
4. Copy the key (starts with `sk-or-v1-...`)

### 2. Add to Your Environment

Create or edit `.env` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env` and add your key:

```env
# LLM Configuration
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
LLM_MODEL=anthropic/claude-3.5-sonnet
```

### 3. Test It

```bash
# Start your backend
cd backend
python -m uvicorn main:app --reload

# In another terminal, test the chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Say hello!"}
    ]
  }'
```

---

## Model Recommendations

### For Chat UI (Best Quality)
```env
LLM_MODEL=anthropic/claude-3.5-sonnet
```
- **Best conversational AI**
- Context-aware, natural responses
- ~$3/1M tokens (~$0.003 per 1000 tokens)

### For Chat UI (Fast & Cheap)
```env
LLM_MODEL=anthropic/claude-3-haiku
```
- **Blazing fast** responses
- Still very good quality
- ~$0.25/1M tokens (~$0.00025 per 1000 tokens)

### For Background Tasks (Cheapest)
```env
LLM_MODEL=meta-llama/llama-3.1-70b-instruct
```
- Good for matching, assessments
- ~$0.50/1M tokens
- Open source model

---

## GitHub Secrets (For Deployment)

If deploying via GitHub Actions:

1. Go to your repo → Settings → Secrets and variables → Actions
2. Add repository secret:
   - Name: `OPENROUTER_API_KEY`
   - Value: `sk-or-v1-your-key-here`

Update your `.github/workflows/*.yml`:

```yaml
env:
  OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
  LLM_PROVIDER: openrouter
  LLM_MODEL: anthropic/claude-3.5-sonnet
```

---

## Cost Estimation

### Typical Chat Session
- **20 messages** (10 back-and-forth)
- **~2,000 tokens** total (input + output)
- **Cost with Claude Sonnet**: ~$0.006 (less than 1 cent)
- **Cost with Claude Haiku**: ~$0.0005 (half a cent)

### 1,000 Users Per Month
- 10 chat sessions each
- 200,000 messages total
- **~$120/month** (Claude Sonnet)
- **~$10/month** (Claude Haiku)

Compare to:
- **OpenAI GPT-4**: ~$600/month
- **Anthropic Direct**: ~$300/month
- **Ollama llama3.2**: Free but poor quality

---

## Fallback to Ollama

The system automatically falls back to Ollama if:
- No API key is set
- OpenRouter is unavailable
- API key is invalid

To force Ollama (local only):

```env
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.2
```

---

## Advanced Configuration

### Multiple Providers

You can switch providers by environment:

**Development** (local, free):
```env
LLM_PROVIDER=ollama
```

**Production** (high quality):
```env
LLM_PROVIDER=openrouter
LLM_MODEL=anthropic/claude-3.5-sonnet
```

### Custom System Prompts

Edit `frontend/config/chat-prompts.ts` to customize the chat personality. The LLM will follow these prompts while maintaining conversational intelligence.

### Rate Limiting

OpenRouter has built-in rate limiting. For high-volume:

1. Go to [https://openrouter.ai/settings](https://openrouter.ai/settings)
2. Set up credits or billing
3. Adjust rate limits as needed

---

## Troubleshooting

### "OPENROUTER_API_KEY not set"
→ Check your `.env` file exists and has the key

### "Connection refused"
→ Make sure you have internet access (OpenRouter is cloud-based)

### "Model not found"
→ Check available models: https://openrouter.ai/models

### Still seeing Ollama behavior
→ Restart your backend after updating `.env`

---

## Code Integration

The unified LLM client is already integrated. Use it anywhere:

```python
from backend.llm import get_llm_client

llm = get_llm_client()

response = llm.chat(
    messages=[
        {"role": "system", "content": "You are a job matching assistant."},
        {"role": "user", "content": "Tell me about this job."}
    ],
    temperature=0.7,
    max_tokens=500
)

print(response)  # Natural, intelligent response
```

---

## Next Steps

1. **Get your API key** → [openrouter.ai/keys](https://openrouter.ai/keys)
2. **Add to `.env`**
3. **Test with chat endpoint**
4. **Monitor costs** at [openrouter.ai/activity](https://openrouter.ai/activity)

Your chat will be **dramatically smarter** with OpenRouter! 🚀
