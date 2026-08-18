import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f0f14',
          borderRadius: '8px',
          border: '2px solid #6366f1',
          color: 'white',
          fontSize: '20px',
        }}
      >
        <span style={{ transform: 'translateY(-1px)' }}>📦</span>
      </div>
    ),
    { ...size }
  );
}
