import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Laptop, Shirt, Home, Coffee, Book, Music, Gamepad, Dumbbell } from "lucide-react";

const categories = [
  { name: "Electronics", icon: Laptop, color: "bg-blue-500/10 text-blue-500" },
  { name: "Clothing", icon: Shirt, color: "bg-pink-500/10 text-pink-500" },
  { name: "Home & Garden", icon: Home, color: "bg-green-500/10 text-green-500" },
  { name: "Food & Beverage", icon: Coffee, color: "bg-orange-500/10 text-orange-500" },
  { name: "Books", icon: Book, color: "bg-purple-500/10 text-purple-500" },
  { name: "Music", icon: Music, color: "bg-indigo-500/10 text-indigo-500" },
  { name: "Gaming", icon: Gamepad, color: "bg-red-500/10 text-red-500" },
  { name: "Sports", icon: Dumbbell, color: "bg-teal-500/10 text-teal-500" },
];

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Shop by Category</h1>
        <p className="text-lg text-muted-foreground">
          Explore our wide selection of products organized by category to find exactly what you're looking for.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.name} 
            href={`/products?category=${encodeURIComponent(category.name.toLowerCase())}`}
            className="group flex flex-col items-center justify-center p-8 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className={`p-4 rounded-full mb-4 transition-transform group-hover:scale-110 ${category.color}`}>
              <category.icon className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-lg">{category.name}</h3>
            <span className="text-sm text-muted-foreground flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              View Items <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link href="/products">
          <Button size="lg" className="px-8">
            View All Products
          </Button>
        </Link>
      </div>
    </div>
  );
}
