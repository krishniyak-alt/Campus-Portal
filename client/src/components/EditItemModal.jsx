import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Upload, Loader2, Tag, MapPin, Building } from 'lucide-react';
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

const EditItemModal = ({ item, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    description: '',
    location: '',
    currentLocation: '',
    date: '',
    time: '',
    status: 'active',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        category: item.category || 'Electronics',
        description: item.description || '',
        color: item.color || '',
        model: item.model || '',
        location: item.location || '',
        currentLocation: item.currentLocation || '',
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        time: item.time || '',
        status: item.status || 'active',
      });
      setImagePreview(item.image || null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

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
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('color', formData.color);
      data.append('model', formData.model);
      data.append('location', formData.location);
      data.append('currentLocation', formData.currentLocation || '');
      if (formData.date) data.append('date', formData.date);
      data.append('time', formData.time || '');
      data.append('status', formData.status);

      if (imageFile) {
        data.append('image', imageFile);
      }

      await API.put(`/items/${item._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Report updated successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8"
        >
          {/* Header */}
          <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <Edit className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold">Edit Item Report</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Item Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Color *
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g. Blue"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Brand / Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. Hydro Flask"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 capitalize"
                >
                  <option value="active">Active</option>
                  <option value="claimed">Claimed</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
              />
            </div>

            {item.type === 'found' && (
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Currently Kept At (Storage Location)
                </label>
                <input
                  type="text"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleChange}
                  placeholder="e.g. Main Security Desk, Dept Office..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Change Photo (Optional)
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex-1 cursor-pointer border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl p-3 text-center transition-colors">
                  <span className="text-xs text-slate-600 font-medium">
                    {imageFile ? imageFile.name : 'Choose new photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  />
                )}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditItemModal;
