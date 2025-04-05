import Webcam from "./components/Webcam.tsx";

export default function Home() {
    return (
        <div className="h-[100vh] w-[100vw] bg-white text-black">
            <div className="p-1 font-bold">GhostJam</div>
            <Webcam />
        </div>
    );
}
