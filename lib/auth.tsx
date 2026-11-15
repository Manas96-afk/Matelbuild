'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from './db';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isSupabaseMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'buildora_current_user';
const LOCAL_USERS_DB_KEY = 'buildora_registered_users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Supabase Mode Auth Initialization
    if (isSupabaseConfigured && supabase) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
            createdAt: session.user.created_at,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
            createdAt: session.user.created_at,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // 2. LocalStorage Fallback Auth Initialization
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem(LOCAL_USER_KEY);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        }
      }
      setLoading(false);
    }
  }, []);

  // Login Function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { success: true };
      } else {
        // LocalStorage Auth Check
        const registeredStr = localStorage.getItem(LOCAL_USERS_DB_KEY) || '[]';
        const registeredUsers = JSON.parse(registeredStr);
        const match = registeredUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (!match) {
          // If no matching user, let's create a default mock user for ease of testing!
          if (email.toLowerCase() === 'admin@buildora.com' || email.toLowerCase() === 'user@example.com') {
            const defaultUser: UserProfile = {
              id: 'mock-user-id',
              email: email.toLowerCase(),
              name: 'Demo Architect',
              createdAt: new Date().toISOString(),
            };
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultUser));
            setUser(defaultUser);
            setLoading(false);
            return { success: true };
          }
          throw new Error('Invalid email or password. Use admin@buildora.com to test.');
        }

        const loggedInUser: UserProfile = {
          id: match.id,
          email: match.email,
          name: match.name,
          createdAt: match.createdAt,
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'An authentication error occurred.' };
    }
  };

  // Sign Up Function
  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) throw error;
        
        // If Supabase requires email confirmation, session will be null
        if (!data.session && data.user) {
           setLoading(false);
           return { success: false, error: 'Please check your email to confirm your account before logging in.' };
        }
        
        setLoading(false);
        return { success: true };
      } else {
        // LocalStorage Registration
        const registeredStr = localStorage.getItem(LOCAL_USERS_DB_KEY) || '[]';
        const registeredUsers = JSON.parse(registeredStr);
        const exists = registeredUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
        
        if (exists) {
          throw new Error('User already exists with this email.');
        }

        const newRegister = {
          id: 'user-' + Math.random().toString(36).substring(2, 9),
          email: email.toLowerCase(),
          password,
          name,
          createdAt: new Date().toISOString(),
        };
        registeredUsers.push(newRegister);
        localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(registeredUsers));

        // Automatically log in the user
        const loggedInUser: UserProfile = {
          id: newRegister.id,
          email: newRegister.email,
          name: newRegister.name,
          createdAt: newRegister.createdAt,
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  // Logout Function
  const logout = async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
    setUser(null);
    setLoading(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout, isSupabaseMode: isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
