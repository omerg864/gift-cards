/**
 * Safely parses a JSON string.
 * @param value The string to parse
 * @param throwError Whether to throw an error if parsing fails (default: false)
 * @returns The parsed object or null if parsing fails (and throwError is false)
 */
export function safeJsonParse<T = any>(
  value: any,
  throwError = false,
): T | null {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    if (throwError) {
      throw error;
    }
    return null;
  }
}
