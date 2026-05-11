"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CardDeclaracaoPortal({
  label,
  pct,
  children,
}: {
  label: "CPF" | "CNPJ";
  pct: number;
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between px-5 py-5 text-left"
      >
        <div>
          <p className="text-gray-400 text-sm font-medium">declaração</p>
          <p className="text-4xl font-bold text-gray-900 mt-1">{label}</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">
            +{pct}%
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              aberto ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {aberto && (
        <div className="border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}
