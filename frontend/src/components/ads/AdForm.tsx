import React, { useState } from 'react';
import { AdFormData } from '../../types';
import Button from '../common/Button';

interface AdFormProps {
  initialData?: Partial<AdFormData>;
  onSubmit: (data: AdFormData) => Promise<void>;
  submitLabel?: string;
}

const AdForm: React.FC<AdFormProps> = ({
  initialData = {},
  onSubmit,
  submitLabel = 'Submit Ad',
}) => {
  const [formData, setFormData] = useState<AdFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    video_url: initialData.video_url || '',
    brand: initialData.brand || '',
    industry: initialData.industry || '',
    tags: initialData.tags || [],
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to submit ad');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter ad title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Describe the advertisement"
        />
      </div>

      <div>
        <label htmlFor="video_url" className="block text-sm font-medium text-gray-300 mb-2">
          Video URL *
        </label>
        <input
          type="url"
          id="video_url"
          name="video_url"
          value={formData.video_url}
          onChange={handleChange}
          required
          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="https://youtube.com/watch?v=..."
        />
        <p className="text-gray-500 text-sm mt-1">
          Supports YouTube, Vimeo, and other video platforms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-300 mb-2">
            Brand *
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Brand name"
          />
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-2">
            Industry
          </label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Technology, Fashion"
          />
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Add tags"
          />
          <Button type="button" onClick={handleAddTag} variant="secondary">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags?.map((tag) => (
            <span
              key={tag}
              className="bg-dark-700 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-gray-500 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
};

export default AdForm;
