# audio_processing/views.py
import os
import math
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pydub import AudioSegment
import subprocess
import tensorflow as tf
from spleeter.separator import Separator
import whisper
from pydub import AudioSegment
from django.conf import settings


# Set up directories for uploads and output
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
OUTPUT_DIR = os.path.join(BASE_DIR, 'media', 'adjusted')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


whisper_model = whisper.load_model("small")

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

    # Ensure the FFmpeg directory is in PATH
    ffmpeg_dir = os.path.dirname(ffmpeg_path)
    if ffmpeg_dir not in os.environ["PATH"]:
        os.environ["PATH"] += os.pathsep + ffmpeg_dir

    # Validate FFmpeg by checking its version
    try:
        subprocess.run([ffmpeg_path, "-version"], check=True, stdout=subprocess.PIPE)
    except Exception as e:
        raise Exception("FFmpeg error: " + str(e))

    # Define output directory for separated stems (inside MEDIA_ROOT)
    output_dir = os.path.join(settings.MEDIA_ROOT, "split_audio")
    os.makedirs(output_dir, exist_ok=True)

    # Use Spleeter (using 4 stems) with multiprocessing disabled
    separator = Separator("spleeter:4stems", multiprocess=False)
    separator.separate_to_file(mp3_file, output_dir)
    return output_dir

def mix_audio_excluding_stem(base_folder, excluded_stem):
    """
    Combines all WAV files in base_folder excluding the one that includes the excluded_stem
    in its filename. The remaining stems are overlaid using pydub's AudioSegment.
    """
    audio_files = []
    for file in os.listdir(base_folder):
        if file.lower().endswith(".wav") and excluded_stem.lower() not in file.lower():
            audio_files.append(os.path.join(base_folder, file))
    
    if not audio_files:
        raise Exception(f"No audio files found after excluding stem '{excluded_stem}'.")

    # Load the first file to initialize the combined AudioSegment
    combined = AudioSegment.from_wav(audio_files[0])
    for file in audio_files[1:]:
        track = AudioSegment.from_wav(file)
        combined = combined.overlay(track)

    # Export the combined audio file
    output_filename = f"combined_{uuid.uuid4().hex}.wav"
    output_file_path = os.path.join(OUTPUT_DIR, output_filename)
    combined.export(output_file_path, format="wav")
    return output_file_path

def transcribe_song(mp3_file):
    try:
        result = whisper_model.transcribe(mp3_file)
        song_lyrics = "Lyrics\n" + result["text"]
        return song_lyrics
    except Exception as e:
        return f"Error transcribing song: {str(e)}"

@csrf_exempt
def process_audio_view(request):
    """
    API endpoint to process audio separation.
    If a 'stem' parameter is provided, the API filters out that stem by mixing all
    the remaining stems together.
    """
    if request.method == "POST":
        # Define the FFmpeg path (adjust as necessary)
        ffmpeg_path = r"C:\Users\mrale\OneDrive\Desktop\ffmpeg\bin\ffmpeg.exe"
        
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
            output_dir = separate_audio(file_path, ffmpeg_path)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
        requested_stem = request.POST.get("stem")
        if requested_stem:
            # Define the base folder where Spleeter saved the stems
            base_folder = os.path.join(output_dir, os.path.splitext(os.path.basename(file_path))[0])
            if not os.path.exists(base_folder):
                base_folder = output_dir
            
            # Use pydub to mix audio excluding the requested stem
            try:
                mixed_file_path = mix_audio_excluding_stem(base_folder, requested_stem)
            except Exception as e:
                return JsonResponse({"error": str(e)}, status=500)
            
            file_url = request.build_absolute_uri(
                os.path.join("/media/adjusted", os.path.basename(mixed_file_path))
            )
            return JsonResponse({
                "message": f"Audio processed successfully with '{requested_stem}' filtered out.",
                "output_file": file_url,
                "excluded_stem": requested_stem
            })
        else:
            return JsonResponse({
                "message": "Audio separated successfully.",
                "output_dir": output_dir
            })
    
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
            lyrics = transcribe_song(file_path)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
        return JsonResponse({"message": "Lyrics transcribed successfully", "lyrics": lyrics})
    
    return JsonResponse({"error": "Invalid request method"}, status=405)

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
    file_url = request.build_absolute_uri('/media/adjusted/' + output_name)
    return JsonResponse({'file_url': file_url})
