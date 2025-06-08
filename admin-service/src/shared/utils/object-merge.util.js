// object-merge.util.js
// Utility functions for object merging operations with performance optimizations.

/**
 * Checks if a value is a plain object (not array, date, null, etc.)
 * @param {*} obj - Value to check
 * @returns {boolean} True if plain object
 */
function isPlainObject(obj) {
  return (
    obj !== null &&
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    obj.constructor === Object
  );
}

/**
 * Deep merges two objects optimally for logging context.
 * Arrays and non-plain objects are replaced entirely.
 *
 * Performance optimizations:
 * - Early returns for common cases
 * - Minimal object creation
 * - Efficient plain object detection
 * - Shallow copy optimization when no deep merge needed
 *
 * @param {Object} target - The target object (lower precedence)
 * @param {Object} source - The source object (higher precedence)
 * @returns {Object} New deeply merged object
 */
export function deepMerge(target, source) {
  // Fast path: handle null/undefined cases
  if (!source) return target || {};
  if (!target) return source;

  // Fast path: if source has no enumerable properties
  const sourceKeys = Object.keys(source);
  if (sourceKeys.length === 0) return target;

  // Check if we need deep merging at all
  let needsDeepMerge = false;
  for (const key of sourceKeys) {
    if (isPlainObject(source[key]) && isPlainObject(target[key])) {
      needsDeepMerge = true;
      break;
    }
  }

  // Fast path: if no deep merging needed, use shallow merge
  if (!needsDeepMerge) {
    return { ...target, ...source };
  }

  // Deep merge path: only when necessary
  const result = { ...target };

  for (const key of sourceKeys) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      // Recursively merge nested plain objects
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      // Replace with source value (arrays, primitives, dates, etc.)
      result[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Shallow merges two objects (for simple cases)
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} New merged object
 */
export function shallowMerge(target, source) {
  if (!source) return target || {};
  if (!target) return source;
  return { ...target, ...source };
}

/**
 * Merges multiple objects from left to right
 * @param {...Object} objects - Objects to merge
 * @returns {Object} New merged object
 */
export function mergeAll(...objects) {
  return objects.reduce((result, obj) => deepMerge(result, obj), {});
}
