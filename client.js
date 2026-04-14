class ZeroTwoClient {
    constructor() {
        this.room = null;
        this.localVideo = null;
        this.micEnabled = false;
        this.cameraEnabled = false;
        this.messages = document.getElementById('messages');
        this.statusText = document.getElementById('statusText');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.videoContainer = document.getElementById('videoContainer');
        this.micBtn = document.getElementById('micBtn');
        this.micIcon = document.getElementById('micIcon');
        this.micText = document.getElementById('micText');
        this.cameraBtn = document.getElementById('cameraBtn');
        this.endCallBtn = document.getElementById('endCallBtn');

        this.init();
    }

    async init() {
        // Replace with your LiveKit URL and token
        const url = 'wss://openai-o3rdyl8j.livekit.cloud'; // ← CHANGE THIS
        const token = await this.fetchToken(); // ← Implement token generation

        try {
            await this.connect(url, token);
            this.updateStatus('connected', 'green', 'Connected 💕');
        } catch (error) {
            console.error('Connection failed:', error);
            this.updateStatus('error', 'red', 'Connection failed');
        }

        this.bindEvents();
    }

    async fetchToken() {
        // Option 1: Server-generated token (RECOMMENDED)
        const response = await fetch('http:/127.0.0.1:3000/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room: 'zero-two-room', username: 'darling' })
        });
        return await response.text();

        // Option 2: Generate client-side (less secure, for testing)
        // return LivekitClient.AccessToken.generate({
        //     apiKey: 'your-api-key',
        //     apiSecret: 'your-api-secret',
        //     identity: 'darling',
        //     name: 'zero-two-room'
        // }).toString();
    }

    async connect(url, token) {
        const roomOptions = new LivekitClient.RoomOptions();
        roomOptions.videoCaptureDefaults = {
            facingMode: 'user'
        };

        this.room = new LivekitClient.Room(roomOptions);
        
        this.room.on(LivekitClient.RoomEvent.Connected, () => {
            this.setupLocalVideo();
        });

        this.room.on(LivekitClient.RoomEvent.ParticipantConnected, (participant) => {
            if (participant.identity === 'agent') {
                this.addMessage('Zero Two', '[😊] Hi darling! Kya haal hai?', 'agent');
            }
        });

        await this.room.connect(url, token);
    }

    setupLocalVideo() {
        const localVideoTrack = this.room.localParticipant.getTrackPublication('camera')?.track;
        if (localVideoTrack) {
            this.localVideo = localVideoTrack.attach();
            this.videoContainer.innerHTML = '';
            this.videoContainer.appendChild(this.localVideo);
        }
    }

    bindEvents() {
        this.micBtn.onclick = () => this.toggleMic();
        this.cameraBtn.onclick = () => this.toggleCamera();
        this.endCallBtn.onclick = () => this.disconnect();

        this.room.on(LivekitClient.RoomEvent.TrackSubscribed, (track, publication, participant) => {
            if (publication.kind === 'video' && participant.identity === 'agent') {
                const videoElement = track.attach();
                videoElement.style.width = '100%';
                videoElement.style.height = '100%';
                videoElement.style.objectFit = 'cover';
                this.videoContainer.appendChild(videoElement);
            }
        });

        // Listen for chat messages (if agent sends text)
        this.room.on(LivekitClient.RoomEvent.DataReceived, (payload, participant, kind) => {
            try {
                const data = JSON.parse(payload);
                if (data.type === 'chat') {
                    this.addMessage('Zero Two', data.text, 'agent');
                }
            } catch (e) {
                console.log('Non-chat data received');
            }
        });
    }

    async toggleMic() {
        this.micEnabled = !this.micEnabled;
        await this.room.localParticipant.setMicrophoneEnabled(this.micEnabled);
        
        this.micIcon.textContent = this.micEnabled ? '🔴' : '🎤';
        this.micText.textContent = this.micEnabled ? 'Listening...' : 'Bolo darling';
        this.micBtn.classList.toggle('bg-red-500', this.micEnabled);
        this.micBtn.classList.toggle('bg-gradient-to-r', !this.micEnabled);
    }

    async toggleCamera() {
        this.cameraEnabled = !this.cameraEnabled;
        await this.room.localParticipant.setCameraEnabled(this.cameraEnabled);
    }

    addMessage(sender, text, type = 'user') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${type === 'agent' ? 'justify-start' : 'justify-end'}`;
        
        messageDiv.innerHTML = `
            <div class="${type === 'agent' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                : 'bg-white/20 text-white'} px-4 py-2 rounded-2xl max-w-xs backdrop-blur-sm">
                <div class="font-medium">${sender}</div>
                <div>${text}</div>
            </div>
        `;
        
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    updateStatus(state, color, text) {
        this.statusIndicator.className = `w-4 h-4 rounded-full bg-${color}-400 pulse-ring`;
        this.statusText.textContent = text;
    }

    async disconnect() {
        if (this.room) {
            this.room.disconnect();
        }
        window.location.reload();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ZeroTwoClient();
});
