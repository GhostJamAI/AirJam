"use client";
import { useEffect, useRef, useState } from "react";
type WebcamProps = {
    ws: WebSocket | null;
    sendImage: (v: string) => void;
};
export default function Webcam({ ws, sendImage }: WebcamProps) {
    const wcRef = useRef<HTMLVideoElement>(null);
    const cvRef = useRef<HTMLCanvasElement>(null);

    const [streaming, setStreaming] = useState(false);
    const [frameTimeout, setFrameTimeout] = useState<NodeJS.Timeout>();
    const [flip, setFlip] = useState(false);

    let w = 320;
    let h = 180;
    useEffect(() => {
        const enableStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { advanced: [{ aspectRatio: { exact: 16 / 9 } }] },
                });

                if (wcRef.current) {
                    wcRef.current.srcObject = stream;
                    setStreaming(true);
                }
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        enableStream();
    }, [wcRef]); // Empty array ensures it runs once on mount

    useEffect(() => {
        if (streaming) setFlip(!flip);
    }, [streaming]);

    useEffect(() => {
        if (streaming) {
            takePicture();
            setTimeout(() => setFlip(!flip), 100);
        }
    }, [flip]);

    function takePicture() {
        const cv = cvRef?.current;
        const context = cv?.getContext("2d");
        if (cv && context && wcRef.current) {
            cv.width = w;
            cv.height = h;
            context.drawImage(wcRef.current, 0, 0, w, h);

            const frame = cv.toDataURL("image/png");

            sendImage(frame);

            console.log(frame);
        }
    }

    return (
        <div>
            <video
                ref={wcRef}
                autoPlay
                playsInline
                className="w-full border max-w-lg m-4 rounded shadow -scale-x-[100%]"
            />
            <canvas ref={cvRef} className="hidden" />
            <button onClick={takePicture}>Take Frame</button>
        </div>
    );
}
