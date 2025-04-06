/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef } from "react";
import { ImgData } from "../types/WebsocketTypes";
type WebcamProps = {
    ws: WebSocket | null;
    imgData: ImgData;
    sendImage: (v: string) => void;
};
export default function Webcam({ ws, imgData, sendImage }: WebcamProps) {
    const wcRef = useRef<HTMLVideoElement>(null);
    const cvRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const w = 320;
    const h = 180;
    useEffect(() => {
        const enableStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { advanced: [{ aspectRatio: { exact: 16 / 9 } }] },
                });

                if (wcRef.current) {
                    wcRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        enableStream();
    }, [wcRef]); // Empty array ensures it runs once on mount

    useEffect(() => {
        if (ws?.readyState != ws?.OPEN) return;

        if (imgRef.current) imgRef.current.src = imgData.data;
        takePicture();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imgData.time, ws?.readyState]);

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
            <video ref={wcRef} autoPlay playsInline className="hidden" />
            <canvas ref={cvRef} className="hidden -scale-x-[100%]" />
            <img
                ref={imgRef}
                className="-scale-x-[100%] m-2 border-2 border-amber-500 w-[50vw]"
            />
            <div>
                {imgData.cols.map((v)=>{
                    return<div>{`${v.name}, col: ${v.col}`}</div>
                })}
            </div>
        </div>
    );
}
