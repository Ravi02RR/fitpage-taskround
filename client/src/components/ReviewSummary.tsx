import React, { useState, useEffect } from 'react';
import { Brain, Loader, AlertCircle } from 'lucide-react';
import { useApi } from '../contexts/ApiContext';
import { MarkdownPreview } from "react-markdown-preview";

interface ReviewSummaryProps {
  productId: string;
  reviewCount: number;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ productId, reviewCount }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { fetchReviewSummary } = useApi();

  useEffect(() => {
    if (reviewCount > 0) {
      generateSummary();
    }
  }, [productId, reviewCount]);

  const generateSummary = async () => {
    if (reviewCount === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const summaryText = await fetchReviewSummary(productId);
      setSummary(summaryText);
    } catch (err) {
      setError('Failed to generate summary');
      console.error('Summary generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (reviewCount === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Brain className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Review Summary</h3>
          <p className="text-sm text-gray-600">
            Insights from {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
        {!loading && !error && (
          <button
            onClick={generateSummary}
            className="ml-auto px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center space-x-3 py-4">
          <Loader className="h-5 w-5 text-purple-600 animate-spin" />
          <span className="text-gray-600">Generating AI summary...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-3 py-4 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <button
            onClick={generateSummary}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {summary && !loading && !error && (
        <div className="prose prose-sm max-w-none">
          <div className="bg-white rounded-md p-4 border border-purple-100">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              <MarkdownPreview doc={summary} />
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSummary;