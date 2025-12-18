# Valy Life

A comprehensive life organization platform with mobile app, web interface, and backend API.

## Project Structure

This repository contains three main projects:

### 📱 Flutter App (`flutter_app/`)
Cross-platform mobile application for iOS and Android built with Flutter.

### 🌐 Next.js Website (`nextjs_website/`)
Modern web application built with Next.js 14, TypeScript, and Tailwind CSS.

### 🐍 Python Server (`python_server/`)
RESTful API server built with FastAPI for handling backend operations.

## Getting Started

Each project has its own README with detailed setup instructions. Here's a quick overview:

### Flutter App
```bash
cd flutter_app
flutter pub get
flutter run
```

### Next.js Website
```bash
cd nextjs_website
npm install
npm run dev
```

### Python Server
```bash
cd python_server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## Architecture

- **Frontend (Mobile)**: Flutter app for iOS and Android
- **Frontend (Web)**: Next.js website with TypeScript
- **Backend**: FastAPI Python server with REST API

All three components can communicate with the Python server API for data synchronization.

## Development

Each project can be developed and run independently. The Python server should be running for the Flutter app and Next.js website to connect to the backend API.

## License

This project is for personal use.

