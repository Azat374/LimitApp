import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [role, setRole] = useState("");

  useEffect(() => {
    // Получаем роль пользователя из localStorage
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  return (
    <nav className={cn("navbar bg-white dark:bg-black p-4 flex justify-between items-center")}>
      <div>
        <Link to="/" className="text-xl font-bold">LimitApp</Link>
      </div>
      <div className="flex space-x-4">
        <Link to="/home" className="hover:underline">Главная</Link>
        <Link to="/tasks" className="hover:underline">Задачи</Link>
        {role === "admin" && (
          <Link to="/admin" className="hover:underline">Админ-панель</Link>
        )}
        <Link to="/profile" className="hover:underline">Личный кабинет</Link>
        <Link to="/reports" className="hover:underline">Отчёты</Link>
      </div>
    </nav>
  );
}
