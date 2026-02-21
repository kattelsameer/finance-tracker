import { useEffect, useState } from 'react';
import { tagService } from '../services/tag.service';
import type { Tag, CreateTagRequest, UpdateTagRequest } from '../types';
import {
  Tag as TagIcon,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  X,
  Search,
  Hash
} from 'lucide-react';

const TAG_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F43F5E', '#A855F7', '#0EA5E9', '#22C55E'
];

export function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreateTagRequest>({
    tagName: '',
    colorCode: TAG_COLORS[0]
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tagService.getAll();
      setTags(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingTag) {
        const updateData: UpdateTagRequest = {
          tagName: formData.tagName,
          colorCode: formData.colorCode
        };
        await tagService.update(editingTag.id, updateData);
      } else {
        await tagService.create(formData);
      }
      setShowModal(false);
      setEditingTag(null);
      resetForm();
      fetchTags();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await tagService.delete(id);
      setDeleteConfirm(null);
      fetchTags();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete tag');
    }
  };

  const openCreateModal = () => {
    setEditingTag(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      tagName: tag.tagName,
      colorCode: tag.colorCode
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      tagName: '',
      colorCode: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]
    });
  };

  const filteredTags = tags.filter(tag =>
    tag.tagName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
        <p className="mt-4 text-gray-500">Loading tags...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6 pt-6 pb-12">
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Search & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-sm hover:border-gray-300"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            Create Tag
          </button>
        </div>

        {/* Tags List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {filteredTags.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-5">
                <Hash className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No tags found' : 'No tags yet'}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                {searchTerm ? 'Try a different search term' : 'Create your first tag to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Create Tag
                </button>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="flex flex-wrap gap-3">
                {filteredTags.map(tag => (
                  <div
                    key={tag.id}
                    className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all hover:shadow-md"
                    style={{ 
                      backgroundColor: tag.colorCode + '15',
                      borderColor: tag.colorCode + '40'
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.colorCode }}
                    />
                    <span className="font-medium text-gray-800">{tag.tagName}</span>
                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(tag)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit tag"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(tag.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete tag"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Delete Confirmation */}
                    {deleteConfirm === tag.id && (
                      <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-lg border border-gray-200 z-10 min-w-48">
                        <p className="text-sm text-gray-600 mb-3">Delete this tag?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(tag.id)}
                            className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  {filteredTags.length} tag{filteredTags.length === 1 ? '' : 's'} total
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Usage Tips */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-teal-600" />
            Tag Usage Tips
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-1">•</span>
              Use tags to add extra context to transactions beyond categories
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-1">•</span>
              Apply multiple tags to a single transaction for flexible filtering
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-1">•</span>
              Create project-based tags like "Vacation 2024" or "Home Renovation"
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-1">•</span>
              Use tags for tax categories or reimbursable expenses
            </li>
          </ul>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" 
              onClick={() => setShowModal(false)}
              onKeyDown={(e) => e.key === 'Escape' && setShowModal(false)}
              role="button"
              tabIndex={-1}
              aria-label="Close modal"
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTag ? 'Edit Tag' : 'Create Tag'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tag Name</label>
                  <input
                    type="text"
                    value={formData.tagName}
                    onChange={(e) => setFormData({ ...formData, tagName: e.target.value })}
                    required
                    maxLength={50}
                    placeholder="Enter tag name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Color</label>
                  <div className="grid grid-cols-5 gap-3">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, colorCode: color })}
                        className={`w-12 h-12 rounded-xl transition-all ${
                          formData.colorCode === color
                            ? 'ring-4 ring-offset-2 ring-teal-500 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preview</label>
                  <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2"
                      style={{ 
                        backgroundColor: formData.colorCode + '15',
                        borderColor: formData.colorCode + '40'
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: formData.colorCode }}
                      />
                      <span className="font-medium text-gray-800">
                        {formData.tagName || 'Tag Name'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formData.tagName.trim()}
                    className="flex-1 px-4 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : editingTag ? 'Update Tag' : 'Create Tag'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
