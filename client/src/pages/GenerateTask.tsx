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

  const API_URL = "https://server-1-cxbf.onrender.com";

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
        toast.error(err.error || "Тапсырмаларды генерациялау қатесі");
        return;
      }
      const data = await response.json();
      setCandidates(data.generated_tasks);
      toast.success("Тапсырмалар сәтті генерациядан өтті");
      setSelectedIndices([]);
    } catch (error) {
      console.error(error);
      toast.error("Тапсырмаларды генерациялау мүмкін болмады");
    }
  };

  const toggleCandidateSelection = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleConfirmSelected = async () => {
    if (selectedIndices.length === 0) {
      toast.error("Қосылатын тапсырмаларды таңдаңыз");
      return;
    }
    try {
      const selectedTasks = selectedIndices.map((idx) => candidates[idx]);
      const responses = await Promise.all(
        selectedTasks.map((task) =>
          fetch(`${API_URL}/api/tasks_generator/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
          })
        )
      );
      const allOk = responses.every((response) => response.ok);
      if (!allOk) {
        toast.error("Кейбір тапсырмаларды қосу кезінде қате шықты");
      } else {
        toast.success("Таңдалған тапсырмалар дерекқорға сәтті қосылды");
      }
      navigate("/tasks");
    } catch (error) {
      console.error(error);
      toast.error("Тапсырмаларды қосу кезінде қате шықты");
    }
  };

  const handleConfirmAll = async () => {
    if (candidates.length === 0) {
      toast.error("Қосылатын тапсырмалар жоқ");
      return;
    }
    try {
      const responses = await Promise.all(
        candidates.map((task) =>
          fetch(`${API_URL}/api/tasks_generator/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
          })
        )
      );
      const allOk = responses.every((response) => response.ok);
      if (!allOk) {
        toast.error("Кейбір тапсырмаларды қосу кезінде қате шықты");
      } else {
        toast.success("Барлық тапсырма дерекқорға сәтті қосылды");
      }
      navigate("/tasks");
    } catch (error) {
      console.error(error);
      toast.error("Тапсырмаларды қосу кезінде қате шықты");
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
                <CardTitle>Тапсырманы үлгі арқылы құру</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Выбор категории */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold">
                    Санатты таңдаңыз:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="limits">Шек</option>
                    <option value="integral_volterra_2">
                      Вольтерра 2-ші ретті интегралдық теңдеуі
                    </option>
                    <option value="integral">Интеграл</option>
                    <option value="algebra">Алгебра</option>
                  </select>
                </div>
                {/* Ввод количества задач */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold">
                    Генерация жасау үшін тапсырмалар саны:
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
                  <Button onClick={handleGenerate}>Тапсырмаларды генерациялау</Button>
                </div>

                {/* Сгенерированные задачи */}
                {candidates.length > 0 && (
                  <div className="mt-6 p-4 border rounded-md bg-gray-50">
                    <h3 className="font-bold mb-2">Генерацияланған тапсырмалар</h3>
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
                            <strong>Тақырыбы:</strong> {candidate.title}
                          </p>
                          <p>
                            <strong>Сипаттамасы:</strong>{" "}
                            <TeX math={candidate.description} />
                          </p>
                          <p>
                            <strong>Өрнек:</strong> {candidate.expression}
                          </p>
                          {candidate.category === "limits" && (
                            <p>
                              <strong>Шектік айнымалы:</strong>{" "}
                              {candidate.limitVar}
                            </p>
                          )}
                          <p>
                            <strong>Күтілетін мәні:</strong>{" "}
                            {candidate.expected_value}
                          </p>
                          <p>
                            <strong>Санаты:</strong> {candidate.category}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex gap-4">
                      <Button onClick={handleConfirmSelected}>
                        Таңдалғандарын қосу
                      </Button>
                      <Button variant="outline" onClick={handleConfirmAll}>
                        Барлығын қосу
                      </Button>
                      <Button variant="outline" onClick={() => setCandidates([])}>
                        Тазалау
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={() => navigate("/tasks")}>
                Тапсырмалар тізіміне оралу
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div id="test-plot" className="hidden"></div>
    </div>
  );
}
