import fs from 'node:fs';
import path from 'node:path';
import { EXPECTED_ASSET_PATHS } from '../src/utils/assetRegistry.js';

const expected = EXPECTED_ASSET_PATHS.map((urlPath) => `public${urlPath}`);

const projectRoot = process.cwd();
const missing = [];

for (const relativePath of expected) {
  const absolutePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    missing.push(relativePath);
  }
}

if (missing.length === 0) {
  console.log('All high-fidelity assets are present.');
  process.exit(0);
}

console.log(`Missing ${missing.length} assets:`);
for (const file of missing) {
  console.log(`- ${file}`);
}
process.exit(1);
