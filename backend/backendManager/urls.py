from django.contrib import admin
from django.urls import path
from audio_processing import views
from django.conf import settings
from django.conf.urls.static import static
from audio_processing import views

# Add these two imports for serving media files
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [

    path('admin/', admin.site.urls),
    path('audio-separation/', views.process_audio_view, name='audio_separation'),
    path('process_lyrics/', views.process_lyrics_view, name='process_lyrics'),
    path('adjust_volume/', views.adjust_volume, name='adjust_volume'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
