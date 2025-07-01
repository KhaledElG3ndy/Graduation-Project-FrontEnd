import { useEffect, useState } from 'react';
import { listRooms } from '../api/jitsiService';
import { Link } from 'react-router-dom';

export default function MeetingList() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    listRooms().then(setRooms);
  }, []);

  return (
    <ul className="room-list">
      {rooms.map(r => (
        <li key={r.id}>
          {r.title} — {new Date(r.startsAt).toLocaleString()}
          <Link to={`/room/${r.id}`}>Join</Link>
        </li>
      ))}
    </ul>
  );
}
