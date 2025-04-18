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
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

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
