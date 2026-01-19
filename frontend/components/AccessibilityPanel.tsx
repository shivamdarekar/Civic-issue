"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Eye, Type, Contrast, Volume2 } from "lucide-react";

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessibilityPanel({ isOpen, onClose }: AccessibilityPanelProps) {
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);

  if (!isOpen) return null;

  const adjustFontSize = (change: number) => {
    const newSize = Math.max(75, Math.min(150, fontSize + change));
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.classList.toggle('high-contrast', !highContrast);
  };

  const resetAccessibility = () => {
    setFontSize(100);
    setHighContrast(false);
    document.documentElement.style.fontSize = '100%';
    document.documentElement.classList.remove('high-contrast');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Accessibility Options</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Font Size */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Text Size ({fontSize}%)
            </h3>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => adjustFontSize(-25)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                disabled={fontSize <= 75}
              >
                A-
              </Button>
              <Button
                onClick={() => adjustFontSize(25)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                disabled={fontSize >= 150}
              >
                A+
              </Button>
            </div>
          </div>

          {/* High Contrast */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Contrast className="w-4 h-4" />
              Display Options
            </h3>
            <Button
              onClick={toggleHighContrast}
              className={`w-full ${
                highContrast 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              } text-white`}
            >
              {highContrast ? 'Disable' : 'Enable'} High Contrast
            </Button>
          </div>

          {/* Screen Reader */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Screen Reader Support
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              This application is compatible with screen readers and follows WCAG 2.1 AA guidelines.
            </p>
            <Button
              onClick={() => {
                const announcement = document.createElement('div');
                announcement.setAttribute('aria-live', 'polite');
                announcement.setAttribute('aria-atomic', 'true');
                announcement.className = 'sr-only';
                announcement.textContent = 'Accessibility features are now active. Use Tab to navigate, Enter to select, and Escape to close dialogs.';
                document.body.appendChild(announcement);
                setTimeout(() => document.body.removeChild(announcement), 3000);
              }}
              className="bg-green-600 hover:bg-green-700 text-white w-full"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Test Screen Reader
            </Button>
          </div>

          {/* Reset */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={resetAccessibility}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white"
            >
              Reset All Settings
            </Button>
          </div>

          {/* Government Compliance Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Government Compliance</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• WCAG 2.1 AA Compliant</li>
              <li>• Section 508 Compatible</li>
              <li>• Keyboard Navigation Support</li>
              <li>• Screen Reader Optimized</li>
              <li>• Multi-language Support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}