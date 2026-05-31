"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { authClient } from '@/lib/auth';
import { apiClient } from '@/core/api/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Store, Building2, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const storeSchema = z.object({
  // Shop
  shopName: z.string().min(3, 'Shop name must be at least 3 characters'),
  description: z.string().min(10, 'Please provide a brief description'),
  // Business
  taxId: z.string().min(5, 'Valid Tax ID required'),
});

type StoreFormValues = z.infer<typeof storeSchema>;

const STEPS = [
  { id: 1, title: 'Shop Info', icon: Store },
  { id: 2, title: 'Compliance', icon: Building2 },
];

export default function CreateStorePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { user, updateUser, accessToken } = useAuthStore();
  
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/create-store');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }
  const nextStep = async () => {
    const fieldsByStep: (keyof StoreFormValues)[][] = [
      ['shopName', 'description'],
      ['taxId'],
    ];
    
    const isValid = await form.trigger(fieldsByStep[currentStep - 1]);
    if (isValid) setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const onSubmit = async (data: StoreFormValues) => {
    try {
      // 1. Upgrade user to vendor in the backend
      const res = await apiClient<any>('/users/upgrade-to-vendor', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      // 2. Refresh the token to get the updated role
      // But wait, our apiClient manages token injection automatically!
      // authClient.refresh is used internally, or we can just fetch it manually if needed.
      // We need to update our local user store
      if (res.success && res.data) {
        updateUser(res.data);
      }
      
      toast.success("Congratulations! Your store is now live.");
      router.push('/vendor');
      
    } catch (error: any) {
      toast.error(error.message || "Failed to create store. Please try again.");
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-950/50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold">
            <Zap className="w-4 h-4" /> NexusMarket for Business
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Scale Your Business Globally
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Join thousands of vendors and reach millions of customers with our premium commerce infrastructure.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex justify-around items-center max-w-md mx-auto relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10 -translate-y-1/2" />
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-4 bg-white dark:bg-slate-900",
                  isCompleted ? "bg-green-500 border-green-500 text-white" : 
                  isActive ? "border-blue-500 text-blue-500 shadow-xl shadow-blue-500/20" : 
                  "border-slate-200 dark:border-slate-800 text-slate-400"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  isActive ? "text-blue-500" : "text-slate-400"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden max-w-2xl mx-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 md:p-12 space-y-8">
            
            {/* Step 1: Shop */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Store Branding</h2>
                  <p className="text-slate-500">Tell us about your shop and what you sell</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input id="shopName" placeholder="Elite Electronics" {...form.register('shopName')} className="h-12 rounded-xl" />
                  {form.formState.errors.shopName && <p className="text-xs text-red-500">{form.formState.errors.shopName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Store Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="We specialize in high-end mechanical keyboards and custom accessories..." 
                    className="min-h-[120px] rounded-xl"
                    {...form.register('description')}
                  />
                  {form.formState.errors.description && <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Business */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Business & Legal</h2>
                  <p className="text-slate-500">Required for payouts and tax compliance</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                  <Input id="taxId" placeholder="VAT-123456789" {...form.register('taxId')} className="h-12 rounded-xl" />
                  {form.formState.errors.taxId && <p className="text-xs text-red-500">{form.formState.errors.taxId.message}</p>}
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 flex gap-4">
                  <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Your data is encrypted and handled securely according to our <span className="font-bold underline cursor-pointer">Compliance Policy</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={prevStep}
                className={cn("h-12 rounded-xl gap-2", currentStep === 1 && "invisible")}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              
              {currentStep < STEPS.length ? (
                <Button type="button" onClick={nextStep} className="h-12 px-8 rounded-xl gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="h-12 px-8 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Processing...' : 'Complete Setup'}
                  <Globe className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

