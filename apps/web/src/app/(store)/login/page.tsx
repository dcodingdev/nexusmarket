'use client';

import { useEffect, Suspense } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirect = searchParams.get('redirect');
  const safeRedirect = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : null;
  
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role?.toUpperCase();
      if (role === 'ADMIN') router.push('/admin');
      else if (role === 'VENDOR') router.push('/vendor');
      else if (safeRedirect) router.push(safeRedirect);
      else router.push('/');
    }
  }, [isAuthenticated, user, router, safeRedirect]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    await login(data);
  };

  const handleDemoLogin = async (role: 'customer' | 'vendor' | 'admin') => {
    const accounts = {
      admin: { email: 'admin@nexusmarket.com', password: 'admin123', name: 'Nexus Admin', role: 'admin' },
      vendor: { email: 'vendor@nexusmarket.com', password: 'password123', name: 'Nexus Vendor', role: 'vendor' },
      customer: { email: 'customer@nexusmarket.com', password: 'password123', name: 'Nexus Customer', role: 'customer' }
    };
    const account = accounts[role];
    form.setValue('email', account.email);
    form.setValue('password', account.password);
    
    try {
      await login({ email: account.email, password: account.password });
    } catch (err: any) {
      if (role !== 'admin') {
        try {
          const regRes = await fetch('http://localhost:8000/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(account),
          });
          if (regRes.ok) {
            await login({ email: account.email, password: account.password });
            return;
          }
        } catch (regErr) {
          console.error(regErr);
        }
      }
      form.setError('root', { message: err.message || 'Login failed' });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>

        <div className="bg-card border border-border p-8 rounded-3xl shadow-xl shadow-primary/5 space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="name@example.com"
                  className="pl-10 h-12 bg-muted/30 border-transparent focus:border-primary transition-all rounded-xl"
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-muted/30 border-transparent focus:border-primary transition-all rounded-xl"
                  {...form.register('password')}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-bold text-lg transition-all active:scale-[0.98]"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Demo Quick Login</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleDemoLogin('customer')}
              className="text-[10px] h-10 px-1 font-bold border-indigo-500/20 hover:bg-indigo-500/5 hover:border-indigo-500/40 transition-all rounded-xl"
            >
              👤 Customer
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleDemoLogin('vendor')}
              className="text-[10px] h-10 px-1 font-bold border-violet-500/20 hover:bg-violet-500/5 hover:border-violet-500/40 transition-all rounded-xl"
            >
              🏪 Vendor
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleDemoLogin('admin')}
              className="text-[10px] h-10 px-1 font-bold border-blue-500/20 hover:bg-blue-500/5 hover:border-blue-500/40 transition-all rounded-xl"
            >
              🔑 Admin
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href={safeRedirect ? `/register?redirect=${encodeURIComponent(safeRedirect)}` : "/register"} className="text-primary font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
