"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function FileUploadButton() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Handle the file, e.g., upload it to a server
      console.log("Selected file:", file);
    }
  };
  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        onClick={handleButtonClick}
        className="flex items-center space-x-2"
      >
        <Upload className="w-4 h-4" />
        <span>Add Room</span>
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        aria-label="File upload"
      />
      {fileName && (
        <p className="text-sm text-muted-foreground">
          Selected file: {fileName}
        </p>
      )}
    </div>
  );
}
