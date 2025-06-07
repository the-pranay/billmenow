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
    console.log(`Making API call to: ${url}`, { options: defaultOptions });
    const response = await fetch(url, defaultOptions);
    console.log(`API response status: ${response.status} for ${url}`);
    
    // If response is 401, token might be expired
    if (response.status === 401) {
      console.warn('401 Unauthorized - clearing auth data');
      // Clear auth data and redirect to login
      localStorage.removeItem('billmenow_user');
      localStorage.removeItem('token');
      document.cookie = 'auth-token=; path=/; max-age=0';
      
      // Redirect to login with current page as redirect
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return null;
    }
    
    // Handle different response types more safely
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Invalid JSON response from server');
      }
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server returned non-JSON response');
    }
    
    console.log(`API response data:`, data);
    
    if (!response.ok) {
      const errorMessage = data?.error || `API Error: ${response.status}`;
      console.error('API Error:', errorMessage, data);
      throw new Error(errorMessage);
    }
    
    return data;  } catch (error) {
    console.error('API Call Error Details:', {
      url,
      error: error.message,
      stack: error.stack,
      options: defaultOptions
    });
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error - please check your connection and try again');
    }
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    
    if (error.message.includes('Unexpected token')) {
      throw new Error('Server returned invalid response. Please try again.');
    }
    
    // If it's already a formatted error message, keep it
    if (error.message && !error.message.includes('API Error:')) {
      throw error;
    }
    
    // Fallback for unknown errors
    throw new Error('An unexpected error occurred. Please try again or contact support.');
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
