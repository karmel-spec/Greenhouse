import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, updateStore, StoredTask } from "@/lib/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ tasks: store.tasks });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "A task title is required." }, { status: 400 });
  }

  const task: StoredTask = {
    id: newId("task"),
    title,
    time: typeof body.time === "string" && body.time ? body.time : "Anytime",
    kind: typeof body.kind === "string" && body.kind ? body.kind : "General",
    priority: ["High", "Medium", "Low"].includes(body.priority) ? body.priority : "Medium",
    done: false,
    createdAt: new Date().toISOString(),
  };

  const tasks = await updateStore((store) => {
    store.tasks.push(task);
    return store.tasks;
  });

  return NextResponse.json({ task, tasks }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";

  const result = await updateStore((store) => {
    const task = store.tasks.find((entry) => entry.id === id);
    if (!task) return null;

    if (typeof body.done === "boolean") task.done = body.done;
    if (typeof body.title === "string" && body.title.trim()) task.title = body.title.trim();
    if (typeof body.time === "string" && body.time) task.time = body.time;
    if (["High", "Medium", "Low"].includes(body.priority)) task.priority = body.priority;

    return { task, tasks: store.tasks };
  });

  if (!result) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";

  const tasks = await updateStore((store) => {
    store.tasks = store.tasks.filter((entry) => entry.id !== id);
    return store.tasks;
  });

  return NextResponse.json({ tasks });
}
