import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-sm border-border/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-7 w-12 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings Section Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-36 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
          <Skeleton className="h-8 w-20 rounded" />
        </div>

        <Card className="shadow-sm border-border/70 overflow-hidden p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
