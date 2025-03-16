import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { getCategories } from "@/lib/storage";
import { Category } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Please select a category." }),
  hourlyRate: z.string().min(1, { message: "Please enter an hourly rate." }),
  estimatedHours: z
    .string()
    .min(1, { message: "Please enter estimated hours." }),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional(),
  status: z.enum(["pending", "completed"]).default("pending"),
});

interface TaskFormProps {
  onSubmit?: (data: z.infer<typeof formSchema>) => void;
  onCancel?: () => void;
  initialData?: z.infer<typeof formSchema>;
  isEditing?: boolean;
}

const TaskForm = ({
  onSubmit = () => {},
  onCancel = () => {},
  initialData = {
    title: "",
    description: "",
    category: "",
    hourlyRate: "",
    estimatedHours: "",
    priority: "medium",
    dueDate: "",
    status: "pending",
  },
  isEditing = false,
}: TaskFormProps) => {
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories from storage
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const storedCategories = await getCategories();
        if (storedCategories.length > 0) {
          setCategories(storedCategories);
        } else {
          // Fallback to default categories if none are stored
          setCategories([
            {
              id: "1",
              name: "Personal Development",
              hourlyRate: 100,
              tasksCount: 0,
            },
            {
              id: "2",
              name: "Professional Skills",
              hourlyRate: 150,
              tasksCount: 0,
            },
            {
              id: "3",
              name: "Health & Wellness",
              hourlyRate: 120,
              tasksCount: 0,
            },
            {
              id: "4",
              name: "Financial Growth",
              hourlyRate: 200,
              tasksCount: 0,
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();
  }, []);

  // Refresh categories when the form is opened
  useEffect(() => {
    const refreshCategories = async () => {
      try {
        const updatedCategories = await getCategories();
        if (updatedCategories.length > 0) {
          setCategories(updatedCategories);
        }
      } catch (error) {
        console.error("Error refreshing categories:", error);
      }
    };

    refreshCategories();

    // Set up an interval to check for new categories
    const intervalId = setInterval(refreshCategories, 500);

    return () => clearInterval(intervalId);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
  };

  const handleCategoryChange = (value: string) => {
    const selectedCategory = categories.find((cat) => cat.id === value);
    if (selectedCategory) {
      form.setValue("hourlyRate", selectedCategory.hourlyRate.toString());
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-md">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Task" : "Add New Task"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description (optional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleCategoryChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Or type a new category"
                        onChange={(e) => {
                          // Don't create category yet, wait for blur
                        }}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            // Create a new category with the typed name
                            const newCategoryName = e.target.value.trim();
                            const hourlyRate =
                              parseFloat(form.getValues().hourlyRate) || 100;

                            // Import the addCategory function
                            import("@/lib/storage").then(
                              async ({ addCategory }) => {
                                try {
                                  const newCategory = await addCategory({
                                    name: newCategoryName,
                                    hourlyRate: hourlyRate,
                                  });

                                  // Update categories list immediately
                                  setCategories((prev) => [
                                    ...prev,
                                    newCategory,
                                  ]);

                                  // Select the new category
                                  field.onChange(newCategory.id);

                                  // Clear the input
                                  e.target.value = "";

                                  // Refresh categories from storage to ensure consistency
                                  const refreshedCategories =
                                    await getCategories();
                                  setCategories(refreshedCategories);
                                } catch (error) {
                                  console.error(
                                    "Error adding category:",
                                    error,
                                  );
                                }
                              },
                            );
                          }
                        }}
                      />
                    </div>
                  </div>
                  <FormDescription>
                    Select an existing category or type a new one
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <CardFooter className="px-0 pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Task" : "Add Task"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TaskForm;
