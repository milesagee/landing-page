import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
            fontSize: 130,
            color: "#FAF7F1",
            fontWeight: 600,
            lineHeight: 1,
            marginTop: -6,
          }}
        >
          M
        </span>
        <span
          style={{
            width: 78,
            height: 4,
            background: "#D4AF37",
            marginTop: 10,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
