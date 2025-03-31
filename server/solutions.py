import logging
import sympy as sp
from flask import Blueprint, request, jsonify
from models import db, Task, Solution, Step
from checker import safe_sympify, check_algebraic_step

solutions_bp = Blueprint('solutions', __name__, url_prefix='/api/solutions')

@solutions_bp.route('/check', methods=['POST'])
def check_solution():
    """
    Проверяет полное решение студента и сохраняет его в БД.
    Ожидается JSON вида:
    {
        "taskId": <идентификатор задачи>,
        "steps": [
            "шаг 1", "шаг 2", ..., "LIMIT", "окончательный ответ"
        ]
    }
    Если ошибок нет – возвращает success: true, иначе success: false с описанием ошибок.
    """
    data = request.json
    logging.info("Получен запрос на проверку решения: %s", data)

    if not data or "taskId" not in data or "steps" not in data:
        return jsonify({"error": "Неверный формат запроса"}), 400

    task_id = data["taskId"]
    steps = data["steps"]

    if not isinstance(steps, list) or any(not isinstance(s, str) for s in steps):
        return jsonify({"error": "steps должен быть массивом строк"}), 400

    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Задача не найдена"}), 404

    x = sp.Symbol('x')
    errors = []
    algebraic_steps = []
    found_limit = False

    # Собираем алгебраические шаги до маркера LIMIT
    for step in steps:
        if step == "LIMIT":
            found_limit = True
            break
        algebraic_steps.append(step)

    if not algebraic_steps:
        return jsonify({
            "success": False,
            "errors": [{"step": 1, "error": "Нет алгебраических шагов", "hint": "Добавьте хотя бы один шаг"}]
        }), 200

    # Проверка последовательных алгебраических шагов
    for i in range(len(algebraic_steps) - 1):
        prev_expr = algebraic_steps[i]
        curr_expr = algebraic_steps[i + 1]
        try:
            result = check_algebraic_step(prev_expr, curr_expr)
            if not result["is_correct"]:
                errors.append({
                    "step": i + 1,
                    "error": "Некорректное преобразование",
                    "hint": result["hint"] or "Проверьте запись выражения"
                })
        except Exception as e:
            errors.append({
                "step": i + 1,
                "error": "Ошибка в выражении",
                "hint": f"Проверьте правильность записи: {str(e)}"
            })

    computed_limit = None
    # Если маркер LIMIT найден, проверяем предельный переход
    if found_limit:
        try:
            last_expr = sp.simplify(safe_sympify(algebraic_steps[-1]))
            computed_limit = sp.limit(last_expr, x, sp.oo)
            # Здесь не выводим ожидаемый предел, студент должен дать ответ самостоятельно.
            # Если последний шаг не равен "LIMIT", сравниваем его с вычисленным пределом.
            if steps[-1] != "LIMIT" and not errors:
                student_result = sp.simplify(safe_sympify(steps[-1]))
                if not sp.simplify(student_result - computed_limit).is_zero:
                    errors.append({
                        "step": len(steps),
                        "error": "Некорректный окончательный ответ",
                        "hint": f"Проверьте ваш ответ, вычисленный предел системы: {computed_limit}"
                    })
        except Exception as e:
            logging.error(f"Ошибка вычисления предела: {str(e)}")
            errors.append({
                "step": len(steps),
                "error": "Ошибка предельного перехода",
                "hint": f"Проверьте выражение перед LIMIT: {str(e)}"
            })

    # Создаем запись решения (user_id замените на актуальный, например, из сессии)
    solution = Solution(task_id=task.id, user_id=1, status="in_progress")
    db.session.add(solution)
    db.session.commit()

    # Сохраняем каждый шаг решения в таблице Step
    for i, step in enumerate(steps, start=1):
        is_correct = False if errors else True
        new_step = Step(
            solution_id=solution.id,
            step_number=i,
            input_expr=step,
            is_correct=is_correct,
            error_type=None if is_correct else "ошибка",
            hint=""
        )
        db.session.add(new_step)
    db.session.commit()

    if errors:
        solution.status = "error"
        db.session.commit()
        return jsonify({"success": False, "errors": errors, "solution_id": solution.id}), 200

    solution.status = "completed"
    db.session.commit()

    # Форматируем результат предела для красивого отображения: заменяем "infinity" на "∞", если применимо
    let_message = f"Решение верное. Предел = {computed_limit}" if computed_limit is not None else "Решение верное"
    if computed_limit is not None:
        str_limit = str(computed_limit).lower()
        if "infinity" in str_limit or "infty" in str_limit:
            let_message = let_message.replace(str(computed_limit), "∞")
    return jsonify({
        "success": True,
        "message": let_message,
        "solution_id": solution.id
    }), 200
