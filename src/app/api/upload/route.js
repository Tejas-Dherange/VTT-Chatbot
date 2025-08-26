import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

export async function POST(request) {
  try {
    console.log("Upload request received");
    
    const formData = await request.formData();
    const files = formData.getAll("files");
    const courseName = formData.get("courseName") || "default_course";

    console.log(`Course name: ${courseName}`);
    console.log(`Files received: ${files.length}`);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files received" },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "uploads");
    console.log(`Upload directory: ${uploadDir}`);
    
    if (!fs.existsSync(uploadDir)) {
      console.log("Creating uploads directory...");
      await mkdir(uploadDir, { recursive: true });
    }

    // Create course-specific directory
    const courseDir = path.join(uploadDir, courseName);
    console.log(`Course directory: ${courseDir}`);
    
    if (!fs.existsSync(courseDir)) {
      console.log("Creating course directory...");
      await mkdir(courseDir, { recursive: true });
    }

    let savedFiles = 0;
    let vttFiles = 0;
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        if (!file || !file.name) {
          console.log(`Skipping invalid file at index ${i}`);
          continue;
        }

        console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`);
        console.log(`File webkitRelativePath: ${file.webkitRelativePath || 'none'}`);

        // Get the file path from webkitRelativePath (preserves folder structure)
        const relativePath = file.webkitRelativePath || file.name;
        const filePath = path.join(courseDir, relativePath);

        console.log(`Saving to: ${filePath}`);

        // Create directory structure if needed
        const fileDir = path.dirname(filePath);
        if (!fs.existsSync(fileDir)) {
          console.log(`Creating directory: ${fileDir}`);
          await mkdir(fileDir, { recursive: true });
        }

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await writeFile(filePath, buffer);
        savedFiles++;

        // Count VTT files specifically
        if (file.name.endsWith('.vtt') || file.name.endsWith('.webvtt')) {
          vttFiles++;
        }

        console.log(`✓ Saved: ${relativePath} (${buffer.length} bytes)`);
      } catch (fileError) {
        const error = `Error saving ${file.name}: ${fileError.message}`;
        errors.push(error);
        console.error(`✗ ${error}`);
      }
    }

    console.log(`Upload complete. Saved: ${savedFiles}, VTT files: ${vttFiles}, Errors: ${errors.length}`);

    if (savedFiles === 0) {
      return NextResponse.json(
        { error: "No files could be saved", errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${savedFiles} files to course '${courseName}'`,
      details: {
        courseName,
        totalFiles: savedFiles,
        vttFiles,
        folderPath: courseDir, // Changed from uploadPath to folderPath
        uploadPath: courseDir, // Keep for backward compatibility
        errors: errors.length > 0 ? errors : undefined,
      }
    });

  } catch (error) {
    console.error("Error in upload handler:", error);
    return NextResponse.json(
      { error: "Upload failed", message: error.message },
      { status: 500 }
    );
  }
}
