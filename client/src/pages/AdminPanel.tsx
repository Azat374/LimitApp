import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://server-1-cxbf.onrender.com";

const AdminPanel = () => {
  type Task = {
    id: number;
    title: string;
    // можешь добавить description, если используешь
  };
  
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks))
      .catch(() => toast.error("Ошибка загрузки задач"));
  }, []);

  const deleteTask = (taskId: any) => {
    fetch(`${BACKEND_URL}/api/tasks/${taskId}`, { method: "DELETE" })
      .then(() => {
        toast.success("Задача удалена");
        setTasks(tasks.filter((task) => task.id !== taskId));
      })
      .catch(() => toast.error("Ошибка удаления"));
  };

  return (
    <div className="min-h-screen p-4">
      <Card>
        <CardHeader>
          <CardTitle>Админ-панель</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className="flex justify-between items-center">
                {task.title}
                <Button onClick={() => deleteTask(task.id)} variant="destructive">
                  Удалить
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
