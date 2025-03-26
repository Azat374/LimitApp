import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SYMBOLS: { display: string; value: string }[] = [
  { display: "π", value: "pi" },
  { display: "√", value: "sqrt(" },
  { display: "^", value: "**" },
  { display: "±", value: "+/-" },
  { display: "∞", value: "oo" },
  { display: "≤", value: "<=" },
  { display: "≥", value: ">=" },
  { display: "×", value: "*" },
  { display: "÷", value: "/" },
  { display: "(", value: "(" },
  { display: ")", value: ")" },
  { display: "sin", value: "sin(" },
  { display: "cos", value: "cos(" },
  { display: "tan", value: "tan(" },
  { display: "log", value: "log(" },
  { display: "ln", value: "ln(" },
  { display: "exp", value: "exp(" },
];

interface MathKeyboardProps {
  onSymbolClick: (symbol: string) => void;
}

export const MathKeyboard: React.FC<MathKeyboardProps> = memo(({ onSymbolClick }) => {
  return (
    <div className={cn("flex flex-wrap gap-2 p-2 border rounded-md bg-gray-100 dark:bg-gray-700")}>
      {SYMBOLS.map((sym) => (
        <Button
          key={sym.display}
          variant="outline"
          size="sm"
          onClick={() => onSymbolClick(sym.value)}
          aria-label={`Insert ${sym.display}`}
        >
          {sym.display}
        </Button>
      ))}
    </div>
  );
});

MathKeyboard.displayName = "MathKeyboard";
