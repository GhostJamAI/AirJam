"use client";
import { useRef, useState } from "react";
import Instruments from "./components/Instruments";
import Webcam from "./components/Webcam";
import { WebsocketFrame } from "./types/WebsocketTypes";

export default function Home() {
    const ws = useRef<WebSocket | null>(null);
    const [imageStr, setImageStr] = useState("")
    const [frameC, setFrameC] = useState(0)

    const connectWebSocket = () => {
        ws.current = new WebSocket("ws://localhost:8000/ws");

        ws.current.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.current.onmessage = (event) => {
            const res:WebsocketFrame = JSON.parse(event.data)

            setImageStr(res.data)
            setFrameC(Date.now())
        };

        ws.current.onerror = (err) => {
            console.error("WebSocket error:", err);
        };
    };

    const sendImage = async (base64: string) => {
        if (!ws.current) {
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
            <div className="p-4 font-bold">GhostJam</div>
            <div className="flex flex-row">
                <Instruments />
                <Webcam recTime={frameC} imageStr={imageStr} ws={ws.current} sendImage={sendImage} />
            </div>
            
        </div>
    );
}
