import React, { useState, useEffect } from "react";
import { ArrowLeft, Star, MessageCircle, User, DollarSign } from "lucide-react";
import { useApi } from "../contexts/ApiContext";
import { useAuth } from "../contexts/AuthContext";
import { Product, Review } from "../types";
import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";
import ReviewSummary from "../components/ReviewSummary";

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product: initialProduct,
  onBack,
}) => {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const { fetchProductById, submitReview } = useApi();
  const { user } = useAuth();

  useEffect(() => {
    loadProductDetails();
  }, [initialProduct.id]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const data = await fetchProductById(initialProduct.id);
      setProduct(data);
    } catch (err) {
      console.error("Failed to load product details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (review: {
    rating?: number;
    comment?: string;
    photos?: File[];
  }) => {
    try {
      setReviewLoading(true);
      await submitReview(product.id, review);
      // Reload product to get updated reviews
      await loadProductDetails();
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setReviewLoading(false);
    }
  };

  const averageRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
        product.reviews.length
      : 0;

  const reviewCount = product.reviews?.length || 0;
  const userHasReviewed =
    product.reviews?.some((review) => review.userId === user?.id) || false;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count =
      product.reviews?.filter((r) => r.rating === rating).length || 0;
    const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Products</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg overflow-hidden aspect-square">
          <img
            src={`https://images.pexels.com/photos/${
              Math.floor(Math.random() * 1000) + 1000
            }/pexels-photo-${
              Math.floor(Math.random() * 1000) + 1000
            }.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop`}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop`;
            }}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description ||
                "No description available for this product."}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-6 w-6 text-green-600" />
              <span className="text-3xl font-bold text-green-600">
                {product.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Rating Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div
                    key={rating}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <span className="w-3 text-gray-600">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-gray-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewSummary productId={product.id} reviewCount={reviewCount} />

      {/* Review Form */}
      <div className="mb-12">
        <ReviewForm
          onSubmit={handleSubmitReview}
          loading={reviewLoading}
          userHasReviewed={userHasReviewed}
        />
      </div>

      {/* Reviews */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <MessageCircle className="h-6 w-6 text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Reviews ({reviewCount})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <h1>Loading...</h1>
          </div>
        ) : product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-500">
              Be the first to share your thoughts about this product!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
