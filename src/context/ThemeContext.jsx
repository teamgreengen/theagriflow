import { useState, useEffect } from 'react';
import SuperAdminService from '../services/superAdminService';

export const ThemeProvider = ({ children }) => {
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      const settings = await SuperAdminService.getSettings();
      if (settings.branding) {
        setBranding(settings.branding);
        applyTheme(settings.branding);
      }
    } catch (err) {
      console.log('Using default theme');
    }
  };

  const applyTheme = (branding) => {
    const root = document.documentElement;
    
    if (branding.primaryColor) {
      root.style.setProperty('--primary-color', branding.primaryColor);
    }
    if (branding.secondaryColor) {
      root.style.setProperty('--secondary-color', branding.secondaryColor);
    }
    if (branding.logo) {
      root.style.setProperty('--site-logo', `url(${branding.logo})`);
    }
    if (branding.favicon) {
      const link = document.querySelector("link[rel='icon']") || document.createElement('link');
      link.rel = 'icon';
      link.href = branding.favicon;
      document.head.appendChild(link);
    }
  };

  return <>{children}</>;
};

export default ThemeProvider;