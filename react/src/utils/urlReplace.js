
export const replaceUrl = (url, backendUrl = 'http://a.view:8080', frontendUrl = 'http://172.16.2.196:1000') => {
  if (!url) return '';
  return url.replace(backendUrl, frontendUrl);
};

export const getPortalUrl = (portalUrl) => {
  return replaceUrl(portalUrl);
};

export const getApiAssetUrl = (assetPath) => {
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://a.view:8080';
  if (!assetPath) return '';
  if (assetPath.startsWith('http')) {
    return assetPath;
  }
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  return `${apiBaseUrl}/${cleanPath}`;
};



// /**
//  * Replace backend URL with frontend URL for development
//  * @param {string} url - The URL to replace
//  * @param {string} backendUrl - Backend URL to replace (default: 'http://a.view:8080')
//  * @param {string} frontendUrl - Frontend URL to replace with (default: 'http://localhost:5173')
//  * @returns {string} - The replaced URL
//  */
// export const replaceUrl = (url, backendUrl = 'http://a.view:8080', frontendUrl = 'http://localhost:5173') => {
//   if (!url) return '';
//   return url.replace(backendUrl, frontendUrl);
// };

// /**
//  * @param {string} portalUrl - The portal URL from backend
//  * @returns {string} - The corrected portal URL
//  */
// export const getPortalUrl = (portalUrl) => {
//   return replaceUrl(portalUrl);
// };

// /**
//  * Get the correct API URL for assets (images, PDFs, etc.)
//  * @param {string} assetPath - The asset path from backend
//  * @returns {string} - The full API URL for the asset
//  */
// export const getApiAssetUrl = (assetPath) => {
//   const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://a.view:8080';
//   if (!assetPath) return '';
  
//   // If it's already a full URL, return as is
//   if (assetPath.startsWith('http')) {
//     return assetPath;
//   }
  
//   // If it starts with /, remove it to avoid double slashes
//   const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  
//   return `${apiBaseUrl}/${cleanPath}`;
// };