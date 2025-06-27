import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-md bg-gray-800/50", className)} />
  );
}

// Reusable table skeleton component
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-md border border-gray-800">
      {/* Table Header */}
      <div className="flex p-4 border-b border-gray-800">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1">
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
        <div className="w-24">
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Table Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex p-4 border-b border-gray-800">
          {[...Array(4)].map((_, j) => (
            <div key={j} className="flex-1">
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
          <div className="w-24 flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-gray-800">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Table */}
      <TableSkeleton />
    </div>
  );
}

export function SuperAdminDashboardSkeleton() {
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-gray-800">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table */}
      <TableSkeleton rows={7} />

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export function AmbassadorDashboardSkeleton() {
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      {/* Header */}
      <Skeleton className="h-8 w-48 mb-6" />

      {/* Profile Section */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Profile Image */}
        <Skeleton className="w-32 h-32 rounded-full" />

        {/* Profile Info */}
        <div className="flex-1">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function KYCReviewSkeleton() {
  return (
    <div className="container mx-auto py-6 animate-fade-in">
      {/* Page Title */}
      <Skeleton className="h-10 w-64 mb-6" />
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2 border-b border-gray-800">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* KYC Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-gray-800 rounded-lg p-6 space-y-4">
            {/* Card Header */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              
              {/* Card Description */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
              <Skeleton className="h-9 w-32" />
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Dialog Skeleton (Hidden by default) */}
      <div className="hidden">
        <div className="fixed inset-0 z-50">
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] rounded-lg border border-gray-800 bg-background p-6 shadow-lg">
            {/* Dialog Header */}
            <div className="mb-6">
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
            
            {/* Dialog Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>

                {/* Status Information */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Document Images */}
              <div className="space-y-6">
                <Skeleton className="h-6 w-40" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-800">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Dialog Skeleton (Hidden by default) */}
      <div className="hidden">
        <div className="fixed inset-0 z-50">
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border border-gray-800 bg-background p-6 shadow-lg">
            <div className="space-y-4">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-24 w-full rounded-md" />
              <div className="flex justify-end gap-2 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 