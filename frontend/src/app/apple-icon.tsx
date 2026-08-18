import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: '40px',
          border: '12px solid #6366f1',
          color: 'white',
          fontSize: '100px',
        }}
      >
        <span style={{ transform: 'translateY(-6px)' }}>📦</span>
      </div>
    ),
    { ...size }
  );
}
