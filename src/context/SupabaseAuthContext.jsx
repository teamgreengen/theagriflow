import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    console.log('Login attempt:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Login error:', error.message);
      throw new Error(error.message);
    }
    
    console.log('Auth success, user:', data.user.id);
    
    const userInfo = { id: data.user.id, email: data.user.email };
    setUser(userInfo);
    setUserData(userInfo);
    
    return userInfo;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
  };

  const signup = async (email, password, name, role, additionalData = {}) => {
    console.log('Signup attempt:', email, 'role:', role);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });
    
    if (error) {
      console.error('Signup error:', error.message);
      throw new Error(error.message);
    }
    
    if (!data.user) {
      throw new Error('Failed to create user');
    }
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        name,
        role,
        phone: additionalData.phone || null,
        status: 'active'
      });
    
    if (insertError) {
      console.error('User insert error:', insertError);
    }
    
    return data.user;
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email });
          
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (data) {
            setUserData(data);
          } else {
            const role = session.user.user_metadata?.role || 'buyer';
            setUserData({ id: session.user.id, email: session.user.email, role });
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (data) {
          setUserData(data);
        } else {
          const role = session.user.user_metadata?.role || 'buyer';
          setUserData({ id: session.user.id, email: session.user.email, role });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    login,
    logout,
    signup,
    refreshUser: async () => {
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setUserData(data);
      }
    },
    ROLES: {
      BUYER: 'buyer',
      SELLER: 'seller',
      ADMIN: 'admin',
      SUPER_ADMIN: 'super_admin',
      RIDER: 'rider'
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;