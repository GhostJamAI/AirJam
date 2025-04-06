"use client";
import { useEffect, useRef, useState } from "react";
import {
    drumMappings,
    initWebAudioFont,
    instrumentOptions,
} from "../../utils/utils";
import { ImgData } from "../types/WebsocketTypes";

// For each note/drum, we store enough state to handle indefinite notes.
type NoteRefData = {
    audioCtx: AudioContext | null;
    player: any | null;
    gainNode: GainNode | null;
    noteObj: any | null;
    startTime: number;
    timeoutId: ReturnType<typeof setTimeout> | null;
    colState: 0 | 1; // <-- Track whether this note is currently "pressed" (1) or "released" (0)
};

// Melodic notes for indices 0..7
const melodyData = [
    { label: "C4", midi: 60 },
    { label: "D4", midi: 62 },
    { label: "E4", midi: 64 },
    { label: "F4", midi: 65 },
    { label: "G4", midi: 67 },
    { label: "A4", midi: 69 },
    { label: "B4", midi: 71 },
    { label: "C5", midi: 72 },
];

export default function Instruments({
    imgData,
    setInst,
    instI,
}: {
    imgData: ImgData;
    setInst: any;
    instI: number;
}) {
    const [loaded, setLoaded] = useState(false);
    const [isDrums, setIsDrums] = useState(false);
    const instrument = instrumentOptions[instI];

    useEffect(() => {
        if (instrument != undefined) setIsDrums(instrument.label === "Drums");
    }, [instrument]);

    // --- Refs for melody (with colState=0 initially) ---
    const c4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });
    const d4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });
    const e4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });
    const f4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });
    const g4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });
    const a4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });
    const b4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });
    const c5Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });

    const melodyRefs = [
        { ...melodyData[0], ref: c4Ref },
        { ...melodyData[1], ref: d4Ref },
        { ...melodyData[2], ref: e4Ref },
        { ...melodyData[3], ref: f4Ref },
        { ...melodyData[4], ref: g4Ref },
        { ...melodyData[5], ref: a4Ref },
        { ...melodyData[6], ref: b4Ref },
        { ...melodyData[7], ref: c5Ref },
    ];

    // --- Refs for drums (indices 0..6) ---
    const bassRef = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });
    const snareRef = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });
    const hihatRef = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });
    const crashRef = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });
    const tom1Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });
    const tom2Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });
    const tom3Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
        colState: 0,
    });

    const drumRefs = [
        { ...drumMappings[0], ref: bassRef },
        { ...drumMappings[1], ref: snareRef },
        { ...drumMappings[2], ref: hihatRef },
        { ...drumMappings[3], ref: crashRef },
        { ...drumMappings[4], ref: tom1Ref },
        { ...drumMappings[5], ref: tom2Ref },
        { ...drumMappings[6], ref: tom3Ref },
    ];

    // On mount or instrument changes, load scripts
    useEffect(() => {
        (async () => {
            setLoaded(false);
            try {
                if (isDrums) {
                    await initWebAudioFont(drumMappings);
                } else {
                    await initWebAudioFont([instrument]);
                }
                setLoaded(true);
            } catch (err) {
                console.error("Error loading scripts:", err);
            }
        })();
    }, [isDrums, instrument]);

    // Decide which group (drums or melody) to show
    const dataRefs = isDrums ? drumRefs : melodyRefs;

    // index => the ref
    function indexToRef(i: number) {
        if (isDrums) {
            if (i >= 0 && i < drumRefs.length) {
                return drumRefs[i].ref;
            }
            return null;
        } else {
            if (i >= 0 && i < melodyRefs.length) {
                return melodyRefs[i].ref;
            }
            return null;
        }
    }

    // Press logic
    async function handleNoteDown(
        refData: NoteRefData,
        midi: number,
        globalVar: string
    ) {
        // kill leftover timer
        if (refData.timeoutId) {
            clearTimeout(refData.timeoutId);
            refData.timeoutId = null;
        }
        // fade old
        if (refData.noteObj) {
            fadeOutAndClose(refData, 0.25);
        }

        // create context
        const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        refData.audioCtx = ctx;

        // create player
        const WAFPlayer = (window as any).WebAudioFontPlayer;
        if (!WAFPlayer) return;
        const player = new WAFPlayer();
        refData.player = player;

        // decode
        if (isDrums && instrument && globalVar) {
            player.loader.decodeAfterLoading(ctx, globalVar);
        } else {
            player.loader.decodeAfterLoading(ctx, instrument.globalVar);
        }

        // gain node
        const gainNode = ctx.createGain();
        gainNode.gain.value = 1;
        gainNode.connect(ctx.destination);
        refData.gainNode = gainNode;

        // indefinite
        const now = ctx.currentTime;
        let instrumentData: any;
        if (isDrums && globalVar) {
            instrumentData = (window as any)[globalVar];
        } else {
            instrumentData = (window as any)[instrument.globalVar] || null;
        }
        if (!instrumentData) {
            console.warn(
                "No instrumentData for",
                globalVar || instrument.globalVar
            );
            return;
        }

        refData.noteObj = player.queueWaveTable(
            ctx,
            gainNode,
            instrumentData,
            now,
            midi,
            9999
        );
        refData.startTime = now;
    }

    // Release logic
    function handleNoteUp(refData: NoteRefData) {
        if (!refData.audioCtx || !refData.player || !refData.noteObj) return;

        const ctx = refData.audioCtx;
        const now = ctx.currentTime;
        const hold = now - refData.startTime;

        if (hold >= 1) {
            fadeOutAndClose(refData, 0.25);
        } else {
            const remain = 1 - hold;
            const tid = setTimeout(() => {
                if (refData.noteObj) {
                    fadeOutAndClose(refData, 0.25);
                }
                refData.timeoutId = null;
            }, remain * 1000);
            refData.timeoutId = tid;
        }
    }

    // Fade out & close context
    function fadeOutAndClose(refData: NoteRefData, fadeSec: number) {
        const ctx = refData.audioCtx;
        if (!ctx) return;

        const now = ctx.currentTime;
        if (refData.gainNode) {
            const g = refData.gainNode.gain;
            g.cancelScheduledValues(now);
            g.setValueAtTime(g.value, now);
            g.linearRampToValueAtTime(0, now + fadeSec);
        }

        if (refData.noteObj?.waveSources) {
            for (const waveSrc of refData.noteObj.waveSources) {
                if (waveSrc?.source) {
                    waveSrc.source.stop(now + fadeSec);
                }
            }
        } else if (typeof refData.noteObj?.stop === "function") {
            refData.noteObj.stop(now + fadeSec);
        } else if (typeof refData.player?.cancelQueue === "function") {
            setTimeout(() => {
                refData.player?.cancelQueue(ctx);
            }, fadeSec * 1000);
        }

        setTimeout(() => {
            refData.noteObj = null;
            refData.player = null;
            if (refData.audioCtx) {
                refData.audioCtx.close();
                refData.audioCtx = null;
            }
        }, fadeSec * 1000);
    }

    // Only call handleNoteDown / handleNoteUp if the col changed from 0->1 or 1->0
    useEffect(() => {
        if (!imgData?.cols?.length) return;
        imgData.cols.forEach((col, i) => {
            const ref = indexToRef(i);
            if (!ref) return;

            const refData = ref.current;
            const oldVal = refData.colState;
            const newVal = col.col;

            if (oldVal !== newVal) {
                // state changed
                refData.colState = newVal; // update stored state
                if (newVal === 1) {
                    // Press
                    const midi = isDrums
                        ? drumMappings[i].midi
                        : melodyData[i].midi;
                    const gv = isDrums ? drumMappings[i].globalVar || "" : "";
                    handleNoteDown(refData, midi, gv);
                } else {
                    // Release
                    handleNoteUp(refData);
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imgData]);

    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>
                Prevent Spam: We track colState to avoid repeated Press calls
            </h1>

            <div style={{ marginBottom: "1rem" }}>
                <label
                    htmlFor="instrument-select"
                    style={{ marginRight: "0.5rem" }}
                >
                    🎵 Select Instrument:
                </label>
                <select
                    id="instrument-select"
                    onChange={(e) => {
                        const chosen = instrumentOptions.find(
                            (opt) => opt.label === e.target.value
                        );
                        if (chosen) {
                            setLoaded(false);
                            setInst(chosen);
                        }
                    }}
                    value={
                        instrument != undefined
                            ? instrument.label
                            : "Loading instrument.."
                    }
                >
                    {instrumentOptions.map((inst) => (
                        <option key={inst.label} value={inst.label}>
                            {inst.label}
                        </option>
                    ))}
                </select>
            </div>

            {!loaded && <p>Loading script data…</p>}

            {loaded && (
                <>
                    <p>
                        Each note indefinite with a min 1s hold. By tracking{" "}
                        <code>colState</code> in each ref, we ignore repeated
                        frames of <code>col=1</code>.
                    </p>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                        }}
                    >
                        {/* Buttons for manual testing */}
                        {(isDrums ? drumRefs : melodyRefs).map((item) => (
                            <button
                                key={item.midi}
                                onMouseDown={() => {
                                    const gv = isDrums
                                        ? item.globalVar || ""
                                        : "";
                                    handleNoteDown(
                                        item.ref.current,
                                        item.midi,
                                        gv
                                    );
                                    item.ref.current.colState = 1; // Manually set colState
                                }}
                                onMouseUp={() => {
                                    handleNoteUp(item.ref.current);
                                    item.ref.current.colState = 0; // reset colState
                                }}
                                onTouchStart={() => {
                                    const gv = isDrums
                                        ? item.globalVar || ""
                                        : "";
                                    handleNoteDown(
                                        item.ref.current,
                                        item.midi,
                                        gv
                                    );
                                    item.ref.current.colState = 1;
                                }}
                                onTouchEnd={() => {
                                    handleNoteUp(item.ref.current);
                                    item.ref.current.colState = 0;
                                }}
                                style={{
                                    padding: "1rem",
                                    minWidth: "3rem",
                                    fontSize: "1rem",
                                    fontWeight: "bold",
                                    borderRadius: "0.5rem",
                                    border: "2px solid #444",
                                    backgroundColor: "#f0f0f0",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}
