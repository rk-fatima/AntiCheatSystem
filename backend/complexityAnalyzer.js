/**
 * QUBIT Complexity Analyzer
 * Static code analysis engine to assess Time and Space (Auxiliary) Complexity
 * for Python, C, C++, and Java solutions.
 */

export const DEFAULT_TIME_COMPLEXITY_DEDUCTIONS = {
  'O(1)': 0,
  'O(log n)': 5,
  'O(n)': 10,
  'O(n log n)': 15,
  'O(n^2)': 25,
  'O(n²)': 25,
  'O(n^3)': 40,
  'O(n³)': 40,
  'O(2^n)': 60,
  'O(2ⁿ)': 60,
  'O(n!)': 80
};

export const DEFAULT_SPACE_COMPLEXITY_DEDUCTIONS = {
  'O(1)': 0,
  'O(log n)': 5,
  'O(n)': 10,
  'O(n^2)': 20,
  'O(n²)': 20,
  'O(n^3+)': 30,
  'O(n³+)': 30
};

export const SUPPORTED_TIME_COMPLEXITIES = [
  { key: 'O(1)', label: 'O(1) — Constant', deduction: 0 },
  { key: 'O(log n)', label: 'O(log n) — Logarithmic', deduction: 5 },
  { key: 'O(n)', label: 'O(n) — Linear', deduction: 10 },
  { key: 'O(n log n)', label: 'O(n log n) — Linearithmic', deduction: 15 },
  { key: 'O(n²)', label: 'O(n²) — Quadratic', deduction: 25 },
  { key: 'O(n³)', label: 'O(n³) — Cubic', deduction: 40 },
  { key: 'O(2ⁿ)', label: 'O(2ⁿ) — Exponential', deduction: 60 },
  { key: 'O(n!)', label: 'O(n!) — Factorial', deduction: 80 }
];

export const SUPPORTED_SPACE_COMPLEXITIES = [
  { key: 'O(1)', label: 'O(1) — Constant', deduction: 0 },
  { key: 'O(log n)', label: 'O(log n) — Logarithmic', deduction: 5 },
  { key: 'O(n)', label: 'O(n) — Linear', deduction: 10 },
  { key: 'O(n²)', label: 'O(n²) — Quadratic', deduction: 20 },
  { key: 'O(n³+)', label: 'O(n³) or higher — Cubic / Higher', deduction: 30 }
];

export function normalizeTimeComplexityKey(key) {
  if (!key) return 'O(n)';
  const s = String(key).trim();
  if (/O\s*\(\s*1\s*\)/i.test(s) || /constant/i.test(s)) return 'O(1)';
  if (/O\s*\(\s*log\s*n\s*\)/i.test(s) || /logarithmic/i.test(s)) return 'O(log n)';
  if (/O\s*\(\s*n\s*log\s*n\s*\)/i.test(s) || /linearithmic/i.test(s)) return 'O(n log n)';
  if (/O\s*\(\s*n\s*!\s*\)/i.test(s) || /factorial/i.test(s)) return 'O(n!)';
  if (/O\s*\(\s*2\s*[\^ⁿ]\s*n\s*\)/i.test(s) || /exponential/i.test(s)) return 'O(2ⁿ)';
  if (/O\s*\(\s*n\s*[\^³3]\s*\)/i.test(s) || /cubic/i.test(s)) return 'O(n³)';
  if (/O\s*\(\s*n\s*[\^²2]\s*\)/i.test(s) || /quadratic/i.test(s)) return 'O(n²)';
  if (/O\s*\(\s*n\s*\)/i.test(s) || /linear/i.test(s)) return 'O(n)';
  return 'O(n)';
}

export function normalizeSpaceComplexityKey(key) {
  if (!key) return 'O(1)';
  const s = String(key).trim();
  if (/O\s*\(\s*1\s*\)/i.test(s) || /constant/i.test(s)) return 'O(1)';
  if (/O\s*\(\s*log\s*n\s*\)/i.test(s) || /logarithmic/i.test(s)) return 'O(log n)';
  if (/O\s*\(\s*n\s*[\^³3]/i.test(s) || /cubic|higher/i.test(s)) return 'O(n³+)';
  if (/O\s*\(\s*n\s*[\^²2]\s*\)/i.test(s) || /quadratic/i.test(s)) return 'O(n²)';
  if (/O\s*\(\s*n\s*\)/i.test(s) || /linear/i.test(s)) return 'O(n)';
  return 'O(1)';
}

/**
 * Remove comments and strings so code structure can be accurately inspected.
 */
function cleanCode(code, lang) {
  if (!code) return '';
  let str = String(code);

  if (lang === 'python') {
    // Strip triple-quoted strings/docstrings
    str = str.replace(/'''[\s\S]*?'''/g, '');
    str = str.replace(/"""[\s\S]*?"""/g, '');
    // Strip single-line comments
    str = str.replace(/#.*$/gm, '');
  } else {
    // C, C++, Java: strip multi-line comments
    str = str.replace(/\/\*[\s\S]*?\*\//g, '');
    // Strip single-line comments
    str = str.replace(/\/\/.*$/gm, '');
  }

  // Strip regular double and single quoted strings
  str = str.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  str = str.replace(/'(?:[^'\\]|\\.)*'/g, "''");

  return str;
}

/**
 * Calculate maximum loop nesting depth.
 */
function calculateLoopNesting(code, lang) {
  const cleaned = cleanCode(code, lang);
  const lines = cleaned.split('\n');

  if (lang === 'python') {
    // Python indentation-based loop nesting
    const loopStack = []; // stores indentation levels of active loops
    let maxDepth = 0;

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      const indent = rawLine.search(/\S/);

      // Pop any loops from the stack whose indentation is >= current line
      while (loopStack.length > 0 && indent <= loopStack[loopStack.length - 1]) {
        loopStack.pop();
      }

      // Check if line starts a loop
      if (/^(for\s|while\s)/.test(trimmed)) {
        loopStack.push(indent);
        if (loopStack.length > maxDepth) {
          maxDepth = loopStack.length;
        }
      }
    }
    return maxDepth;
  } else {
    // C / C++ / Java brace / loop nesting
    let currentDepth = 0;
    let maxDepth = 0;
    const tokens = cleaned.match(/\bfor\b|\bwhile\b|\{|\}/g) || [];

    const loopScopes = []; // tracks open loop brace levels

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok === 'for' || tok === 'while') {
        currentDepth++;
        if (currentDepth > maxDepth) maxDepth = currentDepth;
        loopScopes.push(true);
      } else if (tok === '}') {
        if (loopScopes.length > 0) {
          loopScopes.pop();
          if (currentDepth > 0) currentDepth--;
        }
      }
    }
    return maxDepth;
  }
}

/**
 * Check if the algorithm uses binary search or divide-by-2 patterns.
 */
function hasBinarySearchPattern(code) {
  const pattern = /mid\s*=\s*\(|low\s*<=\s*high|left\s*<=\s*right|binary_search|bisect_left|bisect_right|Arrays\.binarySearch|std::lower_bound|std::upper_bound|n\s*\/\/=\s*2|n\s*\/=\s*2|n\s*>>=\s*1|i\s*\*=\s*2|>>=\s*1/i;
  return pattern.test(code);
}

/**
 * Check for sorting operations.
 */
function hasSortingCall(code) {
  const sortPatterns = /\.sort\s*\(|sorted\s*\(|Arrays\.sort|Collections\.sort|std::sort|qsort\s*\(|sort\s*\(begin/i;
  return sortPatterns.test(code);
}

/**
 * Check for recursion and branching factor.
 */
function analyzeRecursion(code, lang) {
  const cleaned = cleanCode(code, lang);

  // Extract function definitions
  let funcNames = [];
  if (lang === 'python') {
    const matches = cleaned.matchAll(/def\s+([a-zA-Z0-9_]+)\s*\(/g);
    for (const m of matches) {
      if (m[1] && m[1] !== '__init__') funcNames.push(m[1]);
    }
  } else {
    const matches = cleaned.matchAll(/(?:void|int|long|double|float|bool|boolean|String|auto|vector<[^>]+>|List<[^>]+>)\s+([a-zA-Z0-9_]+)\s*\(/g);
    for (const m of matches) {
      if (m[1] && m[1] !== 'main') funcNames.push(m[1]);
    }
  }

  let maxBranching = 0;
  let recursiveFuncName = null;

  for (const fn of funcNames) {
    const regex = new RegExp(`\\b${fn}\\s*\\(`, 'g');
    const calls = (cleaned.match(regex) || []).length;
    // Minus 1 for definition itself
    const recursiveCalls = Math.max(0, calls - 1);
    if (recursiveCalls > maxBranching) {
      maxBranching = recursiveCalls;
      recursiveFuncName = fn;
    }
  }

  const hasMemoization = /@lru_cache|memo|cache|dp\[|table\[|visited|memoization/i.test(cleaned);

  return {
    isRecursive: maxBranching > 0,
    recursiveFuncName,
    maxBranching,
    hasMemoization
  };
}

/**
 * Check for permutations / factorial pattern.
 */
function hasPermutationsPattern(code) {
  return /permutations|next_permutation|itertools\.permutations|factorial/i.test(code);
}

/**
 * Analyze auxiliary space complexity.
 */
function analyzeAuxiliarySpace(code, lang, recursionInfo) {
  const cleaned = cleanCode(code, lang);

  // 1. Check for 3D array / tensor
  if (/\[\s*\[\s*\[|new\s+[a-zA-Z0-9_]+\[\s*[a-zA-Z0-9_]+\s*\]\[\s*[a-zA-Z0-9_]+\s*\]\[\s*[a-zA-Z0-9_]+\s*\]|vector<\s*vector<\s*vector</i.test(cleaned)) {
    return {
      space: 'O(n^3+)',
      reason: '3D matrix or tensor dynamically allocated for multi-dimensional state storage.'
    };
  }

  // 2. Check for 2D matrix / DP table
  if (/\[\s*\[.*?\]\s*\*\s*[a-zA-Z0-9_]+\s*for|\[\s*\[.*?for.*?for|new\s+[a-zA-Z0-9_]+\[.*?\]\[.*?\]|vector<\s*vector<|int\s+dp\[\d+\]\[\d+\]/i.test(cleaned)) {
    return {
      space: 'O(n^2)',
      reason: '2D grid or matrix table dynamically allocated proportional to N².'
    };
  }

  // 3. Check for 1D dynamic structures (Hash maps, Hash sets, dynamic arrays, vectors)
  const has1DCollections = /new\s+(?:HashMap|HashSet|ArrayList|LinkedList|vector|unordered_map|unordered_set|set|map)|\[\s*0\s*\]\s*\*\s*n|\.append\(|\.push_back\(|new\s+[a-zA-Z0-9_]+\[\s*[a-zA-Z0-9_]+\s*\]|dict\(\)|set\(\)|defaultdict|Counter/i.test(cleaned);

  if (has1DCollections || (recursionInfo.isRecursive && !hasBinarySearchPattern(cleaned))) {
    return {
      space: 'O(n)',
      reason: has1DCollections
        ? 'Linear 1D collection (hash table, dynamic array, or visited set) allocated proportional to input size N.'
        : 'Linear recursion call stack depth proportional to input size N.'
    };
  }

  // 4. Check for Logarithmic recursion stack
  if (recursionInfo.isRecursive && hasBinarySearchPattern(cleaned)) {
    return {
      space: 'O(log n)',
      reason: 'Logarithmic recursion call stack of depth O(log n) during divide-and-conquer.'
    };
  }

  // 5. Default Constant Space
  return {
    space: 'O(1)',
    reason: 'Constant O(1) auxiliary space: only scalar variables and pointers allocated in memory.'
  };
}

/**
 * Main Static Complexity Assessment Entry Point
 */
export function analyzeComplexity(code, lang = 'python', problem = null) {
  if (!code || typeof code !== 'string') {
    return {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      timeDeduction: 10,
      spaceDeduction: 0,
      reviewStatus: 'AUTOMATED',
      reason: 'Standard linear time default evaluation.',
      details: {}
    };
  }

  const loopDepth = calculateLoopNesting(code, lang);
  const isBinarySearch = hasBinarySearchPattern(code);
  const isSort = hasSortingCall(code);
  const recursion = analyzeRecursion(code, lang);
  const isPermutation = hasPermutationsPattern(code);
  const spaceAnalysis = analyzeAuxiliarySpace(code, lang, recursion);

  let timeComplexity = 'O(n)';
  let reviewStatus = 'AUTOMATED';
  let timeReason = '';

  // Determine Time Complexity based on hierarchy of algorithmic constructs
  if (isPermutation) {
    timeComplexity = 'O(n!)';
    timeReason = 'Factorial permutations generation pattern detected.';
  } else if (recursion.isRecursive && recursion.maxBranching >= 2 && !recursion.hasMemoization) {
    timeComplexity = 'O(2^n)';
    timeReason = `Exponential recursion detected with branching factor of ${recursion.maxBranching} without memoization.`;
  } else if (loopDepth >= 3) {
    timeComplexity = 'O(n^3)';
    timeReason = `Cubic time: 3 or more nested loop levels detected (depth = ${loopDepth}).`;
  } else if (loopDepth === 2) {
    if (isSort) {
      timeComplexity = 'O(n^3)';
      timeReason = 'Quadratic nested loops containing internal sort operation.';
    } else {
      timeComplexity = 'O(n^2)';
      timeReason = 'Quadratic time: 2 nested loop levels detected.';
    }
  } else if (isSort) {
    timeComplexity = 'O(n log n)';
    timeReason = 'Linearithmic time: sorting operation utilized (O(n log n)).';
  } else if (loopDepth === 1) {
    if (isBinarySearch) {
      timeComplexity = 'O(log n)';
      timeReason = 'Logarithmic time: single loop dividing search space (binary search pattern).';
    } else {
      timeComplexity = 'O(n)';
      timeReason = 'Linear time: single pass loop traversing input elements.';
    }
  } else if (loopDepth === 0) {
    if (recursion.isRecursive) {
      if (isBinarySearch) {
        timeComplexity = 'O(log n)';
        timeReason = 'Logarithmic time: recursive binary search dividing search space.';
      } else {
        timeComplexity = 'O(n)';
        timeReason = 'Linear time: single linear recursion pass through input elements.';
      }
    } else {
      timeComplexity = 'O(1)';
      timeReason = 'Constant time O(1): no loops or recursive calls detected; direct calculation or lookup.';
    }
  }

  // If complex or ambiguous recursion without clear boundaries, mark for Admin Review
  if (recursion.isRecursive && recursion.maxBranching > 1 && recursion.hasMemoization) {
    reviewStatus = 'PENDING_REVIEW';
    timeReason += ' (Memoized recursive branching flagged for organizer verification).';
  }

  // Calculate deductions
  const timeDeduction = DEFAULT_TIME_COMPLEXITY_DEDUCTIONS[timeComplexity] ?? 10;
  const spaceDeduction = DEFAULT_SPACE_COMPLEXITY_DEDUCTIONS[spaceAnalysis.space] ?? 0;

  return {
    timeComplexity,
    spaceComplexity: spaceAnalysis.space,
    timeDeduction,
    spaceDeduction,
    reviewStatus,
    reason: `${timeReason} | Auxiliary Space: ${spaceAnalysis.reason}`,
    details: {
      loopDepth,
      hasSorting: isSort,
      isBinarySearch,
      isRecursive: recursion.isRecursive,
      maxBranching: recursion.maxBranching,
      hasMemoization: recursion.hasMemoization,
      isPermutation,
      spaceReason: spaceAnalysis.reason
    }
  };
}

export function calculateComplexityAdjustedScore({
  baseScore = 200,
  timeDeduction = 0,
  spaceDeduction = 0
}) {
  const net = baseScore - timeDeduction - spaceDeduction;
  return Math.max(0, net);
}
