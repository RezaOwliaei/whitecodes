export const HTTP_STATUS = Object.freeze({
  // 1xx Informational
  /** @type {{code: 100, message: "Continue"}} */
  CONTINUE: { code: 100, message: "Continue" },
  /** @type {{code: 101, message: "Switching Protocols"}} */
  SWITCHING_PROTOCOLS: { code: 101, message: "Switching Protocols" },
  /** @type {{code: 102, message: "Processing"}} */
  PROCESSING: { code: 102, message: "Processing" },
  /** @type {{code: 103, message: "Early Hints"}} */
  EARLY_HINTS: { code: 103, message: "Early Hints" },

  // 2xx Success
  /** @type {{code: 200, message: "OK"}} */
  OK: { code: 200, message: "OK" },
  /** @type {{code: 201, message: "Created"}} */
  CREATED: { code: 201, message: "Created" },
  /** @type {{code: 202, message: "Accepted"}} */
  ACCEPTED: { code: 202, message: "Accepted" },
  /** @type {{code: 203, message: "Non-Authoritative Information"}} */
  NON_AUTHORITATIVE_INFORMATION: {
    code: 203,
    message: "Non-Authoritative Information",
  },
  /** @type {{code: 204, message: "No Content"}} */
  NO_CONTENT: { code: 204, message: "No Content" },
  /** @type {{code: 205, message: "Reset Content"}} */
  RESET_CONTENT: { code: 205, message: "Reset Content" },
  /** @type {{code: 206, message: "Partial Content"}} */
  PARTIAL_CONTENT: { code: 206, message: "Partial Content" },
  /** @type {{code: 207, message: "Multi-Status"}} */
  MULTI_STATUS: { code: 207, message: "Multi-Status" },
  /** @type {{code: 208, message: "Already Reported"}} */
  ALREADY_REPORTED: { code: 208, message: "Already Reported" },
  /** @type {{code: 226, message: "IM Used"}} */
  IM_USED: { code: 226, message: "IM Used" },

  // 3xx Redirection
  /** @type {{code: 300, message: "Multiple Choices"}} */
  MULTIPLE_CHOICES: { code: 300, message: "Multiple Choices" },
  /** @type {{code: 301, message: "Moved Permanently"}} */
  MOVED_PERMANENTLY: { code: 301, message: "Moved Permanently" },
  /** @type {{code: 302, message: "Found"}} */
  FOUND: { code: 302, message: "Found" },
  /** @type {{code: 303, message: "See Other"}} */
  SEE_OTHER: { code: 303, message: "See Other" },
  /** @type {{code: 304, message: "Not Modified"}} */
  NOT_MODIFIED: { code: 304, message: "Not Modified" },
  /** @type {{code: 305, message: "Use Proxy"}} */
  USE_PROXY: { code: 305, message: "Use Proxy" },
  /** @type {{code: 307, message: "Temporary Redirect"}} */
  TEMPORARY_REDIRECT: { code: 307, message: "Temporary Redirect" },
  /** @type {{code: 308, message: "Permanent Redirect"}} */
  PERMANENT_REDIRECT: { code: 308, message: "Permanent Redirect" },

  // 4xx Client Error
  /** @type {{code: 400, message: "Bad Request"}} */
  BAD_REQUEST: { code: 400, message: "Bad Request" },
  /** @type {{code: 401, message: "Unauthorized"}} */
  UNAUTHORIZED: { code: 401, message: "Unauthorized" },
  /** @type {{code: 402, message: "Payment Required"}} */
  PAYMENT_REQUIRED: { code: 402, message: "Payment Required" },
  /** @type {{code: 403, message: "Forbidden"}} */
  FORBIDDEN: { code: 403, message: "Forbidden" },
  /** @type {{code: 404, message: "Not Found"}} */
  NOT_FOUND: { code: 404, message: "Not Found" },
  /** @type {{code: 405, message: "Method Not Allowed"}} */
  METHOD_NOT_ALLOWED: { code: 405, message: "Method Not Allowed" },
  /** @type {{code: 406, message: "Not Acceptable"}} */
  NOT_ACCEPTABLE: { code: 406, message: "Not Acceptable" },
  /** @type {{code: 407, message: "Proxy Authentication Required"}} */
  PROXY_AUTHENTICATION_REQUIRED: {
    code: 407,
    message: "Proxy Authentication Required",
  },
  /** @type {{code: 408, message: "Request Timeout"}} */
  REQUEST_TIMEOUT: { code: 408, message: "Request Timeout" },
  /** @type {{code: 409, message: "Conflict"}} */
  CONFLICT: { code: 409, message: "Conflict" },
  /** @type {{code: 410, message: "Gone"}} */
  GONE: { code: 410, message: "Gone" },
  /** @type {{code: 411, message: "Length Required"}} */
  LENGTH_REQUIRED: { code: 411, message: "Length Required" },
  /** @type {{code: 412, message: "Precondition Failed"}} */
  PRECONDITION_FAILED: { code: 412, message: "Precondition Failed" },
  /** @type {{code: 413, message: "Payload Too Large"}} */
  PAYLOAD_TOO_LARGE: { code: 413, message: "Payload Too Large" },
  /** @type {{code: 414, message: "URI Too Long"}} */
  URI_TOO_LONG: { code: 414, message: "URI Too Long" },
  /** @type {{code: 415, message: "Unsupported Media Type"}} */
  UNSUPPORTED_MEDIA_TYPE: { code: 415, message: "Unsupported Media Type" },
  /** @type {{code: 416, message: "Range Not Satisfiable"}} */
  RANGE_NOT_SATISFIABLE: { code: 416, message: "Range Not Satisfiable" },
  /** @type {{code: 417, message: "Expectation Failed"}} */
  EXPECTATION_FAILED: { code: 417, message: "Expectation Failed" },
  /** @type {{code: 418, message: "I'm a teapot"}} */
  IM_A_TEAPOT: { code: 418, message: "I'm a teapot" },
  /** @type {{code: 421, message: "Misdirected Request"}} */
  MISDIRECTED_REQUEST: { code: 421, message: "Misdirected Request" },
  /** @type {{code: 422, message: "Unprocessable Entity"}} */
  UNPROCESSABLE_ENTITY: { code: 422, message: "Unprocessable Entity" },
  /** @type {{code: 423, message: "Locked"}} */
  LOCKED: { code: 423, message: "Locked" },
  /** @type {{code: 424, message: "Failed Dependency"}} */
  FAILED_DEPENDENCY: { code: 424, message: "Failed Dependency" },
  /** @type {{code: 425, message: "Too Early"}} */
  TOO_EARLY: { code: 425, message: "Too Early" },
  /** @type {{code: 426, message: "Upgrade Required"}} */
  UPGRADE_REQUIRED: { code: 426, message: "Upgrade Required" },
  /** @type {{code: 428, message: "Precondition Required"}} */
  PRECONDITION_REQUIRED: { code: 428, message: "Precondition Required" },
  /** @type {{code: 429, message: "Too Many Requests"}} */
  TOO_MANY_REQUESTS: { code: 429, message: "Too Many Requests" },
  /** @type {{code: 431, message: "Request Header Fields Too Large"}} */
  REQUEST_HEADER_FIELDS_TOO_LARGE: {
    code: 431,
    message: "Request Header Fields Too Large",
  },
  /** @type {{code: 451, message: "Unavailable For Legal Reasons"}} */
  UNAVAILABLE_FOR_LEGAL_REASONS: {
    code: 451,
    message: "Unavailable For Legal Reasons",
  },

  // 5xx Server Error
  /** @type {{code: 500, message: "Internal Server Error"}} */
  INTERNAL_SERVER_ERROR: { code: 500, message: "Internal Server Error" },
  /** @type {{code: 501, message: "Not Implemented"}} */
  NOT_IMPLEMENTED: { code: 501, message: "Not Implemented" },
  /** @type {{code: 502, message: "Bad Gateway"}} */
  BAD_GATEWAY: { code: 502, message: "Bad Gateway" },
  /** @type {{code: 503, message: "Service Unavailable"}} */
  SERVICE_UNAVAILABLE: { code: 503, message: "Service Unavailable" },
  /** @type {{code: 504, message: "Gateway Timeout"}} */
  GATEWAY_TIMEOUT: { code: 504, message: "Gateway Timeout" },
  /** @type {{code: 505, message: "HTTP Version Not Supported"}} */
  HTTP_VERSION_NOT_SUPPORTED: {
    code: 505,
    message: "HTTP Version Not Supported",
  },
  /** @type {{code: 506, message: "Variant Also Negotiates"}} */
  VARIANT_ALSO_NEGOTIATES: { code: 506, message: "Variant Also Negotiates" },
  /** @type {{code: 507, message: "Insufficient Storage"}} */
  INSUFFICIENT_STORAGE: { code: 507, message: "Insufficient Storage" },
  /** @type {{code: 508, message: "Loop Detected"}} */
  LOOP_DETECTED: { code: 508, message: "Loop Detected" },
  /** @type {{code: 510, message: "Not Extended"}} */
  NOT_EXTENDED: { code: 510, message: "Not Extended" },
  /** @type {{code: 511, message: "Network Authentication Required"}} */
  NETWORK_AUTHENTICATION_REQUIRED: {
    code: 511,
    message: "Network Authentication Required",
  },
});

// Fast lookup by code
export const HTTP_STATUS_BY_CODE = Object.freeze(
  Object.fromEntries(
    Object.entries(HTTP_STATUS).map(([key, value]) => [
      value.code,
      { ...value, key },
    ])
  )
);

/**
 * Find HTTP status by code.
 * @param {number} code - HTTP status code
 * @returns {{code: number, message: string, key: string}|undefined}
 */
export function getHttpStatusByCode(code) {
  return HTTP_STATUS_BY_CODE[code];
}
