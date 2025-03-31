import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import MobileSidebar from "../components/MobileSidebar/MobileSidebar"
import Sidebar from "../components/Sidebar/Sidebar"
interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Все");

  useEffect(() => {
    fetch("https://server-1-cxbf.onrender.com/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks) {
            setTasks(data.tasks);
          
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки задач:", err);
        toast.error("Не удалось загрузить задачи");
      });
  }, []);

  const categories = ["Все", "Пределы", "Алгебра", "Дифференциалдық теңдеулер"];

  const filteredTasks = selectedCategory === "Все" 
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
                      {categories.map((cat, idx) => (
                        <SelectItem key={idx} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {filteredTasks.map(task => (
                    <Card key={task.id}>
                      <CardHeader>
                        <CardTitle>{task.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{task.description}</p>
                        <Link to={`/solution/${task.id}`} className="text-blue-600">Решить задачу</Link>
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
