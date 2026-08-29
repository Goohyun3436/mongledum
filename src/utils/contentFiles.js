export function parseContentFile(source) {
  const [metadataBlock = "", ...bodyParts] = source.replace(/\r\n/g, "\n").split("\n---\n");
  const metadata = {};

  metadataBlock.split("\n").forEach((line) => {
    const separator = line.indexOf(":");
    if (separator === -1) return;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key) metadata[key] = value;
  });

  const body = bodyParts.join("\n---\n").trim();
  return {
    ...metadata,
    body,
    paragraphs: body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
  };
}

export function getContentUrl(...segments) {
  return `/docs/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
}
