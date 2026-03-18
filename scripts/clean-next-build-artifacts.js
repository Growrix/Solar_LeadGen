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

// Next build can intermittently fail with missing page modules when stale
// partial artifacts remain. A full clean makes builds deterministic.
removeDir(".next");
