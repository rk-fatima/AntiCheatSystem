import React, { useState, useRef, useEffect } from 'react';
import { Play, Send, RotateCcw, Loader2, CheckCircle, AlertTriangle, XCircle, Terminal, Lightbulb, Zap, Snowflake, Lock, Unlock } from 'lucide-react';
import { useHintPass } from '../services/api';
import { UnifiedUnlockModal } from './UnifiedUnlockModal';

const STARTER_TEMPLATES = {
  python: `import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    # TODO: parse input, solve, print output\n    print()\n\nif __name__ == "__main__":\n    main()\n`,
  c: `#include <stdio.h>\n\nint main() {\n    // TODO: read input with scanf, solve, print with printf\n    return 0;\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(null);\n    // TODO: read input with cin, solve, print with cout\n    return 0;\n}\n`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: read input, solve, print output\n    }\n}\n`
};

const WORKING_SOLUTIONS = {
  E1: {
    python: `import sys\n\ndef main():\n    d = sys.stdin.read().split()\n    if not d:\n        return\n    n, t = int(d[0]), int(d[1])\n    nums = [int(x) for x in d[2:n+2]]\n    seen = {}\n    for i, x in enumerate(nums):\n        if (t - x) in seen:\n            print(f"{seen[t - x]} {i}")\n            return\n        seen[x] = i\n\nif __name__ == "__main__":\n    main()\n`,
    cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    int n;\n    long long t;\n    if (cin >> n >> t) {\n        unordered_map<long long, int> seen;\n        for (int i = 0; i < n; i++) {\n            long long x;\n            cin >> x;\n            if (seen.count(t - x)) {\n                cout << seen[t - x] << " " << i << endl;\n                return 0;\n            }\n            seen[x] = i;\n        }\n    }\n    return 0;\n}\n`,
    java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            long t = sc.nextLong();\n            Map<Long, Integer> seen = new HashMap<>();\n            for (int i = 0; i < n; i++) {\n                long x = sc.nextLong();\n                if (seen.containsKey(t - x)) {\n                    System.out.println(seen.get(t - x) + " " + i);\n                    return;\n                }\n                seen.put(x, i);\n            }\n        }\n    }\n}\n`
  },
  LC1: {
    python: `import sys\n\ndef main():\n    d = sys.stdin.read().split()\n    if not d:\n        return\n    n, t = int(d[0]), int(d[1])\n    nums = [int(x) for x in d[2:n+2]]\n    seen = {}\n    for i, x in enumerate(nums):\n        if (t - x) in seen:\n            print(f"{seen[t - x]} {i}")\n            return\n        seen[x] = i\n\nif __name__ == "__main__":\n    main()\n`,
    cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    int n;\n    long long t;\n    if (cin >> n >> t) {\n        unordered_map<long long, int> seen;\n        for (int i = 0; i < n; i++) {\n            long long x;\n            cin >> x;\n            if (seen.count(t - x)) {\n                cout << seen[t - x] << " " << i << endl;\n                return 0;\n            }\n            seen[x] = i;\n        }\n    }\n    return 0;\n}\n`,
    java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            long t = sc.nextLong();\n            Map<Long, Integer> seen = new HashMap<>();\n            for (int i = 0; i < n; i++) {\n                long x = sc.nextLong();\n                if (seen.containsKey(t - x)) {\n                    System.out.println(seen.get(t - x) + " " + i);\n                    return;\n                }\n                seen.put(x, i);\n            }\n        }\n    }\n}\n`
  }
};

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
  const [stdin, setStdin] = useState(problem?.si || '');
  const [outputResult, setOutputResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowPaste, setAllowPaste] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState('');
  const [showHintUnlockModal, setShowHintUnlockModal] = useState(false);

  const isFrozen = Boolean(team?.frozenUntil && team.frozenUntil > Date.now());

  const handleHintUnlockSuccess = async () => {
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
      setShowHintUnlockModal(false);
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

  // Sync custom input with problem sample input when problem changes
  useEffect(() => {
    if (problem?.si) {
      setStdin(problem.si);
    }
    setOutputResult(null);
  }, [problem?.id]);

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

    // If paste is allowed (Dev / Testing mode)
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

    // If clipboard differs from internal copy buffer, flag it as external insertion!
    if (clipboardText && clipboardText !== internalClipboardRef.current) {
      reportViolation(
        'EXTERNAL_PASTE_ATTEMPT',
        `Blocked attempt to paste external code (${clipboardText.length} characters).`
      );
    } else if (internalClipboardRef.current) {
      // Paste allowed internal text
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
    const sol = WORKING_SOLUTIONS[problem?.id]?.[lang];
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
    if (window.confirm('Reset code to starter template?')) {
      onCodeChange(STARTER_TEMPLATES[lang] || '');
      setOutputResult(null);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutputResult({ status: 'QUEUED', message: 'Job enqueued on runner worker pool...' });
    try {
      const res = await onRunCode({ lang, code, stdin, memberId: currentMember?.memberId });
      setOutputResult({
        status: res.status,
        type: 'run',
        data: res.result,
        error: res.error
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setOutputResult({ status: 'QUEUED', message: 'Submission queued for server-side evaluation...' });
    try {
      const res = await onSubmitCode({ problemId: problem.id, lang, code, memberId: currentMember?.memberId });
      setOutputResult({
        status: res.status,
        type: 'submit',
        data: res.result,
        error: res.error
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

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
      {/* Left Pane: Problem Statement */}
      <div style={{
        width: '420px',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        overflowY: 'auto',
        padding: '24px',
        background: 'rgba(8, 12, 22, 0.6)',
        flexShrink: 0
      }}>
        {/* Title & Difficulty Row */}
        <div style={{ marginBottom: '16px' }}>
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

          <h1 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 700, letterSpacing: '0.2px' }}>
            {problem.id} — {problem.title}
          </h1>
        </div>

        {/* 💡 Blue Hint Card / Unlock Hint Button */}
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
                Password verification required to reveal official algorithmic strategy
              </div>
            </div>
            <button
              type="button"
              className="btn-blue"
              onClick={() => setShowHintUnlockModal(true)}
              style={{
                fontSize: '11px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 600
              }}
            >
              <Lock size={12} /> Enter Password
            </button>
          </div>
        )}

        {hintError && (
          <div style={{ padding: '8px 12px', background: 'rgba(248, 81, 73, 0.1)', border: '1px solid rgba(248, 81, 73, 0.3)', borderRadius: '6px', color: '#ff7b72', fontSize: '12px', marginBottom: '14px' }}>
            {hintError}
          </div>
        )}

        {/* Shared Team Workspace Status Banner */}
        {problemStatus?.status === 'SOLVED' && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(63, 185, 80, 0.1)',
            border: '1px solid rgba(63, 185, 80, 0.3)',
            borderRadius: '6px',
            color: '#3fb950',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={16} />
            <span>Solved by {problemStatus.solvedByName || problemStatus.solvedBy}</span>
          </div>
        )}

        {problemStatus?.status === 'IN_PROGRESS' && problemStatus.workingBy !== currentMember?.memberId && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(210, 153, 34, 0.1)',
            border: '1px solid rgba(210, 153, 34, 0.3)',
            borderRadius: '6px',
            color: '#d29922',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} />
            <span>Teammate {problemStatus.workingBy} is currently editing this problem</span>
          </div>
        )}

        {/* Problem Specification Content */}
        <div style={specSectionStyle}>
          <div style={labelStyle}>Description</div>
          <p style={{ margin: '6px 0', whiteSpace: 'pre-line', color: '#c9d1d9', lineHeight: 1.6, fontSize: '13px' }}>
            {problem.desc}
          </p>
        </div>

        <div style={specSectionStyle}>
          <div style={labelStyle}>Constraints</div>
          <pre style={codeBlockStyle}>{problem.con || 'Standard limits'}</pre>
        </div>

        <div style={specSectionStyle}>
          <div style={labelStyle}>Sample Input</div>
          <pre style={codeBlockStyle}>{problem.si || '(None)'}</pre>
        </div>

        <div style={specSectionStyle}>
          <div style={labelStyle}>Sample Output</div>
          <pre style={codeBlockStyle}>{problem.so || '(None)'}</pre>
        </div>
      </div>

      {/* Right Pane: Code Editor + Runner & Terminal (Largest Visual Area) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        background: '#090d16',
        padding: '16px 20px',
        gap: '12px'
      }}>
        {/* Editor Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={lang}
            onChange={(e) => onLangChange(e.target.value)}
            style={{
              width: 'auto',
              minWidth: '130px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '13px'
            }}
          >
            <option value="python">Python 3</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>

          <button className="btn-ghost" onClick={handleReset} title="Reset starter code" style={{ fontSize: '12px' }}>
            <RotateCcw size={13} /> Reset
          </button>

          <button
            className="btn-ghost"
            onClick={handleLoadSolution}
            title="Auto-fill passing solution for testing"
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

          {/* Action Buttons */}
          <button
            className="btn-ghost"
            onClick={handleRun}
            disabled={isRunning || isSubmitting || isFrozen}
            title={isFrozen ? "Screen is frozen" : "Run code against sample test"}
            style={{
              padding: '7px 16px',
              fontSize: '13px',
              borderRadius: '6px',
              borderColor: 'rgba(255, 255, 255, 0.15)'
            }}
          >
            {isRunning ? <Loader2 size={14} className="spin" /> : isFrozen ? <Zap size={14} color="#ff7b72" /> : <Play size={14} />}
            {isFrozen ? 'Frozen' : 'Run Code'}
          </button>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting || isFrozen}
            title={isFrozen ? "Screen is frozen" : "Submit solution for scoring"}
            style={{
              padding: '7px 18px',
              fontSize: '13px',
              borderRadius: '6px'
            }}
          >
            {isSubmitting ? <Loader2 size={14} className="spin" /> : isFrozen ? <Zap size={14} /> : <Send size={14} />}
            {isFrozen ? 'Frozen' : 'Submit Solution'}
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

        {/* Custom Input */}
        <div>
          <div style={labelStyle}>Custom Input (stdin)</div>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            spellCheck="false"
            rows={2}
            style={{
              width: '100%',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              resize: 'vertical',
              padding: '8px 12px'
            }}
          />
        </div>

        {/* Terminal Execution Output Drawer */}
        <div style={{
          background: '#070a12',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '12px 16px',
          minHeight: '120px',
          maxHeight: '180px',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
            color: 'var(--txt-muted)',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}>
            <Terminal size={13} /> Execution Output
          </div>

          {!outputResult && (
            <div style={{ color: 'var(--txt-dim)', fontSize: '13px' }}>
              Run or submit your code to view console output and test verdicts…
            </div>
          )}

          {outputResult && outputResult.status === 'QUEUED' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d29922', fontSize: '13px' }}>
              <Loader2 size={15} className="spin" />
              <span>{outputResult.message}</span>
            </div>
          )}

          {outputResult && outputResult.type === 'run' && outputResult.data && (
            <div>
              {outputResult.data.compileError && (
                <div style={{ color: '#ff7b72', fontWeight: 600, marginBottom: '6px' }}>
                  ❌ Compilation Error
                </div>
              )}
              {outputResult.data.stderr && (
                <pre style={{ color: '#ff7b72', margin: '4px 0', fontSize: '12px' }}>
                  {outputResult.data.stderr}
                </pre>
              )}
              <pre style={{ margin: 0, fontSize: '13px', color: '#f0f6fc', fontFamily: 'var(--font-mono)' }}>
                {outputResult.data.stdout || '(Program exited with no output)'}
              </pre>
            </div>
          )}

          {outputResult && outputResult.type === 'submit' && outputResult.data && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '6px',
                marginBottom: '8px',
                fontWeight: 600,
                background: outputResult.data.passed ? 'rgba(63, 185, 80, 0.12)' : 'rgba(248, 81, 73, 0.12)',
                color: outputResult.data.passed ? '#3fb950' : '#ff7b72',
                border: `1px solid ${outputResult.data.passed ? 'rgba(63, 185, 80, 0.3)' : 'rgba(248, 81, 73, 0.3)'}`
              }}>
                {outputResult.data.passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                <span>Verdict: {outputResult.data.verdict}</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px' }}>
                  {outputResult.data.passed
                    ? `+${problem.diff === 'Hard' ? 400 : (problem.diff === 'Medium' ? 300 : 200)} Difficulty Points Awarded`
                    : `−10 WA Penalty (Passed ${outputResult.data.hiddenPassed} / ${outputResult.data.totalHidden})`}
                </span>
              </div>

              {outputResult.data.details && (
                <div style={{ fontSize: '12px', color: 'var(--txt-muted)', marginBottom: '4px' }}>
                  {outputResult.data.details}
                </div>
              )}

              {outputResult.data.output && (
                <pre style={{ margin: 0, fontSize: '12px', color: 'var(--txt-dim)', fontFamily: 'var(--font-mono)' }}>
                  Output: {outputResult.data.output}
                </pre>
              )}
            </div>
          )}

          {outputResult && outputResult.error && (
            <div style={{ color: '#ff7b72', fontSize: '13px' }}>
              ⚠ {outputResult.error}
            </div>
          )}
        </div>
      </div>

      {/* Unified Password Verification Modal for Problem Hint */}
      <UnifiedUnlockModal
        isOpen={showHintUnlockModal}
        onClose={() => setShowHintUnlockModal(false)}
        target={{
          type: 'PROBLEM_HINT',
          id: problem.id,
          key: problem.key,
          problemId: problem.id,
          title: `Hint: ${problem.title}`,
          subtitle: `Algorithmic strategy for ${problem.id}`
        }}
        team={team}
        currentMember={currentMember}
        teamBalance={team?.balance ?? 1000}
        onUnlockSuccess={handleHintUnlockSuccess}
      />
    </div>
  );
}

const specSectionStyle = {
  marginBottom: '18px'
};

const labelStyle = {
  fontSize: '11px',
  color: 'var(--txt-muted)',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontWeight: 700,
  marginBottom: '4px'
};

const codeBlockStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '6px',
  padding: '8px 12px',
  margin: '4px 0 0',
  font: '12px var(--font-mono)',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  color: '#c9d1d9'
};
