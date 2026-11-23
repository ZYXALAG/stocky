export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* KPI skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-6 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-8 w-20 rounded bg-muted" />
                <div className="h-3 w-32 rounded bg-muted" />
              </div>
              <div className="h-10 w-10 rounded-full bg-muted" />
            </div>
            <div className="mt-4 flex items-center gap-1">
              <div className="h-4 w-4 rounded bg-muted" />
              <div className="h-4 w-12 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6 animate-pulse">
          <div className="mb-4 h-6 w-48 rounded bg-muted" />
          <div className="h-[300px] rounded bg-muted" />
        </div>
        <div className="rounded-lg border border-border bg-card p-6 animate-pulse">
          <div className="mb-4 h-6 w-52 rounded bg-muted" />
          <div className="h-[300px] rounded bg-muted" />
        </div>
      </div>

      {/* Recent movements & Low stock skeleton */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card animate-pulse">
          <div className="p-6">
            <div className="mb-2 h-6 w-40 rounded bg-muted" />
            <div className="h-4 w-64 rounded bg-muted" />
          </div>
          <div className="px-6 pb-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-48 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="h-4 w-12 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 animate-pulse">
          <div className="mb-4 h-6 w-40 rounded bg-muted" />
          <div className="h-4 w-56 rounded bg-muted mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
