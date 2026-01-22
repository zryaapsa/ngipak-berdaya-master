import { Link } from "react-router-dom";
import Button from "../../../../components/ui/Button";

export default function UmkmTopBar() {
  return (
    <div className="flex items-center justify-between">
      <Link to="/produk">
        <Button variant="secondary">← Kembali</Button>
      </Link>
      <div className="text-sm text-gray-500">Detail UMKM</div>
    </div>
  );
}
