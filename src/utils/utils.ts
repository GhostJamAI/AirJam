// utils.ts

export type InstrumentMeta = {
    label: string;
    midi: number;
    scriptUrl: string;
    globalVar: string;
};

export const instrumentOptions: InstrumentMeta[] = [
    {
        label: "Flute",
        midi: 73,
        scriptUrl:
            "https://surikov.github.io/webaudiofontdata/sound/0730_JCLive_sf2_file.js",
        globalVar: "_tone_0730_JCLive_sf2_file",
    },
    {
        label: "Piano",
        midi: 0,
        scriptUrl:
            "https://surikov.github.io/webaudiofontdata/sound/0000_JCLive_sf2_file.js",
        globalVar: "_tone_0000_JCLive_sf2_file",
    },
    {
        label: "Acoustic Guitar",
        midi: 24,
        scriptUrl:
            "https://surikov.github.io/webaudiofontdata/sound/0240_JCLive_sf2_file.js",
        globalVar: "_tone_0240_JCLive_sf2_file",
    },
    {
        label: "Violin",
        midi: 40,
        scriptUrl:
            "https://surikov.github.io/webaudiofontdata/sound/0400_JCLive_sf2_file.js",
        globalVar: "_tone_0400_JCLive_sf2_file",
    },
    {
        label: "Trumpet",
        midi: 56,
        scriptUrl:
            "https://surikov.github.io/webaudiofontdata/sound/0560_JCLive_sf2_file.js",
        globalVar: "_tone_0560_JCLive_sf2_file",
    },
];

export const drumMappings: InstrumentMeta[] = [
    {
        label: "Bass",
        midi: 35,
        scriptUrl:
            "https://surikov.github.io/webaudiofontdata/sound/12835_17_JCLive_sf2_file.js",
        globalVar: "_drum_35_17_JCLive_sf2_file",
    },
    {
        label: "Snare",
        midi: 40,
        scriptUrl:
            "https://surikov.github.io/webaudiofontdata/sound/12840_1_JCLive_sf2_file.js",
        globalVar: "_drum_40_1_JCLive_sf2_file",
    },
    {
        label: "Hi-Hat",
        midi: 42,
        scriptUrl:
            "https://surikov.github.io/webaudiofontdata/sound/12842_1_JCLive_sf2_file.js",
        globalVar: "_drum_42_1_JCLive_sf2_file",
    },
    {
        label: "Crash",
        midi: 51,
        scriptUrl:
            "https://surikov.github.io/webaudiofontdata/sound/12851_1_JCLive_sf2_file.js",
        globalVar: "_drum_51_1_JCLive_sf2_file",
    },
    {
        label: "Tom 1",
        midi: 50,
        scriptUrl:
            "https://surikov.github.io/webaudiofontdata/sound/12850_1_JCLive_sf2_file.js",
        globalVar: "_drum_50_1_JCLive_sf2_file",
    },
    {
        label: "Tom 2",
        midi: 48,
        scriptUrl:
            "https://surikov.github.io/webaudiofontdata/sound/12848_1_JCLive_sf2_file.js",
        globalVar: "_drum_48_1_JCLive_sf2_file",
    },
    {
        label: "Tom 3",
        midi: 41,
        scriptUrl:
            "https://surikov.github.io/webaudiofontdata/sound/12841_1_JCLive_sf2_file.js",
        globalVar: "_drum_41_1_JCLive_sf2_file",
    },
];

export const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
    });
};

export const initWebAudioFont = async (instruments: InstrumentMeta[]) => {
    await loadScript(
        "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js"
    );
    for (const inst of instruments) {
        await loadScript(inst.scriptUrl);
    }
};
