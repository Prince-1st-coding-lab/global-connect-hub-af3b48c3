import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeo } from "@/hooks/useSeo";
import { useProductCategories, useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/shop/ProductCard";

export { ProductCard };

const ShopPage = () => {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const { data: categories = [] } = useProductCategories();
  const { data: products = [], isLoading, isError } = useProducts({ categoryId });

  useSeo({
    title: "Shop Furniture & Interior Products | Noble Spaces",
    description: "Browse and buy furniture, décor and interior products from Noble Spaces Rwanda — delivered across Kigali.",
    path: "/shop",
  });

  return (
    <div className="pt-28">
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <span className="text-xs uppercase tracking-[0.3em] text-gold">— Shop</span>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-tight lg:text-6xl">Our products</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Ready-made pieces from our workshop. Add to cart and check out with mobile money, bank transfer or cash on delivery.
        </p>

        {categories.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryId(null)}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                categoryId === null ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:text-gold"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                  categoryId === c.id ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:text-gold"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {isError ? (
          <p className="mt-16 rounded-3xl border border-destructive/30 p-12 text-center text-sm text-muted-foreground">
            We couldn't load products right now. Please refresh the page or try again shortly.
          </p>
        ) : (
          <>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-3xl" />)
                : products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {!isLoading && products.length === 0 && (
              <p className="mt-16 rounded-3xl border border-dashed border-gold/25 p-12 text-center text-sm text-muted-foreground">
                No products published yet — please check back soon.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default ShopPage;
