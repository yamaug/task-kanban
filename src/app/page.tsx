import Link from "next/link";
import { Rocket, Satellite, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-starfield p-6">
      <div className="pointer-events-none absolute inset-0 bg-hud-grid opacity-40" />

      <div className="relative flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-2 text-primary">
          <Satellite className="size-8" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-glow text-3xl font-bold tracking-wide text-foreground">
            タスクカンバン
          </h1>
          <p className="text-sm text-muted-foreground">
            ミッション遂行のためのタスク管制システム。
            <br />
            未着手・進行中・完了をリアルタイムで追跡します。
          </p>
        </div>

        <Link
          href="/board"
          className={buttonVariants({ size: "lg", className: "glow-primary" })}
        >
          <Rocket className="size-4" />
          ボードを開く
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
