import React from 'react';
import { Star, MessageCircle, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / product.reviews.length
    : 0;

  const reviewCount = product.reviews?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
        <img
          src={`https://images.pexels.com/photos/${Math.floor(Math.random() * 1000) + 1000}/pexels-photo-${Math.floor(Math.random() * 1000) + 1000}.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`;
          }}
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
          
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">
              ({averageRating.toFixed(1)})
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MessageCircle className="h-4 w-4" />
            <span>{reviewCount} reviews</span>
          </div>
          
          <button
            onClick={() => onViewDetails(product)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;