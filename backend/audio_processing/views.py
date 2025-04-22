import os
from django.shortcuts import render
from django.http import JsonResponse
from spleeter.separator import Separator
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage


def home(request):
    # Not really needed
    return HttpResponse("Welcome to the Spleeter backend!")

@csrf_exempt # Disable CSRF for this view (TESTING ONLY - Ignore cookies)
def upload_file(request):
    if request.method == 'POST' and 'audio' in request.FILES:                               # Only accept POST request if audio file is present
        audio_file = request.FILES['audio']                                                 # Get the audio file from the request
        filename = default_storage.save(f"input/{audio_file.name}", audio_file)             # Save the file to the input directory - input/
        input_path = os.path.join("input", audio_file.name)                                 # Get the full path of the saved file               
        output_root = os.path.join("output", os.path.splitext(audio_file.name)[0])          # Create output directory for the separated stems
        
        os.makedirs(output_root, exist_ok=True)                                             # Create the output directory if it doesn't exist

        try:                                                                                # Try to separate the audio file using Spleeter
            separator = Separator('spleeter:4stems')                                        # Get 4 stems
            separator.separate_to_file(input_path, "output/")                               # Separate the stems to the output directory - output/

            stem_dir = os.path.join("output", os.path.splitext(audio_file.name)[0])         # Get the directory of the separated stems
            stems = {                                                                       # List of stem files
                "vocals": f"http://127.0.0.1:8000/{stem_dir}/vocals.wav",
                "drums": f"http://127.0.0.1:8000/{stem_dir}/drums.wav",
                "bass": f"http://127.0.0.1:8000/{stem_dir}/bass.wav",
                "instrument": f"http://127.0.0.1:8000/{stem_dir}/other.wav",
            }                 
            stem_urls = [f"http://127.0.0.1:8000/{stem_dir}/{stem}" for stem in stems]      # Create URLs for the separated stems

            return JsonResponse(stems)
        except Exception as e:
            return JsonResponse({"error": str(e)})
    return JsonResponse({"error": "Invalid request"})

"""def run_spleeter(request):
    # create separator instance - 2stems (vocals and accompaniment)
    separator = Separator('spleeter:4stems')

    # input file path and output directory
    input_file = 'audio_processing/input/audio_example.mp3'
    output_path = 'audio_processing/output'

    # create output directory if it doesn't exist
    os.makedirs(output_path, exist_ok=True)

    # try to separate audio file 
    try:
        # separate the audio file to the output directory
        separator.separate_to_file(input_file, output_path)
        return JsonResponse({'status': 'success', 'message': 'Separation completed successfully.'})
    
    # except FileNotFoundError:
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})"""