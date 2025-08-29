export const DEFAULT_CHUNK_SIZE = 800;
export const DEFAULT_CHUNK_OVERLAP = 120;

export function chunkText(
  text: string,
  size = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_CHUNK_OVERLAP
): string[] {
  if (size <= 0) throw new Error(" Size must be greater than 0");
  if (overlap < 0 || overlap >= size)
    throw new Error("overlap must be >= 0 and < size");

  const chunks = [];
  const step = size - overlap;
  const lookback = 120;

  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + size, text.length);
    let piece = text.slice(i, end);

    if (end < text.length) {
      const windowStart = Math.max(0, piece.length - lookback);
      const w = piece.slice(windowStart);
      const lastPeriod = w.lastIndexOf(".");
      const lastQ = w.lastIndexOf("?");
      const lastEx = w.lastIndexOf("!");
      const best = Math.max(lastPeriod, lastQ, lastEx);

      if (best !== -1) {
        const snapPosInPiece = windowStart + best + 1;
        end = i + snapPosInPiece;
        piece = text.slice(i, end);
      } else {
        const lastChar = piece[piece.length - 1];
        if (lastChar && !/\s/.test(lastChar)) {
          const lastSpace = piece.lastIndexOf(" ");
          if (lastSpace > 0 && piece.length - lastSpace < 40) {
            end = i + lastSpace;
            piece = text.slice(i, end);
          }
        }
      }
    }

    chunks.push(piece.trim());

    if (end >= text.length) break;
    i = end - overlap;
  }

  if (chunks.length >= 2) {
    const last = chunks[chunks.length - 1];
    if (last.length < Math.min(200, Math.floor(size / 2))) {
      chunks[chunks.length - 2] = (
        chunks[chunks.length - 2] +
        " " +
        last
      ).trim();
      chunks.pop();
    }
  }

  return chunks;
}

export function chunkPages(
  pages: { page: number; text: string }[],
  docId: string,
  size = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_CHUNK_OVERLAP
): Array<{ id: string; docId: string; page: number; text: string }> {
  const out: Array<{ id: string; docId: string; page: number; text: string }> =
    [];
  for (const p of pages) {
    const pieces = chunkText(p.text, size, overlap);
    for (const piece of pieces) {
      out.push({
        id: crypto.randomUUID(),
        docId,
        page: p.page,
        text: piece.trim(),
      });
    }
  }
  return out;
}
