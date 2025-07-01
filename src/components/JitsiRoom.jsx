import { useEffect, useRef } from 'react';

export default function JitsiRoom({ roomName, displayName, mode }) {
  const iframeRef = useRef(null);

  // This is a minimal example. In a real app, you would use the Jitsi SDK or iframe.
  useEffect(() => {
    if (mode === 'sdk' && window.JitsiMeetExternalAPI) {
      const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
        roomName,
        parentNode: iframeRef.current,
        userInfo: { displayName },
      });
      return () => api.dispose();
    }
  }, [roomName, displayName, mode]);

  return (
    <div ref={iframeRef} style={{ width: '100%', height: '600px' }}>
      {/* Jitsi meeting will be embedded here */}
    </div>
  );
}
