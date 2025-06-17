import React from 'react';
import { Star, User, Calendar } from 'lucide-react';
import { Review } from '../types';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              {review.user?.fullName || 'Anonymous User'}
            </h4>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        
        {review.rating && (
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating!
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm font-medium text-gray-700 ml-1">
              {review.rating}/5
            </span>
          </div>
        )}
      </div>
      
      {review.comment && (
        <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.comment}</p>
      )}
      
      {review.photos && review.photos.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2 font-medium">Review Photos:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {review.photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt="Review photo"
                  className="w-40 h-40 object-contain rounded-md border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.open(photo.url, '_blank')}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-md transition-all duration-200"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;