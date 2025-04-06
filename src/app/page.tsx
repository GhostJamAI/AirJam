"use client";
import { useRef, useState } from "react";
import Instruments from "./components/Instruments";
import Webcam from "./components/Webcam";
import { ImgData, WebsocketFrame } from "./types/WebsocketTypes";

import {
    instrumentOptions,
} from "../utils/utils";

export default function Home() {
    const ws = useRef<WebSocket | null>(null);
    const [imgData, setImgData] = useState<ImgData>({
        data: "",
        cols: [],
        time: 0,
    });

    const [selectedInstrument, setSelectedInstrument] = useState(0);

    const connectWebSocket = () => {
        ws.current = new WebSocket("ws://localhost:8000/ws");

        ws.current.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.current.onmessage = (event) => {
            const res: WebsocketFrame = JSON.parse(event.data);

            setImgData({ data: res.data, cols: res.cols, time: Date.now() });
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
        <div className="h-[100vh] w-[100vw] bg-[#222c4a] text-white">
            <div className="p-4 font-bold text-center">GhostJam</div>
            <div className="flex flex-row px-4">
                <Webcam
                    ws={ws.current}
                    imgData={imgData}
                    sendImage={sendImage}
                    setInst={setSelectedInstrument} 
                    instI={selectedInstrument}
                />
                <Instruments setInst={setSelectedInstrument} instI={selectedInstrument ?? 0} imgData={imgData} />
            </div>
        </div>
    );
}
