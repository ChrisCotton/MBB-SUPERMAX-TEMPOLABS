import React, { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import CategoryForm from "./CategoryForm";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

import { Category } from "@/lib/types";

interface CategoryListProps {
  categories?: Category[];
  onEdit?: (category: Category) => void;
  onDelete?: (id: string) => void;
  onAdd?: (category: Omit<Category, "id">) => void;
}

const CategoryList = ({
  categories: initialCategories = [
    { id: "1", name: "Work", hourlyRate: 50, tasksCount: 5 },
    { id: "2", name: "Personal Development", hourlyRate: 35, tasksCount: 3 },
    { id: "3", name: "Health", hourlyRate: 40, tasksCount: 2 },
    { id: "4", name: "Family", hourlyRate: 45, tasksCount: 0 },
  ],
  onEdit = () => {},
  onDelete = () => {},
  onAdd = () => {},
}: CategoryListProps) => {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  // Import CategoryForm directly
  const handleFormSubmit = (values: { name: string; hourlyRate: number }) => {
    if (selectedCategory) {
      onEdit({ ...selectedCategory, ...values });
    } else {
      onAdd(values);
    }
  };

  return (
    <Card className="w-full glass-card-inner">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categories</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={handleFormSubmit}
              onCancel={() => {
                const dialog = document.querySelector('[role="dialog"]');
                if (dialog) {
                  (dialog as HTMLElement)
                    .querySelector('button[aria-label="Close"]')
                    ?.click();
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-white/10 bg-transparent">
          <Table>
            <TableHeader>
              <TableRow className="bg-transparent hover:bg-white/5">
                <TableHead
                  className="cursor-pointer"
                  onClick={() => {
                    const newCategories = [...categories].sort((a, b) =>
                      a.name.localeCompare(b.name),
                    );
                    setCategories(newCategories);
                  }}
                >
                  Name
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => {
                    const newCategories = [...categories].sort(
                      (a, b) => b.hourlyRate - a.hourlyRate,
                    );
                    setCategories(newCategories);
                  }}
                >
                  Default Hourly Rate
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => {
                    const newCategories = [...categories].sort(
                      (a, b) => (b.tasksCount || 0) - (a.tasksCount || 0),
                    );
                    setCategories(newCategories);
                  }}
                >
                  Associated Tasks
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow className="bg-transparent hover:bg-white/5">
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground bg-transparent"
                  >
                    No categories found. Add your first category to get started.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="bg-transparent hover:bg-white/5"
                  >
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>${category.hourlyRate.toFixed(2)}/hr</TableCell>
                    <TableCell>{category.tasksCount || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Category</DialogTitle>
                            </DialogHeader>
                            <CategoryForm
                              category={selectedCategory || undefined}
                              onSubmit={handleFormSubmit}
                              onCancel={() => {
                                const dialog =
                                  document.querySelector('[role="dialog"]');
                                if (dialog) {
                                  (dialog as HTMLElement)
                                    .querySelector('button[aria-label="Close"]')
                                    ?.click();
                                }
                                setSelectedCategory(null);
                              }}
                            />
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCategoryToDelete(category)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Category
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {category.tasksCount && category.tasksCount > 0
                                  ? `This category has ${category.tasksCount} associated tasks. Deleting it will require reassigning these tasks.`
                                  : "Are you sure you want to delete this category? This action cannot be undone."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => onDelete(category.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryList;
