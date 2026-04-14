export function ProductCardSkeleton() {
  return (
    <div className="surface-vault rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-vault-700" />
      <div className="p-4 space-y-3">
        <div className="h-2 w-16 bg-vault-700 rounded" />
        <div className="h-3 w-3/4 bg-vault-700 rounded" />
        <div className="h-3 w-1/3 bg-vault-700 rounded" />
      </div>
    </div>
  );
}
