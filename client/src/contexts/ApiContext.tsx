import React, { createContext, useContext, ReactNode } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { Product, Review, ApiResponse } from "../types";

interface ApiContextType {
  fetchProducts: () => Promise<Product[]>;
  fetchProductById: (id: string) => Promise<Product>;
  createProduct: (
    product: Omit<Product, "id" | "createdAt">
  ) => Promise<Product>;
  submitReview: (
    productId: string,
    review: { rating?: number; comment?: string; photos?: File[] }
  ) => Promise<Review>;
  fetchReviewSummary: (productId: string) => Promise<string>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const { token } = useAuth();

  const makeRequest = async <T,>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers.authorization = token;
    }

    try {
      const response = await fetch(`https://api-task.devguy.live${url}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
      throw error;
    }
  };

  const fetchProducts = async (): Promise<Product[]> => {
    try {
      return await makeRequest<Product[]>("/api/products/");
    } catch (error) {
      toast.error("Failed to load products");
      throw error;
    }
  };

  const fetchProductById = async (id: string): Promise<Product> => {
    try {
      return await makeRequest<Product>(
        `/api/products/get-product?productId=${id}`
      );
    } catch (error) {
      toast.error("Failed to load product details");
      throw error;
    }
  };

  const createProduct = async (
    product: Omit<Product, "id" | "createdAt">
  ): Promise<Product> => {
    try {
      const result = await makeRequest<Product>("/api/products/", {
        method: "POST",
        body: JSON.stringify(product),
      });
      toast.success("Product created successfully!");
      return result;
    } catch (error) {
      toast.error("Failed to create product");
      throw error;
    }
  };

  const submitReview = async (
    productId: string,
    review: { rating?: number; comment?: string; photos?: File[] }
  ): Promise<Review> => {
    try {
      const formData = new FormData();

     
      if (review.rating !== undefined) {
        formData.append("rating", String(review.rating));
      }

      if (review.comment) {
        formData.append("comment", review.comment);
      }

      if (review.photos?.length) {
        review.photos.forEach((photo) => {
          formData.append("photos", photo);
        });
      }

      const response = await makeRequest<Review>(
        `/api/actions/product/${productId}/review`,
        {
          method: "POST",
          body: formData,
        }
      );

      toast.success("Review submitted successfully!");
      return response;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit review");
      throw error;
    }
  };

  const fetchReviewSummary = async (productId: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://api-task.devguy.live/api/actions/product/review-summary?productId=${productId}`,
        {
          headers: {
            authorization: token || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }

      const reader = response.body?.getReader();
      let summary = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          summary += new TextDecoder().decode(value);
        }
      }

      return summary || "No summary available";
    } catch (error) {
      toast.error("Failed to generate review summary");
      throw error;
    }
  };

  const value: ApiContextType = {
    fetchProducts,
    fetchProductById,
    createProduct,
    submitReview,
    fetchReviewSummary,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
