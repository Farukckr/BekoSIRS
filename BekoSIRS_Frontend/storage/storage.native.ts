import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Save access token
export async function saveToken(token: string): Promise<void> {
  try {
    if (!token) {
      console.warn('⚠️ Attempted to save empty token');
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log('✅ Token saved successfully');
  } catch (error) {
    console.error('❌ Error saving token:', error);
    throw error;
  }
}

// Get access token
export async function getToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      console.log('✅ Token retrieved successfully');
    } else {
      console.log('ℹ️ No token found');
    }
    return token;
  } catch (error) {
    console.error('❌ Error getting token:', error);
    return null;
  }
}

// Delete access token
export async function deleteToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log('✅ Token deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting token:', error);
    throw error;
  }
}

// Save refresh token
export async function saveRefreshToken(token: string): Promise<void> {
  try {
    if (!token) {
      console.warn('⚠️ Attempted to save empty refresh token');
      return;
    }
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    console.log('✅ Refresh token saved successfully');
  } catch (error) {
    console.error('❌ Error saving refresh token:', error);
    throw error;
  }
}

// Get refresh token
export async function getRefreshToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('❌ Error getting refresh token:', error);
    return null;
  }
}

// Delete refresh token
export async function deleteRefreshToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    console.log('✅ Refresh token deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting refresh token:', error);
    throw error;
  }
}

// Save both tokens at once
export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  try {
    await Promise.all([
      saveToken(accessToken),
      saveRefreshToken(refreshToken)
    ]);
    console.log('✅ Both tokens saved successfully');
  } catch (error) {
    console.error('❌ Error saving tokens:', error);
    throw error;
  }
}

// Delete both tokens (logout)
export async function clearAllTokens(): Promise<void> {
  try {
    await Promise.all([
      deleteToken(),
      deleteRefreshToken()
    ]);
    console.log('✅ All tokens cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing tokens:', error);
    throw error;
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await getToken();
    return !!token;
  } catch (error) {
    console.error('❌ Error checking authentication:', error);
    return false;
  }
}

// Get token info (for debugging)
export async function getTokenInfo(): Promise<{
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
}> {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      getToken(),
      getRefreshToken()
    ]);
    
    const info = {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    };
    
    console.log('ℹ️ Token info:', info);
    return info;
  } catch (error) {
    console.error('❌ Error getting token info:', error);
    return { hasAccessToken: false, hasRefreshToken: false };
  }
}