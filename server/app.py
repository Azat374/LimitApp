from flask import Flask, jsonify, request
from flask_cors import CORS
import sympy as sp
import logging

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

# Пример задач
tasks = [
    {
        "id": "8.1",
        "title": "8.1. lim ((2x + 3)/(5x+7))^(x+1)",
        "expression": "((2*x + 3)/(5*x+7))^(x+1)",
        "limitVar": "x->∞",
        "expected_limit": "0"
    },
    {
        "id": "8.2",
        "title": "8.2. lim ((2x + 1)/(x-1))^3x",
        "expression": "((2*x + 1)/(2*x-1))^(3*x)",
        "limitVar": "x->∞",
        "expected_limit": "0"
    },
    {
        "id": "8.3",
        "title": "8.3. lim (2x + 1)/(x-1)",
        "expression": "(2*x + 1)/(x - 1)",
        "limitVar": "x->∞",
        "expected_limit": "2"
    }
]

# Функция безопасного преобразования выражений
def safe_sympify(expr):
    """Безопасное преобразование выражения в sympy-формат."""
    try:
        expr = expr.replace(r"e^{", "exp(").replace(r"\ln", "log")
        return sp.sympify(expr)
    except Exception as e:
        raise ValueError(f"Ошибка преобразования выражения '{expr}': {e}")

@app.route("/api/problems", methods=["GET"])
def get_tasks():
    """Возвращает список задач."""
    return jsonify({"tasks": tasks}), 200

@app.route("/api/check_solution", methods=["POST"])
def check_solution():
    """ Проверяет переданное решение с пошаговыми подсказками. """
    data = request.json
    logging.info("📡 Получен запрос: %s", data)

    if not data or "taskId" not in data or "steps" not in data:
        return jsonify({"error": "Неверный формат запроса"}), 400

    task_id = data["taskId"]
    steps = data["steps"]

    if not isinstance(steps, list) or any(not isinstance(s, str) for s in steps):
        return jsonify({"error": "steps должен быть массивом строк"}), 400

    task = next((t for t in tasks if t["id"] == task_id), None)
    if not task:
        return jsonify({"error": "Задача не найдена"}), 404

    x = sp.Symbol('x')
    errors = []

    algebraic_steps = []
    found_limit = False

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

    # 🔹 Проверяем эквивалентность шагов (учитываем эквивалентные формы)
    for i in range(len(algebraic_steps) - 1):
        prev_expr = algebraic_steps[i]
        curr_expr = algebraic_steps[i + 1]

        try:
            prev_sym = sp.simplify(safe_sympify(prev_expr))
            curr_sym = sp.simplify(safe_sympify(curr_expr))

            if not prev_sym.equals(curr_sym):
                errors.append({
                    "step": i + 1,
                    "error": "Некорректное преобразование",
                    "expected": str(prev_sym),
                    "received": str(curr_sym),
                    "hint": f"Допустимые эквивалентные формы: {prev_sym}"
                })
        except Exception as e:
            errors.append({
                "step": i + 1,
                "error": "Ошибка в выражении",
                "details": str(e),
                "hint": "Проверьте правильность записи"
            })

    # 🔹 Проверяем предел
    if found_limit:
        try:
            last_expr = safe_sympify(algebraic_steps[-1])
            computed_limit = sp.limit(last_expr, x, sp.oo)
            expected_limit = safe_sympify(task["expected_limit"])

            logging.info(f"✅ Вычисленный предел: {computed_limit}")

            if not sp.simplify(computed_limit - expected_limit).is_zero:
                errors.append({
                    "step": len(steps),
                    "error": "Неверный предел",
                    "expected": str(expected_limit),
                    "received": str(computed_limit),
                    "hint": f"Ожидаемый результат: {expected_limit}"
                })

            # 🔹 Проверяем, что последний шаг студента совпадает с вычисленным пределом
            if steps[-1] != "LIMIT" and errors == []:
                student_result = safe_sympify(steps[-1])
                if not sp.simplify(student_result - computed_limit).is_zero:
                    errors.append({
                        "step": len(steps),
                        "error": "Некорректный окончательный ответ",
                        "expected": str(computed_limit),
                        "received": str(student_result),
                        "hint": f"После 'LIMIT' результат должен быть: {computed_limit}"
                    })

        except Exception as e:
            logging.error(f"❌ Ошибка вычисления предела: {str(e)}")
            errors.append({
                "step": len(steps),
                "error": "Ошибка предельного перехода",
                "details": str(e),
                "hint": "Проверьте выражение перед LIMIT"
            })

    if errors:
        logging.info("❌ Ошибки в решении: %s", errors)
        return jsonify({"success": False, "errors": errors}), 200

    return jsonify({
        "success": True,
        "message": f"✅ Решение верное, предел = {computed_limit}"
    }), 200

if __name__ == "__main__":
    app.run(debug=True)
