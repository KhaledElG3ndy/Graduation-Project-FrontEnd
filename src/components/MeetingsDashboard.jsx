// src/components/MeetingsDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveMeetings, createRoom, joinRoom } from "../api/jitsiService";

export default function MeetingsDashboard() {
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

      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "2px solid #28a745",
          borderRadius: "8px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <h2>Join Existing Meeting</h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          <input
            type="text"
            placeholder="Enter your name"
            value={joinUserName}
            onChange={(e) => setJoinUserName(e.target.value)}
            style={{
              padding: "10px",
              width: "250px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <button
            onClick={handleJoinMeeting}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Join Selected Meeting
          </button>
        </div>

        {/* Meeting Selection */}
        <div>
          <h3>Select Meeting to Join:</h3>
          {meetings.length === 0 ? (
            <p style={{ color: "#666" }}>No active meetings available</p>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {meetings.map((meeting) => (
                <div
                  key={meeting.roomName}
                  onClick={() => setSelectedRoomName(meeting.roomName)}
                  style={{
                    border:
                      selectedRoomName === meeting.roomName
                        ? "2px solid #28a745"
                        : "1px solid #ddd",
                    borderRadius: "6px",
                    padding: "12px",
                    backgroundColor:
                      selectedRoomName === meeting.roomName
                        ? "#e8f5e8"
                        : "white",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 5px 0" }}>{meeting.title}</h4>
                      <p
                        style={{ margin: "0", fontSize: "14px", color: "#666" }}
                      >
                        Room: {meeting.roomName} | Created by:{" "}
                        {meeting.createdBy}
                      </p>
                      <p
                        style={{ margin: "0", fontSize: "14px", color: "#666" }}
                      >
                        Participants: {meeting.participants.length}
                        {meeting.participants.length > 0 && (
                          <span> ({meeting.participants.join(", ")})</span>
                        )}
                      </p>
                    </div>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor:
                          selectedRoomName === meeting.roomName
                            ? "#28a745"
                            : "#ddd",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Meetings Status */}
      <div style={{ textAlign: "center", color: "#666" }}>
        <p>Total Active Meetings: {meetings.length}</p>
        <p>Auto-refreshes every 10 seconds</p>
      </div>
    </div>
  );
}
