import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import MobileSidebar from "../components/MobileSidebar/MobileSidebar";
import Sidebar from "../components/Sidebar/Sidebar";

// Temporary mock data - replace with real data from your API
const mockData = {
  solvedProblems: 45,
  totalAttempts: 67,
  successRate: 67,
  recentActivity: [
    { date: "01/03", problems: 4 },
    { date: "02/03", problems: 6 },
    { date: "03/03", problems: 2 },
    { date: "04/03", problems: 8 },
    { date: "05/03", problems: 5 },
  ],
  recommendedTopics: [
    { topic: "Дифференциалдық теңдеулер", progress: 75 },
    { topic: "Интегралдар", progress: 60 },
    { topic: "Шектер", progress: 40 },
  ],
};

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    if (!storedUsername || !token || storedUsername.trim() === "" || token.trim() === "") {
      toast.error("Please login to continue");
      navigate("/signin");
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

  return (

    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <MobileSidebar />
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Сәлем, {username}! 👋
      </h1>
      
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Шешілген есептер</CardTitle>
            <CardDescription>Жалпы прогресс</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockData.solvedProblems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Жалпы әрекеттер</CardTitle>
            <CardDescription>Барлық тапсырмалар</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockData.totalAttempts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Сәттілік деңгейі</CardTitle>
            <CardDescription>Дұрыс шешімдер пайызы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockData.successRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Белсенділік графигі</CardTitle>
            <CardDescription>Соңғы 5 күндегі шешілген есептер</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="problems" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ұсынылатын тақырыптар</CardTitle>
            <CardDescription>Жаттығу үшін келесі тақырыптар</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recommendedTopics.map((topic, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span>{topic.topic}</span>
                    <span>{topic.progress}%</span>
                  </div>
                  <Progress value={topic.progress} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
     </div>
    </div>
  );
};

export default Home;
