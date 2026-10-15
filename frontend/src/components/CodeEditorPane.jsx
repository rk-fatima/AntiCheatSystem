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
  Code2,
  Check,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { getStarterTemplate, getProblemMetadata } from '../data/leetcodeRegistry';

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
  const defaultBasePts = problem?.pts || (problem?.diff === 'Hard' ? 800 : (problem?.diff === 'Medium' ? 650 : 400));

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

  const isFrozen = Boolean(team?.frozenUntil && team.frozenUntil > Date.now());

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

  const textareaRef = useRef(null);
  const gutterRef = useRef(null);

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
    onCodeChange(e.target.value);
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
        padding: '12px 20px',
        background: '#0a0e1a',
        flexShrink: 0
      }}>
        {/* Title & Difficulty Row */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
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
              {problem.diff} · Base {defaultBasePts} pts
            </span>

            {/* Solved Status & Complexity breakdown badge */}
            {(problemStatus?.status === 'SOLVED' || (team?.solved || []).includes(problem.id)) && (
              <span style={{
                background: 'rgba(63, 185, 80, 0.12)',
                border: '1px solid rgba(63, 185, 80, 0.35)',
                color: '#3fb950',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <CheckCircle2 size={12} />
                <span>Solved: +{problemStatus?.complexityAdjustedScore ?? defaultBasePts} pts</span>
                {problemStatus?.timeComplexity && (
                  <span style={{ color: 'var(--txt-muted)', fontWeight: 500, fontSize: '10px' }}>
                    ({problemStatus.timeComplexity} · {problemStatus.spaceComplexity || 'O(1)'})
                  </span>
                )}
              </span>
            )}

            {/* Wrong submissions counter & 5-point penalty */}
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
                {(team?.problemWrong?.[problem.id] || problemStatus?.wrongSubmissions)} Wrong (−{(team?.problemWrong?.[problem.id] || problemStatus?.wrongSubmissions) * 5} pts)
              </span>
            )}
          </div>

          <h1 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.2px' }}>
            {problem.id}. {problem.title}
          </h1>
        </div>

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
        padding: '8px 16px 10px 16px',
        gap: '8px'
      }}>
        {/* Editor Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={lang}
            onChange={(e) => onLangChange(e.target.value)}
            style={{
              width: 'auto',
              minWidth: '110px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#ffffff'
            }}
          >
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python 3</option>
            <option value="c">C</option>
          </select>

          <button className="btn-ghost" onClick={handleReset} title="Reset starter LeetCode code" style={{ fontSize: '12px', padding: '5px 10px' }}>
            <RotateCcw size={13} /> Reset
          </button>

          <div style={{ flex: 1 }} />

          {/* Action Buttons: Run Code and Submit Solution */}
          <button
            className="btn-ghost"
            onClick={handleRun}
            disabled={isRunning || isSubmitting || isFrozen}
            title={isFrozen ? "Screen is frozen" : "Run solution against test cases"}
            style={{
              padding: '6px 16px',
              fontSize: '12px',
              borderRadius: '6px',
              borderColor: 'rgba(255, 255, 255, 0.16)',
              fontWeight: 600
            }}
          >
            {isRunning ? <Loader2 size={13} className="spin" /> : <Play size={13} />}
            {isRunning ? 'Running...' : 'Run Code'}
          </button>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting || isFrozen}
            title={isFrozen ? "Screen is frozen" : "Submit solution to judge for full scoring"}
            style={{
              padding: '6px 18px',
              fontSize: '12px',
              borderRadius: '6px',
              fontWeight: 700
            }}
          >
            {isSubmitting ? <Loader2 size={13} className="spin" /> : <Send size={13} />}
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
              width: '44px',
              textAlign: 'right',
              padding: '10px 8px 10px 0',
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
            onContextMenu={(e) => e.stopPropagation()}
            spellCheck="false"
            wrap="off"
            style={{
              flex: 1,
              border: 0,
              borderRadius: 0,
              background: 'transparent',
              color: '#f0f6fc',
              font: '13px/20px var(--font-mono)',
              padding: '10px 12px',
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
          padding: '10px 14px',
          minHeight: '160px',
          maxHeight: '260px',
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
            paddingBottom: '6px',
            marginBottom: '10px'
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
                      <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 700 }}>
                        {outputResult.data.passed
                          ? `+${outputResult.data?.scoring?.complexityAdjustedScore ?? defaultBasePts} pts awarded`
                          : `−5 Penalty (${outputResult.data.compileError ? 'Compilation Error' : 'Unsuccessful Attempt'})`}
                      </span>
                    )}
                  </div>

                  {/* Complexity-Aware Score Breakdown Card (for Submissions) */}
                  {outputResult.type === 'submit' && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      marginBottom: '14px',
                      fontSize: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={14} color="#58a6ff" />
                          <span>Evaluation & Complexity Score Breakdown</span>
                        </span>
                        {outputResult.data?.scoring?.reviewStatus && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: outputResult.data.scoring.reviewStatus === 'PENDING_REVIEW' ? 'rgba(210, 153, 34, 0.15)' : 'rgba(56, 139, 253, 0.15)',
                            color: outputResult.data.scoring.reviewStatus === 'PENDING_REVIEW' ? '#d29922' : '#58a6ff',
                            border: `1px solid ${outputResult.data.scoring.reviewStatus === 'PENDING_REVIEW' ? 'rgba(210, 153, 34, 0.3)' : 'rgba(56, 139, 253, 0.3)'}`
                          }}>
                            {outputResult.data.scoring.reviewStatus === 'PENDING_REVIEW' ? 'Pending Review' : 'Verified by Static Analysis'}
                          </span>
                        )}
                      </div>

                      {outputResult.data.passed ? (
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <div style={{ fontSize: '10px', color: 'var(--txt-muted)' }}>Difficulty / Base</div>
                              <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                                {problem.diff} ({outputResult.data?.scoring?.baseScore ?? defaultBasePts} pts)
                              </div>
                            </div>

                            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <div style={{ fontSize: '10px', color: 'var(--txt-muted)' }}>Time Complexity</div>
                              <div style={{ fontWeight: 700, color: '#58a6ff', marginTop: '2px' }}>
                                {outputResult.data?.scoring?.timeComplexity || 'O(n)'} (−{outputResult.data?.scoring?.timeDeduction ?? 10} pts)
                              </div>
                            </div>

                            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <div style={{ fontSize: '10px', color: 'var(--txt-muted)' }}>Space (Auxiliary)</div>
                              <div style={{ fontWeight: 700, color: '#bc8cff', marginTop: '2px' }}>
                                {outputResult.data?.scoring?.spaceComplexity || 'O(1)'} (−{outputResult.data?.scoring?.spaceDeduction ?? 0} pts)
                              </div>
                            </div>

                            <div style={{ background: 'rgba(46, 160, 67, 0.08)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(46, 160, 67, 0.25)' }}>
                              <div style={{ fontSize: '10px', color: '#3fb950', fontWeight: 600 }}>Adjusted Score</div>
                              <div style={{ fontWeight: 800, color: '#3fb950', marginTop: '2px' }}>
                                {outputResult.data?.scoring?.complexityAdjustedScore ?? defaultBasePts} pts
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '11px', color: 'var(--txt-muted)', lineHeight: '1.5' }}>
                            <span style={{ color: 'var(--txt-dim)' }}>Formula: </span>
                            <code>max(0, {outputResult.data?.scoring?.baseScore ?? defaultBasePts} Base − {outputResult.data?.scoring?.timeDeduction ?? 0} Time − {outputResult.data?.scoring?.spaceDeduction ?? 0} Space) = <strong style={{ color: '#3fb950' }}>{outputResult.data?.scoring?.complexityAdjustedScore ?? defaultBasePts} pts</strong></code>.
                            {(outputResult.data?.scoring?.totalTeamWrong || team?.wrong || 0) > 0 && (
                              <span style={{ marginLeft: '6px', color: '#ff7b72' }}>
                                (Team has {outputResult.data?.scoring?.totalTeamWrong || team?.wrong} total wrong submission(s) across event: −{(outputResult.data?.scoring?.totalTeamWrong || team?.wrong) * 5} pts penalty).
                              </span>
                            )}
                          </div>
                          {outputResult.data?.scoring?.reason && (
                            <div style={{ fontSize: '11px', color: 'var(--txt-dim)', marginTop: '4px', fontStyle: 'italic' }}>
                              Analysis note: {outputResult.data.scoring.reason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#ff7b72', lineHeight: '1.5' }}>
                          <div>⚠️ Unsuccessful submission attempt. Deduction: <strong>−5 points penalty</strong> applied to team total score.</div>
                          <div style={{ color: 'var(--txt-dim)', marginTop: '4px' }}>
                            Solution must pass all required testcases to earn complexity-adjusted base score.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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
