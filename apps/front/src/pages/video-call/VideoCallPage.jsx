import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { useParams, useNavigate, Link } from "react-router-dom";

import AgoraRTC from "agora-rtc-sdk-ng";
import axiosInstance from "../../api/axios";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export default function VideoCall() {
  const { id } = useParams();
  const navigate = useNavigate();
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const tracksRef = useRef([]);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [joined, setJoined] = useState(false);
  const [remoteUserCount, setRemoteUserCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let localTracks = [];
    let cancelled = false;

    const joinCall = async () => {
      try {
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video") user.videoTrack.play(remoteRef.current, { fit: "cover" });
          if (mediaType === "audio") user.audioTrack.play();
        });
        client.on("user-joined", () => setRemoteUserCount(c => c + 1));
        client.on("user-left", () => setRemoteUserCount(c => Math.max(0, c - 1)));

        const tokenRes = await axiosInstance.post('/agora/token', {
          channelName: id,
        });
        const { token, appId } = tokenRes.data.data;
        await client.join(appId, id, token, null);
        const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const camTrack = await AgoraRTC.createCameraVideoTrack();
        localTracks = [micTrack, camTrack];
        tracksRef.current = localTracks;
        camTrack.play(localRef.current, { fit: "cover" });
        await client.publish(localTracks);

        if (cancelled) return;

        await axiosInstance.patch(`/appointments/${id}/status`, {
          status: "in-progress",
        });
        setJoined(true);
      } catch (err) {
        console.error("Failed to join call:", err);
      }
    };

    joinCall();

    return () => {
      cancelled = true;
      localTracks.forEach(t => { t.stop(); t.close(); });
      client.leave();
    };
  }, [id]);

  const toggleMic = () => {
    const mic = tracksRef.current[0];
    if (!mic) return;
    micOn ? mic.setMuted(true) : mic.setMuted(false);
    setMicOn(p => !p);
  };

  const toggleCam = () => {
    const cam = tracksRef.current[1];
    if (!cam) return;
    camOn ? cam.setMuted(true) : cam.setMuted(false);
    setCamOn(p => !p);
  };

  const endCall = async () => {
    tracksRef.current.forEach(t => { t.stop(); t.close(); });
    await client.leave();
    try {
      await axiosInstance.patch(`/appointments/${id}/status`, {
        status: "completed",
      });
    } catch (_) {}
    navigate("/");
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const btnSx = (active = true) => ({
    width: 48, height: 48,
    background: active ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.2)",
    color: active ? "#fff" : "#ef4444",
    "&:hover": { background: active ? "rgba(255,255,255,0.18)" : "rgba(239,68,68,0.3)" },
    transition: "all 0.15s",
  });

  return (
    <Box sx={{ minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column" }}>
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, py: 1.5,
        borderBottom: "0.5px solid rgba(13,148,136,0.25)",
        background: "rgba(15,23,42,0.85)",
      }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Typography sx={{
            fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 18,
            color: "#0d9488",
          }}>Teryaq</Typography>
        </Link>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{
            width: 7, height: 7, borderRadius: "50%",
            background: joined ? "#22C55E" : "#F59E0B",
            boxShadow: joined ? "0 0 6px #22C55E" : "0 0 6px #F59E0B",
          }} />
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
            {joined ? 'Connected' : 'Connecting...'}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
          {formatTime(elapsed)}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, p: 1.5 }}>
        <Box ref={localRef} sx={{
          background: "#1e293b", borderRadius: 3,
          border: "0.5px solid rgba(13,148,136,0.5)",
          minHeight: 300, position: "relative", overflow: "hidden",
        }} />
        <Box ref={remoteRef} sx={{
          background: "#1e293b", borderRadius: 3,
          border: "0.5px solid rgba(13,148,136,0.2)",
          minHeight: 300, position: "relative", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {remoteUserCount === 0 && (
            <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
              Waiting for doctor...
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 2,
        py: 2.5, background: "rgba(15,23,42,0.9)",
        borderTop: "0.5px solid rgba(13,148,136,0.2)",
      }}>
        <Tooltip title={micOn ? 'Mute' : 'Unmute'}>
          <IconButton onClick={toggleMic} sx={btnSx(micOn)}>
            {micOn ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}>
          <IconButton onClick={toggleCam} sx={btnSx(camOn)}>
            {camOn ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={'End Call'}>
          <IconButton onClick={endCall} sx={{
            width: 56, height: 56, background: "#ef4444", color: "#fff",
            "&:hover": { background: "#dc2626" },
          }}>
            <CallEndIcon />
          </IconButton>
        </Tooltip>

      </Box>
    </Box>
  );
}
