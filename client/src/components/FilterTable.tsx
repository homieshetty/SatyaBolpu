import { useState } from "react";
import { BlogCardProps } from "../types/globals";
import { BlogCard, BlogSkeletonCard } from "./BlogCard";
import CardList from "./CardList";

export type FilterTableProps = {
  filters: {
    name: string;
    endpoint: string;
    key: string;
  }[]
};

const FilterTable = ({ filters }: FilterTableProps) => {

  const [selected, setSelected] = useState<string>(filters[0].name);

  return (
    <div className="w-full flex flex-col gap-5">
      <div
        className="w-full flex text-primary gap-5"
      >
        {
          filters.map((filter, id) => (
            <div
              key={id}
              className={`relative after:content-[''] after:absolute after:h-1 cursor-pointer after:w-full
                after:top-full after:bg-white after:left-0 after:rounded-lg after:transition-all
                after:origin-center
                ${selected === filter.name ? 'after:scale-x-100' : 'after:scale-x-0'}`}
              onClick={() => setSelected(filter.name)}
            >
              {filter.name}
            </div>
          ))
        }
      </div>

      <div
        className="relative w-full flex items-center justify-center"
      >
        {
          filters.map((filter, id) => (
            <div
              key={id}
              className="top-0"
              style={{
                position: id === 0 ? 'relative' : 'absolute',
                opacity: selected === filter.name ? '1' : '0'
              }}
            >
              <CardList<BlogCardProps>
                Card={BlogCard}
                SkeletonCard={BlogSkeletonCard}
                orientation="column"
                apiEndpoint={filter.endpoint}
                dataKey={filter.key}
                searchBar={false}
                pagination={false}
              />
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default FilterTable;