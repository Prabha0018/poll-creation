const API_BASE_URL = 'https://poll-creation.onrender.com/api';


// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Polls API calls
export const pollsAPI = {
  getAllPolls: async () => {
    const response = await fetch(`${API_BASE_URL}/polls`);
    return handleResponse(response);
  },

  getPollById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/polls/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createPoll: async (pollData) => {
    const response = await fetch(`${API_BASE_URL}/polls`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pollData)
    });
    return handleResponse(response);
  },

  vote: async (pollId, optionIndex) => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ optionIndex })
    });
    return handleResponse(response);
  },

  clearVote: async (pollId) => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/clear-vote`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  deletePoll: async (pollId) => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updatePoll: async (pollId, data) => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};

// Utility functions
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('authchange'));
}; 