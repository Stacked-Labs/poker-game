'use client';

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    background: '#0b1430',
                    color: '#f5f7ff',
                    padding: '24px',
                }}
            >
                <div
                    style={{
                        maxWidth: '440px',
                        width: '100%',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '20px',
                        padding: '40px 32px',
                    }}
                >
                    <h1 style={{ margin: '0 0 12px', fontSize: '24px' }}>
                        Something went wrong
                    </h1>
                    <p
                        style={{
                            margin: '0 0 32px',
                            fontSize: '14px',
                            opacity: 0.75,
                        }}
                    >
                        The app hit an unexpected error. Try again or head back
                        to the lobby.
                    </p>
                    <button
                        type="button"
                        onClick={reset}
                        style={{
                            background: '#36A37B',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            padding: '14px 24px',
                            fontSize: '15px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            width: '100%',
                        }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
