import React, { useState, useEffect } from 'react';
import { Copy, Check, ChevronLeft, ChevronRight, Home, LogOut } from 'lucide-react';

const DIFFICULTY_SEQUENCE = ['Easy', 'Medium', 'Hard'];

const SHOWCASE_PROBLEMS = [
  {
    num: 1,
    id: "E1",
    title: "Two Sum",
    pts: 200,
    desc: "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.",
    example: {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "nums[0] + nums[1] == 9"
    },
    constraints: [
      "2 <= nums.length <= 10⁴",
      "-10⁹ <= nums[i] <= 10⁹",
      "Each input has exactly one solution."
    ]
  },
  {
    num: 2,
    id: "E2",
    title: "Palindrome Number",
    pts: 200,
    desc: "Given an integer `x`, return true if `x` is a palindrome, and false otherwise.",
    example: {
      input: "x = 121",
      output: "true",
      explanation: "121 reads as 121 from left to right and from right to left."
    },
    constraints: [
      "-2³¹ <= x <= 2³¹ - 1",
      "Could you solve it without converting the integer to a string?"
    ]
  },
  {
    num: 3,
    id: "E3",
    title: "Valid Parentheses",
    pts: 200,
    desc: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    example: {
      input: "s = \"()[]{}\"",
      output: "true",
      explanation: "Open brackets must be closed by the same type of brackets in the correct order."
    },
    constraints: [
      "1 <= s.length <= 10⁴",
      "s consists of parentheses only '()[]{}'."
    ]
  },
  {
    num: 4,
    id: "E4",
    title: "Merge Two Sorted Lists",
    pts: 200,
    desc: "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list and return its head.",
    example: {
      input: "list1 = [1,2,4], list2 = [1,3,4]",
      output: "[1,1,2,3,4,4]",
      explanation: "Merged into a single continuous sorted sequence."
    },
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both list1 and list2 are sorted in non-decreasing order."
    ]
  },
  {
    num: 5,
    id: "E5",
    title: "Remove Duplicates from Sorted Array",
    pts: 200,
    desc: "Given an integer array `nums` sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. Return `k` after placing the final result in the first `k` slots.",
    example: {
      input: "nums = [1,1,2]",
      output: "2, nums = [1,2,_]",
      explanation: "Your function should return k = 2, with the first two elements of nums being 1 and 2."
    },
    constraints: [
      "1 <= nums.length <= 3 * 10⁴",
      "-100 <= nums[i] <= 100",
      "nums is sorted in non-decreasing order."
    ]
  },
  {
    num: 6,
    id: "E6",
    title: "Remove Element",
    pts: 200,
    desc: "Given an integer array `nums` and an integer `val`, remove all occurrences of `val` in `nums` in-place. The relative order of the elements may be changed. Return `k`.",
    example: {
      input: "nums = [3,2,2,3], val = 3",
      output: "2, nums = [2,2,_,_]",
      explanation: "Your function should return k = 2, with the first two elements of nums being 2."
    },
    constraints: [
      "0 <= nums.length <= 100",
      "0 <= nums[i] <= 50",
      "0 <= val <= 100"
    ]
  },
  {
    num: 7,
    id: "E7",
    title: "Search Insert Position",
    pts: 200,
    desc: "Given a sorted array of distinct integers `nums` and a target value `target`, return the index if the target is found. If not, return the index where it would be if it were inserted in order.",
    example: {
      input: "nums = [1,3,5,6], target = 5",
      output: "2",
      explanation: "5 is found at index 2."
    },
    constraints: [
      "1 <= nums.length <= 10⁴",
      "-10⁴ <= nums[i], target <= 10⁴",
      "nums contains distinct values sorted in ascending order."
    ]
  },
  {
    num: 8,
    id: "E8",
    title: "Plus One",
    pts: 200,
    desc: "You are given a large integer represented as an integer array `digits`, where each `digits[i]` is the ith digit of the integer. Increment the large integer by one and return the resulting array of digits.",
    example: {
      input: "digits = [1,2,3]",
      output: "[1,2,4]",
      explanation: "The array represents the integer 123. Incrementing by one gives 124."
    },
    constraints: [
      "1 <= digits.length <= 100",
      "0 <= digits[i] <= 9",
      "digits does not contain any leading 0's."
    ]
  },
  {
    num: 9,
    id: "E9",
    title: "Add Binary",
    pts: 200,
    desc: "Given two binary strings `a` and `b`, return their sum as a binary string.",
    example: {
      input: "a = \"11\", b = \"1\"",
      output: "\"100\"",
      explanation: "Binary 11 (3 in decimal) + 1 (1 in decimal) equals 100 (4 in decimal)."
    },
    constraints: [
      "1 <= a.length, b.length <= 10⁴",
      "a and b consist only of '0' or '1' characters.",
      "Each string does not contain leading zeros except for the zero itself."
    ]
  },
  {
    num: 10,
    id: "E10",
    title: "Remove Duplicates from Sorted List",
    pts: 200,
    desc: "Given the head of a sorted linked list `head`, delete all duplicates such that each element appears only once. Return the linked list sorted as well.",
    example: {
      input: "head = [1,1,2]",
      output: "[1,2]",
      explanation: "Duplicates removed from the sequence."
    },
    constraints: [
      "The number of nodes in the list is in the range [0, 300].",
      "-100 <= Node.val <= 100",
      "The list is guaranteed to be sorted in ascending order."
    ]
  }
];

export function ProblemShowcase({ onNavigateHome, onLogout }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const problem = SHOWCASE_PROBLEMS[currentIndex] || SHOWCASE_PROBLEMS[0];
  const total = SHOWCASE_PROBLEMS.length;

  // Repeating sequence: Easy -> Medium -> Hard -> Easy -> Medium -> Hard ...
  const currentDifficulty = DIFFICULTY_SEQUENCE[currentIndex % 3];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(total - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total]);

  const handleCopyExample = () => {
    const textToCopy = `Input: ${problem.example.input}\nOutput: ${problem.example.output}\nExplanation: ${problem.example.explanation}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Safely formats inline code elements enclosed in backticks without
   * splitting words into isolated letters or breaking natural sentence flow.
   */
  const formatTextWithCodes = (text) => {
    if (!text) return '';
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        const codeText = part.slice(1, -1);
        return (
          <code
            key={idx}
            style={{
              padding: '2px 6px',
              margin: '0 2px',
              borderRadius: '5px',
              background: 'rgba(56, 139, 253, 0.16)',
              border: '1px solid rgba(56, 139, 253, 0.35)',
              color: '#79c0ff',
              fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
              fontSize: '13px',
              display: 'inline',
              verticalAlign: 'baseline',
              whiteSpace: 'nowrap'
            }}
          >
            {codeText}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 15%, rgba(20, 35, 75, 0.4) 0%, #060913 70%)',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '28px 16px',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Header Navigation Strip */}
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <button
          type="button"
          onClick={onNavigateHome}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#c9d1d9',
            fontSize: '13px',
            padding: '7px 14px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 0.15s, color 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#c9d1d9';
          }}
        >
          <Home size={15} />
          <span>Exit to Home</span>
        </button>

        {/* Right Header Controls: Problem Progress Indicators & Clearly Visible Logout Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          {/* Quick Problem Selector Dot Indicators */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            {SHOWCASE_PROBLEMS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setCurrentIndex(idx)}
                title={`Problem ${idx + 1}: ${p.id} — ${p.title} (${DIFFICULTY_SEQUENCE[idx % 3]})`}
                style={{
                  width: idx === currentIndex ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: idx === currentIndex ? '#58a6ff' : 'rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  padding: 0
                }}
              />
            ))}
          </div>

          {/* Clearly Visible Logout Button (top-right corner) */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Logout and lock problem statements"
              style={{
                background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.12) 0%, rgba(137, 87, 229, 0.18) 100%)',
                border: '1px solid rgba(137, 87, 229, 0.38)',
                borderRadius: '8px',
                color: '#d2a8ff',
                fontSize: '13px',
                fontWeight: 600,
                padding: '7px 14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 10px rgba(137, 87, 229, 0.18)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(88, 166, 255, 0.22) 0%, rgba(137, 87, 229, 0.3) 100%)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(137, 87, 229, 0.7)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(137, 87, 229, 0.35)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(88, 166, 255, 0.12) 0%, rgba(137, 87, 229, 0.18) 100%)';
                e.currentTarget.style.color = '#d2a8ff';
                e.currentTarget.style.borderColor = 'rgba(137, 87, 229, 0.38)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(137, 87, 229, 0.18)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <LogOut size={14} color="#d2a8ff" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Problem Showcase Card (Matching Mockup & Screenshot) */}
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          background: 'rgba(13, 19, 33, 0.88)',
          border: '1px solid rgba(56, 139, 253, 0.22)',
          borderRadius: '18px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '36px 36px 28px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(56, 139, 253, 0.08)',
          boxSizing: 'border-box',
          textAlign: 'left'
        }}
      >
        {/* Top Problem Counter */}
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#58a6ff',
            marginBottom: '10px',
            letterSpacing: '0.2px',
            textAlign: 'left'
          }}
        >
          Problem {currentIndex + 1} of {total}
        </div>

        {/* Problem Title */}
        <h1
          style={{
            margin: '0 0 16px',
            fontSize: '32px',
            fontWeight: 800,
            letterSpacing: '0.2px',
            color: '#ffffff',
            textAlign: 'left'
          }}
        >
          {problem.id} — {problem.title}
        </h1>

        {/* Difficulty Tags Row — Repeating: Easy -> Medium -> Hard -> Easy -> Medium -> Hard */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '18px'
          }}
        >
          {/* Easy Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              background: currentDifficulty === 'Easy' ? 'rgba(46, 160, 67, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${currentDifficulty === 'Easy' ? 'rgba(46, 160, 67, 0.55)' : 'rgba(255, 255, 255, 0.08)'}`,
              color: currentDifficulty === 'Easy' ? '#3fb950' : 'var(--txt-dim)',
              boxShadow: currentDifficulty === 'Easy' ? '0 0 12px rgba(46, 160, 67, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: currentDifficulty === 'Easy' ? '#3fb950' : 'rgba(255, 255, 255, 0.25)'
              }}
            />
            <span>Easy</span>
          </div>

          {/* Medium Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              background: currentDifficulty === 'Medium' ? 'rgba(210, 153, 34, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${currentDifficulty === 'Medium' ? 'rgba(210, 153, 34, 0.55)' : 'rgba(255, 255, 255, 0.08)'}`,
              color: currentDifficulty === 'Medium' ? '#d29922' : 'var(--txt-dim)',
              boxShadow: currentDifficulty === 'Medium' ? '0 0 12px rgba(210, 153, 34, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: currentDifficulty === 'Medium' ? '#d29922' : 'rgba(255, 255, 255, 0.25)'
              }}
            />
            <span>Medium</span>
          </div>

          {/* Hard Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              background: currentDifficulty === 'Hard' ? 'rgba(248, 81, 73, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${currentDifficulty === 'Hard' ? 'rgba(248, 81, 73, 0.55)' : 'rgba(255, 255, 255, 0.08)'}`,
              color: currentDifficulty === 'Hard' ? '#f85149' : 'var(--txt-dim)',
              boxShadow: currentDifficulty === 'Hard' ? '0 0 12px rgba(248, 81, 73, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: currentDifficulty === 'Hard' ? '#f85149' : 'rgba(255, 255, 255, 0.25)'
              }}
            />
            <span>Hard</span>
          </div>
        </div>

        {/* Win Points Meta Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#e3b341',
            marginBottom: '26px',
            textAlign: 'left'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🏆</span>
            <span>Win: {problem.pts} pts</span>
          </span>
          <span style={{ color: 'var(--txt-dim)' }}>•</span>
          <span style={{ color: 'var(--txt-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>📄</span>
            <span>Problem {currentIndex + 1}</span>
          </span>
        </div>

        {/* Problem Statement Section — Perfectly Aligned Left */}
        <div style={{ marginBottom: '26px', textAlign: 'left' }}>
          <h3
            style={{
              margin: '0 0 10px',
              fontSize: '17px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.2px',
              textAlign: 'left'
            }}
          >
            Problem Statement
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '15px',
              color: '#c9d1d9',
              lineHeight: 1.65,
              textAlign: 'left',
              wordBreak: 'normal',
              overflowWrap: 'break-word',
              whiteSpace: 'normal'
            }}
          >
            {formatTextWithCodes(problem.desc)}
          </p>
        </div>

        {/* Example Section — Perfectly Aligned Left */}
        <div style={{ marginBottom: '26px', textAlign: 'left' }}>
          <h3
            style={{
              margin: '0 0 10px',
              fontSize: '17px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.2px',
              textAlign: 'left'
            }}
          >
            Example
          </h3>

          <div
            style={{
              position: 'relative',
              background: 'rgba(8, 13, 24, 0.85)',
              border: '1px solid rgba(56, 139, 253, 0.25)',
              borderRadius: '12px',
              padding: '18px 20px',
              fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
              fontSize: '13px',
              lineHeight: 1.7,
              textAlign: 'left',
              wordBreak: 'break-word'
            }}
          >
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyExample}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: copied ? '#3fb950' : '#8b949e',
                fontSize: '12px',
                padding: '5px 10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = copied ? '#3fb950' : '#8b949e')}
            >
              {copied ? <Check size={13} color="#3fb950" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <div>
              <span style={{ color: '#58a6ff', fontWeight: 600 }}>Input: </span>
              <span style={{ color: '#c9d1d9' }}>{problem.example.input}</span>
            </div>
            <div>
              <span style={{ color: '#3fb950', fontWeight: 600 }}>Output: </span>
              <span style={{ color: '#c9d1d9' }}>{problem.example.output}</span>
            </div>
            <div>
              <span style={{ color: '#bc8cff', fontWeight: 600 }}>Explanation: </span>
              <span style={{ color: '#c9d1d9' }}>{problem.example.explanation}</span>
            </div>
          </div>
        </div>

        {/* Constraints Section — Perfectly Aligned Left */}
        <div style={{ marginBottom: '32px', textAlign: 'left' }}>
          <h3
            style={{
              margin: '0 0 10px',
              fontSize: '17px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.2px',
              textAlign: 'left'
            }}
          >
            Constraints
          </h3>

          <div
            style={{
              background: 'rgba(8, 13, 24, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '14px',
              color: '#c9d1d9',
              lineHeight: 1.8,
              textAlign: 'left'
            }}
          >
            {problem.constraints.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', textAlign: 'left' }}>
                <span style={{ color: '#8b949e', fontWeight: 600 }}>{i + 1}.</span>
                <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace', fontSize: '13px' }}>
                  {c}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation Buttons (Previous / Next) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: currentIndex === 0 ? 'var(--txt-dim)' : '#ffffff',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === 0 ? 0.45 : 1,
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => {
              if (currentIndex > 0) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              if (currentIndex > 0) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.min(total - 1, prev + 1))}
            disabled={currentIndex === total - 1}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1f6feb 0%, #8957e5 100%)',
              border: '1px solid rgba(88, 166, 255, 0.4)',
              color: '#ffffff',
              cursor: currentIndex === total - 1 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === total - 1 ? 0.45 : 1,
              boxShadow: currentIndex === total - 1 ? 'none' : '0 4px 16px rgba(31, 111, 235, 0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
            onMouseEnter={(e) => {
              if (currentIndex < total - 1) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 111, 235, 0.45)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentIndex < total - 1) {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(31, 111, 235, 0.35)';
              }
            }}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
