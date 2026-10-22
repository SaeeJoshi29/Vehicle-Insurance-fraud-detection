# FraudGuard frontend (React + Vite)

Run the backend first (from your backend folder, where `models/` lives):

    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

Then the frontend (from this folder):

    npm install
    cp .env.example .env        # Windows: copy .env.example .env
    npm run dev

Open http://localhost:5173
Backend address is set in `.env` (VITE_API_URL). CORS in main.py already allows port 5173.
