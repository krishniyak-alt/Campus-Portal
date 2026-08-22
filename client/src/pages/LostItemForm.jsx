import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Upload, Calendar, Clock, MapPin, Tag, FileText, Loader2, Image as ImageIcon } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'ID Card',
  'Electronics',
  'Water Bottle',
  'Notebook',
  'Bag',
  'Keys',
  'Accessories',
  'Clothing',
  'Other',
];

const LostItemForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    description: '',
    color: '',
    model: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    contactPreference: 'portal',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.location || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('type', 'lost');
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('color', formData.color);
      data.append('model', formData.model);
      data.append('location', formData.location);
      data.append('date', formData.date);
      data.append('time', formData.time);
      data.append('contactPreference', formData.contactPreference);

      if (imageFile) {
        data.append('image', imageFile);
      }

      await API.post('/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Lost item report submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-8 text-white space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <PlusCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Report a Lost Item</h1>
              <p className="text-rose-100 text-xs sm:text-sm">
                Provide accurate details to help students and security locate your lost item.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
              Item Title / Name *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Blue Hydro Flask 32oz, AirPods Pro in White Case..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Primary Color (Used for Security Verification) *
              </label>
              <input
                type="text"
                name="color"
                required
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g. Blue, Black, Silver, Red..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Brand / Model / Unique Tag *
              </label>
              <input
                type="text"
                name="model"
                required
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. Hydro Flask, Apple AirPods Pro, Green tag..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Category *
              </label>
              <div className="relative flex items-center">
                <Tag className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Location Lost *
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Library 2nd Floor, Science Block B Bench..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Date Lost *
              </label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Approximate Time (Optional)
              </label>
              <div className="relative flex items-center">
                <Clock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="e.g. Around 2:30 PM, Afternoon"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
              Detailed Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Include color, brand, distinct marks, stickers, initial scratches, or contents inside..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
              Upload Photo / Reference Image (Optional)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full flex-1 cursor-pointer border-2 border-dashed border-slate-300 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/20 rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center space-y-2">
                <Upload className="w-8 h-8 text-slate-400" />
                <span className="text-sm text-slate-700 font-medium">
                  {imageFile ? imageFile.name : 'Click or drag image file to upload'}
                </span>
                <span className="text-xs text-slate-400">PNG, JPG, WEBP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 relative shrink-0 shadow-md">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  <span>Submit Lost Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LostItemForm;
