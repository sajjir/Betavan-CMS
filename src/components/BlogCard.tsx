import React from "react";
import { Link } from "react-router-dom";
import { Post } from "../types.js";
import { Calendar, User, BookOpen } from "lucide-react";

interface BlogCardProps {
  post: Post;
}

export function BlogCard({ post }: BlogCardProps) {
  const coverUrl = post.coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97";
  const formattedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Draft";

  return (
    <article className="group bg-white rounded-2xl border border-neutral-150 hover:border-brand/30 hover:shadow-lg transition-all overflow-hidden flex flex-col h-full">
      
      {/* Cover Image */}
      <Link to={`/blog/${post.slug}`} className="relative block aspect-video overflow-hidden bg-neutral-100">
        <img 
          src={coverUrl} 
          alt={post.title} 
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        {post.category && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-xs font-semibold px-3 py-1 rounded-full text-brand shadow-sm">
            {post.category.name}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Metadata */}
          <div className="flex items-center space-x-3.5 text-xs font-mono text-neutral-400">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" /> {formattedDate}
            </span>
            <span className="flex items-center">
              <User className="w-3.5 h-3.5 mr-1" /> {post.author?.name || "Editor"}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-neutral-900 group-hover:text-brand transition-colors tracking-tight line-clamp-2">
            <Link to={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-neutral-500 text-sm line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5.5 pt-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {post.tags?.slice(0, 2).map(tag => (
              <span key={tag.id} className="text-[10px] font-mono text-neutral-400">
                #{tag.name}
              </span>
            ))}
          </div>
          <Link 
            to={`/blog/${post.slug}`} 
            className="text-xs font-bold text-neutral-900 hover:text-brand flex items-center group/btn"
          >
            Read Article <BookOpen className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>

    </article>
  );
}
