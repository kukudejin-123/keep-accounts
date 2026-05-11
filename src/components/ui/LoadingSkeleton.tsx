export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-2xl p-5">
          <div className="skeleton h-4 w-3/4 rounded-lg mb-3" />
          <div className="skeleton h-3 w-1/2 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
