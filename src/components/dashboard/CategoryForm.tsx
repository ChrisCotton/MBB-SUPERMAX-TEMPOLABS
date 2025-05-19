import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DollarSign, Save, X } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  hourlyRate: z.coerce.number().min(0, {
    message: "Hourly rate must be a positive number.",
  }),
});

type CategoryFormValues = z.infer<typeof formSchema>;

import { Category } from "@/lib/types";

interface CategoryFormProps {
  category?: Category;
  onSubmit?: (values: CategoryFormValues) => void;
  onCancel?: () => void;
}

const CategoryForm = ({
  category = {
    id: "",
    name: "",
    hourlyRate: 0,
  },
  onSubmit = () => {},
  onCancel = () => {},
}: CategoryFormProps) => {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category.name,
      hourlyRate: category.hourlyRate,
    },
  });

  const handleSubmit = (values: CategoryFormValues) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Card className="w-full max-w-md glass-card-inner p-6 shadow-md border border-white/10">
      <CardHeader>
        <CardTitle>
          {category.id ? "Edit Category" : "Create New Category"}
        </CardTitle>
        <CardDescription>
          {category.id
            ? "Update the category details below"
            : "Add a new category with a default hourly rate"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Consulting, Writing, Development"
                      className="glass-input"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a descriptive name for this category of work.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Hourly Rate ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-9 glass-input"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Set the default hourly rate for tasks in this category.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="flex justify-between px-0">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="glass-button"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" className="glass-button">
                <Save className="mr-2 h-4 w-4" />
                {category.id ? "Update" : "Create"} Category
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CategoryForm;
