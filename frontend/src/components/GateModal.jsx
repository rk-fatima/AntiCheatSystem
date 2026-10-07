import React, { useState } from 'react';
import { ShieldCheck, Maximize2, AlertTriangle } from 'lucide-react';

export function GateModal({ initialTeamName, onStartExam }) {
  const [name, setName] = useState(initialTeamName || '');
  const [error, setError] = useState('');

  const handleStart = () => {
    if (!name.trim()) {
      setError('Please enter a team name');
      return;
    }
    onStartExam(name.trim());
  };

  return (
    <div className="ov" style={{ zIndex: 999 }}>
      <div className="box" style={{ maxWidth: '480px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <ShieldCheck size={28} color="var(--teal)" />
          <h2 style={{ color: 'var(--teal)', margin: 0, fontSize: '20px' }}>
            Qubit — Secure Exam Mode
          </h2>
        </div>

        <p style={{ color: 'var(--txt)', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
          Welcome to the Qubit Coding Contest. To ensure competitive integrity, the following proctoring rules are active:
        </p>

        <ul style={{
          color: 'var(--mut)',
          fontSize: '12px',
          lineHeight: 1.6,
          paddingLeft: '20px',
          marginBottom: '20px'
        }}>
          <li>Fullscreen mode is mandatory throughout the test.</li>
          <li>Tab switching, window minimization, or blur will trigger violation flags.</li>
          <li>External copy & paste is blocked and audited.</li>
          <li>Exceeding 3 violation flags will instantly freeze and lock your exam.</li>
        </ul>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--teal)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>
            Enter Team Name
          </label>
          <input
            placeholder="e.g. CyberKnights"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            autoFocus
          />
          {error && (
            <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>
              {error}
            </div>
          )}
        </div>

        <button
          className="pri"
          onClick={handleStart}
          style={{ width: '100%', padding: '10px', fontSize: '15px' }}
        >
          <Maximize2 size={18} /> Start Exam in Fullscreen
        </button>
      </div>
    </div>
  );
}
