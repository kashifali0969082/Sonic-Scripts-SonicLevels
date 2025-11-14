"use client";

import { useState, useEffect } from "react";

export const FrontendPush = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className=" bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6">
    
       
      </div>
    </section>
  );
};