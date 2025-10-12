# wiim-mini-ui

### A simple UPnP audio Control Point

The goal of this project is to build a Web Control Point to display "Now Playing", "Album Art" and provide basic control over the Media Renderers on the local network.

My initial intention was to build a lovely web app for my WiiM mini devices because I missed so much from volumio, logitech media server or roon. Hence, the project name was "WiiM mini UI". Since the web app does interact with all Media Renderers on your system. (As long as it supports proper UPnP. (Sorry for OpenHome users. I'll put that into my to-do list))

Song metadata will support **Local DLNA server**, **Spotify**, **Qobuz**, **iHeart Radio**, **tuneIn Radio**, **Deezer** and **Amazon Music**. I am sorry I am currently not a subscriber of **TIDAL**.

## 🚀 Quick Start (Native Development - Recommended)

### Prerequisites
- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **npm**: Version 8 or higher (comes with Node.js)

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/chrishuangcf/wiim-mini-ui.git
cd wiim-mini-ui

# Install dependencies for both frontend and backend
npm run init
```

### Development Mode (Recommended)
Run backend and frontend in separate terminals for best development experience:

**Terminal 1 - Backend Server:**
```bash
# Start backend with debug logging enabled
UPNP_DEBUG=1 npm run server:dev
# or
cd wiim_server && UPNP_DEBUG=1 node server.js

# Backend will start on: http://localhost:8080
# UPnP Discovery: UDP multicast on 239.255.255.250:1900
```

**Terminal 2 - Frontend Dev Server:**
```bash
# Start frontend with hot-reload
npm run ui:dev
# or
cd web_client && npm run dev

# Frontend will start on: http://localhost:5173 (3000 or 3001 if port is busy)
```

Then open your browser to **http://localhost:5173** (or the port shown in Terminal 2).

### Production Build
```bash
# Build the frontend static assets
npm run build        # outputs to web_client/dist

# Serve both frontend and backend from single server
cd wiim_server && node server.js
# Access at: http://localhost:8080
```

### Optional: Frontend-Only Container
```bash
# Build and run frontend in Docker (backend still runs natively)
npm run ui:docker    # serves built assets at http://localhost:3000
```

> **Important**: The backend must run natively (not in Docker on macOS/Windows) because UPnP/SSDP multicast traffic (UDP port 1900) is blocked by Docker Desktop's network virtualization. Linux hosts may work with proper Docker network configuration.

---

## 🛠️ Development Environment Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/chrishuangcf/wiim-mini-ui.git
cd wiim-mini-ui

# Install all dependencies (frontend + backend)
npm run init

# This is equivalent to:
# cd web_client && npm install && cd ..
# cd wiim_server && npm install && cd ..
```

### Step 2: Verify Installation

```bash
# Check Node.js version
node --version  # Should be 18+ (20 or 22 recommended)

# Check backend dependencies
cd wiim_server && npm list --depth=0

# Expected packages:
# - express: Web server framework
# - socket.io: Real-time communication
# - upnp-device-client: Device control
# - xml2js: XML parsing
# - cheerio: HTML/metadata parsing

# Check frontend dependencies  
cd ../web_client && npm list --depth=0

# Expected packages:
# - vue: Framework
# - vuetify: UI components
# - vite: Build tool
# - socket.io-client: Backend communication
```

### Step 3: Configure Environment (Optional)

Create environment files if needed:

**Backend** (`wiim_server/.env`):
```bash
# Optional environment variables
PORT=8080
UPNP_DEBUG=1
SSDP_EXPLICIT_BIND=true
```

**Frontend** (`web_client/.env.development`):
```bash
# Backend URL (auto-detected if not set)
VITE_BACKEND_URL=http://localhost:8080

# Or for remote backend:
# VITE_BACKEND_URL=http://192.168.1.100:8080
```

### Step 4: Start Development Servers

#### Option A: Using npm Scripts (Recommended)

```bash
# Terminal 1 - Backend with debug logging
npm run server:dev
# Starts on: http://localhost:8080

# Terminal 2 - Frontend with hot-reload
npm run ui:dev  
# Starts on: http://localhost:5173 (or next available port)
```

#### Option B: Manual Start

```bash
# Terminal 1 - Backend
cd wiim_server
UPNP_DEBUG=1 node server.js

# Terminal 2 - Frontend
cd web_client
npm run dev
```

### Step 5: Verify Everything Works

1. **Check Backend Health**:
   ```bash
   curl http://localhost:8080/health
   # Expected: {"status":"ok","services":{"upnp":{"status":"ok","deviceCount":N}}}
   ```

2. **Check Device Discovery**:
   ```bash
   curl http://localhost:8080/discovery-debug | python3 -m json.tool
   # Should show discovered MediaRenderer devices
   ```

3. **Open Frontend**:
   - Navigate to **http://localhost:5173** in your browser
   - Health indicator (top-right) should be **green**
   - Device buttons should appear if media renderers found

4. **Check Browser Console** (F12 or Cmd+Opt+I):
   ```javascript
   // Should see:
   "Socket.io connected"
   "Received devices: [{friendlyName: 'WiiM Mini-229A', ...}]"
   ```

### Development Workflow

#### Hot Reload (Frontend)
- Edit any `.vue`, `.ts`, `.scss` file in `web_client/src/`
- Changes automatically reflected in browser (usually < 1 second)
- No manual refresh needed

#### Backend Changes
- Edit `wiim_server/server.js`
- Stop backend (Ctrl+C) and restart: `UPNP_DEBUG=1 node server.js`
- Or use nodemon for auto-restart:
  ```bash
  npm install -g nodemon
  cd wiim_server && nodemon server.js
  ```

#### Recommended VS Code Extensions
- **Volar**: Vue.js 3 language support
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Docker**: Container management (optional)

#### Project Structure
```
wiim-mini-ui/
├── web_client/              # Frontend (Vue.js + Vite)
│   ├── src/
│   │   ├── components/      # Vue components (DeviceList, AlbumArt, etc.)
│   │   ├── views/           # Page views
│   │   ├── store/           # State management (metadata)
│   │   ├── router/          # Vue Router config
│   │   └── constants/       # Constants (deprecated, use env vars)
│   ├── public/              # Static assets
│   ├── vite.config.mts      # Vite configuration
│   └── package.json
│
├── wiim_server/             # Backend (Node.js + Express)
│   ├── server.js            # Main server file
│   ├── package.json
│   └── public/              # Built frontend (after npm run build)
│
├── package.json             # Root package (npm scripts)
└── README.md
```

#### Key Files to Know

**Backend**:
- `wiim_server/server.js` (lines 62-206): Native dgram SSDP discovery implementation
- `wiim_server/server.js` (lines 281-315): Socket.io event handlers for device/metadata

**Frontend**:
- `web_client/src/components/DeviceList.vue`: Device discovery and selection UI
- `web_client/src/components/AlbumArt.vue`: Main player interface
- `web_client/src/store/metadata.ts`: Shared state for playback metadata
- `web_client/vite.config.mts`: Vite proxy configuration for backend API

---

## ⚙️ Run Modes

| Mode | Frontend | Backend | UPnP | When to Use |
|------|----------|---------|------|-------------|
| **Development** | Vite dev server (port 5173) | Native Node.js (port 8080) | ✅ | Active development with hot-reload |
| **Production Build** | Static files served by Node.js | Native Node.js (port 8080) | ✅ | Single server deployment |
| **Docker Frontend** | Nginx container (port 3000) | Native Node.js (port 8080) | ✅ | Test production build locally |
| **Static Deploy** | Any web server (nginx/apache) | Native Node.js (port 8080, same LAN) | ✅ | CDN or separate web server |

### Development Mode (Hot Reload)
```bash
# Terminal 1
UPNP_DEBUG=1 npm run server:dev  # Backend on :8080

# Terminal 2  
npm run ui:dev                    # Frontend on :5173
```
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: Node.js with automatic device discovery
- **Best for**: Active development, testing changes immediately

### Production Mode (Single Server)
```bash
npm run build                     # Build frontend
cd wiim_server && node server.js  # Serve everything on :8080
```
- **Frontend**: Pre-built static assets served by Express
- **Backend**: Same Node.js server handles both
- **Best for**: Deployment to Raspberry Pi or single-server setup

## 🩺 Health Monitoring
Backend exposes `/health`; UI chip polls every 10s.
```json
{"status":"ok","services":{"upnp":{"status":"ok","deviceCount":2}}}
```
Colors: Green=OK, Yellow=No devices yet, Red=Backend unreachable.

## 🛰️ UPnP Notes (Why Native Backend)
UPnP/SSDP uses multicast (239.255.255.250:1900 UDP). Desktop container runtimes (macOS/Windows) block this to containers; therefore backend runs directly on the host to see devices. No docker networking configuration is required anymore.

## 🔌 Backend URL Configuration & Environment Variables

### Backend URL Resolution (Frontend)

The frontend automatically connects to the backend using this priority order:

1. **`VITE_BACKEND_URL`** environment variable (highest priority)
   ```bash
   # Development
   VITE_BACKEND_URL=http://192.168.1.20:8080 npm run ui:dev
   
   # Build time
   VITE_BACKEND_URL=http://192.168.1.20:8080 npm run build
   ```

2. **`window.location.origin`** (same host/port as frontend)
   - Works when frontend and backend served from same server
   - Production mode: `http://localhost:8080`

3. **Fallback to `http://<host>:8080`** on socket connection error
   - Automatic retry with backend on port 8080
   - Only attempts once to avoid infinite loops

### Backend Environment Variables

```bash
# Port configuration (default: 8080, auto-increments if busy)
PORT=8080

# Enable comprehensive UPnP/SSDP debug logging
UPNP_DEBUG=1

# Force explicit network interface binding (if auto-detection fails)
SSDP_INTERFACES=en0

# Explicitly bind SSDP socket (some systems require this)
SSDP_EXPLICIT_BIND=true
```

**Usage:**
```bash
# Single command
UPNP_DEBUG=1 PORT=8080 node wiim_server/server.js

# Or use .env file (create wiim_server/.env)
PORT=8080
UPNP_DEBUG=1
```

### Frontend Environment Variables

Create `web_client/.env.development` or `web_client/.env.production`:

```bash
# Backend API URL
VITE_BACKEND_URL=http://localhost:8080

# For development on different machine:
# VITE_BACKEND_URL=http://192.168.1.100:8080

# For production deployment:
# VITE_BACKEND_URL=http://your-server-ip:8080
```

### Common Configuration Scenarios

#### Scenario 1: Local Development (Default)
No configuration needed. Frontend (5173) → Backend (8080) works automatically.

```bash
# Terminal 1
npm run server:dev

# Terminal 2
npm run ui:dev
```

#### Scenario 2: Backend on Different Machine
Development machine A runs frontend, machine B runs backend:

```bash
# Machine B (192.168.1.100) - Backend
cd wiim_server && node server.js

# Machine A - Frontend  
VITE_BACKEND_URL=http://192.168.1.100:8080 npm run ui:dev
```

#### Scenario 3: Production Build with Custom Backend
```bash
# Build frontend pointing to specific backend
VITE_BACKEND_URL=http://10.0.4.27:8080 npm run build

# Frontend will always connect to 10.0.4.27:8080
```

#### Scenario 4: Network Interface Selection
If multiple network interfaces exist and backend binds to wrong one:

```bash
# List interfaces
ifconfig  # or "ip addr" on Linux

# Bind to specific interface
SSDP_INTERFACES=en0 node wiim_server/server.js  # macOS WiFi
SSDP_INTERFACES=eth0 node wiim_server/server.js # Linux Ethernet
```

### Vite Proxy Configuration (Development Only)

During development (`npm run ui:dev`), Vite proxies backend requests:

**File**: `web_client/vite.config.mts`
```typescript
server: {
  proxy: {
    '/socket.io': 'http://localhost:8080',  // WebSocket
    '/health': 'http://localhost:8080',     // Health check
    '/api': 'http://localhost:8080'         // API endpoints
  }
}
```

This allows frontend on `:5173` to transparently call backend on `:8080` without CORS issues.

## � Debugging Guide

### Backend Debugging

#### Enable Debug Logging
```bash
# Start backend with comprehensive UPnP debug output
UPNP_DEBUG=1 node wiim_server/server.js

# Debug logs will show:
# - SSDP socket initialization
# - Multicast group join (239.255.255.250)
# - M-SEARCH packet sending
# - SSDP responses received from devices
# - Device XML fetching and parsing
# - MediaRenderer discovery events
```

#### Check Backend Status
```bash
# Verify backend is running
curl http://localhost:8080/health

# Expected response:
# {"status":"ok","services":{"upnp":{"status":"ok","deviceCount":2}}}

# View discovered devices in JSON format
curl http://localhost:8080/discovery-debug | python3 -m json.tool

# Check which process is using port 8080
lsof -i :8080

# Check if backend is listening on all interfaces
netstat -an | grep 8080
```

#### UPnP Network Debugging
```bash
# Monitor SSDP multicast traffic (requires sudo)
sudo tcpdump -i any 'udp port 1900' -A

# Check if devices are advertising on your network
sudo tcpdump -i any 'udp port 1900 and host 239.255.255.250'

# Send manual M-SEARCH discovery packet
echo -e "M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1900\r\nMAN: \"ssdp:discover\"\r\nMX: 3\r\nST: urn:schemas-upnp-org:device:MediaRenderer:1\r\n\r\n" | nc -u 239.255.255.250 1900
```

#### Common Backend Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Port already in use** | `Error: listen EADDRINUSE: address already in use :::8080` | Kill existing process: `lsof -ti:8080 \| xargs kill -9` |
| **No devices discovered** | `deviceCount: 0` in `/health` | 1. Verify devices on same network<br>2. Check firewall allows UDP 1900<br>3. Restart media renderer devices |
| **Multicast not working** | No SSDP responses in `UPNP_DEBUG` logs | 1. Check network interface is up<br>2. Verify multicast routing: `netstat -rn \| grep 224`<br>3. Try explicit interface: `SSDP_INTERFACES=en0 node server.js` |
| **Socket.io connection fails** | Frontend shows "Backend unreachable" | 1. Verify backend running on 8080<br>2. Check CORS settings<br>3. Verify firewall allows 8080 |

### Frontend Debugging

#### Development Console
```bash
# Start frontend with Vite debug output
DEBUG=vite:* npm run ui:dev

# Open browser DevTools (F12 or Cmd+Opt+I)
# Check Console tab for:
# - Socket.io connection status
# - Device discovery events
# - API call results
```

#### Socket.io Connection Issues
Check browser console for connection attempts:
```javascript
// Should see in console:
"Attempting socket connection to: http://localhost:8080"
"Socket.io connected"
"Received devices: [...]"
```

#### Check Frontend Build
```bash
# Verify frontend builds without errors
cd web_client && npm run build

# Preview production build locally
npm run preview
```

#### Common Frontend Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Backend unreachable** | Red health indicator, no devices | 1. Verify backend running: `curl http://localhost:8080/health`<br>2. Check backend URL in DevTools Network tab<br>3. Set explicit URL: `VITE_BACKEND_URL=http://localhost:8080 npm run ui:dev` |
| **Devices not displayed** | Empty device list | 1. Open browser console, check for socket errors<br>2. Click "Refresh" button<br>3. Verify `/discovery-debug` shows devices |
| **Port conflict** | `Port 5173 is in use` | Vite auto-increments port (3000→3001→3002), check terminal output |
| **Hot reload not working** | Changes not reflected | 1. Check Vite terminal for errors<br>2. Hard refresh browser (Cmd+Shift+R)<br>3. Restart dev server |

### Network Debugging Commands

```bash
# View all network interfaces
ifconfig

# Check multicast group membership (macOS)
netstat -g

# Find your local IP address
hostname -I  # Linux
ipconfig getifaddr en0  # macOS WiFi
ipconfig getifaddr en1  # macOS Ethernet

# Test backend from another device on LAN
curl http://[YOUR_IP]:8080/health

# Monitor WebSocket connections
lsof -i :8080 -n | grep ESTABLISHED

# Check DNS resolution
nslookup localhost
```

### Debugging Tips

1. **Always check both terminals**: Backend (8080) and Frontend (5173) logs
2. **Enable UPNP_DEBUG**: Reveals exactly what the backend sees on the network
3. **Use `/discovery-debug` endpoint**: Quick way to see parsed device data
4. **Check browser DevTools Network tab**: Shows all HTTP/WebSocket traffic
5. **Verify same network**: Both devices and development machine must be on same LAN
6. **Firewall**: Ensure UDP 1900 and TCP 8080 are not blocked

## 🔍 Quick Troubleshooting
| Issue | Cause | Action |
|-------|-------|--------|
| Chip red | Backend not started | `UPNP_DEBUG=1 npm run server:dev` |
| 0 devices | Device offline / multicast delay | 1. Ensure same LAN<br>2. Wait 15 seconds<br>3. Restart device<br>4. Check `UPNP_DEBUG` logs |
| Frontend no data | Wrong backend URL | Set `VITE_BACKEND_URL` explicitly |
| Socket errors | Transient network | Page reload or wait for reconnect |
| Build fails | Dependency issues | `rm -rf node_modules && npm run init` |

## 🏗️ Architecture Overview

This project follows a modern web application architecture with a clear separation between frontend and backend services.

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                     (localhost:3000)                         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Container                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Vue.js 3 + Vuetify 3 Application                   │   │
│  │  - Real-time UI updates                             │   │
│  │  - Album art display                                │   │
│  │  - Media controls                                   │   │
│  │  - Device selection                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Nginx Web Server                                   │   │
│  │  - Serves static assets                             │   │
│  │  - Proxies API calls to backend                     │   │
│  │  - WebSocket proxy for Socket.io                    │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API / Socket.io
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Container                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Node.js + Express Server (localhost:8080)          │   │
│  │  - RESTful API endpoints                            │   │
│  │  - Socket.io server for real-time updates           │   │
│  │  - Metadata parsing & enrichment                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  UPnP/SSDP Service Discovery (port 1900/UDP)        │   │
│  │  - Discovers media renderers on local network       │   │
│  │  - Device capability detection                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  UPnP Control Point (port 8200/TCP)                 │   │
│  │  - Sends control commands to renderers              │   │
│  │  - Receives status updates                          │   │
│  │  - Manages playback state                           │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ UPnP Protocol
                         ▼
         ┌───────────────────────────────────┐
         │    Local Network Devices          │
         │  ┌─────────────────────────────┐  │
         │  │  Media Renderers            │  │
         │  │  - WiiM Mini/Pro/Amp        │  │
         │  │  - Sonos                    │  │
         │  │  - Chromecast               │  │
         │  │  - Any UPnP AV Renderer     │  │
         │  └─────────────────────────────┘  │
         │  ┌─────────────────────────────┐  │
         │  │  Media Servers (Optional)   │  │
         │  │  - DLNA/UPnP Media Servers  │  │
         │  │  - Local music libraries    │  │
         │  └─────────────────────────────┘  │
         └───────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: Vue.js 3 (Composition API)
- **UI Library**: Vuetify 3 (Material Design)
- **Build Tool**: Vite (Fast ES module bundler)
- **Language**: TypeScript
- **State Management**: Pinia
- **Routing**: Vue Router
- **Real-time Communication**: Socket.io Client
- **Production Server**: Nginx (Alpine Linux)

#### Backend
- **Runtime**: Node.js 20 (Alpine Linux)
- **Framework**: Express.js
- **Real-time Communication**: Socket.io Server
- **UPnP/SSDP**: node-ssdp (Device discovery)
- **UPnP Control**: upnp-device-client (Media control)
- **XML Parsing**: xml2js (UPnP response parsing)
- **HTML Parsing**: cheerio (Metadata extraction)

#### Infrastructure
- **Containerization**: (Optional) Frontend-only container build (no backend container)
- **Container Network**: Bridge network for inter-service communication
- **SSL/TLS Support**: Configurable for corporate environments
- **Build System**: Multi-stage Docker builds for optimized images

---

## 🎨 Design & Features

### User Interface

The application provides a clean, modern interface inspired by popular music players:

- **Now Playing View**: Large album art display with real-time playback information
- **Transport Controls**: Play, pause, next, previous, volume, shuffle, and repeat controls
- **Track Information**: 
  - Song title, artist, album
  - Audio quality indicators (CD, Hi-Res, UHD, MP3)
  - Bit depth, sample rate, and bitrate
  - Current position and duration with progress bar
- **Device Selector**: Easy switching between multiple UPnP renderers
- **Artist Biography**: Integrated web search for artist information
- **Responsive Design**: Works on desktop and mobile devices

### Supported Services & Metadata

The application intelligently detects and displays metadata from various streaming services:

| Service | Logo Display | Quality Info | Metadata Support |
|---------|--------------|--------------|------------------|
| **Spotify** | ✅ | MP3 indicator | Full support |
| **Qobuz** | ✅ | CD/Hi-Res indicators | Full support |
| **Amazon Music** | ✅ | HD/UHD indicators | Full support |
| **Deezer** | ✅ | Standard quality | Full support |
| **iHeartRadio** | ✅ | Streaming | Full support |
| **TuneIn** | ✅ | Radio streams | Full support |
| **Local DLNA** | ✅ | Based on bitrate | Full support |
| TIDAL | ❌ | Not tested | May work |

### Audio Quality Indicators

- **UHD/Ultra HD**: Amazon Music highest quality (>96kHz)
- **Hi-Res**: High-resolution audio (>48kHz, typically 96/192kHz)
- **CD Quality**: 44.1kHz/16-bit (or equivalent)
- **MP3**: Compressed audio formats

### Real-Time Features

- **Live Metadata Updates**: Uses WebSocket (Socket.io) for instant updates
- **Automatic Discovery**: Continuously scans for new UPnP devices
- **Playback Synchronization**: Real-time progress bar updates
- **Volume Control**: Instant volume feedback
- **Connection Status**: Visual indicators for server connectivity

### UPnP Protocol Implementation

The backend implements standard UPnP AV Control Point functionality:

1. **Device Discovery** (SSDP)
   - M-SEARCH multicast discovery
   - Device description parsing
   - Service endpoint resolution

2. **Media Control** (UPnP AV)
   - AVTransport service control (play, pause, stop, seek)
   - RenderingControl service (volume, mute)
   - ContentDirectory browsing (for DLNA servers)

3. **Event Subscription**
   - Real-time playback state updates
   - Track change notifications
   - Volume change notifications

---

## 🐳 Docker Setup (Recommended)

### Quick Start with Docker

From the root directory, run:

```bash
docker compose up --build -d
```

This command will:
1. Build both frontend (Vue.js + Nginx) and backend (Node.js) containers
2. Start them in detached mode
3. Create a shared network for inter-service communication

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

### Architecture

- **Frontend Container**: 
  - Multi-stage build (Node.js build → Nginx runtime)
  - Serves the Vue.js application on port 3000
  - Includes Gzip compression and static asset caching
  - Proxies API and Socket.io requests to backend

- **Backend Container**: 
  - Node.js server for UPnP device communication
  - Runs on port 8080 (HTTP), 8200 (TCP), 1900 (UDP for SSDP)
  - Handles device discovery and media control

### Network Configuration

Both services run on a shared bridge network (`wiim-network`), allowing them to communicate seamlessly using service names.

---

## 📋 Prerequisites

### Required
- **Node.js**: Version 18+ ([Download](https://nodejs.org/))
  - Recommended: Node.js 20 or 22 LTS
  - Check version: `node --version`
- **npm**: Version 8+ (included with Node.js)
  - Check version: `npm --version`

### Optional
- **Docker Desktop**: For frontend container builds only ([Download](https://www.docker.com/products/docker-desktop/))
  - Note: Backend cannot run in Docker on macOS/Windows due to multicast limitations
- **Python 3**: For debugging tools (JSON formatting)
  - Usually pre-installed on macOS/Linux

### Network Requirements
- **UPnP/SSDP**: Your network must allow multicast UDP on 239.255.255.250:1900
- **Same Network**: Development machine and media renderers must be on same LAN/WiFi
- **Firewall**: Allow incoming TCP 8080 (backend), UDP 1900 (SSDP)

---

## 🚀 Getting Started

### Quick Start with Docker

The easiest way to run the entire application:

The system consists of two parts. A backend server (node.js) and an interactive web user interface (vuetify 3).

To be able to compile and run, you need to first install the following tools if you do not have them already.

1. Node.js : please follow the installation here (https://nodejs.org/en/)
2. Yarn : Please follow the installation here (https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)

Once you have both Node.js and Yarn installed, then rest should be fairly straightforward.
Next step is to run :

3. `yarn install`

this command will install all necessary libraries for you from here.

## Usage

As a developer, you might want to run both back-end and front-end service separately.  Ideally, you do not need to rebuild both projects at the same time so they won't interfere with one other.

### Developer Mode

By running `npm run ui:dev` will host a hot-swap version of web server to run the front-end code on **localhost:5173**. Meanwhile, running `npm run server:dev` will kick in back-end server on **localhost:8080**.

### Production Mode

If you wish just to build and run, You only need the following commands :

```
npm run build
npm run serve
```

These commands will first build the web app into a bundled, minified package. Then the script will copy the productionalized web app into the right place and start the back-end services and host it under the node.js as a static page. In this mode, you really only need to hit **http://localhost:8080** to run the web app.

---

**DEPRECATED**: The old hard-coded server location in `/web_client/constants/Constants.ts` is no longer used. The frontend now uses environment variables (`VITE_BACKEND_URL`) and automatic URL detection. See **[🔌 Backend URL Configuration](#-backend-url-configuration--environment-variables)** above for modern configuration.

---

### Deployment Mode

**For manual deployment** on a Raspberry Pi or other systems:

If you wish to run this web app anywhere else, such as a mini Single Board Computer like a Raspberry Pi. All you have to do is to run the `npm run build` command first. After the building process has finished, you just have to copy **/web_client/dist** directory into a directory where you wish to run the service. For example! If your Node.js is running at **/helloWorld** folder, then you need to copy **/web_client/dist** into **/HelloWorld/public**. After that, just copy **/wiim_server** into **/HelloWorld** directory and run with **node server.js** (after you properly installed by running `npm install`).

1. make a build by running `npm run build`.
2. copy **/web_client/dist** directory into **<destination>/public** directory.
3. copy **/wiim_server/server.js** into **<destination>/** directory.
4. run `node server.js` to start both back-end server and front-end web app.

### How to set up on a Raspberry Pi

1. Grant access through SSH terminal into your Raspberry Pi
2. sudo apt-get update
3. sudo apt-get upgrade
4. sudo apt remove node (If you already had an older version installed)
5. sudo apt remove nodejs (If you already had an older version installed)
6. -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - (This command will download latest node.js)
7. sudo apt-get install -y nodejs (Install Node.js)
8. node -v (check if node.js is properly installed)

9. At your current computer, kick in a build by `npm run build`
10. Copy **/web_client/dist** into Raspberry Pi to where you want your code to be hosted **<destination>/public**
11. Copy **server.js** and **package.json** files in **/wiim_server/** into your **<destination>** folder on the Raspberry Pi.
12. Run `npm install` to install dependencies.
13. Run `hostname -I` to find out your IP address on the Raspberry Pi.
14. Run `node server.js` to run the Server + Web App.
15. Run a browser to **[Raspberry Pi IP Address] : [Running port number]** You should be able to see the web app running.

### how to make wiim_server service persist and automatically load when booting Raspberry Pi

1. `sudo npm install -g pm2` (install pm2)
2. `pm2 start server.js` (starting wiim_server)

- You should be able to see **App name** Server running

3. `pm2 startup systemd` (generate a script that will launch PM2)
4. copy the last line starts with **`sudo env PATH=$PATH/....`** and paste into the terminal and run it
5. `pm2 save` (save current state of PM2 with server.js running)
6. you will be able to check anytime for the status by commands :

- `pm2 list` (list of services running under pm2)
- `pm2 status` (status of pm2)
- `pm2 show server` (this will show wiim_server in details)

### If you are haveing build issues, want to skip the whole building process

Reported by users, the building tools might not properly compile on Windows 11. Due to the tool set for building the project mainly used tools to run under Linux/OSX. There i s also a copy of production built web app already placed in the **/wiim_server/public** folder. You should be able to run just by using following commands :

1. cd **wiim_server**
2. **npm install** (run this to pull in all the dependencies for the server)
3. **node server.js** (to run it)

## How to use

You will then need to click on the **SPEAKER** icon to select a Media Renderer on your own network. You should be able to see the screen as follows. Keep in mind! You will need to select a Media Renderer first. Otherwise you won't be able to control playback/pause/next on it.
<img title="Select a Media Renderer" alt="Alt text" src="./assets/select_player.jpg">

When you click on the artist name (a pink button), that should bring up a card below the main player.
<img title="Select a Media Renderer" alt="Alt text" src="./assets/display_biography.jpg">

The server location should host both the **wiim_server** and web app from the same server. However, occasionally during the development, you may have a web app and wiim_server running on different machines or different ports. You may click on the **SETUP** icon to change the IP address.
<img title="Select a Media Renderer" alt="Alt text" src="./assets/setup1.jpg">

## Change Logs

- 8/3/22

  - Added track length, current playback time, shuffle mode, repeat mode, and volume on the cover art.
    <img title="song duration" alt="Alt text" src="./assets/tracktime.jpg">

- 7/25/22

  - Allow to change server IP address. (The setup icon)
  - Automatically use the default server IP address to start the web app.
  - Hide controller buttons before the user selects a media renderer. (It will cause server crash to force control without a media renderer had been selected
  - Moved the **Media Renderers** under the main display screen to allow more room for long device names.

- 7/24/22
  - moved backend from RESTful requests into Websocket communication to give real time feedback
  - updated metadata accuracy. Now will display Spotify, Qobuz, Amzon Music and local UPnP media servers.
    - Quboz will display CD or Hi-Res
    - Amazon Music will display UHD or HD
    - Spotify will display MP3 (Don't ask me when are we seeing Hi-Res from Sptify!)
    - Local UPnP depends on the bitrate. It will display Hi-Res or CD

## TO-DO list

2. Possibility to support OpenHome protocol for controlling the renderer (currently it will display metadata but fast track to next track won't work as OpenHome system design was to have playlist saved on individual "client". Therefore, it's not possible to advance to next track becauser there was no "next track" available). This will affect all BubbleUPnP renderers such as Chromcast, Volumio.
3. Local UPnP Media Server would be able to stream more than just CD/Hi-Res options. The options would be LOSSY, LOSSLESS..etc... The metadata is sometimes very limited.

## 🔌 Backend URL Configuration
By default the frontend tries these in order:
1. `VITE_BACKEND_URL` (env at build/dev time) e.g. `VITE_BACKEND_URL=http://192.168.1.50:8080`
2. `window.location.origin` (same host/port)
3. Fallback to `http://<host>:8080` on socket connect error

During `npm run ui:dev`, Vite proxy (configured in `vite.config.mts`) forwards:
- `/socket.io` → backend 8080
- `/health` → backend 8080
- `/api` → backend 8080

Example:
```bash
VITE_BACKEND_URL=http://10.0.4.27:8080 npm run ui:dev
```
