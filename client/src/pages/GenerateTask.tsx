import Sidebar from "../components/Sidebar/Sidebar"
import MobileSidebar from "../components/MobileSidebar/MobileSidebar"
// src/pages/GenerateTask.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";

// Интерфейс для описания задачи (кандидата)
interface TaskCandidate {
  title: string;
  description: string;
  expression: string;
  limitVar: string;
  expected_value: string;
  category: string;
}

// Псевдо-шаблоны для разных категорий
const TEMPLATES: Record<string, TaskCandidate[]> = {
  limits: [
    {
      title: "8.1. lim ((2x+3)/(5x+7))^(x+1)",
      description: String.raw`\lim_{x\to\infty} \left( \frac{2x + 3}{5x + 7} \right)^{x+1}`,
      expression: String.raw`((2*x+3)/(5*x+7))**(x+1)`,
      limitVar: "x→oo",
      expected_value: "0",
      category: "limits",
    },
    {
      title: "8.2. lim ((2x+1)/(x-1))^(x)",
      description: String.raw`\lim_{x\to\infty} \left( \frac{2x + 1}{x - 1} \right)^{x}`,
      expression: String.raw`((2*x+1)/(x-1))**(x)`,
      limitVar: "x→oo",
      expected_value: "∞",
      category: "limits",
    },
    // Можно добавить еще около 20 шаблонов для этой категории…
  ],
  integral_volterra_2: [
    {
      title: "Задача 319",
      description: String.raw`\varphi \left(x\right)=x-\int _0^x\left(x-t\right)\varphi \left(t\right)dt,\varphi _0\left(x\right)=0`,
      expression: String.raw`x \int_0^x (x+t)\varphi(t) dt`,
      limitVar: "0",
      expected_value: String.raw`\sin x`,
      category: "integral_volterra_2",
    },
    {
      title: "Задача 320",
      description: String.raw`\varphi \left(x\right)=1-\int _0^x\left(x-t\right)\varphi \left(t\right)dt,\varphi _0=0`,
      expression: String.raw`1 - \int_0^x (x-t)\varphi(t) dt`,
      limitVar: "0",
      expected_value: String.raw`e^{-x}`,
      category: "integral_volterra_2",
    },
    // Шаблонов для этой категории должно быть много (около 20)
  ],
  integral: [
    // Здесь можно добавить шаблоны для интегральных задач
  ],
};

export default function GenerateTask() {
  const navigate = useNavigate();
  
  // Состояния для выбранной категории, количества задач, списка кандидатов и выбранного кандидата
  const [category, setCategory] = useState<string>("limits");
  const [taskCount, setTaskCount] = useState<number>(1);
  const [candidates, setCandidates] = useState<TaskCandidate[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Функция генерации – выбираем случайным образом количество вариантов
  const handleGenerate = () => {
    const templates = TEMPLATES[category];
    if (!templates || templates.length === 0) {
      toast.error("Нет шаблонов для выбранной категории");
      return;
    }
    const generated: TaskCandidate[] = [];
    for (let i = 0; i < taskCount; i++) {
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      generated.push(randomTemplate);
    }
    setCandidates(generated);
    toast.success("Задачи сгенерированы");
    setSelectedIndex(null);
  };

  // Функция подтверждения – выбираем один из сгенерированных вариантов и отправляем его на бэк (здесь псевдо)
  const handleConfirm = () => {
    if (selectedIndex === null || !candidates[selectedIndex]) {
      toast.error("Выберите задачу для добавления");
      return;
    }
    //const candidate = candidates[selectedIndex];
    // Здесь делается API-запрос для добавления задачи в базу, например, через axios.post
    // await axios.post(`${API_URL}/api/tasks/confirm`, candidate);
    toast.success("Задача успешно добавлена в базу данных");
    navigate("/tasks");
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
            <label className="block mb-2 font-semibold">
              Выберите категорию:
            </label>
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
            </select>
          </div>
          {/* Поле для указания количества генерируемых задач */}
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
            <Button onClick={handleGenerate}>Генерировать задачу</Button>
          </div>
          {/* Отображение сгенерированных вариантов */}
          {candidates.length > 0 && (
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <h3 className="font-bold mb-2">Сгенерированные задачи</h3>
              <ul>
                {candidates.map((candidate, index) => (
                  <li
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`p-4 border rounded-md mb-2 cursor-pointer ${
                      selectedIndex === index ? "bg-blue-100" : "bg-gray-50"
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
                    <p>
                      <strong>Лимитная переменная:</strong> {candidate.limitVar}
                    </p>
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
                <Button onClick={handleConfirm}>Добавить задачу</Button>
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
