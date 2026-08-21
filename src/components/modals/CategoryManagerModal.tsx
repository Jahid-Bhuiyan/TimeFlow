import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tag, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  RotateCcw, 
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Palette
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CategoryInfo } from '../../types';
import { getAutoCategoryColor } from '../../utils/categories';

export const CategoryManagerModal: React.FC = () => {
  const { 
    isCategoryModalOpen, 
    closeCategoryModal, 
    categories, 
    categoryList, 
    editingCategory, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    resetCategoriesToDefault
  } = useApp();

  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [name, setName] = useState('');
  const [isProductive, setIsProductive] = useState(true);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // Automatically compute color based on name and category type
  const autoColor = getAutoCategoryColor(name, isProductive);

  useEffect(() => {
    if (editingCategory) {
      setEditId(editingCategory.id);
      setName(editingCategory.name);
      setIsProductive(editingCategory.isProductive);
      setDescription(editingCategory.description || '');
      setActiveTab('create');
    } else {
      resetForm();
    }
  }, [editingCategory, isCategoryModalOpen]);

  const resetForm = () => {
    setEditId(null);
    setName('');
    setIsProductive(true);
    setDescription('');
    setError('');
  };

  const handleStartEdit = (cat: CategoryInfo) => {
    setEditId(cat.id);
    setName(cat.name);
    setIsProductive(cat.isProductive);
    setDescription(cat.description || '');
    setActiveTab('create');
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a category name.');
      return;
    }

    const assignedColor = getAutoCategoryColor(name, isProductive);

    if (editId) {
      updateCategory(editId, {
        name: name.trim(),
        isProductive,
        color: assignedColor,
        description: description.trim()
      });
      setSuccessMessage(`Updated "${name.trim()}" successfully!`);
    } else {
      addCategory({
        name: name.trim(),
        isProductive,
        color: assignedColor,
        description: description.trim()
      });
      setSuccessMessage(`Added "${name.trim()}" to categories!`);
    }

    resetForm();
    setTimeout(() => {
      setSuccessMessage('');
    }, 2500);
  };

  const handleDelete = (id: string, catName: string) => {
    if (categoryList.length <= 1) {
      setError('You must keep at least one category.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the "${catName}" category?`)) {
      deleteCategory(id);
      if (editId === id) {
        resetForm();
      }
    }
  };

  if (!isCategoryModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={closeCategoryModal}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-display">
              Category Manager
            </h2>
            <p className="text-xs text-zinc-400">
              Create, edit, or customize categories with automatic color palettes
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setError('');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {editId ? <Edit3 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{editId ? 'Edit Category' : 'Add New Category'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('list');
              setError('');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Categories ({categoryList.length})</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="E.g., Deep Coding, Client Work, Fitness, Social Media..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Productivity Type */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Category Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductive(true)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isProductive
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500 font-bold'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold">Productive Focus</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Counts towards daily target hours and positive stats
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsProductive(false)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      !isProductive
                        ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500 font-bold'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-xs font-bold">Distraction / Break</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Monitors leisure or time wasted for self-awareness
                    </p>
                  </button>
                </div>
              </div>

              {/* Notes / Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., High intensity deliverables, learning, side projects..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Live Preview Card with Auto-Color */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Live Preview (Automatic Color)
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <Palette className="w-3 h-3 text-blue-500" />
                    <span>Auto-harmonized</span>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors"
                    style={{
                      backgroundColor: `${autoColor}15`,
                      borderColor: `${autoColor}40`,
                      color: autoColor
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shadow-2xs" style={{ backgroundColor: autoColor }} />
                    <span>{name.trim() || 'Category Name'}</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {isProductive ? '• Productive Category' : '• Distraction / Leisure Category'}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editId ? 'Save Category' : 'Create Category'}</span>
                </button>
              </div>

            </form>
          ) : (
            <div className="space-y-4">
              
              {/* Category List */}
              <div className="space-y-2">
                {categoryList.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/60 flex items-center justify-between gap-3 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs" 
                        style={{ backgroundColor: cat.color }} 
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {cat.name}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            cat.isProductive 
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          }`}>
                            {cat.isProductive ? 'Productive' : 'Distraction'}
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        title="Edit Category"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reset to defaults button */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all categories to default setup?')) {
                      resetCategoriesToDefault();
                    }
                  }}
                  className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore Default Categories</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('create');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Category</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
