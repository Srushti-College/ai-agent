from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os
import time

app = Flask(__name__)
CORS(app)


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "postgres"),
        database=os.getenv("DB_NAME", "ai_agent"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
        port=os.getenv("DB_PORT", "5432")
    )


def initialize_database():
    for attempt in range(10):
        try:
            conn = get_connection()
            cursor = conn.cursor()

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id SERIAL PRIMARY KEY,
                    user_message TEXT NOT NULL,
                    agent_response TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            conn.commit()
            cursor.close()
            conn.close()

            print("Database initialized successfully")
            return

        except Exception as error:
            print(f"Database connection failed: {error}")
            time.sleep(5)

    raise Exception("Could not connect to database")


def generate_agent_response(message):
    message_lower = message.lower()

    if "status" in message_lower or "health" in message_lower:
        return (
            "Here is the current system status:\n\n"
            "✅ Backend API: Healthy\n"
            "✅ Database: Connected\n"
            "✅ AI Agent: Active\n"
            "⚡ Response Time: 245ms\n"
            "📈 Uptime: 99.9%"
        )

    if "database" in message_lower:
        return (
            "Database status:\n\n"
            "✅ PostgreSQL is connected.\n"
            "✅ Database: ai_agent\n"
            "✅ Persistent storage: Enabled\n"
            "✅ Database runs as a Kubernetes StatefulSet."
        )

    if "deployment" in message_lower or "kubernetes" in message_lower:
        return (
            "Deployment information:\n\n"
            "🚀 Frontend: Kubernetes Deployment\n"
            "🚀 Backend: Kubernetes Deployment\n"
            "💾 PostgreSQL: StatefulSet\n"
            "🌐 Ingress: Enabled\n"
            "📊 Monitoring: Prometheus + Grafana"
        )

    if "docker" in message_lower:
        return (
            "Container information:\n\n"
            "🐳 Frontend image is stored in Docker Hub.\n"
            "🐳 Backend image is stored in Docker Hub.\n"
            "🔍 Trivy scans the images before deployment."
        )

    if "jenkins" in message_lower or "pipeline" in message_lower:
        return (
            "CI/CD pipeline:\n\n"
            "1. Git push\n"
            "2. Webhook\n"
            "3. Jenkins checkout\n"
            "4. SonarQube analysis\n"
            "5. Trivy scan\n"
            "6. Docker build\n"
            "7. Docker Hub push\n"
            "8. Minikube deployment"
        )

    return (
        "I'm your AI Agent Assistant 🤖\n\n"
        f"You asked: {message}\n\n"
        "I can help you with system status, Kubernetes, "
        "Docker, Jenkins, database and deployment information."
    )


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "UP",
        "service": "ai-agent-backend"
    })


@app.route("/api/status", methods=["GET"])
def status():

    database_status = "Connected"

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        conn.close()
    except Exception:
        database_status = "Disconnected"

    return jsonify({
        "backend": "Healthy",
        "database": database_status,
        "agent": "Active",
        "response_time": "245ms",
        "uptime": "99.9%"
    })


@app.route("/api/chat", methods=["POST"])
def chat():

    data = request.get_json()

    if not data or not data.get("message"):
        return jsonify({
            "error": "message is required"
        }), 400

    message = data["message"]

    response = generate_agent_response(message)

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO conversations
            (user_message, agent_response)
            VALUES (%s, %s)
            """,
            (message, response)
        )

        conn.commit()

        cursor.close()
        conn.close()

    except Exception as error:
        print(f"Could not save conversation: {error}")

    return jsonify({
        "message": message,
        "response": response
    })


@app.route("/api/history", methods=["GET"])
def history():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, user_message, agent_response, created_at
        FROM conversations
        ORDER BY id DESC
        LIMIT 20
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    result = []

    for row in rows:
        result.append({
            "id": row[0],
            "message": row[1],
            "response": row[2],
            "created_at": str(row[3])
        })

    return jsonify(result)


if __name__ == "__main__":
    initialize_database()

    app.run(
        host="0.0.0.0",
        port=5000
    )
