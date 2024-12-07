'use client';

import React, { useState } from 'react';

interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  animationDuration?: number;
}

const AnimatedList = <T,>({ items, renderItem, animationDuration = 500 }: AnimatedListProps<T>) => {
  const [visibleItems, setVisibleItems] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadMoreItems = () => {
    if (visibleItems < items.length) {
      setIsLoading(true);
      setTimeout(() => {
        setVisibleItems((prev) => Math.min(prev + 10, items.length));
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="overflow-y-auto">
      {items.slice(0, visibleItems).map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-4 border-gray-300 border-t-4 border-t-green-500 rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && visibleItems < items.length && (
        <div className="flex justify-center py-4">
          <button
            onClick={loadMoreItems}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-blue-600"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default AnimatedList;
