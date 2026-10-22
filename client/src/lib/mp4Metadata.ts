const REMOVABLE_BOXES = new Set(["udta", "meta", "uuid"]);
const CONTAINER_BOXES = new Set([
  "moov",
  "trak",
  "mdia",
  "minf",
  "stbl",
  "dinf",
  "edts",
  "moof",
  "traf",
  "mfra",
]);

export type CleanVideoResult = {
  blob: Blob;
  removedBoxes: number;
  originalBytes: number;
  cleanedBytes: number;
  format: "mp4" | "mov";
};

type BoxHeader = {
  offset: number;
  size: number;
  headerSize: number;
  type: string;
};

function readBoxHeader(view: DataView, offset: number, end: number): BoxHeader | null {
  if (offset + 8 > end) return null;

  const size32 = view.getUint32(offset);
  const typeBytes = new Uint8Array(view.buffer, view.byteOffset + offset + 4, 4);
  const type = String.fromCharCode(...typeBytes);
  let size = size32;
  let headerSize = 8;

  if (size32 === 1) {
    if (offset + 16 > end) return null;
    const high = view.getUint32(offset + 8);
    const low = view.getUint32(offset + 12);
    size = high * 2 ** 32 + low;
    headerSize = 16;
  } else if (size32 === 0) {
    size = end - offset;
  }

  if (!Number.isSafeInteger(size) || size < headerSize || offset + size > end) {
    return null;
  }

  return { offset, size, headerSize, type };
}

function makeBox(type: string, payload: Uint8Array): Uint8Array {
  const size = payload.byteLength + 8;
  if (size > 0xffffffff) {
    throw new Error("Este vídeo é demasiado grande para ser limpo no navegador.");
  }

  const output = new Uint8Array(size);
  const view = new DataView(output.buffer);
  view.setUint32(0, size);
  output.set(new TextEncoder().encode(type.slice(0, 4)), 4);
  output.set(payload, 8);
  return output;
}

function makeFreeBox(size: number): Uint8Array {
  if (size < 8) {
    throw new Error("Não foi possível preservar a estrutura interna do vídeo.");
  }
  const output = new Uint8Array(size);
  const view = new DataView(output.buffer);
  view.setUint32(0, size);
  output.set(new TextEncoder().encode("free"), 4);
  return output;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.byteLength;
  }
  return output;
}

function sanitizeRange(
  bytes: Uint8Array,
  start: number,
  end: number,
): { bytes: Uint8Array; removedBoxes: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts: Uint8Array[] = [];
  let removedBoxes = 0;
  let offset = start;

  while (offset < end) {
    const box = readBoxHeader(view, offset, end);
    if (!box) {
      return { bytes: bytes.slice(start, end), removedBoxes };
    }

    const original = bytes.slice(box.offset, box.offset + box.size);
    if (REMOVABLE_BOXES.has(box.type)) {
      removedBoxes += 1;
      offset += box.size;
      continue;
    }

    if (CONTAINER_BOXES.has(box.type)) {
      const childStart = box.offset + box.headerSize;
      const childResult = sanitizeRange(bytes, childStart, box.offset + box.size);
      if (childResult.removedBoxes > 0) {
        const headerAndPrefix = bytes.slice(box.offset, childStart);
        const rebuilt = concat([headerAndPrefix, childResult.bytes]);
        const rebuiltBox = makeBox(box.type, rebuilt.slice(box.headerSize));
        parts.push(rebuiltBox);
        removedBoxes += childResult.removedBoxes;
      } else {
        parts.push(original);
      }
    } else {
      parts.push(original);
    }

    offset += box.size;
  }

  return { bytes: concat(parts), removedBoxes };
}

function looksLikeVideo(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 12) return false;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const first = readBoxHeader(view, 0, bytes.byteLength);
  return first?.type === "ftyp";
}

function detectFormat(bytes: Uint8Array): "mp4" | "mov" {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const first = readBoxHeader(view, 0, bytes.byteLength);
  if (!first || first.type !== "ftyp") {
    throw new Error("O ficheiro não parece ser um vídeo MP4 ou MOV válido.");
  }
  const majorBrand = new TextDecoder().decode(bytes.slice(8, 12)).toLowerCase();
  return majorBrand.includes("qt") ? "mov" : "mp4";
}

export async function removeVideoMetadata(file: File): Promise<CleanVideoResult> {
  const buffer = await file.arrayBuffer();
  const source = new Uint8Array(buffer);

  if (!looksLikeVideo(source)) {
    throw new Error("O ficheiro selecionado não é um MP4/MOV reconhecível.");
  }

  const format = detectFormat(source);
  const view = new DataView(source.buffer, source.byteOffset, source.byteLength);
  const topLevel: Uint8Array[] = [];
  let removedBoxes = 0;
  let offset = 0;
  let foundMoov = false;

  while (offset < source.byteLength) {
    const box = readBoxHeader(view, offset, source.byteLength);
    if (!box) {
      throw new Error("A estrutura interna do vídeo está incompleta ou danificada.");
    }

    const original = source.slice(box.offset, box.offset + box.size);
    if (box.type === "moov") {
      foundMoov = true;
      const result = sanitizeRange(source, box.offset + box.headerSize, box.offset + box.size);
      if (result.removedBoxes > 0) {
        const rebuiltLength = result.bytes.byteLength + 8;
        const missingBytes = original.byteLength - rebuiltLength;
        const moovPayload = missingBytes >= 8
          ? concat([result.bytes, makeFreeBox(missingBytes)])
          : result.bytes;
        topLevel.push(makeBox(box.type, moovPayload));
        removedBoxes += result.removedBoxes;
      } else {
        topLevel.push(original);
      }
    } else if (REMOVABLE_BOXES.has(box.type)) {
      // Keep the exact byte range as a free box so media offsets remain stable.
      topLevel.push(makeFreeBox(original.byteLength));
      removedBoxes += 1;
    } else {
      topLevel.push(original);
    }

    offset += box.size;
  }

  if (!foundMoov) {
    throw new Error("Não foi encontrada a faixa de informação necessária para este vídeo.");
  }
  if (removedBoxes === 0) {
    throw new Error("Não foram encontrados metadados removíveis neste vídeo.");
  }

  const cleaned = concat(topLevel);
  const cleanedBuffer = cleaned.buffer.slice(
    cleaned.byteOffset,
    cleaned.byteOffset + cleaned.byteLength,
  ) as ArrayBuffer;
  const mime = format === "mov" ? "video/quicktime" : "video/mp4";
  return {
    blob: new Blob([cleanedBuffer], { type: mime }),
    removedBoxes,
    originalBytes: source.byteLength,
    cleanedBytes: cleaned.byteLength,
    format,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
