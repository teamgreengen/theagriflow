import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../config/supabase';
import { ROLES } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, name, role, additionalData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });
    if (error) throw error;
    
    const user = data.user;
    if (!user) throw new Error('Failed to create user');

    const userDoc = {
      id: user.id,
      uid: user.id,
      email,
      name,
      role,
      created_at: new Date().toISOString(),
      ...additionalData
    };

    const { error: insertError } = await supabase
      .from('users')
      .insert(userDoc);
    if (insertError) throw insertError;

    if (role === ROLES.SELLER) {
      const { error: sellerError } = await supabase
        .from('sellers')
        .insert({
          userId: user.id,
          storeName: additionalData.storeName || '',
          description: additionalData.description || '',
          verified: false,
          rating: 0,
          totalSales: 0,
          created_at: new Date().toISOString()
        });
      if (sellerError) throw sellerError;
    }

    if (role === ROLES.RIDER) {
      const { error: riderError } = await supabase
        .from('riders')
        .insert({
          userId: user.id,
          available: true,
          totalDeliveries: 0,
          rating: 0,
          earnings: 0,
          created_at: new Date().toISOString()
        });
      if (riderError) throw riderError;
    }

    setUserData(userDoc);
    return user;
  };

  const login = async (email, password) => {
    console.log('Login attempt for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      console.error('Auth error:', error);
      throw error;
    }
    
    console.log('Auth successful, user ID:', data.user.id);
    
    // Robust profile fetch: Fallback to email if ID match fails
    let { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();
    
    console.log('Profile by ID:', profile, 'error:', profileError);
    
    // Fallback: If no profile by ID, try finding by email (for pre-synced records)
    if (!profile) {
      const { data: emailProfile } = await supabase
        .from('users')
        .select('*')
        .eq('email', data.user.email)
        .maybeSingle();
      
      console.log('Profile by email:', emailProfile);
      
      if (emailProfile) {
        // Correct the ID mapping
        await supabase
          .from('users')
          .update({ id: data.user.id })
          .eq('email', data.user.email);
        profile = { ...emailProfile, id: data.user.id };
      }
    }

    if (!profile) {
      console.warn('No profile found - using auth metadata');
      // Try to get role from auth metadata
      const role = data.user.user_metadata?.role || 'buyer';
      console.log('Role from metadata:', role);
      const userWithRole = { ...data.user, role };
      setUserData(userWithRole);
      return userWithRole;
    }

    // Ensure role is always set - from profile or auth metadata
    const role = profile.role || data.user.user_metadata?.role || 'buyer';
    console.log('Final role:', role);
    const userWithProfile = { ...data.user, ...profile, role };
    setUserData(userWithProfile);
    return userWithProfile;
  };

  const logout = async () => {
    setUserData(null);
    await supabase.auth.signOut();
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted && session?.user) {
          setCurrentUser(session.user);
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (mounted) setUserData(data);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setCurrentUser(session?.user || null);
      
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUserData(data);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    logout,
    ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};