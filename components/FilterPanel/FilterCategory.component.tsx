'use client';

interface FilterCategoryProps {
  categories: string[];
  selectedCategory?: string;
  onCategoryChange: (category?: string) => void;
}

export default function FilterCategory({
  categories,
  selectedCategory,
  onCategoryChange,
}: FilterCategoryProps) {
  return (
    <div>
      <h4 className="font-bold text-base mb-3 text-base-content">Category</h4>
      <div className="space-y-2">
        <label className="label cursor-pointer justify-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
          <input
            type="radio"
            name="category"
            className="radio radio-primary"
            checked={!selectedCategory}
            onChange={() => onCategoryChange(undefined)}
          />
          <span className="label-text font-medium">All Categories</span>
        </label>
        {categories.map((category) => (
          <label key={category} className="label cursor-pointer justify-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
            <input
              type="radio"
              name="category"
              className="radio radio-primary"
              checked={selectedCategory === category}
              onChange={() => onCategoryChange(category)}
            />
            <span className="label-text">{category}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

