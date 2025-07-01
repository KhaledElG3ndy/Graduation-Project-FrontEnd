import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../api/jitsiService';

export default function MeetingControls() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  const handleInstant = async () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    const roomName = `room-${Math.random().toString(36).substring(2, 10)}`;
    const room = await createRoom({ 
      title: 'Instant room',
      roomName,
      createdBy: userName
    });
    if (room && room.roomName) {
      navigate(`/room/${room.roomName}`, { state: { displayName: userName } });
    } else {
      console.error('Room creation failed or roomName missing');
    }
  };

  return (
    <div className="controls">
      <input
        type="text"
        placeholder="Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <button onClick={handleInstant}>Start Instant Meeting</button>
    </div>
  );
}
