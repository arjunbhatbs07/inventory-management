import { storageService } from './localStorage';

export const authService = {
  login: async (username, password) => {
    try {
      const result = storageService.login(username, password);
      localStorage.setItem('pickle_profit_auth', 'true');
      localStorage.setItem('pickle_profit_current_user', JSON.stringify(result.user));
      return result;
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  },

  register: async (username, password, full_name) => {
    const result = storageService.register(username, password, full_name);
    localStorage.setItem('pickle_profit_auth', 'true');
    localStorage.setItem('pickle_profit_current_user', JSON.stringify(result.user));
    return result;
  },

  logout: () => {
    localStorage.removeItem('pickle_profit_auth');
    localStorage.removeItem('pickle_profit_current_user');
  },

  getUser: () => {
    const user = localStorage.getItem('pickle_profit_current_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('pickle_profit_auth');
  }
};
