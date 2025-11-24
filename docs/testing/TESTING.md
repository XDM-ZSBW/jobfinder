# Testing the Universal Canvas Experience

## Quick Start

### 1. Start Backend Server

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 2. Start Frontend Server

```bash
cd frontend
npm install  # First time only
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### 3. Access Universal Canvas

Open your browser and navigate to:
- **Universal Canvas**: `http://localhost:3000/canvas`
- **Homepage**: `http://localhost:3000`
- **API Health**: `http://localhost:8000/health`

## Testing Features

### Universal Canvas (`/canvas`)
- Drawing with pen tool
- Eraser tool
- Color picker
- Brush size control
- Save to local storage
- Export as PNG
- Offline mode detection
- Low bandwidth mode detection

### Other Pages
- `/assessment` - Capability assessment
- `/matching` - Job matching
- `/marketplace` - Marketplace listings
- `/xdmiq` - XDMIQ assessment
- `/auth` - Authentication

## Troubleshooting

### Backend not starting?
- Check Python version: `python --version` (needs 3.11+)
- Install dependencies: `pip install -r backend/requirements.txt`
- Check database connection (PostgreSQL not required for basic testing)

### Frontend not starting?
- Install dependencies: `cd frontend && npm install`
- Check Node version: `node --version` (needs 18+)
- Clear cache: `rm -rf .next` (or `rmdir /s .next` on Windows)

### Canvas not loading?
- Check browser console for errors
- Ensure backend is running on port 8000
- Check CORS settings in `backend/config.py`

## Development Mode

Both servers run in development mode with hot reload:
- Backend: Auto-reloads on code changes
- Frontend: Hot module replacement (HMR)

## Port Configuration

- Backend: `8000` (configurable in `backend/main.py`)
- Frontend: `3000` (configurable in `frontend/package.json`)

To change ports:
- Backend: `uvicorn main:app --port 8080`
- Frontend: `PORT=8080 npm run dev` (or edit `package.json`)

