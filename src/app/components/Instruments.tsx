"use client";
import { useEffect, useRef, useState } from "react";
import {
    drumMappings,
    initWebAudioFont,
    instrumentOptions,
} from "../../utils/utils";

export default function Instruments() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const playerRef = useRef<any | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [tab, setTab] = useState<"melody" | "drums">("melody");
    const [selectedInstrument, setSelectedInstrument] = useState(
        instrumentOptions[0]
    );
    const currentNoteRef = useRef<any | null>(null); // actual sound object, not just midi

    const activeBank = tab === "melody" ? [selectedInstrument] : drumMappings;

    useEffect(() => {
        async function init() {
            try {
                await initWebAudioFont(activeBank);
                setLoaded(true);
            } catch (err) {
                console.error("Error loading WebAudioFont scripts:", err);
            }
        }
        setLoaded(false); // reset loading on tab change
        init();
    }, [tab, selectedInstrument]);

    useEffect(() => {
        if (!loaded) return;

        const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();

        if (window.WebAudioFontPlayer) {
            playerRef.current = new window.WebAudioFontPlayer();
            for (const instrument of activeBank) {
                playerRef.current.loader.decodeAfterLoading(
                    audioContextRef.current,
                    instrument.globalVar
                );
            }
        }

        return () => {
            audioContextRef.current?.close?.();
        };
    }, [loaded, activeBank]);

    const playNote = (midi: number, globalVar: string) => {
        const ctx = audioContextRef.current;
        const player = playerRef.current;
        const instrument = (window as any)[globalVar];
        if (ctx && player && instrument) {
            const now = ctx.currentTime;
            const note = player.queueWaveTable(
                ctx,
                ctx.destination,
                instrument,
                now,
                midi,
                9999
            );
            currentNoteRef.current = note;
        }
    };

    const stopNote = () => {
        const ctx = audioContextRef.current;
        if (ctx && currentNoteRef.current?.stop) {
            currentNoteRef.current.stop(ctx.currentTime);
            currentNoteRef.current = null;
        }
    };

    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1 style={{ fontSize: "1.75rem" }}>🎛️ Instrument Playground</h1>

            <div style={{ marginBottom: "1rem" }}>
                <button
                    onClick={() => setTab("melody")}
                    style={{
                        padding: "0.5rem 1rem",
                        marginRight: "1rem",
                        fontWeight: tab === "melody" ? "bold" : "normal",
                    }}
                >
                    🎹 Instruments
                </button>
                <button
                    onClick={() => setTab("drums")}
                    style={{
                        padding: "0.5rem 1rem",
                        fontWeight: tab === "drums" ? "bold" : "normal",
                    }}
                >
                    🥁 Drums
                </button>
            </div>

            {tab === "melody" && (
                <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor="instrument-select">
                        🎵 Select Instrument:
                    </label>
                    <select
                        id="instrument-select"
                        onChange={(e) => {
                            const selected = instrumentOptions.find(
                                (i) => i.label === e.target.value
                            );
                            if (selected) {
                                setSelectedInstrument(selected);
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
            )}

            {!loaded && <p>Loading sounds...</p>}

            {loaded && (
                <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                    {tab === "melody"
                        ? [
                              { label: "C4", midi: 60 },
                              { label: "D4", midi: 62 },
                              { label: "E4", midi: 64 },
                              { label: "F4", midi: 65 },
                              { label: "G4", midi: 67 },
                              { label: "A4", midi: 69 },
                              { label: "B4", midi: 71 },
                              { label: "C5", midi: 72 },
                          ].map((note) => (
                              <button
                                  key={note.midi}
                                  onMouseDown={() =>
                                      playNote(
                                          note.midi,
                                          selectedInstrument.globalVar
                                      )
                                  }
                                  onMouseUp={stopNote}
                                  onMouseLeave={stopNote}
                                  onTouchStart={() =>
                                      playNote(
                                          note.midi,
                                          selectedInstrument.globalVar
                                      )
                                  }
                                  onTouchEnd={stopNote}
                                  style={buttonStyle}
                              >
                                  {note.label}
                              </button>
                          ))
                        : drumMappings.map((drum) => (
                              <button
                                  key={drum.midi}
                                  onMouseDown={() =>
                                      playNote(drum.midi, drum.globalVar)
                                  }
                                  onMouseUp={stopNote}
                                  onMouseLeave={stopNote}
                                  onTouchStart={() =>
                                      playNote(drum.midi, drum.globalVar)
                                  }
                                  onTouchEnd={stopNote}
                                  style={buttonStyle}
                              >
                                  {drum.label}
                              </button>
                          ))}
                </div>
            )}
        </main>
    );
}

const buttonStyle: React.CSSProperties = {
    padding: "1rem",
    border: "1px solid #333",
    borderRadius: "8px",
    backgroundColor: "#f0f0f0",
    cursor: "pointer",
    fontWeight: "bold",
    minWidth: "3rem",
};
