// API Configuration
export const API_CONFIG = {
  // Use Hugging Face Spaces URL in production, localhost in development
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.example.com'  // Your Hugging Face Spaces URL
    : 'http://localhost:8000',
  
  // Endpoints
  ENDPOINTS: {
    SEARCH: '/ai-search',
    SUMMARIZE: '/summarize-results',
    TEST: '/test'
  }
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 