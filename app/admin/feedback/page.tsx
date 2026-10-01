import { createServiceClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/** Reads bypass RLS through the service role, so never cache this. */
export const dynamic = "force-dynamic";

type FeedbackRow = {
  id: string;
  user_id: string | null;
  rating: number;
  comment: string;
  path: string | null;
  created_at: string;
};

const FACES: Record<number, string> = {
  1: "😰",
  2: "😟",
  3: "😐",
  4: "🙂",
  5: "🤩",
};

const LABELS: Record<number, string> = {
  1: "Frustrating",
  2: "Rough",
  3: "Fine",
  4: "Good",
  5: "Great",
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function loadFeedback(): Promise<{
  rows: FeedbackRow[];
  error: string | null;
}> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { rows: [], error: "SUPABASE_SERVICE_ROLE_KEY is not set." };
  }

  const { data, error } = await supabase
    .from("feedback")
    .select("id, user_id, rating, comment, path, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as FeedbackRow[], error: null };
}

export default async function AdminFeedbackPage() {
  const { rows, error } = await loadFeedback();

  const total = rows.length;
  const average =
    total > 0
      ? (rows.reduce((sum, row) => sum + row.rating, 0) / total).toFixed(2)
      : null;
  const withComment = rows.filter((row) => row.comment.trim()).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Feedback</h1>
          <p className="text-sm text-muted-foreground">
            From the browse dock. Newest first, latest 200.
          </p>
        </div>
        {average ? (
          <div className="flex items-center gap-4 text-sm">
            <span>
              <span className="font-medium">{total}</span>{" "}
              <span className="text-muted-foreground">responses</span>
            </span>
            <span>
              <span className="font-medium">{average}</span>{" "}
              <span className="text-muted-foreground">avg rating</span>
            </span>
            <span>
              <span className="font-medium">{withComment}</span>{" "}
              <span className="text-muted-foreground">with a comment</span>
            </span>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No feedback yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <Card key={row.id}>
              <CardContent className="flex items-start gap-4 py-4">
                <span
                  className="text-2xl leading-none"
                  title={LABELS[row.rating] ?? String(row.rating)}
                >
                  {FACES[row.rating] ?? "•"}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  {row.comment.trim() ? (
                    <p className="text-sm whitespace-pre-wrap">{row.comment}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Rating only, no comment.
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatWhen(row.created_at)}</span>
                    {row.path ? <span>· {row.path}</span> : null}
                    <Badge variant="secondary" className="font-normal">
                      {row.user_id ? "signed in" : "anonymous"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
