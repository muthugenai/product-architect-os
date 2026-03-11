import React from 'react';
import { useLoom } from '../../hooks/useLoom';
import './LoomRecorder.css';

interface LoomRecorderProps {
  onRecordingComplete: (url: string, thumbnail: string) => void;
  onRecordingStart?: () => void;
}

export const LoomRecorder: React.FC<LoomRecorderProps> = ({ onRecordingComplete, onRecordingStart }) => {
  const { recording, isRecording, error, startRecording, clearRecording } = useLoom();

  const handleStart = async () => {
    await startRecording();
  };

  React.useEffect(() => {
    if (recording) onRecordingComplete(recording.sharedUrl, recording.thumbnailUrl);
  }, [recording, onRecordingComplete]);

  React.useEffect(() => {
    if (isRecording && onRecordingStart) onRecordingStart();
  }, [isRecording, onRecordingStart]);

  return (
    <div className="loom-recorder">
      {!recording && (
        <button
          className={`btn loom-recorder__btn${isRecording ? ' recording' : ''}`}
          type="button"
          onClick={handleStart}
          disabled={isRecording}
        >
          {isRecording ? (
            <>
              <span className="loom-recorder__pulse" />
              Recording…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="8" r="5" fill="#FF5733"/>
                <circle cx="8" cy="8" r="7" stroke="#FF5733" strokeWidth="2" fill="none"/>
              </svg>
              Record a Loom
            </>
          )}
        </button>
      )}

      {error && (
        <div className="loom-recorder__error">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm1-3H7V5h2v4z"/>
          </svg>
          {error}
          <br /><em>For demo: recording will auto-attach a mock video.</em>
        </div>
      )}

      {recording && (
        <div className="loom-recorder__preview">
          <div className="loom-recorder__preview-inner">
            <div className="loom-recorder__thumb">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.4)"/>
                <path d="M10 8l6 4-6 4V8z" fill="white"/>
              </svg>
            </div>
            <div className="loom-recorder__info">
              <a href={recording.sharedUrl} target="_blank" rel="noreferrer" className="loom-recorder__link">
                🎬 Screen recording ({Math.floor(recording.duration / 60)}:{String(recording.duration % 60).padStart(2, '0')})
              </a>
              <span className="loom-recorder__url">{recording.sharedUrl}</span>
            </div>
            <button className="btn btn-icon loom-recorder__remove" onClick={clearRecording} aria-label="Remove recording">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
                <path d="M13 1L1 13M1 1l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
