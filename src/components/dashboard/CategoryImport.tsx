import React, { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Category } from "@/lib/types";

interface CategoryImportProps {
  onImport: (categories: Omit<Category, "id">[]) => void;
}

const CategoryImport = ({ onImport }: CategoryImportProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<Omit<Category, "id">[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    setPreview([]);

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if it's a CSV file
    if (
      selectedFile.type !== "text/csv" &&
      !selectedFile.name.endsWith(".csv")
    ) {
      setError("Please upload a CSV file");
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (csvFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/);

        // Skip empty lines
        const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

        if (nonEmptyLines.length === 0) {
          setError("The CSV file is empty");
          return;
        }

        // Skip header row if it exists
        const startIndex =
          nonEmptyLines[0].toLowerCase().includes("category") &&
          nonEmptyLines[0].toLowerCase().includes("rate")
            ? 1
            : 0;

        const parsedCategories: Omit<Category, "id">[] = [];
        const errors: string[] = [];

        // Process each line
        nonEmptyLines.slice(startIndex).forEach((line, index) => {
          // Handle quoted CSV values properly
          let values: string[] = [];
          let inQuote = false;
          let currentValue = "";

          // Parse CSV properly handling quoted values that may contain commas
          for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
              inQuote = !inQuote;
            } else if (char === "," && !inQuote) {
              values.push(currentValue.trim());
              currentValue = "";
            } else {
              currentValue += char;
            }
          }

          // Add the last value
          values.push(currentValue.trim());

          // Remove quotes from values
          values = values.map((val) => val.replace(/^"|"$/g, ""));

          if (values.length < 2) {
            errors.push(
              `Line ${index + startIndex + 1}: Not enough columns. Expected category name and hourly rate.`,
            );
            return;
          }

          const name = values[0];
          // Remove any commas and currency symbols before parsing
          const cleanedRateStr = values[1].replace(/[$,]/g, "");
          const hourlyRate = parseFloat(cleanedRateStr);

          if (name.length < 2) {
            errors.push(
              `Line ${index + startIndex + 1}: Category name must be at least 2 characters.`,
            );
            return;
          }

          if (isNaN(hourlyRate) || hourlyRate < 0) {
            errors.push(
              `Line ${index + startIndex + 1}: Invalid hourly rate. Must be a positive number.`,
            );
            return;
          }

          parsedCategories.push({
            name,
            hourlyRate,
          });
        });

        if (errors.length > 0) {
          setError(`Errors found in CSV file:\n${errors.join("\n")}`);
          return;
        }

        setPreview(parsedCategories);
        setSuccess(
          `Successfully parsed ${parsedCategories.length} categories from CSV.`,
        );
      } catch (err) {
        setError("Failed to parse CSV file. Please check the format.");
        console.error(err);
      }
    };

    reader.onerror = () => {
      setError("Error reading the file");
    };

    reader.readAsText(csvFile);
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      setSuccess(`Imported ${preview.length} categories successfully!`);
      setFile(null);
      setPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Trigger data-imported event to refresh categories across the app
      window.dispatchEvent(new CustomEvent("data-imported"));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    // Check if it's a CSV file
    if (droppedFile.type !== "text/csv" && !droppedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setFile(droppedFile);
    parseCSV(droppedFile);
  };

  const downloadSampleCSV = () => {
    window.open("/sample-categories.csv", "_blank");
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-card-inner p-6 shadow-md border border-white/10">
      <CardHeader>
        <CardTitle>Import Categories from CSV</CardTitle>
        <CardDescription>
          Upload a CSV file with category names and hourly rates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center cursor-pointer hover:bg-white/5 transition-colors bg-transparent"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium mb-1">
            {file ? file.name : "Drag and drop your CSV file here"}
          </p>
          <p className="text-xs text-muted-foreground">
            {file
              ? `${(file.size / 1024).toFixed(2)} KB`
              : "or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            CSV format: First column for category name, second column for hourly
            rate
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadSampleCSV}
            className="flex items-center gap-1 glass-button"
          >
            <Download className="h-4 w-4" />
            Download Sample CSV
          </Button>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="glass-card-inner border-red-500/50"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="whitespace-pre-line">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert
            variant="success"
            className="glass-card-inner border-green-500/50"
          >
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-500">Success</AlertTitle>
            <AlertDescription className="text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {preview.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">
              Preview ({preview.length} categories)
            </h3>
            <div className="max-h-40 overflow-y-auto border border-white/10 rounded-md">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-transparent">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Hourly Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-white/10">
                  {preview.map((category, index) => (
                    <tr key={index} className="bg-transparent hover:bg-white/5">
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                        {category.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-muted-foreground text-right">
                        ${category.hourlyRate.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFile(null);
            setError(null);
            setSuccess(null);
            setPreview([]);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
          className="glass-button"
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={preview.length === 0}
          onClick={handleImport}
          className="glass-button"
        >
          <FileText className="mr-2 h-4 w-4" />
          Import Categories
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryImport;
