import React from 'react';
import { ServiceType, REVIEWS } from '../types';
import { MessageCircle, Send, Star, LogIn } from 'lucide-react';

interface ReviewsChatProps {
  activeService: ServiceType;
}

const ReviewsChat: React.FC<ReviewsChatProps> = ({ activeService }) => {
  const isBvo = activeService === 'bvo';

  const accentColor = isBvo ? 'text-bvo-green-light' : 'text-gbo-red-light';
  const accentBg = isBvo ? 'bg-bvo-green/10' : 'bg-gbo-red/10';
  const accentBorder = isBvo ? 'border-bvo-green/30' : 'border-gbo-red/30';

  const telegramUrl = 'https://t.me/GboBvkChat';

  return (
    <div className="space-y-4 pb-6">
      <div className={`card mx-4 border-l-4 ${accentBorder}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${accentBg} flex items-center justify-center`}>
            <MessageCircle className={`w-6 h-6 ${accentColor}`} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Общий Telegram-чат</h3>
            <p className="text-sm text-gray-400">Сообщество автовладельцев BVK и МирГбо</p>
          </div>
        </div>
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
            isBvo
              ? 'bg-gradient-to-r from-bvo-green to-bvo-green-light text-white neon-green'
              : 'bg-gradient-to-r from-gbo-red to-gbo-red-light text-white neon-red'
          }`}
        >
          <Send className="w-5 h-5" />
          Перейти в чат
        </a>
      </div>

      {/* Add review button */}
      <div className="px-4">
        <button
          className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
            isBvo
              ? 'bg-bvo-green/20 text-bvo-green-light hover:bg-bvo-green/30'
              : 'bg-gbo-red/20 text-gbo-red-light hover:bg-gbo-red/30'
          }`}
        >
          <LogIn className="w-5 h-5" />
          Оставить отзыв
        </button>
      </div>

      {/* Reviews list */}
      <div className="px-4 space-y-3">
        {REVIEWS.map((review) => (
          <div key={review.id} className="card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-300 font-bold">
                {review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-200">{review.name}</p>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-300 text-sm mt-2">{review.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsChat;
