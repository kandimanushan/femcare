// Add this utility to verify environment variables
export function checkEnvironmentVariables() {
  const requiredVars = ['OPENROUTER_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    return false;
  }
  
  return true;
} 