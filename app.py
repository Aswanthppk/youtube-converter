import os
import sys
import uuid
import time
import threading
from typing import Dict, Any
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS

from download_mp3 import fetch_video_info, convert_single_video

# Paths
BASE_DIR = os.path.dirname(__file__)
FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, 'frontend', 'dist'))
DOWNLOAD_DIR = os.path.abspath(os.path.join(BASE_DIR, 'downloads'))
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# 24-Hour Cleanup Configurations
CLEANUP_INTERVAL_SECONDS = 3600  # Run cleanup check every 1 hour
MAX_FILE_AGE_SECONDS = 86400     # 24 hours in seconds (24 * 3600)

# Use frontend/dist if built, otherwise fall back to static
if os.path.exists(FRONTEND_DIST):
    app = Flask(__name__, static_folder=os.path.join(FRONTEND_DIST, 'assets'), static_url_path='/assets')
else:
    app = Flask(__name__, static_folder='static', static_url_path='')

CORS(app)

# In-memory task tracker
tasks: Dict[str, Dict[str, Any]] = {}
tasks_lock = threading.Lock()


def cleanup_old_downloads(max_age_seconds: int = MAX_FILE_AGE_SECONDS):
    """Deletes any files in DOWNLOAD_DIR that are older than max_age_seconds (24 hours)."""
    now = time.time()
    if not os.path.exists(DOWNLOAD_DIR):
        return 0

    deleted_count = 0
    for filename in os.listdir(DOWNLOAD_DIR):
        filepath = os.path.join(DOWNLOAD_DIR, filename)
        if os.path.isfile(filepath):
            try:
                file_age = now - os.path.getmtime(filepath)
                if file_age > max_age_seconds:
                    os.remove(filepath)
                    deleted_count += 1
                    print(f"[Cleanup Scheduler] Purged old file (>24h): {filename} (Age: {round(file_age / 3600, 1)} hrs)")
            except Exception as e:
                print(f"[Cleanup Scheduler Error] Failed to delete {filename}: {e}")

    if deleted_count > 0:
        print(f"[Cleanup Scheduler] Total files purged in run: {deleted_count}")
    return deleted_count


def start_cleanup_scheduler():
    """Background daemon thread to periodically purge files older than 24 hours."""
    def worker():
        while True:
            try:
                cleanup_old_downloads()
            except Exception as e:
                print(f"[Cleanup Thread Exception] {e}")
            time.sleep(CLEANUP_INTERVAL_SECONDS)

    t = threading.Thread(target=worker, daemon=True)
    t.start()
    print(f"[Cleanup Scheduler] Initialized. Monitoring '{DOWNLOAD_DIR}' (Purging files > 24 hours old).")


# Launch 24-hour cleanup background thread when server starts
start_cleanup_scheduler()


def run_conversion_task(task_id: str, url: str, quality: str):
    """Background worker function for YouTube video conversion."""
    with tasks_lock:
        tasks[task_id]['status'] = 'fetching'
        tasks[task_id]['progress'] = 5.0

    try:
        info = fetch_video_info(url)
        with tasks_lock:
            tasks[task_id]['info'] = info
            tasks[task_id]['status'] = 'downloading'
            tasks[task_id]['progress'] = 10.0

        def progress_callback(d: dict):
            status = d.get('status')
            with tasks_lock:
                if status == 'downloading':
                    percent_str = d.get('_percent_str', '0%').replace('%', '').strip()
                    try:
                        percent_val = float(percent_str)
                        tasks[task_id]['progress'] = round(10.0 + (percent_val * 0.75), 1)
                    except ValueError:
                        pass

                    tasks[task_id]['speed'] = d.get('_speed_str', '').strip()
                    tasks[task_id]['eta'] = d.get('_eta_str', '').strip()
                    tasks[task_id]['status'] = 'downloading'
                elif status == 'finished':
                    tasks[task_id]['status'] = 'converting'
                    tasks[task_id]['progress'] = 90.0

        res = convert_single_video(
            url=url,
            output_dir=DOWNLOAD_DIR,
            quality=quality,
            progress_callback=progress_callback
        )

        with tasks_lock:
            tasks[task_id]['status'] = 'finished'
            tasks[task_id]['progress'] = 100.0
            tasks[task_id]['result'] = {
                'filename': res['mp3_filename'],
                'filesize': res['filesize_bytes'],
                'filesize_mb': round(res['filesize_bytes'] / (1024 * 1024), 2)
            }

    except Exception as e:
        with tasks_lock:
            tasks[task_id]['status'] = 'error'
            tasks[task_id]['error'] = str(e)


@app.route('/')
def index():
    """Serve main single-page React web app."""
    if os.path.exists(FRONTEND_DIST):
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return send_from_directory('static', 'index.html')


@app.route('/api/info', methods=['POST'])
def get_info():
    """Fetch video metadata endpoint."""
    data = request.json or {}
    url = data.get('url', '').strip()

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        info = fetch_video_info(url)
        return jsonify({'success': True, 'info': info})
    except Exception as e:
        return jsonify({'error': f"Failed to fetch metadata: {str(e)}"}), 500


@app.route('/api/convert', methods=['POST'])
def convert():
    """Start background MP3 conversion task endpoint."""
    data = request.json or {}
    url = data.get('url', '').strip()
    quality = str(data.get('quality', '192'))

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    task_id = str(uuid.uuid4())

    with tasks_lock:
        tasks[task_id] = {
            'id': task_id,
            'url': url,
            'status': 'pending',
            'progress': 0.0,
            'speed': '',
            'eta': '',
            'info': {},
            'result': {},
            'error': None
        }

    t = threading.Thread(
        target=run_conversion_task,
        args=(task_id, url, quality),
        daemon=True
    )
    t.start()

    return jsonify({'success': True, 'task_id': task_id})


@app.route('/api/status/<task_id>', methods=['GET'])
def get_status(task_id: str):
    """Poll status of conversion task."""
    with tasks_lock:
        task = tasks.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        return jsonify({'success': True, 'task': task})


@app.route('/api/download/<path:filename>', methods=['GET'])
def download_file(filename: str):
    """Download converted MP3 file as browser attachment."""
    return send_from_directory(
        DOWNLOAD_DIR,
        filename,
        as_attachment=True,
        mimetype='audio/mpeg'
    )


@app.route('/api/history', methods=['GET'])
def get_history():
    """Get list of previously converted MP3 files in downloads directory."""
    try:
        files = []
        for name in os.listdir(DOWNLOAD_DIR):
            if name.lower().endswith('.mp3'):
                filepath = os.path.join(DOWNLOAD_DIR, name)
                stat = os.stat(filepath)
                files.append({
                    'filename': name,
                    'filesize_mb': round(stat.st_size / (1024 * 1024), 2),
                    'modified_time': int(stat.st_mtime)
                })

        files.sort(key=lambda x: x['modified_time'], reverse=True)
        return jsonify({'success': True, 'files': files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/cleanup', methods=['POST'])
def trigger_cleanup():
    """Manual endpoint to trigger 24-hour cleanup on demand."""
    try:
        purged = cleanup_old_downloads(max_age_seconds=MAX_FILE_AGE_SECONDS)
        return jsonify({'success': True, 'files_purged': purged})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\n========================================================")
    print(f" youmusic.store Web App is running at:")
    print(f" http://127.0.0.1:{port}")
    print(f"========================================================\n")
    app.run(host='0.0.0.0', port=port, debug=True)
