import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import WebVTT from "node-webvtt";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

// --- 🔹 Helper: recursive file traversal ---
function getAllVttFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      getAllVttFiles(filePath, fileList);
    } else if (file.endsWith(".vtt")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// --- 🔹 Helper: timestamp to seconds ---
function timestampToSeconds(timestamp) {
  try {
    const parts = timestamp.split(":");
    if (parts.length === 3) {
      const [h, m, s] = parts;
      return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
    }
    return 0;
  } catch {
    return 0;
  }
}

// --- 🔹 Helper: chunk cues into ~maxLen chars while preserving timestamps ---
function chunkCuesByLength(cues, maxLen = 400) {
  const chunks = [];
  let buffer = [];
  let bufferLen = 0;
  let start = null;

  for (const cue of cues) {
    if (!start) start = cue.start; // cue.start is in seconds

    if (bufferLen + cue.text.length > maxLen && buffer.length > 0) {
      chunks.push({
        text: buffer.map((c) => c.text).join(" "),
        startTime: buffer[0].startTime, // first cue's start
        endTime: buffer[buffer.length - 1].endTime, // last cue's end
        cues: [...buffer],
      });
      buffer = [];
      bufferLen = 0;
      start = cue.start;
    }

    buffer.push({
      startTime: cue.start, // already seconds from node-webvtt
      endTime: cue.end, // already seconds
      text: cue.text.trim(),
      startTimestamp: cue.rawStart, // store original VTT timestamp string (you’ll need to save it)
      endTimestamp: cue.rawEnd,
    });

    bufferLen += cue.text.length;
  }

  if (buffer.length > 0) {
    chunks.push({
      text: buffer.map((c) => c.text).join(" "),
      startTime: buffer[0].startTime,
      endTime: buffer[buffer.length - 1].endTime,
      cues: [...buffer],
    });
  }

  return chunks;
}

// --- 🔹 Main GET handler ---
export async function GET(req) {
  try {
    const baseFolder =
      process.env.VTT_BASE_FOLDER ||
      "D:\\GenAI-Cohort\\VTT-PRJ\\genai-cohort\\nodejs";
    if (!fs.existsSync(baseFolder)) {
      return NextResponse.json(
        { error: "Base folder not found", path: baseFolder },
        { status: 404 }
      );
    }

    const vttFiles = getAllVttFiles(baseFolder);
    if (vttFiles.length === 0) {
      return NextResponse.json(
        { message: "No VTT files found", path: baseFolder },
        { status: 200 }
      );
    }

    let docs = [];
    let processedFiles = 0;
    let errors = [];

    for (const filePath of vttFiles) {
      try {
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = WebVTT.parse(raw);
        if (!parsed.cues || parsed.cues.length === 0) continue;

        const relativePath = path.relative(baseFolder, filePath);
        const parts = relativePath.split(path.sep);
        const moduleName = parts.length > 1 ? parts[0] : "root";
        const fileName = path.basename(filePath, ".vtt");

        // --- 🔹 Chunk all cues together ---
        const chunks = chunkCuesByLength(parsed.cues, 400);

        for (const [i, chunk] of chunks.entries()) {
          docs.push(
            new Document({
              pageContent: chunk.text,
              metadata: {
                course: "nodejs-course",
                module: moduleName,
                file: fileName,
                chunkId: `${fileName}-${i}`,
                startTime: chunk.cues[0].startTimestamp, // original string
                endTime: chunk.cues[chunk.cues.length - 1].endTimestamp, // original string
                startSeconds: chunk.cues[0].startTime, // seconds
                endSeconds: chunk.cues[chunk.cues.length - 1].endTime, // seconds
                filePath: relativePath,
              },
            })
          );
        }

        processedFiles++;
        console.log(
          `Processed: ${fileName} (${parsed.cues.length} cues, ${chunks.length} chunks)`
        );
      } catch (fileError) {
        const error = `Error processing ${filePath}: ${fileError.message}`;
        errors.push(error);
        console.error(error);
      }
    }

    if (docs.length === 0) {
      return NextResponse.json(
        { error: "No documents created", processedFiles, errors },
        { status: 400 }
      );
    }

    // --- 🔹 Embeddings ---
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // --- 🔹 Qdrant storage (batching) ---
    const BATCH_SIZE = 50;
    const vectorStorePromises = [];
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE);
      vectorStorePromises.push(
        QdrantVectorStore.fromDocuments(batch, embeddings, {
          url: process.env.QDRANT_URL,
          collectionName: "nodejs-course-vtts",
          collectionConfig: { vectors: { size: 3072, distance: "Cosine" } },
        })
      );
    }
    await Promise.all(vectorStorePromises);

    return NextResponse.json({
      status: "success",
      stored: docs.length,
      processedFiles,
      totalFiles: vttFiles.length,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        totalDocuments: docs.length,
        avgChunksPerFile: Math.round(docs.length / processedFiles),
      },
    });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Add validation
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Here you could add logic to:
    // - Trigger reprocessing of specific files
    // - Update collection settings
    // - Add new VTT files dynamically

    return NextResponse.json(
      {
        message: "POST endpoint ready for implementation",
        receivedData: body,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
