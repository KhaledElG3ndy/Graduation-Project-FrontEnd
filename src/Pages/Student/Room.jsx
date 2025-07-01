import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getJoinInfo, joinRoom, leaveRoom } from '../../api/jitsiService';
import JitsiRoom from '../../components/JitsiRoom';

export default function Room() {
  const { roomName } = useParams();
  const location = useLocation();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const displayName = location.state?.displayName || 'Guest';

  // Effect for joining and getting info (runs when roomName or displayName changes)
  useEffect(() => {
    const handleJoinRoom = async () => {
      try {
        setLoading(true);
        setError(null);
        const joinInfo = await getJoinInfo(roomName, displayName);
        setInfo(joinInfo);
        await joinRoom(roomName, displayName);
        setLoading(false);
      } catch (err) {
        setError('Failed to join meeting');
        setLoading(false);
        console.error('Error in handleJoinRoom:', err);
      }
    };
    if (roomName && displayName) handleJoinRoom();
  }, [roomName, displayName]);

  // Effect for leaving the room (runs on unmount AND page unload)
  useEffect(() => {
    const handleLeave = () => {
      if (roomName && displayName) {
        console.log('Calling leaveRoom', roomName, displayName);
        leaveRoom(roomName, displayName);
      }
    };

    // React cleanup (for navigation away)
    let cleanupCalled = false;
    const handleReactCleanup = () => {
      if (!cleanupCalled) {
        cleanupCalled = true;
        handleLeave();
      }
    };

    // Browser events (for tab close, reload, etc.)
    window.addEventListener('beforeunload', handleLeave);
    window.addEventListener('pagehide', handleLeave);

    // Return cleanup for React
    return () => {
      handleReactCleanup();
      window.removeEventListener('beforeunload', handleLeave);
      window.removeEventListener('pagehide', handleLeave);
    };
  }, [roomName, displayName]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!info) return <p>No meeting info found.</p>;

  return (
    <JitsiRoom
      roomName={info.roomName}
      displayName={info.displayName}
      mode="sdk"
    />
  );
}
