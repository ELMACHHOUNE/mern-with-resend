import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function useSocket(onNewEmail) {
  const socketRef = useRef(null);
  const callbackRef = useRef(onNewEmail);

  callbackRef.current = onNewEmail;

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("new_email", (data) => {
      callbackRef.current?.(data);
    });

    socketRef.current = socket;

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, []);

  return socketRef;
}
