import { useState, useCallback } from 'react';

export interface LoomRecording {
  sharedUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  duration: number;
}

export function useLoom() {
  const [recording, setRecording] = useState<LoomRecording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate Loom SDK – in production use @loomhq/loom-sdk
  const startRecording = useCallback(async () => {
    setError(null);
    try {
      // Check for screen capture API support
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen recording is not supported in this browser.');
      }
      setIsRecording(true);

      // Simulate recording session (in real impl: loom.configureButton callback)
      await new Promise<void>(resolve => setTimeout(resolve, 2000));

      // Mock completed recording
      setRecording({
        sharedUrl: 'https://www.loom.com/share/mock-recording-id-12345',
        embedUrl: 'https://www.loom.com/embed/mock-recording-id-12345',
        thumbnailUrl: 'https://cdn.loom.com/sessions/thumbnails/mock-recording-id-12345.jpg',
        duration: 47,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording.');
    } finally {
      setIsRecording(false);
    }
  }, []);

  const clearRecording = useCallback(() => setRecording(null), []);

  return { recording, isRecording, error, startRecording, clearRecording };
}
