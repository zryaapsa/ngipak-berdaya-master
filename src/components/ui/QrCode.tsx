export default function QrCode({
  value,
  size = 160,
  className = "",
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    value,
  )}`;

  return (
    <img
      src={src}
      width={size}
      height={size}
      loading="lazy"
      alt="QR Code"
      className={className}
    />
  );
}
