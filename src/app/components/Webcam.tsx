"use client";
import { useEffect, useRef, useState } from "react";
type WebcamProps = {
    ws: WebSocket | null
    imgData: {data: string, time: number}
    sendImage: (v: string) => void
}
export default function Webcam({ws, imgData, sendImage}:WebcamProps) {
    const wcRef = useRef<HTMLVideoElement>(null);
    const cvRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null)

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

    useEffect(()=>{
        if(ws?.readyState != ws?.OPEN) return
        
        if(imgRef.current) imgRef.current.src = imgData.data
        takePicture()
    },[imgData.time, ws?.readyState])

    function takePicture() {
        const cv = cvRef?.current;
        const context = cv?.getContext("2d");
        if (cv && context && wcRef.current) {
            cv.width = w;
            cv.height = h;
            context.drawImage(wcRef.current, 0, 0, w, h);

            const frame = cv.toDataURL("image/png");

            sendImage(frame);
        }
    }

    return (
        <div>
            <video
                ref={wcRef}
                autoPlay
                playsInline
                className="hidden"
            />
            <canvas ref={cvRef} className="hidden -scale-x-[100%]" />
            <img ref={imgRef} className="-scale-x-[100%] m-2 border-2 border-amber-500 w-[50vw]"/>
        </div>
    );
}
