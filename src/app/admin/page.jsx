"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Upload, RefreshCw, FolderOpen } from "lucide-react";
import FolderUpload from "@/components/FolderUpload/page";

function AdminPage() {
  const [collections, setCollections] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [activeTab, setActiveTab] = useState("collections"); // 'collections', 'upload', or 'process'
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState(null);
  const [lastUploadResult, setLastUploadResult] = useState(null); // Store last upload result

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCollections();
    setRefreshing(false);
    setLastRefreshed(new Date());
  };

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/qdrant");
      const data = await response.json();

      if (data.success) {
        setCollections(data.collections || []);
        setCount(data.count || 0);
        if (!lastRefreshed) setLastRefreshed(new Date());
      } else {
        setError(data.error || "Failed to fetch collections");
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      setError("Network error when fetching collections");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCollections();
  }, []);

  const handleUploadComplete = (result) => {
    console.log('Upload completed:', result);
    // Store the upload result for processing
    setLastUploadResult(result);
    // Refresh collections after successful upload
    fetchCollections();
    // Show processing tab
    setActiveTab("process");
  };

  const handleProcessFolder = async (folderPath, collectionName) => {
    setProcessing(true);
    setProcessResult(null);
    
    try {
      const params = new URLSearchParams({
        folderPath: folderPath,
        collection: collectionName
      });
      
      const response = await fetch(`/api/indexing?${params}`);
      const result = await response.json();
      
      if (response.ok) {
        setProcessResult(result);
        // Refresh collections to show the new one
        await fetchCollections();
      } else {
        throw new Error(result.error || result.message || 'Processing failed');
      }
    } catch (err) {
      setProcessResult({
        status: "error",
        error: err.message
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your VTT indexed courses</p>
      </div>

      {/* Tab navigation */}
      <div className="border-b mb-8">
        <div className="flex space-x-8">
          <button
            className={`pb-2 pt-1 px-1 -mb-px flex items-center gap-2 ${
              activeTab === "collections"
                ? "border-b-2 border-primary font-medium text-primary"
                : "text-muted-foreground hover:text-foreground transition-colors"
            }`}
            onClick={() => setActiveTab("collections")}
          >
            <RefreshCw size={18} />
            Collections
          </button>
          <button
            className={`pb-2 pt-1 px-1 -mb-px flex items-center gap-2 ${
              activeTab === "upload"
                ? "border-b-2 border-primary font-medium text-primary"
                : "text-muted-foreground hover:text-foreground transition-colors"
            }`}
            onClick={() => setActiveTab("upload")}
          >
            <Upload size={18} />
            Upload Folder
          </button>
          <button
            className={`pb-2 pt-1 px-1 -mb-px flex items-center gap-2 ${
              activeTab === "process"
                ? "border-b-2 border-primary font-medium text-primary"
                : "text-muted-foreground hover:text-foreground transition-colors"
            }`}
            onClick={() => setActiveTab("process")}
          >
            <FolderOpen size={18} />
            Process Folder
          </button>
        </div>
      </div>

      {activeTab === "upload" ? (
        <FolderUpload onUploadComplete={handleUploadComplete} />
      ) : activeTab === "process" ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FolderOpen size={24} />
              Process Uploaded Folder
            </CardTitle>
            <p className="text-muted-foreground">
              Process uploaded folders with your existing indexing logic
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">Process Recently Uploaded Folder</h3>
              {lastUploadResult ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Last uploaded: <strong>{lastUploadResult.details?.courseName}</strong> 
                    ({lastUploadResult.details?.totalFiles} files)
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleProcessFolder(
                        lastUploadResult.details?.folderPath,
                        `${lastUploadResult.details?.courseName?.toLowerCase().replace(/[^a-z0-9]/g, '-')}-vtts`
                      )}
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : `Process ${lastUploadResult.details?.courseName}`}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent uploads. Upload a folder first using the Upload tab.
                </p>
              )}
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">Quick Process</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Process specific folders or use default settings.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => handleProcessFolder(undefined, 'default-course-vtts')}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Process Default Folder'}
                </Button>
              </div>
            </div>
            
            {processResult && (
              <div className={`p-4 rounded-lg border ${
                processResult.status === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <h3 className="font-medium mb-2">
                  {processResult.status === 'success' ? 'Processing Complete' : 'Processing Failed'}
                </h3>
                {processResult.status === 'success' ? (
                  <div className="text-sm space-y-1">
                    <p>Files processed: {processResult.processedFiles}</p>
                    <p>Documents created: {processResult.stored}</p>
                    <p>Collection: {processResult.collectionName}</p>
                    <p>Source folder: {processResult.baseFolder}</p>
                  </div>
                ) : (
                  <p className="text-sm">{processResult.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Available Courses ({count})</h2>
              {lastRefreshed && (
                <p className="text-xs text-muted-foreground">
                  Last refreshed: {lastRefreshed.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                disabled={refreshing || loading}
                size="sm"
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button 
                onClick={() => setActiveTab("upload")} 
                size="sm"
              >
                Upload New Folder
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="bg-destructive/10 border-destructive/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle size={18} />
                  <p className="font-medium">Error loading courses</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          ) : collections.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  No courses found in the database
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setActiveTab("upload")}
                >
                  Upload Your First Course
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((collection) => (
                <Card
                  key={collection}
                  className="overflow-hidden group hover:shadow-md transition-all"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg capitalize">
                        {collection.replace(/_/g, " ")}
                      </CardTitle>
                      <Badge variant="outline" className="px-2 py-0.5">
                        {collection.split("_")[0]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-x-2">
                        <Button size="sm" variant="default">
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPage;
