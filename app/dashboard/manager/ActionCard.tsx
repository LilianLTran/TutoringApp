"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export default function ActionCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl border border-gray-200 
        bg-white p-6 shadow-sm hover:shadow-md hover:border-gray-300 
        transition"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          {icon}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <ArrowRight 
              className="h-5 w-5 text-gray-400 group-hover:text-gray-700 
                transition" 
            />
          </div>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );
}