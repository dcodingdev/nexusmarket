import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tag, Clock, Zap } from "lucide-react";

export default function DealsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-full mb-6 text-red-500">
          <Zap className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Daily Deals & Special Offers</h1>
        <p className="text-lg text-muted-foreground">
          Discover incredible savings on premium products. These limited-time offers won't last long, so grab them before they're gone!
        </p>
      </div>

      <div className="flex flex-col items-center justify-center p-12 text-center border border-border rounded-2xl bg-card">
        <Clock className="w-16 h-16 text-muted-foreground opacity-50 mb-6" />
        <h2 className="text-2xl font-bold mb-4">No active deals right now</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Check back soon! We update our special offers regularly with huge discounts on top-rated products.
        </p>
        <Link href="/products">
          <Button className="gap-2">
            <Tag className="w-4 h-4" />
            Shop Regular Items
          </Button>
        </Link>
      </div>
    </div>
  );
}

