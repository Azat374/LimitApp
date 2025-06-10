import os
import logging
import io
from datetime import datetime
from flask import Blueprint, request, send_file, jsonify
from models import db, Solution, User, Task, Step
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.graphics.shapes import Drawing, String
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_LEFT
import matplotlib.pyplot as plt
from collections import defaultdict
import matplotlib
import textwrap
matplotlib.use('Agg')

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

# Определяем базовую директорию
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
font_regular_path = os.path.join(BASE_DIR, "fonts", "DejaVuSans.ttf")
font_bold_path = os.path.join(BASE_DIR, "fonts", "DejaVuSans-Bold.ttf")
logging.info("Путь к DejaVuSans: %s", font_regular_path)
logging.info("Путь к DejaVuSans-Bold: %s", font_bold_path)

if not os.path.exists(font_regular_path) or not os.path.exists(font_bold_path):
    logging.error("Файл шрифта не найден. Проверьте пути к файлам шрифтов.")
else:
    pdfmetrics.registerFont(TTFont('DejaVuSans', font_regular_path))
    pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', font_bold_path))

def get_custom_styles():
    """Создает и возвращает кастомные стили для отчета"""
    styles = getSampleStyleSheet()
    
    styles.add(ParagraphStyle(
        name='ReportTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1,
        fontName='DejaVuSans-Bold',
        textColor=colors.HexColor('#2c3e50')
    ))
    
    styles.add(ParagraphStyle(
        name='ReportHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=20,
        fontName='DejaVuSans-Bold',
        textColor=colors.HexColor('#34495e')
    ))
    
    styles.add(ParagraphStyle(
        name='ReportBody',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=12,
        fontName='DejaVuSans',
        textColor=colors.HexColor('#2c3e50')
    ))

    styles.add(ParagraphStyle(
        name='TaskTitle',
        parent=styles['Normal'],
        fontSize=14,
        spaceAfter=12,
        fontName='DejaVuSans-Bold',
        textColor=colors.HexColor('#2980b9')
    ))

    styles.add(ParagraphStyle(
        name='TableCell',
        parent=styles['Normal'],
        fontSize=10,
        fontName='DejaVuSans',
        textColor=colors.HexColor('#2c3e50'),
        alignment=TA_LEFT,
        wordWrap='CJK'  # Улучшенный перенос слов
    ))
    
    return styles

def create_bar_chart(data, title):
    """Создает столбчатую диаграмму"""
    drawing = Drawing(400, 200)
    bc = VerticalBarChart()
    bc.x = 50
    bc.y = 50
    bc.height = 125
    bc.width = 300
    bc.data = [data]
    bc.strokeColor = colors.black
    bc.valueAxis.valueMin = 0
    bc.valueAxis.valueMax = max(data) + 10
    bc.valueAxis.valueStep = 10
    bc.categoryAxis.labels.boxAnchor = 'ne'
    bc.categoryAxis.labels.dx = -8
    bc.categoryAxis.labels.dy = -2
    bc.categoryAxis.labels.angle = 30
    bc.categoryAxis.categoryNames = ['Барлығы', 'Дұрыс', 'Қате']
    bc.bars[0].fillColor = colors.HexColor('#3498db')
    drawing.add(bc)
    return drawing

def create_pie_chart(data, title):
    """Создает круговую диаграмму"""
    drawing = Drawing(400, 200)
    pie = Pie()
    pie.x = 150
    pie.y = 50
    pie.width = 120
    pie.height = 120
    pie.data = [value for _, value in data]
    pie.labels = [label for label, _ in data]
    pie.slices.strokeWidth = 0.5
    
    colors_list = [
        colors.HexColor('#3498db'),
        colors.HexColor('#2ecc71'),
        colors.HexColor('#e74c3c'),
        colors.HexColor('#f1c40f'),
        colors.HexColor('#9b59b6')
    ]
    
    for i, color in enumerate(colors_list[:len(data)]):
        pie.slices[i].fillColor = color
    
    drawing.add(pie)
    return drawing

def calculate_statistics(solutions):
    """Вычисляет статистику по решениям"""
    total = len(solutions)
    if total == 0:
        return None
        
    correct = sum(1 for s in solutions if s.status == 'completed')
    incorrect = total - correct
    avg_steps = sum(len(s.steps) for s in solutions) / total if total > 0 else 0
    
    error_types = defaultdict(int)
    for sol in solutions:
        for step in sol.steps:
            if not step.is_correct and step.error_type:
                error_types[step.error_type] += 1
                
    return {
        'total': total,
        'correct': correct,
        'incorrect': incorrect,
        'success_rate': (correct / total * 100) if total > 0 else 0,
        'avg_steps': avg_steps,
        'error_types': dict(error_types)
    }

def format_datetime(dt):
    """Форматирует дату и время"""
    return dt.strftime("%d.%m.%Y %H:%M")

def format_math_expression(expr):
    """Форматирует математическое выражение для отображения"""
    # Оборачиваем выражение в параграф с переносом строк
    expr = expr.replace('\\', '\\\\').replace('^', '\\^').replace('_', '\\_')
    return Paragraph(expr, getSampleStyleSheet()['TableCell'])

def wrap_text(text, width=30):
    """Функция для переноса длинного текста"""
    return textwrap.fill(text, width=width)

@reports_bp.route('/pdf', methods=['POST'])
def generate_pdf_report():
    try:
        data = request.json
        period = data.get("period")
        task_id = data.get("task_id")
        student_id = data.get("student_id")

        query = Solution.query
        if period:
            try:
                start_str, end_str = period.split(":")
                start_date = datetime.strptime(start_str, "%Y-%m-%d")
                end_date = datetime.strptime(end_str, "%Y-%m-%d")
                end_date = end_date.replace(hour=23, minute=59, second=59)
                query = query.filter(Solution.created_at >= start_date, Solution.created_at <= end_date)
            except Exception as e:
                return jsonify({"message": "Invalid period format. Use YYYY-MM-DD:YYYY-MM-DD"}), 400
        if task_id:
            query = query.filter(Solution.task_id == task_id)
        if student_id:
            query = query.filter(Solution.user_id == student_id)

        solutions = query.all()
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
            title="Талдау есебі"
        )
        
        styles = get_custom_styles()
        elements = []
        
        # Заголовок отчета
        elements.append(Paragraph("Шешімдерді талдау есебі", styles['ReportTitle']))
        
        # Период отчета
        if period:
            period_text = f"Кезең: {start_str} - {end_str}"
            elements.append(Paragraph(period_text, styles['ReportBody']))
        
        elements.append(Spacer(1, 20))
        
        # Статистика
        stats = calculate_statistics(solutions)
        if stats:
            elements.append(Paragraph("Жалпы статистика", styles['ReportHeading']))
            
            # Таблица со статистикой
            stat_data = [
                ["Көрсеткіш", "Мәні"],
                ["Барлық шешімдер", str(stats['total'])],
                ["Дұрыс шешімдер", str(stats['correct'])],
                ["Қате шешімдер", str(stats['incorrect'])],
                ["Сәттілік пайызы", f"{stats['success_rate']:.1f}%"],
                ["Орташа қадамдар саны", f"{stats['avg_steps']:.1f}"]
            ]
            
            stat_table = Table(stat_data, colWidths=[250, 150])
            stat_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'DejaVuSans-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ecf0f1')),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'DejaVuSans'),
                ('FONTSIZE', (0, 1), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            elements.append(stat_table)
            elements.append(Spacer(1, 20))
            
            # Столбчатая диаграмма статистики
            bar_data = [stats['total'], stats['correct'], stats['incorrect']]
            bar_chart = create_bar_chart(bar_data, "Шешімдер статистикасы")
            elements.append(bar_chart)
            elements.append(Spacer(1, 20))
            
            # Диаграмма ошибок
            if stats['error_types']:
                elements.append(Paragraph("Қателер түрлерінің үлестірімі", styles['ReportHeading']))
                error_data = [(k, v) for k, v in stats['error_types'].items()]
                pie_chart = create_pie_chart(error_data, "Қателер түрлері")
                elements.append(pie_chart)
                elements.append(Spacer(1, 20))
        
        # Детальная информация по решениям
        if solutions:
            elements.append(PageBreak())
            elements.append(Paragraph("Шешімдер туралы толық ақпарат", styles['ReportHeading']))
            
            for sol in solutions:
                # Заголовок решения
                solution_header = (
                    f"Шешім #{sol.id} | Студент: {sol.user.username} | "
                    f"Күні: {format_datetime(sol.created_at)}"
                )
                elements.append(Paragraph(solution_header, styles['ReportHeading']))
                
                # Информация о задаче
                task_info = f"Есеп: {sol.task.description}"
                elements.append(Paragraph(task_info, styles['TaskTitle']))
                
                # Таблица шагов решения
                if sol.steps:
                    step_data = [["№", "Өрнек", "Күйі", "Қате/Кеңес"]]
                    for step in sorted(sol.steps, key=lambda s: s.step_number):
                        status = "✓" if step.is_correct else "✗"
                        error_hint = f"{step.error_type}: {step.hint}" if not step.is_correct else ""
                        # Создаем параграф для выражения с возможностью переноса
                        expr_paragraph = Paragraph(step.input_expr, styles['TableCell'])
                        # Создаем параграф для ошибки/подсказки с возможностью переноса
                        hint_paragraph = Paragraph(wrap_text(error_hint), styles['TableCell'])
                        
                        step_data.append([
                            str(step.step_number),
                            expr_paragraph,
                            status,
                            hint_paragraph
                        ])
                    
                    # Увеличиваем ширину колонки с выражениями и подсказками
                    step_table = Table(step_data, colWidths=[30, 300, 50, 200])
                    step_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2ecc71')),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),  # Выравнивание по левому краю
                        ('FONTNAME', (0, 0), (-1, 0), 'DejaVuSans-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 12),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                        ('FONTNAME', (0, 1), (-1, -1), 'DejaVuSans'),
                        ('FONTSIZE', (0, 1), (-1, -1), 10),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black),
                        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                        ('LEFTPADDING', (0, 0), (-1, -1), 6),  # Отступ слева
                        ('RIGHTPADDING', (0, 0), (-1, -1), 6),  # Отступ справа
                        ('TOPPADDING', (0, 0), (-1, -1), 6),    # Отступ сверху
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 6), # Отступ снизу
                        # Чередующиеся цвета для строк
                        *[('BACKGROUND', (0, i), (-1, i), colors.HexColor('#f9f9f9')) 
                          for i in range(2, len(step_data), 2)]
                    ]))
                    elements.append(step_table)
                
                elements.append(Spacer(1, 20))
        else:
            elements.append(Paragraph("Көрсетілетін деректер жоқ", styles['ReportBody']))
        
        # Генерируем PDF
        doc.build(elements)
        buffer.seek(0)
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"analytics_report_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf",
            mimetype="application/pdf"
        )
        
    except Exception as e:
        logging.error("Ошибка генерации отчета: %s", e)
        return jsonify({"message": "Есепті құру мүмкін емес", "details": str(e)}), 500
