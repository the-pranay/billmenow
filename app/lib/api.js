// API utility functions with authentication
export const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // If response is 401, token might be expired
    if (response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('billmenow_user');
      localStorage.removeItem('token');
      document.cookie = 'auth-token=; path=/; max-age=0';
      
      // Redirect to login with current page as redirect
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return null;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

// Specific API functions
export const dashboardAPI = {
  getStats: () => apiCall('/api/dashboard'),
};

export const clientsAPI = {
  getAll: () => apiCall('/api/clients'),
  getById: (id) => apiCall(`/api/clients/${id}`),
  create: (data) => apiCall('/api/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/api/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/api/clients/${id}`, {
    method: 'DELETE',
  }),
};

export const invoicesAPI = {
  getAll: () => apiCall('/api/invoices'),
  getById: (id) => apiCall(`/api/invoices/${id}`),
  create: (data) => apiCall('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/api/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/api/invoices/${id}`, {
    method: 'DELETE',
  }),
};

export const reportsAPI = {
  getAll: () => apiCall('/api/reports'),
};
