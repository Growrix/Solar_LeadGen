/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");

function removeDir(relativePath) {
  const absolutePath = path.join(process.cwd(), relativePath);
  try {
    if (!fs.existsSync(absolutePath)) return;
    fs.rmSync(absolutePath, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[clean-next-build-artifacts] Failed to remove ${relativePath}:`, error);
  }
}

removeDir(path.join(".next", "export"));
removeDir(path.join(".next", "types"));
