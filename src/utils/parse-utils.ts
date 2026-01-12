/**
 * Utility functions for safely parsing values from dynamic data objects
 */

/**
 * Safely parse a value to integer
 * @param value - The value to parse (can be number, string, or other)
 * @returns Parsed integer or null if parsing fails
 */
export function parseToInt(value: unknown): number | null {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? null : parsed;
    }
    return null;
}

/**
 * Safely get an integer value from an object by key
 * @param data - The data object to extract from
 * @param key - The key to look for
 * @returns Parsed integer or null if not found or parsing fails
 */
export function getIntFromObject(data: any, key: string): number | null {
    if (!data || typeof data !== "object") return null;
    return parseToInt(data[key]);
}

/**
 * Safely get a nested integer value from an object
 * @param data - The data object to extract from
 * @param objKey - The key of the nested object
 * @param idKey - The key within the nested object (default: "id")
 * @returns Parsed integer or null if not found or parsing fails
 */
export function getNestedInt(
    data: any,
    objKey: string,
    idKey: string = "id"
): number | null {
    if (!data || typeof data !== "object") return null;
    const obj = data[objKey];
    if (obj && typeof obj === "object") {
        return parseToInt(obj[idKey]);
    }
    return null;
}

/**
 * Try to extract an integer ID from multiple possible keys in order
 * @param data - The data object to extract from
 * @param keys - Array of keys to try in order
 * @returns First successfully parsed integer or null
 */
export function getIntFromKeys(data: any, keys: string[]): number | null {
    for (const key of keys) {
        const value = getIntFromObject(data, key);
        if (value !== null) return value;
    }
    return null;
}
