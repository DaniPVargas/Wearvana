import { useState, useEffect } from 'react';

export default function TypewriterPlaceholder({ suggestions, typingSpeed = 100, delayBeforeDelete = 2000, delayBeforeNext = 1000 }) {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentSuggestion = suggestions[currentIndex];

    if (isTyping) {
      if (currentText.length < currentSuggestion.length) {
        // Typing
        const timeout = setTimeout(() => {
          setCurrentText(currentSuggestion.slice(0, currentText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, delayBeforeDelete);
        return () => clearTimeout(timeout);
      }
    } else {
      if (currentText.length === 0) {
        // Move to next suggestion
        const timeout = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % suggestions.length);
          setIsTyping(true);
        }, delayBeforeNext);
        return () => clearTimeout(timeout);
      } else {
        // Deleting
        const timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, typingSpeed / 2);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentText, currentIndex, isTyping, suggestions, typingSpeed, delayBeforeDelete, delayBeforeNext]);

  return currentText;
} 