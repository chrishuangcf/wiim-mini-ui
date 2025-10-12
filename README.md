# wiim-mini-ui

### A simple UPnP audio Control Point

The goal of this project is to build a Web Control Point to display "Now Playing", "Album Art" and provide basic control over the Media Renderers on the local network.

My initial intention was to build a lovely web app for my WiiM mini devices because I missed so much from volumio, logitech media server or roon. Hence, the project name was "WiiM mini UI". Since the web app does interact with all Media Renderers on your system. (As long as it supports proper UPnP. (Sorry for OpenHome users. I'll put that into my to-do list))

Song metadata will support **Local DLNA server**, **Spotify**, **Qobuz**, **iHeart Radio**, **tuneIn Radio**, **Deezer** and **Amazon Music**. I am sorry I am currently not a subscriber of **TIDAL**.

## 🚀 Quick Start (Backend Native)
```bash
# Install dependencies (frontend + backend)
npm run init

# Terminal 1: start backend (required for UPnP)
npm run server:dev   # http://localhost:8080

# Terminal 2: start frontend (dev hot reload)
npm run ui:dev       # http://localhost:5173
```
Optional build preview (static bundle only):
```bash
npm run build        # outputs web_client/dist
```

Optional frontend-only container (backend STILL native):
```bash
npm run ui:docker    # serves built assets at http://localhost:3000
```
> The backend is no longer containerized; docker-compose is not used.

## ⚙️ Run Modes
| Mode | Frontend | Backend | UPnP | Notes |
|------|----------|---------|------|-------|
| Dev | Vite (5173) | Native 8080 | ✅ | Fast hot reload |
| Build Preview | Dist via `ui:docker` | Native 8080 | ✅ | Production asset sanity check |
| Static Deploy | Dist on any web server | Native 8080 (same LAN) | ✅ | Copy `dist/` to host |

## 🩺 Health Monitoring
Backend exposes `/health`; UI chip polls every 10s.
```json
{"status":"ok","services":{"upnp":{"status":"ok","deviceCount":2}}}
```
Colors: Green=OK, Yellow=No devices yet, Red=Backend unreachable.

## 🛰️ UPnP Notes (Why Native Backend)
UPnP/SSDP uses multicast (239.255.255.250:1900 UDP). Desktop container runtimes (macOS/Windows) block this to containers; therefore backend runs directly on the host to see devices. No docker networking configuration is required anymore.

## 🔌 Backend URL Resolution
Order:
1. `VITE_BACKEND_URL` env (e.g. `VITE_BACKEND_URL=http://192.168.1.20:8080`)
2. Page origin
3. Fallback `http://<host>:8080` after a socket connect error

## 🔍 Quick Troubleshooting
| Issue | Cause | Action |
|-------|-------|--------|
| Chip red | Backend not started | `npm run server:dev` |
| 0 devices | Device offline / multicast delay | Ensure same LAN, wait few sec, restart device |
| Frontend no data | Wrong backend URL | Set `VITE_BACKEND_URL` explicitly |
| Socket errors | Transient network | Page reload or wait reconnect |

## 🧪 Helpful Commands
```bash
curl http://localhost:8080/health
lsof -i :8080
sudo tcpdump -i any 'udp port 1900'
```

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

Choose one of the following setups:

### Option 1: Docker (Recommended)
- **Docker Desktop**: [Download and install](https://www.docker.com/products/docker-desktop/)

### Option 2: Manual Installation
- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
  - Backend requires Node.js 20 for best compatibility
- **Package Manager**: 
  - Yarn ([Install](https://classic.yarnpkg.com/lang/en/docs/install/)) or
  - npm (comes with Node.js)

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

**IMPORTRANT** The web app had a hard coded "server" location inside of /web_client/constants/Constants.ts file. Please change **SERVER_URL** and **SERVER_PORT** accordingly.

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
