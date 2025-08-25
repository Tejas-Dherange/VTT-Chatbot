// app/api/users/route.ts
import { NextResponse } from "next/server";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

const client = new OpenAI();
const ai = new GoogleGenAI({});

export async function POST(request) {
  const body = await request.json();
  const UserQuery = body.query;

  console.log("User Query:", UserQuery);

  //query translation

  const translatedQuery = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are a query rewriter. Your task is to take a user query that may contain grammar mistakes, typos, or unclear phrasing, 
      and rewrite it into a clear, meaningful, and grammatically correct query. 
      Return only the rewritten query text, with no explanations, extra text, or symbols.
      This is a userQuery : ${UserQuery}
      `,
  });

  //3 ways of rewriting the query
  const threeRewrites = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: `You are a query rewriter. Your task is to take user query and rewrite in three different ways which aligns meaning with userquery and
    improves clarity ant output format is is JSON object like for example:
    "{
      "rewrite1": "Rewritten query 1",
      "rewrite2": "Rewritten query 2",
      "rewrite3": "Rewritten query 3"
    }"
    And in response thier should be json object of three rewrites no other extra explanation and nothing.
     This is a userQuery : ${UserQuery}
    `,
    config: {
      responseMimeType: "application/json",
    },
  });

  const threeRewritesTextObject = JSON.parse(threeRewrites.text);

  const translatedQueryText = translatedQuery.text;

  console.log("Translated Query:", translatedQueryText);
  console.log("Three Rewrites:", threeRewritesTextObject);

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_URL,
      collectionName: "nodejs-course-vtts",
    }
  );

  const vectorRetriever = vectorStore.asRetriever({ k: 3 });
  // log("Vector Retriever:", vectorRetriever);
  const relevantChunk = await vectorRetriever.invoke(UserQuery);

  //Now retrive chunks from rewrite quesries
  const relevantChunk1 = await vectorRetriever.invoke(
    threeRewritesTextObject.rewrite1
  );
  const relevantChunk2 = await vectorRetriever.invoke(
    threeRewritesTextObject.rewrite2
  );
  const relevantChunk3 = await vectorRetriever.invoke(
    threeRewritesTextObject.rewrite3
  );

  console.log(
    "Relevant Chunks:",
    relevantChunk1,
    relevantChunk2,
    relevantChunk3
  );

  //sorting docs
  function getTopUniqueDocs(docs, topN = 3) {
    // Step 1: Count frequency per document id
    const freqMap = {};
    for (const doc of docs) {
      if (!freqMap[doc.id]) {
        freqMap[doc.id] = { doc, count: 0 };
      }
      freqMap[doc.id].count++;
    }

    // Step 2: Convert to array and sort by frequency (descending)
    const sorted = Object.values(freqMap).sort((a, b) => b.count - a.count);

    // Step 3: Take top N
    return sorted.slice(0, topN).map((entry) => ({
      ...entry.doc,
      frequency: entry.count, // keep frequency info if you need
    }));
  }

  const top3 = getTopUniqueDocs(
    [relevantChunk,relevantChunk1, relevantChunk2, relevantChunk3],
    3
  );
  // console.log("Top 3 Docs:", JSON.stringify(top3));

  //Now we have to rank chunks on relevance and frequency of chunks

  // log("Relevant Chunk:", relevantChunk);
  const SYSTEM_PROMPT = `
You are an AI teaching assistant that answers student queries using transcript data (VTT files) 
along with associated metadata such as course name, module name, video title, and timestamps.  

Your task is to provide **clear, structured, and context-aware answers** as follows:

1. If the answer is not found in the given context, respond with: "I don't know (Not found in context)."
   - Do NOT hallucinate or assume details.
   - You may optionally add a short clarification using your own knowledge, but clearly mention it is outside the context.  

2. If the answer is found in the context:
   - Give a **concise explanation** of the concept.
   - Provide the **course name**.
   - Provide the **module name**.
   - Provide the **video title**.
   - Provide the **relevant timestamps** from the transcript.
   - Calculate the **time required to watch the relevant part**:
       - Input timestamps are in **minutes**.
       - Convert the total duration into **hours, minutes, and seconds format** (hh:mm:ss).

3. If the context is ambiguous or incomplete, ask the user clarifying questions instead of guessing.  

### Output Format (strictly follow this order):

a) Explanation: <your concise explanation>  
b) Course Name: <course name>  
c) Module Name: <module name>  
d) Video Title: <video title>  
e) Relevant Timestamps: <timestamps>  
f) Duration to Watch: <hh:mm:ss>  

---

Context Data:  
${JSON.stringify(top3)}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "user", content: SYSTEM_PROMPT },
      { role: "user", content: translatedQueryText },
    ],
  });
  const data = response.choices[0].message.content;

  

  return NextResponse.json({
    status: 200,
    message: "Responsed  successfully",
    data,
  });
}
