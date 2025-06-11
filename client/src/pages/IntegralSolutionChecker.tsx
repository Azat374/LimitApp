import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";
import { addStyles, EditableMathField } from "react-mathquill";
import MobileSidebar from "../components/MobileSidebar/MobileSidebar";
import Sidebar from "../components/Sidebar/Sidebar";
import { AlertCircle, Clock, CheckCircle, Plus, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
//import { set } from "react-hook-form";

addStyles();
// API configuration
const API_URL = import.meta.env.VITE_BACKEND_URL || "https://server-1-cxbf.onrender.com";

// API service functions
const api = {
  async getTask(taskId: number) {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`);
      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      return await res.json();
    } catch (error) {
      console.error("Failed to fetch task:", error);
      throw error;
    }
  },

  async startSolution(taskId: number) {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      return await res.json();
    } catch (error) {
      console.error("Failed to start solution:", error);
      throw error;
    }
  },


  async checkIntegralSolution(taskId: string, phiSteps: PhiStep[], finalSolution: string) {
    const user = localStorage.getItem("username");
    try {
      const res = await fetch(`${API_URL}/api/solutions/check-integral`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ taskId, phiSteps, finalSolution, user }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      return await res.json();
    } catch (error) {
      console.error("Failed to check solution:", error);
      throw error;
    }
  },

  async finishSolution(solutionId: number) {
    try {
      const res = await fetch(`${API_URL}/api/solutions/${solutionId}/finish`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      return await res.json();
    } catch (error) {
      console.error("Failed to finish solution:", error);
      throw error;
    }
  },
  async loadLastSolution(taskId: number) {
    const res = await fetch(`${API_URL}/api/solutions/last-integral/${taskId}`);
    if (!res.ok) return null;
    return await res.json();  // { phiSteps: [...], final: "..." }
  }
  
};

// Type definitions
interface Problem {
  id: string;
  title: string;
  description: string;
  expression?: string;
  equation?: string;
  limitVar?: string;
}

interface StepError {
  phiIndex: number;
  stepIndex?: number;
  error: string;
  hint?: string;
}

interface PhiStep {
  label: string;
  steps: string[];
}

// MathKeyboard Component
interface MathKeyboardProps {
  onSymbolClick: (symbol: string) => void;
  defaultVariable?: string;
}

const MathKeyboard: React.FC<MathKeyboardProps> = ({ onSymbolClick}) => {
  //const [currentVar, setCurrentVar] = useState<string>(defaultVariable);

  // Define button sets by category
  const basicSymbols = [
    "=", "+", "-", "×", "÷", "(", ")", "^", "_",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
  ];

  const variables = ["x", "y", "z", "n", "a", "b", "c", "t"];

  const greekSymbols = [
    "\\alpha", "\\beta", "\\gamma", "\\delta", "\\epsilon",
    "\\theta", "\\lambda", "\\mu", "\\pi", "\\sigma", "\\omega", "\\varphi"
  ];

  const calcSymbols = [
    "\\sqrt", "\\frac", "\\int", "\\sum", "\\prod", 
    "dx", "dy", "dz", "dt", "\\infty", "\\partial"
  ];

  const integralSymbols = [
    "\\int", "\\int_0^x", "\\int_a^b", "\\int_{-\\infty}^{\\infty}",
    "dt", "dx", "dy", "\\varphi(t)", "\\varphi(x)", "(x-t)"
  ];

  const trigFunctions = [
    "\\sin", "\\cos", "\\tan", "\\cot", "\\sec", "\\csc",
    "\\arcsin", "\\arccos", "\\arctan"
  ];

  const logFunctions = [
    "\\ln", "\\log", "\\exp", "\\log_{10}", "\\log_{2}", "e^"
  ];

  // General style for buttons
  const buttonStyle = "h-9 text-sm";

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid grid-cols-6 mb-2">
        <TabsTrigger value="basic">Негізгі</TabsTrigger>
        <TabsTrigger value="vars">Айнымалылар</TabsTrigger>
        <TabsTrigger value="greek">Грек</TabsTrigger>
        <TabsTrigger value="calc">Есептеу</TabsTrigger>
        <TabsTrigger value="integral">Интегралдар</TabsTrigger>
        <TabsTrigger value="trig">Тригонометрия</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="grid grid-cols-5 gap-1 sm:grid-cols-10">
        {basicSymbols.map((symbol) => (
          <Button
            key={symbol}
            variant="outline"
            className={buttonStyle}
            onClick={() => onSymbolClick(symbol)}
          >
            {symbol}
          </Button>
        ))}
      </TabsContent>

      <TabsContent value="vars" className="grid grid-cols-4 gap-1 sm:grid-cols-8">
        {variables.map((variable) => (
          <Button
            key={variable}
            variant="outline"
            className={buttonStyle}
            onClick={() => onSymbolClick(variable)}
          >
            {variable}
          </Button>
        ))}
      </TabsContent>

      <TabsContent value="greek" className="grid grid-cols-4 gap-1 sm:grid-cols-6">
        {greekSymbols.map((symbol) => (
          <Button
            key={symbol}
            variant="outline"
            className={buttonStyle}
            onClick={() => onSymbolClick(symbol)}
          >
            {symbol.replace(/\\/g, "")}
          </Button>
        ))}
      </TabsContent>

      <TabsContent value="calc" className="grid grid-cols-3 gap-1 sm:grid-cols-6">
        {calcSymbols.map((symbol) => (
          <Button
            key={symbol}
            variant="outline"
            className={buttonStyle}
            onClick={() => onSymbolClick(symbol)}
          >
            {symbol.replace(/\\/g, "")}
          </Button>
        ))}
      </TabsContent>

      <TabsContent value="integral" className="grid grid-cols-3 gap-1 sm:grid-cols-5">
        {integralSymbols.map((symbol) => (
          <Button
            key={symbol}
            variant="outline"
            className={buttonStyle}
            onClick={() => onSymbolClick(symbol)}
          >
            {symbol.replace(/\\/g, "")}
          </Button>
        ))}
      </TabsContent>

      <TabsContent value="trig" className="grid grid-cols-3 gap-1">
        {trigFunctions.map((func) => (
          <Button
            key={func}
            variant="outline"
            className={buttonStyle}
            onClick={() => onSymbolClick(func)}
          >
            {func.replace(/\\/g, "")}
          </Button>
        ))}
        {logFunctions.map((func) => (
          <Button
            key={func}
            variant="outline"
            className={buttonStyle}
            onClick={() => onSymbolClick(func)}
          >
            {func.replace(/\\/g, "")}
          </Button>
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default function IntegralSolutionChecker() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Problem | null>(null);
  const [solutionId, setSolutionId] = useState<number | null>(null);
  //const [currentPhiIndex, setCurrentPhiIndex] = useState<number>(0);
  const [phiSteps, setPhiSteps] = useState<PhiStep[]>([
    {
      label: "\\varphi_0(x)",
      steps: [""]
    }
  ]);
  const [finalSolution, setFinalSolution] = useState<string>("");
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [errors, setErrors] = useState<StepError[]>([]);
  const [attempted, setAttempted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activePhiTab, setActivePhiTab] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mathFieldRef = useRef<any>(null);
  const finalSolutionFieldRef = useRef<any>(null);
  const [score, setScore] = useState<number | null>(null);

  // Time formatting helper
  const formatTime = (seconds: number): string => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
    const ss = (seconds % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Timer effect
  
  useEffect(() => {
    if (timeLeft <= 0 && !attempted) {
      handleSubmitSolution();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, attempted]);
    
  // Load task and initialize solution

  useEffect(() => {
    if (task && task.limitVar) {
      // Если поле limitVar задано корректно, берем первую часть как переменную
      setPhiSteps([
        {
          label: `\\varphi_0(x)`,
          steps: [task.limitVar]
        }
      ]);
    }
  }, [task]);

  useEffect(() => {
    if (!taskId) return;
    const initializeTask = async () => {
      try {
        const data = await api.getTask(Number(taskId));
        setTask({
          id: data.id,
          title: data.title,
          description: data.description,
          expression: data.expression,
          equation: data.equation,
          limitVar: data.limitVar
        });
  
        const last = await api.loadLastSolution(Number(taskId));
        if (last) {
          const grouped: Record<string, string[]> = {};
          for (const step of last.phiSteps) {
            const label = step.label;
            grouped[label] = step.steps.map((encodedStep: string) => {
              const val = Number(encodedStep);
              return (val % 1000).toString();
            });
          }

          const parsed = Object.entries(grouped).map(([label, steps]) => ({
            label,
            steps,
          }));

          setPhiSteps(parsed);
          setFinalSolution(last.final);
          setAttempted(true);

          // ДОБАВЬТЕ ЭТО:
          setActivePhiTab(0);  // ⬅️ обязательно после загрузки данных
        

        }

  
        const solution = await api.startSolution(Number(taskId));
        setSolutionId(solution.solution_id);
      } catch (error) {
        toast.error("Failed to load task or last solution");
      }
    };
    initializeTask();
  }, [taskId]);
  

  // Handle input from math keyboard for phi steps
  const handleSymbolClick = (insertStr: string) => {
    if (attempted) {
      toast.error("You only have one attempt!");
      return;
    }
    const mathField = mathFieldRef.current;
    if (!mathField) return;
    const symbolMap: Record<string, (field: any) => void> = {
      "π": (f) => f.cmd("\\pi"),
      "√": (f) => f.cmd("\\sqrt"),
      "^": (f) => f.cmd("^"),
      "±": (f) => f.cmd("\\pm"),
      "∞": (f) => f.cmd("\\infty"),
      "≤": (f) => f.cmd("\\le"),
      "≥": (f) => f.cmd("\\ge"),
      "×": (f) => f.cmd("\\times"),
      "÷": (f) => f.cmd("\\div"),
      "sin": (f) => f.cmd("\\sin"),
      "cos": (f) => f.cmd("\\cos"),
      "tan": (f) => f.cmd("\\tan"),
      "log": (f) => f.cmd("\\log"),
      "ln": (f) => f.cmd("\\ln"),
      "exp": (f) => f.cmd("\\exp"),
      "=": (f) => f.write(" = "),
      "+": (f) => f.write("+"),
      "-": (f) => f.write("-"),
      "(": (f) => f.write("("),
      ")": (f) => f.write(")"),
      "x": (f) => f.write("x"),
      "y": (f) => f.write("y"),
      "φ": (f) => f.cmd("\\varphi"),
      "varphi": (f) => f.cmd("\\varphi")
    };

    if (insertStr.startsWith("\\int")) {
      mathField.write(insertStr + " ");
    } else if (insertStr.startsWith("\\")) {
      const action = symbolMap[insertStr.replace("\\", "")];
      if (action) {
        action(mathField);
      } else {
        mathField.cmd(insertStr);
      }
    } else {
      const action = symbolMap[insertStr];
      if (action) {
        action(mathField);
      } else {
        mathField.write(insertStr);
      }
    }
    const updatedPhiSteps = [...phiSteps];
    const currentPhiStepIndex = updatedPhiSteps[activePhiTab].steps.length - 1;
    updatedPhiSteps[activePhiTab].steps[currentPhiStepIndex] = mathField.latex();
    setPhiSteps(updatedPhiSteps);
  };

  // Handle input from math keyboard for final solution
  const handleFinalSolutionSymbolClick = (insertStr: string) => {
    if (attempted) {
      toast.error("You only have one attempt!");
      return;
    }
    const mathField = finalSolutionFieldRef.current;
    if (!mathField) return;
    const symbolMap: Record<string, (field: any) => void> = {
      "π": (f) => f.cmd("\\pi"),
      "√": (f) => f.cmd("\\sqrt"),
      "^": (f) => f.cmd("^"),
      "±": (f) => f.cmd("\\pm"),
      "∞": (f) => f.cmd("\\infty"),
      "≤": (f) => f.cmd("\\le"),
      "≥": (f) => f.cmd("\\ge"),
      "×": (f) => f.cmd("\\times"),
      "÷": (f) => f.cmd("\\div"),
      "sin": (f) => f.cmd("\\sin"),
      "cos": (f) => f.cmd("\\cos"),
      "tan": (f) => f.cmd("\\tan"),
      "log": (f) => f.cmd("\\log"),
      "ln": (f) => f.cmd("\\ln"),
      "exp": (f) => f.cmd("\\exp"),
      "=": (f) => f.write(" = "),
      "+": (f) => f.write("+"),
      "-": (f) => f.write("-"),
      "(": (f) => f.write("("),
      ")": (f) => f.write(")"),
      "x": (f) => f.write("x"),
      "y": (f) => f.write("y"),
      "φ": (f) => f.cmd("\\varphi"),
      "varphi": (f) => f.cmd("\\varphi")
    };

    if (insertStr.startsWith("\\int")) {
      mathField.write(insertStr + " ");
    } else if (insertStr.startsWith("\\")) {
      const action = symbolMap[insertStr.replace("\\", "")];
      if (action) {
        action(mathField);
      } else {
        mathField.cmd(insertStr);
      }
    } else {
      const action = symbolMap[insertStr];
      if (action) {
        action(mathField);
      } else {
        mathField.write(insertStr);
      }
    }
    setFinalSolution(mathField.latex());
  };

  // Add a new phi step
  const addPhiStep = () => {
    if (attempted) {
      toast.error("You only have one attempt!");
      return;
    }
    const newIndex = phiSteps.length;
    const newPhiSteps = [...phiSteps];
    newPhiSteps.push({
      label: `\\varphi_${newIndex}(x)`,
      steps: [""]
    });
    setPhiSteps(newPhiSteps);
    setActivePhiTab(newIndex);
  };

  // Add a new step to current phi
  const addStepToCurrentPhi = () => {
    if (attempted) {
      toast.error("You only have one attempt!");
      return;
    }
    const updatedPhiSteps = [...phiSteps];
    updatedPhiSteps[activePhiTab].steps.push("");
    setPhiSteps(updatedPhiSteps);
  };

  // Remove step from current phi
  const removeStepFromCurrentPhi = (stepIndex: number) => {
    if (attempted) {
      toast.error("You only have one attempt!");
      return;
    }
    if (phiSteps[activePhiTab].steps.length <= 1) {
      toast.error("Cannot remove the last step");
      return;
    }
    const updatedPhiSteps = [...phiSteps];
    updatedPhiSteps[activePhiTab].steps.splice(stepIndex, 1);
    setPhiSteps(updatedPhiSteps);
  };

  // Update a specific step in a phi
  const updatePhiStep = (phiIndex: number, stepIndex: number, value: string) => {
    if (attempted) {
      toast.error("You only have one attempt!");
      return;
    }
    const updatedPhiSteps = [...phiSteps];
    updatedPhiSteps[phiIndex].steps[stepIndex] = value;
    setPhiSteps(updatedPhiSteps);
  };

  // Submit solution for checking
  const handleSubmitSolution = async () => {
    if (attempted) {
      toast.error("You only have one attempt!");
      return;
    }
    if (!task) {
      toast.error("No task loaded");
      return;
    }
    if (!finalSolution.trim()) {
      toast.error("Please enter your final solution");
      return;
    }
    for (let i = 0; i < phiSteps.length; i++) {
      for (let j = 0; j < phiSteps[i].steps.length; j++) {
        if (!phiSteps[i].steps[j].trim()) {
          toast.error(`Please complete all steps in φ${i}(x)`);
          setActivePhiTab(i);
          return;
        }
      }
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setAttempted(true);
    setIsSubmitting(true);
    try {
      const result = await api.checkIntegralSolution(task.id, phiSteps, finalSolution);
      if (result.success) {
        toast.success(result.message);
        setCheckResult(result.message);
        setErrors([]);
        setScore(100); // Set perfect score for correct solution
      } else {
        setErrors(result.errors || []);
        // Calculate score based on number of errors and total steps
        const totalSteps = phiSteps.reduce((acc, phi) => acc + phi.steps.length, 0) + 1; // +1 for final solution
        const numErrors = result.errors?.length || 0;
        const calculatedScore = Math.max(0, Math.round((totalSteps - numErrors) / totalSteps * 100));
        setScore(calculatedScore);
        toast.error("Errors found in your solution");
      }
    } catch (error) {
      toast.error("Failed to check solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Finish solution early
  const finishCurrentSolution = async () => {
    if (attempted) {
      toast.error("You only have one attempt!");
      return;
    }
    if (!solutionId) {
      toast.error("No solution started");
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setAttempted(true);
    setIsSubmitting(true);
    try {
      /*
      const result = await api.finishSolution(solutionId);
      toast.success(result.message);
      setCheckResult(result.message);*/
    } catch (error) {
      toast.error("Failed to finish solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset solution (for testing)
  const resetSolution = () => {
    if (window.confirm("Are you sure you want to reset? This is for testing only.")) {
      setAttempted(false);
      setErrors([]);
      setCheckResult(null);
      setTimeLeft(300);
      /**setPhiSteps([
        {
          label: "\\varphi_0(x)",
          steps: [""]
        }
      ]);
      setFinalSolution("");
      setActivePhiTab(0);*/
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <MobileSidebar />
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white p-4 md:p-8 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl md:text-3xl text-white font-bold">
                    {task ? <TeX math={task.description} /> : "Loading task..."}
                  </CardTitle>
                  <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-white">
                    <Clock size={18} />
                    <span className="font-mono">{formatTime(timeLeft)}</span>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 ml-4"
                  disabled={!attempted}
                  onClick={async () => {
                    setAttempted(false);
                    setErrors([]);
                    setCheckResult(null);
                    setTimeLeft(300);
                    setIsSubmitting(false);

                    setPhiSteps([{ label: "\\varphi_0(x)", steps: [""] }]);
                    setActivePhiTab(0); // ✅ сброс активного таба

                    setFinalSolution("");

                    try {
                      const sol = await api.startSolution(Number(taskId));
                      setSolutionId(sol.solution_id);
                    } catch (e) {
                      toast.error("Не удалось начать новое решение");
                    }

                    toast.info("Вы можете ввести новое решение");
                  }}
                >
                  Шешуді бастау
                </Button>

              </CardHeader>
              
              <CardContent className="p-4 md:p-6 space-y-4 bg-white dark:bg-gray-900">
                {task ? (
                  <>
                    {task.equation && (
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="text-lg font-medium mb-2 text-blue-800 dark:text-blue-300">Теңдеу:</h3>
                        <div className="flex justify-center">
                          <TeX math={task.equation} />
                        </div>
                      </div>
                    )}
                    
                    {/* Phi Steps Tabs */}
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium">Фи функциялары:</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-2"
                          onClick={addPhiStep}
                          disabled={attempted}
                        >
                          <Plus size={16} className="mr-1" /> φ қосу
                        </Button>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        {/* Phi Tabs */}
                        <div className="flex overflow-x-auto bg-gray-100 dark:bg-gray-800">
                          {phiSteps.map((phi, index) => (
                            <button
                              key={index}
                              className={`px-4 py-2 text-sm font-medium ${
                                activePhiTab === index
                                  ? "bg-white dark:bg-gray-700 border-b-2 border-blue-500"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                              }`}
                              onClick={() => setActivePhiTab(index)}
                            >
                              <TeX math={phi.label} />
                            </button>
                          ))}
                        </div>
                        
                        {/* Active Phi Content */}
                        <div className="p-4">
                          {phiSteps[activePhiTab]?.steps?.map((step, stepIndex) => (
                            <div key={stepIndex} className="mb-4">
                              <div className="flex items-center mb-1">
                                <span className="text-sm text-gray-500 mr-2">Қадам {stepIndex + 1}:</span>
                                {phiSteps[activePhiTab].steps.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => removeStepFromCurrentPhi(stepIndex)}
                                    disabled={attempted}
                                  >
                                    <X size={14} />
                                  </Button>
                                )}
                              </div>
                              <div className={`w-full border rounded-md overflow-hidden ${attempted ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-950'}`}>
                                <EditableMathField
                                  latex={step}
                                  onChange={(mathField) => {
                                    if (!attempted) {
                                      updatePhiStep(activePhiTab, stepIndex, mathField.latex());
                                      if (stepIndex === phiSteps[activePhiTab].steps.length - 1) {
                                        mathFieldRef.current = mathField;
                                      }
                                    }
                                  }}
                                  mathquillDidMount={(mathField) => {
                                    if (stepIndex === phiSteps[activePhiTab].steps.length - 1) {
                                      mathFieldRef.current = mathField;
                                    }
                                    if (attempted) {
                                      mathField.el().setAttribute('aria-readonly', 'true');
                                    }
                                    const isDarkMode = document.documentElement.classList.contains('dark');
                                    const mqEl = mathField.el();
                                    mqEl.style.color = isDarkMode ? 'white' : 'black';
                                    const cursor = mqEl.querySelector('.mq-cursor') as HTMLElement;
                                    if (cursor) {
                                      cursor.style.backgroundColor = isDarkMode ? 'white' : 'black';
                                      cursor.style.width = '1px';
                                    }
                                    const textareas = mqEl.querySelectorAll('textarea');
                                    textareas.forEach((textarea: HTMLTextAreaElement) => {
                                      textarea.style.color = isDarkMode ? 'white' : 'black';
                                      textarea.style.caretColor = isDarkMode ? 'white' : 'black';
                                    });
                                  }}
                                  config={{
                                    spaceBehavesLikeTab: true,
                                    restrictMismatchedBrackets: true,
                                    sumStartsWithNEquals: true,
                                  }}
                                  className="w-full mathquill-input"
                                  style={{
                                    minHeight: "60px",
                                    padding: "12px",
                                    background: attempted ? (document.documentElement.classList.contains('dark') ? '#1f2937' : '#f3f4f6') : 'inherit',
                                    pointerEvents: attempted ? "none" : "auto",
                                    color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addStepToCurrentPhi}
                            disabled={attempted}
                            className="mt-2"
                          >
                            <Plus size={16} className="mr-1" /> Қадам қосу
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-100 p-2 rounded-md dark:bg-gray-800">
                        <MathKeyboard onSymbolClick={handleSymbolClick} defaultVariable="x" />
                      </div>
                    </div>
                    
                    {/* Final Solution */}
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Соңғы шешім φ(x):</h3>
                      <div className={`w-full border rounded-md overflow-hidden ${attempted ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-950'}`}>
                        <EditableMathField
                          latex={finalSolution}
                          onChange={(mathField) => {
                            if (!attempted) {
                              setFinalSolution(mathField.latex());
                            }
                          }}
                          mathquillDidMount={(mathField) => {
                            finalSolutionFieldRef.current = mathField;
                            if (attempted) {
                              mathField.el().setAttribute('aria-readonly', 'true');
                            }
                            const isDarkMode = document.documentElement.classList.contains('dark');
                            const mqEl = mathField.el();
                            mqEl.style.color = isDarkMode ? 'white' : 'black';
                            const cursor = mqEl.querySelector('.mq-cursor') as HTMLElement;
                            if (cursor) {
                              cursor.style.backgroundColor = isDarkMode ? 'white' : 'black';
                              cursor.style.width = '1px';
                            }
                            const textareas = mqEl.querySelectorAll('textarea');
                            textareas.forEach((textarea: HTMLTextAreaElement) => {
                              textarea.style.color = isDarkMode ? 'white' : 'black';
                              textarea.style.caretColor = isDarkMode ? 'white' : 'black';
                            });
                          }}
                          config={{
                            spaceBehavesLikeTab: true,
                            restrictMismatchedBrackets: true,
                            sumStartsWithNEquals: true,
                          }}
                          className="w-full mathquill-input"
                          style={{
                            minHeight: "60px",
                            padding: "12px",
                            background: attempted ? (document.documentElement.classList.contains('dark') ? '#1f2937' : '#f3f4f6') : 'inherit',
                            pointerEvents: attempted ? "none" : "auto",
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                          }}
                        />
                      </div>
                      <div className="mt-2 bg-gray-100 p-2 rounded-md dark:bg-gray-800">
                        <MathKeyboard onSymbolClick={handleFinalSolutionSymbolClick} defaultVariable="x" />
                      </div>
                    </div>
                    
                    {/* Score Display */}
                    {score !== null && (
                      <div className={`mt-4 p-4 rounded-md flex items-start space-x-2 ${
                        score === 100 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        <div className="w-full">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold">Бағалау:</h4>
                            <span className="text-lg font-bold">{score}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                score === 100 
                                  ? 'bg-green-600 dark:bg-green-500' 
                                  : 'bg-yellow-500 dark:bg-yellow-400'
                              }`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Results and Errors */}
                    {checkResult && (
                      <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold">Сәтті аяқталды!</h4>
                          <p>{checkResult}</p>
                        </div>
                      </div>
                    )}
                    {errors.length > 0 && (
                      <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold mb-2">Қателер табылды:</h4>
                          <ul className="space-y-2">
                            {errors.map((err, idx) => (
                              <li key={idx} className="pl-2 border-l-2 border-red-400">
                                <span className="font-semibold">
                                  φ{err.phiIndex}
                                  {err.stepIndex !== undefined ? `, Step ${err.stepIndex + 1}` : ""}:
                                </span>{" "}
                                {err.error}
                                {err.hint && (
                                  <p className="mt-1 text-sm italic text-gray-700 dark:text-gray-400">
                                    💡 {err.hint}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        onClick={() => {handleSubmitSolution();  finishCurrentSolution();}}
                        variant="default"
                        disabled={attempted || isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? "Тексерілуде..." : "Шешімді тексеру"}
                      </Button>
                      {/*<Button
                        onClick={finishCurrentSolution}
                        variant="secondary"
                        disabled={attempted || isSubmitting}
                      >
                        Finish Solution
                      </Button>*/}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-gray-500">Loading task information...</div>
                )}
              </CardContent>
              
              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => navigate("/tasks")}>
                  Тапсырмаларға оралу
                </Button>
                {/*{process.env.NODE_ENV === "development" && (
                  <Button variant="ghost" size="sm" onClick={resetSolution}>
                    Reset (Debug)
                  </Button>*/}
                  <Button variant="ghost" size="sm" onClick={resetSolution}>
                    Қайта бастау (Debug)
                  </Button>
                
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
