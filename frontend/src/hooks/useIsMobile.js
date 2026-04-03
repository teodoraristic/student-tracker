import { useMediaQuery } from "./useMediaQuery";

/**
 * Hook to detect if viewport is mobile-sized.
 * Uses native matchMedia API for efficient, shared media query listeners.
 *
 * @param {number} breakpoint - Breakpoint pixel value (default: 768px)
 * @returns {boolean} True if viewport width is less than breakpoint
 */
export default function useIsMobile(breakpoint = 768) {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px`);
}
