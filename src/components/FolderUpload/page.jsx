"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, AlertCircle, CheckCircle2, Folder } from "lucide-react";

export default function FolderUpload({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    console.log(`Selected ${selectedFiles.length} files`);
    
    // Log sample file info
    if (selectedFiles.length > 0) {
      console.log('Sample file info:', {
        name: selectedFiles[0].name,
        webkitRelativePath: selectedFiles[0].webkitRelativePath,
        size: selectedFiles[0].size,
        type: selectedFiles[0].type
      });
    }
    
    setFiles(selectedFiles);
    setUploadResult(null);
    setError(null);

    // Count VTT files
    const vttCount = selectedFiles.filter(file => 
      file.name.endsWith('.vtt') || file.name.endsWith('.webvtt')
    ).length;
    
    console.log(`Found ${vttCount} VTT files out of ${selectedFiles.length} total`);
    
    if (vttCount === 0) {
      setError("No VTT files found in the selected folder.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseName.trim()) {
      setError("Please enter a course name");
      return;
    }
    
    if (files.length === 0) {
      setError("Please select a folder");
      return;
    }
    
    setUploading(true);
    setError(null);
    
    console.log('Starting upload process...');
    console.log(`Course name: ${courseName}`);
    console.log(`Uploading ${files.length} files`);
    
    try {
      const formData = new FormData();
      formData.append('courseName', courseName);
      
      files.forEach((file, index) => {
        console.log(`Adding file ${index + 1}: ${file.webkitRelativePath || file.name} (${file.size} bytes)`);
        formData.append('files', file);
      });
      
      console.log('Sending request to /api/upload...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      console.log('Upload response:', result);
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      setUploadResult(result);
      setFiles([]);
      setCourseName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Error uploading folder');
    } finally {
      setUploading(false);
    }
  };

  const vttCount = files.filter(file => 
    file.name.endsWith('.vtt') || file.name.endsWith('.webvtt')
  ).length;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Upload size={24} />
          Upload VTT Folder
        </CardTitle>
        <CardDescription>
          Upload a folder containing VTT files. The folder will be saved to the server and processed with your existing indexing logic.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="courseName" className="text-sm font-medium">
              Course Name
            </label>
            <input
              id="courseName"
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Enter course name (e.g., python-course, react-basics)"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Folder
            </label>
            <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <Folder size={24} className="text-primary" />
                </div>
                <h3 className="font-medium">Select a folder containing VTT files</h3>
                <p className="text-sm text-muted-foreground">
                  This will upload the entire folder structure to the server
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  webkitdirectory=""
                  directory=""
                  multiple
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Folder
                </Button>
              </div>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="space-y-3 border rounded-md p-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">
                  Selected: {files.length} files
                </h3>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {vttCount} VTT files
                  </Badge>
                  <Badge variant="outline">
                    {files.length - vttCount} other files
                  </Badge>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Folder: {files[0]?.webkitRelativePath?.split('/')[0] || 'Unknown'}
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-3 rounded-md flex items-start gap-2 bg-destructive/10 text-destructive text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}
          
          {uploadResult && (
            <div className="p-3 rounded-md flex items-start gap-2 bg-green-100 border border-green-400 text-green-700 text-sm">
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Upload Successful</p>
                <p>{uploadResult.message}</p>
                {uploadResult.details && (
                  <ul className="mt-2 list-disc list-inside text-xs space-y-1">
                    <li>Course: <Badge variant="outline" className="ml-1">{uploadResult.details.courseName}</Badge></li>
                    <li>Total files: {uploadResult.details.totalFiles}</li>
                    <li>VTT files: {uploadResult.details.vttFiles}</li>
                    <li>Saved to: {uploadResult.details.uploadPath}</li>
                  </ul>
                )}
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={uploading || files.length === 0}
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading Folder...
              </>
            ) : (
              'Upload Folder to Server'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
