# audio_processing/views.py
import os
import math
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pydub import AudioSegment

# Set up directories for uploads and output
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
OUTPUT_DIR = os.path.join(BASE_DIR, 'media', 'adjusted')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

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
<<<<<<< Updated upstream
    return JsonResponse({'file_url': file_url})
=======
    return JsonResponse({'file_url': file_url})
>>>>>>> Stashed changes
