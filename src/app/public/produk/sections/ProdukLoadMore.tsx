import Button from "../../../../components/ui/Button";

export default function ProdukLoadMore({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <div className="flex justify-center pt-2">
      <Button variant="secondary" onClick={onClick}>
        Tampilkan lebih banyak
      </Button>
    </div>
  );
}
