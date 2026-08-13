import argparse
import os
import sys
from typing import List, Dict, Any, Optional

# Automatically check for static_ffmpeg to ensure ffmpeg is available
try:
    import static_ffmpeg
    static_ffmpeg.add_paths()
except ImportError:
    pass

try:
    import yt_dlp
except ImportError:
    print("Error: 'yt-dlp' is required. Please install dependencies using:")
    print("       pip install -r requirements.txt")
    sys.exit(1)

# Ensure UTF-8 output encoding for Windows terminals to avoid charmap encoding errors
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')
        sys.stderr.reconfigure(encoding='utf-8', errors='backslashreplace')
    except Exception:
        pass


def format_duration(seconds: Optional[int]) -> str:
    """Format duration in seconds to MM:SS or HH:MM:SS string."""
    if not seconds:
        return "00:00"
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"


def fetch_video_info(url: str) -> Dict[str, Any]:
    """Fetch video metadata without downloading the video."""
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'js_runtimes': {'node': {}, 'deno': {}},
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'ios', 'web', 'mweb']
            }
        }
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        duration = info.get('duration', 0)
        return {
            'id': info.get('id'),
            'title': info.get('title', 'Unknown Title'),
            'channel': info.get('uploader') or info.get('channel') or 'Unknown Channel',
            'duration': duration,
            'duration_str': format_duration(duration),
            'thumbnail': info.get('thumbnail'),
            'url': url
        }


def convert_single_video(
    url: str,
    output_dir: str = "downloads",
    quality: str = "192",
    progress_callback: Optional[Any] = None
) -> Dict[str, Any]:
    """Download a single YouTube video and convert it to MP3 format."""
    os.makedirs(output_dir, exist_ok=True)

    def internal_hook(d: dict) -> None:
        if progress_callback:
            progress_callback(d)

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': quality,
        }],
        'progress_hooks': [internal_hook] if progress_callback else [],
        'js_runtimes': {'node': {}, 'deno': {}},
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'ios', 'web', 'mweb']
            }
        },
        'ignoreerrors': False,
        'quiet': True,
        'no_warnings': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        raw_filename = ydl.prepare_filename(info)
        mp3_filepath = os.path.splitext(raw_filename)[0] + ".mp3"
        mp3_filename = os.path.basename(mp3_filepath)

        return {
            'id': info.get('id'),
            'title': info.get('title', 'Unknown Title'),
            'channel': info.get('uploader') or info.get('channel') or 'Unknown Channel',
            'duration': info.get('duration', 0),
            'duration_str': format_duration(info.get('duration', 0)),
            'thumbnail': info.get('thumbnail'),
            'mp3_filename': mp3_filename,
            'mp3_filepath': mp3_filepath,
            'filesize_bytes': os.path.getsize(mp3_filepath) if os.path.exists(mp3_filepath) else 0
        }


def progress_hook(d: dict) -> None:
    """Callback hook to display download progress in real-time."""
    if d.get('status') == 'downloading':
        percent = d.get('_percent_str', '').strip()
        speed = d.get('_speed_str', '').strip()
        eta = d.get('_eta_str', '').strip()
        raw_name = os.path.basename(d.get('filename', ''))
        filename = raw_name[:30]
        try:
            print(f"\r[Downloading] {filename:<30} | {percent:<8} | Speed: {speed:<10} | ETA: {eta:<8}", end="", flush=True)
        except UnicodeEncodeError:
            print(f"\r[Downloading] {percent:<8} | Speed: {speed:<10} | ETA: {eta:<8}", end="", flush=True)
    elif d.get('status') == 'finished':
        print(f"\n[OK] Download complete. Converting audio to MP3...")


def download_youtube_as_mp3(urls: List[str], output_dir: str = "downloads", quality: str = "192") -> None:
    """Batch download YouTube videos from a list of URLs and convert them to MP3 files."""
    os.makedirs(output_dir, exist_ok=True)

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': quality,
        }],
        'progress_hooks': [progress_hook],
        'js_runtimes': {'node': {}, 'deno': {}},
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'ios', 'web', 'mweb']
            }
        },
        'ignoreerrors': True,
        'quiet': False,
        'no_warnings': True,
    }

    successful = 0
    failed = 0

    abs_output_dir = os.path.abspath(output_dir)
    print("=" * 60)
    print(f" YouTube to MP3 Downloader")
    print(f" Output Directory: {abs_output_dir}")
    print(f" Quality Setting:  {quality} kbps")
    print(f" Total URLs:       {len(urls)}")
    print("=" * 60)

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        for idx, url in enumerate(urls, start=1):
            url = url.strip()
            if not url or url.startswith('#'):
                continue

            print(f"\n[{idx}/{len(urls)}] Processing: {url}")
            try:
                error_code = ydl.download([url])
                if error_code == 0:
                    successful += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"[X] Failed to process {url}: {e}")
                failed += 1

    print("\n" + "=" * 60)
    print(" Summary:")
    print(f"  [OK] Successfully downloaded & converted: {successful}")
    print(f"  X Failed / Skipped:                     {failed}")
    print(f"  Output folder:                          {abs_output_dir}")
    print("=" * 60)


def parse_arguments():
    parser = argparse.ArgumentParser(
        description="Batch download YouTube videos/playlists as high-quality MP3 files."
    )
    parser.add_argument("urls", nargs="*", help="YouTube URLs separated by spaces.")
    parser.add_argument("-f", "--file", help="Path to a text file containing YouTube URLs (one per line).")
    parser.add_argument("-o", "--output", default="downloads", help="Directory to save MP3 files (default: 'downloads').")
    parser.add_argument("-q", "--quality", default="192", choices=["128", "192", "256", "320", "0"], help="MP3 bitrate quality in kbps, or 0 for VBR (default: '192').")
    return parser.parse_args()


def main():
    args = parse_arguments()
    urls_to_process = []

    if args.urls:
        urls_to_process.extend(args.urls)

    if args.file:
        if os.path.exists(args.file):
            with open(args.file, "r", encoding="utf-8") as f:
                lines = [line.strip() for line in f if line.strip() and not line.startswith('#')]
                urls_to_process.extend(lines)
        else:
            print(f"Error: Specified URL file '{args.file}' was not found.")
            sys.exit(1)

    if not urls_to_process:
        print("No URLs provided via command line arguments or file.")
        print("Enter YouTube URLs (one per line). Press Enter on an empty line when done:\n")
        while True:
            try:
                line = input("URL: ").strip()
                if not line:
                    break
                urls_to_process.append(line)
            except EOFError:
                break

    if not urls_to_process:
        print("No URLs entered. Exiting.")
        sys.exit(0)

    download_youtube_as_mp3(
        urls=urls_to_process,
        output_dir=args.output,
        quality=args.quality
    )


if __name__ == "__main__":
    main()
