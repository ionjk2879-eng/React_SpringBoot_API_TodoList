import { useState } from 'react';

export function useAuth() {
  const [email, setEmail] = useState<string | null>(
    localStorage.getItem('userEmail')
  );

  function setUser(email: string, token: string) {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userEmail', email);
    setEmail(email);
  }

  function clearUser() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    setEmail(null);
  }

  return { email, isLoggedIn: !!email, setUser, clearUser };
}
