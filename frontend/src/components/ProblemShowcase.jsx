import React, { useState, useEffect, useMemo } from 'react';
import {
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Search,
  BookOpen,
  Tag,
  ArrowRight,
  Download
} from 'lucide-react';
import fallbackProblemsData from '../data/problems.json';
import { LEETCODE_REGISTRY } from '../data/leetcodeRegistry';
import { getProblemHint } from '../data/hints';
import { fetchProblems } from '../services/api';

const DIFFICULTY_SEQUENCE = ['Easy', 'Medium', 'Hard'];

/**
 * Normalizes and splits raw constraints string into distinct bullet points.
 */
function formatConstraints(conStr) {
  if (!conStr) {
    return [
      'Standard execution time (2000ms) and memory (256MB) limits apply.',
      'Ensure algorithm handles minimum and maximum edge boundaries.'
    ];
  }
  const parts = conStr
    .split(/(?<=[.!?])\s+|;\s*|,\s*(?=[0-9A-Za-z-–<≤])/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [conStr];
}

/**
 * Enriches problem item with LeetCode metadata, examples, constraints, and hints.
 */
function buildShowcaseProblem(p, idx) {
  const meta = LEETCODE_REGISTRY[p.id] || {};
  const regExample = meta.examples && meta.examples.length > 0 ? meta.examples[0] : null;

  let exampleInput = regExample?.input;
  if (!exampleInput) {
    exampleInput = p.si ? p.si.replace(/\r?\n/g, '  |  ') : 'nums = [2, 7, 11, 15], target = 9';
  }

  let exampleOutput = regExample?.output;
  if (!exampleOutput) {
    exampleOutput = p.so ? p.so.replace(/\r?\n/g, ' ') : (p.eo || '[0, 1]');
  }

  let exampleExplanation = regExample?.explanation;
  if (!exampleExplanation) {
    exampleExplanation = `Given the input (${exampleInput}), the algorithm evaluates and returns ${exampleOutput}.`;
  }

  const inputFormat = meta.args && meta.args.length > 0
    ? meta.args.map((a) => `${a.name}: ${a.cpp || a.py || 'data'}`).join(', ')
    : (p.si ? 'Standard Input (stdin)' : 'Standard parameter inputs');

  const outputFormat = meta.ret?.cpp || meta.ret?.py
    ? `Returns ${meta.ret.cpp || meta.ret.py} (or prints to stdout)`
    : (p.so ? 'Standard Output (stdout)' : 'Calculated result value');

  const strategyHint = getProblemHint(p);

  return {
    num: idx + 1,
    id: p.id,
    origId: p.origId || meta.origId || '',
    title: p.title,
    pts: p.pts || (p.diff === 'Hard' ? 800 : (p.diff === 'Medium' ? 650 : 400)),
    cat: p.cat || 'Algorithms / Data Structures',
    diff: p.diff || 'Easy',
    desc: p.desc,
    inputFormat,
    outputFormat,
    hint: strategyHint,
    example: {
      input: exampleInput,
      output: exampleOutput,
      explanation: exampleExplanation
    },
    constraints: formatConstraints(p.con)
  };
}

export function ProblemShowcase({ onNavigateHome, onLogout }) {
  // 1. Initialize with all available problems from the comprehensive catalog (zero delay/no blank screen)
  const [catalogProblems, setCatalogProblems] = useState(() => {
    const raw = fallbackProblemsData.problems || [];
    return raw.map((p, idx) => buildShowcaseProblem(p, idx));
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);

  // Dynamically fetch and synchronize every available problem from database / API
  useEffect(() => {
    let isMounted = true;
    async function loadAllProblems() {
      try {
        const data = await fetchProblems();
        if (isMounted && data && Array.isArray(data.problems) && data.problems.length > 0) {
          const mapped = data.problems.map((p, idx) => buildShowcaseProblem(p, idx));
          setCatalogProblems(mapped);
        }
      } catch (err) {
        console.warn('Showcase using local master catalog fallback:', err);
      }
    }
    loadAllProblems();
    return () => {
      isMounted = false;
    };
  }, []);

  const total = catalogProblems.length;
  const problem = catalogProblems[currentIndex] || catalogProblems[0] || {};

  // Repeating difficulty progression throughout problem navigation:
  // Easy -> Medium -> Hard -> Easy -> Medium -> Hard ...
  const currentDifficulty = DIFFICULTY_SEQUENCE[currentIndex % 3];



  // Copy example to clipboard
  const handleCopyExample = () => {
    if (!problem.example) return;
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

  // Filtered list for search and dropdown selection
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return catalogProblems
      .map((p, originalIdx) => ({ ...p, originalIdx }))
      .filter((p) => {
        const matchesQuery =
          !q ||
          p.id.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.cat.toLowerCase().includes(q) ||
          (p.origId && p.origId.toLowerCase().includes(q));

        const matchesDiff =
          selectedDifficultyFilter === 'ALL' ||
          DIFFICULTY_SEQUENCE[p.originalIdx % 3].toUpperCase() === selectedDifficultyFilter.toUpperCase() ||
          p.diff.toUpperCase() === selectedDifficultyFilter.toUpperCase();

        return matchesQuery && matchesDiff;
      });
  }, [catalogProblems, searchQuery, selectedDifficultyFilter]);

  const currentFilteredPos = searchResults.findIndex((p) => p.originalIdx === currentIndex);
  const canGoPrev = currentFilteredPos > 0;
  const canGoNext = currentFilteredPos >= 0 && currentFilteredPos < searchResults.length - 1;

  // Jump to first matching result if search/filter leaves current problem outside results
  useEffect(() => {
    if (searchResults.length > 0 && !searchResults.some((p) => p.originalIdx === currentIndex)) {
      setCurrentIndex(searchResults[0].originalIdx);
    }
  }, [searchResults, currentIndex]);

  // Keyboard navigation support: Left / Right arrows
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in the search input or dropdown
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        if (canGoPrev) {
          setCurrentIndex(searchResults[currentFilteredPos - 1].originalIdx);
        } else {
          setCurrentIndex((prev) => Math.max(0, prev - 1));
        }
      } else if (e.key === 'ArrowRight') {
        if (canGoNext) {
          setCurrentIndex(searchResults[currentFilteredPos + 1].originalIdx);
        } else {
          setCurrentIndex((prev) => Math.min(total - 1, prev + 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total, canGoPrev, canGoNext, currentFilteredPos, searchResults]);

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
        padding: '24px 16px',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Header Navigation Strip */}
      <div
        style={{
          width: '100%',
          maxWidth: '880px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
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

        {/* Quick Problem Selector Dropdown (Access all 93 problems instantly) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={currentIndex}
            onChange={(e) => setCurrentIndex(Number(e.target.value))}
            aria-label="Select problem"
            style={{
              background: 'rgba(8, 13, 24, 0.9)',
              border: '1px solid rgba(56, 139, 253, 0.35)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 500,
              padding: '7px 12px',
              outline: 'none',
              cursor: 'pointer',
              maxWidth: '280px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}
          >
            {searchResults.length > 0 ? (
              searchResults.map((p) => (
                <option key={p.id} value={p.originalIdx} style={{ background: '#0b1120', color: '#ffffff' }}>
                  {p.num}. {p.id} — {p.title} ({DIFFICULTY_SEQUENCE[p.originalIdx % 3]})
                </option>
              ))
            ) : (
              <option value="" disabled style={{ background: '#0b1120', color: '#8b949e' }}>
                No matching problems
              </option>
            )}
          </select>

          {/* Clearly Visible Logout Button */}
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
                e.currentTarget.style.background =
                  'linear-gradient(135deg, rgba(88, 166, 255, 0.22) 0%, rgba(137, 87, 229, 0.3) 100%)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(137, 87, 229, 0.7)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(137, 87, 229, 0.35)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, rgba(88, 166, 255, 0.12) 0%, rgba(137, 87, 229, 0.18) 100%)';
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

      {/* Quick Search & Filter Controls Strip */}
      <div
        style={{
          width: '100%',
          maxWidth: '880px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            flex: '1 1 240px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '12px',
              color: '#8b949e',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder={`Search all ${total} problems by name, ID (e.g. E15, M3), or topic...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s'
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#58a6ff')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
          />
        </div>

        {/* Difficulty Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setSelectedDifficultyFilter(diff)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                background:
                  selectedDifficultyFilter === diff
                    ? 'rgba(56, 139, 253, 0.25)'
                    : 'rgba(255, 255, 255, 0.03)',
                borderColor:
                  selectedDifficultyFilter === diff
                    ? '#58a6ff'
                    : 'rgba(255, 255, 255, 0.08)',
                color: selectedDifficultyFilter === diff ? '#ffffff' : '#8b949e',
                transition: 'all 0.15s ease'
              }}
            >
              {diff}
            </button>
          ))}

          {/* Download PDF Catalogue Button */}
          <a
            href={`${import.meta.env.BASE_URL}QUBIT_PROBLEMS_CATALOGUE.pdf`}
            download="QUBIT_PROBLEMS_CATALOGUE.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              textDecoration: 'none',
              marginLeft: '4px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.22)';
              e.currentTarget.style.borderColor = '#38bdf8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
            }}
            title="Download Complete 93 Problems PDF Catalogue"
          >
            <Download size={13} />
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      {/* Main Problem Showcase Card (Matching Mockup & Design Requirements) */}
      <div
        style={{
          width: '100%',
          maxWidth: '880px',
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
        {/* Top Problem Counter Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#58a6ff',
              letterSpacing: '0.2px',
              textAlign: 'left'
            }}
          >
            Problem {currentIndex + 1} of {total}
          </div>

          {problem.origId && (
            <div
              style={{
                fontSize: '12px',
                color: '#8b949e',
                fontFamily: 'ui-monospace, monospace'
              }}
            >
              Catalog Ref: {problem.origId}
            </div>
          )}
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
            marginBottom: '18px',
            flexWrap: 'wrap'
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
              background:
                currentDifficulty === 'Easy'
                  ? 'rgba(46, 160, 67, 0.18)'
                  : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${
                currentDifficulty === 'Easy' ? 'rgba(46, 160, 67, 0.55)' : 'rgba(255, 255, 255, 0.08)'
              }`,
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
              background:
                currentDifficulty === 'Medium'
                  ? 'rgba(210, 153, 34, 0.18)'
                  : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${
                currentDifficulty === 'Medium'
                  ? 'rgba(210, 153, 34, 0.55)'
                  : 'rgba(255, 255, 255, 0.08)'
              }`,
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
              background:
                currentDifficulty === 'Hard'
                  ? 'rgba(248, 81, 73, 0.18)'
                  : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${
                currentDifficulty === 'Hard' ? 'rgba(248, 81, 73, 0.55)' : 'rgba(255, 255, 255, 0.08)'
              }`,
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

          {/* Category Pill */}
          {problem.cat && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                background: 'rgba(56, 139, 253, 0.12)',
                border: '1px solid rgba(56, 139, 253, 0.28)',
                color: '#79c0ff'
              }}
            >
              <Tag size={12} />
              <span>{problem.cat}</span>
            </div>
          )}
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
          <span
            style={{
              color: 'var(--txt-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
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

        {/* Input & Output Specifications (More Description Details) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px',
            marginBottom: '26px'
          }}
        >
          {/* Input Format Box */}
          <div
            style={{
              background: 'rgba(8, 13, 24, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '14px 16px'
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#58a6ff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px'
              }}
            >
              Input Specification
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#c9d1d9',
                fontFamily: 'ui-monospace, monospace',
                lineHeight: 1.5
              }}
            >
              {problem.inputFormat}
            </div>
          </div>

          {/* Output Format Box */}
          <div
            style={{
              background: 'rgba(8, 13, 24, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '14px 16px'
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#3fb950',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px'
              }}
            >
              Output Specification
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#c9d1d9',
                fontFamily: 'ui-monospace, monospace',
                lineHeight: 1.5
              }}
            >
              {problem.outputFormat}
            </div>
          </div>
        </div>

        {/* Example Section — Perfectly Aligned Left */}
        {problem.example && (
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
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = copied ? '#3fb950' : '#8b949e')
                }
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
        )}

        {/* Constraints Section — Perfectly Aligned Left */}
        {problem.constraints && problem.constraints.length > 0 && (
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
                  <span
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace',
                      fontSize: '13px'
                    }}
                  >
                    {c}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
            onClick={() => {
              if (canGoPrev) {
                setCurrentIndex(searchResults[currentFilteredPos - 1].originalIdx);
              } else {
                setCurrentIndex((prev) => Math.max(0, prev - 1));
              }
            }}
            disabled={searchResults.length <= 1 ? currentIndex === 0 : !canGoPrev}
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
              color: (searchResults.length <= 1 ? currentIndex === 0 : !canGoPrev) ? 'var(--txt-dim)' : '#ffffff',
              cursor: (searchResults.length <= 1 ? currentIndex === 0 : !canGoPrev) ? 'not-allowed' : 'pointer',
              opacity: (searchResults.length <= 1 ? currentIndex === 0 : !canGoPrev) ? 0.45 : 1,
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => {
              if (canGoPrev || currentIndex > 0) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              if (canGoPrev || currentIndex > 0) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div style={{ fontSize: '13px', color: '#8b949e', fontWeight: 500 }}>
            {searchResults.length < total
              ? `Problem ${currentFilteredPos + 1} of ${searchResults.length} (${total} total)`
              : `Problem ${currentIndex + 1} / ${total}`}
          </div>

          <button
            type="button"
            onClick={() => {
              if (canGoNext) {
                setCurrentIndex(searchResults[currentFilteredPos + 1].originalIdx);
              } else {
                setCurrentIndex((prev) => Math.min(total - 1, prev + 1));
              }
            }}
            disabled={searchResults.length <= 1 ? currentIndex === total - 1 : !canGoNext}
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
              cursor: (searchResults.length <= 1 ? currentIndex === total - 1 : !canGoNext) ? 'not-allowed' : 'pointer',
              opacity: (searchResults.length <= 1 ? currentIndex === total - 1 : !canGoNext) ? 0.45 : 1,
              boxShadow:
                (searchResults.length <= 1 ? currentIndex === total - 1 : !canGoNext) ? 'none' : '0 4px 16px rgba(31, 111, 235, 0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
            onMouseEnter={(e) => {
              if (canGoNext || currentIndex < total - 1) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 111, 235, 0.45)';
              }
            }}
            onMouseLeave={(e) => {
              if (canGoNext || currentIndex < total - 1) {
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
