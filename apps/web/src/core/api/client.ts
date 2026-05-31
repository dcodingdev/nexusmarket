import { useAuthStore } from '@/store/useAuthStore';
import { authClient } from '@/lib/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const { accessToken, setAuth, clearAuth, user } = useAuthStore.getState();
  
  const headers: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  let response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (response.status === 403 || response.status === 401) {
    const errorBody = await response.clone().json().catch(() => ({}));
    if (errorBody.message === 'Invalid token' || errorBody.message === 'Unauthorized') {
      let tokenToUse: string;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshData = await authClient.refresh();
          tokenToUse = refreshData.accessToken;
          
          if (user) {
            setAuth(user, tokenToUse);
          }
          isRefreshing = false;
          onRefreshed(tokenToUse);
        } catch (refreshError) {
          isRefreshing = false;
          clearAuth();
          throw new Error('Session expired. Please log in again.');
        }
      } else {
        tokenToUse = await new Promise<string>((resolve) => {
          subscribeTokenRefresh((token) => resolve(token));
        });
      }

      // Retry with the new token
      response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...headers,
          Authorization: `Bearer ${tokenToUse}`,
        },
      });
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`;
    try {
      const error = await response.json();
      if (error && error.message) {
        errorMessage = error.message;
      }
    } catch (e) {
      if (response.status === 502) {
        errorMessage = "Bad Gateway: Nginx could not reach the backend service. Please check if the container is running.";
      } else if (response.status === 504) {
        errorMessage = "Gateway Timeout: The backend service took too long to respond.";
      } else {
        errorMessage = `HTTP request failed with status: ${response.status}`;
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

