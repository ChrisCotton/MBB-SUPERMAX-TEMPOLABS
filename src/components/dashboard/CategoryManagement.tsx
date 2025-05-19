import React, { useState, useEffect } from "react";
import {
  getCategories,
  saveCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import CategoryForm from "./CategoryForm";
import CategoryList from "./CategoryList";
import CategoryImport from "./CategoryImport";

import { Category } from "@/lib/types";

interface CategoryManagementProps {
  initialCategories?: Category[];
}

const CategoryManagement = ({
  initialCategories = [
    { id: "1", name: "Work", hourlyRate: 50, tasksCount: 5 },
    { id: "2", name: "Personal Development", hourlyRate: 35, tasksCount: 3 },
    { id: "3", name: "Health", hourlyRate: 40, tasksCount: 2 },
    { id: "4", name: "Family", hourlyRate: 45, tasksCount: 0 },
  ],
}: CategoryManagementProps) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  // Load categories from storage on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const storedCategories = await getCategories();
        if (storedCategories.length > 0) {
          setCategories(storedCategories);
        } else if (initialCategories.length > 0) {
          // If no stored categories but we have initial ones, save them
          await saveCategories(initialCategories);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();

    // Listen for data import events
    const handleDataImported = () => {
      loadCategories();
    };

    window.addEventListener("data-imported", handleDataImported);

    return () => {
      window.removeEventListener("data-imported", handleDataImported);
    };
  }, []);

  // Save categories to storage whenever they change
  useEffect(() => {
    const saveToStorage = async () => {
      await saveCategories(categories);
    };
    saveToStorage();
  }, [categories]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<string>("list");

  const handleAddCategory = async (categoryData: Omit<Category, "id">) => {
    try {
      const newCategory = await addCategory(categoryData);
      setCategories([...categories, newCategory]);
      setActiveTab("list");
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setActiveTab("edit");
  };

  const handleUpdateCategory = async (updatedData: Omit<Category, "id">) => {
    if (!selectedCategory) return;

    try {
      const updated = await updateCategory(selectedCategory.id, updatedData);
      if (updated) {
        const updatedCategories = categories.map((cat) =>
          cat.id === selectedCategory.id ? { ...cat, ...updatedData } : cat,
        );

        setCategories(updatedCategories);
      }

      setSelectedCategory(null);
      setActiveTab("list");
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const success = await deleteCategory(categoryId);
      if (success) {
        setCategories(categories.filter((cat) => cat.id !== categoryId));
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleCancelEdit = () => {
    setSelectedCategory(null);
    setActiveTab("list");
  };

  return (
    <Card className="w-full glass-card shadow-sm">
      <CardHeader className="border-b border-white/5">
        <CardTitle className="text-xl font-semibold glow-text">
          Category Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4 mb-6 bg-transparent border border-white/10">
            <TabsTrigger value="list">Categories</TabsTrigger>
            <TabsTrigger value="add">Add New</TabsTrigger>
            <TabsTrigger value="import">Import CSV</TabsTrigger>
            <TabsTrigger value="edit" disabled={!selectedCategory}>
              {selectedCategory ? "Edit Category" : "Edit"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 bg-transparent">
            <CategoryList
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onAdd={() => setActiveTab("add")}
            />
          </TabsContent>

          <TabsContent value="add" className="bg-transparent">
            <div className="flex justify-center">
              <CategoryForm
                onSubmit={handleAddCategory}
                onCancel={() => setActiveTab("list")}
              />
            </div>
          </TabsContent>

          <TabsContent value="import" className="bg-transparent">
            <div className="flex justify-center">
              <CategoryImport
                onImport={(importedCategories) => {
                  // Add each imported category
                  // Use Promise.all to wait for all categories to be added
                  Promise.all(importedCategories.map((cat) => addCategory(cat)))
                    .then((newCategories) => {
                      setCategories((prev) => [...prev, ...newCategories]);
                      // Trigger data-imported event
                      window.dispatchEvent(new CustomEvent("data-imported"));
                      setActiveTab("list");
                    })
                    .catch((error) => {
                      console.error("Error adding imported categories:", error);
                    });
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="edit" className="bg-transparent">
            {selectedCategory && (
              <div className="flex justify-center">
                <CategoryForm
                  category={selectedCategory}
                  onSubmit={handleUpdateCategory}
                  onCancel={handleCancelEdit}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CategoryManagement;
