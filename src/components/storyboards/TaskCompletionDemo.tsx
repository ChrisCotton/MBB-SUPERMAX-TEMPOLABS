import React from "react";
import { Button } from "@/components/ui/button";

const TaskCompletionDemo = () => {
  const showCompletionFeedback = (amount: number) => {
    // Create a celebration overlay
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 bg-black/30 flex items-center justify-center z-50";

    // Create the celebration animation container
    const animationContainer = document.createElement("div");
    animationContainer.className =
      "relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 overflow-hidden";

    // Add confetti effect
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      const size = Math.random() * 10 + 5;
      const color = [
        "bg-green-500",
        "bg-blue-500",
        "bg-yellow-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-indigo-500",
      ][Math.floor(Math.random() * 6)];

      confetti.className = `absolute ${color} rounded-full opacity-70`;
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = `${Math.random() * 100}%`;
      confetti.style.transform = `scale(0)`;
      confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s ease-out forwards`;
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;

      animationContainer.appendChild(confetti);
    }

    // Add celebration content
    const content = document.createElement("div");
    content.className = "text-center z-10 relative";
    content.innerHTML = `
      <div class="mb-4 flex justify-center">
        <div class="rounded-full bg-green-100 p-3 animate-bounce">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2 animate-pulse">Task Completed!</h2>
      <div class="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
        <p class="text-lg font-medium text-gray-700">Added to Mental Bank Balance:</p>
        <p class="text-3xl font-bold text-green-600 animate-[counter_2s_ease-out_forwards]" id="amount-counter">$0.00</p>
      </div>
      <p class="text-gray-600 italic">Keep up the great work!</p>
      <button class="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors" id="close-celebration">Continue</button>
    `;

    animationContainer.appendChild(content);
    overlay.appendChild(animationContainer);
    document.body.appendChild(overlay);

    // Add the CSS animation for confetti
    const style = document.createElement("style");
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(-10px) scale(0) rotate(0deg); }
        50% { transform: translateY(100px) scale(1) rotate(180deg); opacity: 1; }
        100% { transform: translateY(200px) scale(0.5) rotate(360deg); opacity: 0; }
      }
      @keyframes counter {
        0% { content: "$0.00"; }
        100% { content: "$${amount.toFixed(2)}"; }
      }
    `;
    document.head.appendChild(style);

    // Animate the counter
    const counter = document.getElementById("amount-counter");
    if (counter) {
      let current = 0;
      const increment = amount / 50;
      const interval = setInterval(() => {
        current += increment;
        if (current > amount) current = amount;
        counter.textContent = `$${current.toFixed(2)}`;
        if (current >= amount) clearInterval(interval);
      }, 40);
    }

    // Close button functionality
    const closeButton = document.getElementById("close-celebration");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        overlay.classList.add(
          "opacity-0",
          "transition-opacity",
          "duration-300",
        );
        setTimeout(() => {
          document.body.removeChild(overlay);
          document.head.removeChild(style);
        }, 300);
      });
    }

    // Auto close after 8 seconds
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        overlay.classList.add(
          "opacity-0",
          "transition-opacity",
          "duration-300",
        );
        setTimeout(() => {
          if (document.body.contains(overlay))
            document.body.removeChild(overlay);
          if (document.head.contains(style)) document.head.removeChild(style);
        }, 300);
      }
    }, 8000);
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-6">
        Task Completion Animation Demo
      </h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Click the button below to see the new task completion animation that
        shows when a task is marked as complete.
      </p>
      <div className="space-y-4">
        <Button onClick={() => showCompletionFeedback(75.0)} className="w-full">
          Complete Small Task ($75.00)
        </Button>
        <Button
          onClick={() => showCompletionFeedback(250.0)}
          className="w-full"
        >
          Complete Medium Task ($250.00)
        </Button>
        <Button
          onClick={() => showCompletionFeedback(1250.0)}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Complete Large Task ($1,250.00)
        </Button>
      </div>
    </div>
  );
};

export default TaskCompletionDemo;
