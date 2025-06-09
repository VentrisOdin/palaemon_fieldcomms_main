import socket
import sounddevice as sd
import numpy as np
import threading
import keyboard
import time

DEST_IP = input("Enter target device Tailscale IP: ")
DEST_PORT = 50007
LISTEN_PORT = 50007
SAMPLE_RATE = 16000
CHUNK = 1024

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(('0.0.0.0', LISTEN_PORT))

streaming = False

def transmit_audio():
    def callback(indata, frames, time_info, status):
        if status:
            print("⚠️", status)
        sock.sendto(indata.tobytes(), (DEST_IP, DEST_PORT))

    with sd.InputStream(samplerate=SAMPLE_RATE, channels=1, dtype='int16', callback=callback, blocksize=CHUNK):
        while streaming:
            time.sleep(0.01)

def receive_audio():
    while True:
        try:
            data, _ = sock.recvfrom(CHUNK * 2)
            audio = np.frombuffer(data, dtype='int16')
            sd.play(audio, samplerate=SAMPLE_RATE)
        except Exception as e:
            print(f"⚠️ Error receiving: {e}")

print("\n🔄 Field-to-field mode.")
print("▶️  Hold SPACEBAR to transmit. Listening in background.\n")

# Start receiving thread
rx_thread = threading.Thread(target=receive_audio, daemon=True)
rx_thread.start()

try:
    while True:
        if keyboard.is_pressed("space"):
            if not streaming:
                print("🎙️  TRANSMITTING...")
                streaming = True
                tx_thread = threading.Thread(target=transmit_audio)
                tx_thread.start()
        else:
            if streaming:
                print("🛑 IDLE")
                streaming = False
        time.sleep(0.01)
except KeyboardInterrupt:
    print("\n👋 Exiting peer comms.")
