import UAuth from '@uauth/js';

const uauth = new UAuth({
  clientID: 'bc9347e2-5942-4b9a-b264-fda5c5dc1df1',
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
