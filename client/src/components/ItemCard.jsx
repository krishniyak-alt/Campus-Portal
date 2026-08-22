import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Tag, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const ItemCard = ({ item }) => {
  const isLost = item.type === 'lost';
  const isResolved = item.status === 'resolved' || item.status === 'claimed';

  const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col group"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4">
            <Tag className="w-12 h-12 stroke-[1.5] mb-2 opacity-50" />
            <span className="text-xs font-medium">No Image Uploaded</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {/* Lost/Found Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${
              isLost
                ? 'bg-rose-500/90 text-white'
                : 'bg-emerald-500/90 text-white'
            }`}
          >
            {item.type}
          </span>

          {/* Status Badge */}
          {isResolved && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm bg-blue-600/90 text-white flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{item.status}</span>
            </span>
          )}
        </div>

        {/* Category Pill */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/75 text-white backdrop-blur-md">
            {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-slate-600 text-sm line-clamp-2 mt-1.5 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Details Footer */}
        <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>

            <Link
              to={`/items/${item._id}`}
              className="inline-flex items-center space-x-1 font-semibold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-0.5 transition-transform"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
