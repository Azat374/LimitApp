import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MathKeyboard } from "@/components/MathKeyboard/MathKeyboard";
import MobileSidebar from "../components/MobileSidebar/MobileSidebar";
import Sidebar from "../components/Sidebar/Sidebar";

// Встроенные функции для API-вызовов
const API_URL = import.meta.env.VITE_BACKEND_URL || "https://server-1-cxbf.onrender.com";

async function getTask(taskId: number) {
  const res = await fetch(`${API_URL}/api/tasks/${taskId}`);
  if (!res.ok) {
    throw new Error(`Ошибка: ${res.status}`);
  }
  return res.json();
}

async function startSolution(taskId: number) {
  const res = await fetch(`${API_URL}/api/tasks/${taskId}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error("Ошибка создания решения");
  }
  return res.json();
}

async function checkStep(solutionId: number, stepNumber: number, prevExpr: string, currExpr: string) {
  const res = await fetch(`${API_URL}/api/solutions/${solutionId}/check_step`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      step_number: stepNumber,
      prev_expr: prevExpr,
      curr_expr: currExpr,
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
  return res.json();
}

async function finishSolution(solutionId: number) {
  const res = await fetch(`${API_URL}/api/solutions/${solutionId}/finish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
  return res.json();
}

// Тип задачи
interface Problem {
  id: string;
  title: string;
  description: string;
  limitVar?: string; // Переменная, к которой стремится предел
  // Убираем отображение ожидаемого предела, студент сам решает задачу
}

// Тип ответа задачи с сервера
interface SingleTaskResponse {
  id: string;
  title: string;
  description: string;
  expression: string;
  limitVar: string;
  expected_limit: string;
}

export default function SolutionChecker() {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Problem | null>(null);
  const [solutionId, setSolutionId] = useState<number | null>(null);
  const [stepInput, setStepInput] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [attempted, setAttempted] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();

  // Запуск таймера при монтировании компонента
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Форматирование времени в MM:SS
  const formatTime = (seconds: number): string => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
    const ss = (seconds % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Загрузка задачи и создание решения (одна попытка)
  useEffect(() => {
    if (taskId) {
      getTask(Number(taskId))
        .then((data: SingleTaskResponse) => {
          setTask({
            id: data.id,
            title: data.title,
            description: data.description,
            limitVar: data.limitVar,
          });
          return startSolution(Number(taskId));
        })
        .then((data) => {
          setSolutionId(data.solution_id);
        })
        .catch((err) => {
          console.error("Ошибка загрузки задачи:", err);
          toast.error("Не удалось загрузить задачу");
        });
    }
  }, [taskId]);

  const addOrEditStep = () => {
    if (attempted) {
      toast.error("У вас только 1 шанс!");
      return;
    }
    if (!stepInput.trim()) {
      toast.error("Введите шаг решения");
      return;
    }
    if (editingIndex !== null) {
      setSteps((prev) => prev.map((s, i) => (i === editingIndex ? stepInput : s)));
      setEditingIndex(null);
    } else {
      setSteps((prev) => [...prev, stepInput]);
    }
    setStepInput("");
  };

  const addLimitStep = () => {
    if (attempted) {
      toast.error("У вас только 1 шанс!");
      return;
    }
    if (steps.length === 0) {
      toast.error("Сначала добавьте хотя бы один алгебраический шаг");
      return;
    }
    if (steps.includes("LIMIT")) {
      toast.error("Шаг 'LIMIT' уже добавлен");
      return;
    }
    setSteps((prev) => [...prev, "LIMIT"]);
  };

  const editStep = (index: number) => {
    if (attempted) {
      toast.error("У вас только 1 шанс!");
      return;
    }
    setStepInput(steps[index]);
    setEditingIndex(index);
  };

  const deleteStep = (index: number) => {
    if (attempted) {
      toast.error("У вас только 1 шанс!");
      return;
    }
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSymbolClick = (symbol: string) => {
    if (attempted) {
      toast.error("У вас только 1 шанс!");
      return;
    }
    // Преобразование символов: например, "×" заменяем на "*", "÷" на "/"
    const symbolMap: Record<string, string> = {
      "×": "*",
      "÷": "/",
    };
    setStepInput((prev) => prev + (symbolMap[symbol] || symbol));
  };

  // Отправка решения для проверки (один шанс)
  const checkSolution = async () => {
    if (attempted) {
      toast.error("У вас только 1 шанс!");
      return;
    }
    if (!task) {
      toast.error("Задача не загружена");
      return;
    }
    if (steps.length === 0) {
      toast.error("Нет шагов решения");
      return;
    }
    // Останавливаем таймер
    if (timerRef.current) clearInterval(timerRef.current);
    setAttempted(true);

    const requestData = {
      taskId: task.id,
      steps: steps,
    };

    try {
      const response = await fetch("https://server-1-cxbf.onrender.com/api/solutions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        toast.error("Ошибка сервера: " + errorText);
        return;
      }
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setCheckResult(data.message);
        setErrors([]);
      } else {
        setErrors(data.errors || []);
        toast.error("Обнаружены ошибки в решении");
      }
    } catch (err) {
      console.error("Ошибка проверки:", err);
      toast.error("Не удалось проверить решение");
    }
  };

  // Завершение решения (проверка предельного перехода)
  const finishCurrentSolution = async () => {
    if (attempted) {
      toast.error("У вас только 1 шанс!");
      return;
    }
    if (!solutionId) {
      toast.error("Решение не создано");
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setAttempted(true);
    try {
      const res = await finishSolution(solutionId);
      // Красивое оформление лимита: если результат содержит "infinity", заменяем на символ "∞"
      let message: string = res.message;
      if (message.toLowerCase().includes("infinity") || message.toLowerCase().includes("infty")) {
        message = message.replace(/infinity/gi, "∞");
      }
      toast.success(message);
      setCheckResult(message);
    } catch (error) {
      toast.error("Ошибка завершения решения");
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <MobileSidebar />
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white p-8 dark:bg-gray-900 dark:to-gray-800">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
                  <CardTitle className="text-3xl text-white font-bold">
                    {task ? task.title : "Загрузка задачи..."}
                  </CardTitle>
                  {task && task.limitVar && (
                    <p className="mt-2 text-white text-lg">
                      {`Куда устремлен: ${task.limitVar}`}
                    </p>
                  )}
                </CardHeader>

                <div className="mt-2 text-white">
                  Таймер: <span>{formatTime(timeElapsed)}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {task && (
                  <>
                    <p className="text-gray-800 dark:text-gray-200">{task.description}</p>
                    <div>
                      <label className="block mb-2 font-semibold text-gray-800 dark:text-gray-200">
                        Алгебраический шаг
                      </label>
                      <Textarea
                        value={stepInput}
                        onChange={(e) => setStepInput(e.target.value)}
                        placeholder="Введите выражение, например: (2*x-3)/(5*x+7)"
                      />
                      <div className="mt-2">
                        <MathKeyboard onSymbolClick={handleSymbolClick} />
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <Button onClick={addOrEditStep} variant="default" disabled={attempted}>
                          {editingIndex !== null ? "Сохранить" : "Добавить шаг"}
                        </Button>
                        <Button onClick={addLimitStep} variant="outline" disabled={attempted}>
                          Добавить LIMIT
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-lg text-gray-800 dark:text-gray-200">
                        Ваши шаги:
                      </h3>
                      {steps.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">Шаги не добавлены</p>
                      ) : (
                        <ol className="list-decimal pl-5 space-y-2">
                          {steps.map((step, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <span className="flex-grow">
                                {step === "LIMIT" ? (
                                  <span className="text-blue-600 font-bold">[Предел]</span>
                                ) : (
                                  step
                                )}
                              </span>
                              <Button size="sm" variant="outline" onClick={() => editStep(idx)} disabled={attempted}>
                                ✏️ Редактировать
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteStep(idx)} disabled={attempted}>
                                ❌ Удалить
                              </Button>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <Button onClick={checkSolution} variant="default" disabled={attempted}>
                        Проверить решение
                      </Button>
                      <Button onClick={finishCurrentSolution} variant="outline" disabled={attempted}>
                        Завершить решение
                      </Button>
                    </div>
                    {checkResult && (
                      <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
                        {checkResult}
                      </div>
                    )}
                    {errors.length > 0 && (
                      <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                        <h4 className="font-bold mb-2">Ошибки:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {errors.map((err, idx) => (
                            <li key={idx}>
                              <span className="font-semibold">Шаг {err.step}:</span> {err.error}
                              {err.hint && (
                                <span className="ml-2 text-sm italic text-gray-700">💡 {err.hint}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div id="test-plot" className="hidden"></div>
    </div>
  );
}
