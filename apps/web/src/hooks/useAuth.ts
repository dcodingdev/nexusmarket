import { useAuthStore } from '../store/useAuthStore';
import { authClient } from '../lib/auth';
import { LoginInput, RegisterInput } from '@repo/api-contracts';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * useAuth Hook
 * Unified interface for authentication actions and state
 */
export const useAuth = () => {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const login = async (credentials: LoginInput) => {
    try {
      const { user, accessToken } = await authClient.login(credentials);
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      const { user } = await authClient.register(data);
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authClient.logout();
      clearAuth();
      router.push('/login');
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      clearAuth(); // Clear local state anyway
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    role: user?.role,
    isAdmin: user?.role === 'admin',
    isVendor: user?.role === 'vendor',
    isCustomer: user?.role === 'customer',
    login,
    register,
    logout,
  };
};
