// types/webaudiofont.d.ts

declare module "webaudiofont" {
    export class WebAudioFontPlayer {
        loader: {
            startLoad: (
                audioContext: AudioContext,
                url: string,
                variable: any
            ) => void;
            waitLoad: (callback: () => void) => void;
        };
        queueWaveTable: (
            audioContext: AudioContext,
            destination: AudioNode,
            instrument: any,
            when: number,
            pitch: number,
            duration: number,
            volume: number
        ) => any;
    }
}
