import Card from "../../../../components/ui/Card";

export default function UmkmSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="h-5 w-56 rounded bg-gray-100" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-gray-100" />
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <div className="h-56 rounded-2xl bg-gray-100" />
          <div className="h-56 rounded-2xl bg-gray-100" />
        </div>
      </Card>
      <Card className="p-6">
        <div className="h-5 w-44 rounded bg-gray-100" />
        <div className="mt-4 h-40 rounded-2xl bg-gray-100" />
      </Card>
    </div>
  );
}
