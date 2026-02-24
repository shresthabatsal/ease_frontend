"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { Category, resolveImg } from "@/components/ProductCard";

interface CategoryCardProps {
  category: Category;
  storeId: string;
}

export default function CategoryCard({ category, storeId }: CategoryCardProps) {
  const imgSrc = resolveImg(category.categoryImage);

  return (
    <Link
      href={`/category/${
        category._id
      }?storeId=${storeId}&catName=${encodeURIComponent(category.name)}`}
      className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white hover:border-amber-300 hover:shadow-md transition-all duration-200 flex flex-col aspect-[4/3]"
    >
      {/* Image */}
      <div className="flex-1 overflow-hidden bg-slate-50 flex items-center justify-center">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <LayoutGrid size={28} className="text-slate-300" />
        )}
      </div>

      {/* Name strip */}
      <div className="px-2.5 py-2 bg-white border-t border-slate-100 flex-shrink-0">
        <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-amber-600 transition-colors">
          {category.name}
        </p>
      </div>

      {/* Hover ring */}
      <div className="absolute inset-0 ring-2 ring-inset ring-transparent group-hover:ring-amber-300 rounded-2xl transition-all pointer-events-none" />
    </Link>
  );
}
