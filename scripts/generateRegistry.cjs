const fs = require('fs');
const path = require('path');

const problems = JSON.parse(fs.readFileSync('./frontend/src/data/problems.json', 'utf-8')).problems;

// Map of canonical LC function signatures
const lcMap = {
  LC1: { fn: "twoSum", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"], ["target", "int", "int", "int", "int"]], ret: ["vector<int>", "list[int]", "int[]", "int*"], exp: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
  LC2: { fn: "addTwoNumbers", args: [["l1", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], ["l2", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"]], ret: ["ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], exp: "342 + 465 = 807." },
  LC4: { fn: "findMedianSortedArrays", args: [["nums1", "vector<int>&", "list[int]", "int[]", "int*"], ["nums2", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["double", "float", "double", "double"], exp: "merged array = [1,2,3] and median is 2.0." },
  LC7: { fn: "reverse", args: [["x", "int", "int", "int", "int"]], ret: ["int", "int", "int", "int"], exp: "Reversed digits of 123 is 321." },
  LC9: { fn: "isPalindrome", args: [["x", "int", "int", "int", "int"]], ret: ["bool", "bool", "boolean", "bool"], exp: "121 reads as 121 from left to right and from right to left." },
  LC11: { fn: "maxArea", args: [["height", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["int", "int", "int", "int"], exp: "The max area of water the container can contain is 49." },
  LC19: { fn: "removeNthFromEnd", args: [["head", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], ["n", "int", "int", "int", "int"]], ret: ["ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], exp: "Remove the 2nd node from end." },
  LC20: { fn: "isValid", args: [["s", "string", "str", "String", "char*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Open brackets must be closed by the same type of brackets in the correct order." },
  LC21: { fn: "mergeTwoLists", args: [["list1", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], ["list2", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"]], ret: ["ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], exp: "Merged into a single sorted list." },
  LC26: { fn: "removeDuplicates", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["int", "int", "int", "int"], exp: "Returns k = number of unique elements." },
  LC27: { fn: "removeElement", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"], ["val", "int", "int", "int", "int"]], ret: ["int", "int", "int", "int"], exp: "Removes all occurrences of val in-place." },
  LC33: { fn: "search", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"], ["target", "int", "int", "int", "int"]], ret: ["int", "int", "int", "int"], exp: "Return index of target if found, else -1." },
  LC35: { fn: "searchInsert", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"], ["target", "int", "int", "int", "int"]], ret: ["int", "int", "int", "int"], exp: "Return target index or insert position." },
  LC53: { fn: "maxSubArray", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["int", "int", "int", "int"], exp: "The subarray with the largest sum is [4,-1,2,1] with sum 6." },
  LC66: { fn: "plusOne", args: [["digits", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["vector<int>", "list[int]", "int[]", "int*"], exp: "Incrementing by one gives [1,2,4]." },
  LC67: { fn: "addBinary", args: [["a", "string", "str", "String", "char*"], ["b", "string", "str", "String", "char*"]], ret: ["string", "str", "String", "char*"], exp: "Binary sum of 11 and 1 is 100." },
  LC75: { fn: "sortColors", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["void", "None", "void", "void"], exp: "Sort objects in-place so colors 0, 1, 2 are adjacent." },
  LC83: { fn: "deleteDuplicates", args: [["head", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"]], ret: ["ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], exp: "Remove all duplicates from sorted list." },
  LC88: { fn: "merge", args: [["nums1", "vector<int>&", "list[int]", "int[]", "int*"], ["m", "int", "int", "int", "int"], ["nums2", "vector<int>&", "list[int]", "int[]", "int*"], ["n", "int", "int", "int", "int"]], ret: ["void", "None", "void", "void"], exp: "Merge nums2 into nums1 as one sorted array." },
  LC92: { fn: "reverseBetween", args: [["head", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], ["left", "int", "int", "int", "int"], ["right", "int", "int", "int", "int"]], ret: ["ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], exp: "Reverse nodes from position left to right." },
  LC94: { fn: "inorderTraversal", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["vector<int>", "list[int]", "List<Integer>", "int*"], exp: "Return inorder traversal of node values." },
  LC98: { fn: "isValidBST", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Determine if it is a valid binary search tree." },
  LC100: { fn: "isSameTree", args: [["p", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"], ["q", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Return true if trees are structurally identical." },
  LC101: { fn: "isSymmetric", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Return true if tree is symmetric around center." },
  LC103: { fn: "zigzagLevelOrder", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["vector<vector<int>>", "list[list[int]]", "List<List<Integer>>", "int**"], exp: "Zigzag level order traversal of binary tree." },
  LC104: { fn: "maxDepth", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["int", "int", "int", "int"], exp: "Max depth from root down to furthest leaf." },
  LC108: { fn: "sortedArrayToBST", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"], exp: "Convert sorted array into height-balanced BST." },
  LC111: { fn: "minDepth", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["int", "int", "int", "int"], exp: "Min depth to nearest leaf node." },
  LC112: { fn: "hasPathSum", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"], ["targetSum", "int", "int", "int", "int"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Check root-to-leaf path equals targetSum." },
  LC113: { fn: "pathSum", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"], ["targetSum", "int", "int", "int", "int"]], ret: ["vector<vector<int>>", "list[list[int]]", "List<List<Integer>>", "int**"], exp: "Return all root-to-leaf paths equaling targetSum." },
  LC119: { fn: "getRow", args: [["rowIndex", "int", "int", "int", "int"]], ret: ["vector<int>", "list[int]", "List<Integer>", "int*"], exp: "Return the kth row of Pascal triangle." },
  LC125: { fn: "isPalindrome", args: [["s", "string", "str", "String", "char*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Checks palindrome ignoring case and alphanumeric characters." },
  LC136: { fn: "singleNumber", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["int", "int", "int", "int"], exp: "Find the single element appearing once." },
  LC141: { fn: "hasCycle", args: [["head", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Detect if linked list contains a cycle." },
  LC142: { fn: "detectCycle", args: [["head", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"]], ret: ["ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], exp: "Return node where cycle begins." },
  LC143: { fn: "reorderList", args: [["head", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"]], ret: ["void", "None", "void", "void"], exp: "Reorder list in-place L0 -> Ln -> L1 -> Ln-1." },
  LC144: { fn: "preorderTraversal", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["vector<int>", "list[int]", "List<Integer>", "int*"], exp: "Preorder traversal of tree values." },
  LC145: { fn: "postorderTraversal", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["vector<int>", "list[int]", "List<Integer>", "int*"], exp: "Postorder traversal of tree values." },
  LC160: { fn: "getIntersectionNode", args: [["headA", "ListNode*", "ListNode", "ListNode", "struct ListNode*"], ["headB", "ListNode*", "ListNode", "ListNode", "struct ListNode*"]], ret: ["ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], exp: "Return the node where two lists intersect." },
  LC162: { fn: "findPeakElement", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["int", "int", "int", "int"], exp: "Find peak element strictly greater than neighbors." },
  LC167: { fn: "twoSum", args: [["numbers", "vector<int>&", "list[int]", "int[]", "int*"], ["target", "int", "int", "int", "int"]], ret: ["vector<int>", "list[int]", "int[]", "int*"], exp: "1-indexed Two Sum in sorted array." },
  LC169: { fn: "majorityElement", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["int", "int", "int", "int"], exp: "Element that appears more than n/2 times." },
  LC189: { fn: "rotate", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"], ["k", "int", "int", "int", "int"]], ret: ["void", "None", "void", "void"], exp: "Rotate array to right by k steps." },
  LC191: { fn: "hammingWeight", args: [["n", "int", "int", "int", "int"]], ret: ["int", "int", "int", "int"], exp: "Number of set 1 bits in integer." },
  LC199: { fn: "rightSideView", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["vector<int>", "list[int]", "List<Integer>", "int*"], exp: "Values visible from right side of tree." },
  LC203: { fn: "removeElements", args: [["head", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], ["val", "int", "int", "int", "int"]], ret: ["ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], exp: "Remove all nodes equal to val." },
  LC206: { fn: "reverseList", args: [["head", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"]], ret: ["ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], exp: "Reverse singly linked list." },
  LC217: { fn: "containsDuplicate", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Return true if any value appears at least twice." },
  LC222: { fn: "countNodes", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["int", "int", "int", "int"], exp: "Count total nodes in complete binary tree." },
  LC226: { fn: "invertTree", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"], exp: "Invert binary tree left and right children." },
  LC228: { fn: "summaryRanges", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["vector<string>", "list[str]", "List<String>", "char**"], exp: "Summary ranges of contiguous numbers." },
  LC231: { fn: "isPowerOfTwo", args: [["n", "int", "int", "int", "int"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Check if integer is power of two." },
  LC234: { fn: "isPalindrome", args: [["head", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Check if linked list is palindrome." },
  LC237: { fn: "deleteNode", args: [["node", "ListNode*", "ListNode", "ListNode", "struct ListNode*"]], ret: ["void", "None", "void", "void"], exp: "Delete node from linked list given only pointer to node." },
  LC242: { fn: "isAnagram", args: [["s", "string", "str", "String", "char*"], ["t", "string", "str", "String", "char*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Return true if t is anagram of s." },
  LC257: { fn: "binaryTreePaths", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["vector<string>", "list[str]", "List<String>", "char**"], exp: "All root-to-leaf paths as strings." },
  LC258: { fn: "addDigits", args: [["num", "int", "int", "int", "int"]], ret: ["int", "int", "int", "int"], exp: "Repeatedly add all digits until single digit." },
  LC268: { fn: "missingNumber", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["int", "int", "int", "int"], exp: "Return only number in range [0, n] missing." },
  LC283: { fn: "moveZeroes", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["void", "None", "void", "void"], exp: "Move all 0s to end while maintaining order." },
  LC290: { fn: "wordPattern", args: [["pattern", "string", "str", "String", "char*"], ["s", "string", "str", "String", "char*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Follow bijection pattern between char and word." },
  LC326: { fn: "isPowerOfThree", args: [["n", "int", "int", "int", "int"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Check if integer is power of three." },
  LC344: { fn: "reverseString", args: [["s", "vector<char>&", "list[str]", "char[]", "char*"]], ret: ["void", "None", "void", "void"], exp: "Reverse character array in-place." },
  LC347: { fn: "topKFrequent", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"], ["k", "int", "int", "int", "int"]], ret: ["vector<int>", "list[int]", "int[]", "int*"], exp: "Return k most frequent elements." },
  LC349: { fn: "intersection", args: [["nums1", "vector<int>&", "list[int]", "int[]", "int*"], ["nums2", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["vector<int>", "list[int]", "int[]", "int*"], exp: "Unique elements in both arrays." },
  LC374: { fn: "guessNumber", args: [["n", "int", "int", "int", "int"]], ret: ["int", "int", "int", "int"], exp: "Guess number using guess API." },
  LC383: { fn: "canConstruct", args: [["ransomNote", "string", "str", "String", "char*"], ["magazine", "string", "str", "String", "char*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Construct ransomNote from letters of magazine." },
  LC387: { fn: "firstUniqChar", args: [["s", "string", "str", "String", "char*"]], ret: ["int", "int", "int", "int"], exp: "Find first non-repeating character index." },
  LC392: { fn: "isSubsequence", args: [["s", "string", "str", "String", "char*"], ["t", "string", "str", "String", "char*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Check if s is subsequence of t." },
  LC412: { fn: "fizzBuzz", args: [["n", "int", "int", "int", "int"]], ret: ["vector<string>", "list[str]", "List<String>", "char**"], exp: "Fizz Buzz string representation from 1 to n." },
  LC415: { fn: "addStrings", args: [["num1", "string", "str", "String", "char*"], ["num2", "string", "str", "String", "char*"]], ret: ["string", "str", "String", "char*"], exp: "Sum of non-negative integers as string." },
  LC485: { fn: "findMaxConsecutiveOnes", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["int", "int", "int", "int"], exp: "Maximum consecutive 1s in binary array." },
  LC507: { fn: "checkPerfectNumber", args: [["num", "int", "int", "int", "int"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Number equals sum of proper divisors." },
  LC509: { fn: "fib", args: [["n", "int", "int", "int", "int"]], ret: ["int", "int", "int", "int"], exp: "Compute nth Fibonacci number." },
  LC520: { fn: "detectCapitalUse", args: [["word", "string", "str", "String", "char*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Valid usage of capitals in word." },
  LC543: { fn: "diameterOfBinaryTree", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"]], ret: ["int", "int", "int", "int"], exp: "Longest path between any two nodes in tree." },
  LC643: { fn: "findMaxAverage", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"], ["k", "int", "int", "int", "int"]], ret: ["double", "float", "double", "double"], exp: "Contiguous subarray of length k with max average." },
  LC645: { fn: "findErrorNums", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["vector<int>", "list[int]", "int[]", "int*"], exp: "Find duplicate and missing numbers." },
  LC693: { fn: "hasAlternatingBits", args: [["n", "int", "int", "int", "int"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Adjacent bits always have different values." },
  LC704: { fn: "search", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"], ["target", "int", "int", "int", "int"]], ret: ["int", "int", "int", "int"], exp: "Search target in sorted array in O(log n)." },
  LC860: { fn: "lemonadeChange", args: [["bills", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Provide correct change to each customer." },
  LC868: { fn: "binaryGap", args: [["n", "int", "int", "int", "int"]], ret: ["int", "int", "int", "int"], exp: "Longest distance between consecutive 1s in binary." },
  LC876: { fn: "middleNode", args: [["head", "ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"]], ret: ["ListNode*", "Optional[ListNode]", "ListNode", "struct ListNode*"], exp: "Return middle node of linked list." },
  LC1021: { fn: "removeOuterParentheses", args: [["s", "string", "str", "String", "char*"]], ret: ["string", "str", "String", "char*"], exp: "Remove outer parentheses of primitive valid components." },
  LC1051: { fn: "heightChecker", args: [["heights", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["int", "int", "int", "int"], exp: "Indices where heights[i] != expected[i]." },
  LC1266: { fn: "minTimeToVisitAllPoints", args: [["points", "vector<vector<int>>&", "list[list[int]]", "int[][]", "int**"]], ret: ["int", "int", "int", "int"], exp: "Min seconds to visit all points in order." },
  LC1290: { fn: "getDecimalValue", args: [["head", "ListNode*", "ListNode", "ListNode", "struct ListNode*"]], ret: ["int", "int", "int", "int"], exp: "Decimal value of binary linked list." },
  LC1752: { fn: "check", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Check if array was originally sorted and rotated." },
  LC1929: { fn: "getConcatenation", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["vector<int>", "list[int]", "int[]", "int*"], exp: "Concatenation of array of length 2n." },
  LC1941: { fn: "areOccurrencesEqual", args: [["s", "string", "str", "String", "char*"]], ret: ["bool", "bool", "boolean", "bool"], exp: "Check if all characters have equal frequencies." },
  LC2385: { fn: "amountOfTime", args: [["root", "TreeNode*", "Optional[TreeNode]", "TreeNode", "struct TreeNode*"], ["start", "int", "int", "int", "int"]], ret: ["int", "int", "int", "int"], exp: "Minutes to infect entire binary tree from start node." },
  LC3110: { fn: "scoreOfString", args: [["s", "string", "str", "String", "char*"]], ret: ["int", "int", "int", "int"], exp: "Sum of absolute difference of adjacent ASCII codes." },
  LC3467: { fn: "transformArray", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"]], ret: ["vector<int>", "list[int]", "int[]", "int*"], exp: "Replace even with 0 and odd with 1 then sort." },
  LC3512: { fn: "minOperations", args: [["nums", "vector<int>&", "list[int]", "int[]", "int*"], ["k", "int", "int", "int", "int"]], ret: ["int", "int", "int", "int"], exp: "Min operations to make array sum divisible by k." }
};

const workingSolutions = {
  E1: {
    python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, x in enumerate(nums):\n            if target - x in seen:\n                return [seen[target - x], i]\n            seen[x] = i\n        return []`,
    cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            if (seen.count(target - nums[i])) {\n                return {seen[target - nums[i]], i};\n            }\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
    java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            if (seen.containsKey(target - nums[i])) {\n                return new int[] { seen.get(target - nums[i]), i };\n            }\n            seen.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`,
    c: `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* res = (int*)malloc(2 * sizeof(int));\n    for (int i = 0; i < numsSize; i++) {\n        for (int j = i + 1; j < numsSize; j++) {\n            if (nums[i] + nums[j] == target) {\n                res[0] = i; res[1] = j;\n                return res;\n            }\n        }\n    }\n    return res;\n}`
  },
  E2: {
    python: `class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        if x < 0:\n            return False\n        s = str(x)\n        return s == s[::-1]`,
    cpp: `class Solution {\npublic:\n    bool isPalindrome(int x) {\n        if (x < 0) return false;\n        string s = to_string(x);\n        string r = s;\n        reverse(r.begin(), r.end());\n        return s == r;\n    }\n};`,
    java: `class Solution {\n    public boolean isPalindrome(int x) {\n        if (x < 0) return false;\n        String s = Integer.toString(x);\n        String r = new StringBuilder(s).reverse().toString();\n        return s.equals(r);\n    }\n}`,
    c: `bool isPalindrome(int x) {\n    if (x < 0) return false;\n    long long rev = 0, orig = x;\n    while (x > 0) {\n        rev = rev * 10 + (x % 10);\n        x /= 10;\n    }\n    return orig == rev;\n}`
  },
  E3: {
    python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        mapping = {')': '(', '}': '{', ']': '['}\n        for char in s:\n            if char in mapping:\n                top = stack.pop() if stack else '#'\n                if mapping[char] != top:\n                    return False\n            else:\n                stack.append(char)\n        return not stack`,
    cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == '(' || c == '{' || c == '[') st.push(c);\n            else {\n                if (st.empty()) return false;\n                if (c == ')' && st.top() != '(') return false;\n                if (c == '}' && st.top() != '{') return false;\n                if (c == ']' && st.top() != '[') return false;\n                st.pop();\n            }\n        }\n        return st.empty();\n    }\n};`,
    java: `class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}`,
    c: `bool isValid(char* s) {\n    char stack[10005];\n    int top = 0;\n    for (int i = 0; s[i]; i++) {\n        char c = s[i];\n        if (c == '(' || c == '{' || c == '[') stack[top++] = c;\n        else {\n            if (top == 0) return false;\n            char last = stack[--top];\n            if (c == ')' && last != '(') return false;\n            if (c == '}' && last != '{') return false;\n            if (c == ']' && last != '[') return false;\n        }\n    }\n    return top == 0;\n}`
  }
};

function formatRawInputToParams(prob, rawStdin) {
  const tokens = (rawStdin || "").trim().split(/\s+/).filter(Boolean);
  const origId = prob.origId;

  if (origId === "LC1" || origId === "LC167") {
    if (tokens.length >= 2) {
      const n = parseInt(tokens[0], 10);
      const target = tokens[1];
      const nums = tokens.slice(2, 2 + n);
      return { nums: `[${nums.join(', ')}]`, target };
    }
  }
  if (origId === "LC9" || origId === "LC7" || origId === "LC231" || origId === "LC258" || origId === "LC326" || origId === "LC507" || origId === "LC509" || origId === "LC868" || origId === "LC412" || origId === "LC191") {
    return { x: tokens[0] || "0" };
  }
  if (origId === "LC20" || origId === "LC125" || origId === "LC387" || origId === "LC1021" || origId === "LC1941" || origId === "LC3110") {
    return { s: `"${tokens[0] || ""}"` };
  }
  if (origId === "LC26" || origId === "LC53" || origId === "LC75" || origId === "LC136" || origId === "LC169" || origId === "LC217" || origId === "LC268" || origId === "LC283" || origId === "LC485" || origId === "LC1752" || origId === "LC1929" || origId === "LC3467" || origId === "LC66") {
    if (tokens.length >= 1) {
      const n = parseInt(tokens[0], 10);
      const nums = tokens.slice(1, 1 + n);
      return { nums: `[${nums.join(', ')}]` };
    }
  }
  if (origId === "LC27") {
    if (tokens.length >= 2) {
      const n = parseInt(tokens[0], 10);
      const val = tokens[1];
      const nums = tokens.slice(2, 2 + n);
      return { nums: `[${nums.join(', ')}]`, val };
    }
  }
  if (origId === "LC33" || origId === "LC35" || origId === "LC704" || origId === "LC347") {
    if (tokens.length >= 2) {
      const n = parseInt(tokens[0], 10);
      const target = tokens[1];
      const nums = tokens.slice(2, 2 + n);
      return { nums: `[${nums.join(', ')}]`, target };
    }
  }
  if (origId === "LC67" || origId === "LC242" || origId === "LC383" || origId === "LC392" || origId === "LC415") {
    return { a: `"${tokens[0] || ""}"`, b: `"${tokens[1] || ""}"` };
  }

  return { input: tokens.join(' ') };
}

function parseHiddenTests(htString) {
  if (!htString || !htString.trim()) return [];
  const tests = [];
  const blocks = htString.split(/\r?\n===\r?\n/);
  for (const block of blocks) {
    if (!block.trim()) continue;
    const parts = block.split(/\r?\n---\r?\n/);
    if (parts.length >= 2) {
      tests.push({
        input: parts[0],
        expected: parts.slice(1).join('\n---\n')
      });
    }
  }
  return tests;
}

const registry = {};

problems.forEach(p => {
  const meta = lcMap[p.origId] || {
    fn: "solve",
    args: [["input", "string", "str", "String", "char*"]],
    ret: ["string", "str", "String", "char*"],
    exp: "Calculates output for given input."
  };

  const fn = meta.fn;
  const args = meta.args;
  const ret = meta.ret;

  // C++ Signature & Template
  const cppArgs = args.map(a => `${a[1]} ${a[0]}`).join(', ');
  const cppTpl = `class Solution {\npublic:\n    ${ret[0]} ${fn}(${cppArgs}) {\n        \n    }\n};`;

  // Python Signature & Template
  const pyArgs = args.map(a => `${a[0]}: ${a[2]}`).join(', ');
  const pyRet = ret[1];
  const pyTpl = `class Solution:\n    def ${fn}(self, ${pyArgs}) -> ${pyRet}:\n        pass`;

  // Java Signature & Template
  const javaArgs = args.map(a => `${a[3]} ${a[0]}`).join(', ');
  const javaTpl = `class Solution {\n    public ${ret[2]} ${fn}(${javaArgs}) {\n        \n    }\n}`;

  // C Signature & Template
  const cArgs = args.map(a => `${a[4]} ${a[0]}`).join(', ');
  const cTpl = `${ret[3]} ${fn}(${cArgs}) {\n    \n}`;

  // Examples
  const p1 = formatRawInputToParams(p, p.si);
  const formattedInputStr = Object.entries(p1).map(([k, v]) => `${k} = ${v}`).join(', ');
  const cleanExpected = (p.eo || p.so || '').trim();
  const formattedOut = cleanExpected.includes(' ') && !cleanExpected.startsWith('[') ? `[${cleanExpected.replace(/\s+/g, ', ')}]` : cleanExpected;

  const examples = [
    {
      id: 1,
      input: formattedInputStr,
      output: formattedOut,
      explanation: meta.exp
    }
  ];

  // Testcases
  const testcases = [
    {
      id: 1,
      title: "Case 1",
      rawStdin: p.si,
      expected: p.eo || p.so,
      formattedExpected: formattedOut,
      params: p1
    }
  ];

  const hidden = parseHiddenTests(p.ht);
  hidden.slice(0, 2).forEach((ht, idx) => {
    const hp = formatRawInputToParams(p, ht.input);
    const expClean = (ht.expected || '').trim();
    const fExp = expClean.includes(' ') && !expClean.startsWith('[') ? `[${expClean.replace(/\s+/g, ', ')}]` : expClean;
    testcases.push({
      id: idx + 2,
      title: `Case ${idx + 2}`,
      rawStdin: ht.input,
      expected: ht.expected,
      formattedExpected: fExp,
      params: hp
    });
  });

  registry[p.id] = {
    id: p.id,
    origId: p.origId,
    title: p.title,
    fn: fn,
    args: args.map(a => ({ name: a[0], cpp: a[1], py: a[2], java: a[3], c: a[4] })),
    ret: { cpp: ret[0], py: ret[1], java: ret[2], c: ret[3] },
    templates: {
      cpp: cppTpl,
      python: pyTpl,
      java: javaTpl,
      c: cTpl
    },
    solutions: workingSolutions[p.id] || null,
    examples,
    testcases
  };
});

const content = `// Auto-generated LeetCode registry for all 93 problems
export const LEETCODE_REGISTRY = ${JSON.stringify(registry, null, 2)};

export function getStarterTemplate(problemOrId, lang = 'cpp') {
  const id = typeof problemOrId === 'string' ? problemOrId : (problemOrId?.id || '');
  const entry = LEETCODE_REGISTRY[id];
  if (entry && entry.templates[lang]) {
    return entry.templates[lang];
  }
  if (lang === 'python') return 'class Solution:\\n    def solve(self):\\n        pass\\n';
  if (lang === 'java') return 'class Solution {\\n    public void solve() {\\n        \\n    }\\n}\\n';
  if (lang === 'c') return 'void solve() {\\n    \\n}\\n';
  return 'class Solution {\\npublic:\\n    void solve() {\\n        \\n    }\\n};\\n';
}

export function getProblemMetadata(problemOrId) {
  const id = typeof problemOrId === 'string' ? problemOrId : (problemOrId?.id || '');
  return LEETCODE_REGISTRY[id] || null;
}

export function getWorkingSolution(problemOrId, lang = 'cpp') {
  const id = typeof problemOrId === 'string' ? problemOrId : (problemOrId?.id || '');
  return LEETCODE_REGISTRY[id]?.solutions?.[lang] || null;
}
`;

fs.writeFileSync('./frontend/src/data/leetcodeRegistry.js', content, 'utf-8');
console.log('Successfully wrote frontend/src/data/leetcodeRegistry.js');

const backendContent = `// Auto-generated LeetCode registry for all 93 problems (Backend)
export const LEETCODE_REGISTRY = ${JSON.stringify(registry, null, 2)};

export function getProblemMetadata(id) {
  return LEETCODE_REGISTRY[id] || null;
}

export function wrapCodeWithHarness(problem, lang, code) {
  const id = problem?.id || '';
  const entry = LEETCODE_REGISTRY[id];
  const fn = entry?.fn || 'solve';
  const clean = (code || '').trim();

  // If candidate already wrote a standalone main function, do not wrap!
  if (lang === 'cpp' || lang === 'c') {
    if (/\\bint\\s+main\\s*\\(/i.test(clean)) return code;
  } else if (lang === 'python') {
    if (/__name__\\s*==\\s*['"]__main__['"]/i.test(clean) || /\\bdef\\s+main\\s*\\(/i.test(clean)) return code;
  } else if (lang === 'java') {
    if (/\\bpublic\\s+static\\s+void\\s+main\\s*\\(/i.test(clean)) return code;
  }

  // Generate wrapper with test harness
  if (lang === 'python') {
    return \`import sys, collections, heapq, bisect, math, json
from typing import *

\${code}

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    sol = Solution()
    method_name = '\${fn}'
    if not hasattr(sol, method_name):
        methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
        method_name = methods[0] if methods else '\${fn}'
    
    target_fn = getattr(sol, method_name, None)
    if target_fn:
        try:
            if '\${id}' in ['E1', 'M15']:
                n, t = int(tokens[0]), int(tokens[1])
                nums = [int(x) for x in tokens[2:n+2]]
                res = target_fn(nums, t)
            elif '\${id}' in ['E2', 'M2', 'E33', 'E51', 'E52', 'E258', 'E326']:
                res = target_fn(int(tokens[0]))
            elif '\${id}' in ['E3', 'E20', 'E46', 'E62', 'E68', 'E69']:
                res = target_fn(tokens[0])
            elif '\${id}' in ['E5', 'E8', 'E21', 'E26', 'E30', 'E38', 'E39', 'E50', 'M6', 'M7']:
                n = int(tokens[0])
                nums = [int(x) for x in tokens[1:n+1]]
                res = target_fn(nums)
                if '\${id}' == 'E5':
                    print(res)
                    print(" ".join(str(x) for x in nums[:res]))
                    sys.exit(0)
            elif '\${id}' == 'E6':
                n, val = int(tokens[0]), int(tokens[1])
                nums = [int(x) for x in tokens[2:n+2]]
                res = target_fn(nums, val)
                print(res)
                print(" ".join(str(x) for x in nums[:res]))
                sys.exit(0)
            elif '\${id}' in ['E7', 'E58', 'M5']:
                n, t = int(tokens[0]), int(tokens[1])
                nums = [int(x) for x in tokens[2:n+2]]
                res = target_fn(nums, t)
            elif '\${id}' in ['E9', 'E40', 'E45', 'E47', 'E49']:
                res = target_fn(tokens[0], tokens[1])
            else:
                import inspect
                sig = inspect.signature(target_fn)
                num_params = len(sig.parameters)
                if num_params == 1:
                    res = target_fn(tokens[0])
                elif num_params == 2:
                    res = target_fn(tokens[0], tokens[1])
                else:
                    res = target_fn(*tokens[:num_params])
            
            if isinstance(res, bool):
                print('true' if res else 'false')
            elif isinstance(res, (list, tuple)):
                print(" ".join(str(x) for x in res))
            elif res is not None:
                print(res)
        except Exception as e:
            sys.stderr.write(str(e) + chr(10))
            sys.exit(1)
\`;
  }

  if (lang === 'cpp') {
    let driverBody = '';
    if (id === 'E1' || id === 'M15') {
      driverBody = \`    int n; long long t;
    if (cin >> n >> t) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        auto res = sol.twoSum(nums, (int)t);
        for (size_t i = 0; i < res.size(); i++) cout << res[i] << (i + 1 < res.size() ? " " : "");
        cout << endl;
    }\`;
    } else if (id === 'E2') {
      driverBody = \`    long long x;
    if (cin >> x) {
        cout << (sol.isPalindrome((int)x) ? "true" : "false") << endl;
    }\`;
    } else if (id === 'E3') {
      driverBody = \`    string s;
    if (cin >> s) {
        cout << (sol.isValid(s) ? "true" : "false") << endl;
    }\`;
    } else if (id === 'E5') {
      driverBody = \`    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        int k = sol.removeDuplicates(nums);
        cout << k << endl;
        for (int i = 0; i < k; i++) cout << nums[i] << (i + 1 < k ? " " : "");
        cout << endl;
    }\`;
    } else if (id === 'E6') {
      driverBody = \`    int n, val;
    if (cin >> n >> val) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        int k = sol.removeElement(nums, val);
        cout << k << endl;
        for (int i = 0; i < k; i++) cout << nums[i] << (i + 1 < k ? " " : "");
        cout << endl;
    }\`;
    } else if (id === 'E7') {
      driverBody = \`    int n, t;
    if (cin >> n >> t) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        cout << sol.searchInsert(nums, t) << endl;
    }\`;
    } else if (id === 'E9') {
      driverBody = \`    string a, b;
    if (cin >> a >> b) {
        cout << sol.addBinary(a, b) << endl;
    }\`;
    }

    return \`#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <queue>
#include <stack>
#include <cmath>

using namespace std;

\${code}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    Solution sol;
\${driverBody}
    return 0;
}
\`;
  }

  if (lang === 'java') {
    let javaBody = '';
    if (id === 'E1' || id === 'M15') {
      javaBody = \`        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int t = sc.nextInt();
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
            int[] res = sol.twoSum(nums, t);
            for (int i = 0; i < res.length; i++) {
                System.out.print(res[i] + (i + 1 < res.length ? " " : ""));
            }
            System.out.println();
        }\`;
    } else if (id === 'E2') {
      javaBody = \`        if (sc.hasNextInt()) {
            System.out.println(sol.isPalindrome(sc.nextInt()) ? "true" : "false");
        }\`;
    } else if (id === 'E3') {
      javaBody = \`        if (sc.hasNext()) {
            System.out.println(sol.isValid(sc.next()) ? "true" : "false");
        }\`;
    }

    return \`import java.util.*;
import java.io.*;

\${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Solution sol = new Solution();
\${javaBody}
    }
}
\`;
  }

  return code;
}
`;

fs.writeFileSync('./backend/leetcodeRegistry.js', backendContent, 'utf-8');
console.log('Successfully wrote backend/leetcodeRegistry.js');
