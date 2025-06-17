export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  createdAt: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating?: number;
  comment?: string;
  createdAt: string;
  user?: {
    fullName: string;
  };
  product?: Product;
  photos?: ReviewPhoto[];
}

export interface ReviewPhoto {
  id: string;
  reviewId: string;
  url: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}