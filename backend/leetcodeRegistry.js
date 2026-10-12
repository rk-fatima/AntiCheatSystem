// Auto-generated LeetCode registry for all 93 problems (Backend)
export const LEETCODE_REGISTRY = {
  "E1": {
    "id": "E1",
    "origId": "LC1",
    "title": "Two Sum",
    "fn": "twoSum",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "target",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "vector<int>",
      "py": "list[int]",
      "java": "int[]",
      "c": "int*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
      "python": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        pass",
      "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
      "c": "int* twoSum(int* nums, int target) {\n    \n}"
    },
    "solutions": {
      "python": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, x in enumerate(nums):\n            if target - x in seen:\n                return [seen[target - x], i]\n            seen[x] = i\n        return []",
      "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            if (seen.count(target - nums[i])) {\n                return {seen[target - nums[i]], i};\n            }\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};",
      "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            if (seen.containsKey(target - nums[i])) {\n                return new int[] { seen.get(target - nums[i]), i };\n            }\n            seen.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}",
      "c": "int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* res = (int*)malloc(2 * sizeof(int));\n    for (int i = 0; i < numsSize; i++) {\n        for (int j = i + 1; j < numsSize; j++) {\n            if (nums[i] + nums[j] == target) {\n                res[0] = i; res[1] = j;\n                return res;\n            }\n        }\n    }\n    return res;\n}"
    },
    "examples": [
      {
        "id": 1,
        "input": "nums = [2, 7, 11, 15], target = 9",
        "output": "[0, 1]",
        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4 9\n2 7 11 15",
        "expected": "0 1",
        "formattedExpected": "[0, 1]",
        "params": {
          "nums": "[2, 7, 11, 15]",
          "target": "9"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "3 6\n3 2 4",
        "expected": "1 2",
        "formattedExpected": "[1, 2]",
        "params": {
          "nums": "[3, 2, 4]",
          "target": "6"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "2 6\n3 3",
        "expected": "0 1",
        "formattedExpected": "[0, 1]",
        "params": {
          "nums": "[3, 3]",
          "target": "6"
        }
      }
    ]
  },
  "E2": {
    "id": "E2",
    "origId": "LC9",
    "title": "Palindrome Number",
    "fn": "isPalindrome",
    "args": [
      {
        "name": "x",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};",
      "python": "class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean isPalindrome(int x) {\n        \n    }\n}",
      "c": "bool isPalindrome(int x) {\n    \n}"
    },
    "solutions": {
      "python": "class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        if x < 0:\n            return False\n        s = str(x)\n        return s == s[::-1]",
      "cpp": "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        if (x < 0) return false;\n        string s = to_string(x);\n        string r = s;\n        reverse(r.begin(), r.end());\n        return s == r;\n    }\n};",
      "java": "class Solution {\n    public boolean isPalindrome(int x) {\n        if (x < 0) return false;\n        String s = Integer.toString(x);\n        String r = new StringBuilder(s).reverse().toString();\n        return s.equals(r);\n    }\n}",
      "c": "bool isPalindrome(int x) {\n    if (x < 0) return false;\n    long long rev = 0, orig = x;\n    while (x > 0) {\n        rev = rev * 10 + (x % 10);\n        x /= 10;\n    }\n    return orig == rev;\n}"
    },
    "examples": [
      {
        "id": 1,
        "input": "x = 121",
        "output": "true",
        "explanation": "121 reads as 121 from left to right and from right to left."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "121",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "x": "121"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "-121",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "x": "-121"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "10",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "x": "10"
        }
      }
    ]
  },
  "E3": {
    "id": "E3",
    "origId": "LC20",
    "title": "Valid Parentheses",
    "fn": "isValid",
    "args": [
      {
        "name": "s",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};",
      "python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}",
      "c": "bool isValid(char* s) {\n    \n}"
    },
    "solutions": {
      "python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        mapping = {')': '(', '}': '{', ']': '['}\n        for char in s:\n            if char in mapping:\n                top = stack.pop() if stack else '#'\n                if mapping[char] != top:\n                    return False\n            else:\n                stack.append(char)\n        return not stack",
      "cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == '(' || c == '{' || c == '[') st.push(c);\n            else {\n                if (st.empty()) return false;\n                if (c == ')' && st.top() != '(') return false;\n                if (c == '}' && st.top() != '{') return false;\n                if (c == ']' && st.top() != '[') return false;\n                st.pop();\n            }\n        }\n        return st.empty();\n    }\n};",
      "java": "class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}",
      "c": "bool isValid(char* s) {\n    char stack[10005];\n    int top = 0;\n    for (int i = 0; s[i]; i++) {\n        char c = s[i];\n        if (c == '(' || c == '{' || c == '[') stack[top++] = c;\n        else {\n            if (top == 0) return false;\n            char last = stack[--top];\n            if (c == ')' && last != '(') return false;\n            if (c == '}' && last != '{') return false;\n            if (c == ']' && last != '[') return false;\n        }\n    }\n    return top == 0;\n}"
    },
    "examples": [
      {
        "id": 1,
        "input": "s = \"()[]{}\"",
        "output": "true",
        "explanation": "Open brackets must be closed by the same type of brackets in the correct order."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "()[]{}",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "s": "\"()[]{}\""
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "(]",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "s": "\"(]\""
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "([{}])",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "s": "\"([{}])\""
        }
      }
    ]
  },
  "E4": {
    "id": "E4",
    "origId": "LC21",
    "title": "Merge Two Sorted Lists",
    "fn": "mergeTwoLists",
    "args": [
      {
        "name": "list1",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      },
      {
        "name": "list2",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      }
    ],
    "ret": {
      "cpp": "ListNode*",
      "py": "Optional[ListNode]",
      "java": "ListNode",
      "c": "struct ListNode*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        \n    }\n};",
      "python": "class Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        pass",
      "java": "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        \n    }\n}",
      "c": "struct ListNode* mergeTwoLists(struct ListNode* list1, struct ListNode* list2) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 3 1 2 4 3 1 3 4",
        "output": "[1, 1, 2, 3, 4, 4]",
        "explanation": "Merged into a single sorted list."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3\n1 2 4\n3\n1 3 4",
        "expected": "1 1 2 3 4 4",
        "formattedExpected": "[1, 1, 2, 3, 4, 4]",
        "params": {
          "input": "3 1 2 4 3 1 3 4"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "0\n\n1\n0",
        "expected": "0",
        "formattedExpected": "0",
        "params": {
          "input": "0 1 0"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "2\n5 10\n2\n2 7",
        "expected": "2 5 7 10",
        "formattedExpected": "[2, 5, 7, 10]",
        "params": {
          "input": "2 5 10 2 2 7"
        }
      }
    ]
  },
  "E5": {
    "id": "E5",
    "origId": "LC26",
    "title": "Remove Duplicates from Sorted Array",
    "fn": "removeDuplicates",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int removeDuplicates(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def removeDuplicates(self, nums: list[int]) -> int:\n        pass",
      "java": "class Solution {\n    public int removeDuplicates(int[] nums) {\n        \n    }\n}",
      "c": "int removeDuplicates(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [1, 1, 2]",
        "output": "[2, 1, 2]",
        "explanation": "Returns k = number of unique elements."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3\n1 1 2",
        "expected": "2\n1 2",
        "formattedExpected": "[2, 1, 2]",
        "params": {
          "nums": "[1, 1, 2]"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "10\n0 0 1 1 1 2 2 3 3 4",
        "expected": "5\n0 1 2 3 4",
        "formattedExpected": "[5, 0, 1, 2, 3, 4]",
        "params": {
          "nums": "[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]"
        }
      }
    ]
  },
  "E6": {
    "id": "E6",
    "origId": "LC27",
    "title": "Remove Element",
    "fn": "removeElement",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "val",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int removeElement(vector<int>& nums, int val) {\n        \n    }\n};",
      "python": "class Solution:\n    def removeElement(self, nums: list[int], val: int) -> int:\n        pass",
      "java": "class Solution {\n    public int removeElement(int[] nums, int val) {\n        \n    }\n}",
      "c": "int removeElement(int* nums, int val) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [3, 2, 2, 3], val = 3",
        "output": "[2, 2, 2]",
        "explanation": "Removes all occurrences of val in-place."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4 3\n3 2 2 3",
        "expected": "2\n2 2",
        "formattedExpected": "[2, 2, 2]",
        "params": {
          "nums": "[3, 2, 2, 3]",
          "val": "3"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "8 2\n0 1 2 2 3 0 4 2",
        "expected": "5\n0 1 3 0 4",
        "formattedExpected": "[5, 0, 1, 3, 0, 4]",
        "params": {
          "nums": "[0, 1, 2, 2, 3, 0, 4, 2]",
          "val": "2"
        }
      }
    ]
  },
  "E7": {
    "id": "E7",
    "origId": "LC35",
    "title": "Search Insert Position",
    "fn": "searchInsert",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "target",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int searchInsert(vector<int>& nums, int target) {\n        \n    }\n};",
      "python": "class Solution:\n    def searchInsert(self, nums: list[int], target: int) -> int:\n        pass",
      "java": "class Solution {\n    public int searchInsert(int[] nums, int target) {\n        \n    }\n}",
      "c": "int searchInsert(int* nums, int target) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [1, 3, 5, 6], target = 5",
        "output": "2",
        "explanation": "Return target index or insert position."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4 5\n1 3 5 6",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "nums": "[1, 3, 5, 6]",
          "target": "5"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "4 2\n1 3 5 6",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "nums": "[1, 3, 5, 6]",
          "target": "2"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "4 7\n1 3 5 6",
        "expected": "4",
        "formattedExpected": "4",
        "params": {
          "nums": "[1, 3, 5, 6]",
          "target": "7"
        }
      }
    ]
  },
  "E8": {
    "id": "E8",
    "origId": "LC66",
    "title": "Plus One",
    "fn": "plusOne",
    "args": [
      {
        "name": "digits",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "vector<int>",
      "py": "list[int]",
      "java": "int[]",
      "c": "int*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<int> plusOne(vector<int>& digits) {\n        \n    }\n};",
      "python": "class Solution:\n    def plusOne(self, digits: list[int]) -> list[int]:\n        pass",
      "java": "class Solution {\n    public int[] plusOne(int[] digits) {\n        \n    }\n}",
      "c": "int* plusOne(int* digits) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [1, 2, 3]",
        "output": "[1, 2, 4]",
        "explanation": "Incrementing by one gives [1,2,4]."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3\n1 2 3",
        "expected": "1 2 4",
        "formattedExpected": "[1, 2, 4]",
        "params": {
          "nums": "[1, 2, 3]"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1\n9",
        "expected": "1 0",
        "formattedExpected": "[1, 0]",
        "params": {
          "nums": "[9]"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "3\n9 9 9",
        "expected": "1 0 0 0",
        "formattedExpected": "[1, 0, 0, 0]",
        "params": {
          "nums": "[9, 9, 9]"
        }
      }
    ]
  },
  "E9": {
    "id": "E9",
    "origId": "LC67",
    "title": "Add Binary",
    "fn": "addBinary",
    "args": [
      {
        "name": "a",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      },
      {
        "name": "b",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "string",
      "py": "str",
      "java": "String",
      "c": "char*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    string addBinary(string a, string b) {\n        \n    }\n};",
      "python": "class Solution:\n    def addBinary(self, a: str, b: str) -> str:\n        pass",
      "java": "class Solution {\n    public String addBinary(String a, String b) {\n        \n    }\n}",
      "c": "char* addBinary(char* a, char* b) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "a = \"11\", b = \"1\"",
        "output": "100",
        "explanation": "Binary sum of 11 and 1 is 100."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "11 1",
        "expected": "100",
        "formattedExpected": "100",
        "params": {
          "a": "\"11\"",
          "b": "\"1\""
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1010 1011",
        "expected": "10101",
        "formattedExpected": "10101",
        "params": {
          "a": "\"1010\"",
          "b": "\"1011\""
        }
      }
    ]
  },
  "E10": {
    "id": "E10",
    "origId": "LC83",
    "title": "Remove Duplicates from Sorted List",
    "fn": "deleteDuplicates",
    "args": [
      {
        "name": "head",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      }
    ],
    "ret": {
      "cpp": "ListNode*",
      "py": "Optional[ListNode]",
      "java": "ListNode",
      "c": "struct ListNode*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    ListNode* deleteDuplicates(ListNode* head) {\n        \n    }\n};",
      "python": "class Solution:\n    def deleteDuplicates(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        pass",
      "java": "class Solution {\n    public ListNode deleteDuplicates(ListNode head) {\n        \n    }\n}",
      "c": "struct ListNode* deleteDuplicates(struct ListNode* head) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 3 1 1 2",
        "output": "[1, 2]",
        "explanation": "Remove all duplicates from sorted list."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3\n1 1 2",
        "expected": "1 2",
        "formattedExpected": "[1, 2]",
        "params": {
          "input": "3 1 1 2"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "5\n1 1 2 3 3",
        "expected": "1 2 3",
        "formattedExpected": "[1, 2, 3]",
        "params": {
          "input": "5 1 1 2 3 3"
        }
      }
    ]
  },
  "E11": {
    "id": "E11",
    "origId": "LC88",
    "title": "Merge Sorted Array",
    "fn": "merge",
    "args": [
      {
        "name": "nums1",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "m",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      },
      {
        "name": "nums2",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "n",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "void",
      "py": "None",
      "java": "void",
      "c": "void"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {\n        \n    }\n};",
      "python": "class Solution:\n    def merge(self, nums1: list[int], m: int, nums2: list[int], n: int) -> None:\n        pass",
      "java": "class Solution {\n    public void merge(int[] nums1, int m, int[] nums2, int n) {\n        \n    }\n}",
      "c": "void merge(int* nums1, int m, int* nums2, int n) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 3 3 1 2 3 2 5 6",
        "output": "[1, 2, 2, 3, 5, 6]",
        "explanation": "Merge nums2 into nums1 as one sorted array."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3 3\n1 2 3\n2 5 6",
        "expected": "1 2 2 3 5 6",
        "formattedExpected": "[1, 2, 2, 3, 5, 6]",
        "params": {
          "input": "3 3 1 2 3 2 5 6"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 0\n1\n",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "input": "1 0 1"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "0 1\n\n1",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "input": "0 1 1"
        }
      }
    ]
  },
  "E12": {
    "id": "E12",
    "origId": "LC94",
    "title": "Binary Tree Inorder Traversal",
    "fn": "inorderTraversal",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "vector<int>",
      "py": "list[int]",
      "java": "List<Integer>",
      "c": "int*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<int> inorderTraversal(TreeNode* root) {\n        \n    }\n};",
      "python": "class Solution:\n    def inorderTraversal(self, root: Optional[TreeNode]) -> list[int]:\n        pass",
      "java": "class Solution {\n    public List<Integer> inorderTraversal(TreeNode root) {\n        \n    }\n}",
      "c": "int* inorderTraversal(struct TreeNode* root) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 1 null 2 3",
        "output": "[1, 3, 2]",
        "explanation": "Return inorder traversal of node values."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "1 null 2 3",
        "expected": "1 3 2",
        "formattedExpected": "[1, 3, 2]",
        "params": {
          "input": "1 null 2 3"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 2 3 4 5",
        "expected": "4 2 5 1 3",
        "formattedExpected": "[4, 2, 5, 1, 3]",
        "params": {
          "input": "1 2 3 4 5"
        }
      }
    ]
  },
  "E13": {
    "id": "E13",
    "origId": "LC100",
    "title": "Same Tree",
    "fn": "isSameTree",
    "args": [
      {
        "name": "p",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      },
      {
        "name": "q",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool isSameTree(TreeNode* p, TreeNode* q) {\n        \n    }\n};",
      "python": "class Solution:\n    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean isSameTree(TreeNode p, TreeNode q) {\n        \n    }\n}",
      "c": "bool isSameTree(struct TreeNode* p, struct TreeNode* q) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 1 2 3 1 2 3",
        "output": "true",
        "explanation": "Return true if trees are structurally identical."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "1 2 3\n1 2 3",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "input": "1 2 3 1 2 3"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 2\n1 null 2",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "input": "1 2 1 null 2"
        }
      }
    ]
  },
  "E14": {
    "id": "E14",
    "origId": "LC101",
    "title": "Symmetric Tree",
    "fn": "isSymmetric",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool isSymmetric(TreeNode* root) {\n        \n    }\n};",
      "python": "class Solution:\n    def isSymmetric(self, root: Optional[TreeNode]) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean isSymmetric(TreeNode root) {\n        \n    }\n}",
      "c": "bool isSymmetric(struct TreeNode* root) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 1 2 2 3 4 4 3",
        "output": "true",
        "explanation": "Return true if tree is symmetric around center."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "1 2 2 3 4 4 3",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "input": "1 2 2 3 4 4 3"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 2 2 null 3 null 3",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "input": "1 2 2 null 3 null 3"
        }
      }
    ]
  },
  "E15": {
    "id": "E15",
    "origId": "LC104",
    "title": "Maximum Depth of Binary Tree",
    "fn": "maxDepth",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        \n    }\n};",
      "python": "class Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        pass",
      "java": "class Solution {\n    public int maxDepth(TreeNode root) {\n        \n    }\n}",
      "c": "int maxDepth(struct TreeNode* root) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 3 9 20 null null 15 7",
        "output": "3",
        "explanation": "Max depth from root down to furthest leaf."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3 9 20 null null 15 7",
        "expected": "3",
        "formattedExpected": "3",
        "params": {
          "input": "3 9 20 null null 15 7"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 null 2",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "input": "1 null 2"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "1",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "input": "1"
        }
      }
    ]
  },
  "E16": {
    "id": "E16",
    "origId": "LC108",
    "title": "Convert Sorted Array to Binary Search Tree",
    "fn": "sortedArrayToBST",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "TreeNode*",
      "py": "Optional[TreeNode]",
      "java": "TreeNode",
      "c": "struct TreeNode*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    TreeNode* sortedArrayToBST(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def sortedArrayToBST(self, nums: list[int]) -> Optional[TreeNode]:\n        pass",
      "java": "class Solution {\n    public TreeNode sortedArrayToBST(int[] nums) {\n        \n    }\n}",
      "c": "struct TreeNode* sortedArrayToBST(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 5 -10 -3 0 5 9",
        "output": "[0, 3]",
        "explanation": "Convert sorted array into height-balanced BST."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "5\n-10 -3 0 5 9",
        "expected": "0 3",
        "formattedExpected": "[0, 3]",
        "params": {
          "input": "5 -10 -3 0 5 9"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "2\n1 3",
        "expected": "3 2",
        "formattedExpected": "[3, 2]",
        "params": {
          "input": "2 1 3"
        }
      }
    ]
  },
  "E17": {
    "id": "E17",
    "origId": "LC111",
    "title": "Minimum Depth of Binary Tree",
    "fn": "minDepth",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int minDepth(TreeNode* root) {\n        \n    }\n};",
      "python": "class Solution:\n    def minDepth(self, root: Optional[TreeNode]) -> int:\n        pass",
      "java": "class Solution {\n    public int minDepth(TreeNode root) {\n        \n    }\n}",
      "c": "int minDepth(struct TreeNode* root) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 3 9 20 null null 15 7",
        "output": "2",
        "explanation": "Min depth to nearest leaf node."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3 9 20 null null 15 7",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "input": "3 9 20 null null 15 7"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "2 null 3 null 4 null 5 null 6",
        "expected": "5",
        "formattedExpected": "5",
        "params": {
          "input": "2 null 3 null 4 null 5 null 6"
        }
      }
    ]
  },
  "E18": {
    "id": "E18",
    "origId": "LC112",
    "title": "Path Sum",
    "fn": "hasPathSum",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      },
      {
        "name": "targetSum",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool hasPathSum(TreeNode* root, int targetSum) {\n        \n    }\n};",
      "python": "class Solution:\n    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean hasPathSum(TreeNode root, int targetSum) {\n        \n    }\n}",
      "c": "bool hasPathSum(struct TreeNode* root, int targetSum) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 22 5 4 8 11 null 13 4 7 2 null null null 1",
        "output": "true",
        "explanation": "Check root-to-leaf path equals targetSum."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "22\n5 4 8 11 null 13 4 7 2 null null null 1",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "input": "22 5 4 8 11 null 13 4 7 2 null null null 1"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "5\n1 2 3",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "input": "5 1 2 3"
        }
      }
    ]
  },
  "E19": {
    "id": "E19",
    "origId": "LC119",
    "title": "Pascal's Triangle II",
    "fn": "getRow",
    "args": [
      {
        "name": "rowIndex",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "vector<int>",
      "py": "list[int]",
      "java": "List<Integer>",
      "c": "int*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<int> getRow(int rowIndex) {\n        \n    }\n};",
      "python": "class Solution:\n    def getRow(self, rowIndex: int) -> list[int]:\n        pass",
      "java": "class Solution {\n    public List<Integer> getRow(int rowIndex) {\n        \n    }\n}",
      "c": "int* getRow(int rowIndex) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 3",
        "output": "[1, 3, 3, 1]",
        "explanation": "Return the kth row of Pascal triangle."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3",
        "expected": "1 3 3 1",
        "formattedExpected": "[1, 3, 3, 1]",
        "params": {
          "input": "3"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "0",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "input": "0"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "1",
        "expected": "1 1",
        "formattedExpected": "[1, 1]",
        "params": {
          "input": "1"
        }
      }
    ]
  },
  "E20": {
    "id": "E20",
    "origId": "LC125",
    "title": "Valid Palindrome",
    "fn": "isPalindrome",
    "args": [
      {
        "name": "s",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool isPalindrome(string s) {\n        \n    }\n};",
      "python": "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean isPalindrome(String s) {\n        \n    }\n}",
      "c": "bool isPalindrome(char* s) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "s = \"A\"",
        "output": "true",
        "explanation": "Checks palindrome ignoring case and alphanumeric characters."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "A man, a plan, a canal: Panama",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "s": "\"A\""
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "race a car",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "s": "\"race\""
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": " ",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "s": "\"\""
        }
      }
    ]
  },
  "E21": {
    "id": "E21",
    "origId": "LC136",
    "title": "Single Number",
    "fn": "singleNumber",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def singleNumber(self, nums: list[int]) -> int:\n        pass",
      "java": "class Solution {\n    public int singleNumber(int[] nums) {\n        \n    }\n}",
      "c": "int singleNumber(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [2, 2, 1]",
        "output": "1",
        "explanation": "Find the single element appearing once."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3\n2 2 1",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "nums": "[2, 2, 1]"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "5\n4 1 2 1 2",
        "expected": "4",
        "formattedExpected": "4",
        "params": {
          "nums": "[4, 1, 2, 1, 2]"
        }
      }
    ]
  },
  "E22": {
    "id": "E22",
    "origId": "LC141",
    "title": "Linked List Cycle",
    "fn": "hasCycle",
    "args": [
      {
        "name": "head",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool hasCycle(ListNode* head) {\n        \n    }\n};",
      "python": "class Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean hasCycle(ListNode head) {\n        \n    }\n}",
      "c": "bool hasCycle(struct ListNode* head) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 4 1 3 2 0 -4",
        "output": "true",
        "explanation": "Detect if linked list contains a cycle."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4 1\n3 2 0 -4",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "input": "4 1 3 2 0 -4"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 -1\n1",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "input": "1 -1 1"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "2 0\n1 2",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "input": "2 0 1 2"
        }
      }
    ]
  },
  "E23": {
    "id": "E23",
    "origId": "LC144",
    "title": "Binary Tree Preorder Traversal",
    "fn": "preorderTraversal",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "vector<int>",
      "py": "list[int]",
      "java": "List<Integer>",
      "c": "int*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<int> preorderTraversal(TreeNode* root) {\n        \n    }\n};",
      "python": "class Solution:\n    def preorderTraversal(self, root: Optional[TreeNode]) -> list[int]:\n        pass",
      "java": "class Solution {\n    public List<Integer> preorderTraversal(TreeNode root) {\n        \n    }\n}",
      "c": "int* preorderTraversal(struct TreeNode* root) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 1 null 2 3",
        "output": "[1, 2, 3]",
        "explanation": "Preorder traversal of tree values."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "1 null 2 3",
        "expected": "1 2 3",
        "formattedExpected": "[1, 2, 3]",
        "params": {
          "input": "1 null 2 3"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 2 3 4 5",
        "expected": "1 2 4 5 3",
        "formattedExpected": "[1, 2, 4, 5, 3]",
        "params": {
          "input": "1 2 3 4 5"
        }
      }
    ]
  },
  "E24": {
    "id": "E24",
    "origId": "LC145",
    "title": "Binary Tree Postorder Traversal",
    "fn": "postorderTraversal",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "vector<int>",
      "py": "list[int]",
      "java": "List<Integer>",
      "c": "int*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<int> postorderTraversal(TreeNode* root) {\n        \n    }\n};",
      "python": "class Solution:\n    def postorderTraversal(self, root: Optional[TreeNode]) -> list[int]:\n        pass",
      "java": "class Solution {\n    public List<Integer> postorderTraversal(TreeNode root) {\n        \n    }\n}",
      "c": "int* postorderTraversal(struct TreeNode* root) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 1 null 2 3",
        "output": "[3, 2, 1]",
        "explanation": "Postorder traversal of tree values."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "1 null 2 3",
        "expected": "3 2 1",
        "formattedExpected": "[3, 2, 1]",
        "params": {
          "input": "1 null 2 3"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 2 3 4 5",
        "expected": "4 5 2 3 1",
        "formattedExpected": "[4, 5, 2, 3, 1]",
        "params": {
          "input": "1 2 3 4 5"
        }
      }
    ]
  },
  "E25": {
    "id": "E25",
    "origId": "LC160",
    "title": "Intersection of Two Linked Lists",
    "fn": "getIntersectionNode",
    "args": [
      {
        "name": "headA",
        "cpp": "ListNode*",
        "py": "ListNode",
        "java": "ListNode",
        "c": "struct ListNode*"
      },
      {
        "name": "headB",
        "cpp": "ListNode*",
        "py": "ListNode",
        "java": "ListNode",
        "c": "struct ListNode*"
      }
    ],
    "ret": {
      "cpp": "ListNode*",
      "py": "Optional[ListNode]",
      "java": "ListNode",
      "c": "struct ListNode*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    ListNode* getIntersectionNode(ListNode* headA, ListNode* headB) {\n        \n    }\n};",
      "python": "class Solution:\n    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:\n        pass",
      "java": "class Solution {\n    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {\n        \n    }\n}",
      "c": "struct ListNode* getIntersectionNode(struct ListNode* headA, struct ListNode* headB) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 5 6 8 4 1 8 4 5 5 6 1 8 4 5",
        "output": "8",
        "explanation": "Return the node where two lists intersect."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "5 6 8\n4 1 8 4 5\n5 6 1 8 4 5",
        "expected": "8",
        "formattedExpected": "8",
        "params": {
          "input": "5 6 8 4 1 8 4 5 5 6 1 8 4 5"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "3 3 0\n2 6 4\n1 5",
        "expected": "0",
        "formattedExpected": "0",
        "params": {
          "input": "3 3 0 2 6 4 1 5"
        }
      }
    ]
  },
  "E26": {
    "id": "E26",
    "origId": "LC169",
    "title": "Majority Element",
    "fn": "majorityElement",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int majorityElement(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def majorityElement(self, nums: list[int]) -> int:\n        pass",
      "java": "class Solution {\n    public int majorityElement(int[] nums) {\n        \n    }\n}",
      "c": "int majorityElement(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [3, 2, 3]",
        "output": "3",
        "explanation": "Element that appears more than n/2 times."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3\n3 2 3",
        "expected": "3",
        "formattedExpected": "3",
        "params": {
          "nums": "[3, 2, 3]"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "7\n2 2 1 1 1 2 2",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "nums": "[2, 2, 1, 1, 1, 2, 2]"
        }
      }
    ]
  },
  "E27": {
    "id": "E27",
    "origId": "LC191",
    "title": "Number of 1 Bits",
    "fn": "hammingWeight",
    "args": [
      {
        "name": "n",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int hammingWeight(int n) {\n        \n    }\n};",
      "python": "class Solution:\n    def hammingWeight(self, n: int) -> int:\n        pass",
      "java": "class Solution {\n    public int hammingWeight(int n) {\n        \n    }\n}",
      "c": "int hammingWeight(int n) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "x = 11",
        "output": "3",
        "explanation": "Number of set 1 bits in integer."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "11",
        "expected": "3",
        "formattedExpected": "3",
        "params": {
          "x": "11"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "128",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "x": "128"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "2147483645",
        "expected": "30",
        "formattedExpected": "30",
        "params": {
          "x": "2147483645"
        }
      }
    ]
  },
  "E28": {
    "id": "E28",
    "origId": "LC203",
    "title": "Remove Linked List Elements",
    "fn": "removeElements",
    "args": [
      {
        "name": "head",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      },
      {
        "name": "val",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "ListNode*",
      "py": "Optional[ListNode]",
      "java": "ListNode",
      "c": "struct ListNode*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    ListNode* removeElements(ListNode* head, int val) {\n        \n    }\n};",
      "python": "class Solution:\n    def removeElements(self, head: Optional[ListNode], val: int) -> Optional[ListNode]:\n        pass",
      "java": "class Solution {\n    public ListNode removeElements(ListNode head, int val) {\n        \n    }\n}",
      "c": "struct ListNode* removeElements(struct ListNode* head, int val) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 7 6 1 2 6 3 4 5 6",
        "output": "[1, 2, 3, 4, 5]",
        "explanation": "Remove all nodes equal to val."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "7 6\n1 2 6 3 4 5 6",
        "expected": "1 2 3 4 5",
        "formattedExpected": "[1, 2, 3, 4, 5]",
        "params": {
          "input": "7 6 1 2 6 3 4 5 6"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "4 7\n7 7 7 7",
        "expected": "empty",
        "formattedExpected": "empty",
        "params": {
          "input": "4 7 7 7 7 7"
        }
      }
    ]
  },
  "E29": {
    "id": "E29",
    "origId": "LC206",
    "title": "Reverse Linked List",
    "fn": "reverseList",
    "args": [
      {
        "name": "head",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      }
    ],
    "ret": {
      "cpp": "ListNode*",
      "py": "Optional[ListNode]",
      "java": "ListNode",
      "c": "struct ListNode*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        \n    }\n};",
      "python": "class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        pass",
      "java": "class Solution {\n    public ListNode reverseList(ListNode head) {\n        \n    }\n}",
      "c": "struct ListNode* reverseList(struct ListNode* head) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 5 1 2 3 4 5",
        "output": "[5, 4, 3, 2, 1]",
        "explanation": "Reverse singly linked list."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "5\n1 2 3 4 5",
        "expected": "5 4 3 2 1",
        "formattedExpected": "[5, 4, 3, 2, 1]",
        "params": {
          "input": "5 1 2 3 4 5"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "2\n1 2",
        "expected": "2 1",
        "formattedExpected": "[2, 1]",
        "params": {
          "input": "2 1 2"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "1\n42",
        "expected": "42",
        "formattedExpected": "42",
        "params": {
          "input": "1 42"
        }
      }
    ]
  },
  "E30": {
    "id": "E30",
    "origId": "LC217",
    "title": "Contains Duplicate",
    "fn": "containsDuplicate",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}",
      "c": "bool containsDuplicate(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [1, 2, 3, 1]",
        "output": "true",
        "explanation": "Return true if any value appears at least twice."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4\n1 2 3 1",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "nums": "[1, 2, 3, 1]"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "4\n1 2 3 4",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "nums": "[1, 2, 3, 4]"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "10\n1 1 1 3 3 4 3 2 4 2",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "nums": "[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]"
        }
      }
    ]
  },
  "E31": {
    "id": "E31",
    "origId": "LC226",
    "title": "Invert Binary Tree",
    "fn": "invertTree",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "TreeNode*",
      "py": "Optional[TreeNode]",
      "java": "TreeNode",
      "c": "struct TreeNode*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        \n    }\n};",
      "python": "class Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        pass",
      "java": "class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        \n    }\n}",
      "c": "struct TreeNode* invertTree(struct TreeNode* root) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 4 2 7 1 3 6 9",
        "output": "[4, 7, 2, 9, 6, 3, 1]",
        "explanation": "Invert binary tree left and right children."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4 2 7 1 3 6 9",
        "expected": "4 7 2 9 6 3 1",
        "formattedExpected": "[4, 7, 2, 9, 6, 3, 1]",
        "params": {
          "input": "4 2 7 1 3 6 9"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "2 1 3",
        "expected": "2 3 1",
        "formattedExpected": "[2, 3, 1]",
        "params": {
          "input": "2 1 3"
        }
      }
    ]
  },
  "E32": {
    "id": "E32",
    "origId": "LC228",
    "title": "Summary Ranges",
    "fn": "summaryRanges",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "vector<string>",
      "py": "list[str]",
      "java": "List<String>",
      "c": "char**"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<string> summaryRanges(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def summaryRanges(self, nums: list[int]) -> list[str]:\n        pass",
      "java": "class Solution {\n    public List<String> summaryRanges(int[] nums) {\n        \n    }\n}",
      "c": "char** summaryRanges(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 6 0 1 2 4 5 7",
        "output": "[0->2, 4->5, 7]",
        "explanation": "Summary ranges of contiguous numbers."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "6\n0 1 2 4 5 7",
        "expected": "0->2 4->5 7",
        "formattedExpected": "[0->2, 4->5, 7]",
        "params": {
          "input": "6 0 1 2 4 5 7"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "6\n0 2 3 4 6 8 9",
        "expected": "0 2->4 6 8->9",
        "formattedExpected": "[0, 2->4, 6, 8->9]",
        "params": {
          "input": "6 0 2 3 4 6 8 9"
        }
      }
    ]
  },
  "E33": {
    "id": "E33",
    "origId": "LC231",
    "title": "Power of Two",
    "fn": "isPowerOfTwo",
    "args": [
      {
        "name": "n",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool isPowerOfTwo(int n) {\n        \n    }\n};",
      "python": "class Solution:\n    def isPowerOfTwo(self, n: int) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean isPowerOfTwo(int n) {\n        \n    }\n}",
      "c": "bool isPowerOfTwo(int n) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "x = 16",
        "output": "true",
        "explanation": "Check if integer is power of two."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "16",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "x": "16"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "3",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "x": "3"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "1",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "x": "1"
        }
      }
    ]
  },
  "E34": {
    "id": "E34",
    "origId": "LC234",
    "title": "Palindrome Linked List",
    "fn": "isPalindrome",
    "args": [
      {
        "name": "head",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool isPalindrome(ListNode* head) {\n        \n    }\n};",
      "python": "class Solution:\n    def isPalindrome(self, head: Optional[ListNode]) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean isPalindrome(ListNode head) {\n        \n    }\n}",
      "c": "bool isPalindrome(struct ListNode* head) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 4 1 2 2 1",
        "output": "true",
        "explanation": "Check if linked list is palindrome."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4\n1 2 2 1",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "input": "4 1 2 2 1"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "2\n1 2",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "input": "2 1 2"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "5\n1 2 3 2 1",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "input": "5 1 2 3 2 1"
        }
      }
    ]
  },
  "E35": {
    "id": "E35",
    "origId": "LC242",
    "title": "Valid Anagram",
    "fn": "isAnagram",
    "args": [
      {
        "name": "s",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      },
      {
        "name": "t",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        \n    }\n};",
      "python": "class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean isAnagram(String s, String t) {\n        \n    }\n}",
      "c": "bool isAnagram(char* s, char* t) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "a = \"anagram\", b = \"nagaram\"",
        "output": "true",
        "explanation": "Return true if t is anagram of s."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "anagram\nnagaram",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "a": "\"anagram\"",
          "b": "\"nagaram\""
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "rat\ncar",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "a": "\"rat\"",
          "b": "\"car\""
        }
      }
    ]
  },
  "E36": {
    "id": "E36",
    "origId": "LC257",
    "title": "Binary Tree Paths",
    "fn": "binaryTreePaths",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "vector<string>",
      "py": "list[str]",
      "java": "List<String>",
      "c": "char**"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<string> binaryTreePaths(TreeNode* root) {\n        \n    }\n};",
      "python": "class Solution:\n    def binaryTreePaths(self, root: Optional[TreeNode]) -> list[str]:\n        pass",
      "java": "class Solution {\n    public List<String> binaryTreePaths(TreeNode root) {\n        \n    }\n}",
      "c": "char** binaryTreePaths(struct TreeNode* root) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 1 2 3 null 5",
        "output": "[1->2->5, 1->3]",
        "explanation": "All root-to-leaf paths as strings."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "1 2 3 null 5",
        "expected": "1->2->5 1->3",
        "formattedExpected": "[1->2->5, 1->3]",
        "params": {
          "input": "1 2 3 null 5"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "input": "1"
        }
      }
    ]
  },
  "E37": {
    "id": "E37",
    "origId": "LC258",
    "title": "Add Digits",
    "fn": "addDigits",
    "args": [
      {
        "name": "num",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int addDigits(int num) {\n        \n    }\n};",
      "python": "class Solution:\n    def addDigits(self, num: int) -> int:\n        pass",
      "java": "class Solution {\n    public int addDigits(int num) {\n        \n    }\n}",
      "c": "int addDigits(int num) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "x = 38",
        "output": "2",
        "explanation": "Repeatedly add all digits until single digit."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "38",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "x": "38"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "0",
        "expected": "0",
        "formattedExpected": "0",
        "params": {
          "x": "0"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "11",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "x": "11"
        }
      }
    ]
  },
  "E38": {
    "id": "E38",
    "origId": "LC268",
    "title": "Missing Number",
    "fn": "missingNumber",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int missingNumber(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def missingNumber(self, nums: list[int]) -> int:\n        pass",
      "java": "class Solution {\n    public int missingNumber(int[] nums) {\n        \n    }\n}",
      "c": "int missingNumber(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [3, 0, 1]",
        "output": "2",
        "explanation": "Return only number in range [0, n] missing."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3\n3 0 1",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "nums": "[3, 0, 1]"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "2\n0 1",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "nums": "[0, 1]"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "9\n9 6 4 2 3 5 7 0 1",
        "expected": "8",
        "formattedExpected": "8",
        "params": {
          "nums": "[9, 6, 4, 2, 3, 5, 7, 0, 1]"
        }
      }
    ]
  },
  "E39": {
    "id": "E39",
    "origId": "LC283",
    "title": "Move Zeroes",
    "fn": "moveZeroes",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "void",
      "py": "None",
      "java": "void",
      "c": "void"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    void moveZeroes(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def moveZeroes(self, nums: list[int]) -> None:\n        pass",
      "java": "class Solution {\n    public void moveZeroes(int[] nums) {\n        \n    }\n}",
      "c": "void moveZeroes(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [0, 1, 0, 3, 12]",
        "output": "[1, 3, 12, 0, 0]",
        "explanation": "Move all 0s to end while maintaining order."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "5\n0 1 0 3 12",
        "expected": "1 3 12 0 0",
        "formattedExpected": "[1, 3, 12, 0, 0]",
        "params": {
          "nums": "[0, 1, 0, 3, 12]"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1\n0",
        "expected": "0",
        "formattedExpected": "0",
        "params": {
          "nums": "[0]"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "3\n1 0 2",
        "expected": "1 2 0",
        "formattedExpected": "[1, 2, 0]",
        "params": {
          "nums": "[1, 0, 2]"
        }
      }
    ]
  },
  "E40": {
    "id": "E40",
    "origId": "LC290",
    "title": "Word Pattern",
    "fn": "wordPattern",
    "args": [
      {
        "name": "pattern",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      },
      {
        "name": "s",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool wordPattern(string pattern, string s) {\n        \n    }\n};",
      "python": "class Solution:\n    def wordPattern(self, pattern: str, s: str) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean wordPattern(String pattern, String s) {\n        \n    }\n}",
      "c": "bool wordPattern(char* pattern, char* s) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = abba dog cat cat dog",
        "output": "true",
        "explanation": "Follow bijection pattern between char and word."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "abba\ndog cat cat dog",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "input": "abba dog cat cat dog"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "abba\ndog cat cat fish",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "input": "abba dog cat cat fish"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "aaaa\ndog cat cat dog",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "input": "aaaa dog cat cat dog"
        }
      }
    ]
  },
  "E41": {
    "id": "E41",
    "origId": "LC326",
    "title": "Power of Three",
    "fn": "isPowerOfThree",
    "args": [
      {
        "name": "n",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool isPowerOfThree(int n) {\n        \n    }\n};",
      "python": "class Solution:\n    def isPowerOfThree(self, n: int) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean isPowerOfThree(int n) {\n        \n    }\n}",
      "c": "bool isPowerOfThree(int n) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "x = 27",
        "output": "true",
        "explanation": "Check if integer is power of three."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "27",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "x": "27"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "0",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "x": "0"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "9",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "x": "9"
        }
      }
    ]
  },
  "E42": {
    "id": "E42",
    "origId": "LC344",
    "title": "Reverse String",
    "fn": "reverseString",
    "args": [
      {
        "name": "s",
        "cpp": "vector<char>&",
        "py": "list[str]",
        "java": "char[]",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "void",
      "py": "None",
      "java": "void",
      "c": "void"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        \n    }\n};",
      "python": "class Solution:\n    def reverseString(self, s: list[str]) -> None:\n        pass",
      "java": "class Solution {\n    public void reverseString(char[] s) {\n        \n    }\n}",
      "c": "void reverseString(char* s) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = hello",
        "output": "olleh",
        "explanation": "Reverse character array in-place."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "hello",
        "expected": "olleh",
        "formattedExpected": "olleh",
        "params": {
          "input": "hello"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "Hannah",
        "expected": "hannaH",
        "formattedExpected": "hannaH",
        "params": {
          "input": "Hannah"
        }
      }
    ]
  },
  "E43": {
    "id": "E43",
    "origId": "LC349",
    "title": "Intersection of Two Arrays",
    "fn": "intersection",
    "args": [
      {
        "name": "nums1",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "nums2",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "vector<int>",
      "py": "list[int]",
      "java": "int[]",
      "c": "int*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<int> intersection(vector<int>& nums1, vector<int>& nums2) {\n        \n    }\n};",
      "python": "class Solution:\n    def intersection(self, nums1: list[int], nums2: list[int]) -> list[int]:\n        pass",
      "java": "class Solution {\n    public int[] intersection(int[] nums1, int[] nums2) {\n        \n    }\n}",
      "c": "int* intersection(int* nums1, int* nums2) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 4 1 2 2 1 2 2 2",
        "output": "2",
        "explanation": "Unique elements in both arrays."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4\n1 2 2 1\n2\n2 2",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "input": "4 1 2 2 1 2 2 2"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "3\n4 9 5\n5\n9 4 9 8 4",
        "expected": "4 9",
        "formattedExpected": "[4, 9]",
        "params": {
          "input": "3 4 9 5 5 9 4 9 8 4"
        }
      }
    ]
  },
  "E44": {
    "id": "E44",
    "origId": "LC374",
    "title": "Guess Number Higher or Lower",
    "fn": "guessNumber",
    "args": [
      {
        "name": "n",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int guessNumber(int n) {\n        \n    }\n};",
      "python": "class Solution:\n    def guessNumber(self, n: int) -> int:\n        pass",
      "java": "class Solution {\n    public int guessNumber(int n) {\n        \n    }\n}",
      "c": "int guessNumber(int n) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 10 6",
        "output": "6",
        "explanation": "Guess number using guess API."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "10 6",
        "expected": "6",
        "formattedExpected": "6",
        "params": {
          "input": "10 6"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 1",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "input": "1 1"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "2 1",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "input": "2 1"
        }
      }
    ]
  },
  "E45": {
    "id": "E45",
    "origId": "LC383",
    "title": "Ransom Note",
    "fn": "canConstruct",
    "args": [
      {
        "name": "ransomNote",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      },
      {
        "name": "magazine",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool canConstruct(string ransomNote, string magazine) {\n        \n    }\n};",
      "python": "class Solution:\n    def canConstruct(self, ransomNote: str, magazine: str) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean canConstruct(String ransomNote, String magazine) {\n        \n    }\n}",
      "c": "bool canConstruct(char* ransomNote, char* magazine) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "a = \"a\", b = \"b\"",
        "output": "false",
        "explanation": "Construct ransomNote from letters of magazine."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "a\nb",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "a": "\"a\"",
          "b": "\"b\""
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "aa\nab",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "a": "\"aa\"",
          "b": "\"ab\""
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "aa\naab",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "a": "\"aa\"",
          "b": "\"aab\""
        }
      }
    ]
  },
  "E46": {
    "id": "E46",
    "origId": "LC387",
    "title": "First Unique Character in a String",
    "fn": "firstUniqChar",
    "args": [
      {
        "name": "s",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int firstUniqChar(string s) {\n        \n    }\n};",
      "python": "class Solution:\n    def firstUniqChar(self, s: str) -> int:\n        pass",
      "java": "class Solution {\n    public int firstUniqChar(String s) {\n        \n    }\n}",
      "c": "int firstUniqChar(char* s) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "s = \"leetcode\"",
        "output": "0",
        "explanation": "Find first non-repeating character index."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "leetcode",
        "expected": "0",
        "formattedExpected": "0",
        "params": {
          "s": "\"leetcode\""
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "loveleetcode",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "s": "\"loveleetcode\""
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "aabb",
        "expected": "-1",
        "formattedExpected": "-1",
        "params": {
          "s": "\"aabb\""
        }
      }
    ]
  },
  "E47": {
    "id": "E47",
    "origId": "LC392",
    "title": "Is Subsequence",
    "fn": "isSubsequence",
    "args": [
      {
        "name": "s",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      },
      {
        "name": "t",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool isSubsequence(string s, string t) {\n        \n    }\n};",
      "python": "class Solution:\n    def isSubsequence(self, s: str, t: str) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean isSubsequence(String s, String t) {\n        \n    }\n}",
      "c": "bool isSubsequence(char* s, char* t) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "a = \"abc\", b = \"ahbgdc\"",
        "output": "true",
        "explanation": "Check if s is subsequence of t."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "abc\nahbgdc",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "a": "\"abc\"",
          "b": "\"ahbgdc\""
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "axc\nahbgdc",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "a": "\"axc\"",
          "b": "\"ahbgdc\""
        }
      }
    ]
  },
  "E48": {
    "id": "E48",
    "origId": "LC412",
    "title": "Fizz Buzz",
    "fn": "fizzBuzz",
    "args": [
      {
        "name": "n",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "vector<string>",
      "py": "list[str]",
      "java": "List<String>",
      "c": "char**"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        \n    }\n};",
      "python": "class Solution:\n    def fizzBuzz(self, n: int) -> list[str]:\n        pass",
      "java": "class Solution {\n    public List<String> fizzBuzz(int n) {\n        \n    }\n}",
      "c": "char** fizzBuzz(int n) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "x = 5",
        "output": "[1, 2, Fizz, 4, Buzz]",
        "explanation": "Fizz Buzz string representation from 1 to n."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "5",
        "expected": "1 2 Fizz 4 Buzz",
        "formattedExpected": "[1, 2, Fizz, 4, Buzz]",
        "params": {
          "x": "5"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "3",
        "expected": "1 2 Fizz",
        "formattedExpected": "[1, 2, Fizz]",
        "params": {
          "x": "3"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "15",
        "expected": "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz",
        "formattedExpected": "[1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz]",
        "params": {
          "x": "15"
        }
      }
    ]
  },
  "E49": {
    "id": "E49",
    "origId": "LC415",
    "title": "Add Strings",
    "fn": "addStrings",
    "args": [
      {
        "name": "num1",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      },
      {
        "name": "num2",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "string",
      "py": "str",
      "java": "String",
      "c": "char*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    string addStrings(string num1, string num2) {\n        \n    }\n};",
      "python": "class Solution:\n    def addStrings(self, num1: str, num2: str) -> str:\n        pass",
      "java": "class Solution {\n    public String addStrings(String num1, String num2) {\n        \n    }\n}",
      "c": "char* addStrings(char* num1, char* num2) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "a = \"11\", b = \"123\"",
        "output": "134",
        "explanation": "Sum of non-negative integers as string."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "11 123",
        "expected": "134",
        "formattedExpected": "134",
        "params": {
          "a": "\"11\"",
          "b": "\"123\""
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "456 77",
        "expected": "533",
        "formattedExpected": "533",
        "params": {
          "a": "\"456\"",
          "b": "\"77\""
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "0 0",
        "expected": "0",
        "formattedExpected": "0",
        "params": {
          "a": "\"0\"",
          "b": "\"0\""
        }
      }
    ]
  },
  "E50": {
    "id": "E50",
    "origId": "LC485",
    "title": "Max Consecutive Ones",
    "fn": "findMaxConsecutiveOnes",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int findMaxConsecutiveOnes(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def findMaxConsecutiveOnes(self, nums: list[int]) -> int:\n        pass",
      "java": "class Solution {\n    public int findMaxConsecutiveOnes(int[] nums) {\n        \n    }\n}",
      "c": "int findMaxConsecutiveOnes(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [1, 1, 0, 1, 1, 1]",
        "output": "3",
        "explanation": "Maximum consecutive 1s in binary array."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "6\n1 1 0 1 1 1",
        "expected": "3",
        "formattedExpected": "3",
        "params": {
          "nums": "[1, 1, 0, 1, 1, 1]"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "6\n1 0 1 1 0 1",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "nums": "[1, 0, 1, 1, 0, 1]"
        }
      }
    ]
  },
  "E51": {
    "id": "E51",
    "origId": "LC507",
    "title": "Perfect Number",
    "fn": "checkPerfectNumber",
    "args": [
      {
        "name": "num",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool checkPerfectNumber(int num) {\n        \n    }\n};",
      "python": "class Solution:\n    def checkPerfectNumber(self, num: int) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean checkPerfectNumber(int num) {\n        \n    }\n}",
      "c": "bool checkPerfectNumber(int num) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "x = 28",
        "output": "true",
        "explanation": "Number equals sum of proper divisors."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "28",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "x": "28"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "7",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "x": "7"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "6",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "x": "6"
        }
      }
    ]
  },
  "E52": {
    "id": "E52",
    "origId": "LC509",
    "title": "Fibonacci Number",
    "fn": "fib",
    "args": [
      {
        "name": "n",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int fib(int n) {\n        \n    }\n};",
      "python": "class Solution:\n    def fib(self, n: int) -> int:\n        pass",
      "java": "class Solution {\n    public int fib(int n) {\n        \n    }\n}",
      "c": "int fib(int n) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "x = 4",
        "output": "3",
        "explanation": "Compute nth Fibonacci number."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4",
        "expected": "3",
        "formattedExpected": "3",
        "params": {
          "x": "4"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "2",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "x": "2"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "3",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "x": "3"
        }
      }
    ]
  },
  "E53": {
    "id": "E53",
    "origId": "LC520",
    "title": "Detect Capital",
    "fn": "detectCapitalUse",
    "args": [
      {
        "name": "word",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool detectCapitalUse(string word) {\n        \n    }\n};",
      "python": "class Solution:\n    def detectCapitalUse(self, word: str) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean detectCapitalUse(String word) {\n        \n    }\n}",
      "c": "bool detectCapitalUse(char* word) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = USA",
        "output": "true",
        "explanation": "Valid usage of capitals in word."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "USA",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "input": "USA"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "FlaG",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "input": "FlaG"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "leetcode",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "input": "leetcode"
        }
      }
    ]
  },
  "E54": {
    "id": "E54",
    "origId": "LC543",
    "title": "Diameter of Binary Tree",
    "fn": "diameterOfBinaryTree",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int diameterOfBinaryTree(TreeNode* root) {\n        \n    }\n};",
      "python": "class Solution:\n    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:\n        pass",
      "java": "class Solution {\n    public int diameterOfBinaryTree(TreeNode root) {\n        \n    }\n}",
      "c": "int diameterOfBinaryTree(struct TreeNode* root) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 1 2 3 4 5",
        "output": "3",
        "explanation": "Longest path between any two nodes in tree."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "1 2 3 4 5",
        "expected": "3",
        "formattedExpected": "3",
        "params": {
          "input": "1 2 3 4 5"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 2",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "input": "1 2"
        }
      }
    ]
  },
  "E55": {
    "id": "E55",
    "origId": "LC643",
    "title": "Maximum Average Subarray I",
    "fn": "findMaxAverage",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "k",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "double",
      "py": "float",
      "java": "double",
      "c": "double"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    double findMaxAverage(vector<int>& nums, int k) {\n        \n    }\n};",
      "python": "class Solution:\n    def findMaxAverage(self, nums: list[int], k: int) -> float:\n        pass",
      "java": "class Solution {\n    public double findMaxAverage(int[] nums, int k) {\n        \n    }\n}",
      "c": "double findMaxAverage(int* nums, int k) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 6 4 1 12 -5 -6 50 3",
        "output": "12.75",
        "explanation": "Contiguous subarray of length k with max average."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "6 4\n1 12 -5 -6 50 3",
        "expected": "12.75",
        "formattedExpected": "12.75",
        "params": {
          "input": "6 4 1 12 -5 -6 50 3"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 1\n5",
        "expected": "5",
        "formattedExpected": "5",
        "params": {
          "input": "1 1 5"
        }
      }
    ]
  },
  "E56": {
    "id": "E56",
    "origId": "LC645",
    "title": "Set Mismatch",
    "fn": "findErrorNums",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "vector<int>",
      "py": "list[int]",
      "java": "int[]",
      "c": "int*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<int> findErrorNums(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def findErrorNums(self, nums: list[int]) -> list[int]:\n        pass",
      "java": "class Solution {\n    public int[] findErrorNums(int[] nums) {\n        \n    }\n}",
      "c": "int* findErrorNums(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 4 1 2 2 4",
        "output": "[2, 3]",
        "explanation": "Find duplicate and missing numbers."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4\n1 2 2 4",
        "expected": "2 3",
        "formattedExpected": "[2, 3]",
        "params": {
          "input": "4 1 2 2 4"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "2\n1 1",
        "expected": "1 2",
        "formattedExpected": "[1, 2]",
        "params": {
          "input": "2 1 1"
        }
      }
    ]
  },
  "E57": {
    "id": "E57",
    "origId": "LC693",
    "title": "Binary Number with Alternating Bits",
    "fn": "hasAlternatingBits",
    "args": [
      {
        "name": "n",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool hasAlternatingBits(int n) {\n        \n    }\n};",
      "python": "class Solution:\n    def hasAlternatingBits(self, n: int) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean hasAlternatingBits(int n) {\n        \n    }\n}",
      "c": "bool hasAlternatingBits(int n) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 5",
        "output": "true",
        "explanation": "Adjacent bits always have different values."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "5",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "input": "5"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "7",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "input": "7"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "11",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "input": "11"
        }
      }
    ]
  },
  "E58": {
    "id": "E58",
    "origId": "LC704",
    "title": "Binary Search",
    "fn": "search",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "target",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};",
      "python": "class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        pass",
      "java": "class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}",
      "c": "int search(int* nums, int target) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [-1, 0, 3, 5, 9, 12], target = 9",
        "output": "4",
        "explanation": "Search target in sorted array in O(log n)."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "6 9\n-1 0 3 5 9 12",
        "expected": "4",
        "formattedExpected": "4",
        "params": {
          "nums": "[-1, 0, 3, 5, 9, 12]",
          "target": "9"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "6 2\n-1 0 3 5 9 12",
        "expected": "-1",
        "formattedExpected": "-1",
        "params": {
          "nums": "[-1, 0, 3, 5, 9, 12]",
          "target": "2"
        }
      }
    ]
  },
  "E59": {
    "id": "E59",
    "origId": "LC860",
    "title": "Lemonade Change",
    "fn": "lemonadeChange",
    "args": [
      {
        "name": "bills",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool lemonadeChange(vector<int>& bills) {\n        \n    }\n};",
      "python": "class Solution:\n    def lemonadeChange(self, bills: list[int]) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean lemonadeChange(int[] bills) {\n        \n    }\n}",
      "c": "bool lemonadeChange(int* bills) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 5 5 5 5 10 20",
        "output": "true",
        "explanation": "Provide correct change to each customer."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "5\n5 5 5 10 20",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "input": "5 5 5 5 10 20"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "5\n5 5 10 10 20",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "input": "5 5 5 10 10 20"
        }
      }
    ]
  },
  "E60": {
    "id": "E60",
    "origId": "LC868",
    "title": "Binary Gap",
    "fn": "binaryGap",
    "args": [
      {
        "name": "n",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int binaryGap(int n) {\n        \n    }\n};",
      "python": "class Solution:\n    def binaryGap(self, n: int) -> int:\n        pass",
      "java": "class Solution {\n    public int binaryGap(int n) {\n        \n    }\n}",
      "c": "int binaryGap(int n) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "x = 22",
        "output": "2",
        "explanation": "Longest distance between consecutive 1s in binary."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "22",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "x": "22"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "8",
        "expected": "0",
        "formattedExpected": "0",
        "params": {
          "x": "8"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "5",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "x": "5"
        }
      }
    ]
  },
  "E61": {
    "id": "E61",
    "origId": "LC876",
    "title": "Middle of the Linked List",
    "fn": "middleNode",
    "args": [
      {
        "name": "head",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      }
    ],
    "ret": {
      "cpp": "ListNode*",
      "py": "Optional[ListNode]",
      "java": "ListNode",
      "c": "struct ListNode*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    ListNode* middleNode(ListNode* head) {\n        \n    }\n};",
      "python": "class Solution:\n    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        pass",
      "java": "class Solution {\n    public ListNode middleNode(ListNode head) {\n        \n    }\n}",
      "c": "struct ListNode* middleNode(struct ListNode* head) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 5 1 2 3 4 5",
        "output": "[3, 4, 5]",
        "explanation": "Return middle node of linked list."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "5\n1 2 3 4 5",
        "expected": "3 4 5",
        "formattedExpected": "[3, 4, 5]",
        "params": {
          "input": "5 1 2 3 4 5"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "6\n1 2 3 4 5 6",
        "expected": "4 5 6",
        "formattedExpected": "[4, 5, 6]",
        "params": {
          "input": "6 1 2 3 4 5 6"
        }
      }
    ]
  },
  "E62": {
    "id": "E62",
    "origId": "LC1021",
    "title": "Remove Outermost Parentheses",
    "fn": "removeOuterParentheses",
    "args": [
      {
        "name": "s",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "string",
      "py": "str",
      "java": "String",
      "c": "char*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    string removeOuterParentheses(string s) {\n        \n    }\n};",
      "python": "class Solution:\n    def removeOuterParentheses(self, s: str) -> str:\n        pass",
      "java": "class Solution {\n    public String removeOuterParentheses(String s) {\n        \n    }\n}",
      "c": "char* removeOuterParentheses(char* s) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "s = \"(()())(())\"",
        "output": "()()()",
        "explanation": "Remove outer parentheses of primitive valid components."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "(()())(())",
        "expected": "()()()",
        "formattedExpected": "()()()",
        "params": {
          "s": "\"(()())(())\""
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "(()())(())(()(()))",
        "expected": "()()()()(())",
        "formattedExpected": "()()()()(())",
        "params": {
          "s": "\"(()())(())(()(()))\""
        }
      }
    ]
  },
  "E63": {
    "id": "E63",
    "origId": "LC1051",
    "title": "Height Checker",
    "fn": "heightChecker",
    "args": [
      {
        "name": "heights",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int heightChecker(vector<int>& heights) {\n        \n    }\n};",
      "python": "class Solution:\n    def heightChecker(self, heights: list[int]) -> int:\n        pass",
      "java": "class Solution {\n    public int heightChecker(int[] heights) {\n        \n    }\n}",
      "c": "int heightChecker(int* heights) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 6 1 1 4 2 1 3",
        "output": "3",
        "explanation": "Indices where heights[i] != expected[i]."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "6\n1 1 4 2 1 3",
        "expected": "3",
        "formattedExpected": "3",
        "params": {
          "input": "6 1 1 4 2 1 3"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "5\n5 1 2 3 4",
        "expected": "5",
        "formattedExpected": "5",
        "params": {
          "input": "5 5 1 2 3 4"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "5\n1 2 3 4 5",
        "expected": "0",
        "formattedExpected": "0",
        "params": {
          "input": "5 1 2 3 4 5"
        }
      }
    ]
  },
  "E64": {
    "id": "E64",
    "origId": "LC1266",
    "title": "Minimum Time Visiting All Points",
    "fn": "minTimeToVisitAllPoints",
    "args": [
      {
        "name": "points",
        "cpp": "vector<vector<int>>&",
        "py": "list[list[int]]",
        "java": "int[][]",
        "c": "int**"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int minTimeToVisitAllPoints(vector<vector<int>>& points) {\n        \n    }\n};",
      "python": "class Solution:\n    def minTimeToVisitAllPoints(self, points: list[list[int]]) -> int:\n        pass",
      "java": "class Solution {\n    public int minTimeToVisitAllPoints(int[][] points) {\n        \n    }\n}",
      "c": "int minTimeToVisitAllPoints(int** points) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 3 1 1 3 4 -1 0",
        "output": "7",
        "explanation": "Min seconds to visit all points in order."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3\n1 1\n3 4\n-1 0",
        "expected": "7",
        "formattedExpected": "7",
        "params": {
          "input": "3 1 1 3 4 -1 0"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "2\n3 2\n-2 2",
        "expected": "5",
        "formattedExpected": "5",
        "params": {
          "input": "2 3 2 -2 2"
        }
      }
    ]
  },
  "E65": {
    "id": "E65",
    "origId": "LC1290",
    "title": "Convert Binary Number in a Linked List to Integer",
    "fn": "getDecimalValue",
    "args": [
      {
        "name": "head",
        "cpp": "ListNode*",
        "py": "ListNode",
        "java": "ListNode",
        "c": "struct ListNode*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int getDecimalValue(ListNode* head) {\n        \n    }\n};",
      "python": "class Solution:\n    def getDecimalValue(self, head: ListNode) -> int:\n        pass",
      "java": "class Solution {\n    public int getDecimalValue(ListNode head) {\n        \n    }\n}",
      "c": "int getDecimalValue(struct ListNode* head) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 3 1 0 1",
        "output": "5",
        "explanation": "Decimal value of binary linked list."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3\n1 0 1",
        "expected": "5",
        "formattedExpected": "5",
        "params": {
          "input": "3 1 0 1"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1\n0",
        "expected": "0",
        "formattedExpected": "0",
        "params": {
          "input": "1 0"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "15\n1 0 0 1 0 0 1 1 1 0 0 0 0 0 0",
        "expected": "18880",
        "formattedExpected": "18880",
        "params": {
          "input": "15 1 0 0 1 0 0 1 1 1 0 0 0 0 0 0"
        }
      }
    ]
  },
  "E66": {
    "id": "E66",
    "origId": "LC1752",
    "title": "Check if Array Is Sorted and Rotated",
    "fn": "check",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool check(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def check(self, nums: list[int]) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean check(int[] nums) {\n        \n    }\n}",
      "c": "bool check(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [3, 4, 5, 1, 2]",
        "output": "true",
        "explanation": "Check if array was originally sorted and rotated."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "5\n3 4 5 1 2",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "nums": "[3, 4, 5, 1, 2]"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "4\n2 1 3 4",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "nums": "[2, 1, 3, 4]"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "3\n1 2 3",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "nums": "[1, 2, 3]"
        }
      }
    ]
  },
  "E67": {
    "id": "E67",
    "origId": "LC1929",
    "title": "Concatenation of Array",
    "fn": "getConcatenation",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "vector<int>",
      "py": "list[int]",
      "java": "int[]",
      "c": "int*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<int> getConcatenation(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def getConcatenation(self, nums: list[int]) -> list[int]:\n        pass",
      "java": "class Solution {\n    public int[] getConcatenation(int[] nums) {\n        \n    }\n}",
      "c": "int* getConcatenation(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [1, 2, 1]",
        "output": "[1, 2, 1, 1, 2, 1]",
        "explanation": "Concatenation of array of length 2n."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3\n1 2 1",
        "expected": "1 2 1 1 2 1",
        "formattedExpected": "[1, 2, 1, 1, 2, 1]",
        "params": {
          "nums": "[1, 2, 1]"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "4\n1 3 2 1",
        "expected": "1 3 2 1 1 3 2 1",
        "formattedExpected": "[1, 3, 2, 1, 1, 3, 2, 1]",
        "params": {
          "nums": "[1, 3, 2, 1]"
        }
      }
    ]
  },
  "E68": {
    "id": "E68",
    "origId": "LC1941",
    "title": "Check if All Characters Have Equal Number of Occurrences",
    "fn": "areOccurrencesEqual",
    "args": [
      {
        "name": "s",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool areOccurrencesEqual(string s) {\n        \n    }\n};",
      "python": "class Solution:\n    def areOccurrencesEqual(self, s: str) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean areOccurrencesEqual(String s) {\n        \n    }\n}",
      "c": "bool areOccurrencesEqual(char* s) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "s = \"abacbc\"",
        "output": "true",
        "explanation": "Check if all characters have equal frequencies."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "abacbc",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "s": "\"abacbc\""
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "aaabb",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "s": "\"aaabb\""
        }
      }
    ]
  },
  "E69": {
    "id": "E69",
    "origId": "LC3110",
    "title": "Score of a String",
    "fn": "scoreOfString",
    "args": [
      {
        "name": "s",
        "cpp": "string",
        "py": "str",
        "java": "String",
        "c": "char*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int scoreOfString(string s) {\n        \n    }\n};",
      "python": "class Solution:\n    def scoreOfString(self, s: str) -> int:\n        pass",
      "java": "class Solution {\n    public int scoreOfString(String s) {\n        \n    }\n}",
      "c": "int scoreOfString(char* s) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "s = \"hello\"",
        "output": "13",
        "explanation": "Sum of absolute difference of adjacent ASCII codes."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "hello",
        "expected": "13",
        "formattedExpected": "13",
        "params": {
          "s": "\"hello\""
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "zaz",
        "expected": "50",
        "formattedExpected": "50",
        "params": {
          "s": "\"zaz\""
        }
      }
    ]
  },
  "E70": {
    "id": "E70",
    "origId": "LC3467",
    "title": "Transform Array by Parity",
    "fn": "transformArray",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "vector<int>",
      "py": "list[int]",
      "java": "int[]",
      "c": "int*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<int> transformArray(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def transformArray(self, nums: list[int]) -> list[int]:\n        pass",
      "java": "class Solution {\n    public int[] transformArray(int[] nums) {\n        \n    }\n}",
      "c": "int* transformArray(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [4, 3, 2, 1]",
        "output": "[0, 0, 1, 1]",
        "explanation": "Replace even with 0 and odd with 1 then sort."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4\n4 3 2 1",
        "expected": "0 0 1 1",
        "formattedExpected": "[0, 0, 1, 1]",
        "params": {
          "nums": "[4, 3, 2, 1]"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "3\n1 5 1",
        "expected": "1 1 1",
        "formattedExpected": "[1, 1, 1]",
        "params": {
          "nums": "[1, 5, 1]"
        }
      }
    ]
  },
  "E71": {
    "id": "E71",
    "origId": "LC3512",
    "title": "Minimum Operations to Make Array Sum Divisible by K",
    "fn": "minOperations",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "k",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int minOperations(vector<int>& nums, int k) {\n        \n    }\n};",
      "python": "class Solution:\n    def minOperations(self, nums: list[int], k: int) -> int:\n        pass",
      "java": "class Solution {\n    public int minOperations(int[] nums, int k) {\n        \n    }\n}",
      "c": "int minOperations(int* nums, int k) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 3 5 3 9 7",
        "output": "4",
        "explanation": "Min operations to make array sum divisible by k."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3 5\n3 9 7",
        "expected": "4",
        "formattedExpected": "4",
        "params": {
          "input": "3 5 3 9 7"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "2 3\n1 2",
        "expected": "0",
        "formattedExpected": "0",
        "params": {
          "input": "2 3 1 2"
        }
      }
    ]
  },
  "M1": {
    "id": "M1",
    "origId": "LC2",
    "title": "Add Two Numbers",
    "fn": "addTwoNumbers",
    "args": [
      {
        "name": "l1",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      },
      {
        "name": "l2",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      }
    ],
    "ret": {
      "cpp": "ListNode*",
      "py": "Optional[ListNode]",
      "java": "ListNode",
      "c": "struct ListNode*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        \n    }\n};",
      "python": "class Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        pass",
      "java": "class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        \n    }\n}",
      "c": "struct ListNode* addTwoNumbers(struct ListNode* l1, struct ListNode* l2) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 3 3 2 4 3 5 6 4",
        "output": "[7, 0, 8]",
        "explanation": "342 + 465 = 807."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3 3\n2 4 3\n5 6 4",
        "expected": "7 0 8",
        "formattedExpected": "[7, 0, 8]",
        "params": {
          "input": "3 3 2 4 3 5 6 4"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 1\n0\n0",
        "expected": "0",
        "formattedExpected": "0",
        "params": {
          "input": "1 1 0 0"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "7 4\n9 9 9 9 9 9 9\n9 9 9 9",
        "expected": "8 9 9 9 0 0 0 1",
        "formattedExpected": "[8, 9, 9, 9, 0, 0, 0, 1]",
        "params": {
          "input": "7 4 9 9 9 9 9 9 9 9 9 9 9"
        }
      }
    ]
  },
  "M2": {
    "id": "M2",
    "origId": "LC7",
    "title": "Reverse Integer",
    "fn": "reverse",
    "args": [
      {
        "name": "x",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int reverse(int x) {\n        \n    }\n};",
      "python": "class Solution:\n    def reverse(self, x: int) -> int:\n        pass",
      "java": "class Solution {\n    public int reverse(int x) {\n        \n    }\n}",
      "c": "int reverse(int x) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "x = 123",
        "output": "321",
        "explanation": "Reversed digits of 123 is 321."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "123",
        "expected": "321",
        "formattedExpected": "321",
        "params": {
          "x": "123"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "-123",
        "expected": "-321",
        "formattedExpected": "-321",
        "params": {
          "x": "-123"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "120",
        "expected": "21",
        "formattedExpected": "21",
        "params": {
          "x": "120"
        }
      }
    ]
  },
  "M3": {
    "id": "M3",
    "origId": "LC11",
    "title": "Container With Most Water",
    "fn": "maxArea",
    "args": [
      {
        "name": "height",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        \n    }\n};",
      "python": "class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        pass",
      "java": "class Solution {\n    public int maxArea(int[] height) {\n        \n    }\n}",
      "c": "int maxArea(int* height) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 9 1 8 6 2 5 4 8 3 7",
        "output": "49",
        "explanation": "The max area of water the container can contain is 49."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "9\n1 8 6 2 5 4 8 3 7",
        "expected": "49",
        "formattedExpected": "49",
        "params": {
          "input": "9 1 8 6 2 5 4 8 3 7"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "2\n1 1",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "input": "2 1 1"
        }
      }
    ]
  },
  "M4": {
    "id": "M4",
    "origId": "LC19",
    "title": "Remove Nth Node From End of List",
    "fn": "removeNthFromEnd",
    "args": [
      {
        "name": "head",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      },
      {
        "name": "n",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "ListNode*",
      "py": "Optional[ListNode]",
      "java": "ListNode",
      "c": "struct ListNode*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    ListNode* removeNthFromEnd(ListNode* head, int n) {\n        \n    }\n};",
      "python": "class Solution:\n    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:\n        pass",
      "java": "class Solution {\n    public ListNode removeNthFromEnd(ListNode head, int n) {\n        \n    }\n}",
      "c": "struct ListNode* removeNthFromEnd(struct ListNode* head, int n) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 5 2 1 2 3 4 5",
        "output": "[1, 2, 3, 5]",
        "explanation": "Remove the 2nd node from end."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "5 2\n1 2 3 4 5",
        "expected": "1 2 3 5",
        "formattedExpected": "[1, 2, 3, 5]",
        "params": {
          "input": "5 2 1 2 3 4 5"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 1\n1",
        "expected": "empty",
        "formattedExpected": "empty",
        "params": {
          "input": "1 1 1"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "2 1\n1 2",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "input": "2 1 1 2"
        }
      }
    ]
  },
  "M5": {
    "id": "M5",
    "origId": "LC33",
    "title": "Search in Rotated Sorted Array",
    "fn": "search",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "target",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};",
      "python": "class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        pass",
      "java": "class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}",
      "c": "int search(int* nums, int target) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [4, 5, 6, 7, 0, 1, 2], target = 0",
        "output": "4",
        "explanation": "Return index of target if found, else -1."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "7 0\n4 5 6 7 0 1 2",
        "expected": "4",
        "formattedExpected": "4",
        "params": {
          "nums": "[4, 5, 6, 7, 0, 1, 2]",
          "target": "0"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "7 3\n4 5 6 7 0 1 2",
        "expected": "-1",
        "formattedExpected": "-1",
        "params": {
          "nums": "[4, 5, 6, 7, 0, 1, 2]",
          "target": "3"
        }
      }
    ]
  },
  "M6": {
    "id": "M6",
    "origId": "LC53",
    "title": "Maximum Subarray",
    "fn": "maxSubArray",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        pass",
      "java": "class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}",
      "c": "int maxSubArray(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
        "output": "6",
        "explanation": "The subarray with the largest sum is [4,-1,2,1] with sum 6."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "9\n-2 1 -3 4 -1 2 1 -5 4",
        "expected": "6",
        "formattedExpected": "6",
        "params": {
          "nums": "[-2, 1, -3, 4, -1, 2, 1, -5, 4]"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1\n1",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "nums": "[1]"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "5\n5 4 -1 7 8",
        "expected": "23",
        "formattedExpected": "23",
        "params": {
          "nums": "[5, 4, -1, 7, 8]"
        }
      }
    ]
  },
  "M7": {
    "id": "M7",
    "origId": "LC75",
    "title": "Sort Colors",
    "fn": "sortColors",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "void",
      "py": "None",
      "java": "void",
      "c": "void"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    void sortColors(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def sortColors(self, nums: list[int]) -> None:\n        pass",
      "java": "class Solution {\n    public void sortColors(int[] nums) {\n        \n    }\n}",
      "c": "void sortColors(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [2, 0, 2, 1, 1, 0]",
        "output": "[0, 0, 1, 1, 2, 2]",
        "explanation": "Sort objects in-place so colors 0, 1, 2 are adjacent."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "6\n2 0 2 1 1 0",
        "expected": "0 0 1 1 2 2",
        "formattedExpected": "[0, 0, 1, 1, 2, 2]",
        "params": {
          "nums": "[2, 0, 2, 1, 1, 0]"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "3\n2 0 1",
        "expected": "0 1 2",
        "formattedExpected": "[0, 1, 2]",
        "params": {
          "nums": "[2, 0, 1]"
        }
      }
    ]
  },
  "M8": {
    "id": "M8",
    "origId": "LC92",
    "title": "Reverse Linked List II",
    "fn": "reverseBetween",
    "args": [
      {
        "name": "head",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      },
      {
        "name": "left",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      },
      {
        "name": "right",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "ListNode*",
      "py": "Optional[ListNode]",
      "java": "ListNode",
      "c": "struct ListNode*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    ListNode* reverseBetween(ListNode* head, int left, int right) {\n        \n    }\n};",
      "python": "class Solution:\n    def reverseBetween(self, head: Optional[ListNode], left: int, right: int) -> Optional[ListNode]:\n        pass",
      "java": "class Solution {\n    public ListNode reverseBetween(ListNode head, int left, int right) {\n        \n    }\n}",
      "c": "struct ListNode* reverseBetween(struct ListNode* head, int left, int right) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 5 2 4 1 2 3 4 5",
        "output": "[1, 4, 3, 2, 5]",
        "explanation": "Reverse nodes from position left to right."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "5 2 4\n1 2 3 4 5",
        "expected": "1 4 3 2 5",
        "formattedExpected": "[1, 4, 3, 2, 5]",
        "params": {
          "input": "5 2 4 1 2 3 4 5"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 1 1\n5",
        "expected": "5",
        "formattedExpected": "5",
        "params": {
          "input": "1 1 1 5"
        }
      }
    ]
  },
  "M9": {
    "id": "M9",
    "origId": "LC98",
    "title": "Validate Binary Search Tree",
    "fn": "isValidBST",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "bool",
      "py": "bool",
      "java": "boolean",
      "c": "bool"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    bool isValidBST(TreeNode* root) {\n        \n    }\n};",
      "python": "class Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        pass",
      "java": "class Solution {\n    public boolean isValidBST(TreeNode root) {\n        \n    }\n}",
      "c": "bool isValidBST(struct TreeNode* root) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 2 1 3",
        "output": "true",
        "explanation": "Determine if it is a valid binary search tree."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "2 1 3",
        "expected": "true",
        "formattedExpected": "true",
        "params": {
          "input": "2 1 3"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "5 1 4 null null 3 6",
        "expected": "false",
        "formattedExpected": "false",
        "params": {
          "input": "5 1 4 null null 3 6"
        }
      }
    ]
  },
  "M10": {
    "id": "M10",
    "origId": "LC103",
    "title": "Binary Tree Zigzag Level Order Traversal",
    "fn": "zigzagLevelOrder",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "vector<vector<int>>",
      "py": "list[list[int]]",
      "java": "List<List<Integer>>",
      "c": "int**"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {\n        \n    }\n};",
      "python": "class Solution:\n    def zigzagLevelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:\n        pass",
      "java": "class Solution {\n    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {\n        \n    }\n}",
      "c": "int** zigzagLevelOrder(struct TreeNode* root) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 3 9 20 null null 15 7",
        "output": "[3, 20, 9, 15, 7]",
        "explanation": "Zigzag level order traversal of binary tree."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3 9 20 null null 15 7",
        "expected": "3\n20 9\n15 7",
        "formattedExpected": "[3, 20, 9, 15, 7]",
        "params": {
          "input": "3 9 20 null null 15 7"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "input": "1"
        }
      }
    ]
  },
  "M11": {
    "id": "M11",
    "origId": "LC113",
    "title": "Path Sum II",
    "fn": "pathSum",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      },
      {
        "name": "targetSum",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "vector<vector<int>>",
      "py": "list[list[int]]",
      "java": "List<List<Integer>>",
      "c": "int**"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<vector<int>> pathSum(TreeNode* root, int targetSum) {\n        \n    }\n};",
      "python": "class Solution:\n    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> list[list[int]]:\n        pass",
      "java": "class Solution {\n    public List<List<Integer>> pathSum(TreeNode root, int targetSum) {\n        \n    }\n}",
      "c": "int** pathSum(struct TreeNode* root, int targetSum) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 22 5 4 8 11 null 13 4 7 2 null null 5 1",
        "output": "[5, 4, 11, 2, 5, 8, 4, 5]",
        "explanation": "Return all root-to-leaf paths equaling targetSum."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "22\n5 4 8 11 null 13 4 7 2 null null 5 1",
        "expected": "5 4 11 2\n5 8 4 5",
        "formattedExpected": "[5, 4, 11, 2, 5, 8, 4, 5]",
        "params": {
          "input": "22 5 4 8 11 null 13 4 7 2 null null 5 1"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "5\n1 2",
        "expected": "empty",
        "formattedExpected": "empty",
        "params": {
          "input": "5 1 2"
        }
      }
    ]
  },
  "M12": {
    "id": "M12",
    "origId": "LC142",
    "title": "Linked List Cycle II",
    "fn": "detectCycle",
    "args": [
      {
        "name": "head",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      }
    ],
    "ret": {
      "cpp": "ListNode*",
      "py": "Optional[ListNode]",
      "java": "ListNode",
      "c": "struct ListNode*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    ListNode* detectCycle(ListNode* head) {\n        \n    }\n};",
      "python": "class Solution:\n    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        pass",
      "java": "class Solution {\n    public ListNode detectCycle(ListNode head) {\n        \n    }\n}",
      "c": "struct ListNode* detectCycle(struct ListNode* head) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 4 1 3 2 0 -4",
        "output": "1",
        "explanation": "Return node where cycle begins."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4 1\n3 2 0 -4",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "input": "4 1 3 2 0 -4"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 -1\n1",
        "expected": "-1",
        "formattedExpected": "-1",
        "params": {
          "input": "1 -1 1"
        }
      }
    ]
  },
  "M13": {
    "id": "M13",
    "origId": "LC143",
    "title": "Reorder List",
    "fn": "reorderList",
    "args": [
      {
        "name": "head",
        "cpp": "ListNode*",
        "py": "Optional[ListNode]",
        "java": "ListNode",
        "c": "struct ListNode*"
      }
    ],
    "ret": {
      "cpp": "void",
      "py": "None",
      "java": "void",
      "c": "void"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    void reorderList(ListNode* head) {\n        \n    }\n};",
      "python": "class Solution:\n    def reorderList(self, head: Optional[ListNode]) -> None:\n        pass",
      "java": "class Solution {\n    public void reorderList(ListNode head) {\n        \n    }\n}",
      "c": "void reorderList(struct ListNode* head) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 4 1 2 3 4",
        "output": "[1, 4, 2, 3]",
        "explanation": "Reorder list in-place L0 -> Ln -> L1 -> Ln-1."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4\n1 2 3 4",
        "expected": "1 4 2 3",
        "formattedExpected": "[1, 4, 2, 3]",
        "params": {
          "input": "4 1 2 3 4"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "5\n1 2 3 4 5",
        "expected": "1 5 2 4 3",
        "formattedExpected": "[1, 5, 2, 4, 3]",
        "params": {
          "input": "5 1 2 3 4 5"
        }
      }
    ]
  },
  "M14": {
    "id": "M14",
    "origId": "LC162",
    "title": "Find Peak Element",
    "fn": "findPeakElement",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int findPeakElement(vector<int>& nums) {\n        \n    }\n};",
      "python": "class Solution:\n    def findPeakElement(self, nums: list[int]) -> int:\n        pass",
      "java": "class Solution {\n    public int findPeakElement(int[] nums) {\n        \n    }\n}",
      "c": "int findPeakElement(int* nums) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 4 1 2 3 1",
        "output": "2",
        "explanation": "Find peak element strictly greater than neighbors."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4\n1 2 3 1",
        "expected": "2",
        "formattedExpected": "2",
        "params": {
          "input": "4 1 2 3 1"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "7\n1 2 1 3 5 6 4",
        "expected": "5",
        "formattedExpected": "5",
        "params": {
          "input": "7 1 2 1 3 5 6 4"
        }
      }
    ]
  },
  "M15": {
    "id": "M15",
    "origId": "LC167",
    "title": "Two Sum II – Input Array Is Sorted",
    "fn": "twoSum",
    "args": [
      {
        "name": "numbers",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "target",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "vector<int>",
      "py": "list[int]",
      "java": "int[]",
      "c": "int*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& numbers, int target) {\n        \n    }\n};",
      "python": "class Solution:\n    def twoSum(self, numbers: list[int], target: int) -> list[int]:\n        pass",
      "java": "class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        \n    }\n}",
      "c": "int* twoSum(int* numbers, int target) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [2, 7, 11, 15], target = 9",
        "output": "[1, 2]",
        "explanation": "1-indexed Two Sum in sorted array."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4 9\n2 7 11 15",
        "expected": "1 2",
        "formattedExpected": "[1, 2]",
        "params": {
          "nums": "[2, 7, 11, 15]",
          "target": "9"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "3 6\n2 3 4",
        "expected": "1 3",
        "formattedExpected": "[1, 3]",
        "params": {
          "nums": "[2, 3, 4]",
          "target": "6"
        }
      }
    ]
  },
  "M16": {
    "id": "M16",
    "origId": "LC189",
    "title": "Rotate Array",
    "fn": "rotate",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "k",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "void",
      "py": "None",
      "java": "void",
      "c": "void"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    void rotate(vector<int>& nums, int k) {\n        \n    }\n};",
      "python": "class Solution:\n    def rotate(self, nums: list[int], k: int) -> None:\n        pass",
      "java": "class Solution {\n    public void rotate(int[] nums, int k) {\n        \n    }\n}",
      "c": "void rotate(int* nums, int k) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 7 3 1 2 3 4 5 6 7",
        "output": "[5, 6, 7, 1, 2, 3, 4]",
        "explanation": "Rotate array to right by k steps."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "7 3\n1 2 3 4 5 6 7",
        "expected": "5 6 7 1 2 3 4",
        "formattedExpected": "[5, 6, 7, 1, 2, 3, 4]",
        "params": {
          "input": "7 3 1 2 3 4 5 6 7"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "4 2\n-1 -100 3 99",
        "expected": "3 99 -1 -100",
        "formattedExpected": "[3, 99, -1, -100]",
        "params": {
          "input": "4 2 -1 -100 3 99"
        }
      }
    ]
  },
  "M17": {
    "id": "M17",
    "origId": "LC199",
    "title": "Binary Tree Right Side View",
    "fn": "rightSideView",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "vector<int>",
      "py": "list[int]",
      "java": "List<Integer>",
      "c": "int*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<int> rightSideView(TreeNode* root) {\n        \n    }\n};",
      "python": "class Solution:\n    def rightSideView(self, root: Optional[TreeNode]) -> list[int]:\n        pass",
      "java": "class Solution {\n    public List<Integer> rightSideView(TreeNode root) {\n        \n    }\n}",
      "c": "int* rightSideView(struct TreeNode* root) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 1 2 3 null 5 null 4",
        "output": "[1, 3, 4]",
        "explanation": "Values visible from right side of tree."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "1 2 3 null 5 null 4",
        "expected": "1 3 4",
        "formattedExpected": "[1, 3, 4]",
        "params": {
          "input": "1 2 3 null 5 null 4"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 null 3",
        "expected": "1 3",
        "formattedExpected": "[1, 3]",
        "params": {
          "input": "1 null 3"
        }
      }
    ]
  },
  "M18": {
    "id": "M18",
    "origId": "LC222",
    "title": "Count Complete Tree Nodes",
    "fn": "countNodes",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int countNodes(TreeNode* root) {\n        \n    }\n};",
      "python": "class Solution:\n    def countNodes(self, root: Optional[TreeNode]) -> int:\n        pass",
      "java": "class Solution {\n    public int countNodes(TreeNode root) {\n        \n    }\n}",
      "c": "int countNodes(struct TreeNode* root) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 1 2 3 4 5 6",
        "output": "6",
        "explanation": "Count total nodes in complete binary tree."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "1 2 3 4 5 6",
        "expected": "6",
        "formattedExpected": "6",
        "params": {
          "input": "1 2 3 4 5 6"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "input": "1"
        }
      }
    ]
  },
  "M19": {
    "id": "M19",
    "origId": "LC237",
    "title": "Delete Node in a Linked List",
    "fn": "deleteNode",
    "args": [
      {
        "name": "node",
        "cpp": "ListNode*",
        "py": "ListNode",
        "java": "ListNode",
        "c": "struct ListNode*"
      }
    ],
    "ret": {
      "cpp": "void",
      "py": "None",
      "java": "void",
      "c": "void"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    void deleteNode(ListNode* node) {\n        \n    }\n};",
      "python": "class Solution:\n    def deleteNode(self, node: ListNode) -> None:\n        pass",
      "java": "class Solution {\n    public void deleteNode(ListNode node) {\n        \n    }\n}",
      "c": "void deleteNode(struct ListNode* node) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 4 5 4 5 1 9",
        "output": "[4, 1, 9]",
        "explanation": "Delete node from linked list given only pointer to node."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "4 5\n4 5 1 9",
        "expected": "4 1 9",
        "formattedExpected": "[4, 1, 9]",
        "params": {
          "input": "4 5 4 5 1 9"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "4 1\n4 5 1 9",
        "expected": "4 5 9",
        "formattedExpected": "[4, 5, 9]",
        "params": {
          "input": "4 1 4 5 1 9"
        }
      }
    ]
  },
  "M20": {
    "id": "M20",
    "origId": "LC347",
    "title": "Top K Frequent Elements",
    "fn": "topKFrequent",
    "args": [
      {
        "name": "nums",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "k",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "vector<int>",
      "py": "list[int]",
      "java": "int[]",
      "c": "int*"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    vector<int> topKFrequent(vector<int>& nums, int k) {\n        \n    }\n};",
      "python": "class Solution:\n    def topKFrequent(self, nums: list[int], k: int) -> list[int]:\n        pass",
      "java": "class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        \n    }\n}",
      "c": "int* topKFrequent(int* nums, int k) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "nums = [1, 1, 1, 2, 2, 3], target = 2",
        "output": "[1, 2]",
        "explanation": "Return k most frequent elements."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "6 2\n1 1 1 2 2 3",
        "expected": "1 2",
        "formattedExpected": "[1, 2]",
        "params": {
          "nums": "[1, 1, 1, 2, 2, 3]",
          "target": "2"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1 1\n1",
        "expected": "1",
        "formattedExpected": "1",
        "params": {
          "nums": "[1]",
          "target": "1"
        }
      }
    ]
  },
  "M21": {
    "id": "M21",
    "origId": "LC2385",
    "title": "Amount of Time for Binary Tree to Be Infected",
    "fn": "amountOfTime",
    "args": [
      {
        "name": "root",
        "cpp": "TreeNode*",
        "py": "Optional[TreeNode]",
        "java": "TreeNode",
        "c": "struct TreeNode*"
      },
      {
        "name": "start",
        "cpp": "int",
        "py": "int",
        "java": "int",
        "c": "int"
      }
    ],
    "ret": {
      "cpp": "int",
      "py": "int",
      "java": "int",
      "c": "int"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    int amountOfTime(TreeNode* root, int start) {\n        \n    }\n};",
      "python": "class Solution:\n    def amountOfTime(self, root: Optional[TreeNode], start: int) -> int:\n        pass",
      "java": "class Solution {\n    public int amountOfTime(TreeNode root, int start) {\n        \n    }\n}",
      "c": "int amountOfTime(struct TreeNode* root, int start) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 3 1 5 3 null 4 10 6 9 2",
        "output": "4",
        "explanation": "Minutes to infect entire binary tree from start node."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "3\n1 5 3 null 4 10 6 9 2",
        "expected": "4",
        "formattedExpected": "4",
        "params": {
          "input": "3 1 5 3 null 4 10 6 9 2"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "1\n1",
        "expected": "0",
        "formattedExpected": "0",
        "params": {
          "input": "1 1"
        }
      }
    ]
  },
  "H1": {
    "id": "H1",
    "origId": "LC4",
    "title": "Median of Two Sorted Arrays",
    "fn": "findMedianSortedArrays",
    "args": [
      {
        "name": "nums1",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      },
      {
        "name": "nums2",
        "cpp": "vector<int>&",
        "py": "list[int]",
        "java": "int[]",
        "c": "int*"
      }
    ],
    "ret": {
      "cpp": "double",
      "py": "float",
      "java": "double",
      "c": "double"
    },
    "templates": {
      "cpp": "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        \n    }\n};",
      "python": "class Solution:\n    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:\n        pass",
      "java": "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        \n    }\n}",
      "c": "double findMedianSortedArrays(int* nums1, int* nums2) {\n    \n}"
    },
    "solutions": null,
    "examples": [
      {
        "id": 1,
        "input": "input = 2 1 1 3 2",
        "output": "2.00000",
        "explanation": "merged array = [1,2,3] and median is 2.0."
      }
    ],
    "testcases": [
      {
        "id": 1,
        "title": "Case 1",
        "rawStdin": "2 1\n1 3\n2",
        "expected": "2.00000",
        "formattedExpected": "2.00000",
        "params": {
          "input": "2 1 1 3 2"
        }
      },
      {
        "id": 2,
        "title": "Case 2",
        "rawStdin": "2 2\n1 2\n3 4",
        "expected": "2.50000",
        "formattedExpected": "2.50000",
        "params": {
          "input": "2 2 1 2 3 4"
        }
      },
      {
        "id": 3,
        "title": "Case 3",
        "rawStdin": "0 1\n\n1",
        "expected": "1.00000",
        "formattedExpected": "1.00000",
        "params": {
          "input": "0 1 1"
        }
      }
    ]
  }
};

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
    if (/\bint\s+main\s*\(/i.test(clean)) return code;
  } else if (lang === 'python') {
    if (/__name__\s*==\s*['"]__main__['"]/i.test(clean) || /\bdef\s+main\s*\(/i.test(clean)) return code;
  } else if (lang === 'java') {
    if (/\bpublic\s+static\s+void\s+main\s*\(/i.test(clean)) return code;
  }

  // Generate wrapper with test harness
  if (lang === 'python') {
    return `import sys, collections, heapq, bisect, math, json
from typing import *

${code}

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    sol = Solution()
    method_name = '${fn}'
    if not hasattr(sol, method_name):
        methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
        method_name = methods[0] if methods else '${fn}'
    
    target_fn = getattr(sol, method_name, None)
    if target_fn:
        try:
            if '${id}' in ['E1', 'M15']:
                n, t = int(tokens[0]), int(tokens[1])
                nums = [int(x) for x in tokens[2:n+2]]
                res = target_fn(nums, t)
            elif '${id}' in ['E2', 'M2', 'E33', 'E51', 'E52', 'E258', 'E326']:
                res = target_fn(int(tokens[0]))
            elif '${id}' in ['E3', 'E20', 'E46', 'E62', 'E68', 'E69']:
                res = target_fn(tokens[0])
            elif '${id}' in ['E5', 'E8', 'E21', 'E26', 'E30', 'E38', 'E39', 'E50', 'M6', 'M7']:
                n = int(tokens[0])
                nums = [int(x) for x in tokens[1:n+1]]
                res = target_fn(nums)
                if '${id}' == 'E5':
                    print(res)
                    print(" ".join(str(x) for x in nums[:res]))
                    sys.exit(0)
            elif '${id}' == 'E6':
                n, val = int(tokens[0]), int(tokens[1])
                nums = [int(x) for x in tokens[2:n+2]]
                res = target_fn(nums, val)
                print(res)
                print(" ".join(str(x) for x in nums[:res]))
                sys.exit(0)
            elif '${id}' in ['E7', 'E58', 'M5']:
                n, t = int(tokens[0]), int(tokens[1])
                nums = [int(x) for x in tokens[2:n+2]]
                res = target_fn(nums, t)
            elif '${id}' in ['E9', 'E40', 'E45', 'E47', 'E49']:
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
`;
  }

  if (lang === 'cpp') {
    let driverBody = '';
    if (id === 'E1' || id === 'M15') {
      driverBody = `    int n; long long t;
    if (cin >> n >> t) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        auto res = sol.twoSum(nums, (int)t);
        for (size_t i = 0; i < res.size(); i++) cout << res[i] << (i + 1 < res.size() ? " " : "");
        cout << endl;
    }`;
    } else if (id === 'E2') {
      driverBody = `    long long x;
    if (cin >> x) {
        cout << (sol.isPalindrome((int)x) ? "true" : "false") << endl;
    }`;
    } else if (id === 'E3') {
      driverBody = `    string s;
    if (cin >> s) {
        cout << (sol.isValid(s) ? "true" : "false") << endl;
    }`;
    } else if (id === 'E5') {
      driverBody = `    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        int k = sol.removeDuplicates(nums);
        cout << k << endl;
        for (int i = 0; i < k; i++) cout << nums[i] << (i + 1 < k ? " " : "");
        cout << endl;
    }`;
    } else if (id === 'E6') {
      driverBody = `    int n, val;
    if (cin >> n >> val) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        int k = sol.removeElement(nums, val);
        cout << k << endl;
        for (int i = 0; i < k; i++) cout << nums[i] << (i + 1 < k ? " " : "");
        cout << endl;
    }`;
    } else if (id === 'E7') {
      driverBody = `    int n, t;
    if (cin >> n >> t) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        cout << sol.searchInsert(nums, t) << endl;
    }`;
    } else if (id === 'E9') {
      driverBody = `    string a, b;
    if (cin >> a >> b) {
        cout << sol.addBinary(a, b) << endl;
    }`;
    }

    return `#include <iostream>
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

${code}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    Solution sol;
${driverBody}
    return 0;
}
`;
  }

  if (lang === 'java') {
    let javaBody = '';
    if (id === 'E1' || id === 'M15') {
      javaBody = `        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int t = sc.nextInt();
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
            int[] res = sol.twoSum(nums, t);
            for (int i = 0; i < res.length; i++) {
                System.out.print(res[i] + (i + 1 < res.length ? " " : ""));
            }
            System.out.println();
        }`;
    } else if (id === 'E2') {
      javaBody = `        if (sc.hasNextInt()) {
            System.out.println(sol.isPalindrome(sc.nextInt()) ? "true" : "false");
        }`;
    } else if (id === 'E3') {
      javaBody = `        if (sc.hasNext()) {
            System.out.println(sol.isValid(sc.next()) ? "true" : "false");
        }`;
    }

    return `import java.util.*;
import java.io.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Solution sol = new Solution();
${javaBody}
    }
}
`;
  }

  return code;
}
