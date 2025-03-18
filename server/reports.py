from flask import Blueprint, request, send_file, jsonify
from models import db, Solution, User, Task, Step
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io
from datetime import datetime

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@reports_bp.route('/pdf', methods=['POST'])
def generate_pdf_report():
    """
    Генерирует PDF-отчет с историей решений студентов, разбором ошибок и подсказками.
    Ожидается JSON с параметрами фильтрации: period (например, "2024-01-01:2024-02-01"),
    task_id и student_id (опционально).
    """
    data = request.json
    period = data.get("period")  # формат "YYYY-MM-DD:YYYY-MM-DD"
    task_id = data.get("task_id")
    student_id = data.get("student_id")
    query = Solution.query
    if period:
        try:
            start_str, end_str = period.split(":")
            start_date = datetime.strptime(start_str, "%Y-%m-%d")
            end_date = datetime.strptime(end_str, "%Y-%m-%d")
            query = query.filter(Solution.created_at >= start_date, Solution.created_at <= end_date)
        except Exception as e:
            return jsonify({"message": "Invalid period format. Use YYYY-MM-DD:YYYY-MM-DD"}), 400
    if task_id:
        query = query.filter(Solution.task_id == task_id)
    if student_id:
        query = query.filter(Solution.user_id == student_id)

    solutions = query.all()

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 50

    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, y, "Отчет по решениям студентов")
    y -= 30
    p.setFont("Helvetica", 12)
    
    if not solutions:
        p.drawString(50, y, "Нет решений для заданного периода или фильтров.")
    else:
        for sol in solutions:
            user = sol.user
            task = sol.task
            p.drawString(50, y, f"Решение ID: {sol.id} | Пользователь: {user.username} | Задача: {task.title} | Статус: {sol.status}")
            y -= 20
            for step in sorted(sol.steps, key=lambda s: s.step_number):
                text = f"Шаг {step.step_number}: {step.input_expr} | Корректно: {step.is_correct}"
                if not step.is_correct:
                    text += f" | Ошибка: {step.error_type} | Подсказка: {step.hint}"
                p.drawString(70, y, text)
                y -= 15
                if y < 50:
                    p.showPage()
                    y = height - 50
            y -= 20
            if y < 50:
                p.showPage()
                y = height - 50

    p.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name="report.pdf", mimetype="application/pdf")
