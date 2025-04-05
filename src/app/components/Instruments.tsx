"use client";
import { useEffect, useRef } from "react";
import { WebAudioFontPlayer } from "webaudiofont";

// Load one of the default instruments (Acoustic Grand Piano)
import _tone_0000_AcousticGrandPiano from "../public/soundfonts/0000_AcousticGrandPiano_sf2_file.js";

// Notes you want to support
const NOTES = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];

// Convert note name to MIDI number
const NOTE_TO_MIDI: Record<string, number> = {
    C4: 60,
    D4: 62,
    E4: 64,
    F4: 65,
    G4: 67,
    A4: 69,
    B4: 71,
    C5: 72,
};

export default function NotePlayer() {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const playerRef = useRef<WebAudioFontPlayer | null>(null);
    const instrumentRef = useRef<any>(null);
    const playingNotesRef = useRef<Record<string, any>>({}); // Track currently playing notes

    useEffect(() => {
        const audioCtx = new AudioContext();
        const player = new WebAudioFontPlayer();
        audioCtxRef.current = audioCtx;
        playerRef.current = player;

        player.loader.startLoad(
            audioCtx,
            _tone_0000_AcousticGrandPiano.url,
            _tone_0000_AcousticGrandPiano
        );
        player.loader.waitLoad(() => {
            instrumentRef.current = _tone_0000_AcousticGrandPiano;
        });
    }, []);

    const playNote = (note: string) => {
        const midi = NOTE_TO_MIDI[note];
        if (
            !audioCtxRef.current ||
            !playerRef.current ||
            !instrumentRef.current
        )
            return;

        const audioCtx = audioCtxRef.current;
        const player = playerRef.current;

        const when = audioCtx.currentTime;
        const duration = 10; // we’ll stop it manually anyway
        const velocity = 0.5;

        const noteObj = player.queueWaveTable(
            audioCtx,
            audioCtx.destination,
            instrumentRef.current,
            when,
            midi,
            duration,
            velocity
        );

        playingNotesRef.current[note] = noteObj;
    };

    const stopNote = (note: string) => {
        const noteObj = playingNotesRef.current[note];
        if (noteObj?.stop) {
            noteObj.stop(audioCtxRef.current!.currentTime);
        }
        delete playingNotesRef.current[note];
    };

    return (
        <div className="flex flex-wrap gap-2 mt-4">
            {NOTES.map((note) => (
                <button
                    key={note}
                    onMouseDown={() => playNote(note)}
                    onMouseUp={() => stopNote(note)}
                    onMouseLeave={() => stopNote(note)} // If they drag away
                    className="bg-blue-500 text-white px-4 py-2 rounded shadow active:bg-blue-700"
                >
                    {note}
                </button>
            ))}
        </div>
    );
}
