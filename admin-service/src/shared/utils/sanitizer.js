/**
 * How it works:
 * 1. It defines a set of sensitive fields that need to be redacted.
 * 2. If the input data is not an object or is null, it returns the data as is.
 * 3. If the input data is an array, it maps over each item, recursively sanitizing each one.
 *    - If any item is sanitized (i.e., changed), it tracks that sensitive data was present.
 * 4. If the input data is an object, it iterates over its keys:
 *    - For each key, it checks if it is a sensitive field (case insensitive).
 *    - If it is sensitive, it replaces the value with "***REDACTED***".
 *    - If it is not sensitive, it recursively sanitizes the value.
 * 5. Finally, it returns the sanitized object or array if any sensitive data was found;
 *    otherwise, it returns the original data.
 */
export const sanitize = (data) => {
  const sensitiveFields = new Set([
    "password",
    "token",
    "secret",
    "apiKey",
    "apikey",
    "accessToken",
    "accesstoken",
    "refreshToken",
    "refreshtoken",
    "ssn",
    "creditCard",
    "creditcard",
    "cardNumber",
    "cardnumber",
    "pin",
    "privateKey",
    "privatekey",
    "clientSecret",
    "clientsecret",
    "auth",
    "authorization",
    "jwt",
    "session",
    "cookie",
  ]);
  if (typeof data !== "object" || data === null) return data;
  let hasSensitiveData = false;
  if (Array.isArray(data)) {
    const sanitizedArray = data.map((item) => {
      const sanitizedItem = sanitize(item);
      if (sanitizedItem !== item) hasSensitiveData = true;
      return sanitizedItem;
    });
    return hasSensitiveData ? sanitizedArray : data;
  } else {
    const result = {};
    for (const key in data) {
      if (!data.hasOwnProperty(key)) continue;
      if (sensitiveFields.has(key.toLowerCase())) {
        result[key] = "***REDACTED***";
        hasSensitiveData = true;
      } else {
        const sanitizedValue = sanitize(data[key]);
        if (sanitizedValue !== data[key]) hasSensitiveData = true;
        result[key] = sanitizedValue;
      }
    }
    return hasSensitiveData ? result : data;
  }
};
