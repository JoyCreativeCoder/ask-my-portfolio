//Handle upload
import { useState } from "react";
import { extractTextFromPDF } from "../library/pdf";
import { chunkPages } from "../library/chunk";

type chunk = { id: string; docId: string; page: number; text: string };

export default function Upload() {
  const [chunks, setChunks] = useState<chunk[]>([]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const pages = await extractTextFromPDF(file);
      const docId = `${file.name}-${Date.now()}`;
      const pieces = chunkPages(pages, docId);

      setChunks(pieces);
    }
    console.log("CHUNKS --->", chunks);
  }
  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFile} />
      <p>Total Chunk : {chunks.length}</p>
    </div>
  );
}
