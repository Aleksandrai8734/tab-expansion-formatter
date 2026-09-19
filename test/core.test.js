import { test } from 'node:test';
import assert from 'node:assert/strict';

import { expandTabs, contractTabs } from '../src/core.js';

test('expandTabs with default width replaces tab at column 0', () => {
  assert.equal(expandTabs('\tx'), '    x');
});

test('expandTabs uses configurable tab width', () => {
  assert.equal(expandTabs('\tx', 2), '  x');
});

test('expandTabs handles tab after text', () => {
  assert.equal(expandTabs('ab\tx', 4), 'ab  x');
});

test('expandTabs handles tab exactly at tab stop', () => {
  assert.equal(expandTabs('abcd\tx', 4), 'abcd    x');
});

test('expandTabs resets column at newline', () => {
  assert.equal(expandTabs('a\n\tx', 4), 'a\n    x');
});

test('expandTabs handles carriage return as line reset', () => {
  assert.equal(expandTabs('a\r\tx', 4), 'a\r    x');
});

test('expandTabs with multiple tabs advances across tab stops', () => {
  assert.equal(expandTabs('\t\t', 4), '        ');
});

test('expandTabs throws on non-positive tab width', () => {
  assert.throws(() => expandTabs('x', 0), RangeError);
  assert.throws(() => expandTabs('x', -1), RangeError);
});

test('expandTabs throws on non-integer tab width', () => {
  assert.throws(() => expandTabs('x', 1.5), RangeError);
});

test('contractTabs replaces leading spaces with tabs', () => {
  assert.equal(contractTabs('    x', 4), '\tx');
});

test('contractTabs only affects leading whitespace', () => {
  assert.equal(contractTabs('    x    y', 4), '\tx    y');
});

test('contractTabs leaves spaces that do not reach tab stop', () => {
  assert.equal(contractTabs('   x', 4), '   x');
});

test('contractTabs replaces longest possible runs from left', () => {
  assert.equal(contractTabs('       x', 4), '\t   x');
});

test('contractTabs handles multiple lines independently', () => {
  assert.equal(contractTabs('    a\n        b', 4), '\ta\n\t\tb');
});

test('contractTabs preserves empty lines', () => {
  assert.equal(contractTabs('\n    x\n', 4), '\n\tx\n');
});

test('contractTabs handles tab width 2', () => {
  assert.equal(contractTabs('  x', 2), '\tx');
  assert.equal(contractTabs('   x', 2), '\t x');
});

test('contractTabs with leading tabs leaves them untouched', () => {
  assert.equal(contractTabs('\t  x', 4), '\t  x');
});

test('round trip: expand then contract returns original for leading-tab indentation', () => {
  const original = '\t\tfunction foo() {\n\t\t\treturn 1;\n\t\t}';
  const expanded = expandTabs(original, 4);
  assert.equal(contractTabs(expanded, 4), original);
});

test('contractTabs throws on invalid tab width', () => {
  assert.throws(() => contractTabs('x', 0), RangeError);
  assert.throws(() => contractTabs('x', 2.5), RangeError);
});
