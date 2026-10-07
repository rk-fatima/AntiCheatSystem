// Predefined Algorithmic Hints for Competitive Programming Problem Set

const SPECIFIC_HINTS = {
  E1: "Use a Hash Map to store elements and their indices in a single pass. For each element x, check if (target - x) already exists in the map to achieve O(N) time complexity.",
  E2: "Negative numbers are never palindromes. You can check equality by comparing characters from both ends, or mathematically reverse only the second half of the digits and compare with the first half.",
  E3: "Use a Stack data structure. Push opening brackets '(', '{', '['. When encountering a closing bracket, check if the stack top matches the corresponding opening bracket and pop it. String is valid if stack is empty at the end.",
  E4: "Use a dummy head pointer to simplify edge cases. Iteratively compare the current node values of both lists, attaching the smaller node to the merged list and advancing its pointer.",
  E5: "Use the Two-Pointers technique (slow and fast pointers). Since the array is sorted, whenever nums[fast] != nums[slow], advance slow and copy nums[fast] to nums[slow].",
  E6: "Use Two Pointers: maintain a pointer k for valid placements. Iterate through the array; if the current element does not equal the target value, place it at index k and increment k.",
  E7: "Use Binary Search: initialize left = 0 and right = n - 1. When nums[mid] >= target, look in the left half; otherwise look in the right half. The insertion index will be the final left pointer position.",
  E8: "Traverse the array from the rightmost digit to the left. If a digit is less than 9, increment it and return immediately. If it's 9, set it to 0 and continue. If all digits were 9, prepend a 1.",
  E9: "Use two pointers starting at the ends of both binary strings. Keep track of a carry variable (0 or 1). Sum the bits plus carry, take sum % 2 as the new bit, and update carry = sum / 2.",
  E10: "Iterate through the linked list. While current.next exists and current.val == current.next.val, bypass the duplicate node by pointing current.next = current.next.next.",
  E11: "Use recursion or a Queue (BFS). For trees to be identical, root values must match, and the left subtrees must be identical, and the right subtrees must be identical.",
  E12: "Use DFS / recursion with a helper function: compare leftSubtree.left with rightSubtree.right, and leftSubtree.right with rightSubtree.left.",
  E13: "Use recursion: maxDepth(root) = 1 + max(maxDepth(root.left), maxDepth(root.right)). Base case: if root is null, return 0.",
  E14: "The middle element of a sorted array is the root of the balanced BST. Recursively construct the left subtree from the left half and the right subtree from the right half.",
  E15: "Use dynamic programming or Fibonacci observation: ways(n) = ways(n-1) + ways(n-2). Keep two variables for previous steps to solve in O(N) time and O(1) space.",
  E16: "Use Two Pointers starting from both ends. Move inward skipping non-alphanumeric characters, and compare lowercase characters.",
  E17: "Use XOR bitwise property: x ^ x = 0 and x ^ 0 = x. XOR-ing all elements in the array cancels out all duplicate pairs, leaving only the single unique number in O(N) time and O(1) space.",
  E18: "Use Boyer-Moore Voting Algorithm: maintain a candidate and a count. When count is 0, pick current element as candidate. Increment count when element matches candidate, decrement otherwise.",
  E19: "Reverse the linked list in-place by maintaining three pointers: prev, current, and next.",
  E20: "Pre-calculate digital root or use math: for non-zero numbers, the digital root is 1 + ((num - 1) % 9).",

  // Medium Problems
  M1: "Maintain a Hash Set of characters currently in your sliding window. Expand the right pointer; if a character repeats, shrink the window from the left until the duplicate is removed.",
  M2: "Use Two Pointers starting at index 0 and index N-1. The area is min(height[left], height[right]) * (right - left). Always advance the pointer with the smaller height.",
  M3: "Sort the array first. Fix the first element nums[i], then use Two Pointers (left and right) on the remaining subarray to find pairs summing to -nums[i]. Skip duplicate elements to avoid redundant triplets.",
  M4: "Use Two Pointers (Dutch National Flag algorithm): keep low at beginning, high at end, and mid traversing. Swap 0s to low, 2s to high, and advance mid for 1s.",
  M5: "Use Kadane's Algorithm: maintain current_sum = max(nums[i], current_sum + nums[i]) and update max_sum = max(max_sum, current_sum).",
  M6: "Use Dynamic Programming: dp[i] represents minimum coins needed for amount i. For each coin c, dp[i] = min(dp[i], 1 + dp[i - c]).",
  M7: "Use Dynamic Programming: dp[i] is true if s[0...i] can be segmented into dictionary words. Check all valid prefixes.",

  // Hard Problem
  H1: "Use Binary Search on the partition of the smaller array. Partition both arrays such that the left halves have the same number of elements as the right halves and max(left) <= min(right)."
};

const CATEGORY_HINTS = {
  'Arrays / Hash Table': "Hash Maps provide O(1) average lookup. Store complements, frequencies, or prefix sums to avoid nested loops.",
  'Math': "Look for mathematical invariants, modular arithmetic properties, or number theory patterns to solve in O(1) or O(log N).",
  'Stack / Strings': "Stacks are ideal for matching pairs, evaluating expressions, and tracking monotonically increasing/decreasing elements.",
  'Linked List / Two Pointers': "Two pointers (fast & slow) can detect cycles, locate the middle element, or maintain fixed window intervals.",
  'Arrays / Two Pointers': "Sorting allows two pointers from opposite ends or a slow/fast pointer combination to process elements in O(N).",
  'Binary Search': "Identify a monotonic condition. Maintain [left, right] bounds and eliminate half the search space on each step.",
  'Bit Manipulation': "Consider bitwise operators: XOR cancels duplicates, `n & (n - 1)` drops the lowest set bit, and shifts check bit positions.",
  'Dynamic Programming': "Define the state: what represents a subproblem? Formulate the recurrence relation and store results to avoid recalculating.",
  'Trees': "Tree problems usually reduce to recursive DFS (pre-order, in-order, post-order) or iterative BFS using a queue level-by-level.",
  'Sliding Window': "Expand the window with a right pointer while valid; shrink from the left pointer when a constraint is violated.",
  'Greedy': "Make the locally optimal choice at each step. Verify whether sorting the input enables a greedy strategy."
};

function getPredefinedHint(problem) {
  if (!problem) return "Analyze constraints and consider using appropriate data structures like Hash Tables or Two Pointers.";

  const id = (problem.id || '').toUpperCase();
  if (SPECIFIC_HINTS[id]) {
    return SPECIFIC_HINTS[id];
  }

  const origId = (problem.origId || '').toUpperCase();
  if (SPECIFIC_HINTS[origId]) {
    return SPECIFIC_HINTS[origId];
  }

  if (problem.cat && CATEGORY_HINTS[problem.cat]) {
    return `${CATEGORY_HINTS[problem.cat]} Focus on ${problem.title}: decompose into subproblems and track edge cases.`;
  }

  for (const [catKey, hintText] of Object.entries(CATEGORY_HINTS)) {
    if (problem.cat && problem.cat.includes(catKey.split('/')[0].trim())) {
      return `${hintText} Focus on ${problem.title}.`;
    }
  }

  return `Algorithm Strategy for "${problem.title}": Analyze the time/space constraints. Consider sorting, hashing, or two-pointer traversal to optimize beyond brute-force.`;
}

export {
  getPredefinedHint,
  SPECIFIC_HINTS
};
export default getPredefinedHint;
