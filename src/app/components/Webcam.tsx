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

    const wcWidth = 50

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

    const indToDrum = [
        "Bass",
        "Snare",
        "Hi-Hat",
        "Crash",
        "Tom 1",
        "Tom 2",
        "Tom 3"
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
                <div className="relative w-[75vw] mx-auto">
                    <img
                        ref={imgRef}
                        className="-scale-x-[100%] w-full border-2 border-black rounded-xl"
                    />
                    <div className="absolute flex p-1 flex-row top-0 w-full text-white h-[24vw]">
                        <div className={`h-full w-[7.5vw] rounded-tl-xl ${!imgData.cols[9] ? "" : imgData.cols[9].col >= 1 ? "bg-[#50adff75]" : "bg-[#e1c7c775]"}`}>
                            Left
                        </div>
                        <div className={`flex h-[7.5vw] w-[60vw] ${!imgData.cols[8] ? "" : imgData.cols[8].col >= 1 ? "bg-[#50adff75]" : "bg-[#e1c7c775]"}`}>
                            <div className="text-center my-auto font-bold text-3xl w-full">
                                {`${instrumentOptions[instI].label} (${instI+1} / ${instrumentOptions.length})`}
                            </div>
                        </div>
                        <div className={`h-full w-[7.5vw] rounded-tr-xl ${!imgData.cols[10] ? "" : imgData.cols[10].col >= 1 ? "bg-[#50adff75]" : "bg-[#e1c7c775]"}`}>
                            Right
                        </div>
                    </div>
                    <div className={`absolute bottom-0 grid pr-[1.2vw] gap-[1vw] grid-cols-8 h-[9vw] w-full`}>
                        {
                            imgData.cols.map((v, i)=>{
                                if(i < (instrumentOptions[instI].label == "Drums" ? 7 : 8))
                                    return(
                                    <div className={`text-white flex text-center rounded-xl m-1
                                        ${v.col >= 2 ? "bg-[#50ffbfb3]" : v.col == 1 ? "bg-[#50fff975]" : "bg-[#e1c7c775]"}`}>
                                        <div className="my-auto w-full">
                                            {instrumentOptions[instI].label == "Drums" ? indToDrum[i] : indToNote[i]}
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
