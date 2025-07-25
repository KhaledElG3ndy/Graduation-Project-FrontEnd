import React, { useState, useRef, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import Header from "../../../components/Student/Header/Header";
import styles from "./Chat.module.css";
import { useNavigate } from "react-router-dom";
const Chat = () => {
  const [userId, setUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const connectionRef = useRef(null);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (!token) {
      navigate("/login/signin");
      return;
    }

    const parseJwt = (token) => {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch (e) {
        console.error("Invalid token", e);
        return null;
      }
    };

    const payload = parseJwt(token);
    if (!payload) {
      navigate("/login/signin");
      return;
    }

    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (role !== "Student") {
      navigate("/login/signin");
    }
  }, [navigate]);
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const connect = async (email) => {
    if (connectionRef.current) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://localhost:7072/chathub?userId=${encodeURIComponent(email)}`
      )
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.off("ReceiveMessage");

    connection.on("ReceiveMessage", (fromUserId, messageJson) => {
      try {
        const payload = JSON.parse(messageJson);
        const isImage = payload.mimeType?.startsWith("image/");

        const newMessage = {
          from: fromUserId,
          text: payload.text,
          timestamp: payload.timestamp,
          image: isImage
            ? `data:${payload.mimeType};base64,${payload.file}`
            : null,
          file:
            !isImage && payload.file
              ? {
                  fileName: payload.fileName,
                  dataUrl: `data:${payload.mimeType};base64,${payload.file}`,
                }
              : null,
        };

        setMessagesMap((prevMap) => {
          const existing = prevMap[fromUserId] || [];
          return {
            ...prevMap,
            [fromUserId]: [...existing, newMessage],
          };
        });
      } catch (e) {
        console.error("Error handling incoming message", e);
      }
    });

    try {
      await connection.start();
      connectionRef.current = connection;
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  const fetchAllUsers = async (email) => {
    const token = localStorage.getItem("Token");
    const headers = { Authorization: `Bearer ${token}` };
    const roles = [0, 1, 2, 3];
    let all = [];

    for (const role of roles) {
      try {
        const res = await fetch(
          `https://localhost:7072/api/Account/GetAllByRole?role=${role}`,
          {
            headers,
          }
        );
        if (res.ok) {
          const data = await res.json();
          const group = role === 3 ? data.students : data.staffs;
          if (group) all = all.concat(group);
        }
      } catch (e) {
        console.warn("Failed to fetch role:", role, e);
      }
    }

    const filtered = all.filter((user) => user.email !== email);
    setUsers(filtered);
  };

  const fetchConversation = async (user1Email, user2Email) => {
    const token = localStorage.getItem("Token");
    if (!token) return;

    try {
      const response = await fetch(
        `https://localhost:7072/Chat/GetConversation/conversation/${encodeURIComponent(
          user1Email
        )}/${encodeURIComponent(user2Email)}?user1Email=${encodeURIComponent(
          user1Email
        )}&user2Email=${encodeURIComponent(user2Email)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }

      const messages = await response.json();

      const formattedMessages = messages.map((message) => {
        const isCurrentUser = message.fromUserEmail === user1Email;

        let fileData = null;
        if (message.file) {
          const base64String = btoa(
            new Uint8Array(message.file).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          const dataUrl = `data:application/octet-stream;base64,${base64String}`;
          fileData = {
            fileName: "file",
            dataUrl: dataUrl,
          };
        }

        return {
          from: message.fromUserEmail,
          text: message.message,
          timestamp: new Date(message.sentAt).toLocaleTimeString(),
          file: fileData,
        };
      });

      setMessagesMap((prevMap) => ({
        ...prevMap,
        [user2Email]: formattedMessages,
      }));
    } catch (error) {
      console.error("Error fetching conversation:", error);
      alert("Failed to load conversation history");
    }
  };

  const sendMessage = async () => {
    if (!toUserId || (!messageText && !imageFile)) {
      alert("📭 Please enter a message or choose an image/file");
      return;
    }

    const formData = new FormData();
    formData.append("FromUserEmail", userId);
    formData.append("ToUserEmail", toUserId);
    formData.append("Message", messageText?.trim() || "N/A");
    if (imageFile) formData.append("File", imageFile);

    const token = localStorage.getItem("Token");
    const fileSnapshot = imageFile;

    try {
      const response = await fetch(
        "https://localhost:7072/Chat/SendMessage/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to send");

      const timestamp = new Date().toLocaleTimeString();

      if (fileSnapshot) {
        const reader = new FileReader();
        let handled = false;

        reader.onload = () => {
          if (handled) return;
          handled = true;

          const fileDataUrl = reader.result;

          const newMessage = {
            from: userId,
            text: messageText?.trim() || "",
            image: fileSnapshot.type.startsWith("image/") ? fileDataUrl : null,
            file: !fileSnapshot.type.startsWith("image/")
              ? {
                  fileName: fileSnapshot.name,
                  dataUrl: fileDataUrl,
                }
              : null,
            timestamp,
          };

          setMessagesMap((prevMap) => ({
            ...prevMap,
            [toUserId]: [...(prevMap[toUserId] || []), newMessage],
          }));

          setMessageText("");
          setImageFile(null);
        };

        reader.readAsDataURL(fileSnapshot);
      } else {
        const newMessage = {
          from: userId,
          text: messageText?.trim(),
          timestamp,
        };

        setMessagesMap((prevMap) => ({
          ...prevMap,
          [toUserId]: [...(prevMap[toUserId] || []), newMessage],
        }));

        setMessageText("");
      }
    } catch (err) {
      console.error("Send error:", err);
      alert("Send failed");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (!token) return;

    const payload = parseJwt(token);
    const email =
      payload?.[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ];

    if (email) {
      setUserId(email);
      connect(email);
      fetchAllUsers(email);
    }
  }, []);
  useEffect(() => {
    const loadAndScroll = async () => {
      await fetchConversation(userId, toUserId);
      setTimeout(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    };

    if (toUserId && userId) {
      loadAndScroll();
    }
  }, [toUserId, userId]);

  const currentMessages = toUserId ? messagesMap[toUserId] || [] : [];
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages]);
  return (
    <>
      <Header />
      <div className={styles.chatContainer}>
        <div className={styles.chatWrapper}>
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <div className={styles.headerIcon}>
                <svg
                  width="100"
                  height="100"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter
                      id="chatShadow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="2"
                        stdDeviation="2"
                        flood-color="#000000"
                        flood-opacity="0.3"
                      />
                    </filter>

                    <linearGradient
                      id="chatGradient1"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stop-color="#002244" />
                      <stop offset="50%" stop-color="#0066cc" />
                      <stop offset="100%" stop-color="#33ccff" />
                    </linearGradient>

                    <linearGradient
                      id="chatGradient2"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stop-color="#0066cc" />
                      <stop offset="50%" stop-color="#33ccff" />
                      <stop offset="100%" stop-color="#66e0ff" />
                    </linearGradient>
                  </defs>

                  <circle
                    cx="12"
                    cy="12"
                    r="11"
                    fill="#f0f4f8"
                    stroke="#d9e2ec"
                    stroke-width="1"
                  />

                  <g filter="url(#chatShadow)">
                    <path
                      d="M8 12C8 10.8954 8.89543 10 10 10H18C19.1046 10 20 10.8954 20 12V16C20 17.1046 19.1046 18 18 18H14L10 20V18C8.89543 18 8 17.1046 8 16V12Z"
                      fill="url(#chatGradient1)"
                    />

                    <path
                      d="M4 6C4 4.89543 4.89543 4 6 4H14C15.1046 4 16 4.89543 16 6V10C16 11.1046 15.1046 12 14 12H10L6 14V12C4.89543 12 4 11.1046 4 10V6Z"
                      fill="url(#chatGradient2)"
                    />

                    <path
                      d="M17 13L19 11L17 9"
                      stroke="white"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M10 7 L8 9 L10 11"
                      stroke="white"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />

                    <circle cx="10" cy="8" r="1" fill="white" opacity="0.8">
                      <animate
                        attributeName="opacity"
                        values="0;1;0"
                        dur="1.5s"
                        repeatCount="indefinite"
                        begin="0s"
                      />
                    </circle>
                    <circle cx="12" cy="8" r="1" fill="white" opacity="0.8">
                      <animate
                        attributeName="opacity"
                        values="0;1;0"
                        dur="1.5s"
                        repeatCount="indefinite"
                        begin="0.2s"
                      />
                    </circle>
                    <circle cx="14" cy="14" r="1" fill="white" opacity="0.8">
                      <animate
                        attributeName="opacity"
                        values="0;1;0"
                        dur="1.5s"
                        repeatCount="indefinite"
                        begin="0.4s"
                      />
                    </circle>
                  </g>
                </svg>
              </div>
            </div>
            <div className={styles.userInfo}>
              <div className={styles.reactHeader}>
                <label className={styles.label}>Your Email</label>
              </div>
              <input
                type="text"
                value={userId}
                disabled
                className={`${styles.input} ${styles.inputDisabled}`}
              />
            </div>

            <div className={styles.userSelection}>
              <label className={styles.label}>Send To</label>
              <select
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                className={styles.select}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.email}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>
            {imageFile && (
              <div className={styles.filePreview}>
                <span className={styles.fileName}>📎 {imageFile.name}</span>
                <button
                  onClick={() => setImageFile(null)}
                  className={styles.removeFile}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className={styles.chatArea}>
            <div className={styles.messagesContainer}>
              <div className={styles.messagesHeader}>
                <h3 className={styles.messagesTitle}>Messages</h3>
                <div className={styles.onlineIndicator}>
                  <span className={styles.onlineDot}></span>
                  Online
                </div>
              </div>

              <div className={styles.messages}>
                {toUserId ? (
                  currentMessages.length > 0 ? (
                    currentMessages.map((msg, index) => (
                      <div key={index} className={styles.messageWrapper}>
                        <div
                          className={
                            msg.from === userId
                              ? styles.messageSent
                              : styles.messageReceived
                          }
                        >
                          <div className={styles.messageHeader}>
                            <span className={styles.sender}>
                              {msg.from === userId ? "You" : msg.from}
                            </span>
                            <span className={styles.timestamp}>
                              {msg.timestamp}
                            </span>
                          </div>
                          {msg.text &&
                            msg.text.trim() !== "" &&
                            msg.text.trim().toUpperCase() !== "N/A" && (
                              <div className={styles.messageText}>
                                {msg.text}
                              </div>
                            )}
                          {msg.image && (
                            <div className={styles.imageContainer}>
                              <img
                                src={msg.image}
                                alt=""
                                className={styles.messageImage}
                              />
                            </div>
                          )}
                          {msg.file && (
                            <div className={styles.fileLink}>
                              <a
                                href={msg.file.dataUrl}
                                download={msg.file.fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                📎 {msg.file.fileName}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.messageSystem}>No messages yet.</div>
                  )
                ) : (
                  <div className={styles.messageSystem}>
                    Select user to show messages
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            <div className={styles.inputArea}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className={styles.messageInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />

                <input
                  type="file"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className={styles.hiddenFileInput}
                  id="fileInput"
                />
                <label htmlFor="fileInput" className={styles.attachButton}>
                  📎
                </label>
                <button
                  onClick={sendMessage}
                  className={styles.sendButton}
                  disabled={!toUserId || (!messageText && !imageFile)}
                >
                  ➤ Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
