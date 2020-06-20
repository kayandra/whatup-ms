# Livestream Demo Using mediasoup 3 and FFmpeg

## How to use

### Install Server Modules

```bash
cd server && npm i
```

### Install App Modules

```bash
cd app && npm i
```

### Start the server

```bash
# Change the listen IP in src/config.js to your local ip (config -> webRtcTransport -> listenIps)
# Create [files] directory in order for the files to be saved
# The server uses FFmpeg.
cd server && node src/server
```

### Build and start the application

```bash
cd app
npm run build

# Copy the files from dist to a webserver etc.
# OR start the dev server
npm run dev
```

### Access the sample page
http://localhost:8080
---
