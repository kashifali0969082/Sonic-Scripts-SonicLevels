"use client";

import { useState, useEffect } from "react";

export const BackendPush = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="min-h-screen py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-6">

        
      </div>
    </section>
  );
};