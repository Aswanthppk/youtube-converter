# YouTube to MP3 Downloader

A Python script to batch download YouTube videos/playlists, extract high-quality audio, and save them as `.mp3` files.

## Features
- **Batch Processing**: Download multiple URLs specified via command-line arguments or from a `.txt` file.
- **Auto FFmpeg Setup**: Automatically downloads and configures FFmpeg binaries via `static-ffmpeg` if not installed on your system.
- **Configurable Quality**: Select MP3 audio bitrate (`128`, `192`, `256`, `320` kbps, or `0` for VBR).
- **Interactive Mode**: Prompt for URLs line-by-line if no arguments are passed.
- **Real-Time Progress**: Displays real-time download percentage, speed, and ETA.
- **Robust Error Handling**: Continues batch processing even if individual URLs fail.

---

## Installation

1. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

---

## Usage

### 1. Pass URLs via Command-Line
```bash
python download_mp3.py "https://www.youtube.com/watch?v=VIDEO_ID_1" "https://www.youtube.com/watch?v=VIDEO_ID_2"
```

### 2. Read URLs from a Text File
Create a text file (e.g., `urls.txt`) containing one YouTube URL per line:
```text
https://www.youtube.com/watch?v=VIDEO_ID_1
https://www.youtube.com/watch?v=VIDEO_ID_2
```
Then run:
```bash
python download_mp3.py -f urls.txt
```

### 3. Change Output Directory & Audio Quality
Save to a custom output directory with 320 kbps MP3 quality:
```bash
python download_mp3.py -f urls.txt -o my_music -q 320
```

### 4. Interactive Mode
Run the script without any arguments and enter URLs manually:
```bash
python download_mp3.py
```
