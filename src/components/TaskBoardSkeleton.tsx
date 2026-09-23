import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/types/task";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskBoardSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {TASK_STATUSES.map((status) => (
        <Card
          key={status}
          role="status"
          aria-label={`${TASK_STATUS_LABELS[status]}を読み込み中`}
          className="min-h-40 flex-1 gap-3"
        >
          <div className="flex flex-col gap-3 px-(--card-spacing)">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}
