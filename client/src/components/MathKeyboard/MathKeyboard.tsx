import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface MathKeyboardProps {
  onSymbolClick: (symbol: string) => void;
  defaultVariable?: string;
}

export const MathKeyboard: React.FC<MathKeyboardProps> = ({
  onSymbolClick,
  defaultVariable = "x",
}) => {
  const [currentVar, setCurrentVar] = useState<string>(defaultVariable);
  const [limitDirection, setLimitDirection] = useState<string>("\\infty");

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