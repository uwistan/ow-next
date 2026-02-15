import fs from 'fs';
import path from 'path';
import url from 'url';

// Absolute path helpers – needed because this script might be executed from project root
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_PATH = path.join(
  __dirname,
  '../src/styles/design-tokens.tokens.json'
);
const OUTPUT_DIR = path.join(__dirname, '../src/styles/generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'tokens.css');

// Utility to deeply resolve {path.to.token} references that appear inside token values
function resolveValue(rawValue, root) {
  if (
    typeof rawValue === 'string' &&
    rawValue.startsWith('{') &&
    rawValue.endsWith('}')
  ) {
    const pathStr = rawValue.slice(1, -1);
    const attemptPaths = [pathStr];
    // Fallback: strip leading mode segment (e.g., colors.light.basics -> colors.basics)
    const parts = pathStr.split('.');
    if (
      parts.length > 2 &&
      ['light', 'dark'].includes(parts[1]) &&
      ['colors', 'collection'].includes(parts[0])
    ) {
      attemptPaths.push([parts[0], ...parts.slice(2)].join('.'));
    }
    for (const tryPath of attemptPaths) {
      const segments = tryPath.split('.');
      let current = root;
      for (const segment of segments) {
        if (current == null) {
          current = undefined;
          break;
        }
        current = current[segment];
      }
      if (current === undefined) continue;
      if (
        typeof current === 'object' &&
        current !== null &&
        'value' in current
      ) {
        return resolveValue(current.value, root);
      }
      if (current !== undefined) return current;
    }
    return rawValue; // unresolved
  }
  return rawValue;
}

function isLeaf(token) {
  return token && typeof token === 'object' && 'value' in token;
}

const sanitize = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Recursively walk a token tree and collect CSS variable declarations.
 * @param {object} node – Current subtree
 * @param {string[]} pathParts – accumulated path segments
 * @param {object} options
 * @param {any} options.root – root json object for resolving references
 * @param {string[]} options.output – array to push `--var-name: value;` declarations into
 */
function flatten(node, pathParts, { root, output, prefixType = true }) {
  for (const [key, value] of Object.entries(node)) {
    const newPath = [...pathParts, key];
    if (isLeaf(value)) {
      const sanitizedParts = newPath.map(sanitize);
      const cssVarName =
        '--' +
        (prefixType && value.type ? sanitize(value.type) + '-' : '') +
        sanitizedParts.join('-');
      let resolved = resolveValue(value.value, root);
      // Attach units for dimensions if numeric
      if (value.type === 'dimension' && typeof resolved === 'number') {
        resolved = `${resolved}px`;
      }
      // Skip objects / unsupported
      if (typeof resolved === 'string' || typeof resolved === 'number') {
        output.push(`${cssVarName}: ${resolved};`);
      }
    } else if (typeof value === 'object' && value != null) {
      flatten(value, newPath, { root, output, prefixType });
    }
  }
}

function build() {
  const json = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf-8'));
  if (!json.tokens) {
    console.error(
      '[tokens] No tokens found in design token file. Aborting build.'
    );
    return;
  }

  const lightVars = [];
  const darkVars = [];

  // 1. Tokens (existing behaviour)
  if (json.tokens.light && json.tokens.dark) {
    flatten(json.tokens.light, [], { root: json, output: lightVars });
    flatten(json.tokens.dark, [], { root: json, output: darkVars });
  } else {
    // single-mode tokens collection
    flatten(json.tokens, [], { root: json, output: lightVars });
  }

  // 2. Raw variables – Colors (mode-aware)
  if (json.colors && json.colors.light && json.colors.dark) {
    flatten(json.colors.light, [], { root: json, output: lightVars });
    flatten(json.colors.dark, [], { root: json, output: darkVars });
  } else if (json.colors) {
    // Single-mode color palette
    flatten(json.colors, [], { root: json, output: lightVars });
  }

  // 3. Raw variables – mode-independent collections
  const RAW_INDEPENDENT_KEYS = ['gradient', 'effect', 'collection'];
  for (const key of RAW_INDEPENDENT_KEYS) {
    if (json[key]) {
      flatten(json[key], [], { root: json, output: lightVars });
    }
  }

  // Typography tokens – mode-independent (existing behaviour)
  if (json.typography) {
    const typoVars = [];
    flatten(json.typography, ['typography'], { root: json, output: typoVars });
    lightVars.push(...typoVars);
  }

  // De-duplicate while preserving first occurrence order
  const dedupe = (arr) => [...new Set(arr)];

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const cssLight = dedupe(lightVars).join('\n  ');
  const cssDark = dedupe(darkVars).join('\n  ');
  const css =
    `/* AUTO-GENERATED – DO NOT EDIT BY HAND */\n:root {\n  ${cssLight}\n}\n\n` +
    (darkVars.length
      ? `[data-theme='dark'], .theme-dark {\n  ${cssDark}\n}\n`
      : '');

  fs.writeFileSync(OUTPUT_FILE, css);
  console.log(
    `[tokens] Built CSS variables → ${path.relative(process.cwd(), OUTPUT_FILE)} (${lightVars.length + darkVars.length} vars)`
  );
}

const watch = process.argv.includes('--watch');

build();

if (watch) {
  /* eslint-disable no-console */
  console.log('[tokens] Watching for token changes…');
  fs.watchFile(SOURCE_PATH, { interval: 1000 }, () => {
    try {
      build();
    } catch (err) {
      console.error('[tokens] Build failed', err);
    }
  });
}
