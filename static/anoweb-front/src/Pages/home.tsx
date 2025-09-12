import { useEffect, useState } from "react";

export default function Home() {

    const [text, setText] = useState("Loading...");

    useEffect(() => {
        fetch("/api/home")
            .then((r) => r.json())
            .then((d: { message?: string }) => setText(d?.message ?? ""))
            .catch(() => setText("Failed to load"))
    }, [])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200">
            <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
                    {text}
                </h1>
                <p className="text-gray-600 mb-6">
                    Powered by Google Cloud, Go, React and TailwindCss.
                </p>
                <button className="px-6 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors">
                    Get Started
                </button>
            </div>
        </div>
    );

}