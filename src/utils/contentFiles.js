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

  const rawBody = bodyParts.join("\n---\n").trim();
  const sections = { description: [] };
  let activeSection = "description";

  rawBody.split("\n").forEach((line) => {
    const marker = line.trim().toLowerCase().match(/^\[(credits|lyrics)\]$/);
    if (marker) {
      activeSection = marker[1];
      sections[activeSection] ??= [];
      return;
    }
    sections[activeSection].push(line);
  });

  const body = sections.description.join("\n").trim();
  const credits = (sections.credits ?? []).join("\n").trim();
  const lyricsText = (sections.lyrics ?? []).join("\n").trim();
  const toParagraphs = (value) => value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return {
    ...metadata,
    body,
    paragraphs: toParagraphs(body),
    credits,
    creditParagraphs: toParagraphs(credits),
    lyricsText,
    lyricsParagraphs: toParagraphs(lyricsText),
  };
}

export function getContentUrl(...segments) {
  return `/docs/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
}
