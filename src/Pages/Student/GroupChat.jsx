import React, { useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";

const CroupChat = () => {
  const [userId, setUserId] = useState("");
  const [toCourseId, setToCourseId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const connectionRef = useRef(null);
  let connection;
  let userEmail;
  let courseId;
  const connect = async () => {
    if (!userId) {
      alert("Please enter your User ID.");
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://localhost:7072/chathub?userId=${encodeURIComponent(userId)}`
      )
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on("ReceiveMessage", (fromUserId, message) => {
      const newMessage = `📩 From ${fromUserId}: ${message}`;
      setMessages((prev) => [...prev, newMessage]);
    });

    try {
      await connection.start();
      setMessages((prev) => [...prev, `✅ Connected as ${userId}`]);
      console.log("✅ Connected as", userId);
      connectionRef.current = connection;
    } catch (err) {
      console.error("❌ Connection failed:", err);
      alert("⚠️ Failed to connect to server. See console for details.");
    }
  };

  const sendMessage = async () => {
    if (!toCourseId || !messageText) {
      alert("❗ برجاء إدخال UserId والرسالة");
      return;
    }

    try {
      await connectionRef.current.invoke(
        "SendMessage",
        userId,
        toCourseId,
        messageText
      );
    } catch (err) {
      console.error("❌ Send error:", err);
    }
  };
  const joinGroup = () => {
    const   courseId = 1;

    if (!courseId) {
      alert("❗ أدخل رقم الكورس أولًا");
      return;
    }

    connection
      .invoke("JoinCourseGroup", parseInt(courseId))
      .then(() => {
        alert(`✅ Joined group for course ${courseId}`);
      })
      .catch((err) => {
        console.error("❌ Join group error:", err);
        alert("❌ Failed to join group");
      });
  };

  const sendGroupMessage = () => {
    const message = document.getElementById("messageText").value;

    if (!message || !courseId || !userEmail) {
      alert("❗ أدخل البريد والرسالة ورقم الكورس");
      return;
    }

    connection
      .invoke("SendMessageToCourse", parseInt(courseId), userEmail, message)
      .catch((err) => {
        console.error("❌ Send error:", err);
      });
  };
  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">🔌 SignalR Chat Test</h2>

      <div>
        <label>
          <strong>Your User ID:</strong>
        </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="مثال: 1"
          className="border p-1 ml-2"
        />
        <button
          onClick={connect}
          className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
        >
          Connect
        </button>
      </div>

      <hr />

      <div>
        <label>
          <strong>To Course ID:</strong>
        </label>
        <input
          type="text"
          value={toCourseId}
          onChange={(e) => setToCourseId(e.target.value)}
          placeholder="مثال: 2"
          className="border p-1 ml-2"
        />
      </div>
      <button
        onClick={joinGroup}
        className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
      >
        Connect to Course
      </button>
      <div>
        <label>
          <strong>Message:</strong>
        </label>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="اكتب الرسالة هنا..."
          className="border p-1 ml-2"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-3 py-1 bg-green-500 text-white rounded"
        >
          Send
        </button>
      </div>

      <hr />

      <h3 className="font-semibold">📨 Received Messages:</h3>
      <ul className="list-disc pl-5">
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default CroupChat;
