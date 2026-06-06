import { useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

function StarRating({ value = 0, onChange, readonly = false, size = '1.25rem' }) {
  const [hoverValue, setHoverValue] = useState(0);
  const [animatingStar, setAnimatingStar] = useState(null);

  const handleClick = (starValue) => {
    if (readonly || !onChange) return;
    setAnimatingStar(starValue);
    onChange(starValue);
    setTimeout(() => setAnimatingStar(null), 300);
  };

  const handleMouseEnter = (starValue) => {
    if (readonly || !onChange) return;
    setHoverValue(starValue);
  };

  const handleMouseLeave = () => {
    if (readonly || !onChange) return;
    setHoverValue(0);
  };

  const displayValue = hoverValue || value;

  return (
    <div className="star-rating" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayValue;
        const isInteractive = !readonly && onChange;
        const isAnimating = animatingStar === star;

        return (
          <span
            key={star}
            className={`star ${isFilled ? 'filled' : ''} ${isInteractive ? 'interactive' : ''} ${isAnimating ? 'pop' : ''}`}
            style={{ fontSize: size }}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
          >
            {isFilled ? <FaStar /> : <FaRegStar />}
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;
