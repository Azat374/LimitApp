from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from utils.Auth.auth import auth_bp
from tasks import tasks_bp
from solutions import solutions_bp
from reports import reports_bp
from profile import profile_bp
from solution_integral import solution_integral_bp
from tasks_generator import tasks_generator_bp
from users import users_bp
import logging
from logging.handlers import RotatingFileHandler
import os

# Настройка логирования
if not os.path.exists('logs'):
    os.mkdir('logs')
file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)

app = Flask(__name__)
app.config.from_object(Config)

# Настройка логирования для приложения
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('LimitApp startup')

# Настройка CORS для разрешения запросов с фронтенда
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

db.init_app(app)

# Регистрация Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(tasks_bp)
app.register_blueprint(solutions_bp)
app.register_blueprint(reports_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(solution_integral_bp)
app.register_blueprint(tasks_generator_bp)
app.register_blueprint(users_bp)

# Создание таблиц, если их ещё нет
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
