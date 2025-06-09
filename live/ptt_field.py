import socket
import sounddevice as sd
import numpy as np

DEST_IP = input("Enter control node Tailscale IP: ")
DEST_PORT = 50007
SAMPLE_RATE = 16000
CHUNK = 1024

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

def record_and_send():
    print("▶️  Hold Ctrl+C to stop transmission.")
    def callback(indata, frames, time, status):
        if status:
            print("⚠️", status)
        sock.sendto(indata.tobytes(), (DEST_IP, DEST_PORT))

    with sd.InputStream(samplerate=SAMPLE_RATE, channels=1, dtype='int16', callback=callback, blocksize=CHUNK):
        try:
            while True:
                pass
        except KeyboardInterrupt:
            print("\n🛑 Transmission stopped.")

if __name__ == '__main__':
    record_and_send()
