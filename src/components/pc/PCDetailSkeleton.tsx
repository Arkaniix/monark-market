import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PCDetailSkeleton() {
  return (
    <div className="container py-8">
      {/* Back button */}
      <Skeleton className="h-10 w-40 mb-6" />

      {/* Header card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex gap-2 mb-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-5 w-28 mt-2" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-6 w-28" />
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-12 mb-1" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Components card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-56" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <Skeleton className="h-6 w-6" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Value analysis card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/50">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-[200px] w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
