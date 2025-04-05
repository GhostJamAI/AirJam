"use client";
import { useEffect, useRef, useState } from "react";

export default function Webcam() {
    const wcRef = useRef<HTMLVideoElement>(null);
    const cvRef = useRef<HTMLCanvasElement>(null);

    const [streaming, setStreaming] = useState(false)
    const [frameTimeout, setFrameTimeout] = useState<NodeJS.Timeout>()

    useEffect(() => {
        const enableStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                if (wcRef.current) {
                    wcRef.current.srcObject = stream;
                    setStreaming(true)
                }
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        enableStream();
    }, [wcRef]); // Empty array ensures it runs once on mount

    useEffect(()=>{
        if(streaming)
        {
            setFrameTimeout(setInterval(takePicture, ))
        }
    },[streaming])

    function takePicture() {
        const cv = cvRef?.current;
        const context = cv?.getContext("2d");
        console.log(context);
        if (cv && context && wcRef.current) {
            cv.width = 1280;
            cv.height = 720;
            context.drawImage(wcRef.current, 0, 0, 1280, 720);

            const data = cv.toDataURL("image/png");
            console.log(data);
        }
    }

    return (
        <div>
            <video
                ref={wcRef}
                autoPlay
                playsInline
                className="w-full border max-w-lg rounded shadow -scale-x-[100%]"
            />
            <canvas ref={cvRef} className="w-[1280px] h-[720px]" />
            <button onClick={takePicture}>Take Frame</button>
        </div>
    );
}
