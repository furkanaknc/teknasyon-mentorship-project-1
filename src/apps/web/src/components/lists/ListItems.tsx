import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { listApi } from "@/lib/api";

interface ListItem {
  id: string;
  text: string;
  check: boolean;
  interval?: string;
}

interface ListItemsProps {
  listId: string;
}

export function ListItems({ listId }: ListItemsProps) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const fetchItems = async () => {
    try {
      const response = await listApi.get(`/list-items/list/${listId}`);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [listId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    setIsLoading(true);
    try {
      await listApi.post(`/list-items/list/${listId}`, {
        text: newItemText,
        check: false,
      });
      setNewItemText("");
      fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleItem = async (itemId: string, currentCheck: boolean) => {
    try {
      await listApi.put(`/list-items/${itemId}/toggle`);
      fetchItems();
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await listApi.delete(`/list-items/${itemId}`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleStartEdit = (item: ListItem) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingText("");
  };

  const handleUpdateItem = async (itemId: string) => {
    if (!editingText.trim()) return;

    try {
      await listApi.put(`/list-items/${itemId}`, {
        text: editingText,
      });
      setEditingItemId(null);
      setEditingText("");
      fetchItems();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddItem} className="flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add a new item..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add"}
        </Button>
      </form>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 p-3 bg-white rounded-lg shadow"
          >
            <input
              type="checkbox"
              checked={item.check}
              onChange={() => handleToggleItem(item.id, item.check)}
              className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            {editingItemId === item.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => handleUpdateItem(item.id)}
                  disabled={!editingText.trim()}
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <span
                  className={`flex-1 ${item.check ? "line-through text-gray-500" : ""}`}
                >
                  {item.text}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStartEdit(item)}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
