import { supabase } from "@/lib/supabase";
import type { Task, TaskStatus } from "@/types/task";

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

function mapRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as TaskRow[]).map(mapRowToTask);
}

export async function createTask(input: {
  title: string;
  description?: string | null;
}): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({ title: input.title, description: input.description ?? null })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToTask(data as TaskRow);
}

export async function updateTask(
  id: string,
  updates: Partial<Pick<Task, "title" | "description" | "status">>,
): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToTask(data as TaskRow);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
