import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const AdminPanel = () => {
  type Task = {
    id: number;
    title: string;
    // можешь добавить description, если используешь
  };
  
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks))
      .catch(() => toast.error("Ошибка загрузки задач"));
  }, []);

  const deleteTask = (taskId: any) => {
    fetch(`http://127.0.0.1:5000/api/tasks/${taskId}`, { method: "DELETE" })
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
