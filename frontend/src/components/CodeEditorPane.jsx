import React, { useState, useRef, useEffect } from 'react';
import { Play, Send, RotateCcw, Loader2, CheckCircle, AlertTriangle, XCircle, Terminal, Lightbulb, Zap, Snowflake } from 'lucide-react';
import { useHintPass } from '../services/api';

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

  const isFrozen = Boolean(team?.frozenUntil && team.frozenUntil > Date.now());

  const handleUnlockHintForProblem = async () => {
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
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      {/* Left Pane: Problem Specification */}
      <div style={{
        flex: '0 0 42%',
        borderRight: '1px solid var(--bd)',
        overflowY: 'auto',
        padding: '18px',
        background: 'var(--bg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, color: 'var(--teal)', fontSize: '20px' }}>
            {problem.id} — {problem.title}
          </h2>
          <span className={`badge ${problem.diff}`}>{problem.diff}</span>
          <span style={{ color: 'var(--mut)', fontSize: '13px', marginLeft: 'auto' }}>
            {problem.pts} pts
          </span>
        </div>

        {/* 💡 Blue Hint Card / Unlock Hint Button */}
        {team?.revealedHints?.[problem.id] ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.12) 0%, rgba(10, 25, 47, 0.9) 100%)',
            border: '1px solid #00b4d8',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '14px',
            boxShadow: '0 0 15px rgba(0, 180, 216, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00b4d8', fontWeight: 800, fontSize: '12px' }}>
                <Lightbulb size={16} /> 💡 TEAM ALGORITHMIC HINT
              </div>
              <span style={{ fontSize: '10px', color: 'var(--mut)' }}>
                Unlocked by {team.revealedHints[problem.id].revealedByName || team.revealedHints[problem.id].revealedBy}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--txt)', lineHeight: 1.5 }}>
              {team.revealedHints[problem.id].hint}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 180, 216, 0.05)',
            border: '1px dashed rgba(0, 180, 216, 0.4)',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '14px'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#90e0ef', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lightbulb size={14} color="#00b4d8" /> Need algorithmic guidance?
              </div>
              <small style={{ fontSize: '11px', color: 'var(--mut)' }}>
                {team?.hintPassesCount > 0 ? `${team.hintPassesCount} Hint Pass available` : 'Cost: 40 ByteCoins from shared budget'}
              </small>
            </div>
            <button
              type="button"
              onClick={handleUnlockHintForProblem}
              disabled={hintLoading || ((team?.balance ?? 1000) < 40 && (team?.hintPassesCount || 0) === 0)}
              style={{
                background: '#00b4d8',
                color: '#001a2c',
                fontWeight: 700,
                fontSize: '11px',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {hintLoading ? 'Unlocking...' : (team?.hintPassesCount || 0) > 0 ? 'Use Hint Pass' : 'Unlock Hint (40 BC)'}
            </button>
          </div>
        )}

        {hintError && (
          <div style={{ padding: '8px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: '6px', color: 'var(--red)', fontSize: '11px', marginBottom: '12px' }}>
            ⚠️ {hintError}
          </div>
        )}

        {/* Shared Team Workspace Status Banner */}
        {problemStatus?.status === 'SOLVED' && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(0, 255, 157, 0.15)',
            border: '1px solid var(--neon)',
            borderRadius: '6px',
            color: 'var(--neon)',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle size={16} />
            <span>SOLVED by {problemStatus.solvedBy} {problemStatus.solvedByName ? `(${problemStatus.solvedByName})` : ''}</span>
          </div>
        )}

        {problemStatus?.status === 'IN_PROGRESS' && problemStatus.workingBy !== currentMember?.memberId && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(255, 196, 61, 0.15)',
            border: '1px solid var(--amber)',
            borderRadius: '6px',
            color: 'var(--amber)',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertTriangle size={16} />
            <span>🟡 Teammate {problemStatus.workingBy} is currently working on this problem</span>
          </div>
        )}

        <div style={specSectionStyle}>
          <div className="lbl" style={labelStyle}>Category</div>
          <div style={{ color: 'var(--txt)', fontSize: '13px' }}>{problem.cat || 'General'}</div>
        </div>

        <div style={specSectionStyle}>
          <div className="lbl" style={labelStyle}>Description</div>
          <p style={{ margin: '4px 0', whiteSpace: 'pre-line' }}>{problem.desc}</p>
        </div>

        <div style={specSectionStyle}>
          <div className="lbl" style={labelStyle}>Constraints</div>
          <pre style={codeBlockStyle}>{problem.con || 'Standard competitive limits'}</pre>
        </div>

        <div style={specSectionStyle}>
          <div className="lbl" style={labelStyle}>Sample Input</div>
          <pre style={codeBlockStyle}>{problem.si || '(None)'}</pre>
        </div>

        <div style={specSectionStyle}>
          <div className="lbl" style={labelStyle}>Sample Output</div>
          <pre style={codeBlockStyle}>{problem.so || '(None)'}</pre>
        </div>
      </div>

      {/* Right Pane: Code Editor + Runner & Terminal */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        padding: '12px',
        gap: '10px',
        background: 'var(--bg2)'
      }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={lang}
            onChange={(e) => onLangChange(e.target.value)}
            style={{ width: 'auto', minWidth: '130px' }}
          >
            <option value="python">Python 3</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>

          <button onClick={handleReset} title="Reset starter code">
            <RotateCcw size={14} /> Reset
          </button>

          <button
            onClick={handleLoadSolution}
            title="Auto-fill verified passing solution for testing"
            style={{
              borderColor: 'var(--neon)',
              color: 'var(--neon)',
              fontWeight: 600
            }}
          >
            ⚡ Load Solution
          </button>

          <button
            onClick={() => setAllowPaste(!allowPaste)}
            title={allowPaste ? "Paste is currently ALLOWED without anti-cheat flags" : "Paste is STRICT (Exam Mode)"}
            style={{
              borderColor: allowPaste ? 'var(--amber)' : 'var(--bd)',
              color: allowPaste ? 'var(--amber)' : 'var(--mut)'
            }}
          >
            {allowPaste ? '🔓 Paste: Allowed (Dev)' : '🔒 Paste: Strict'}
          </button>

          <div style={{ flex: 1 }} />

          <button
            className="pri"
            onClick={handleRun}
            disabled={isRunning || isSubmitting || isFrozen}
            title={isFrozen ? "Screen is frozen due to Sabotage attack" : "Run code against sample test cases"}
            style={isFrozen ? { opacity: 0.5, cursor: 'not-allowed', background: 'var(--bg3)', borderColor: 'var(--red)', color: 'var(--red)' } : {}}
          >
            {isRunning ? <Loader2 size={16} className="spin" /> : isFrozen ? <Zap size={16} color="#ff0055" /> : <Play size={16} />}
            {isFrozen ? 'Frozen' : 'Run Code'}
          </button>

          <button
            className="ok"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting || isFrozen}
            title={isFrozen ? "Screen is frozen due to Sabotage attack" : "Submit solution for judging"}
            style={isFrozen ? { opacity: 0.5, cursor: 'not-allowed', background: 'var(--bg3)', borderColor: 'var(--red)', color: 'var(--red)' } : {}}
          >
            {isSubmitting ? <Loader2 size={16} className="spin" /> : isFrozen ? <Zap size={16} color="#ff0055" /> : <Send size={16} />}
            {isFrozen ? 'Frozen' : 'Submit Solution'}
          </button>
        </div>

        {/* Code Editor with Line Gutter */}
        <div style={{
          flex: 1,
          minHeight: '220px',
          display: 'flex',
          border: '1px solid var(--bd)',
          borderRadius: '6px',
          background: '#1a1f2c',
          overflow: 'hidden'
        }}>
          <pre
            ref={gutterRef}
            style={{
              width: '45px',
              textAlign: 'right',
              padding: '10px 8px 10px 0',
              margin: 0,
              color: '#60729c',
              background: '#141824',
              userSelect: 'none',
              overflow: 'hidden',
              font: '13px/20px var(--font-mono)',
              borderRight: '1px solid #232b40'
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
              padding: '10px 12px',
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
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Output Window */}
        <div style={{
          background: '#0d1326',
          border: '1px solid var(--bd)',
          borderRadius: '6px',
          padding: '10px',
          minHeight: '120px',
          maxHeight: '190px',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px',
            color: 'var(--teal)',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            <Terminal size={14} /> Execution Output
          </div>

          {!outputResult && (
            <div style={{ color: 'var(--mut)', fontSize: '13px' }}>
              Run or submit your solution to inspect real-time outputs and grading verdict…
            </div>
          )}

          {outputResult && outputResult.status === 'QUEUED' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber)' }}>
              <Loader2 size={16} className="spin" />
              <span>{outputResult.message}</span>
            </div>
          )}

          {outputResult && outputResult.type === 'run' && outputResult.data && (
            <div>
              {outputResult.data.compileError && (
                <div style={{ color: 'var(--red)', fontWeight: 700, marginBottom: '6px' }}>
                  ❌ Compilation Error
                </div>
              )}
              {outputResult.data.stderr && (
                <pre style={{ color: 'var(--red)', margin: '4px 0', fontSize: '12px' }}>
                  {outputResult.data.stderr}
                </pre>
              )}
              <pre style={{ margin: 0, fontSize: '13px', color: '#fff' }}>
                {outputResult.data.stdout || '(Program completed with no output)'}
              </pre>
            </div>
          )}

          {outputResult && outputResult.type === 'submit' && outputResult.data && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: '6px',
                marginBottom: '8px',
                fontWeight: 700,
                background: outputResult.data.passed ? 'var(--neon-dim)' : 'var(--red-dim)',
                color: outputResult.data.passed ? 'var(--neon)' : 'var(--red)',
                border: `1px solid ${outputResult.data.passed ? 'var(--neon)' : 'var(--red)'}`
              }}>
                {outputResult.data.passed ? <CheckCircle size={18} /> : <XCircle size={18} />}
                <span>VERDICT: {outputResult.data.verdict}</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px' }}>
                  {outputResult.data.passed
                    ? `${problem.pts} / ${problem.pts} Points Awarded`
                    : `Hidden Tests Passed: ${outputResult.data.hiddenPassed} / ${outputResult.data.totalHidden}`}
                </span>
              </div>

              {outputResult.data.details && (
                <div style={{ fontSize: '12px', color: 'var(--txt)', marginBottom: '4px' }}>
                  {outputResult.data.details}
                </div>
              )}

              {outputResult.data.output && (
                <pre style={{ margin: 0, fontSize: '12px', color: 'var(--mut)' }}>
                  Sample run output: {outputResult.data.output}
                </pre>
              )}
            </div>
          )}

          {outputResult && outputResult.error && (
            <div style={{ color: 'var(--red)', fontSize: '13px' }}>
              ⚠ {outputResult.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const specSectionStyle = {
  marginBottom: '14px'
};

const labelStyle = {
  fontSize: '11px',
  color: 'var(--teal)',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontWeight: 700,
  marginBottom: '4px'
};

const codeBlockStyle = {
  background: '#090e1f',
  border: '1px solid var(--bd)',
  borderRadius: '6px',
  padding: '8px 12px',
  margin: '4px 0 0',
  font: '13px var(--font-mono)',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  color: '#c9d1d9'
};
