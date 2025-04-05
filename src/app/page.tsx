"use client";
import { useRef } from "react";
import Instruments from "./components/Instruments";
import Webcam from "./components/Webcam";


export default function Home() {
    const ws = useRef<WebSocket | null>(null);

    const connectWebSocket = () => {
        ws.current = new WebSocket("ws://localhost:8000/ws");

        ws.current.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.current.onmessage = (event) => {};

        ws.current.onerror = (err) => {
            console.error("WebSocket error:", err);
        };
    };

    const sendImage = async (base64: string) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            connectWebSocket();
            await new Promise((res) => setTimeout(res, 500));
        }

        // Optional: Send as JSON with filename
        const payload = JSON.stringify({
            data: base64,
        });

        ws.current!.send(payload);
    };

    return (
        <div className="h-[100vh] w-[100vw] bg-white text-black">
            <div className="p-1 font-bold">GhostJam</div>
            <Webcam />
            <Instruments />
        </div>
    );
}
