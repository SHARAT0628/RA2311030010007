const evalToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzZzk2ODZAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzY5OTYzNywiaWF0IjoxNzc3Njk4NzM3LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZmVjNzJhMWUtZTA3Mi00NmJhLWE1Y2QtOTYzZmM0Mjk2YjBjIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic2hhcmF0aCBjaGFuZHJhIHJlZGR5Iiwic3ViIjoiNDE1MjZiZTAtOTFkNi00OGMxLWEwMDYtMWM3ODJiMzI0MjM1In0sImVtYWlsIjoic2c5Njg2QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoic2hhcmF0aCBjaGFuZHJhIHJlZGR5Iiwicm9sbE5vIjoicmEyMzExMDMwMDEwMDA3IiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiNDE1MjZiZTAtOTFkNi00OGMxLWEwMDYtMWM3ODJiMzI0MjM1IiwiY2xpZW50U2VjcmV0IjoiS1JYa3B6SEpEWE1yeHhaRCJ9.IQR28ceyuaC3NR2Ggv5SDI6aqdKcBMUNQ_9GebZ3Ds0";

type Stack = "backend" | "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type Package =
  | "cache" | "controller" | "cron_job" | "db" | "domain"
  | "handler" | "repository" | "route" | "service"
  | "api" | "component" | "hook" | "page" | "state" | "style"
  | "auth" | "config" | "middleware" | "utils";

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  try {
    await fetch("http://20.207.122.201/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${evalToken}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch (_err) {
  }
}
