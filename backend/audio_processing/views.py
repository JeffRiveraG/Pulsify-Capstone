from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
from .script import separate_audio
# Create your views here.
# This is where sound source separation will be implemented.


@csrf_exempt  # For simplicity; in production consider proper CSRF handling
def process_audio_view(request):
    if request.method == "POST":
        # Set your FFmpeg path here (update to the correct path on your server)
        ffmpeg_path = r"C:\ffmpeg\bin\ffmpeg.exe"
        
        # Get the uploaded file from the request
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return JsonResponse({"error": "No file uploaded"}, status=400)
        
        # Define a directory to save the uploaded file (make sure this exists)
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, uploaded_file.name)
        
        # Save the uploaded file to disk
        with open(file_path, "wb+") as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)
        
        try:
            # Process the audio file using the refactored function
            output_dir = separate_audio(file_path, ffmpeg_path)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
        return JsonResponse({"message": "Audio separated successfully", "output_dir": output_dir})
    
    return JsonResponse({"error": "Invalid request method"}, status=405)
