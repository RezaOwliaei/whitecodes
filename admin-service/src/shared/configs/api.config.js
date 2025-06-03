import { validateEnvVars } from '../utils/envValidator.js';

const requiredVars = ['API_CONFIGS_API_PATH_PREFIX'];

validateEnvVars(requiredVars);

export default {
  pathPrefix: process.env.API_CONFIGS_API_PATH_PREFIX,
};
