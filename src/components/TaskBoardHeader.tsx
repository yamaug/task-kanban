import { Satellite } from "lucide-react";

export default function TaskBoardHeader() {
  return (
    <div className="relative flex items-center gap-2">
      <Satellite className="size-5 text-primary" />
      <h1 className="text-glow text-xl font-bold tracking-wide text-foreground">
        タスクカンバン
      </h1>
    </div>
  );
}
