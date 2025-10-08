"use client";
import React, { useState } from "react";
import { Baby, Gift } from "lucide-react";
import ToysSection from "../components/ToysSection";

export default function ToysPage() {
  const [babyAgeMonths, setBabyAgeMonths] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-8 h-8 text-yellow-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Developmental Toys
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover age-appropriate toys that support your baby&apos;s growth and learning through play.
          </p>
        </div>

        {/* Age Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4 bg-white/90 dark:bg-gray-800/90 rounded-full px-6 py-3 shadow-lg">
            <Baby className="w-5 h-5 text-pink-600" />
            <input
              type="number"
              placeholder="Enter baby&apos;s age in months"
              value={babyAgeMonths}
              onChange={(e) => setBabyAgeMonths(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 w-48"
              min="0"
              max="24"
            />
            <span className="text-gray-500 dark:text-gray-400">months</span>
          </div>
        </div>

        {/* Toys Section */}
        <ToysSection babyAgeMonths={babyAgeMonths} />
      </div>
    </div>
  );
}
