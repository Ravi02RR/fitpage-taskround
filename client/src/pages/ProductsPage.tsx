import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useApi } from "../contexts/ApiContext";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";

interface ProductsPageProps {
  onViewProduct: (product: Product) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ onViewProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { fetchProducts } = useApi();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadProducts}
            className="mt-2 text-red-600 hover:text-red-500 font-medium text-sm"
          >
            Try again
          </button>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500">No products available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
