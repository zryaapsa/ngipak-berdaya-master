import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";

export default function ProdukEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Card className="p-8 text-center">
      <div className="text-lg font-semibold text-gray-900">Tidak ada hasil</div>
      <div className="mt-1 text-sm text-gray-600">Coba ubah filter/kata kunci atau reset.</div>
      <div className="mt-4 flex justify-center">
        <Button variant="secondary" onClick={onReset}>
          Reset
        </Button>
      </div>
    </Card>
  );
}
