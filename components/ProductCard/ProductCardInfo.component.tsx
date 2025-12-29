import { MarketplaceItem, Service, Pet, Job } from '@/types/marketplace.types';

interface ProductCardInfoProps {
  name: string;
  description: string;
  rating?: number;
  reviews?: number;
  item?: MarketplaceItem;
}

export default function ProductCardInfo({ 
  name, 
  description, 
  rating, 
  reviews,
  item,
}: ProductCardInfoProps) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-accent fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-accent fill-current" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half-fill">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill="url(#half-fill)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-base-300 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  const getTypeSpecificInfo = () => {
    if (!item) return null;

    switch (item.type) {
      case 'service':
        const service = item as Service;
        return (
          <div className="text-xs text-base-content/70 mt-1">
            {service.duration && <span>⏱️ {service.duration}</span>}
          </div>
        );
      case 'pet':
        const pet = item as Pet;
        return (
          <div className="text-xs text-base-content/70 mt-1 flex gap-2 flex-wrap">
            {pet.breed && <span>🐾 {pet.breed}</span>}
            {pet.age && <span>📅 {pet.age}</span>}
            {pet.location && <span>📍 {pet.location}</span>}
          </div>
        );
      case 'job':
        const job = item as Job;
        return (
          <div className="text-xs text-base-content/70 mt-1 flex gap-2 flex-wrap">
            {job.employmentType && <span>💼 {job.employmentType}</span>}
            {job.location && <span>📍 {job.location}</span>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-base text-base-content line-clamp-2 leading-tight min-h-[2.5rem]">
        {name}
      </h2>
      <p className="text-xs text-base-content/60 line-clamp-2 leading-relaxed">
        {description}
      </p>
      {getTypeSpecificInfo()}
      {rating && (
        <div className="flex items-center gap-2 pt-1">
          {renderStars(rating)}
          <span className="text-xs font-medium text-base-content/70">
            {rating.toFixed(1)}
          </span>
          {reviews && (
            <span className="text-xs text-base-content/50">
              ({reviews.toLocaleString()})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

