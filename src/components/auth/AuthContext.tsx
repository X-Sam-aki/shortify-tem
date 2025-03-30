import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session, User, AuthError } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name?: string;
  email: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          const userProfile: UserProfile = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
          };
          
          // Fetch additional profile data using setTimeout to avoid recursive issues
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', currentSession.user.id)
                .single();
              
              if (data && !error) {
                userProfile.name = data.name;
              }
              
              setUser(userProfile);
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        const userProfile: UserProfile = {
          id: currentSession.user.id,
          email: currentSession.user.email || '',
        };
        
        supabase
          .from('profiles')
          .select('name')
          .eq('id', currentSession.user.id)
          .single()
          .then(({ data, error }) => {
            if (data && !error) {
              userProfile.name = data.name;
            }
            
            setUser(userProfile);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast.success('Successfully signed in!');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign in error:', authError);
      toast.error(authError.message || 'Failed to sign in. Please try again.');
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
          },
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Account created successfully! Please verify your email.');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign up error:', authError);
      toast.error(authError.message || 'Failed to create account. Please try again.');
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.info('You have been signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
