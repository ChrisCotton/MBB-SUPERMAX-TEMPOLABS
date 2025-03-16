import React, { useState } from "react";
import { Download, Upload, FileText, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  getTasks,
  getCategories,
  saveTasks,
  saveCategories,
} from "@/lib/storage";
import { getMentalBankBalance, saveMentalBankBalance } from "@/lib/storage";
import { Task, Category, MentalBankBalance } from "@/lib/types";

const DataExportImport = () => {
  const [activeTab, setActiveTab] = useState("export");
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [exportType, setExportType] = useState<
    "all" | "tasks" | "categories" | "balance"
  >("all");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<
    "all" | "tasks" | "categories" | "balance"
  >("all");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Export data
  const handleExport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch data
      const tasks = await getTasks();
      const categories = await getCategories();
      const balance = await getMentalBankBalance();

      let dataToExport: any = {};
      let filename = "mental-bank-data";

      // Determine what data to export
      switch (exportType) {
        case "tasks":
          dataToExport = { tasks };
          filename = "mental-bank-tasks";
          break;
        case "categories":
          dataToExport = { categories };
          filename = "mental-bank-categories";
          break;
        case "balance":
          dataToExport = { balance };
          filename = "mental-bank-balance";
          break;
        case "all":
        default:
          dataToExport = { tasks, categories, balance };
          filename = "mental-bank-all-data";
          break;
      }

      // Format data based on selected format
      let fileContent: string;
      let mimeType: string;
      let fileExtension: string;

      if (exportFormat === "json") {
        fileContent = JSON.stringify(dataToExport, null, 2);
        mimeType = "application/json";
        fileExtension = "json";
      } else {
        // Convert to CSV
        fileContent = convertToCSV(dataToExport);
        mimeType = "text/csv";
        fileExtension = "csv";
      }

      // Create and download file
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(
        `Data exported successfully as ${fileExtension.toUpperCase()}`,
      );
    } catch (err) {
      console.error("Error exporting data:", err);
      setError("Failed to export data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Convert data to CSV format
  const convertToCSV = (data: any): string => {
    let csv = "";

    // Handle tasks
    if (data.tasks && data.tasks.length > 0) {
      csv += "TASKS\n";
      // Get headers from first task
      const taskHeaders = Object.keys(data.tasks[0]).join(",");
      csv += taskHeaders + "\n";

      // Add task rows
      data.tasks.forEach((task: Task) => {
        const values = Object.values(task)
          .map((value) => {
            // Handle values that might contain commas or quotes
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`; // Escape quotes
            }
            return value;
          })
          .join(",");
        csv += values + "\n";
      });
      csv += "\n";
    }

    // Handle categories
    if (data.categories && data.categories.length > 0) {
      csv += "CATEGORIES\n";
      // Get headers from first category
      const categoryHeaders = Object.keys(data.categories[0]).join(",");
      csv += categoryHeaders + "\n";

      // Add category rows
      data.categories.forEach((category: Category) => {
        const values = Object.values(category).join(",");
        csv += values + "\n";
      });
      csv += "\n";
    }

    // Handle balance
    if (data.balance) {
      csv += "BALANCE\n";
      const balanceHeaders = Object.keys(data.balance).join(",");
      csv += balanceHeaders + "\n";
      const balanceValues = Object.values(data.balance).join(",");
      csv += balanceValues + "\n";
    }

    return csv;
  };

  // Handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  // Import data
  const handleImport = async () => {
    if (!importFile) {
      setError("Please select a file to import");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const fileExtension = importFile.name.split(".").pop()?.toLowerCase();
      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          let importedData: any;

          // Parse file content based on file type
          if (fileExtension === "json") {
            importedData = JSON.parse(content);
          } else if (fileExtension === "csv") {
            importedData = parseCSV(content);

            // Add IDs to categories if they don't have them
            if (importedData.categories) {
              importedData.categories = importedData.categories.map(
                (category) => {
                  if (!category.id) {
                    return {
                      ...category,
                      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    };
                  }
                  return category;
                },
              );
            }
          } else {
            throw new Error("Unsupported file format. Please use JSON or CSV.");
          }

          // Import data based on selected type
          if (
            (importType === "all" || importType === "tasks") &&
            importedData.tasks
          ) {
            await saveTasks(importedData.tasks);
          }

          if (
            (importType === "all" || importType === "categories") &&
            importedData.categories
          ) {
            await saveCategories(importedData.categories);
            console.log("Categories imported:", importedData.categories);
          }

          if (
            (importType === "all" || importType === "balance") &&
            importedData.balance
          ) {
            await saveMentalBankBalance(importedData.balance);
          }

          setSuccess("Data imported successfully");

          // Trigger a refresh of the application data
          window.dispatchEvent(new CustomEvent("data-imported"));
        } catch (err) {
          console.error("Error processing import file:", err);
          setError(
            "Failed to process import file. Please check the file format.",
          );
        } finally {
          setIsLoading(false);
        }
      };

      fileReader.onerror = () => {
        setError("Error reading file");
        setIsLoading(false);
      };

      if (fileExtension === "json" || fileExtension === "csv") {
        fileReader.readAsText(importFile);
      } else {
        setError("Unsupported file format. Please use JSON or CSV.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error importing data:", err);
      setError("Failed to import data. Please try again.");
      setIsLoading(false);
    }
  };

  // Parse CSV content
  const parseCSV = (csvContent: string): any => {
    const result: any = {};
    const lines = csvContent.split("\n");
    let currentSection: string | null = null;
    let headers: string[] = [];
    let dataRows: any[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check for section headers
      if (line === "TASKS") {
        currentSection = "tasks";
        continue;
      } else if (line === "CATEGORIES") {
        // Save previous section if exists
        if (
          currentSection === "tasks" &&
          headers.length > 0 &&
          dataRows.length > 0
        ) {
          result.tasks = dataRows;
        }
        currentSection = "categories";
        headers = [];
        dataRows = [];
        continue;
      } else if (line === "BALANCE") {
        // Save previous section if exists
        if (
          currentSection === "categories" &&
          headers.length > 0 &&
          dataRows.length > 0
        ) {
          result.categories = dataRows;
        }
        currentSection = "balance";
        headers = [];
        dataRows = [];
        continue;
      }

      // Process headers and data rows
      if (currentSection) {
        if (headers.length === 0) {
          // This is a header row
          headers = parseCSVLine(line);
        } else {
          // This is a data row
          const values = parseCSVLine(line);
          if (values.length === headers.length) {
            const rowObject: any = {};
            headers.forEach((header, index) => {
              // Convert numeric strings to numbers
              if (!isNaN(Number(values[index])) && values[index] !== "") {
                rowObject[header] = Number(values[index]);
              } else if (values[index] === "true") {
                rowObject[header] = true;
              } else if (values[index] === "false") {
                rowObject[header] = false;
              } else {
                rowObject[header] = values[index];
              }
            });
            dataRows.push(rowObject);
          }
        }
      }
    }

    // Save the last section
    if (
      currentSection === "tasks" &&
      headers.length > 0 &&
      dataRows.length > 0
    ) {
      result.tasks = dataRows;
    } else if (
      currentSection === "categories" &&
      headers.length > 0 &&
      dataRows.length > 0
    ) {
      result.categories = dataRows;
    } else if (
      currentSection === "balance" &&
      headers.length > 0 &&
      dataRows.length > 0
    ) {
      result.balance = dataRows[0]; // Balance is just one row
    }

    return result;
  };

  // Parse a CSV line handling quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (i < line.length - 1 && line[i + 1] === '"') {
          // Double quotes inside quotes - add a single quote
          current += '"';
          i++; // Skip the next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // End of field
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    // Add the last field
    result.push(current);
    return result;
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Data Export & Import
        </CardTitle>
        <CardDescription>
          Export your data for backup or import data from other sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="import">Import Data</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Export Format</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={exportFormat === "json" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExportFormat("json")}
                  >
                    JSON
                  </Button>
                  <Button
                    variant={exportFormat === "csv" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExportFormat("csv")}
                  >
                    CSV
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">What to Export</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant={exportType === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExportType("all")}
                  >
                    All Data
                  </Button>
                  <Button
                    variant={exportType === "tasks" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExportType("tasks")}
                  >
                    Tasks Only
                  </Button>
                  <Button
                    variant={
                      exportType === "categories" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setExportType("categories")}
                  >
                    Categories Only
                  </Button>
                  <Button
                    variant={exportType === "balance" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExportType("balance")}
                  >
                    Balance Only
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Export Summary</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  You are about to export your{" "}
                  {exportType === "all"
                    ? "complete Mental Bank data"
                    : `Mental Bank ${exportType}`}{" "}
                  as a {exportFormat.toUpperCase()} file.
                </p>
                <p className="text-sm text-muted-foreground">
                  This file can be used for backup purposes or to transfer your
                  data to another system.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Select File to Import
                </h3>
                <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    id="import-file"
                    accept=".json,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium mb-1">
                      {importFile ? importFile.name : "Click to select a file"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {importFile
                        ? `${(importFile.size / 1024).toFixed(2)} KB`
                        : "Supported formats: JSON, CSV"}
                    </p>
                  </label>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">What to Import</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant={importType === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImportType("all")}
                  >
                    All Data
                  </Button>
                  <Button
                    variant={importType === "tasks" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImportType("tasks")}
                  >
                    Tasks Only
                  </Button>
                  <Button
                    variant={
                      importType === "categories" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setImportType("categories")}
                  >
                    Categories Only
                  </Button>
                  <Button
                    variant={importType === "balance" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImportType("balance")}
                  >
                    Balance Only
                  </Button>
                </div>
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Important</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Importing data will overwrite your existing{" "}
                  {importType === "all" ? "data" : importType}. Make sure to
                  backup your current data before proceeding.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 border-t pt-4">
        {activeTab === "export" ? (
          <Button
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <Download className="mr-1 h-4 w-4" />
            {isLoading ? "Exporting..." : "Export Data"}
          </Button>
        ) : (
          <Button
            onClick={handleImport}
            disabled={isLoading || !importFile}
            className="flex items-center gap-1"
          >
            <FileText className="mr-1 h-4 w-4" />
            {isLoading ? "Importing..." : "Import Data"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DataExportImport;
