import React, { useState, useEffect } from 'react';
import { ShieldCheck, Maximize2, Users, UserCheck, Crown, Sparkles, Building2, Phone, Mail, Hash } from 'lucide-react';
import { registerTeam, loginTeam, fetchTeamsList } from '../services/api';

export function GateModal({ onTeamSessionReady }) {
  const [tab, setTab] = useState('register'); // 'register' or 'join'
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(3);
  const [captainIdx, setCaptainIdx] = useState(0);
  const [members, setMembers] = useState([
    { name: '', rollNo: '', phone: '', email: '', college: '' },
    { name: '', rollNo: '', phone: '', email: '', college: '' },
    { name: '', rollNo: '', phone: '', email: '', college: '' }
  ]);
  const [existingTeams, setExistingTeams] = useState([]);
  const [selectedExistingTeam, setSelectedExistingTeam] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamsList()
      .then(res => {
        setExistingTeams(res.teams || []);
        if (res.teams && res.teams.length > 0) {
          setSelectedExistingTeam(res.teams[0].name);
        }
      })
      .catch(() => {});
  }, []);

  const handleMemberChange = (index, field, value) => {
    setMembers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    setError('');
  };

  const handleRegister = async () => {
    if (!teamName.trim()) {
      setError('Please enter a team name.');
      return;
    }

    const currentMembers = members.slice(0, teamSize);
    for (let i = 0; i < teamSize; i++) {
      const m = currentMembers[i];
      if (!m.name.trim()) {
        setError(`Please enter Full Name for Member ${i + 1}.`);
        return;
      }
      if (!m.rollNo.trim()) {
        setError(`Please enter Roll Number for Member ${i + 1}.`);
        return;
      }
    }

    setLoading(true);
    setError('');
    try {
      const res = await registerTeam({
        name: teamName.trim(),
        size: teamSize,
        captainIdx,
        members: currentMembers
      });

      // Default active session to captain or member 1
      const defaultMember = res.team.members[captainIdx] || res.team.members[0];
      onTeamSessionReady(res.team, defaultMember);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const targetTeamName = selectedExistingTeam.trim() || teamName.trim();
    if (!targetTeamName) {
      setError('Please specify a registered team name.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await loginTeam({
        teamName: targetTeamName,
        memberId: selectedMemberId || undefined
      });
      onTeamSessionReady(res.team, res.member);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const currentSelectedTeamObj = existingTeams.find(t => t.name.toLowerCase() === selectedExistingTeam.toLowerCase());

  return (
    <div className="ov" style={{ zIndex: 999, overflowY: 'auto', padding: '20px 10px' }}>
      <div className="box" style={{ maxWidth: '640px', width: '100%', margin: 'auto', padding: '24px', background: 'var(--bg2)' }}>
        {/* Title & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={26} color="var(--teal)" />
            <h2 style={{ color: 'var(--teal)', margin: 0, fontSize: '20px', letterSpacing: '0.5px' }}>
              Qubit AntiCheat — Team Workspace
            </h2>
          </div>
          <span style={{
            fontSize: '11px',
            background: 'var(--bg4)',
            color: 'var(--neon)',
            border: '1px solid var(--neon)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontWeight: 700
          }}>
            ₹1,000 Budget
          </span>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid var(--bd)', paddingBottom: '10px' }}>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            style={{
              flex: 1,
              background: tab === 'register' ? 'var(--teal)' : 'var(--bg3)',
              color: tab === 'register' ? '#000' : 'var(--txt)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Users size={16} /> Register New Team (1–3 Members)
          </button>
          <button
            onClick={() => { setTab('join'); setError(''); }}
            style={{
              flex: 1,
              background: tab === 'join' ? 'var(--teal)' : 'var(--bg3)',
              color: tab === 'join' ? '#000' : 'var(--txt)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <UserCheck size={16} /> Member Login
          </button>
        </div>

        {/* Error message banner */}
        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '6px',
            background: 'var(--red-dim)',
            border: '1px solid var(--red)',
            color: 'var(--red)',
            fontSize: '13px',
            marginBottom: '14px',
            fontWeight: 600
          }}>
            ⚠️ {error}
          </div>
        )}

        {tab === 'register' ? (
          <div>
            {/* Team Name & Size */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Team Name</label>
                <input
                  placeholder="e.g. SYNORA"
                  value={teamName}
                  onChange={(e) => { setTeamName(e.target.value.toUpperCase()); setError(''); }}
                  autoFocus
                />
              </div>

              <div>
                <label style={labelStyle}>Team Size</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setTeamSize(sz)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        background: teamSize === sz ? 'var(--neon)' : 'var(--bg3)',
                        color: teamSize === sz ? '#000' : 'var(--txt)',
                        fontWeight: 700,
                        border: '1px solid var(--bd)'
                      }}
                    >
                      {sz} {sz === 1 ? 'Dev' : 'Devs'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Member Details */}
            <div style={{
              maxHeight: '340px',
              overflowY: 'auto',
              paddingRight: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '18px'
            }}>
              {Array.from({ length: teamSize }).map((_, idx) => {
                const memberIndexStr = String(idx + 1).padStart(2, '0');
                const generatedId = `${teamName.trim() || 'TEAM'}-${memberIndexStr}`;
                const isCaptain = captainIdx === idx;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isCaptain ? 'var(--teal)' : 'var(--bd)',
                      background: 'var(--bg3)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: 'var(--bg4)',
                          color: 'var(--teal)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 700
                        }}>
                          {generatedId}
                        </span>
                        <span style={{ color: 'var(--txt)', fontSize: '13px', fontWeight: 600 }}>
                          Member {idx + 1}
                        </span>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: isCaptain ? 'var(--neon)' : 'var(--mut)' }}>
                        <input
                          type="radio"
                          name="captainRadio"
                          checked={isCaptain}
                          onChange={() => setCaptainIdx(idx)}
                          style={{ accentColor: 'var(--neon)' }}
                        />
                        <Crown size={14} color={isCaptain ? 'var(--neon)' : 'var(--mut)'} />
                        <b>Team Captain</b>
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <small style={subLabelStyle}>Full Name *</small>
                        <input
                          placeholder="Contestant Name"
                          value={members[idx].name}
                          onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <small style={subLabelStyle}>Roll Number *</small>
                        <input
                          placeholder="e.g. 21CS042"
                          value={members[idx].rollNo}
                          onChange={(e) => handleMemberChange(idx, 'rollNo', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      <div>
                        <small style={subLabelStyle}>College / Institute</small>
                        <input
                          placeholder="College Name"
                          value={members[idx].college}
                          onChange={(e) => handleMemberChange(idx, 'college', e.target.value)}
                        />
                      </div>
                      <div>
                        <small style={subLabelStyle}>Mobile Number</small>
                        <input
                          placeholder="Phone No"
                          value={members[idx].phone}
                          onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <small style={subLabelStyle}>Email Address</small>
                        <input
                          placeholder="Email ID"
                          value={members[idx].email}
                          onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Register button */}
            <button
              className="pri"
              onClick={handleRegister}
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              <Maximize2 size={18} /> {loading ? 'Registering...' : 'Register Team & Start Exam in Fullscreen'}
            </button>
          </div>
        ) : (
          <div>
            {/* Member Join existing team */}
            <p style={{ color: 'var(--mut)', fontSize: '13px', marginBottom: '14px' }}>
              Choose your registered team and select your Member ID to access the shared team workspace:
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Select Registered Team</label>
              {existingTeams.length > 0 ? (
                <select
                  value={selectedExistingTeam}
                  onChange={(e) => {
                    setSelectedExistingTeam(e.target.value);
                    setSelectedMemberId('');
                  }}
                  style={{ width: '100%', padding: '10px', background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bd)', borderRadius: '6px' }}
                >
                  {existingTeams.map(t => (
                    <option key={t.name} value={t.name}>
                      {t.name} ({t.size || t.members?.length} Members)
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  placeholder="Enter Registered Team Name (e.g. SYNORA)"
                  value={selectedExistingTeam}
                  onChange={(e) => setSelectedExistingTeam(e.target.value.toUpperCase())}
                />
              )}
            </div>

            {currentSelectedTeamObj && currentSelectedTeamObj.members && (
              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Select Your Member Identity</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentSelectedTeamObj.members.map((m) => (
                    <label
                      key={m.memberId}
                      onClick={() => setSelectedMemberId(m.memberId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: selectedMemberId === m.memberId ? 'var(--teal)' : 'var(--bd)',
                        background: selectedMemberId === m.memberId ? 'var(--bg3)' : 'var(--bg4)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="radio"
                          name="memberSelect"
                          checked={selectedMemberId === m.memberId}
                          onChange={() => setSelectedMemberId(m.memberId)}
                        />
                        <div>
                          <b style={{ color: 'var(--teal)', marginRight: '6px' }}>{m.memberId}</b>
                          <span style={{ color: 'var(--txt)' }}>{m.name}</span>
                          {m.rollNo && <small style={{ color: 'var(--mut)', marginLeft: '8px' }}>({m.rollNo})</small>}
                        </div>
                      </div>
                      {m.isCaptain && (
                        <span style={{ color: 'var(--neon)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Crown size={12} /> Captain
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              className="pri"
              onClick={handleJoin}
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              <Maximize2 size={18} /> {loading ? 'Joining...' : 'Enter Shared Workspace in Fullscreen'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: 'var(--teal)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  fontWeight: 700,
  letterSpacing: '0.5px'
};

const subLabelStyle = {
  display: 'block',
  fontSize: '11px',
  color: 'var(--mut)',
  marginBottom: '4px',
  fontWeight: 600
};
