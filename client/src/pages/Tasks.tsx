import { useState, useEffect } from "react";
//import axios from "axios";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import MobileSidebar from "../components/MobileSidebar/MobileSidebar"
import Sidebar from "../components/Sidebar/Sidebar"
import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://server-1-cxbf.onrender.com";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
}

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/tasks`)
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks) {
            setTasks(data.tasks.map((task: any) => ({
              id: task.id,
              title: task.title,
              description: task.description,
              category: task.category,
            })));
          
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки задач:", err);
        toast.error("Не удалось загрузить задачи");
      });
  }, []);

  const categories = {"all":"Все", "limits":"Пределы", "algebra":"Алгебра", "integral":"Интеграл"};

  const filteredTasks = selectedCategory === "all" 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
        <div className="flex flex-col">
            <MobileSidebar />
            <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
              <div className="max-w-4xl mx-auto">
                <div className="mb-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categories).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                  variant="destructive"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate("/generate_task")}
                  >
                      Сгенерировать задачу
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {filteredTasks.map(task => (
                    <Card key={task.id}>
                      <CardHeader>
                        <CardTitle>{task.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p><TeX math={task.description} /></p>
                        <Link 
                          to={task.category === "integral_volterra_2" 
                            ? `/solution_integral/${task.id}` 
                            : `/solution/${task.id}`
                          } 
                          className="text-blue-600"
                        >
                          Решить задачу
                        </Link>
                      </CardContent>
                      
                    </Card>
                  ))}
                </div>
              </div>
            </div>
        </div>
        <div id="test-plot" className="hidden"></div>
    </div>
  );
};

export default Tasks;
