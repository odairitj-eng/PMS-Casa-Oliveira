'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Captured by Root Error Boundary:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado!</h2>
            <p className="text-gray-700 mb-6 bg-gray-100 p-4 rounded-lg text-left overflow-auto max-w-full">
                <strong>{error.name}</strong>: {error.message}
                <br />
                <br />
                {error.stack}
            </p>
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Tentar novamente
            </button>
        </div>
    );
}
