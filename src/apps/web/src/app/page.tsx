"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { CreateListForm } from "@/components/lists/CreateListForm";
import { ListItems } from "@/components/lists/ListItems";
import { listApi } from "@/lib/api";

interface List {
  id: string;
  name: string;
  type: string;
  color: string;
  slug: string;
}

export default function Home() {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingList, setEditingList] = useState<Partial<List> | null>(null);

  const fetchLists = async () => {
    try {
      const response = await listApi.get("/lists");
      setLists(response.data);
    } catch (error) {
      console.error("Error fetching lists:", error);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleDeleteList = async (listId: string) => {
    if (!listId) {
      console.error("Invalid list ID");
      return;
    }

    try {
      await listApi.delete(`/lists/${listId}`);
      fetchLists();
      if (selectedList === listId) {
        setSelectedList(null);
      }
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const handleStartEdit = (list: List) => {
    setEditingListId(list.id);
    setEditingList({
      name: list.name,
      type: list.type,
      color: list.color,
      slug: list.slug,
    });
  };

  const handleCancelEdit = () => {
    setEditingListId(null);
    setEditingList(null);
  };

  const handleUpdateList = async (listId: string) => {
    if (!editingList || !editingList.name?.trim()) return;

    try {
      await listApi.put(`/lists/${listId}`, editingList);
      setEditingListId(null);
      setEditingList(null);
      fetchLists();
    } catch (error) {
      console.error("Error updating list:", error);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Lists</h1>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Cancel" : "Create New List"}
          </Button>
        </div>

        {showCreateForm && (
          <div className="mb-8">
            <CreateListForm
              onSuccess={() => {
                setShowCreateForm(false);
                fetchLists();
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-semibold mb-4">Lists</h2>
            <div className="space-y-2">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className={`p-4 rounded-lg shadow cursor-pointer transition-colors ${
                    selectedList === list.id
                      ? "border-2 border-white"
                      : "hover:opacity-90"
                  }`}
                  style={{
                    backgroundColor: list.color,
                    color: selectedList === list.id ? "white" : "inherit",
                  }}
                  onClick={() => setSelectedList(list.id)}
                >
                  {editingListId === list.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingList?.name || ""}
                        onChange={(e) =>
                          setEditingList({
                            ...editingList,
                            name: e.target.value,
                          })
                        }
                        placeholder="List name"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editingList?.type || ""}
                        onChange={(e) =>
                          setEditingList({
                            ...editingList,
                            type: e.target.value,
                          })
                        }
                        placeholder="List type"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                      />
                      <input
                        type="color"
                        value={editingList?.color || "#000000"}
                        onChange={(e) =>
                          setEditingList({
                            ...editingList,
                            color: e.target.value,
                          })
                        }
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingList?.slug || ""}
                        onChange={(e) =>
                          setEditingList({
                            ...editingList,
                            slug: e.target.value,
                          })
                        }
                        placeholder="List slug"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateList(list.id)}
                          disabled={!editingList?.name?.trim()}
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
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{list.name}</h3>
                        <p className="text-sm opacity-80">{list.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(list);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (list.id) {
                              handleDeleteList(list.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedList ? (
              <div>
                <h2 className="text-2xl font-semibold mb-4">List Items</h2>
                <ListItems listId={selectedList} />
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                Select a list to view its items
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
