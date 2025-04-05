/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import { initWebAudioFont, instrumentOptions } from "../../utils/utils";

type NoteRefData = {
    audioCtx: AudioContext | null;
    player: any | null;
    sourceNode: any | null;
    gainNode: GainNode | null;
    startTime: number;
    timeoutId: ReturnType<typeof setTimeout> | null;
    noteObj: any | null; // Added noteObj property
};

export default function Instruments() {
    const [loaded, setLoaded] = useState(false);
    const [selectedInstrument, setSelectedInstrument] = useState(
        instrumentOptions[0]
    );

    // Each of our 8 notes uses its own context/player
    const c4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        sourceNode: null,
        gainNode: null,
        startTime: 0,
        timeoutId: null,
        noteObj: null, // Added noteObj property
    });
    // ... similarly for D4, E4, ...
    const d4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        sourceNode: null,
        gainNode: null,
        startTime: 0,
        timeoutId: null,
        noteObj: null, // Added noteObj property
    });
    const e4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        sourceNode: null,
        gainNode: null,
        startTime: 0,
        timeoutId: null,
        noteObj: null, // Added noteObj property
    });
    const f4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        sourceNode: null,
        gainNode: null,
        startTime: 0,
        timeoutId: null,
        noteObj: null, // Added noteObj property
    });
    const g4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        sourceNode: null,
        gainNode: null,
        startTime: 0,
        timeoutId: null,
        noteObj: null, // Added noteObj property
    });
    const a4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        sourceNode: null,
        gainNode: null,
        startTime: 0,
        timeoutId: null,
        noteObj: null, // Added noteObj property
    });
    const b4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        sourceNode: null,
        gainNode: null,
        startTime: 0,
        timeoutId: null,
        noteObj: null, // Added noteObj property
    });
    const c5Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        sourceNode: null,
        gainNode: null,
        startTime: 0,
        timeoutId: null,
        noteObj: null, // Added noteObj property
    });

    const melodyData = [
        { label: "C4", midi: 60, ref: c4Ref },
        { label: "D4", midi: 62, ref: d4Ref },
        { label: "E4", midi: 64, ref: e4Ref },
        { label: "F4", midi: 65, ref: f4Ref },
        { label: "G4", midi: 67, ref: g4Ref },
        { label: "A4", midi: 69, ref: a4Ref },
        { label: "B4", midi: 71, ref: b4Ref },
        { label: "C5", midi: 72, ref: c5Ref },
    ];

    // 1) Load instrument script data
    useEffect(() => {
        (async () => {
            setLoaded(false);
            try {
                await initWebAudioFont([selectedInstrument]);
                setLoaded(true);
            } catch (err) {
                console.error("Error loading scripts:", err);
            }
        })();
    }, [selectedInstrument]);

    // 2) For each note, we create context/player on press, so no global context/player here.

    /**
     * Press =>
     *   - close old note if any
     *   - create context/player
     *   - create a GainNode
     *   - pass that gainNode as 'destination' to queueWaveTable
     *   - store the underlying AudioBufferSourceNode if we can
     */
    async function handleNoteDown(refData: NoteRefData, midi: number) {
        // Cancel leftover timer from old note
        if (refData.timeoutId) {
            clearTimeout(refData.timeoutId);
            refData.timeoutId = null;
        }
        // If old note is playing, fade or close it
        if (refData.sourceNode) {
            fadeOutAndClose(refData, 0.25);
        }

        // 1) Create new AudioContext
        const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        refData.audioCtx = ctx;

        // 2) New WebAudioFontPlayer
        const WAFPlayer = (window as any).WebAudioFontPlayer;
        if (!WAFPlayer) return;
        const player = new WAFPlayer();
        refData.player = player;

        // decode instrument
        player.loader.decodeAfterLoading(ctx, selectedInstrument.globalVar);

        // 3) Create a GainNode, set initial gain=1
        const gainNode = ctx.createGain();
        gainNode.gain.value = 1;
        gainNode.connect(ctx.destination);
        refData.gainNode = gainNode;

        // 4) queue indefinite note, but pass 'gainNode' as the "destination" param
        const now = ctx.currentTime;
        const instrumentData = (window as any)[selectedInstrument.globalVar];
        // 'queueWaveTable(audioContext, destination, instrument, now, midi, duration)'
        const noteObj = player.queueWaveTable(
            ctx,
            gainNode, // our custom gain node
            instrumentData,
            now,
            midi,
            9999
        );
        refData.noteObj = noteObj;
        refData.startTime = now;

        // If we need to track the actual AudioBufferSourceNode for a partial fade:
        // noteObj might have waveSources[0].source. But let's see if we can do the fade purely on 'gainNode'
        // We'll do the fade on 'gainNode' itself in fadeOutAndClose.
    }

    /**
     * On release => if hold >=1s => fade, else schedule leftover
     */
    function handleNoteUp(refData: NoteRefData) {
        if (!refData.audioCtx || !refData.player || !refData.noteObj) return;

        const now = refData.audioCtx.currentTime;
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
     * Fade out the gain node over fadeSec, then stop the source, close context
     */
    function fadeOutAndClose(refData: NoteRefData, fadeSec: number) {
        const ctx = refData.audioCtx;
        if (!ctx) return;

        const now = ctx.currentTime;

        // If we have a custom gain node, we can do a fade
        if (refData.gainNode) {
            const g = refData.gainNode.gain;
            g.cancelScheduledValues(now);
            // ensure we start from current value
            const curVal = g.value;
            g.setValueAtTime(curVal, now);
            g.linearRampToValueAtTime(0, now + fadeSec);
        }

        // Also schedule stopping the indefinite source at (now + fadeSec).
        // Typically noteObj might have waveSources, but if not,
        // we do 'cancelQueue' or something else. We'll try to rely on waveSources fallback:
        if (refData.noteObj?.waveSources) {
            for (const waveSrc of refData.noteObj.waveSources) {
                const src = waveSrc?.source;
                if (src) {
                    src.stop(now + fadeSec);
                }
            }
        } else if (typeof refData.noteObj?.stop === "function") {
            refData.noteObj.stop(now + fadeSec);
        } else if (typeof refData.player?.cancelQueue === "function") {
            // fallback
            setTimeout(() => {
                refData.player.cancelQueue(ctx);
            }, fadeSec * 1000);
        }

        // After fadeSec, clean up
        setTimeout(() => {
            refData.noteObj = null;
            refData.player = null;
            if (refData.audioCtx) {
                refData.audioCtx.close();
                refData.audioCtx = null;
            }
        }, fadeSec * 1000);
    }

    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Fade with Custom GainNode (Min 1s / indefinite hold)</h1>

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

            {!loaded && <p>Loading instrument data…</p>}

            {loaded && (
                <>
                    <p>
                        Now we pass a custom GainNode to queueWaveTable, letting
                        us fade out as we please, even for indefinite notes.
                    </p>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                        }}
                    >
                        {melodyData.map((item) => (
                            <button
                                key={item.midi}
                                onMouseDown={() =>
                                    handleNoteDown(item.ref.current, item.midi)
                                }
                                onMouseUp={() => handleNoteUp(item.ref.current)}
                                onTouchStart={() =>
                                    handleNoteDown(item.ref.current, item.midi)
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
