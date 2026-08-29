import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdir } from "node:fs/promises";
import path from "node:path";

const essayRoot = path.resolve("public/docs/essay");

async function createEssayFileManifest() {
  const manifest = {};
  const years = await readdir(essayRoot, { withFileTypes: true });

  for (const year of years.filter((entry) => entry.isDirectory())) {
    const albums = await readdir(path.join(essayRoot, year.name), { withFileTypes: true });

    for (const album of albums.filter((entry) => entry.isDirectory())) {
      const files = await readdir(path.join(essayRoot, year.name, album.name), { withFileTypes: true });
      manifest[`${year.name}/${album.name}`] = files
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".txt"))
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right, "ko"));
    }
  }

  return JSON.stringify(manifest, null, 2);
}

function essayFileManifestPlugin() {
  return {
    name: "essay-file-manifest",
    configureServer(server) {
      server.middlewares.use("/docs/essay/files.json", async (_request, response) => {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(await createEssayFileManifest());
      });
    },
    async generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "docs/essay/files.json",
        source: await createEssayFileManifest(),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), essayFileManifestPlugin()]
});
