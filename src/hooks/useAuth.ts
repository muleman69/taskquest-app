import { useState, useCallback } from 'react';
import type { User } from '../types';

// Mock user data - change role to 'parent' to see parent dashboard
const MOCK_USER: User = {
  id: '1',
  name: 'Parent User',
  role: 'parent',
  coins: 0
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(MOCK_USER);

  const login = useCallback(() => {
    setUser(MOCK_USER);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return { user, login, logout };
}