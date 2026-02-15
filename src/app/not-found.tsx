import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: 'var(--spacing-sm)',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>
        404
      </h1>
      <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-md)' }}>
        Page not found.
      </p>
      <Link
        href="/dashboard"
        style={{
          color: 'var(--color-purplish-blue)',
          fontSize: 'var(--font-size-sm)',
          marginTop: 'var(--spacing-sm)',
        }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
