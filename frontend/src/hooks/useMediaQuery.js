import { useEffect, useState } from "react";

/**
 * Optimized useMediaQuery hook that uses matchMedia for efficient responsive design.
 * Uses native browser media queries instead of resize listeners.
 *
 * @param {string} query - Media query string (e.g., "(max-width: 768px)")
 * @returns {boolean} True if media query matches, false otherwise
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Initialize with current value
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    // Create handler for media query changes
    const handler = (e) => setMatches(e.matches);

    // Use addEventListener (modern approach)
    mediaQueryList.addEventListener("change", handler);

    return () => {
      mediaQueryList.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}
