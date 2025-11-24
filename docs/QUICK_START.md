# Quick Start - Test the Universal Canvas Experience

## 🧪 UAT Testing (Simplest Way)

**No technical knowledge needed!**

1. Start app: `npm run dev` (or `docker-compose up`)
2. Open: http://localhost:3000/uat
3. Follow the simple instructions in the UAT portal
4. Copy report and paste in chat

See [Simple UAT Guide](SIMPLE_UAT_GUIDE.md) for details.

---

## 🚀 Development Quick Start

## 🚀 Fastest Way to Start

### Option 1: Use the Start Script (Recommended)

**Windows (PowerShell):**
```powershell
.\scripts\start-dev.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # First time only
npm run dev
```

## 🌐 Access the Application

Once both servers are running:

1. **Universal Canvas** (Main Experience):
   - Open: http://localhost:3000/canvas
   - This is the initial public experience

2. **Homepage**:
   - Open: http://localhost:3000
   - Features the Universal Canvas prominently

3. **Backend API**:
   - API Docs: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

## ✅ Verify It's Working

### Check Backend:
```powershell
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:8000/health"
```

```bash
# Linux/Mac
curl http://localhost:8000/health
```

### Check Frontend:
Open http://localhost:3000 in your browser

### Check Canvas:
Open http://localhost:3000/canvas and try drawing!

## 🎨 Testing the Universal Canvas

1. **Drawing**: Click and drag to draw
2. **Color**: Change color with the color picker
3. **Size**: Adjust brush size with the slider
4. **Save**: Click "Save" to save locally
5. **Export**: Click "Export" to download as PNG
6. **Offline**: Disconnect internet - it still works!

## 🔧 Troubleshooting

### Port Already in Use?
- Backend (8000): Change port in command: `--port 8080`
- Frontend (3000): Set PORT: `$env:PORT=8080; npm run dev`

### Dependencies Missing?
- Backend: `pip install -r backend/requirements.txt`
- Frontend: `cd frontend && npm install`

### Can't Connect?
- Ensure both servers are running
- Check firewall settings
- Verify ports aren't blocked

## 📝 Next Steps

After testing the canvas:
- Try `/assessment` - Capability assessment
- Try `/marketplace` - Marketplace listings
- Try `/xdmiq` - XDMIQ assessment
- Try `/auth` - Authentication

Enjoy testing! 🎉

