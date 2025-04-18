import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import MobileSidebar from "../components/MobileSidebar/MobileSidebar"
import Sidebar from "../components/Sidebar/Sidebar"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://server-1-cxbf.onrender.com";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

const Reports = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Загрузка задач
    fetch(`${BACKEND_URL}/api/tasks`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks);
      })
      .catch((err) => {
        console.error("Ошибка загрузки задач", err);
        toast.error("Не удалось загрузить задачи");
      });

    // Загрузка пользователей (если реализован эндпоинт /api/users)
    fetch(`${BACKEND_URL}/api/users`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        console.error("Ошибка загрузки пользователей", err);
      });
  }, []);

  const downloadReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Выберите период");
      return;
    }
    const payload = {
      period: `${startDate}:${endDate}`,
      task_id: selectedTask || null,
      student_id: selectedUser || null,
    };

    try {
      const response = await axios.post(`${BACKEND_URL}/api/reports/pdf`, payload, {
        responseType: "blob",
      });
      // Создаем Blob и генерируем URL для него
      const blob = new Blob([response.data as BlobPart], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "report.pdf";
      document.body.appendChild(link);
      link.click();
      // Убираем созданный элемент и отзываем URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Ошибка генерации отчёта", err);
      toast.error("Не удалось сгенерировать отчёт");
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <Sidebar />
            <div className="flex flex-col">
                <MobileSidebar />
    <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="bg-purple-600 text-white p-4 rounded-t-lg">
          <CardTitle>Генерация PDF-отчёта</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Начало периода</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label>Конец периода</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label>Задача</label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Все задачи" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map(task => (
                  <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label>Студент</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Все студенты" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.firstname + ' ' + user.lastname}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button onClick={downloadReport}>Скачать PDF-отчёт</Button>
          </div>
        </CardContent>
      </Card>
    </div>
    <div id="test-plot" className="hidden"></div>
    </div>
    </div>
  );
};

export default Reports;
