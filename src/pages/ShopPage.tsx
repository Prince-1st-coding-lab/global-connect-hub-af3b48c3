import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import { formatRwf, useProductCategories, useProducts, type Product } from "@/hooks/useProducts";

export const ProductCard = ({ product }: { product: Product }) => {
  const { add } = useCart();
  const image = product.images[0];
  const soldOut = product.stock <= 0;

  return (
    <article className="group overflow-hidden rounded-3xl border border-gold/15 bg-card transition-all hover:border-gold/50">
      <Link to={`/shop/${product.slug}`} className="block aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <img src={image} alt={product.name} loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
      </Link>
      <div className="space-y-3 p-5">
        <Link to={`/shop/${product.slug}`} className="block font-display text-lg leading-tight hover:text-gold">
          {product.name}
        </Link>
        {product.short_description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>
        )}
        <div className="flex items-center gap-2">
          <span className="font-display text-lg text-gold">{formatRwf(product.price)}</span>
          {product.compare_at_price ? (
            <span className="text-xs text-muted-foreground line-through">{formatRwf(product.compare_at_price)}</span>
          ) : null}
        </div>
        <Button
          size="sm"
          className="w-full"
          disabled={soldOut}
          onClick={() =>
            add({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image })
          }
        >
          <ShoppingBag className="mr-2 h-3.5 w-3.5" /> {soldOut ? "Sold out" : "Add to cart"}
        </Button>
      </div>
    </article>
  );
};

const ShopPage = () => {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const { data: categories = [] } = useProductCategories();
  const { data: products = [], isLoading } = useProducts({ categoryId });

  return (
    <div className="pt-28">
      <Helmet>
        <title>Shop Furniture & Interior Products | Noble Spaces</title>
        <meta name="description" content="Browse and buy furniture, décor and interior products from Noble Spaces Rwanda — delivered across Kigali." />
        <link rel="canonical" href="https://connect-localize-share.lovable.app/shop" />
      </Helmet>

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

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-3xl" />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {!isLoading && products.length === 0 && (
          <p className="mt-16 rounded-3xl border border-dashed border-gold/25 p-12 text-center text-sm text-muted-foreground">
            No products published yet — please check back soon.
          </p>
        )}
      </section>
    </div>
  );
};

export default ShopPage;
