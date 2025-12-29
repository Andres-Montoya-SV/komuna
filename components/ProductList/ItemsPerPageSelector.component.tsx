'use client';

interface ItemsPerPageSelectorProps {
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  options?: number[];
}

export default function ItemsPerPageSelector({
  itemsPerPage,
  onItemsPerPageChange,
  options = [8, 10, 20],
}: ItemsPerPageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-base-content/70">Show:</span>
      <select
        className="select select-bordered select-sm border-2 border-primary/20 focus:border-primary focus:outline-none bg-white"
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-sm text-base-content/70">per page</span>
    </div>
  );
}

