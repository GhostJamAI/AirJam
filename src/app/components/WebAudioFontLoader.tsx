// components/WebAudioFontLoader.tsx
"use client";
import { useEffect } from "react";
import {
    drumMappings,
    initWebAudioFont,
    instrumentOptions,
} from "../../utils/utils";

export default function WebAudioFontLoader() {
    useEffect(() => {
        initWebAudioFont([...instrumentOptions, ...drumMappings]).catch(
            (err) => {
                console.error(
                    "Failed to initialize WebAudioFont globally:",
                    err
                );
            }
        );
    }, []);

    return null;
}
