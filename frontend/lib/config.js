// API Configuration
export const API_CONFIG = {
  // Use Hugging Face Spaces URL in production, localhost in development
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://maskeen-erblogx.hf.space'  // Hugging Face Spaces URL
    : 'http://localhost:8000',
  
  // Endpoints
  ENDPOINTS: {
    SEARCH: '/ai-search',
    SUMMARIZE: '/summarize-results',
    TEST: '/test'
  },
  
  // Timeout settings for HF Spaces
  TIMEOUT: 60000, // 60 seconds for cold starts
  RETRY_ATTEMPTS: 2
};

// Helper function to get API URL with better error handling
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Enhanced fetch with retry logic for HF Spaces
export const fetchWithRetry = async (url, options = {}, retries = API_CONFIG.RETRY_ATTEMPTS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (retries > 0 && (error.name === 'AbortError' || error.message.includes('timeout'))) {
      console.log(`Retrying API call... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
      return fetchWithRetry(url, options, retries - 1);
    }
    
    throw error;
  }
}; 