import { NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";

export async function GET() {
  try {
    // Initialize Qdrant client
    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
    });

    // Get list of collections
    const collections = await client.getCollections();

    // Return collection names
    return NextResponse.json(
      { 
        collections: collections.collections.map(collection => collection.name),
        count: collections.collections.length,
        success: true 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching Qdrant collections:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch collections", 
        message: error.message,
        success: false 
      }, 
      { status: 500 }
    );
  }
}