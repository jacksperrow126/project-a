# Valy Life - Python Server

A RESTful API server built with FastAPI and PostgreSQL for the Valy Life application.

## Getting Started

### Prerequisites
- Python 3.8+
- pip
- PostgreSQL 12+ (installed and running)

### PostgreSQL Setup

1. Install PostgreSQL (if not already installed):
   - **macOS**: `brew install postgresql@14`
   - **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)

2. Start PostgreSQL service:
   - **macOS**: `brew services start postgresql@14`
   - **Linux**: `sudo systemctl start postgresql`
   - **Windows**: Start from Services or use pgAdmin

3. Create the database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE valy_life;

# Exit psql
\q
```

### Installation

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
   - Copy `.env` file (already created) or create one
   - Update `DATABASE_URL` if your PostgreSQL credentials differ:
     ```
     DATABASE_URL=postgresql://username:password@localhost:5432/valy_life
     ```

4. Initialize the database:
```bash
python init_db.py
```

5. Run the server:
```bash
python main.py
# or
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/{task_id}` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{task_id}` - Update a task
- `PATCH /api/tasks/{task_id}/complete` - Toggle task completion
- `DELETE /api/tasks/{task_id}` - Delete a task

## Project Structure

```
python_server/
  main.py              # FastAPI application entry point
  init_db.py           # Database initialization script
  app/
    database.py        # Database connection and session management
    db_models.py       # SQLAlchemy database models
    models.py          # Pydantic models for API
    routers/           # API route handlers
      tasks.py         # Task-related endpoints
  requirements.txt     # Python dependencies
  .env                 # Environment variables (not in git)
```

## Database Schema

The `tasks` table has the following structure:
- `id` (Integer, Primary Key)
- `title` (String, Required)
- `description` (String, Optional)
- `completed` (Boolean, Default: False)
- `created_at` (DateTime, Auto-generated)

## Development

### Environment Variables

Create a `.env` file with:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/valy_life
PORT=8000
CORS_ORIGINS=*
```

### Database Migrations

For production, consider using Alembic for database migrations:
```bash
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Future Enhancements

- Implement authentication and authorization
- Add proper error handling and logging
- Configure CORS for specific origins in production
- Add database connection pooling
- Implement database migrations with Alembic

