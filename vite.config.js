import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdir } from "node:fs/promises";
import path from "node:path";

const docsRoot = path.resolve("public/docs");
const indexedDirectoryPattern = /^(\d+)-(.+)$/;

function byIndex(left, right) {
  return left.index.localeCompare(right.index, "ko", { numeric: true });
}

async function createContentManifest() {
  const yearEntries = await readdir(docsRoot, { withFileTypes: true });
  const years = [];
  const objects = [];

  for (const yearEntry of yearEntries.filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name))) {
    const albumEntries = await readdir(path.join(docsRoot, yearEntry.name), { withFileTypes: true });
    const albums = [];

    for (const albumEntry of albumEntries.filter((entry) => entry.isDirectory())) {
      const albumMatch = albumEntry.name.match(indexedDirectoryPattern);
      if (!albumMatch) continue;

      const albumPath = path.join(docsRoot, yearEntry.name, albumEntry.name);
      const albumContents = await readdir(albumPath, { withFileTypes: true });
      const albumFileNames = new Set(albumContents.filter((entry) => entry.isFile()).map((entry) => entry.name));
      const items = [];

      for (const itemEntry of albumContents.filter((entry) => entry.isDirectory())) {
        const itemMatch = itemEntry.name.match(indexedDirectoryPattern);
        if (!itemMatch) continue;

        const itemFiles = await readdir(path.join(albumPath, itemEntry.name), { withFileTypes: true });
        const fileNames = new Set(itemFiles.filter((entry) => entry.isFile()).map((entry) => entry.name));
        items.push({
          index: itemMatch[1],
          title: itemMatch[2],
          directory: itemEntry.name,
          hasMusic: fileNames.has("music.txt"),
          hasEssay: fileNames.has("essay.txt"),
          cover: ["cover.png", "cover.jpg", "cover.jpeg", "cover.webp"].find((file) => fileNames.has(file)) ?? null,
        });
      }

      albums.push({
        index: albumMatch[1],
        title: albumMatch[2],
        directory: albumEntry.name,
        albumFile: albumFileNames.has("album.txt") ? "album.txt" : null,
        cover: ["cover.png", "cover.jpg", "cover.jpeg", "cover.webp"].find((file) => albumFileNames.has(file)) ?? null,
        coverSpine: ["cover-spine.png", "cover-spine.jpg", "cover-spine.jpeg", "cover-spine.webp"].find((file) => albumFileNames.has(file)) ?? null,
        coverBack: ["cover-back.png", "cover-back.jpg", "cover-back.jpeg", "cover-back.webp"].find((file) => albumFileNames.has(file)) ?? null,
        items: items.sort(byIndex),
      });

      const objectsPath = path.join(albumPath, "objects");
      const objectEntries = await readdir(objectsPath, { withFileTypes: true }).catch(() => []);

      for (const objectEntry of objectEntries.filter((entry) => entry.isDirectory())) {
        const objectMatch = objectEntry.name.match(indexedDirectoryPattern);
        if (!objectMatch) continue;

        const objectPath = path.join(objectsPath, objectEntry.name);
        const objectContents = await readdir(objectPath, { withFileTypes: true });
        const fileNames = new Set(objectContents.filter((entry) => entry.isFile()).map((entry) => entry.name));
        const imagesEntry = objectContents.find((entry) => entry.isDirectory() && entry.name === "images");
        const gallery = imagesEntry
          ? (await readdir(path.join(objectPath, "images"), { withFileTypes: true }))
            .filter((entry) => entry.isFile() && /\.(png|jpe?g|webp|svg)$/i.test(entry.name))
            .map((entry) => entry.name)
            .sort((left, right) => left.localeCompare(right, "ko", { numeric: true }))
          : [];

        objects.push({
          index: objectMatch[1],
          title: objectMatch[2],
          directory: objectEntry.name,
          id: `${yearEntry.name}/${albumEntry.name}/${objectEntry.name}`,
          path: [yearEntry.name, albumEntry.name, "objects", objectEntry.name],
          album: `${yearEntry.name}/${albumEntry.name}`,
          albumTitle: albumMatch[2],
          objectFile: fileNames.has("object.txt") ? "object.txt" : null,
          cover: ["cover.png", "cover.jpg", "cover.jpeg", "cover.webp", "cover.svg"].find((file) => fileNames.has(file)) ?? null,
          gallery,
        });
      }
    }

    years.push({ year: yearEntry.name, albums: albums.sort(byIndex) });
  }

  years.sort((left, right) => left.year.localeCompare(right.year, "ko", { numeric: true }));
  return JSON.stringify({ years, objects: objects.sort((left, right) => left.id.localeCompare(right.id, "ko", { numeric: true })) }, null, 2);
}

function contentManifestPlugin() {
  return {
    name: "content-manifest",
    configureServer(server) {
      server.middlewares.use("/docs/files.json", async (_request, response) => {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(await createContentManifest());
      });
    },
    async generateBundle() {
      this.emitFile({ type: "asset", fileName: "docs/files.json", source: await createContentManifest() });
    },
  };
}

export default defineConfig({
  plugins: [react(), contentManifestPlugin()],
});
