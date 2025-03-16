import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Goal, TimeFrame } from "@/lib/types";
import { getCategories } from "@/lib/storage";
import { Category } from "@/lib/types";

interface GoalFormProps {
  onSubmit: (goal: any) => void;
  onCancel: () => void;
  initialData?: Goal;
  isEditing?: boolean;
  defaultTimeFrame?: TimeFrame;
  defaultTargetDate?: Date;
}

const formSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters" })
    .max(100),
  description: z.string().optional(),
  targetValue: z.coerce
    .number()
    .positive({ message: "Target value must be positive" }),
  currentValue: z.coerce
    .number()
    .min(0, { message: "Current value cannot be negative" })
    .optional(),
  startDate: z.date(),
  targetDate: z.date(),
  timeFrame: z.enum(["weekly", "monthly", "biannual", "annual"]),
  categoryId: z.string().optional(),
  reward: z.string().optional(),
});

const GoalForm = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  defaultTimeFrame = "weekly",
  defaultTargetDate,
}: GoalFormProps) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      targetValue: initialData?.targetValue || 0,
      currentValue: initialData?.currentValue || 0,
      startDate: initialData?.startDate
        ? new Date(initialData.startDate)
        : new Date(),
      targetDate: initialData?.targetDate
        ? new Date(initialData.targetDate)
        : defaultTargetDate || new Date(),
      timeFrame: initialData?.timeFrame || defaultTimeFrame,
      categoryId: initialData?.categoryId || undefined,
      reward: initialData?.reward || "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      // Calculate progress percentage based on current and target values
      progressPercentage:
        values.currentValue && values.targetValue
          ? Math.min(
              100,
              Math.round((values.currentValue / values.targetValue) * 100),
            )
          : 0,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter goal title" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your goal and what you want to achieve"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="targetValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Value ($)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormDescription>
                  The financial goal you want to reach
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {isEditing && (
            <FormField
              control={form.control}
              name="currentValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Value ($)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your current progress toward the goal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Target Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="timeFrame"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Frame</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time frame" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="biannual">6 Months</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reward"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="What will you reward yourself with when you achieve this goal?"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Define a reward to motivate yourself
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEditing ? "Update" : "Create"} Goal</Button>
        </div>
      </form>
    </Form>
  );
};

export default GoalForm;
