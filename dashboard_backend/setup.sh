#!/bin/bash

# Dashboard Backend Setup Script

echo "🚀 Setting up Dashboard Backend..."
echo ""

# Change to backend directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cat > .env << EOF
SECRET_KEY=django-insecure-your-secret-key-here-change-in-production
DEBUG=True
EOF
fi

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Setup initial data
echo "📊 Setting up initial data..."
python manage.py setup_initial_data

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "   1. Start Redis: redis-server"
echo "   2. Start server: python manage.py runserver"
echo "   3. Or with WebSocket support: daphne -b 0.0.0.0 -p 8000 dashboard_backend.asgi:application"
echo ""
echo "👤 Default users:"
echo "   Admin:  admin / admin123"
echo "   Editor: editor / editor123"
echo "   Viewer: viewer / viewer123"
echo ""
echo "📚 API Documentation: http://localhost:8000/api/v1/"
