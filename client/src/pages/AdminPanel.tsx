import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const AdminPanel = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("https://server-1-cxbf.onrender.com/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks))
      .catch(() => toast.error("Ошибка загрузки задач"));
  }, []);

  const deleteTask = (taskId: any) => {
    fetch(`https://server-1-cxbf.onrender.com/api/tasks/${taskId}`, { method: "DELETE" })
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
