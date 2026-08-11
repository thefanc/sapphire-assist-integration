import type { ReactNode } from "react";
import {
  AppWindow,
  Bell,
  Brain,
  Camera,
  Clipboard,
  Clock,
  Eye,
  EyeOff,
  FileX,
  Globe,
  Layers,
  Lock,
  Settings as SettingsIcon,
  Shield,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AccessMode, RiskLevel, SessionStatus } from "@/lib/assist-manager/types";

export function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDuration(startedAt: string | null, endedAt?: string | null) {
  if (!startedAt) return "—";
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const seconds = Math.max(0, Math.floor((end - new Date(startedAt).getTime()) / 1000));
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function countdown(iso: string) {
  const seconds = Math.floor((new Date(iso).getTime() - Date.now()) / 1000);
  if (seconds <= 0) return "expired";
  const mm = Math.floor(seconds / 60);
  const ss = (seconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export function formatClock(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ACCESS_MODE_LABEL: Record<AccessMode, string> = {
  view_only: "View Only",
  control_limited: "Limited Control",
  control_full: "Full Control",
  file_transfer: "File Transfer",
  chat_only: "Chat Only",
};

export function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusPill({ status }: { status: SessionStatus | string }) {
  const tone: Record<string, string> = {
    active: "border-success/40 bg-success/10 text-success",
    paused: "border-warning/40 bg-warning/10 text-warning",
    pending: "border-info/40 bg-info/10 text-info",
    completed: "border-border bg-muted text-muted-foreground",
    terminated: "border-destructive/40 bg-destructive/10 text-destructive",
    blocked: "border-destructive/40 bg-destructive/10 text-destructive",
    approved: "border-success/40 bg-success/10 text-success",
    rejected: "border-destructive/40 bg-destructive/10 text-destructive",
    expired: "border-border bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tone[status] ?? "border-border bg-muted text-muted-foreground",
      )}
    >
      {status === "active" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
      )}
      {titleCase(status)}
    </span>
  );
}

export function RiskPill({ risk }: { risk: RiskLevel | string }) {
  const tone: Record<string, string> = {
    low: "border-success/40 bg-success/10 text-success",
    medium: "border-warning/40 bg-warning/10 text-warning",
    high: "border-destructive/40 bg-destructive/10 text-destructive",
    normal: "border-border bg-muted text-muted-foreground",
    critical: "border-destructive/40 bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tone[risk] ?? "border-border bg-muted text-muted-foreground",
      )}
    >
      {titleCase(risk)}
    </span>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  actions,
  tone = "default",
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6",
        tone === "danger" && "border-destructive/30",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl",
          tone === "danger" ? "bg-destructive/15" : "bg-primary/15",
        )}
      />
      <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1
            className={cn(
              "truncate text-xl font-bold tracking-tight sm:text-2xl",
              tone === "danger" ? "text-destructive" : "text-foreground",
            )}
          >
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ElementType;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
}) {
  const tones: Record<string, string> = {
    primary: "text-primary bg-primary/10 border-primary/25",
    success: "text-success bg-success/10 border-success/25",
    warning: "text-warning bg-warning/10 border-warning/25",
    danger: "text-destructive bg-destructive/10 border-destructive/25",
    info: "text-info bg-info/10 border-info/25",
  };
  return (
    <Card className="group relative overflow-hidden transition-colors duration-200 hover:border-primary/35">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn("shrink-0 rounded-xl border p-2.5", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}

export function LoadingBlock({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function CodeChip({ children }: { children: ReactNode }) {
  return (
    <Badge variant="outline" className="code-chip border-border bg-muted/60 font-normal">
      {children}
    </Badge>
  );
}

const ICONS: Record<string, React.ElementType> = {
  camera: Camera,
  video: Video,
  clipboard: Clipboard,
  "file-x": FileX,
  eye: Eye,
  "eye-off": EyeOff,
  lock: Lock,
  "app-window": AppWindow,
  globe: Globe,
  layers: Layers,
  shield: Shield,
};

export function iconFor(name: string): React.ElementType {
  return ICONS[name] ?? Shield;
}

export const SECTION_ICONS: Record<string, React.ElementType> = {
  "Session Defaults": Clock,
  "Privacy & Security": Shield,
  "AI Configuration": Brain,
  Notifications: Bell,
};

export function sectionIcon(section: string): React.ElementType {
  return SECTION_ICONS[section] ?? SettingsIcon;
}