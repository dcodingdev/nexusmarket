"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/core/api/client";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const currentRating = watch("rating");

  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true);
    setError("");
    try {
      await apiClient<any>(`/products/${productId}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(
        err.message || "Failed to submit review. Are you a verified purchaser?"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-4 text-green-600 dark:text-green-400">
        <ShieldCheck className="h-8 w-8 shrink-0" />
        <div>
          <h4 className="font-semibold text-lg">Review Submitted!</h4>
          <p className="text-sm">Thank you for your verified purchase review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">Overall Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setValue("rating", star, { shouldValidate: true })}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-colors"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || currentRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30 hover:text-amber-400/50"
                  }`}
                />
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium mb-2">Your Review</label>
          <Textarea
            {...register("comment")}
            placeholder="What did you like or dislike? What is this product used for?"
            className="min-h-[120px] resize-y"
          />
          {errors.comment && (
            <p className="text-sm text-destructive mt-1">{errors.comment.message}</p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting || currentRating === 0}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </div>
  );
}

