import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function ServicesLoading() {
  return (
    <div className="bg-background py-12 md:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="max-w-3xl mb-12 md:mb-16 space-y-4">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-10 w-64 md:w-80" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="flex flex-col justify-between border-border/80 bg-card"
            >
              <CardHeader className="space-y-3 pb-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-7 w-3/4" />
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Skeleton className="h-16 w-full rounded-lg" />
              </CardContent>

              <CardFooter className="pt-4 border-t border-border/60">
                <Skeleton className="h-10 w-full rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
