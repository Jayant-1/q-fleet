import { useState, useEffect, useCallback } from 'react';

export function useRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      return p === '/dashboard' ? '/dashboard' : '/';
    }
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const p = window.location.pathname;
      setCurrentPath(p === '/dashboard' ? '/dashboard' : '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = useCallback((to: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== to) {
        window.history.pushState(null, '', to);
        setCurrentPath(to === '/dashboard' ? '/dashboard' : '/');
      }
    }
  }, []);

  return {
    currentPath,
    navigate,
    isDashboard: currentPath === '/dashboard',
    isLanding: currentPath === '/',
  };
}
