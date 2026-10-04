import { useState, useEffect, useCallback } from 'react';

export function useRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/judge') return '/judge';
      if (p === '/dashboard') return '/dashboard';
      return '/';
    }
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const p = window.location.pathname;
      if (p === '/judge') setCurrentPath('/judge');
      else if (p === '/dashboard') setCurrentPath('/dashboard');
      else setCurrentPath('/');
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = useCallback((to: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== to) {
        window.history.pushState(null, '', to);
        if (to === '/judge') setCurrentPath('/judge');
        else if (to === '/dashboard') setCurrentPath('/dashboard');
        else setCurrentPath('/');
      }
    }
  }, []);

  return {
    currentPath,
    navigate,
    isJudge: currentPath === '/judge',
    isDashboard: currentPath === '/dashboard',
    isLanding: currentPath === '/',
  };
}
