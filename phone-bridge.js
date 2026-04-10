/**
 * Nira AI - Physical Phone Bridge (USB)
 * -------------------------------------
 * This script connects your physical Android phone to the dashboard.
 * Requires: Node.js, ADB (Android Debug Bridge), and USB Debugging enabled.
 */

const { spawn } = require('child_process');
const http = require('http');

let currentStatus = "Idle";
let lastNumber = "Unknown";
let callStartTime = null;

console.log("-----------------------------------------");
console.log("Nira AI - USB Phone Bridge Starting...");
console.log("-----------------------------------------");

// 1. Start ADB Listening
function startADB() {
    console.log("Checking for connected Android devices...");
    // Check if ADB is installed and a device is connected
    const adbDevices = spawn('adb', ['devices']);
    adbDevices.stdout.on('data', (data) => {
        if (data.toString().includes('\tdevice')) {
            console.log("SUCCESS: Phone detected via USB!");
            monitorLogs();
        } else {
            console.log("WAITING: No phone detected. Please connect via USB and enable Debugging.");
            setTimeout(startADB, 5000);
        }
    });
}

function monitorLogs() {
    console.log("Monitoring phone logs for incoming calls...");
    
    // -b system usually contains the Telephony/Telecom logs
    const logcat = spawn('adb', ['logcat', '-b', 'system', '-v', 'brief', 'Telecom:D', 'Telephony:D', '*:S']);

    logcat.stdout.on('data', (data) => {
        const line = data.toString();

        // 1. Detect Ringing
        if (line.includes('RINGING') || line.includes('INCOMING')) {
            if (currentStatus !== "Ringing") {
                currentStatus = "Ringing";
                // Try to extract number if available in logs
                const numMatch = line.match(/\+?\d{10,12}/);
                if (numMatch) lastNumber = numMatch[0];
                console.log(`[EVENT] INCOMING CALL: ${lastNumber}`);
            }
        }

        // 2. Detect Answered (OFFHOOK)
        if (line.includes('OFFHOOK') || line.includes('ACTIVE')) {
            if (currentStatus === "Ringing") {
                currentStatus = "Answered";
                console.log("[EVENT] CALL ANSWERED");
            }
        }

        // 3. Detect Idle (Call ended)
        if (line.includes('IDLE') || line.includes('DISCONNECTED')) {
            if (currentStatus === "Ringing") {
                currentStatus = "Missed";
                console.log("[EVENT] CALL MISSED - Alerting Dashboard");
                // Reset to idle after a small delay to allow dashboard to see the "Missed" state
                setTimeout(() => { currentStatus = "Idle"; lastNumber = "Unknown"; }, 5000);
            } else {
                currentStatus = "Idle";
            }
        }
    });

    logcat.on('close', () => {
        console.log("ADB Connection lost. Retrying...");
        startADB();
    });
}

// 2. Start HTTP Server for Dashboard Polling
const server = http.createServer((req, res) => {
    // Enable CORS for dashboard access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/status') {
        res.end(JSON.stringify({
            status: currentStatus,
            number: lastNumber,
            timestamp: Date.now()
        }));
    } else {
        res.end(JSON.stringify({ error: "Invalid endpoint" }));
    }
});

const PORT = 3030;
server.listen(PORT, () => {
    console.log(`BRIDGE ACTIVE: Listening on http://localhost:${PORT}/status`);
    console.log("Keep this window open while using the Dashboard.");
});

startADB();
