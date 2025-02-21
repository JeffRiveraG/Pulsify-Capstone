## 🎯 How Django Works

1️⃣ Frontend (or client) sends a request to Django. MP3 gets sent to backend
2️⃣ Django receives the request and checks **urls.py** to find the correct view.
3️⃣ **views.py** processes the request, interacts with **models.py (database)**, and returns a response.
4️⃣ Django sends back data (JSON for APIs, HTML if using templates).

## User Flow - Frontend to Backend

1. User uploads an MP3 via the Next.js frontend.
2. Next.js sends the file to the Django backend (audio_processing app).
3. Django processes the audio using Spleeter and generates four stems:
   - Vocals
   - Instruments
   - Bass
   - Drums
4. Django returns the processed files' URLs to the frontend.
5. User listens to the separated audio via the frontend audio player.

## 🚀 Key Files to Work On

✅ views.py → Handles audio separations
✅ urls.py → Map URLs to views
✅ settings.py → ONLY when we use databases, if we need to make a new app

## 📌 Useful Django Commands

```bash
python manage.py startapp myapp  # Create a new app
python manage.py makemigrations  # Prepare database changes - Most likely not needed
python manage.py migrate         # Apply changes to database - Also maybe not needed
python manage.py runserver       # Start the server
python manage.py createsuperuser # Create an admin user - Not to sure if needed
```

## 💡 Notes

- Add new apps to INSTALLED_APPS in settings.py
- Any database changes require makemigrations and migrate
- API routes should be added in myapp/urls.py
