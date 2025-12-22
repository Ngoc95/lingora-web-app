"use client";

import { useState, useEffect, useCallback } from "react";

interface IUser {
  id: number;
  username: string;
  email: string;
  roles: IRole[];
  avatar?: string;
  status: 'ACTIVE' | 'BANNED' | 'PENDING';
  proficiency?: string;
  createdAt?: string;
}

interface IRole {
  id: number;
  name: 'ADMIN' | 'LEARNER';
}

interface ILoginRequest {
  usernameOrEmail: string;
  password: string;
}

interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface UseAuthReturn {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: ILoginRequest) => Promise<void>;
  register: (data: IRegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          // TODO: Call API to get user profile
          // const response = await authApi.getProfile();
          // setUser(response.data);
          
          // Placeholder: Mock user data
          setUser({
            id: 1,
            username: "demo_user",
            email: "demo@lingora.com",
            roles: [{ id: 1, name: 'LEARNER' }],
            status: 'ACTIVE',
            proficiency: 'B1'
          });
        }
      } catch (err) {
        setError(err as Error);
        localStorage.removeItem("accessToken");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: ILoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Call login API
      // const response = await authApi.login(credentials);
      // localStorage.setItem("accessToken", response.data.accessToken);
      // setUser(response.data.user);
      
      // Placeholder: Mock login
      localStorage.setItem("accessToken", "mock_token");
      setUser({
        id: 1,
        username: credentials.usernameOrEmail,
        email: "demo@lingora.com",
        roles: [{ id: 1, name: 'LEARNER' }],
        status: 'ACTIVE',
        proficiency: 'B1'
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: IRegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Call register API
      // const response = await authApi.register(data);
      // localStorage.setItem("accessToken", response.data.accessToken);
      // setUser(response.data.user);
      
      // Placeholder: Mock register
      localStorage.setItem("accessToken", "mock_token");
      setUser({
        id: 1,
        username: data.username,
        email: data.email,
        roles: [{ id: 1, name: 'LEARNER' }],
        status: 'PENDING',
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Call logout API
      // await authApi.logout();
      
      localStorage.removeItem("accessToken");
      setUser(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Call API to refresh user profile
      // const response = await authApi.getProfile();
      // setUser(response.data);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };
}
