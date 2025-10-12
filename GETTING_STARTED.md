# WiiM Mini UI - Quick Start Guide

## 🚀 Simplified Architecture

This project uses a **hybrid approach** optimized for macOS/Windows development:

- **Backend**: Runs **natively** on your machine (required for UPnP device discovery)
- **Frontend**: Can run natively OR in Docker (your choice!)

```
┌─────────────────────────────────────────────────┐
│            Your Mac/Windows Computer            │
│                                                 │
│  ┌──────────────┐         ┌─────────────────┐ │
│  │   Backend    │◄────────┤    Frontend     │ │
│  │   (Native)   │  HTTP   │  (Docker/Native)│ │
│  │  Port 8080   │         │   Port 3000     │ │
│  └──────┬───────┘         └─────────────────┘ │
│         │                                       │
│         │ UPnP/SSDP                            │
│         │ Multicast                            │
│         ▼                                       │
│  ┌─────────────┐                               │
│  │   Network   │                               │
│  │  Interface  │                               │
│  └──────┬──────┘                               │
│         │                                       │
└─────────┼───────────────────────────────────────┘
          │
          ▼
   ┌─────────────┐
   │ WiiM Devices│
   │   (UPnP)    │
   └─────────────┘
```

## 📦 Prerequisites

- **Node.js** 18+ (for backend)
- **npm** (comes with Node.js)
- **Docker Desktop** (optional, only if running frontend in Docker)

## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/chrishuangcf/wiim-mini-ui.git
cd wiim-mini-ui

# Install dependencies for both frontend and backend
npm run init
```

## 🎯 Running the Application

You have **two options** for running the application:

### Option 1: Fully Native (Recommended for Development)

**Advantages:**
- ✅ Hot reload for both frontend and backend
- ✅ Fastest development workflow
- ✅ Easy debugging
- ✅ UPnP discovery works perfectly

```bash
# Terminal 1: Start Backend (Required!)
npm run server:dev
# Backend runs on http://localhost:8080
# Watch for "Web Server started" message

# Terminal 2: Start Frontend  
npm run ui:dev
# Frontend runs on http://localhost:5173
# Auto-opens in browser
```

**Access the app:** http://localhost:5173

### Option 2: Hybrid (Docker Frontend + Native Backend)

**Advantages:**
- ✅ Tests production Docker build
- ✅ Closer to production environment
- ✅ UPnP discovery still works (backend is native)
- ⚠️ No hot reload for frontend

```bash
# Terminal 1: Start Backend (Required!)
npm run server:dev
# Backend runs on http://localhost:8080

# Terminal 2: Start Frontend in Docker
npm run ui:docker
# Frontend runs on http://localhost:3000
# Takes a few minutes first time (Docker build)
```

**Access the app:** http://localhost:3000

**To stop Docker frontend:**
```bash
npm run ui:docker:stop
```

## 🏥 Health Indicator

Look for the **health indicator chip** in the top-right corner:

- 🟢 **Green**: Backend online, UPnP working
- 🟡 **Yellow**: Backend online, issues detected  
- 🔴 **Red**: Backend offline

**Click the indicator** to see:
- Backend uptime
- UPnP device count
- Selected device status
- Last check timestamp

## 🔍 Troubleshooting

### Backend Shows "Backend Offline"

```bash
# Check if backend is running
lsof -i :8080

# If nothing, start backend:
npm run server:dev
```

### No UPnP Devices Found (deviceCount: 0)

1. **Check WiiM device is on same network**
   - Both your computer and WiiM must be on same WiFi/LAN

2. **Check backend is running natively (not Docker)**
   ```bash
   # Backend must be native for UPnP
   npm run server:dev
   ```

3. **Check firewall settings**
   - Allow UDP port 1900 for SSDP
   - Allow incoming connections for Node.js

4. **Restart WiiM device**
   - Power cycle the device
   - Wait 30 seconds for it to boot

5. **Test SSDP manually** (optional)
   ```bash
   # Listen for SSDP broadcasts
   sudo tcpdump -i any 'udp port 1900'
   # Should see M-SEARCH packets when backend starts
   ```

### Docker Frontend Can't Connect to Backend

```bash
# 1. Verify backend is running
curl http://localhost:8080/health

# 2. Rebuild Docker frontend
npm run ui:docker:stop
npm run ui:docker

# 3. Check Docker logs
docker logs wiim-frontend
```

### Port Already in Use

```bash
# Find what's using the port
lsof -i :8080  # Backend
lsof -i :3000  # Docker frontend
lsof -i :5173  # Native frontend

# Kill the process
kill -9 <PID>
```

## 📝 Available Commands

| Command | Description |
|---------|-------------|
| `npm run init` | Install all dependencies |
| `npm run server:dev` | Start backend natively (port 8080) |
| `npm run ui:dev` | Start frontend natively (port 5173) |
| `npm run ui:docker` | Start frontend in Docker (port 3000) |
| `npm run ui:docker:stop` | Stop Docker frontend |
| `npm run build` | Build frontend for production |
| `npm run serve:ui` | Build and serve with backend |

## 🎨 Development Workflow

### Making Changes to Backend

```bash
# Backend auto-reloads on file changes
# Just edit files in wiim_server/
# No restart needed!
```

### Making Changes to Frontend

**Native mode** (recommended):
```bash
# Vite hot-reloads automatically
# Edit files in web_client/src/
# Changes appear instantly in browser
```

**Docker mode**:
```bash
# Rebuild after changes
npm run ui:docker:stop
npm run ui:docker
```

## 🚢 Production Deployment

### Option A: Manual Deployment

```bash
# Build frontend
npm run build

# Copy files to server
# Frontend: web_client/dist/* → /var/www/html/
# Backend:  wiim_server/*    → /opt/wiim-server/

# On server, install dependencies
cd /opt/wiim-server
npm install --production

# Start backend (use PM2 or systemd)
node server.js
```

### Option B: Linux Server with Docker

On a **Linux server** (not macOS/Windows), you can use full Docker:

```yaml
# docker-compose-linux.yaml
services:
  backend:
    network_mode: host  # Works on Linux!
    # ... rest of config
```

```bash
# On Linux server
docker compose -f docker-compose-linux.yaml up -d
```

### Option C: Raspberry Pi

Perfect for Raspberry Pi deployment:

```bash
# On Raspberry Pi (Linux ARM64)
git clone <repo>
cd wiim-mini-ui

# Use host networking for UPnP
docker compose up -d

# Backend will discover UPnP devices!
```

## 🔐 SSL Certificates (Corporate Networks)

The frontend Docker image supports custom CA certificates:

```yaml
# docker-compose.yaml
services:
  frontend:
    volumes:
      - ~/.ssh:/root/.ssh:ro  # Mount your certificates
```

## 🌟 Features

- ✅ Real-time "Now Playing" information
- ✅ Album art display
- ✅ Playback controls (Play, Pause, Next, Previous)
- ✅ Volume control
- ✅ UPnP device discovery and selection
- ✅ Service health monitoring
- ✅ Support for multiple streaming services:
  - Spotify
  - Qobuz
  - Amazon Music
  - Deezer
  - TuneIn Radio
  - iHeart Radio
  - Local DLNA servers

## 📚 Additional Documentation

- **DOCKER_UPNP_LIMITATIONS.md** - Why UPnP doesn't work in Docker on macOS
- **HEALTH_MONITORING.md** - Health check system details
- **DEVELOPMENT_GUIDE.md** - Extended development documentation
- **SSL_CERTIFICATE_SETUP.md** - SSL configuration guide

## 🆘 Getting Help

1. Check the health indicator first
2. Review troubleshooting section above
3. Check backend logs in Terminal 1
4. Open browser DevTools (F12) for frontend errors
5. Create an issue on GitHub with logs

## ⚡ Quick Reference

**Start everything quickly:**
```bash
# Terminal 1
npm run server:dev

# Terminal 2  
npm run ui:dev

# Open: http://localhost:5173
```

**Check if everything is working:**
```bash
# Backend health
curl http://localhost:8080/health

# Should return JSON with status: "ok"
```

That's it! Happy coding! 🎉
