from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Task(db.Model):
    __tablename__ = "tasks"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    difficulty = db.Column(db.String(50), default="medium")

class Solution(db.Model):
    __tablename__ = "solutions"
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)
    status = db.Column(db.String(50), default="in_progress")  # in_progress, completed, error

class Step(db.Model):
    __tablename__ = "steps"
    id = db.Column(db.Integer, primary_key=True)
    solution_id = db.Column(db.Integer, db.ForeignKey("solutions.id"), nullable=False)
    step_number = db.Column(db.Integer, nullable=False)
    input_expr = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, default=True)
    error_type = db.Column(db.String(100), nullable=True)
    hint = db.Column(db.Text, nullable=True)
