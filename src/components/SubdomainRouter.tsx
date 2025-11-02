import { useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSubdomain } from '@/lib/subdomain';

interface SubdomainRouterProps {
  children: ReactNode;
}

/**
 * SubdomainRouter handles automatic routing based on subdomain detection
 * - escrow.reapertech.* -> /escrow routes
 * - shop.reapertech.* -> /shop routes
 * - Main domain -> all routes available
 */
export const SubdomainRouter = ({ children }: SubdomainRouterProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const subdomain = getSubdomain();

  useEffect(() => {
    // No subdomain - allow all routes
    if (!subdomain) {
      return;
    }

    const path = location.pathname;

    // Handle escrow subdomain
    if (subdomain === 'escrow') {
      // If not already on an escrow route, redirect to escrow
      if (!path.startsWith('/escrow')) {
        // Map root to escrow dashboard
        if (path === '/') {
          navigate('/escrow', { replace: true });
        } else {
          // Otherwise redirect to escrow home
          navigate('/escrow', { replace: true });
        }
      }
      return;
    }

    // Handle shop subdomain
    if (subdomain === 'shop') {
      // If not already on a shop/cart route, redirect
      if (!path.startsWith('/shop') && !path.startsWith('/cart')) {
        // Map root to shop
        if (path === '/') {
          navigate('/shop', { replace: true });
        } else {
          // Otherwise redirect to shop
          navigate('/shop', { replace: true });
        }
      }
      return;
    }

    // Unknown subdomain - redirect to main site
    console.warn(`Unknown subdomain: ${subdomain}`);
  }, [subdomain, location.pathname, navigate]);

  return <>{children}</>;
};
