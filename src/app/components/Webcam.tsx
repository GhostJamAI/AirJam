/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";
import { ImgData } from "../types/WebsocketTypes";
import { instrumentOptions,  } from "@/utils/utils";
type WebcamProps = {
    ws: WebSocket | null;
    imgData: ImgData;
    sendImage: (v: string) => void;
    setInst: any;
    instI: number
};
export default function Webcam({ ws, imgData, sendImage, setInst, instI }: WebcamProps) {
    const wcRef = useRef<HTMLVideoElement>(null);
    const cvRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const [lbState, setLbState] = useState(false)
    const [rbState, setRbState] = useState(false)

    const indToNote = [
        "C4",
        "D4",
        "E4",
        "F4",
        "G4",
        "A4",
        "B4",
        "C5"
    ]

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

    useEffect(()=>{
        for(let i = 8; i < imgData.cols.length; i++)
        {
            let col = imgData.cols[i].col
            
            switch(i)
            {
                case 9:
                    setLbState(col > 0)
                    break;
                case 10:
                    setRbState(col > 0)
                    break;
            }
            
        }
    },[imgData.cols])

    useEffect(()=>{
        if(lbState)
            setInst(instI - 1 < 0 ? instrumentOptions.length-1 : instI-1)
    },[lbState])

    useEffect(()=>{
        if(rbState)
            setInst(instI + 1 >= instrumentOptions.length ? 0 : instI + 1)
    },[rbState])

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
            <div className="flex flex-row">
                <div className="relative w-[50vw] m-2 border">
                    <img
                        ref={imgRef}
                        className="-scale-x-[100%] w-full"
                    />
                    <div className="absolute flex flex-row top-0 w-full text-white h-[16vw]">
                        <div className={`border-2 border-white h-full w-[5vw] ${!imgData.cols[9] ? "" : imgData.cols[9].col >= 1 ? "bg-[#50adff75]" : "bg-[#e1c7c775]"}`}>
                            Left
                        </div>
                        <div className={`border-2 border-white h-[5vw] w-[40vw] ${!imgData.cols[8] ? "" : imgData.cols[8].col >= 1 ? "bg-[#50adff75]" : "bg-[#e1c7c775]"}`}>
                            Top
                        </div>
                        <div className={`border-2 border-white h-full w-[5vw] ${!imgData.cols[10] ? "" : imgData.cols[10].col >= 1 ? "bg-[#50adff75]" : "bg-[#e1c7c775]"}`}>
                            Right
                        </div>
                    </div>
                    <div className="absolute bottom-0 grid pr-1 gap-[0.5vw] grid-cols-8 h-[6vw] w-full">
                        {
                            imgData.cols.map((v, i)=>{
                                if(i < 8)
                                    return(
                                    <div className={`text-white flex text-center border-2 
                                        ${v.col >= 2 ? "bg-[#ff505075]" : v.col == 1 ? "bg-[#50adff75]" : "bg-[#e1c7c775]"}`}>
                                        <div className="my-auto w-full">
                                            {indToNote[i]}
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div>
                    {imgData.cols.map((v)=>{
                        return<div>{`${v.name}, col: ${v.col}`}</div>
                    })}
                    <div>{instI}</div>
                </div>
            </div>
        </div>
    );
}
