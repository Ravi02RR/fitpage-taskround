import React, { useState } from "react";
import { Star, Send, Upload, X, Image } from "lucide-react";

interface ReviewFormProps {
  onSubmit: (review: {
    rating?: number;
    comment?: string;
    photos?: File[];
  }) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  userHasReviewed?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmit,
  loading = false,
  disabled = false,
  userHasReviewed = false,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0 && !comment.trim()) {
      alert("Please provide either a rating or a comment");
      return;
    }

    await onSubmit({
      rating: rating > 0 ? rating : undefined,
      comment: comment.trim() || undefined,
      photos: photos.length > 0 ? photos : undefined,
    });

    setRating(0);
    setComment("");
    setPhotos([]);
    setPhotoPreviews([]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 5;

    if (photos.length + files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} photos`);
      return;
    }

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        alert(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        alert(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setPhotos((prev) => [...prev, ...validFiles]);

      // Create previews
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotoPreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  if (userHasReviewed) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-blue-800">
          <Star className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Thank you for your review!</h3>
        </div>
        <p className="text-blue-700 mt-2">
          You have already reviewed this product. You can only submit one review
          per product.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Write a Review
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => !disabled && setRating(i + 1)}
              onMouseEnter={() => !disabled && setHoverRating(i + 1)}
              onMouseLeave={() => !disabled && setHoverRating(0)}
              disabled={disabled}
              className="focus:outline-none disabled:cursor-not-allowed"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : i < (hoverRating || rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300 hover:text-yellow-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-gray-600 ml-2">{rating}/5 stars</span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Comment
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={disabled}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Share your thoughts about this product..."
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos (Optional)
        </label>

        <div className="flex items-center space-x-4 mb-4">
          <label
            className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Upload className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Upload Photos</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={disabled}
              className="hidden"
            />
          </label>
          <span className="text-xs text-gray-500">Max 5 photos, 5MB each</span>
        </div>

        {photoPreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {photoPreviews.map((preview, index) => (
              <div key={index} className="relative group w-32 h-32">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-md border border-gray-200"
                  style={{ width: "128px", height: "128px" }}
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || disabled}
        className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="h-4 w-4" />
        <span>{loading ? "Submitting..." : "Submit Review"}</span>
      </button>
    </form>
  );
};

export default ReviewForm;
