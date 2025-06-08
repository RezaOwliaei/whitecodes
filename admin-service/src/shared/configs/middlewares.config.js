import { validateEnvVars } from "../utils/envValidator.js";

// Helper to sanitize and validate CORS origins from env (only valid http/https URLs)
function parseAllowedOrigins(origins) {
  return origins
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin && /^https?:\/\//.test(origin));
}

// Helper to parse comma-separated lists from env variables
function parseList(str) {
  return str
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

// Helper to parse boolean values from env variables
function parseBool(str) {
  return String(str).toLowerCase() === "true";
}

// List of required environment variables for middleware configuration
const requiredVars = [
  // CORS config
  "MIDDLEWARE_CONFIGS_CORS_ALLOWED_ORIGINS", // Allowed origins for CORS
  "MIDDLEWARE_CONFIGS_CORS_METHODS", // Allowed HTTP methods for CORS
  "MIDDLEWARE_CONFIGS_CORS_ALLOWED_HEADERS", // Allowed headers for CORS
  "MIDDLEWARE_CONFIGS_CORS_CREDENTIALS", // Allow credentials in CORS
  "MIDDLEWARE_CONFIGS_CORS_MAX_AGE", // Max age for CORS preflight
  // Helmet CSP config
  "MIDDLEWARE_CONFIGS_HELMET_CSP_DEFAULT_SRC", // CSP: default source
  "MIDDLEWARE_CONFIGS_HELMET_CSP_SCRIPT_SRC", // CSP: allowed script sources
  "MIDDLEWARE_CONFIGS_HELMET_CSP_STYLE_SRC", // CSP: allowed style sources
  "MIDDLEWARE_CONFIGS_HELMET_CSP_IMG_SRC", // CSP: allowed image sources
  "MIDDLEWARE_CONFIGS_HELMET_CSP_OBJECT_SRC", // CSP: allowed object/embed sources
  "MIDDLEWARE_CONFIGS_HELMET_CSP_BASE_URI", // CSP: allowed base URIs
  "MIDDLEWARE_CONFIGS_HELMET_CSP_FORM_ACTION", // CSP: allowed form actions
  "MIDDLEWARE_CONFIGS_HELMET_CSP_FRAME_ANCESTORS", // CSP: allowed frame ancestors
  "MIDDLEWARE_CONFIGS_HELMET_CSP_UPGRADE_INSECURE_REQUESTS", // CSP: upgrade insecure requests
  // Other Helmet config
  "MIDDLEWARE_CONFIGS_HELMET_CROSS_ORIGIN_RESOURCE_POLICY", // Cross-Origin Resource Policy
  "MIDDLEWARE_CONFIGS_HELMET_REFERRER_POLICY", // Referrer Policy
  "MIDDLEWARE_CONFIGS_HELMET_FRAMEGUARD", // Frameguard action
  "MIDDLEWARE_CONFIGS_HELMET_HSTS_MAX_AGE", // HSTS max age
  "MIDDLEWARE_CONFIGS_HELMET_HSTS_INCLUDE_SUBDOMAINS", // HSTS include subdomains
  "MIDDLEWARE_CONFIGS_HELMET_HSTS_PRELOAD", // HSTS preload
  "MIDDLEWARE_CONFIGS_HELMET_NO_SNIFF", // X-Content-Type-Options nosniff
  "MIDDLEWARE_CONFIGS_HELMET_XSS_FILTER", // X-XSS-Protection
  "MIDDLEWARE_CONFIGS_HELMET_DNS_PREFETCH_CONTROL", // DNS Prefetch Control
  "MIDDLEWARE_CONFIGS_HELMET_PERMITTED_CROSS_DOMAIN_POLICIES", // Permitted Cross Domain Policies
];
// List of variables that must be numeric
const numericVars = [
  "MIDDLEWARE_CONFIGS_CORS_MAX_AGE", // CORS preflight max age
  "MIDDLEWARE_CONFIGS_HELMET_HSTS_MAX_AGE", // HSTS max age
];

// Validate that all required env variables are set and numeric ones are valid
validateEnvVars(requiredVars, numericVars);

export default {
  cors: {
    origin: parseAllowedOrigins(
      process.env.MIDDLEWARE_CONFIGS_CORS_ALLOWED_ORIGINS // Array of allowed origins for CORS
    ),
    methods: parseList(process.env.MIDDLEWARE_CONFIGS_CORS_METHODS), // Array of allowed HTTP methods
    allowedHeaders: parseList(
      process.env.MIDDLEWARE_CONFIGS_CORS_ALLOWED_HEADERS // Array of allowed headers
    ),
    credentials: parseBool(process.env.MIDDLEWARE_CONFIGS_CORS_CREDENTIALS), // Allow credentials (cookies, auth headers)
    maxAge: Number(process.env.MIDDLEWARE_CONFIGS_CORS_MAX_AGE), // Max age for preflight cache
    optionsSuccessStatus: 204, // HTTP status for successful OPTIONS requests
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: parseList(
          process.env.MIDDLEWARE_CONFIGS_HELMET_CSP_DEFAULT_SRC // Default allowed sources for all content
        ),
        scriptSrc: parseList(
          process.env.MIDDLEWARE_CONFIGS_HELMET_CSP_SCRIPT_SRC // Allowed sources for scripts
        ),
        styleSrc: parseList(
          process.env.MIDDLEWARE_CONFIGS_HELMET_CSP_STYLE_SRC // Allowed sources for styles
        ),
        imgSrc: parseList(process.env.MIDDLEWARE_CONFIGS_HELMET_CSP_IMG_SRC), // Allowed sources for images
        objectSrc: parseList(
          process.env.MIDDLEWARE_CONFIGS_HELMET_CSP_OBJECT_SRC // Allowed sources for objects/embeds
        ),
        baseUri: parseList(process.env.MIDDLEWARE_CONFIGS_HELMET_CSP_BASE_URI), // Allowed base URIs
        formAction: parseList(
          process.env.MIDDLEWARE_CONFIGS_HELMET_CSP_FORM_ACTION // Allowed form actions
        ),
        frameAncestors: parseList(
          process.env.MIDDLEWARE_CONFIGS_HELMET_CSP_FRAME_ANCESTORS // Allowed frame ancestors
        ),
        // If true, instructs browser to upgrade all HTTP requests to HTTPS
        ...(parseBool(
          process.env.MIDDLEWARE_CONFIGS_HELMET_CSP_UPGRADE_INSECURE_REQUESTS
        ) && { upgradeInsecureRequests: [] }),
      },
    },
    crossOriginResourcePolicy: {
      policy:
        process.env.MIDDLEWARE_CONFIGS_HELMET_CROSS_ORIGIN_RESOURCE_POLICY, // Controls loading of cross-origin resources
    },
    referrerPolicy: {
      policy: process.env.MIDDLEWARE_CONFIGS_HELMET_REFERRER_POLICY, // Controls what referrer information is sent
    },
    frameguard: { action: process.env.MIDDLEWARE_CONFIGS_HELMET_FRAMEGUARD }, // Controls who can embed the site in a frame
    hsts: {
      maxAge: Number(process.env.MIDDLEWARE_CONFIGS_HELMET_HSTS_MAX_AGE), // HSTS: max age for HTTPS enforcement
      includeSubDomains: parseBool(
        process.env.MIDDLEWARE_CONFIGS_HELMET_HSTS_INCLUDE_SUBDOMAINS // HSTS: include subdomains
      ),
      preload: parseBool(process.env.MIDDLEWARE_CONFIGS_HELMET_HSTS_PRELOAD), // HSTS: preload flag
    },
    noSniff: parseBool(process.env.MIDDLEWARE_CONFIGS_HELMET_NO_SNIFF), // Prevents MIME type sniffing
    xssFilter: parseBool(process.env.MIDDLEWARE_CONFIGS_HELMET_XSS_FILTER), // Enables XSS filter in browsers
    dnsPrefetchControl: {
      allow: parseBool(
        process.env.MIDDLEWARE_CONFIGS_HELMET_DNS_PREFETCH_CONTROL // Controls DNS prefetching
      ),
    },
    permittedCrossDomainPolicies: {
      permittedPolicies:
        process.env.MIDDLEWARE_CONFIGS_HELMET_PERMITTED_CROSS_DOMAIN_POLICIES, // Controls Adobe cross-domain policies
    },
  },
};
