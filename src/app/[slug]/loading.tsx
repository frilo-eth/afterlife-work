export default function LogoDetailLoading() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="aspect-[4/3] w-full animate-pulse rounded-lg bg-card" />
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-card" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-card" />
            <div className="h-4 w-full max-w-xl animate-pulse rounded bg-card" />
            <div className="h-4 w-full max-w-lg animate-pulse rounded bg-card" />
          </div>
        </div>
        <div className="h-72 animate-pulse rounded-lg bg-card" />
      </div>
    </div>
  )
}
