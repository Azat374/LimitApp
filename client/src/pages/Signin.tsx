"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
//import { IconBrandGithub } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
//import { loginWithGithub } from "@/lib/githubOAuth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://server-1-cxbf.onrender.com";

export default function Signin() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        // Сохраняем имя пользователя, токен и роль в localStorage
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        toast.success("Кіру сәтті өтті", {
          description: `Қош келдіңіз, ${data.user.username}`,
        });
        navigate("/home");
      } else {
        const errorData = await response.json();
        toast.error("Кіру сәтсіз аяқталды", {
          description: errorData.message || "Қайталап көріңіз.",
        });
      }
    } catch (error) {
      toast.error("Кіру сәтсіз аяқталды", {
        description: `Қате пайда болды. Қайталап көріңіз. ${error}`,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 text-center mb-4">
          LimitApp-қа қош келдіңіз | Жүйеге кіру
        </h2>
        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="username">Пайдаланушы есімі</Label>
            <Input
              id="username"
              placeholder="Сіздің пайдаланушы есіміңіз"
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Құпия сөз</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </LabelInputContainer>
          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
          >
            Кіру &rarr;
            <BottomGradient />
          </button>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Аккаунтыңыз жоқ па?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Тіркелу
            </Link>
          </p>
          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
          {/*
          <div className="flex flex-col space-y-4">
            <button
              className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
              type="button"
              onClick={loginWithGithub}
            >
              <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                GitHub
              </span>
              <BottomGradient />
            </button>
          </div>*/}
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>;
};
