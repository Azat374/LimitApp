import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const symbols = [
  "π", "√", "^", "±", "∞", "≤", "≥", "×", "÷", "(", ")"
];

interface MathKeyboardProps {
  onSymbolClick: (symbol: string) => void;
}

export const MathKeyboard: React.FC<MathKeyboardProps> = ({ onSymbolClick }) => {
  return (
    <div className={cn("flex flex-wrap gap-2 p-2 border rounded-md bg-gray-100")}>
      {symbols.map((sym, index) => (
        <Button key={index} variant="outline" size="sm" onClick={() => onSymbolClick(sym)}>
          {sym}
        </Button>
      ))}
    </div>
  );
};
