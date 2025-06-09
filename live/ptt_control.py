import socket
import sounddevice as sd
import numpy as np
import wave
import os
from datetime import datetime

PORT = 50007
SAMPLE_RATE = 16000
CHUNK = 1024
RECORDINGS_DIR = './recordings'

os.makedirs(RECORDINGS_DIR, exist_ok=True)

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(('0.0.0.0', PORT))

print(f"🎧 Listening on port {PORT}...")

frames = []

def save_recording(frames):
    filename = datetime.now().strftime("incoming_%Y%m%d_%H%M%S.wav")
    filepath = os.path.join(RECORDINGS_DIR, filename)
    wf = wave.open(filepath, 'wb')
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(b''.join(frames))
    wf.close()
    print(f"💾 Saved: {filename}")

try:
    while True:
        data, addr = sock.recvfrom(CHUNK * 2)
        audio = np.frombuffer(data, dtype='int16')
        frames.append(data)
        sd.play(audio, samplerate=SAMPLE_RATE)
except KeyboardInterrupt:
    print("\n🛑 Session ended. Saving audio...")
    save_recording(frames)
