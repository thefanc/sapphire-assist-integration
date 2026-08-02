/**
 * ASSIST MANAGER FULL SIDEBAR
 * VALA CONNECT - UltraViewer Style Remote Assist
 * Style: Reseller/Product Manager
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  MonitorPlay,
  PlusCircle,
  Inbox,
  Clock,
  Radio,
  Monitor,
  FileUp,
  MessageSquare,
  Shield,
  Laptop,
  FileText,
  Brain,
  AlertOctagon,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export type AMSection =
  | 'assist_dashboard'
  | 'active_sessions'
  | 'create_assist'
  | 'session_requests'
  | 'pending_approval'
  | 'live_assist'
  | 'screen_control'
  | 'file_transfer'
  | 'chat_voice'
  | 'privacy_controls'
  | 'device_access'
  | 'session_logs'
  | 'ai_assist_layer'
  | 'emergency_stop'
  | 'settings';

interface AMFullSidebarProps {
  activeSection: AMSection;
  onSectionChange: (section: AMSection) => void;
  counts?: Partial<Record<AMSection, number>>;
}

const SIDEBAR_ITEMS: { id: AMSection; label: string; icon: React.ElementType }[] = [
  { id: 'assist_dashboard', label: 'Assist Dashboard', icon: LayoutDashboard },
  { id: 'active_sessions', label: 'Active Sessions', icon: MonitorPlay },
  { id: 'create_assist', label: 'Create New Assist', icon: PlusCircle },
  { id: 'session_requests', label: 'Session Requests', icon: Inbox },
  { id: 'pending_approval', label: 'Pending Approval', icon: Clock },
  { id: 'live_assist', label: 'Live Assist', icon: Radio },
  { id: 'screen_control', label: 'Screen Control', icon: Monitor },
  { id: 'file_transfer', label: 'File Transfer', icon: FileUp },
  { id: 'chat_voice', label: 'Chat & Voice', icon: MessageSquare },
  { id: 'privacy_controls', label: 'Privacy Controls', icon: Shield },
  { id: 'device_access', label: 'Device Access', icon: Laptop },
  { id: 'session_logs', label: 'Session Logs', icon: FileText },
  { id: 'ai_assist_layer', label: 'AI Assist Layer', icon: Brain },
  { id: 'emergency_stop', label: 'Emergency Stop', icon: AlertOctagon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AMFullSidebar({ activeSection, onSectionChange, counts }: AMFullSidebarProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
        <span className="glow-ring flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">Assist Manager</p>
          <p className="code-chip text-muted-foreground">VALA CONNECT</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-2">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const isEmergency = item.id === 'emergency_stop';
            const count = counts?.[item.id];

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : isEmergency
                      ? 'text-destructive hover:bg-destructive/10'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-left">{item.label}</span>
                {count ? (
                  <span
                    className={cn(
                      'code-chip rounded-full px-1.5 py-0.5 text-[10px]',
                      isActive
                        ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
                        : 'bg-primary/15 text-primary',
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer Status */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
          <span className="text-muted-foreground">System Secure</span>
        </div>
      </div>
    </aside>
  );
}

export default AMFullSidebar;
