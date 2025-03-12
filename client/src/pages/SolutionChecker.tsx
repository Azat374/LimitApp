import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Тип задачи
interface Problem {
  id: string;
  title: string;
  description: string;
}

// Тип шага: "algebra" или "limit"
type StepType = "algebra" | "limit";

const SolutionChecker = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<string>("");
  const [stepType, setStepType] = useState<StepType>("algebra");
  const [stepInput, setStepInput] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/problems")
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks) {
          setProblems(data.tasks);
          if (data.tasks.length > 0) {
            setSelectedProblem(data.tasks[0].id);
          }
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки задач:", err);
        toast.error("Не удалось загрузить задачи");
      });
  }, []);

  // Добавить или редактировать алгебраический шаг
  const addOrEditStep = () => {
    if (!stepInput.trim()) {
      toast.error("Введите алгебраический шаг");
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

  // Добавить предел
  const addLimitStep = () => {
    if (steps.length === 0) {
      toast.error("Сначала добавьте хотя бы один алгебраический шаг");
      return;
    }
    if (steps.includes("LIMIT")) {
      toast.error("Уже добавлен шаг 'Предел'");
      return;
    }
    setSteps((prev) => [...prev, "LIMIT"]);
  };

  // Редактировать шаг
  const editStep = (index: number) => {
    setStepInput(steps[index]);
    setEditingIndex(index);
  };

  // Удалить шаг
  const deleteStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const checkSolution = async () => {
    if (!selectedProblem) {
      toast.error("Сначала выберите задачу");
      return;
    }
    if (steps.length === 0) {
      toast.error("Нет шагов решения");
      return;
    }
  
    const requestData = {
      taskId: selectedProblem,
      steps: steps.map((s) => s.toString()),
    };
  
    console.log("📡 Отправка данных на сервер:", requestData);
  
    try {
      const response = await fetch("http://localhost:5000/api/check_solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка сервера:", errorText);
        toast.error("Ошибка сервера: " + errorText);
        return;
      }
  
      const data = await response.json();
      console.log("📡 Ответ сервера:", data); // ✅ Логируем ответ
  
      if (data.success) {
        setCheckResult(data.message); // ✅ Теперь выводит сообщение сервера
        setErrors([]);
        toast.success(data.message);
      } else {
        setCheckResult(null);
        setErrors(data.errors || []);
        toast.error("Обнаружены ошибки в решении");
      }
    } catch (err) {
      console.error("Ошибка проверки:", err);
      toast.error("Не удалось проверить решение");
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white p-8 dark:bg-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
            <CardTitle className="text-3xl text-white font-bold">Проверка решения</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* 1) Выбор задачи */}
            <div>
              <label className="block mb-2 font-semibold text-gray-800 dark:text-gray-200">
                Выберите задачу
              </label>
              <Select value={selectedProblem} onValueChange={setSelectedProblem}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Нет задач" />
                </SelectTrigger>
                <SelectContent>
                  {problems.map((prob) => (
                    <SelectItem key={prob.id} value={prob.id}>
                      {prob.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2) Ввод шага */}
            <div>
              <label className="block mb-2 font-semibold text-gray-800 dark:text-gray-200">
                Алгебраический шаг
              </label>
              <Textarea
                value={stepInput}
                onChange={(e) => setStepInput(e.target.value)}
                placeholder="Введите выражение, например: (2*x - 3)/(5*x + 7)"
              />
              <div className="mt-2 flex space-x-2">
                <Button onClick={addOrEditStep} variant="default">
                  {editingIndex !== null ? "Сохранить" : "Добавить шаг"}
                </Button>
                <Button onClick={addLimitStep} variant="outline">
                  Добавить предел
                </Button>
              </div>
            </div>

            {/* 3) Список шагов */}
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
                      <Button size="sm" variant="outline" onClick={() => editStep(idx)}>
                        ✏️ Редактировать
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteStep(idx)}>
                        ❌ Удалить
                      </Button>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* 4) Проверка решения */}
            <Button onClick={checkSolution} variant="default">
              Проверить решение
            </Button>

            {/* 5) Вывод результатов */}
            {checkResult && (
              <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
                {checkResult} {/* ✅ Теперь тут показывается ответ сервера */}
              </div>
            )}

            {errors.length > 0 && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                <h4 className="font-bold mb-2">Ошибки:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((err, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">Шаг {err.step}:</span> {err.error}
                      {err.expected && <span className="ml-2"> (Ожидалось: {err.expected}, Получено: {err.received})</span>}
                      {err.hint && <span className="ml-2 text-sm italic text-gray-700"> 💡 {err.hint}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SolutionChecker;
