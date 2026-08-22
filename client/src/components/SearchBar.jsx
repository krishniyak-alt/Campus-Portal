import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ search, setSearch, onSearchSubmit }) => {
  const handleClear = () => {
    setSearch('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (onSearchSubmit) onSearchSubmit();
      }}
      className="relative w-full"
    >
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by item name, description, campus building..."
          className="w-full pl-11 pr-10 py-3.5 bg-white rounded-2xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm text-sm transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
