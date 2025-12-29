interface ProductCardImageProps {
  image: string;
  name: string;
  onClick?: () => void;
}

export default function ProductCardImage({ 
  image, 
  name, 
  onClick 
}: ProductCardImageProps) {
  return (
    <figure 
      className="cursor-pointer relative overflow-hidden bg-base-200 aspect-square"
      onClick={onClick}
    >
      <img 
        src={image} 
        alt={name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
        onError={(e) => {
          // Fallback image on error
          const target = e.target as HTMLImageElement;
          target.src = 'https://via.placeholder.com/400x400?text=No+Image';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </figure>
  );
}

