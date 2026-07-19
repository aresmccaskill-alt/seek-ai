// AI Eye App - Voice Commands, Vision, and Cat Language

class AIEye {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.videoStream = null;
        this.canvasContext = null;
        this.detectionModel = null;
        this.catSounds = ['meow', 'purr', 'hiss', 'yowl', 'chirp', 'mew'];
        
        this.initVoiceRecognition();
        this.setupEventListeners();
        this.animateEye();
    }

    initVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.addLog('❌ Speech Recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.language = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.addLog('🎤 Listening...');
            document.getElementById('responseText').textContent = 'Listening...';
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                this.processCommand(finalTranscript.toLowerCase().trim());
            }

            document.getElementById('responseText').textContent = interimTranscript || finalTranscript;
        };

        this.recognition.onerror = (event) => {
            this.addLog(`❌ Error: ${event.error}`);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.addLog('⏹️ Listening stopped');
        };
    }

    processCommand(command) {
        this.addLog(`📢 Command: "${command}"`);

        // Cat language detection
        if (this.detectCatLanguage(command)) {
            this.addLog('🐱 Cat language detected!');
            document.getElementById('responseText').textContent = '🐱 Meow! Purr purr...';
            return;
        }

        // Code generation commands
        if (command.includes('write code') || command.includes('generate code')) {
            this.generateCode();
            return;
        }

        // Simulate commands
        if (command.includes('simulate')) {
            this.simulateAction(command);
            return;
        }

        // Default response
        document.getElementById('responseText').textContent = `✓ Got it: ${command}`;
    }

    detectCatLanguage(text) {
        const catKeywords = ['meow', 'purr', 'hiss', 'yowl', 'chirp', 'mew', 'cat', 'kitten', 'paw', 'whiskers', 'tail'];
        return catKeywords.some(keyword => text.includes(keyword));
    }

    generateCode() {
        const code = `
// Generated AI Code
class SmartEye {
    constructor() {
        this.seesYou = true;
        this.listensTo = ['voice', 'cats', 'commands'];
    }
    
    detectGender(person) {
        if (person.type === 'girl') {
            return 'catnapsisbest';
        }
        return 'processing...';
    }
    
    executeCommand(voice) {
        console.log('Processing:', voice);
    }
}
`;
        this.addLog('💻 Code Generated:');
        this.addLog(code);
        document.getElementById('responseText').textContent = 'Code generated! Check logs.';
    }

    simulateAction(command) {
        this.addLog(`⚡ Simulating: ${command}`);
        document.getElementById('responseText').textContent = `Simulating: ${command}`;
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startListening());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopListening());
        document.getElementById('cameraBtn').addEventListener('click', () => this.enableCamera());
        document.getElementById('eyeContainer')?.addEventListener('click', () => this.startListening());

        // Eye follows cursor
        document.addEventListener('mousemove', (e) => this.updateEyePosition(e));
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    async enableCamera() {
        try {
            this.addLog('📷 Requesting camera access...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });

            const video = document.getElementById('cameraFeed');
            video.srcObject = stream;
            this.videoStream = stream;

            this.addLog('✓ Camera enabled');
            this.startDetection();
        } catch (error) {
            this.addLog(`❌ Camera error: ${error.message}`);
        }
    }

    async startDetection() {
        const video = document.getElementById('cameraFeed');
        const canvas = document.getElementById('detectionCanvas');
        const ctx = canvas.getContext('2d');

        const detect = async () => {
            if (!this.videoStream) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);

            // Simple face detection using canvas analysis
            this.analyzeFrame(canvas, ctx);
            
            requestAnimationFrame(detect);
        };

        detect();
    }

    analyzeFrame(canvas, ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple color analysis for gender/person detection
        let skinTones = 0;
        let eyeCount = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Detect skin tones
            if (r > 95 && g > 40 && b > 20 && r > b && r > g) {
                skinTones++;
            }

            // Detect dark areas (potential eyes)
            if (r < 100 && g < 100 && b < 100) {
                eyeCount++;
            }
        }

        const detectionInfo = document.getElementById('detectionInfo');
        const faceLabel = document.getElementById('faceLabel');

        if (skinTones > data.length * 0.1) {
            detectionInfo.textContent = '👤 Person Detected';
            
            // Simulate gender detection
            if (Math.random() > 0.5) {
                faceLabel.textContent = '♀️ Girl Detected';
                faceLabel.style.background = 'rgba(255, 100, 150, 0.8)';
                this.onGirlDetected();
            } else {
                faceLabel.textContent = '♂️ Boy Detected';
                faceLabel.style.background = 'rgba(100, 150, 255, 0.8)';
            }
        } else if (eyeCount > data.length * 0.05) {
            detectionInfo.textContent = '🐱 Cat Detected';
            faceLabel.textContent = '🐱 Meow!';
            faceLabel.style.background = 'rgba(255, 150, 100, 0.8)';
        } else {
            detectionInfo.textContent = 'Scanning...';
            faceLabel.textContent = '';
        }
    }

    onGirlDetected() {
        // Output special code
        const specialCode = 'catnapsisbest';
        this.addLog(`✨ Special Code: ${specialCode}`);
        document.getElementById('responseText').textContent = specialCode;
    }

    updateEyePosition(event) {
        const eyeContainer = document.getElementById('eyeContainer');
        if (!eyeContainer) return;

        const rect = eyeContainer.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const angle = Math.atan2(event.clientY - eyeCenterY, event.clientX - eyeCenterX);
        const distance = 15;

        const pupilX = eyeCenterX + Math.cos(angle) * distance;
        const pupilY = eyeCenterY + Math.sin(angle) * distance;

        const pupil = document.getElementById('pupil');
        if (pupil) {
            const relativeX = pupilX - (eyeCenterX - 20);
            const relativeY = pupilY - (eyeCenterY - 10);
            pupil.setAttribute('cx', eyeCenterX - eyeContainer.getBoundingClientRect().left + Math.cos(angle) * 15);
            pupil.setAttribute('cy', eyeCenterY - eyeContainer.getBoundingClientRect().top + Math.sin(angle) * 15);
        }
    }

    animateEye() {
        const iris = document.getElementById('iris');
        const pupil = document.getElementById('pupil');

        if (!iris || !pupil) return;

        let pulse = 0;
        let pulseDirection = 1;

        setInterval(() => {
            pulse += pulseDirection * 0.5;
            if (pulse > 2) pulseDirection = -1;
            if (pulse < 0) pulseDirection = 1;

            iris.setAttribute('r', 35 + pulse);
        }, 50);
    }

    addLog(message) {
        const statusLog = document.getElementById('statusLog');
        if (statusLog) {
            const p = document.createElement('p');
            p.textContent = message;
            statusLog.appendChild(p);
            statusLog.scrollTop = statusLog.scrollHeight;

            // Keep only last 10 logs
            const logs = statusLog.querySelectorAll('p');
            if (logs.length > 10) {
                logs[0].remove();
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiEye = new AIEye();
    console.log('🔮 AI Eye initialized - Ready to listen!');
});
