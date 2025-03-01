
import os
import subprocess
import tensorflow as tf
from spleeter.separator import Separator

def separate_audio(mp3_file, ffmpeg_path):
    """
    Separates the audio file into stems using Spleeter.

    Args:
        mp3_file (str): The full path to the MP3 file.
        ffmpeg_path (str): The full path to the FFmpeg executable.

    Returns:
        output_dir (str): The directory where the separated audio files are saved.
    """
    # Disable GPU usage to prevent CUDA errors
    os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

    # Optimize TensorFlow's memory usage
    tf.config.threading.set_inter_op_parallelism_threads(1)
    tf.config.threading.set_intra_op_parallelism_threads(1)

    # Validate FFmpeg path
    if not os.path.isfile(ffmpeg_path):
        raise FileNotFoundError("FFmpeg file not found")

    # Add FFmpeg directory to PATH if not already present
    if ffmpeg_path not in os.environ["PATH"]:
        os.environ["PATH"] += os.pathsep + os.path.dirname(ffmpeg_path)

    # Check if FFmpeg works
    try:
        subprocess.run([ffmpeg_path, "-version"], check=True, stdout=subprocess.PIPE)
    except Exception as e:
        raise Exception("FFmpeg error: " + str(e))

    # Spleeter setup with multiprocessing disabled
    output_dir = "split_audio"
    separator = Separator("spleeter:4stems", multiprocess=False)
    separator.separate_to_file(mp3_file, output_dir)

    return output_dir
