'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: 'red' }}>Erro Fatal (Página do Imóvel)</h2>
            <pre style={{ background: '#eee', padding: '1rem', overflow: 'auto' }}>
                {error.message}
                {'\n\n'}
                {error.stack}
            </pre>
            <button onClick={() => reset()}>Tentar novamente</button>
        </div>
    );
}
