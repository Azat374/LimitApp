// src/pages/GenerateTask.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";
import Sidebar from "../components/Sidebar/Sidebar";
import MobileSidebar from "../components/MobileSidebar/MobileSidebar";

// Интерфейс сгенерированной задачи, получаемой от сервера
interface TaskCandidate {
  title: string;
  description: string;
  expression: string;
  limitVar: string;
  expected_value: string;
  category: string;
}

export default function GenerateTask() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>("limits");
  const [taskCount, setTaskCount] = useState<number>(1);
  const [candidates, setCandidates] = useState<TaskCandidate[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const API_URL = "http://127.0.0.1:5000";

  const handleGenerate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tasks_generator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category, count: taskCount }),
      });
      if (!response.ok) {
        const err = await response.json();
        toast.error(err.error || "Ошибка генерации задач");
        return;
      }
      const data = await response.json();
      setCandidates(data.generated_tasks);
      toast.success("Задачи сгенерированы");
      setSelectedIndices([]);
    } catch (error) {
      console.error(error);
      toast.error("Не удалось сгенерировать задачи");
    }
  };

  // Функция для переключения выделения задачи по её индексу
  const toggleCandidateSelection = (index: number) => {
    setSelectedIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Отправка выбранных задач на сервер
  const handleConfirmSelected = async () => {
    if (selectedIndices.length === 0) {
      toast.error("Выберите хотя бы одну задачу для добавления");
      return;
    }
    try {
      const selectedTasks = selectedIndices.map(idx => candidates[idx]);
      const responses = await Promise.all(
        selectedTasks.map(task =>
          fetch(`${API_URL}/api/tasks_generator/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
          })
        )
      );
      const allOk = responses.every(response => response.ok);
      if (!allOk) {
        toast.error("Ошибка при добавлении некоторых задач");
      } else {
        toast.success("Выбранные задачи успешно добавлены в базу данных");
      }
      navigate("/tasks");
    } catch (error) {
      console.error(error);
      toast.error("Ошибка при добавлении задач");
    }
  };

  // Отправка всех сгенерированных задач на сервер
  const handleConfirmAll = async () => {
    if (candidates.length === 0) {
      toast.error("Нет задач для добавления");
      return;
    }
    try {
      const responses = await Promise.all(
        candidates.map(task =>
          fetch(`${API_URL}/api/tasks_generator/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
          })
        )
      );
      const allOk = responses.every(response => response.ok);
      if (!allOk) {
        toast.error("Ошибка при добавлении некоторых задач");
      } else {
        toast.success("Все задачи успешно добавлены в базу данных");
      }
      navigate("/tasks");
    } catch (error) {
      console.error(error);
      toast.error("Ошибка при добавлении задач");
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <MobileSidebar />
        <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
          <div className="p-4">
            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle>Генерация задачи по шаблону</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Выбор категории */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold">Выберите категорию:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="limits">Лимит</option>
                    <option value="integral_volterra_2">
                      Интегральное уравнение Вольтерры 2-го рода
                    </option>
                    <option value="integral">Интеграл</option>
                    <option value="algebra">Алгебраическая задача</option>
                  </select>
                </div>
                {/* Ввод количества генерируемых задач */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold">
                    Количество задач для генерации:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={taskCount}
                    onChange={(e) => setTaskCount(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="flex gap-4 mb-4">
                  <Button onClick={handleGenerate}>Генерировать задачи</Button>
                </div>
                {/* Отображение сгенерированных вариантов */}
                {candidates.length > 0 && (
                  <div className="mt-6 p-4 border rounded-md bg-gray-50">
                    <h3 className="font-bold mb-2">Сгенерированные задачи</h3>
                    <ul>
                      {candidates.map((candidate, index) => (
                        <li
                          key={index}
                          onClick={() => toggleCandidateSelection(index)}
                          className={`p-4 border rounded-md mb-2 cursor-pointer ${
                            selectedIndices.includes(index) ? "bg-blue-100" : "bg-gray-50"
                          }`}
                        >
                          <p>
                            <strong>Название:</strong> {candidate.title}
                          </p>
                          <p>
                            <strong>Описание:</strong>{" "}
                            <TeX math={candidate.description} />
                          </p>
                          <p>
                            <strong>Выражение:</strong> {candidate.expression}
                          </p>
                          {candidate.category === "limits" && (
                            <p>
                              <strong>Лимитная переменная:</strong> {candidate.limitVar}
                            </p>
                          )}
                          <p>
                            <strong>Ожидаемое значение:</strong> {candidate.expected_value}
                          </p>
                          <p>
                            <strong>Категория:</strong> {candidate.category}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex gap-4">
                      <Button onClick={handleConfirmSelected}>Добавить выбранные</Button>
                      <Button variant="outline" onClick={handleConfirmAll}>
                        Добавить все
                      </Button>
                      <Button variant="outline" onClick={() => setCandidates([])}>
                        Сбросить
                      </Button>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={() => navigate("/tasks")}>
                Вернуться к списку задач
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div id="test-plot" className="hidden"></div>
    </div>
  );
}
