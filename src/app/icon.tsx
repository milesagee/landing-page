import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#003F3F",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
        }}
      >
        <span
          style={{
            fontSize: 24,
            color: "#FAF7F1",
            fontWeight: 600,
            lineHeight: 1,
            marginTop: -1,
          }}
        >
          M
        </span>
        <span
          style={{
            width: 14,
            height: 2,
            background: "#D4AF37",
            marginTop: 2,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
