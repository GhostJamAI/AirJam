"use client";
import { useEffect, useRef, useState } from "react";
import {
    drumMappings,
    initWebAudioFont,
    instrumentOptions,
} from "../../utils/utils";

type NoteRefData = {
    audioCtx: AudioContext | null;
    player: any | null;
    gainNode: GainNode | null;
    noteObj: any | null;
    startTime: number;
    timeoutId: ReturnType<typeof setTimeout> | null;
};

// The 8 melodic notes
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

export default function Instruments() {
    // Are we loaded yet?
    const [loaded, setLoaded] = useState(false);

    // The chosen instrument – "Drums" or a melodic instrument
    const [selectedInstrument, setSelectedInstrument] = useState(
        instrumentOptions[0]
    );
    const isDrums = selectedInstrument.label === "Drums";

    // Refs for 8 melodic notes
    const c4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const d4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const e4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const f4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const g4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const a4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const b4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const c5Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
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

    // Refs for drums
    const bassRef = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const snareRef = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const hihatRef = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const crashRef = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const tom1Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const tom2Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const tom3Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        gainNode: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
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

    // 1) Load either the melodic instrument or all drum scripts
    useEffect(() => {
        (async () => {
            setLoaded(false);
            try {
                if (isDrums) {
                    await initWebAudioFont(drumMappings);
                } else {
                    await initWebAudioFont([selectedInstrument]);
                }
                setLoaded(true);
            } catch (err) {
                console.error("Error loading scripts:", err);
            }
        })();
    }, [isDrums, selectedInstrument]);

    /**
     * Press => if leftover timer from old note => clear it, fade out old note immediately
     * Then create new context/player/gain and queue indefinite note
     */
    async function handleNoteDown(
        refData: NoteRefData,
        midi: number,
        globalVar: string
    ) {
        // 1) kill leftover timer
        if (refData.timeoutId) {
            clearTimeout(refData.timeoutId);
            refData.timeoutId = null;
        }

        // 2) fade out old note if it’s still playing
        if (refData.noteObj) {
            fadeOutAndClose(refData, 0.25); // quickly stop old note
        }

        // 3) Create new AudioContext
        const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        refData.audioCtx = ctx;

        // 4) Create new player
        const WAFPlayer = (window as any).WebAudioFontPlayer;
        if (!WAFPlayer) return;
        const player = new WAFPlayer();
        refData.player = player;

        // 5) Decode either the drum globalVar or melodic instrument
        if (isDrums && globalVar) {
            player.loader.decodeAfterLoading(ctx, globalVar);
        } else {
            player.loader.decodeAfterLoading(ctx, selectedInstrument.globalVar);
        }

        // 6) custom GainNode
        const gainNode = ctx.createGain();
        gainNode.gain.value = 1;
        gainNode.connect(ctx.destination);
        refData.gainNode = gainNode;

        // 7) queue indefinite note
        const now = ctx.currentTime;
        let instrumentData: any;
        if (isDrums && globalVar) {
            // for drums
            instrumentData = (window as any)[globalVar];
        } else {
            // melodic
            instrumentData =
                (window as any)[selectedInstrument.globalVar] || null;
        }
        if (!instrumentData) {
            console.warn(
                "No instrumentData found for",
                globalVar || selectedInstrument.globalVar
            );
            return;
        }

        const noteObj = player.queueWaveTable(
            ctx,
            gainNode,
            instrumentData,
            now,
            midi,
            9999 // indefinite
        );
        refData.noteObj = noteObj;
        refData.startTime = now;
    }

    /**
     * Release => if hold >=1s => fade out now, else schedule leftover time
     */
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

    /**
     * fadeOutAndClose => ramp the gain to 0 over fadeSec, stop the source, close context
     */
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

    const dataRefs = isDrums ? drumRefs : melodyRefs;

    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>
                Drums + Melody in Single Dropdown, 1s min & 0.25s fade, old
                leftover timer is reset on re-press
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
                            setSelectedInstrument(chosen);
                        }
                    }}
                    value={selectedInstrument.label}
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
                        Clicking the same note again clears the old leftover
                        timer and starts a new note from scratch, so the old 1s
                        timer can't kill the new note.
                    </p>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                        }}
                    >
                        {dataRefs.map((item) => (
                            <button
                                key={item.midi}
                                onMouseDown={() =>
                                    handleNoteDown(
                                        item.ref.current,
                                        item.midi,
                                        isDrums ? item.globalVar || "" : ""
                                    )
                                }
                                onMouseUp={() => handleNoteUp(item.ref.current)}
                                onTouchStart={() =>
                                    handleNoteDown(
                                        item.ref.current,
                                        item.midi,
                                        isDrums ? item.globalVar || "" : ""
                                    )
                                }
                                onTouchEnd={() =>
                                    handleNoteUp(item.ref.current)
                                }
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
