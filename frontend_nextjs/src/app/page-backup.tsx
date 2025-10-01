"use client";

import React from "react";

export default function SimplePage() {
  return (
    <main className="max-w-[1200px] mx-auto px-6 md:px-8 py-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h1 className="text-xl font-semibold mb-4">Dashboard Loading...</h1>
        <p className="text-gray-600">
          The enhanced dashboard is being prepared. If you see this message, 
          there may be a server-side rendering issue with the interactive components.
        </p>
      </div>
    </main>
  );
}
