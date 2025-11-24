# Overnight Data Generation

Generate simulated jobs and candidate profiles using Ollama while you sleep!

## Quick Start

Run this in WARP or PowerShell:

```bash
warp generate-data
```

Or directly:

```powershell
.\scripts\run-overnight-data-generation.ps1
```

## What It Does

1. **Generates Jobs** (default: 50)
   - Realistic job titles and descriptions
   - Required and preferred skills
   - Uses Ollama to generate professional content

2. **Generates Candidates** (default: 100)
   - Anonymous user profiles
   - LLC profiles with skills
   - Experience summaries
   - Portfolio projects
   - Uses Ollama for realistic content

## Configuration

Set environment variables to customize:

```powershell
$env:MAX_JOBS = 100        # Number of jobs to generate
$env:MAX_CANDIDATES = 200  # Number of candidates to generate
.\scripts\run-overnight-data-generation.ps1
```

Or edit the script defaults:
- `MAX_JOBS`: Default 50
- `MAX_CANDIDATES`: Default 100
- `REQUESTS_PER_MINUTE`: Default 10 (rate limiting)

## How It Works

1. **Uploads Script**: Copies `generate-test-data.py` to VM
2. **Starts Background Job**: Runs in background with `nohup`
3. **Uses Ollama**: Generates realistic content via llama3.2
4. **Rate Limited**: 10 requests/minute to avoid overwhelming Ollama
5. **Logs Everything**: Output saved to `/tmp/overnight-data-generation.log`

## Monitor Progress

### Check Logs
```bash
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="tail -f /tmp/overnight-data-generation.log"
```

### Check if Still Running
```bash
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="ps aux | grep generate-test-data"
```

### Check Database Stats
```bash
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="docker-compose exec -T postgres psql -U jobfinder -d jobfinder -c 'SELECT COUNT(*) as jobs FROM job_postings; SELECT COUNT(*) as candidates FROM anonymous_users;'"
```

## Estimated Time

- **50 jobs**: ~50-60 minutes (10 requests/min)
- **100 candidates**: ~100-120 minutes (10 requests/min)
- **Total**: ~2.5-3 hours for default settings

## Safety Features

- ✅ Rate limiting (won't overwhelm Ollama)
- ✅ Error handling with retries
- ✅ Progress logging
- ✅ Database transaction safety
- ✅ Checks existing data (won't duplicate)
- ✅ Background execution (survives SSH disconnect)

## What Gets Generated

### Jobs Include:
- Professional job titles
- Detailed descriptions (150-200 words)
- Required skills (3-6 AI tools)
- Preferred skills (2-4 additional tools)
- Active status

### Candidates Include:
- Anonymous user IDs
- Skills (5-12 AI tools)
- Experience summaries (100-150 words)
- Portfolio projects (2-5 projects)
- Realistic metadata

## Troubleshooting

### Script Not Running
```bash
# Check if Ollama is running
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="curl http://localhost:11434/api/tags"
```

### Database Connection Issues
```bash
# Check if database is accessible
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="docker-compose exec -T postgres psql -U jobfinder -d jobfinder -c 'SELECT 1;'"
```

### View Full Logs
```bash
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="cat /tmp/overnight-data-generation.log"
```

## After Completion

Your database will be populated with:
- ✅ Realistic job postings
- ✅ Diverse candidate profiles
- ✅ Ready for matching algorithm testing
- ✅ Chat interface testing data

## Next Steps

After data generation completes:
1. Test matching algorithm: `https://jobmatch.zip/api/matching`
2. Test chat interface: `https://jobmatch.zip`
3. View jobs: `https://jobmatch.zip/api/jobs` (if endpoint exists)
4. View candidates: `https://jobmatch.zip/api/candidates` (if endpoint exists)

