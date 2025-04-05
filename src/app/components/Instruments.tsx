"use client";
import { useEffect, useRef, useState } from "react";
import { initWebAudioFont, instrumentOptions } from "../../utils/utils";

type NoteRefData = {
    audioCtx: AudioContext | null;
    player: any | null;
    noteObj: any | null;
    startTime: number;
    timeoutId: ReturnType<typeof setTimeout> | null;
};

export default function Instruments() {
    const [loaded, setLoaded] = useState(false);
    const [selectedInstrument, setSelectedInstrument] = useState(
        instrumentOptions[0]
    );

    /**
     * A separate ref for each of the 8 notes: each store their own
     * AudioContext, WebAudioFontPlayer, indefinite note, startTime, etc.
     */
    const c4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const d4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const e4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const f4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const g4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const a4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const b4Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });
    const c5Ref = useRef<NoteRefData>({
        audioCtx: null,
        player: null,
        noteObj: null,
        startTime: 0,
        timeoutId: null,
    });

    // The 8 notes
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

    /**
     * 1) Load the base scripts for the chosen instrument (just the .js data),
     *    but we do NOT create a global AudioContext or player. We only do decoding inside each note on press.
     */
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

    // No shared audioContext/player. Each note will do its own context/player on press.

    /**
     * On press:
     * - Clear existing note/timeouts
     * - Create a fresh AudioContext + Player
     * - decodeAfterLoading for the selectedInstrument’s globalVar
     * - queueWaveTable(..., 9999) indefinite
     * - store them all in ref
     */
    async function handleNoteDown(refData: NoteRefData, midi: number) {
        // If there's an existing note, forcibly stop
        if (refData.timeoutId) {
            clearTimeout(refData.timeoutId);
            refData.timeoutId = null;
        }
        if (refData.noteObj) {
            stopAndClose(refData);
        }

        // Create a brand-new AudioContext
        const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
        refData.audioCtx = new AudioContextClass();

        // Create a brand-new player
        const WebAudioFontPlayer = (window as any).WebAudioFontPlayer;
        if (!WebAudioFontPlayer) return; // script not loaded
        refData.player = new WebAudioFontPlayer();

        // decodeAfterLoading for the instrument
        // Because we loaded the script data in initWebAudioFont, the global var is in window
        refData.player.loader.decodeAfterLoading(
            refData.audioCtx,
            selectedInstrument.globalVar
        );

        // Start indefinite note
        const now = refData.audioCtx.currentTime;
        const instrumentData = (window as any)[selectedInstrument.globalVar];
        refData.noteObj = refData.player.queueWaveTable(
            refData.audioCtx,
            refData.audioCtx.destination,
            instrumentData,
            now,
            midi,
            9999
        );
        refData.startTime = now;
    }

    /**
     * On release:
     * If held >=1s => stop immediately
     * Else schedule leftover time to reach 1s
     */
    function handleNoteUp(refData: NoteRefData) {
        if (!refData.audioCtx || !refData.player || !refData.noteObj) return;

        const now = refData.audioCtx.currentTime;
        const hold = now - refData.startTime;

        if (hold >= 1) {
            stopAndClose(refData);
        } else {
            const remain = 1 - hold;
            const tid = setTimeout(() => {
                // If still the same note, stop
                if (refData.noteObj) {
                    stopAndClose(refData);
                }
                refData.timeoutId = null;
            }, remain * 1000);
            refData.timeoutId = tid;
        }
    }

    /**
     * Stop the indefinite note, then close that AudioContext, so it won't interfere with others
     */
    function stopAndClose(refData: NoteRefData) {
        if (!refData.noteObj || !refData.audioCtx || !refData.player) return;

        const ctx = refData.audioCtx;
        const noteObj = refData.noteObj;
        const now = ctx.currentTime;

        // Attempt waveSources stop
        if (noteObj.waveSources && Array.isArray(noteObj.waveSources)) {
            for (const waveSrc of noteObj.waveSources) {
                if (waveSrc?.source) {
                    waveSrc.source.stop(now);
                }
            }
        } else if (typeof noteObj.stop === "function") {
            // fallback
            noteObj.stop(now);
        } else if (typeof refData.player.cancelQueue === "function") {
            // last fallback
            refData.player.cancelQueue(ctx);
        }

        // Clear references
        refData.noteObj = null;
        refData.player = null;

        // Actually close the AudioContext
        refData.audioCtx.close();
        refData.audioCtx = null;
    }

    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>8-Note (Min 1s / indefinite) - Each with separate Player</h1>

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
                        Each note uses its own player & AudioContext, so
                        stopping one note won't stop another.
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
