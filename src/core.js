// Column-aware tab expansion and contraction.
//
// A "column" here is a zero-based index into the visual line, i.e. the
// number of characters between the start of the line and a given point,
// assuming every character occupies exactly one column. This is the only
// sane model for tab expansion in plain text; proportional fonts and
// double-width characters are out of scope.
//
// Expansion: each tab advances to the next tab stop. Tab stops are
// columns divisible by the tab width.
//
// Contraction: the inverse operation is not unique unless we decide how
// much leading whitespace each tab represents. We define contraction as
// replacing the longest possible run of leading spaces that ends at a tab
// stop with a tab, then repeating from the left. This matches the
// expansion algorithm for the common case where tabs are used for leading
// indentation only, and it keeps round-tripping predictable for mixed
// indentation that was produced by expanding tabs.

/**
 * Expand tabs in `text` using the given tab width.
 *
 * @param {string} text - The input text. May contain newlines.
 * @param {number} [tabWidth=4] - Positive integer tab width.
 * @returns {string} The text with tabs replaced by spaces.
 */
export function expandTabs(text, tabWidth = 4) {
  assertValidTabWidth(tabWidth);

  let result = '';
  let column = 0;

  for (const char of text) {
    if (char === '\t') {
      const spaces = tabWidth - (column % tabWidth);
      result += ' '.repeat(spaces);
      column += spaces;
    } else if (char === '\n') {
      result += char;
      column = 0;
    } else if (char === '\r') {
      // Preserve carriage returns but reset the column. The next character
      // may be a line feed, which will reset again harmlessly.
      result += char;
      column = 0;
    } else {
      result += char;
      column += 1;
    }
  }

  return result;
}

/**
 * Contract leading spaces to tabs in `text` using the given tab width.
 *
 * Only leading whitespace on each line is affected. Runs of spaces are
 * replaced by tabs greedily from the left: the longest run of spaces that
 * ends exactly at a tab stop is replaced with a tab, then the search
 * resumes after that tab. Any remaining spaces that do not fill a complete
 * tab stop are left as spaces.
 *
 * @param {string} text - The input text. May contain newlines.
 * @param {number} [tabWidth=4] - Positive integer tab width.
 * @returns {string} The text with leading space runs replaced by tabs where possible.
 */
export function contractTabs(text, tabWidth = 4) {
  assertValidTabWidth(tabWidth);

  const lines = text.split('\n');
  const contracted = lines.map((line) => contractLineLeadingSpaces(line, tabWidth));

  return contracted.join('\n');
}

/**
 * Replace the longest possible leading runs of spaces that end at tab stops
 * with tabs.
 *
 * The algorithm works left to right. At each position, it counts how many
 * spaces are available. If the count is enough to reach the next tab stop,
 * and if the character immediately after the counted spaces is not a space
 * (or we are at the end of the line), then the run ends exactly at a tab
 * stop and can be replaced. Otherwise the whole remaining run is left as
 * spaces.
 *
 * This greedy choice means that a line with seven leading spaces and tab
 * width 4 becomes a tab followed by three spaces, because the first four
 * spaces reach a tab stop and the remaining three cannot.
 *
 * @param {string} line - A single line with no newline characters.
 * @param {number} tabWidth - Positive integer tab width.
 * @returns {string} The line with leading space runs contracted.
 */
function contractLineLeadingSpaces(line, tabWidth) {
  let result = '';
  let i = 0;

  while (i < line.length && line[i] === ' ') {
    // Count the contiguous run of spaces starting at i.
    let runEnd = i;
    while (runEnd < line.length && line[runEnd] === ' ') {
      runEnd += 1;
    }

    const runLength = runEnd - i;
    const nextTabStop = tabWidth - (i % tabWidth);

    if (runLength >= nextTabStop) {
      // Replace the exact number of spaces that reaches the next tab stop.
      result += '\t';
      i += nextTabStop;
    } else {
      // Not enough spaces to reach a tab stop; keep them all.
      result += ' '.repeat(runLength);
      i = runEnd;
    }
  }

  // Append the rest of the line unchanged.
  result += line.slice(i);
  return result;
}

/**
 * @param {number} tabWidth
 */
function assertValidTabWidth(tabWidth) {
  if (!Number.isInteger(tabWidth) || tabWidth <= 0) {
    throw new RangeError(`tabWidth must be a positive integer, got ${tabWidth}`);
  }
}
