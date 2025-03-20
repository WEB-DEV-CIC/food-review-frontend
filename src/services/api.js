const API_URL = process.env.REACT_APP_API_URL;

export const api = {
  async get(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`);
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
  // Add other methods as needed
}; 