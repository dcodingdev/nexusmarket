"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
  });

  useEffect(() => {
    setMounted(true);
    if (user) {
      reset({
        name: user.name || "",
        street: (user as any).address?.street || "",
        city: (user as any).address?.city || "",
        state: (user as any).address?.state || "",
        zip: (user as any).address?.zip || "",
        country: (user as any).address?.country || "",
      });
    }
  }, [user, reset]);

  if (!mounted) return null;

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    setMessage("");
    try {
      
      // Update local store
      updateUser({
        ...user!,
        name: data.name,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
        }
      } as any);

      setMessage("Profile updated successfully!");
    } catch (error: any) {
      setMessage(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Profile & Addresses
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and delivery address.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input {...register("name")} placeholder="John Doe" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input value={user?.email || ""} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Primary Delivery Address</h2>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Street Address</label>
            <Input {...register("street")} placeholder="123 Main St" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">City</label>
              <Input {...register("city")} placeholder="New York" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">State / Province</label>
              <Input {...register("state")} placeholder="NY" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Postal / Zip Code</label>
              <Input {...register("zip")} placeholder="10001" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Country</label>
              <Input {...register("country")} placeholder="United States" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          {message && (
            <span className={`text-sm ${message.includes("success") ? "text-green-500" : "text-destructive"}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

