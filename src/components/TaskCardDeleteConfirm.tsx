"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TaskCardDeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TaskCardDeleteConfirm({
  onConfirm,
  onCancel,
}: TaskCardDeleteConfirmProps) {
  return (
    <div className="flex flex-col gap-2">
      <Alert variant="destructive">
        <AlertDescription>本当に削除しますか？</AlertDescription>
      </Alert>
      <div className="flex gap-2">
        <Button type="button" variant="destructive" size="sm" onClick={onConfirm}>
          削除する
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </div>
  );
}
