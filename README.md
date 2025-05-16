Pulsify Audio Stem Separation Web App is a full-stack application that allows users to upload an MP3 file and receive separated audio stems (such as vocals, drums, and bass) using Spleeter. The backend is built with Django and handles the upload and processing of audio files, while the frontend—located in the **frontend** directory—is built with Next.js and uses the Web Audio API to fetch and interactively control the playback of the resulting stems. To ensure compatibility with required libraries (especially Spleeter), this project strictly requires Python 3.8.

To get started with the backend, it's recommended to first create and activate a virtual environment using Python 3.8. Once activated, install the necessary dependencies by running **pip install -r requirements.txt*** from the project root. Then, navigate to the backend directory and start the Django development server with **python manage.py runserver** . For the frontend, navigate to the frontendbase directory, install the required packages with **npm install**, and then launch the Next.js development server by running **npm run dev**—make sure you are still inside the frontend directory when doing so.

The project is organized into two main components: the backend folder contains the Django logic responsible for processing uploads and running Spleeter, while the frontendbase folder contains the interactive Next.js frontend that fetches and plays back the separated stems using the Web Audio API. Both the backend and frontend servers should be running concurrently during for full functionality. 



Additional Information:

**npm install react-tsparticles tsparticles-engine tsparticles-slim** For particles for the main page
