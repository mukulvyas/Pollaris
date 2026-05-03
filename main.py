import subprocess
import os
import sys
import time
import signal

def start_pollaris():
    print("""
    ================================================
    [VOTE] POLLARIS - ELECTION EDUCATION PLATFORM [VOTE]
    ================================================
    Starting Backend and Frontend simultaneously...
    """)

    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    # Check for node_modules
    if not os.path.exists(os.path.join(frontend_dir, "node_modules")):
        print("[PKRG] Installing frontend dependencies (npm install)... this may take a minute.")
        subprocess.run(["npm", "install"], cwd=frontend_dir, shell=True)

    # Check for backend dependencies
    print("Verifying Python dependencies...")
    # Using --no-cache-dir can sometimes help with install issues on some systems
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], cwd=backend_dir)

    # 1. Start Backend (FastAPI)
    print("> Starting Backend on http://localhost:8000")
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=backend_dir
    )

    # 2. Start Frontend (Vite)
    print("> Starting Frontend on http://localhost:5173")
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_dir,
        shell=True
    )

    def signal_handler(sig, frame):
        print("\n\n!! Stopping Pollaris processes...")
        backend_process.terminate()
        frontend_process.terminate()
        print("OK. Shutdown complete. Jai Hind!")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    
    print("\n[READY] Both services are running! Press Ctrl+C to stop.")
    
    try:
        while True:
            if backend_process.poll() is not None:
                print("[ERR] Backend process exited.")
                break
            if frontend_process.poll() is not None:
                print("[ERR] Frontend process exited.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    start_pollaris()
