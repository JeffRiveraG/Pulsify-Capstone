# audio_processing/views.py
import os
import math
import uuid
import subprocess
import tensorflow as tf
import whisper
from spleeter.separator import Separator
from pydub import AudioSegment
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import logging

# Set up directories for uploads and output
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
OUTPUT_DIR = os.path.join(BASE_DIR, 'media', 'adjusted')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load the Whisper model once (for lyrics transcription)
whisper_model = whisper.load_model("small")

@csrf_exempt
def adjust_volume(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
    # Get the uploaded file and volume slider value (default is 100)
    audio_file = request.FILES.get('file')
    if not audio_file:
        return JsonResponse({'error': 'No file provided'}, status=400)
    try:
        volume = float(request.POST.get('volume', 100))
    except ValueError:
        volume = 100

    # Save the uploaded file
    unique_id = uuid.uuid4().hex
    filename = unique_id + "_" + audio_file.name
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, 'wb+') as f:
        for chunk in audio_file.chunks():
            f.write(chunk)
    
    # Load the MP3 using pydub
    try:
        audio = AudioSegment.from_file(file_path, format="mp3")
    except Exception as e:
        return JsonResponse({'error': f"Error loading audio: {str(e)}"}, status=500)

    # Convert slider value to decibel gain
    def slider_to_db(val):
        if val <= 0:
            return -120  # mute
        return 20 * math.log10(val / 100)
    
    adjusted_audio = audio.apply_gain(slider_to_db(volume))
    
    # Export the adjusted audio as an MP3 file
    output_name = unique_id + "_adjusted.mp3"
    output_path = os.path.join(OUTPUT_DIR, output_name)
    adjusted_audio.export(output_path, format="mp3", bitrate="192k")
    
    # Return the absolute URL
    try:
        return JsonResponse({'file_url': request.build_absolute_uri('/media/adjusted/' + output_name)})
    except BrokenPipeError:
        logging.error("Broken pipe error while returning adjust_volume response")
        return

def separate_audio(mp3_file, ffmpeg_path):
    """
    Separates the audio file into stems using Spleeter.
    """
    # Disable GPU usage to prevent CUDA errors
    os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
    tf.config.threading.set_inter_op_parallelism_threads(1)
    tf.config.threading.set_intra_op_parallelism_threads(1)

    # Check the FFmpeg path
    if not os.path.isfile(ffmpeg_path):
        raise FileNotFoundError("FFmpeg file not found at " + ffmpeg_path)

    # Use Spleeter (using 4 stems) with multiprocessing disabled.
    # The separated stems will be saved in a folder under MEDIA_ROOT/split_audio.
    separator = Separator("spleeter:4stems", multiprocess=False)
    output_dir = os.path.join(settings.MEDIA_ROOT, "split_audio")
    os.makedirs(output_dir, exist_ok=True)
    separator.separate_to_file(mp3_file, output_dir)
    return output_dir

@csrf_exempt
def process_audio_view(request):
    """
    API endpoint to process audio separation.
    Returns URLs for the separated stems: vocals, drums, bass, and instrument (other).
    """
    if request.method == "POST":
        # Use bundled FFmpeg path relative to BASE_DIR (ffmpeg.exe is in the ffmpeg_bin folder)
        ffmpeg_path = os.path.join(BASE_DIR, 'ffmpeg_bin', 'ffmpeg.exe')
        
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return JsonResponse({"error": "No file uploaded"}, status=400)
        
        # Save uploaded file in MEDIA_ROOT/uploads
        upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, uuid.uuid4().hex + "_" + uploaded_file.name)
        with open(file_path, "wb+") as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)
        
        try:
            output_dir = separate_audio(file_path, ffmpeg_path)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
        # Determine the folder where Spleeter saved the stems.
        # By default, Spleeter creates a folder named <file_basename>_LIMBO.
        base_filename = os.path.splitext(os.path.basename(file_path))[0]
        possible_folder = os.path.join(output_dir, base_filename + "_LIMBO")
        if os.path.exists(possible_folder):
            stem_folder = possible_folder
        else:
            # Fallback: try folder without _LIMBO
            stem_folder = os.path.join(output_dir, base_filename)
            if not os.path.exists(stem_folder):
                stem_folder = output_dir  # As a last resort
        
        # Build absolute paths for each stem file.
        vocals_path = os.path.join(stem_folder, "vocals.wav")
        drums_path = os.path.join(stem_folder, "drums.wav")
        bass_path = os.path.join(stem_folder, "bass.wav")
        instrument_path = os.path.join(stem_folder, "other.wav")
        
        # Check if any expected file is missing.
        missing_files = []
        for name, path in zip(["vocals", "drums", "bass", "instrument"],
                              [vocals_path, drums_path, bass_path, instrument_path]):
            if not os.path.exists(path):
                missing_files.append(name)
        if missing_files:
            return JsonResponse({"error": "Missing stem files: " + ", ".join(missing_files)}, status=500)
        
        # Build URLs using MEDIA_URL. (Ensure your urls.py is serving media files.)
        folder_name = os.path.basename(stem_folder)
        vocals_url = request.build_absolute_uri(os.path.join("/media/split_audio", folder_name, "vocals.wav"))
        drums_url = request.build_absolute_uri(os.path.join("/media/split_audio", folder_name, "drums.wav"))
        bass_url = request.build_absolute_uri(os.path.join("/media/split_audio", folder_name, "bass.wav"))
        instrument_url = request.build_absolute_uri(os.path.join("/media/split_audio", folder_name, "other.wav"))
        
        try:
            return JsonResponse({
                "message": "Audio separated successfully.",
                "vocals": vocals_url,
                "drums": drums_url,
                "bass": bass_url,
                "instrument": instrument_url
            })
        except BrokenPipeError:
            logging.error("Broken pipe error while returning process_audio_view response")
            return
    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def process_lyrics_view(request):
    """
    API endpoint to transcribe lyrics from an uploaded MP3 file.
    """
    if request.method == "POST":
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return JsonResponse({"error": "No file uploaded"}, status=400)
        
        upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, uuid.uuid4().hex + "_" + uploaded_file.name)
        with open(file_path, "wb+") as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)
        
        try:
            lyrics = whisper_model.transcribe(file_path)["text"]
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
        try:
            return JsonResponse({"message": "Lyrics transcribed successfully", "lyrics": "Lyrics\n" + lyrics})
        except BrokenPipeError:
            logging.error("Broken pipe error while returning process_lyrics_view response")
            return
    return JsonResponse({"error": "Invalid request method"}, status=405)
