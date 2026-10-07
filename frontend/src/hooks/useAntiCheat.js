import { useEffect, useRef, useCallback } from 'react';
import { sendTelemetry } from '../services/api';

export function useAntiCheat({ teamName, memberId, isStarted, isLocked, onLockStatusChange, onViolationLogged }) {
  const lastFlagTimeRef = useRef(0);
  const internalClipboardRef = useRef('');

  const reportViolation = useCallback(async (event, details) => {
    if (!teamName || !isStarted || isLocked) return;

    // Rate-limit consecutive flags to avoid spamming the server
    const now = Date.now();
    if (now - lastFlagTimeRef.current < 800) return;
    lastFlagTimeRef.current = now;

    if (onViolationLogged) {
      onViolationLogged({ event, details, memberId, timestamp: now });
    }

    const res = await sendTelemetry(teamName, memberId, event, details);
    if (res && res.isLocked && onLockStatusChange) {
      onLockStatusChange(true, res.lockReason);
    }
  }, [teamName, memberId, isStarted, isLocked, onLockStatusChange, onViolationLogged]);

  useEffect(() => {
    if (!isStarted || isLocked) return;

    // 1. Fullscreen monitoring
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        reportViolation('FULLSCREEN_EXIT', 'Exited fullscreen examination mode.');
      }
    };

    // 2. Tab switch / visibility monitoring
    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportViolation('TAB_SWITCH', 'Switched away from browser tab or minimized window.');
      }
    };

    // 3. Window blur / lost focus
    const handleBlur = () => {
      setTimeout(() => {
        if (!document.hidden && !document.hasFocus()) {
          reportViolation('FOCUS_LOST', 'Window lost focus (switched to external application).');
        }
      }, 300);
    };

    // 4. Keyboard shortcut blocking
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      if (
        e.key === 'F12' ||
        (ctrl && e.shiftKey && 'ijc'.includes(k)) ||
        (ctrl && 'usp'.includes(k))
      ) {
        e.preventDefault();
        e.stopPropagation();
        reportViolation(
          'BLOCKED_SHORTCUT',
          `Attempted developer tool or inspection shortcut (${ctrl ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key})`
        );
      }
    };

    // 5. Context menu blocking
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // 6. Window beforeunload prompt
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStarted, isLocked, reportViolation]);

  const enterFullscreen = useCallback(async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed or was bypassed:', err);
    }
  }, []);

  return {
    reportViolation,
    enterFullscreen,
    internalClipboardRef
  };
}
