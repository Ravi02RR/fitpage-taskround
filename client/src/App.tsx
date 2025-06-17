import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ApiProvider } from "./contexts/ApiContext";
import LoginForm from "./components/LoginForm";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { Product } from "./types";
import Navbar from "./components/Navbar";

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h1>Loading..</h1>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="products"  />
      <main>
        {selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            onBack={handleBackToProducts}
          />
        ) : (
          <ProductsPage onViewProduct={handleViewProduct} />
        )}
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "#10b981",
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "#ef4444",
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <AppContent />
      </ApiProvider>
    </AuthProvider>
  );
}

export default App;
