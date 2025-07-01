// src/components/MeetingsDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveMeetings, createRoom, joinRoom } from "../api/jitsiService";

export default function MeetingsProfessor() {
  const [meetings, setMeetings] = useState([]);
  const [createUserName, setCreateUserName] = useState("");
  const [joinUserName, setJoinUserName] = useState("");
  const [selectedRoomName, setSelectedRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch active meetings every 10 seconds
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const activeMeetings = await getActiveMeetings();
        setMeetings(activeMeetings);
      } catch (error) {
        console.error("Failed to fetch meetings:", error);
      }
    };

    fetchMeetings();
  }, []);

  // Create new meeting - only requires username
  const handleCreateMeeting = async () => {
    if (!createUserName.trim()) {
      alert("Please enter your name to create a meeting");
      return;
    }

    setLoading(true);
    try {
      // Generate room name in frontend
      const roomName = `room-${Math.random().toString(36).substring(2, 10)}`;

      await createRoom({
        title: `${createUserName}'s Meeting`,
        roomName,
        createdBy: createUserName,
      });

      navigate(`/room/${roomName}`, { state: { displayName: createUserName } });
    } catch (error) {
      alert("Failed to create meeting");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Join existing meeting - only requires username
  const handleJoinMeeting = async () => {
    if (!joinUserName.trim()) {
      alert("Please enter your name to join a meeting");
      return;
    }
    if (!selectedRoomName) {
      alert("Please select a meeting to join");
      return;
    }

    try {
      await joinRoom(selectedRoomName, joinUserName);
      navigate(`/room/${selectedRoomName}`, {
        state: { displayName: joinUserName },
      });
    } catch (error) {
      alert("Failed to join meeting");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Meeting Dashboard</h1>

      {/* Create Meeting Section */}
      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "2px solid #007bff",
          borderRadius: "8px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <h2>Create New Meeting</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="text"
            placeholder="Enter your name"
            value={createUserName}
            onChange={(e) => setCreateUserName(e.target.value)}
            style={{
              padding: "10px",
              width: "250px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <button
            onClick={handleCreateMeeting}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {loading ? "Creating..." : "Create Meeting"}
          </button>
        </div>
      </div>
    </div>
  );
}
