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
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  async checkSolution(taskId: string, steps: string[]) {
    try {
      const res = await fetch(`${API_URL}/api/solutions/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, steps }),
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
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      return await res.json();
    } catch (error) {
      console.error("Failed to finish solution:", error);
      throw error;
    }
  }
};

// Type definitions
interface Problem {
  id: string;
  title: string;
  description: string;
  expression?: string;
  limitVar?: string;
  expected_value?: string;
}

interface StepError {
  step: number;
  error: string;
  hint?: string;
}

// MathKeyboard Component
interface MathKeyboardProps {
  onSymbolClick: (symbol: string) => void;
  defaultVariable?: string;
  limitVar?: string;
}

const MathKeyboard: React.FC<MathKeyboardProps> = ({
  onSymbolClick,
  defaultVariable = "x",
  limitVar,
}) => {
  const [currentVar, setCurrentVar] = useState<string>(limitVar || defaultVariable);
  const [limitDirection, setLimitDirection] = useState<string>("\\infty");

  // Update currentVar if limitVar changes
  useEffect(() => {
    if (limitVar) {
      setCurrentVar(limitVar);
    }
  }, [limitVar]);

  // Define button sets by category
  const basicSymbols = [
    "=", "+", "-", "×", "÷", "(", ")", "^", "_",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
  ];

  const variables = ["x", "y", "z", "n", "a", "b", "c", "t"];

  const greekSymbols = [
    "\\alpha", "\\beta", "\\gamma", "\\delta", "\\epsilon",
    "\\theta", "\\lambda", "\\mu", "\\pi", "\\sigma", "\\omega"
  ];

  const calcSymbols = [
    "\\sqrt", "\\frac", "\\int", "\\sum", "\\prod", 
    "dx", "dy", "dz", "dt", "\\infty", "\\partial"
  ];

  const trigFunctions = [
    "\\sin", "\\cos", "\\tan", "\\cot", "\\sec", "\\csc",
    "\\arcsin", "\\arccos", "\\arctan"
  ];

  const logFunctions = [
    "\\ln", "\\log", "\\exp", "\\log_{10}", "\\log_{2}", "e^"
  ];

  const limitDirections = [
    { label: "\\infty", value: "\\infty" },
    { label: "-\\infty", value: "-\\infty" },
    { label: "0^+", value: "0^+" },
    { label: "0^-", value: "0^-" },
    { label: "a^-", value: "a^-" },
    { label: "a^+", value: "a^+" }
  ];

  // Custom handler for limit insertion
  const handleLimitInsert = () => {
    // Build the limit expression with the current variable and direction
    const limitExpr = `\\lim_{${currentVar}\\to ${limitDirection}}`;
    onSymbolClick(limitExpr);
  };

  // General style for buttons
  const buttonStyle = "h-9 text-sm";

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid grid-cols-6 mb-2">
        <TabsTrigger value="basic">Основные</TabsTrigger>
        <TabsTrigger value="vars">Переменные</TabsTrigger>
        <TabsTrigger value="greek">Греческие</TabsTrigger>
        <TabsTrigger value="calc">Исчисление</TabsTrigger>
        <TabsTrigger value="trig">Тригонометрия</TabsTrigger>
        <TabsTrigger value="limits">Пределы</TabsTrigger>
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

      <TabsContent value="limits" className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Переменная:</span>
            <div className="grid grid-cols-4 gap-1">
              {["x", "y", "z", "t", "n"].map((variable) => (
                <Button
                  key={variable}
                  variant={currentVar === variable ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => setCurrentVar(variable)}
                >
                  {variable}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Направление:</span>
            <div className="grid grid-cols-3 gap-1">
              {limitDirections.map((direction) => (
                <Button
                  key={direction.value}
                  variant={limitDirection === direction.value ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => setLimitDirection(direction.value)}
                >
                  {direction.label.replace(/\\/g, "")}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            variant="default" 
            className="mt-2 bg-blue-600 hover:bg-blue-700"
            onClick={handleLimitInsert}
          >
            Вставить предел
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default function SolutionChecker() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Problem | null>(null);
  const [solutionId, setSolutionId] = useState<number | null>(null);
  const [solutionText, setSolutionText] = useState<string>("");
  const [parsedSteps, setParsedSteps] = useState<string[]>([]);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [errors, setErrors] = useState<StepError[]>([]);
  const [attempted, setAttempted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mathFieldRef = useRef<any>(null);  
  // Time formatting helper
  const formatTime = (seconds: number): string => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
    const ss = (seconds % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Timer effect
  /*useEffect(() => {
    if (timeLeft <= 0 && !attempted) {
      handleSubmitSolution();
      return;
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, attempted]);*/

  // Load task and initialize solution
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
          limitVar: data.limitVar,
          expected_value: data.expected_value
        });
        
        const solution = await api.startSolution(Number(taskId));
        setSolutionId(solution.solution_id);
      } catch (error) {
        toast.error("Failed to load task");
      }
    };
    
    initializeTask();
  }, [taskId]);

  // Parse solution text into steps
  const parseSolutionText = (text: string): string[] => {
    // Split by equals sign with optional whitespace
    const steps = text.split(/\s*=\s*/)
      .map(s => s.trim())
      .filter(s => s !== "");
    
    // Check if LIMIT is already present as a marker or in any limit expression
    const hasLimitMarker = steps.some(s => s.toUpperCase() === "LIMIT");
    const hasLimitExpression = steps.some(s => 
      s.includes("\\lim") || s.includes("lim") || s.includes("\\to")
    );
    
    // Add LIMIT in the middle if there's no limit marker or expression and we have at least 2 steps
    if (steps.length >= 2 && !hasLimitMarker && !hasLimitExpression) {
      const middleIndex = Math.floor(steps.length / 2);
      steps.splice(middleIndex, 0, "LIMIT");
    }
    
    return steps;
  };

  // Handle input from math keyboard
  const handleSymbolClick = (insertStr: string) => {
    if (attempted) {
      toast.error("You only have one attempt!");
      return;
    }
    
    const mathField = mathFieldRef.current;
    if (!mathField) return;
    
    // Symbol mapping for LaTeX commands
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
      // Add any additional symbols you need
    };
    
    // Process insert string
    if (insertStr.startsWith("\\lim")) {
      // Special case for limit
      mathField.write(insertStr + " ");
      setSolutionText(mathField.latex());
    } else if (insertStr.startsWith("\\")) {
      // Process LaTeX commands
      const action = symbolMap[insertStr.replace("\\", "")];
      if (action) {
        action(mathField);
      } else {
        mathField.cmd(insertStr);
      }
      setSolutionText(mathField.latex());
    } else {
      // Process regular symbols
      const action = symbolMap[insertStr];
      if (action) {
        action(mathField);
      } else {
        mathField.write(insertStr);
      }
      setSolutionText(mathField.latex());
    }
  };

  // Handle solution preview
  const handlePreview = () => {
    if (!solutionText.trim()) {
      toast.error("Please enter your solution first");
      return;
    }
    
    const steps = parseSolutionText(solutionText);
    setParsedSteps(steps);
    setShowPreview(true);
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
    
    if (!solutionText.trim()) {
      toast.error("Please enter your solution");
      return;
    }
    
    // Stop timer and mark as attempted
    if (timerRef.current) clearInterval(timerRef.current);
    setAttempted(true);
    setIsSubmitting(true);
    
    // Parse steps and send to server
    const steps = parseSolutionText(solutionText);
    setParsedSteps(steps);
    
    try {
      const result = await api.checkSolution(task.id, steps);
      
      if (result.success) {
        toast.success(result.message);
        setCheckResult(result.message);
        setErrors([]);
      } else {
        setErrors(result.errors || []);
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
    
    // Stop timer and mark as attempted
    if (timerRef.current) clearInterval(timerRef.current);
    setAttempted(true);
    setIsSubmitting(true);
    
    try {
      const result = await api.finishSolution(solutionId);
      let message = result.message;
      
      // Replace infinity with ∞ symbol for display
      if (message.toLowerCase().includes("infinity") || message.toLowerCase().includes("infty")) {
        message = message.replace(/infinity/gi, "∞");
      }
      
      toast.success(message);
      setCheckResult(message);
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
      setParsedSteps([]);
      setTimeLeft(300);
      setShowPreview(false);
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
                    {task ? (
                      <TeX math={String(task.description)} />
                    ) : (
                      "Loading task..."
                    )}
                  </CardTitle>
                  <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-white">
                    <Clock size={18} />
                    <span className="font-mono">{formatTime(timeLeft)}</span>
                  </div>
                </div>
                
              </CardHeader>
              
              <CardContent className="p-4 md:p-6 space-y-4 bg-white dark:bg-gray-900">
                {task ? (
                  <>
                    <div>
                      <label className="block mb-2 font-semibold text-gray-800 dark:text-gray-200">
                        Enter your solution (LaTeX):
                      </label>
                      <div className="relative mb-4">
                        {/* Input wrapper with proper styling */}
                        <div className={`w-full border rounded-md overflow-hidden ${attempted ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-950'}`}>
                          <EditableMathField
                            latex={solutionText}
                            onChange={(mathField) => {
                              if (!attempted) {
                                setSolutionText(mathField.latex());
                                mathFieldRef.current = mathField;
                              }
                            }}
                            mathquillDidMount={(mathField) => {
                              mathFieldRef.current = mathField;
                              if (attempted) {
                                mathField.el().setAttribute('aria-readonly', 'true');
                              }
                              
                              const isDarkMode = document.documentElement.classList.contains('dark');
                              const mqEl = mathField.el();
                              
                              // Основной цвет текста
                              mqEl.style.color = isDarkMode ? 'white' : 'black';
                              
                              // Стилизация курсора
                              const cursor = mqEl.querySelector('.mq-cursor') as HTMLElement;
                              if (cursor) {
                                cursor.style.backgroundColor = isDarkMode ? 'white' : 'black';
                                cursor.style.width = '1px'; // Можно регулировать толщину курсора
                              }
                              
                              // Стилизация текстовых полей
                              const textareas = mqEl.querySelectorAll('textarea');
                              textareas.forEach((textarea: HTMLTextAreaElement) => {
                                textarea.style.color = isDarkMode ? 'white' : 'black';
                                textarea.style.caretColor = isDarkMode ? 'white' : 'black'; // Цвет курсора ввода
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
                      
                      <div className="mt-2 bg-gray-100 p-2 rounded-md dark:bg-gray-800">
                        <MathKeyboard 
                          onSymbolClick={handleSymbolClick} 
                          limitVar={task.limitVar}
                        />
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button 
                          onClick={handlePreview}
                          variant="outline"
                          disabled={attempted || !solutionText.trim()}
                        >
                          Preview Steps
                        </Button>
                        
                        <Button 
                          onClick={handleSubmitSolution}
                          variant="default"
                          disabled={attempted || isSubmitting}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSubmitting ? "Checking..." : "Check Solution"}
                        </Button>
                        
                        <Button 
                          onClick={finishCurrentSolution}
                          variant="secondary"
                          disabled={attempted || isSubmitting}
                        >
                          Finish Solution
                        </Button>
                      </div>
                    </div>
                    
                    {/* Preview section */}
                    {showPreview && parsedSteps.length > 0 && (
                      <div className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                        <h3 className="font-semibold mb-2 text-lg text-gray-800 dark:text-gray-200">
                          Step Preview:
                        </h3>
                        <div className="space-y-2">
                          {parsedSteps.map((step, idx) => (
                            <div key={idx} className="flex items-center">
                              <span className="mr-2 text-gray-500">{idx + 1}.</span>
                              {step.toUpperCase() === "LIMIT" ? (
                                <span className="text-blue-600 font-bold italic">
                                  [Taking the limit]
                                </span>
                              ) : (
                                <TeX math={String(step)} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Results section */}
                    {checkResult && (
                      <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold">Success!</h4>
                          <p>{checkResult}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Errors section */}
                    {errors.length > 0 && (
                      <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold mb-2">Errors Found:</h4>
                          <ul className="space-y-2">
                            {errors.map((err, idx) => (
                              <li key={idx} className="pl-2 border-l-2 border-red-400">
                                <span className="font-semibold">Step {err.step}:</span> {err.error}
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
                  </>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    Loading task information...
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/tasks")}
                >
                  Back to Tasks
                </Button>
                
                {/* Debug button - remove in production */}
                {process.env.NODE_ENV === "development" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetSolution}
                  >
                    Reset (Debug)
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}