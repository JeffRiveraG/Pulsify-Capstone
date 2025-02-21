import os
import subprocess
import tensorflow as tf
from spleeter.separator import Separator

# Disable GPU usage to prevent CUDA errors
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

# Optimize TensorFlow's memory usage
tf.config.threading.set_inter_op_parallelism_threads(1)
tf.config.threading.set_intra_op_parallelism_threads(1)

# Requirements to use the script
print("\033[1;31m*Make Sure You Have FFmpeg Downloaded!*\033[0m")
print("Download the FULL version here:(https://www.gyan.dev/ffmpeg/builds/)")
print("\033[1;31m*Place Your Audio File In The Backend Folder*\033[0m")

# Prompt for FFmpeg path once
ffmpeg_path = input("Enter the full path to your FFmpeg executable without quotes (e.g. C:\\ffmpeg\\bin\\ffmpeg.exe): ").strip()

# Validate FFmpeg path
if not os.path.isfile(ffmpeg_path):
    print("Error: FFmpeg file not found")
    exit(1)

# Prevent repeated FFmpeg path modification
if ffmpeg_path not in os.environ["PATH"]:
    os.environ["PATH"] += os.pathsep + os.path.dirname(ffmpeg_path)

# Check if FFmpeg works
try:
    subprocess.run([ffmpeg_path, "-version"], check=True, stdout=subprocess.PIPE)
    print("It Works!")
except FileNotFoundError:
    print("Error: FFmpeg not found.")
    exit(1)

# Prompt for an audio file
mp3_file_name = input("Enter your file name (e.g. file.mp3): ").strip()

# Check if file exists
mp3_file = os.path.join(os.getcwd(), mp3_file_name)
if not os.path.isfile(mp3_file):
    print("Error: File does not exist in the current directory.")
    exit(1)

# Spleeter setup with multiprocessing disabled
output_dir = "split_audio"
separator = Separator("spleeter:4stems", multiprocess=False)

# Prevent re-entering input by ensuring FFmpeg is already set
separator.separate_to_file(mp3_file, output_dir)

print(f"Audio has been separated. Go to '{output_dir}' folder.")
