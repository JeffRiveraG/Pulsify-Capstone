from django.urls import path
from .views import upload_file, home

urlpatterns = [
    path('', home),
    path('upload-audio/', upload_file),
]