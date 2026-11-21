"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Eye, EyeOff, GripVertical, Save, X } from "lucide-react";
import { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      setNewCategoryName("");
      loadCategories();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (cat: Category) => {
    try {
      await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cat),
      });
      setEditingCategory(null);
      loadCategories();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      loadCategories();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleVisibility = async (cat: Category) => {
    const updated = { ...cat, isVisible: !cat.isVisible };
    await handleUpdate(updated);
  };

  const handleReorder = async (newOrder: Category[]) => {
    setCategories(newOrder);
    try {
      await fetch("/api/admin/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: newOrder }),
      });
    } catch (e) {
      console.error(e);
      loadCategories();
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories Organizer</h1>
        <div className="flex gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="New category name..."
            className="bg-cinema-bg border border-cinema-border rounded px-4 py-2 text-white w-64"
          />
          <button onClick={handleCreate} className="bg-brand text-white px-4 py-2 rounded font-bold">
            <Plus className="inline mr-1" /> Add
          </button>
        </div>
      </div>

      <div className="bg-cinema-panel rounded-lg border border-cinema-border overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-cinema-border/50 font-bold text-sm text-gray-400">
          <div className="col-span-1">Order</div>
          <div className="col-span-6">Name</div>
          <div className="col-span-2">Movies</div>
          <div className="col-span-1">Visibility</div>
          <div className="col-span-2">Actions</div>
        </div>

        <SortableList
          items={categories}
          onReorder={handleReorder}
          renderItem={(cat, index) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              index={index}
              onToggleVisibility={handleToggleVisibility}
              onEdit={() => setEditingCategory(cat)}
              onDelete={() => handleDelete(cat.id)}
              onSave={(updated) => handleUpdate(updated)}
              onCancel={() => setEditingCategory(null)}
              isEditing={editingCategory?.id === cat.id}
            />
          )}
        />
      </div>
    </div>
  );
}

interface SortableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function moveItem<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  const newList = [...list];
  const [removed] = newList.splice(fromIndex, 1);
  newList.splice(toIndex, 0, removed);
  return newList;
}

function SortableList<T>({ items, onReorder, renderItem }: SortableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      const newItems = moveItem(items, draggedIndex, index);
      onReorder(newItems);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`transition-opacity ${draggedIndex === index ? "opacity-50" : ""}`}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

function CategoryRow({
  category,
  index,
  onToggleVisibility,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  isEditing,
}: {
  category: Category;
  index: number;
  onToggleVisibility: (cat: Category) => void;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (cat: Category) => void;
  onCancel: () => void;
  isEditing: boolean;
}) {
  const [editName, setEditName] = useState(category.name);
  const [editMovieIds, setEditMovieIds] = useState(category.movieIds.join(", "));

  if (isEditing) {
    return (
      <div className="grid grid-cols-12 gap-4 p-4 border-t border-cinema-border bg-brand/10">
        <div className="col-span-1 flex items-center">
          <GripVertical className="text-gray-500 cursor-grab" />
        </div>
        <div className="col-span-6">
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full bg-cinema-bg border border-cinema-border rounded px-3 py-2 text-white"
            autoFocus
          />
        </div>
        <div className="col-span-2">
          <input
            value={editMovieIds}
            onChange={(e) => setEditMovieIds(e.target.value)}
            placeholder="Comma-separated movie IDs"
            className="w-full bg-cinema-bg border border-cinema-border rounded px-3 py-2 text-white text-sm"
          />
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={category.isVisible}
              onChange={() => setEditName(editName)} // just to trigger
              className="w-4 h-4 accent-brand"
            />
            <span className="text-sm">Visible</span>
          </label>
        </div>
        <div className="col-span-2 flex gap-2">
          <button onClick={() => onSave({ ...category, name: editName, movieIds: editMovieIds.split(",").map(s => s.trim()).filter(Boolean) })} className="bg-brand text-white px-3 py-1 rounded text-sm">
            <Save size={14} />
          </button>
          <button onClick={onCancel} className="bg-gray-600 text-white px-3 py-1 rounded text-sm">
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 p-4 border-t border-cinema-border hover:bg-cinema-card/50">
      <div className="col-span-1 flex items-center">
        <GripVertical className="text-gray-500 cursor-grab" />
      </div>
      <div className="col-span-6 flex items-center">
        <span className="text-gray-400 mr-3">#{index + 1}</span>
        <span className="font-medium">{category.name}</span>
      </div>
      <div className="col-span-2 flex items-center text-sm text-gray-400">
        {category.movieIds.length} titles
      </div>
      <div className="col-span-1 flex items-center justify-center">
        <button
          onClick={() => onToggleVisibility(category)}
          className="p-2 rounded hover:bg-cinema-card transition"
          title={category.isVisible ? "Hide" : "Show"}
        >
          {category.isVisible ? <Eye className="text-green-400" size={20} /> : <EyeOff className="text-gray-500" size={20} />}
        </button>
      </div>
      <div className="col-span-2 flex gap-2">
        <button onClick={onEdit} className="p-2 text-gray-400 hover:text-white transition" title="Edit">
          <Edit size={18} />
        </button>
        <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-400 transition" title="Delete">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}