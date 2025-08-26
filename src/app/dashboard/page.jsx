"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, BookOpen, ChevronRight, Menu, X } from "lucide-react";

function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("nodejs-course-vtts");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch collections from Qdrant
  const fetchCollections = async () => {
    setCollectionsLoading(true);
    try {
      const response = await fetch("/api/qdrant");
      const data = await response.json();
      if (data.success && data.collections) {
        setCollections(data.collections);
        // Set first collection as default if current selection doesn't exist
        if (data.collections.length > 0 && !data.collections.includes(selectedCollection)) {
          setSelectedCollection(data.collections[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setCollectionsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle collection change
  const handleCollectionChange = (collection) => {
    setSelectedCollection(collection);
    // Clear messages when switching collections
    setMessages([]);
  };

  // Format collection name for display
  const formatCollectionName = (collection) => {
    return collection
      .replace(/-vtts$/, '') // Remove -vtts suffix
      .replace(/-/g, ' ') // Replace hyphens with spaces
      .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letter of each word
  };

  // Send a message
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage = { role: "user", content: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Send query with selected collection
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: inputMessage,
          collection: selectedCollection 
        }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.data },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard input
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r bg-card`}>
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <BookOpen size={20} />
            Collections
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select a course to chat with
          </p>
        </div>
        
        <div className="p-2">
          {collectionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Loading collections...</span>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No collections found</p>
              <p className="text-xs mt-1">Upload some courses first</p>
            </div>
          ) : (
            <div className="space-y-1">
              {collections.map((collection) => (
                <button
                  key={collection}
                  onClick={() => handleCollectionChange(collection)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCollection === collection
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {formatCollectionName(collection)}
                      </p>
                      <p className={`text-xs mt-1 ${
                        selectedCollection === collection 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {collection}
                      </p>
                    </div>
                    {selectedCollection === collection && (
                      <ChevronRight size={16} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with toggle button */}
        <div className="border-b bg-background p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="font-semibold">
                {selectedCollection ? formatCollectionName(selectedCollection) : 'VTT Chat Assistant'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedCollection ? `Chat with ${formatCollectionName(selectedCollection)} content` : 'Select a collection to start chatting'}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-auto bg-muted/30">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-bold text-center mb-2">
                  {selectedCollection ? formatCollectionName(selectedCollection) : 'VTT Chat Assistant'}
                </h2>
                <p className="text-center text-muted-foreground mb-4">
                  {selectedCollection 
                    ? `Ask questions about ${formatCollectionName(selectedCollection)} content`
                    : 'Select a collection from the sidebar to start chatting'
                  }
                </p>
                {selectedCollection && (
                  <div className="w-full max-w-md bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Try asking:
                    </p>
                    <div className="space-y-2">
                      {[
                        "What was discussed about the new features?",
                        "Summarize the key points",
                        "When was the deadline mentioned?",
                      ].map((suggestion, i) => (
                        <button
                          key={i}
                          className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm"
                          onClick={() => setInputMessage(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border text-card-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-card border rounded-lg px-4 py-3">
                      <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div className="border-t bg-background p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-muted rounded-lg border px-4 py-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  rows="1"
                  placeholder={selectedCollection 
                    ? `Ask about ${formatCollectionName(selectedCollection)}...` 
                    : "Select a collection first..."
                  }
                  disabled={!selectedCollection}
                  className="w-full bg-transparent resize-none focus:outline-none min-h-[24px] max-h-[200px] disabled:opacity-50"
                  style={{ overflow: "hidden" }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={isLoading || inputMessage.trim() === "" || !selectedCollection}
                className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send Message"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
