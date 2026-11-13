export async function gzipFile(file: File): Promise<{ blob: Blob; compressed: boolean }> {
  if (typeof CompressionStream === "undefined") {
    return { blob: file, compressed: false };
  }

  const compressedStream = file.stream().pipeThrough(new CompressionStream("gzip"));
  const blob = await new Response(compressedStream).blob();
  return { blob, compressed: true };
}
