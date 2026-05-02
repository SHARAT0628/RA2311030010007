import fetch from "node-fetch";

const evalToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzZzk2ODZAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMjU3OCwiaWF0IjoxNzc3NzAxNjc4LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNmNkZTFkNDMtMWRmNy00N2ZkLTg2MmQtMmMyMGQ3MjE1NjNkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic2hhcmF0aCBjaGFuZHJhIHJlZGR5Iiwic3ViIjoiNDE1MjZiZTAtOTFkNi00OGMxLWEwMDYtMWM3ODJiMzI0MjM1In0sImVtYWlsIjoic2c5Njg2QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoic2hhcmF0aCBjaGFuZHJhIHJlZGR5Iiwicm9sbE5vIjoicmEyMzExMDMwMDEwMDA3IiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiNDE1MjZiZTAtOTFkNi00OGMxLWEwMDYtMWM3ODJiMzI0MjM1IiwiY2xpZW50U2VjcmV0IjoiS1JYa3B6SEpEWE1yeHhaRCJ9.XELZ20pQCEciKM93ov5ptk2hRUdEGfV8JyhNiRti29Q";
const notifApiUrl = "http://20.207.122.201/evaluation-service/notifications";

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
type LogPackage = "cache" | "controller" | "cron_job" | "db" | "domain" | "handler" | "repository" | "route" | "service" | "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils";
type NotifKind = "Placement" | "Result" | "Event";

interface RawNotif {
  ID: string;
  Type: NotifKind;
  Message: string;
  Timestamp: string;
}

interface ScoredNotif extends RawNotif {
  priorityScore: number;
}

const kindWeights: Record<NotifKind, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

async function Log(level: LogLevel, pkg: LogPackage, message: string): Promise<void> {
  try {
    await fetch("http://20.207.122.201/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${evalToken}`,
      },
      body: JSON.stringify({ stack: "frontend", level, package: pkg, message }),
    });
  } catch (_err) {
  }
}

async function pullNotifs(): Promise<RawNotif[]> {
  await Log("info", "api", "Fetching notifications from evaluation server");
  const resp = await fetch(notifApiUrl, {
    headers: { Authorization: `Bearer ${evalToken}` },
  });
  if (!resp.ok) {
    await Log("error", "api", `Fetch failed with status ${resp.status}`);
    throw new Error(`API error: ${resp.status}`);
  }
  const body = await resp.json() as { notifications: RawNotif[] };
  await Log("info", "api", `Fetched ${body.notifications.length} notifications`);
  return body.notifications;
}

function computeScore(notif: RawNotif, lowestTs: number, highestTs: number): number {
  const tsMs = new Date(notif.Timestamp).getTime();
  const recencyVal = highestTs === lowestTs ? 1 : (tsMs - lowestTs) / (highestTs - lowestTs);
  return kindWeights[notif.Type] + recencyVal;
}

async function getTopNotifs(topN: number): Promise<ScoredNotif[]> {
  await Log("info", "utils", `Building priority inbox for top ${topN}`);

  const rawList = await pullNotifs();

  const tsValues = rawList.map((n) => new Date(n.Timestamp).getTime());
  const lowestTs = Math.min(...tsValues);
  const highestTs = Math.max(...tsValues);

  await Log("debug", "utils", `Scoring ${rawList.length} notifications`);

  const scoredList: ScoredNotif[] = rawList.map((notif) => ({
    ...notif,
    priorityScore: computeScore(notif, lowestTs, highestTs),
  }));

  scoredList.sort((a, b) => b.priorityScore - a.priorityScore);

  const topPick = scoredList.slice(0, topN);
  await Log("info", "utils", `Top ${topN} notifications selected`);
  return topPick;
}

async function main() {
  await Log("info", "handler", "Priority inbox execution started");

  try {
    const results = await getTopNotifs(10);

    console.log("\n============================");
    console.log("  Top 10 Priority Notifications");
    console.log("============================\n");

    console.log(
      `${"#".padEnd(4)} ${"Type".padEnd(12)} ${"Score".padEnd(8)} ${"Message".padEnd(35)} Timestamp`
    );
    console.log("-".repeat(80));

    results.forEach((entry, idx) => {
      console.log(
        `${String(idx + 1).padEnd(4)} ${entry.Type.padEnd(12)} ${entry.priorityScore.toFixed(4).padEnd(8)} ${entry.Message.padEnd(35)} ${entry.Timestamp}`
      );
    });

    await Log("info", "handler", "Priority inbox execution completed");
  } catch (err) {
    await Log("fatal", "handler", `Priority inbox crashed: ${err}`);
    console.error("Error:", err);
  }
}

main();
