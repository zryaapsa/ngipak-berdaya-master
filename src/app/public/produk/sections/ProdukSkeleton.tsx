export default function ProdukSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <div className="h-5 w-56 rounded bg-gray-100" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-gray-100" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-24 rounded-2xl bg-gray-100" />
          <div className="h-24 rounded-2xl bg-gray-100" />
          <div className="h-24 rounded-2xl bg-gray-100" />
          <div className="h-24 rounded-2xl bg-gray-100" />
        </div>
      </div>
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <div className="h-5 w-40 rounded bg-gray-100" />
        <div className="mt-6 h-14 rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}
