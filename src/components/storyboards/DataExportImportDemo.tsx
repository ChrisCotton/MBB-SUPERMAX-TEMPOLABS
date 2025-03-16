import React from "react";
import DataExportImport from "@/components/dashboard/DataExportImport";

const DataExportImportDemo = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Data Export & Import Demo</h1>
        <DataExportImport />
      </div>
    </div>
  );
};

export default DataExportImportDemo;
