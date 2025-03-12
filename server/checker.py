import sympy as sp

x = sp.Symbol('x')

def check_step(prev_expr_str, curr_expr_str):
    """Проверяет корректность шага решения"""
    try:
        prev_expr = sp.sympify(prev_expr_str)
        curr_expr = sp.sympify(curr_expr_str)

        if sp.simplify(prev_expr - curr_expr) == 0:
            return {"is_correct": True, "error_type": None, "hint": ""}
        else:
            return {
                "is_correct": False,
                "error_type": "algebraic_error",
                "hint": "Ошибка в алгебраических преобразованиях. Проверьте сокращение или вынесение множителя."
            }
    except Exception as e:
        return {"is_correct": False, "error_type": "parse_error", "hint": f"Ошибка парсинга: {str(e)}"}
