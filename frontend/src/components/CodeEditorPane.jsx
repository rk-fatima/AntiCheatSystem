import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Send,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Terminal,
  Lightbulb,
  Zap,
  Lock,
  Code2,
  Check,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useHintPass } from '../services/api';
import { getStarterTemplate, getProblemMetadata, getWorkingSolution } from '../data/leetcodeRegistry';

export function CodeEditorPane({
  problem,
  lang,
  onLangChange,
  code,
  onCodeChange,
  onRunCode,
  onSubmitCode,
  currentMember,
  team,
  onTeamUpdated,
  problemStatus,
  reportViolation,
  internalClipboardRef
}) {
  const meta = getProblemMetadata(problem?.id);

  // LeetCode Bottom Drawer Tabs: 'testcase' | 'result'
  const [activeBottomTab, setActiveBottomTab] = useState('testcase');
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  // Local testcase cases (cloned from registry for user custom editing)
  const defaultCases = meta?.testcases || [
    {
      id: 1,
      title: 'Case 1',
      rawStdin: problem?.si || '',
      expected: problem?.eo || problem?.so || '',
      formattedExpected: problem?.eo || problem?.so || '',
      params: { input: problem?.si || '' }
    }
  ];

  const [testCases, setTestCases] = useState(defaultCases);
  const [outputResult, setOutputResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowPaste, setAllowPaste] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState('');

  const isFrozen = Boolean(team?.frozenUntil && team.frozenUntil > Date.now());
  const isHintCardUnlocked = Boolean(team?.unlockedCards?.includes('HINT') || team?.hintUnlocked);
  const hasHintPass = (team?.hintPassesCount || 0) > 0;

  // Refresh testcases when problem changes
  useEffect(() => {
    const updatedMeta = getProblemMetadata(problem?.id);
    const newCases = updatedMeta?.testcases || [
      {
        id: 1,
        title: 'Case 1',
        rawStdin: problem?.si || '',
        expected: problem?.eo || problem?.so || '',
        formattedExpected: problem?.eo || problem?.so || '',
        params: { input: problem?.si || '' }
      }
    ];
    setTestCases(newCases);
    setSelectedCaseIdx(0);
    setOutputResult(null);
    setActiveBottomTab('testcase');
  }, [problem?.id]);

  const handleUseHintPassDirect = async () => {
    if (!problem?.id || !team?.name) return;
    setHintLoading(true);
    setHintError('');
    try {
      const res = await useHintPass({
        teamName: team.name,
        memberId: currentMember?.memberId,
        problemId: problem.id
      });
      if (onTeamUpdated && res.team) {
        onTeamUpdated(res.team);
      }
    } catch (err) {
      setHintError(err.message || 'Failed to unlock hint.');
    } finally {
      setHintLoading(false);
    }
  };

  const textareaRef = useRef(null);
  const gutterRef = useRef(null);
  const prevCodeLenRef = useRef(code.length);
  const bulkAllowedRef = useRef(false);

  // Sync line number gutter with code textarea
  const lineCount = (code || '').split('\n').length;
  const gutterLines = Array.from({ length: Math.max(1, lineCount) }, (_, i) => i + 1).join('\n');

  const handleScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      onCodeChange(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleInput = (e) => {
    const newCode = e.target.value;
    const delta = newCode.length - prevCodeLenRef.current;

    // Detect bulk insertion without paste permission (>40 chars added in 1 event)
    if (delta > 40 && !bulkAllowedRef.current && !allowPaste) {
      reportViolation('BULK_TEXT_INSERTION', `Blocked abnormal bulk text insertion of ${delta} characters.`);
      e.target.value = code; // Revert
      return;
    }

    prevCodeLenRef.current = newCode.length;
    onCodeChange(newCode);
  };

  // Anti-Cheat: Intercept copy / paste to detect unauthorized external copy-paste
  const handleCopy = (e) => {
    e.preventDefault();
    const target = textareaRef.current;
    if (target) {
      const selectedText = target.value.substring(target.selectionStart, target.selectionEnd);
      internalClipboardRef.current = selectedText;
    }
  };

  const handleCut = (e) => {
    e.preventDefault();
    const target = textareaRef.current;
    if (target) {
      const start = target.selectionStart;
      const end = target.selectionEnd;
      internalClipboardRef.current = target.value.substring(start, end);
      const newCode = target.value.substring(0, start) + target.value.substring(end);
      bulkAllowedRef.current = true;
      onCodeChange(newCode);
      bulkAllowedRef.current = false;
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardText = e.clipboardData ? e.clipboardData.getData('text') : '';

    if (allowPaste) {
      if (clipboardText) {
        const target = textareaRef.current;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const newCode = target.value.substring(0, start) + clipboardText + target.value.substring(end);
        bulkAllowedRef.current = true;
        onCodeChange(newCode);
        bulkAllowedRef.current = false;
      }
      return;
    }

    if (clipboardText && clipboardText !== internalClipboardRef.current) {
      reportViolation(
        'EXTERNAL_PASTE_ATTEMPT',
        `Blocked attempt to paste external code (${clipboardText.length} characters).`
      );
    } else if (internalClipboardRef.current) {
      const target = textareaRef.current;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = target.value.substring(0, start) + internalClipboardRef.current + target.value.substring(end);
      bulkAllowedRef.current = true;
      onCodeChange(newCode);
      bulkAllowedRef.current = false;
    }
  };

  const handleLoadSolution = () => {
    const sol = getWorkingSolution(problem?.id, lang);
    if (sol) {
      bulkAllowedRef.current = true;
      onCodeChange(sol);
      bulkAllowedRef.current = false;
      setOutputResult(null);
    } else {
      alert(`No preloaded solution for ${problem?.id} in ${lang}`);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset code to starter LeetCode template?')) {
      onCodeChange(getStarterTemplate(problem, lang));
      setOutputResult(null);
    }
  };

  // Run Code against the currently active testcase
  const handleRun = async () => {
    setIsRunning(true);
    setActiveBottomTab('result');
    setOutputResult({ status: 'QUEUED', message: 'Executing function against testcase...' });

    const currentCase = testCases[selectedCaseIdx] || testCases[0];
    const stdinToPass = currentCase.rawStdin || problem?.si || '';

    try {
      const res = await onRunCode({
        lang,
        code,
        stdin: stdinToPass,
        memberId: currentMember?.memberId,
        problemId: problem?.id
      });
      const resultData = res?.result || res?.data || {};

      const rawStdout = resultData.stdout !== undefined ? resultData.stdout : (resultData.output || '');
      const stderr = resultData.stderr || '';

      const norm = (s) => (s || '').trim().replace(/\r\n/g, '\n');
      const expected = currentCase.formattedExpected || norm(problem?.eo || problem?.so);

      // Clean check comparing bracketless/commaless tokens
      const cleanA = norm(rawStdout).replace(/[\[\],]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      const cleanB = norm(expected).replace(/[\[\],]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      const isCorrect = Boolean(cleanB && cleanA === cleanB && cleanA.length > 0);

      // Format output for display in LeetCode style (e.g. bracketed if expected is bracketed)
      let displayOutput = norm(rawStdout);
      if (expected.startsWith('[') && !displayOutput.startsWith('[') && displayOutput.includes(' ')) {
        displayOutput = `[${displayOutput.replace(/\s+/g, ', ')}]`;
      }

      setOutputResult({
        status: res?.status || 'COMPLETED',
        type: 'run',
        selectedCaseIdx,
        data: {
          ...resultData,
          stdout: displayOutput,
          rawStdout,
          stderr,
          expected,
          isCorrect
        },
        error: res?.error
      });
    } catch (err) {
      setOutputResult({
        status: 'FAILED',
        error: err.message || 'Execution failed'
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution for full evaluation against all hidden testcases
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setActiveBottomTab('result');
    setOutputResult({ status: 'QUEUED', message: 'Submitting solution to judge for full evaluation...' });

    try {
      const res = await onSubmitCode({
        problemId: problem.id,
        lang,
        code,
        memberId: currentMember?.memberId
      });
      const resultData = res?.result || res?.data || {};

      const norm = (s) => (s || '').trim().replace(/\r\n/g, '\n');
      const rawStdout = resultData.stdout !== undefined ? resultData.stdout : (resultData.output || '');
      const expected = meta?.examples?.[0]?.output || norm(problem?.eo || problem?.so);
      const passed = Boolean(resultData.passed);

      let displayOutput = norm(rawStdout);
      if (expected.startsWith('[') && !displayOutput.startsWith('[') && displayOutput.includes(' ')) {
        displayOutput = `[${displayOutput.replace(/\s+/g, ', ')}]`;
      }

      setOutputResult({
        status: res?.status || 'COMPLETED',
        type: 'submit',
        selectedCaseIdx,
        data: {
          ...resultData,
          stdout: displayOutput,
          expected,
          isCorrect: passed
        },
        error: res?.error
      });
    } catch (err) {
      setOutputResult({
        status: 'FAILED',
        error: err.message || 'Submission failed'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCase = testCases[selectedCaseIdx] || testCases[0];

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
      {/* ============================================================ */}
      {/* LEFT PANE: LEETCODE-STYLE PROBLEM STATEMENT                  */}
      {/* ============================================================ */}
      <div style={{
        width: '440px',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        overflowY: 'auto',
        padding: '24px 26px',
        background: '#0a0e1a',
        flexShrink: 0
      }}>
        {/* Title & Difficulty Row */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--txt-muted)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              {problem.cat || 'Algorithms'}
            </span>
            <span className={`badge ${problem.diff}`}>
              {problem.diff} · {problem.diff === 'Hard' ? 400 : (problem.diff === 'Medium' ? 300 : 200)} pts
            </span>

            {/* Wrong submissions counter & penalty */}
            {(team?.problemWrong?.[problem.id] || problemStatus?.wrongSubmissions || 0) > 0 && (
              <span style={{
                background: 'rgba(248, 81, 73, 0.1)',
                border: '1px solid rgba(248, 81, 73, 0.25)',
                color: '#ff7b72',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600
              }}>
                {(team?.problemWrong?.[problem.id] || problemStatus?.wrongSubmissions)} WA (−{(team?.problemWrong?.[problem.id] || problemStatus?.wrongSubmissions) * 10} pts)
              </span>
            )}
          </div>

          <h1 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.2px' }}>
            {problem.id}. {problem.title}
          </h1>
        </div>

        {/* 💡 Algorithmic Hint Banner */}
        {team?.revealedHints?.[problem.id] ? (
          <div
            className="card-unlocked-reveal"
            style={{
              background: 'linear-gradient(180deg, rgba(30, 80, 180, 0.12) 0%, rgba(13, 17, 28, 0.8) 100%)',
              border: '1px solid rgba(56, 139, 253, 0.3)',
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '18px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#58a6ff', fontWeight: 700, fontSize: '12px' }}>
                <Lightbulb size={15} /> Algorithmic Hint
              </div>
              <span style={{ fontSize: '11px', color: 'var(--txt-dim)' }}>
                Unlocked by {team.revealedHints[problem.id].revealedByName || team.revealedHints[problem.id].revealedBy}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#f0f6fc', lineHeight: 1.55 }}>
              {team.revealedHints[problem.id].hint}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(56, 139, 253, 0.04)',
            border: '1px dashed rgba(56, 139, 253, 0.25)',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '18px'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#58a6ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> Locked Algorithmic Hint
              </div>
              <div style={{ fontSize: '11px', color: 'var(--txt-dim)', marginTop: '2px' }}>
                {isHintCardUnlocked && hasHintPass
                  ? `Your team has ${team.hintPassesCount} Hint Pass available.`
                  : 'Hint is locked by Administrator. Admin unlock or unlocked Hint Pass required.'}
              </div>
            </div>
            {isHintCardUnlocked && hasHintPass ? (
              <button
                type="button"
                className="btn-blue"
                onClick={handleUseHintPassDirect}
                disabled={hintLoading}
                style={{
                  fontSize: '11px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontWeight: 600
                }}
              >
                {hintLoading ? 'Revealing...' : `💡 Use Hint Pass (${team.hintPassesCount})`}
              </button>
            ) : (
              <span style={{
                fontSize: '11px',
                color: 'var(--txt-dim)',
                padding: '5px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Lock size={12} /> Locked (Admin Control)
              </span>
            )}
          </div>
        )}

        {hintError && (
          <div style={{ padding: '8px 12px', background: 'rgba(248, 81, 73, 0.1)', border: '1px solid rgba(248, 81, 73, 0.3)', borderRadius: '6px', color: '#ff7b72', fontSize: '12px', marginBottom: '14px' }}>
            {hintError}
          </div>
        )}

        {/* Solved Status Banner */}
        {problemStatus?.status === 'SOLVED' && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(63, 185, 80, 0.1)',
            border: '1px solid rgba(63, 185, 80, 0.3)',
            borderRadius: '6px',
            color: '#3fb950',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={16} />
            <span>Solved by {problemStatus.solvedByName || problemStatus.solvedBy}</span>
          </div>
        )}

        {/* Problem Description */}
        <div style={{ marginBottom: '22px' }}>
          <p style={{ margin: 0, color: '#e6edf3', lineHeight: 1.65, fontSize: '14px' }}>
            {problem.desc}
          </p>
        </div>

        {/* LeetCode Examples */}
        <div style={{ marginBottom: '22px' }}>
          {(meta?.examples || []).map((ex, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '8px',
              padding: '14px 16px',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                Example {index + 1}:
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: '#c9d1d9', lineHeight: 1.6 }}>
                <div><strong style={{ color: 'var(--txt-muted)' }}>Input:</strong> {ex.input}</div>
                <div><strong style={{ color: 'var(--txt-muted)' }}>Output:</strong> <span style={{ color: '#58a6ff' }}>{ex.output}</span></div>
                {ex.explanation && (
                  <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--txt-dim)' }}>
                    <strong style={{ color: 'var(--txt-muted)' }}>Explanation:</strong> {ex.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}>
            Constraints:
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '18px',
            color: '#8b949e',
            fontSize: '12.5px',
            lineHeight: 1.7,
            fontFamily: 'var(--font-mono)'
          }}>
            {(problem.con || 'Standard limits').split(',').map((conItem, idx) => (
              <li key={idx}>
                <code>{conItem.trim()}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANE: LEETCODE CODE EDITOR & TESTCASES PANEL           */}
      {/* ============================================================ */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        background: '#080c16',
        padding: '14px 18px',
        gap: '12px'
      }}>
        {/* Editor Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={lang}
            onChange={(e) => onLangChange(e.target.value)}
            style={{
              width: 'auto',
              minWidth: '120px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#ffffff'
            }}
          >
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python 3</option>
            <option value="c">C</option>
          </select>

          <button className="btn-ghost" onClick={handleReset} title="Reset starter LeetCode code" style={{ fontSize: '12px' }}>
            <RotateCcw size={13} /> Reset
          </button>

          <button
            className="btn-ghost"
            onClick={handleLoadSolution}
            title="Auto-fill passing LeetCode solution for testing"
            style={{
              fontSize: '12px',
              color: '#58a6ff',
              borderColor: 'rgba(56, 139, 253, 0.3)'
            }}
          >
            ⚡ Load Solution
          </button>

          <button
            className="btn-ghost"
            onClick={() => setAllowPaste(!allowPaste)}
            title={allowPaste ? "Paste is allowed" : "Paste is strict (Exam Mode)"}
            style={{
              fontSize: '11px',
              color: allowPaste ? '#d29922' : 'var(--txt-dim)'
            }}
          >
            {allowPaste ? '🔓 Paste: Dev' : '🔒 Paste: Strict'}
          </button>

          <div style={{ flex: 1 }} />

          {/* Action Buttons: Run Code and Submit Solution */}
          <button
            className="btn-ghost"
            onClick={handleRun}
            disabled={isRunning || isSubmitting || isFrozen}
            title={isFrozen ? "Screen is frozen" : "Run solution against test cases"}
            style={{
              padding: '7px 18px',
              fontSize: '13px',
              borderRadius: '6px',
              borderColor: 'rgba(255, 255, 255, 0.16)',
              fontWeight: 600
            }}
          >
            {isRunning ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
            {isRunning ? 'Running...' : 'Run Code'}
          </button>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting || isFrozen}
            title={isFrozen ? "Screen is frozen" : "Submit solution to judge for full scoring"}
            style={{
              padding: '7px 20px',
              fontSize: '13px',
              borderRadius: '6px',
              fontWeight: 700
            }}
          >
            {isSubmitting ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
            {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
          </button>
        </div>

        {/* Code Editor with Line Number Gutter */}
        <div style={{
          flex: 1,
          minHeight: '260px',
          display: 'flex',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          background: '#0d111c',
          overflow: 'hidden'
        }}>
          <pre
            ref={gutterRef}
            style={{
              width: '46px',
              textAlign: 'right',
              padding: '12px 10px 12px 0',
              margin: 0,
              color: '#484f58',
              background: 'rgba(0, 0, 0, 0.25)',
              userSelect: 'none',
              overflow: 'hidden',
              font: '13px/20px var(--font-mono)',
              borderRight: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            {gutterLines}
          </pre>

          <textarea
            ref={textareaRef}
            value={code}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            onCopy={handleCopy}
            onCut={handleCut}
            onPaste={handlePaste}
            spellCheck="false"
            wrap="off"
            style={{
              flex: 1,
              border: 0,
              borderRadius: 0,
              background: 'transparent',
              color: '#f0f6fc',
              font: '13px/20px var(--font-mono)',
              padding: '12px 14px',
              resize: 'none',
              outline: 'none',
              tabSize: 4
            }}
          />
        </div>

        {/* ============================================================ */}
        {/* LEETCODE BOTTOM DRAWER: TESTCASE & TEST RESULT TABS          */}
        {/* ============================================================ */}
        <div style={{
          background: '#070a12',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '12px 16px',
          minHeight: '170px',
          maxHeight: '270px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Drawer Navigation Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '8px',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveBottomTab('testcase')}
                style={{
                  background: activeBottomTab === 'testcase' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: 'none',
                  color: activeBottomTab === 'testcase' ? '#ffffff' : 'var(--txt-muted)',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Code2 size={14} /> Testcase
              </button>

              <button
                type="button"
                onClick={() => setActiveBottomTab('result')}
                style={{
                  background: activeBottomTab === 'result' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: 'none',
                  color: activeBottomTab === 'result' ? '#ffffff' : 'var(--txt-muted)',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Terminal size={14} /> Test Result
                {outputResult && outputResult.status === 'COMPLETED' && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: outputResult.data?.isCorrect ? '#3fb950' : '#ff7b72'
                  }} />
                )}
              </button>
            </div>

            {/* Quick Status Preview in tab header */}
            {activeBottomTab === 'result' && outputResult && outputResult.status === 'COMPLETED' && (
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: outputResult.data?.compileError
                  ? '#ff7b72'
                  : outputResult.data?.isCorrect
                  ? '#3fb950'
                  : '#ff7b72'
              }}>
                {outputResult.data?.compileError
                  ? 'Compile Error'
                  : outputResult.data?.isCorrect
                  ? 'Accepted'
                  : 'Wrong Answer'}
              </span>
            )}
          </div>

          {/* TAB 1: TESTCASE PANEL */}
          {activeBottomTab === 'testcase' && (
            <div style={{ flex: 1 }}>
              {/* Case Selectors Pills (Case 1, Case 2, Case 3) */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {testCases.map((tc, idx) => (
                  <button
                    key={tc.id || idx}
                    type="button"
                    onClick={() => setSelectedCaseIdx(idx)}
                    style={{
                      background: selectedCaseIdx === idx ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${selectedCaseIdx === idx ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.07)'}`,
                      borderRadius: '6px',
                      padding: '4px 12px',
                      color: selectedCaseIdx === idx ? '#ffffff' : 'var(--txt-muted)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {tc.title || `Case ${idx + 1}`}
                  </button>
                ))}
              </div>

              {/* Formatted Parameter Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(activeCase.params || {}).map(([paramName, paramVal]) => (
                  <div key={paramName}>
                    <div style={{ fontSize: '11px', color: 'var(--txt-muted)', fontWeight: 600, marginBottom: '4px' }}>
                      {paramName} =
                    </div>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: '#f0f6fc'
                    }}>
                      {paramVal}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TEST RESULT PANEL */}
          {activeBottomTab === 'result' && (
            <div style={{ flex: 1 }}>
              {!outputResult && (
                <div style={{ color: 'var(--txt-dim)', fontSize: '13px', padding: '16px 0' }}>
                  Run your code or submit your solution to view testcase results here…
                </div>
              )}

              {outputResult && outputResult.status === 'QUEUED' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#d29922', fontSize: '13px', padding: '16px 0' }}>
                  <Loader2 size={16} className="spin" />
                  <span>{outputResult.message || 'Running code against judge...'}</span>
                </div>
              )}

              {outputResult && outputResult.data && outputResult.status !== 'QUEUED' && (
                <div>
                  {/* Status Verdict Strip */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    background: outputResult.data.compileError
                      ? 'rgba(248, 81, 73, 0.12)'
                      : outputResult.data.isCorrect === true
                      ? 'rgba(63, 185, 80, 0.12)'
                      : 'rgba(248, 81, 73, 0.12)',
                    color: outputResult.data.compileError
                      ? '#ff7b72'
                      : outputResult.data.isCorrect === true
                      ? '#3fb950'
                      : '#ff7b72',
                    border: `1px solid ${
                      outputResult.data.compileError
                        ? 'rgba(248, 81, 73, 0.3)'
                        : outputResult.data.isCorrect === true
                        ? 'rgba(63, 185, 80, 0.3)'
                        : 'rgba(248, 81, 73, 0.3)'
                    }`
                  }}>
                    {outputResult.data.compileError ? (
                      <>
                        <XCircle size={16} />
                        <span>Compilation Error</span>
                      </>
                    ) : outputResult.data.isCorrect === true ? (
                      <>
                        <CheckCircle size={16} />
                        <span>Accepted {outputResult.type === 'submit' ? '— All Testcases Passed' : ''}</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        <span>Wrong Answer</span>
                      </>
                    )}

                    {outputResult.type === 'submit' && (
                      <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 600 }}>
                        {outputResult.data.passed
                          ? `+${problem.diff === 'Hard' ? 400 : (problem.diff === 'Medium' ? 300 : 200)} pts awarded`
                          : `−10 WA Penalty (Passed ${outputResult.data.hiddenPassed || 0} / ${outputResult.data.totalHidden || 3})`}
                      </span>
                    )}
                  </div>

                  {/* LeetCode Result Output vs Expected */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: outputResult.data.expected ? '1fr 1fr' : '1fr',
                    gap: '12px',
                    marginBottom: '10px'
                  }}>
                    {/* Your Output */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${outputResult.data.isCorrect === false ? 'rgba(248, 81, 73, 0.28)' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '6px',
                      padding: '10px 12px'
                    }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--txt-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        marginBottom: '6px'
                      }}>
                        Output
                      </div>
                      <pre style={{
                        margin: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        color: outputResult.data.isCorrect === false ? '#ff7b72' : '#f0f6fc',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all'
                      }}>
                        {outputResult.data.stdout || '(No return value)'}
                      </pre>
                    </div>

                    {/* Expected Output */}
                    {outputResult.data.expected && (
                      <div style={{
                        background: 'rgba(63, 185, 80, 0.04)',
                        border: '1px solid rgba(63, 185, 80, 0.25)',
                        borderRadius: '6px',
                        padding: '10px 12px'
                      }}>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#3fb950',
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                          marginBottom: '6px'
                        }}>
                          Expected
                        </div>
                        <pre style={{
                          margin: 0,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '13px',
                          color: '#a6e3a1',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all'
                        }}>
                          {outputResult.data.expected}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Stderr Diagnostics if any */}
                  {outputResult.data.stderr && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(248, 81, 73, 0.08)',
                      border: '1px solid rgba(248, 81, 73, 0.25)'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff7b72', marginBottom: '4px' }}>
                        COMPILER / RUNTIME DIAGNOSTICS:
                      </div>
                      <pre style={{ margin: 0, fontSize: '12px', color: '#ff7b72', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
                        {outputResult.data.stderr}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {outputResult && outputResult.error && (
                <div style={{ color: '#ff7b72', fontSize: '13px', marginTop: '6px' }}>
                  ⚠ {outputResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
