import React from 'react';

export default function Loader() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="loader mb-8"></div>
            <h2 className="text-2xl font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F10C49] via-[#F4DD51] to-[#E3AAD6] animate-pulse">
                    Loading...
                </span>
            </h2>
        </div>
    );
}
