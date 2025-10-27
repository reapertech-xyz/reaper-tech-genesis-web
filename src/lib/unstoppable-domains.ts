import UAuth from '@uauth/js';

const uauth = new UAuth({
  clientID: import.meta.env.VITE_UNSTOPPABLE_DOMAINS_CLIENT_ID || '',
  redirectUri: window.location.origin + '/auth/callback',
  scope: 'openid wallet email:optional'
});

export const loginWithUnstoppableDomains = async () => {
  try {
    const authorization = await uauth.loginWithPopup();
    return {
      domain: authorization.idToken.sub,
      wallet: authorization.idToken.wallet_address,
      email: authorization.idToken.email,
      authorization
    };
  } catch (error) {
    console.error('Unstoppable Domains login error:', error);
    throw error;
  }
};

export const logoutUnstoppableDomains = async () => {
  try {
    await uauth.logout();
  } catch (error) {
    console.error('Unstoppable Domains logout error:', error);
  }
};

export default uauth;
