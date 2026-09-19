# Tab Expansion Formatter

A small library for expanding tabs to spaces and contracting leading spaces to tabs, with configurable tab width and column-aware positioning.

```js
import { expandTabs, contractTabs } from './src/index.js';

const expanded = expandTabs('\tx', 4);
console.log(expanded); // "    x"

const contracted = contractTabs('        x', 4);
console.log(contracted); // "\t\tx"
```

## Why this library exists

Most text editors expand tabs using tab stops at fixed column intervals, but many hand-rolled formatters treat a tab as a fixed number of spaces regardless of the current column. That produces misaligned output whenever a tab follows text. This library implements the column-aware behaviour directly, with no dependencies, so it can be used in build scripts and small tools without pulling in a full text-processing framework.

## Trade-off and edge cases

Contraction is not uniquely defined: the same expanded text can come from different tab/space combinations. This library defines contraction as replacing the longest possible run of leading spaces that ends exactly at a tab stop, working left to right. For example, seven leading spaces with tab width 4 become a tab followed by three spaces. A run of three leading spaces remains as spaces because it cannot reach the next tab stop.

Only leading whitespace on each line is contracted. Tabs that already exist are left untouched.
