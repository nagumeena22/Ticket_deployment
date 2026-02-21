export function getAuthToken() {
  return localStorage.getItem('token');
}

export function authHeader() {
  const token = getAuthToken();
  return token ? { 'x-auth-token': token } : {};
}
