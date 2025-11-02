/**
 * Extract subdomain from the current hostname
 * Returns null for main domain or localhost
 * Returns subdomain string for subdomains (e.g., "escrow", "shop")
 */
export const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // Ignore localhost and IPs
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }
  
  // Split hostname by dots
  const parts = hostname.split('.');
  
  // Need at least 3 parts for a subdomain (subdomain.domain.tld)
  if (parts.length < 3) {
    return null;
  }
  
  // First part is the subdomain
  const subdomain = parts[0];
  
  // Don't treat 'www' as a subdomain
  if (subdomain === 'www') {
    return null;
  }
  
  return subdomain;
};

/**
 * Check if current domain is a specific subdomain
 */
export const isSubdomain = (subdomain: string): boolean => {
  const current = getSubdomain();
  return current === subdomain;
};

/**
 * Get the base domain (without subdomain)
 */
export const getBaseDomain = (): string => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  
  return hostname;
};
