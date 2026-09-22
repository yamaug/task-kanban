"use client";

import { useState } from "react";
import type { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TaskFormProps {
  initialTask?: Pick<Task, "title" | "description">;
  submitLabel: string;
  onSubmit: (values: { title: string; description: string | null }) => void;
  onCancel: () => void;
}

export default function TaskForm({
  initialTask,
  submitLabel,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(
    initialTask?.description ?? "",
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (trimmedTitle === "") {
      setValidationError("タイトルは必須です");
      return;
    }

    const trimmedDescription = description.trim();
    onSubmit({
      title: trimmedTitle,
      description: trimmedDescription === "" ? null : trimmedDescription,
    });
  }

  return (
    <Card className="border-primary/25 glow-ring">
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title" className="text-xs tracking-wider text-muted-foreground uppercase">
              タイトル
            </Label>
            <Input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="task-description"
              className="text-xs tracking-wider text-muted-foreground uppercase"
            >
              説明
            </Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit">{submitLabel}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
