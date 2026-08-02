-- ============ ENUM-ish via CHECK constraints, tables ============

CREATE TABLE public.assist_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  specialisation TEXT NOT NULL DEFAULT 'Support',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','in_session','offline')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assist_end_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'client',
  device TEXT NOT NULL DEFAULT 'Unknown Device',
  operating_system TEXT NOT NULL DEFAULT 'Unknown',
  active_window TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assist_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT NOT NULL UNIQUE,
  end_user_id UUID REFERENCES public.assist_end_users(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.assist_agents(id) ON DELETE SET NULL,
  assist_type TEXT NOT NULL DEFAULT 'support',
  access_mode TEXT NOT NULL DEFAULT 'view_only' CHECK (access_mode IN ('view_only','control_limited','control_full','file_transfer','chat_only')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','paused','completed','terminated','blocked')),
  purpose TEXT,
  ai_score INTEGER NOT NULL DEFAULT 90 CHECK (ai_score BETWEEN 0 AND 100),
  ai_involved BOOLEAN NOT NULL DEFAULT false,
  permissions TEXT[] NOT NULL DEFAULT ARRAY['screen_view'],
  restrictions TEXT[] NOT NULL DEFAULT ARRAY['No System Access'],
  actions_count INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 30,
  resolution TEXT NOT NULL DEFAULT '1920x1080',
  frame_rate INTEGER NOT NULL DEFAULT 30,
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low','medium','high')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  end_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assist_session_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_code TEXT NOT NULL UNIQUE,
  end_user_id UUID REFERENCES public.assist_end_users(id) ON DELETE SET NULL,
  assist_type TEXT NOT NULL DEFAULT 'support',
  purpose TEXT NOT NULL,
  requested_scope TEXT NOT NULL DEFAULT 'view_only',
  requested_duration_minutes INTEGER NOT NULL DEFAULT 30,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal','high','critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
  ai_assist_enabled BOOLEAN NOT NULL DEFAULT true,
  review_note TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assist_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_code TEXT NOT NULL UNIQUE,
  session_id UUID REFERENCES public.assist_sessions(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.assist_agents(id) ON DELETE SET NULL,
  end_user_id UUID REFERENCES public.assist_end_users(id) ON DELETE SET NULL,
  assist_type TEXT NOT NULL DEFAULT 'support',
  scope TEXT NOT NULL DEFAULT 'View + Chat',
  awaiting_role TEXT NOT NULL DEFAULT 'Manager',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '15 minutes',
  decided_at TIMESTAMPTZ,
  decision_note TEXT
);

CREATE TABLE public.assist_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.assist_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('agent','user','ai')),
  body TEXT NOT NULL,
  is_translation BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assist_file_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_code TEXT NOT NULL UNIQUE,
  session_id UUID REFERENCES public.assist_sessions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  direction TEXT NOT NULL CHECK (direction IN ('send','receive')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','failed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  one_time_access BOOLEAN NOT NULL DEFAULT true,
  auto_delete BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assist_session_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.assist_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE public.assist_ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_code TEXT NOT NULL UNIQUE,
  session_id UUID REFERENCES public.assist_sessions(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL DEFAULT 'fix' CHECK (suggestion_type IN ('fix','issue','guide','translate','summary')),
  message TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 80 CHECK (confidence BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','accepted','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assist_emergency_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_code TEXT NOT NULL UNIQUE,
  session_code TEXT NOT NULL,
  reason TEXT NOT NULL,
  stopped_by TEXT NOT NULL DEFAULT 'Assist Manager',
  stop_type TEXT NOT NULL DEFAULT 'force_single' CHECK (stop_type IN ('force_single','force_all','system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assist_privacy_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'shield',
  enabled BOOLEAN NOT NULL DEFAULT true,
  is_critical BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assist_access_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'app-window',
  is_active BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assist_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  setting_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  control_type TEXT NOT NULL CHECK (control_type IN ('toggle','number','select')),
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assist_control_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE REFERENCES public.assist_sessions(id) ON DELETE CASCADE,
  control_mode TEXT NOT NULL DEFAULT 'view' CHECK (control_mode IN ('view','control','pause','freeze')),
  cursor_control BOOLEAN NOT NULL DEFAULT false,
  keyboard_control BOOLEAN NOT NULL DEFAULT false,
  window_specific BOOLEAN NOT NULL DEFAULT true,
  resolution_lock BOOLEAN NOT NULL DEFAULT true,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  voice_active BOOLEAN NOT NULL DEFAULT false,
  microphone_enabled BOOLEAN NOT NULL DEFAULT true,
  speaker_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_translate BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ GRANTS ============
GRANT SELECT ON public.assist_agents TO anon, authenticated;
GRANT INSERT, UPDATE ON public.assist_agents TO anon, authenticated;
GRANT ALL ON public.assist_agents TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.assist_end_users TO anon, authenticated;
GRANT ALL ON public.assist_end_users TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.assist_sessions TO anon, authenticated;
GRANT ALL ON public.assist_sessions TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.assist_session_requests TO anon, authenticated;
GRANT ALL ON public.assist_session_requests TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.assist_approvals TO anon, authenticated;
GRANT ALL ON public.assist_approvals TO service_role;

GRANT SELECT, INSERT ON public.assist_chat_messages TO anon, authenticated;
GRANT ALL ON public.assist_chat_messages TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.assist_file_transfers TO anon, authenticated;
GRANT ALL ON public.assist_file_transfers TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.assist_session_windows TO anon, authenticated;
GRANT ALL ON public.assist_session_windows TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.assist_ai_suggestions TO anon, authenticated;
GRANT ALL ON public.assist_ai_suggestions TO service_role;

GRANT SELECT, INSERT ON public.assist_emergency_stops TO anon, authenticated;
GRANT ALL ON public.assist_emergency_stops TO service_role;

GRANT SELECT, UPDATE ON public.assist_privacy_controls TO anon, authenticated;
GRANT ALL ON public.assist_privacy_controls TO service_role;

GRANT SELECT, UPDATE ON public.assist_access_modes TO anon, authenticated;
GRANT ALL ON public.assist_access_modes TO service_role;

GRANT SELECT, UPDATE ON public.assist_settings TO anon, authenticated;
GRANT ALL ON public.assist_settings TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.assist_control_state TO anon, authenticated;
GRANT ALL ON public.assist_control_state TO service_role;

-- ============ RLS ============
ALTER TABLE public.assist_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assist_end_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assist_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assist_session_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assist_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assist_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assist_file_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assist_session_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assist_ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assist_emergency_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assist_privacy_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assist_access_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assist_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assist_control_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "console read agents" ON public.assist_agents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console write agents" ON public.assist_agents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "console update agents" ON public.assist_agents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "console read users" ON public.assist_end_users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console write users" ON public.assist_end_users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "console update users" ON public.assist_end_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "console read sessions" ON public.assist_sessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console write sessions" ON public.assist_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "console update sessions" ON public.assist_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "console read requests" ON public.assist_session_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console write requests" ON public.assist_session_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "console update requests" ON public.assist_session_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "console read approvals" ON public.assist_approvals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console write approvals" ON public.assist_approvals FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "console update approvals" ON public.assist_approvals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "console read chat" ON public.assist_chat_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console write chat" ON public.assist_chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "console read transfers" ON public.assist_file_transfers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console write transfers" ON public.assist_file_transfers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "console update transfers" ON public.assist_file_transfers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "console read windows" ON public.assist_session_windows FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console write windows" ON public.assist_session_windows FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "console update windows" ON public.assist_session_windows FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "console read suggestions" ON public.assist_ai_suggestions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console write suggestions" ON public.assist_ai_suggestions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "console update suggestions" ON public.assist_ai_suggestions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "console read stops" ON public.assist_emergency_stops FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console write stops" ON public.assist_emergency_stops FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "console read privacy" ON public.assist_privacy_controls FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console update privacy" ON public.assist_privacy_controls FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "console read access modes" ON public.assist_access_modes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console update access modes" ON public.assist_access_modes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "console read settings" ON public.assist_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console update settings" ON public.assist_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "console read control state" ON public.assist_control_state FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "console write control state" ON public.assist_control_state FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "console update control state" ON public.assist_control_state FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ============ TIMESTAMP TRIGGER ============
CREATE OR REPLACE FUNCTION public.assist_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_assist_sessions_touch BEFORE UPDATE ON public.assist_sessions
FOR EACH ROW EXECUTE FUNCTION public.assist_touch_updated_at();
CREATE TRIGGER trg_assist_privacy_touch BEFORE UPDATE ON public.assist_privacy_controls
FOR EACH ROW EXECUTE FUNCTION public.assist_touch_updated_at();
CREATE TRIGGER trg_assist_access_touch BEFORE UPDATE ON public.assist_access_modes
FOR EACH ROW EXECUTE FUNCTION public.assist_touch_updated_at();
CREATE TRIGGER trg_assist_settings_touch BEFORE UPDATE ON public.assist_settings
FOR EACH ROW EXECUTE FUNCTION public.assist_touch_updated_at();
CREATE TRIGGER trg_assist_control_touch BEFORE UPDATE ON public.assist_control_state
FOR EACH ROW EXECUTE FUNCTION public.assist_touch_updated_at();

-- ============ SEED ============
INSERT INTO public.assist_agents (agent_code, display_name, specialisation, status) VALUES
('AGT-****15','Rhea Kulkarni','Support',   'in_session'),
('AGT-****22','Dev Sharma',   'Dev',       'in_session'),
('AGT-****08','Ayaan Qureshi','Franchise', 'in_session'),
('AGT-****31','Meera Nair',   'Sales',     'available'),
('AGT-****19','Vikram Bose',  'Support',   'in_session'),
('AGT-****44','Sana Fernandes','Internal', 'available'),
('AGT-****57','Karan Mehta',  'Dev',       'offline');

INSERT INTO public.assist_end_users (user_code, role, device, operating_system, active_window) VALUES
('USR-****42','client',   'Dell Latitude 5440',  'Windows 11 Desktop', 'Chrome - Support Portal'),
('USR-****67','developer','MacBook Pro 14"',     'macOS Sonoma',       'VS Code - billing-service'),
('USR-****89','franchise','HP ProBook 450',      'Windows 11 Desktop', 'Franchise Console'),
('USR-****34','reseller', 'Lenovo ThinkPad E14', 'Windows 10 Pro',     'Reseller Portal'),
('USR-****56','client',   'ASUS VivoBook 15',    'Windows 11 Home',    'Edge - Billing'),
('USR-****78','employee', 'Dell OptiPlex 7010',  'Windows 11 Pro',     'Installer - Setup Wizard'),
('USR-****91','franchise','Acer Aspire 5',       'Windows 11 Home',    'Configuration Manager');

-- Live + historical sessions
INSERT INTO public.assist_sessions
(session_code, end_user_id, agent_id, assist_type, access_mode, status, purpose, ai_score, ai_involved,
 permissions, restrictions, actions_count, latency_ms, resolution, frame_rate, risk_level, started_at, ended_at, end_reason)
VALUES
('SVL-A8K2M9',
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****42'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****15'),
 'support','view_only','active','Guided walkthrough of the invoicing module',92,true,
 ARRAY['screen_view','chat'],ARRAY['No System Access','No Background','Single Window'],12,24,'1920x1080',30,'low', now() - interval '12 minutes', NULL, NULL),
('SVL-C9X4L6',
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****89'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****08'),
 'dev','control_limited','active','Investigating a failing nightly sync job',78,true,
 ARRAY['screen_view','keyboard','mouse'],ARRAY['No System Access','Window Specific'],21,31,'2560x1440',30,'medium', now() - interval '5 minutes', NULL, NULL),
('SVL-E7T3R2',
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****56'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****19'),
 'franchise','view_only','active','Reviewing branch configuration before go-live',95,false,
 ARRAY['screen_view','chat','file_transfer'],ARRAY['No System Access','No Background'],9,18,'1920x1080',30,'low', now() - interval '18 minutes', NULL, NULL),
('SVL-B3N7P1',
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****67'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****22'),
 'dev','control_full','pending','Production hotfix deployment support',85,false,
 ARRAY['screen_view','keyboard','mouse','file_transfer'],ARRAY['No System Access'],0,45,'1920x1080',30,'high', NULL, NULL, NULL),
('SVL-D5M2K8',
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****34'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****31'),
 'sales','view_only','completed','Product demo walkthrough for a prospect',97,true,
 ARRAY['screen_view','chat'],ARRAY['No System Access'],28,22,'1920x1080',30,'low',
 now() - interval '4 hours', now() - interval '3 hours 36 minutes','Completed normally'),
('SVL-F2H6J4',
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****78'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****44'),
 'internal','file_transfer','completed','Shipping updated licence files to the branch',91,false,
 ARRAY['screen_view','file_transfer'],ARRAY['No System Access','No Background'],14,27,'1680x1050',30,'low',
 now() - interval '7 hours', now() - interval '6 hours 30 minutes','Completed normally'),
('SVL-X2K8M4',
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****91'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****57'),
 'support','control_limited','terminated','Password reset assistance',54,true,
 ARRAY['screen_view','keyboard'],ARRAY['No System Access'],5,88,'1366x768',24,'high',
 now() - interval '2 hours 20 minutes', now() - interval '2 hours','FORCE_END: Security violation detected - clipboard access attempt'),
('SVL-Y5N3P7',
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****34'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****22'),
 'dev','control_limited','terminated','Debugging a stuck import queue',61,false,
 ARRAY['screen_view','keyboard'],ARRAY['No System Access'],17,52,'1920x1080',30,'medium',
 now() - interval '5 hours 30 minutes', now() - interval '5 hours','FORCE_END: Manual termination by Assist Manager'),
('SVL-G8L1Q3',
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****42'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****15'),
 'support','chat_only','blocked','Requested full control outside policy window',35,true,
 ARRAY['chat'],ARRAY['No System Access','No Control'],2,64,'1920x1080',30,'high',
 NULL, now() - interval '1 hour','Blocked by eligibility policy'),
('SVL-H4R9W6',
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****67'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****57'),
 'internal','view_only','blocked','Access requested for an offline device',40,false,
 ARRAY['screen_view'],ARRAY['No System Access'],0,0,'1920x1080',30,'medium', NULL, now() - interval '2 days','Blocked - target device offline'),
('SVL-J7C2V8',
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****56'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****44'),
 'sales','chat_only','blocked','Consent not granted by target user',48,false,
 ARRAY['chat'],ARRAY['No System Access'],1,0,'1920x1080',30,'medium', NULL, now() - interval '3 days','Blocked - consent declined');

-- Requests
INSERT INTO public.assist_session_requests
(request_code, end_user_id, assist_type, purpose, requested_scope, requested_duration_minutes, priority, status, ai_assist_enabled, created_at)
VALUES
('REQ-001',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****78'),'support','Software installation assistance','view_only',30,'high','pending',true, now() - interval '2 minutes'),
('REQ-002',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****34'),'dev','Debug production issue in the billing service','control_limited',60,'critical','pending',true, now() - interval '5 minutes'),
('REQ-003',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****91'),'franchise','Configuration review before branch launch','view_only',15,'normal','pending',true, now() - interval '12 minutes'),
('REQ-004',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****56'),'sales','Demo walkthrough for the reporting module','view_only',45,'normal','pending',false, now() - interval '18 minutes'),
('REQ-005',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****42'),'support','Printer driver mapping on a new workstation','view_only',20,'normal','pending',true, now() - interval '26 minutes'),
('REQ-006',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****67'),'internal','Restore a corrupted local settings profile','control_limited',30,'high','pending',true, now() - interval '33 minutes'),
('REQ-007',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****89'),'franchise','Verify GST tax rules for a new state','view_only',25,'normal','pending',true, now() - interval '41 minutes'),
('REQ-008',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****34'),'sales','Quotation template correction','view_only',15,'normal','pending',false, now() - interval '52 minutes'),
('REQ-009',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****78'),'support','Barcode scanner pairing help','view_only',15,'normal','pending',true, now() - interval '58 minutes'),
('REQ-010',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****56'),'dev','API key rotation walkthrough','chat_only',20,'high','pending',true, now() - interval '64 minutes'),
('REQ-011',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****91'),'internal','Backup schedule verification','view_only',30,'normal','pending',false, now() - interval '71 minutes'),
('REQ-012',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****42'),'support','Reinstall the desktop sync agent','control_limited',40,'high','pending',true, now() - interval '80 minutes'),
('REQ-013',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****67'),'dev','Review a failing unit test suite','view_only',30,'normal','approved',true, now() - interval '5 hours'),
('REQ-014',(SELECT id FROM public.assist_end_users WHERE user_code='USR-****34'),'sales','Discount approval workflow demo','view_only',30,'normal','rejected',false, now() - interval '6 hours');
UPDATE public.assist_session_requests SET reviewed_at = now() - interval '4 hours 40 minutes', review_note='Approved - scope limited to view only' WHERE request_code='REQ-013';
UPDATE public.assist_session_requests SET reviewed_at = now() - interval '5 hours 40 minutes', review_note='Rejected - handled over chat instead' WHERE request_code='REQ-014';

-- Approvals
INSERT INTO public.assist_approvals
(approval_code, session_id, agent_id, end_user_id, assist_type, scope, awaiting_role, status, submitted_at, expires_at)
VALUES
('APR-001',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-B3N7P1'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****22'),
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****67'),
 'dev','Full Control','Boss Owner','pending', now() - interval '3 minutes', now() + interval '12 minutes'),
('APR-002',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-C9X4L6'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****08'),
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****89'),
 'dev','Limited Control','Manager','pending', now() - interval '7 minutes', now() + interval '8 minutes'),
('APR-003',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-A8K2M9'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****15'),
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****42'),
 'support','View + Chat','Boss Owner','pending', now() - interval '13 minutes', now() + interval '2 minutes'),
('APR-004',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-D5M2K8'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****31'),
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****34'),
 'sales','View + Chat','Manager','approved', now() - interval '4 hours 10 minutes', now() - interval '3 hours 55 minutes'),
('APR-005',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-G8L1Q3'),
 (SELECT id FROM public.assist_agents WHERE agent_code='AGT-****15'),
 (SELECT id FROM public.assist_end_users WHERE user_code='USR-****42'),
 'support','Full Control','Boss Owner','rejected', now() - interval '1 hour 20 minutes', now() - interval '1 hour 5 minutes');
UPDATE public.assist_approvals SET decided_at = now() - interval '4 hours', decision_note='Approved for demo purposes' WHERE approval_code='APR-004';
UPDATE public.assist_approvals SET decided_at = now() - interval '1 hour 10 minutes', decision_note='Full control outside the approved policy window' WHERE approval_code='APR-005';

-- Chat transcript for the primary live session
INSERT INTO public.assist_chat_messages (session_id, sender, body, is_translation, created_at)
SELECT id, v.sender, v.body, v.is_tr, now() - (v.mins || ' minutes')::interval
FROM public.assist_sessions,
LATERAL (VALUES
  ('agent','Hello, this is VALA Connect support. I can see your screen now.',false,11),
  ('user','Thanks. The invoice总is not printing correctly.',false,10),
  ('ai','[Translation] The user reports the invoice total is not printing correctly.',true,10),
  ('agent','Understood. Could you open Settings and go to Print Templates?',false,9),
  ('user','Opened it. I see three templates listed.',false,8),
  ('agent','Select the A4 Tax Invoice template and check the footer margin value.',false,7),
  ('user','It says 0 mm.',false,6),
  ('ai','Suggested fix: footer margin of 0 mm truncates the totals block. Recommend 12 mm.',false,5),
  ('agent','Set it to 12 mm and print a test invoice, please.',false,4),
  ('user','That worked, the total is showing now. Thank you!',false,2)
) AS v(sender, body, is_tr, mins)
WHERE session_code = 'SVL-A8K2M9';

-- File transfers
INSERT INTO public.assist_file_transfers (transfer_code, session_id, file_name, size_bytes, direction, status, progress, created_at) VALUES
('FT-001',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-A8K2M9'),'print-template-a4.zip',2516582,'send','completed',100, now() - interval '9 minutes'),
('FT-002',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-A8K2M9'),'printer-diagnostics.txt',466944,'receive','in_progress',67, now() - interval '1 minute'),
('FT-003',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-C9X4L6'),'sync-job-error.png',1258291,'send','pending',0, now() - interval '30 seconds'),
('FT-004',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-F2H6J4'),'licence-bundle-2026.lic',81920,'send','completed',100, now() - interval '6 hours 45 minutes'),
('FT-005',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-E7T3R2'),'branch-config-review.pdf',3355443,'receive','completed',100, now() - interval '14 minutes');

-- Windows visible during the primary session
INSERT INTO public.assist_session_windows (session_id, title, is_visible, sort_order)
SELECT id, v.title, v.vis, v.ord FROM public.assist_sessions,
LATERAL (VALUES ('Chrome - Support Portal',true,1),('File Explorer',false,2),('Settings',false,3),('Print Spooler',false,4)) AS v(title,vis,ord)
WHERE session_code = 'SVL-A8K2M9';

-- AI suggestions
INSERT INTO public.assist_ai_suggestions (suggestion_code, session_id, suggestion_type, message, confidence, status) VALUES
('SUG-001',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-A8K2M9'),'fix','Footer margin is set to 0 mm on the A4 Tax Invoice template, which truncates the totals block. Recommend setting it to 12 mm.',94,'open'),
('SUG-002',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-C9X4L6'),'issue','Detected repeated sync failures originating from an expired API credential on the target device.',78,'open'),
('SUG-003',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-E7T3R2'),'guide','Target user is unfamiliar with the branch configuration wizard. Recommend a step-by-step walkthrough of tax and outlet settings.',89,'open'),
('SUG-004',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-C9X4L6'),'summary','Session summary drafted: credential rotation required, sync queue cleared, follow-up scheduled.',86,'open'),
('SUG-005',(SELECT id FROM public.assist_sessions WHERE session_code='SVL-A8K2M9'),'translate','Two user messages were auto-translated from Hindi during this session.',97,'accepted');

-- Emergency stop history
INSERT INTO public.assist_emergency_stops (stop_code, session_code, reason, stopped_by, stop_type, created_at) VALUES
('STOP-001','SVL-X2K8M4','Security violation detected - clipboard access attempt','System','system', now() - interval '2 hours'),
('STOP-002','SVL-Y5N3P7','Manual termination - session exceeded approved scope','AGT-****22','force_single', now() - interval '5 hours'),
('STOP-003','SVL-Q1W2E3','Policy sweep - all sessions terminated during maintenance window','Assist Manager','force_all', now() - interval '2 days');

-- Privacy controls
INSERT INTO public.assist_privacy_controls (control_key,label,description,icon,enabled,is_critical,sort_order) VALUES
('no_screenshot','No Screenshot','Block all screenshot attempts','camera',true,true,1),
('no_recording','No Screen Recording','Prevent any screen recording','video',true,true,2),
('no_clipboard','No Clipboard Copy','Block clipboard access','clipboard',true,true,3),
('no_persistence','No File Persistence','Auto-delete all transferred files','file-x',true,true,4),
('no_background','No Background Access','Block background process visibility','eye',true,true,5),
('mask_sensitive','Mask Sensitive Fields','Auto-blur password and sensitive inputs','lock',true,true,6),
('auto_blur','Auto Blur Password Areas','Detect and blur password fields','lock',true,false,7);

-- Device access modes
INSERT INTO public.assist_access_modes (mode_key,label,description,icon,is_active,sort_order) VALUES
('app_only','App Only','Access restricted to specific application','app-window',true,1),
('browser_only','Browser Only','Access limited to browser window','globe',false,2),
('single_window','Single Window','Only one window visible at a time','layers',true,3),
('no_background','No Background','Background processes hidden','eye-off',true,4);

-- Settings
INSERT INTO public.assist_settings (section,setting_key,label,control_type,value,sort_order,is_locked) VALUES
('Session Defaults','default_duration','Default Session Duration','select','30',1,false),
('Session Defaults','max_duration','Maximum Session Duration','select','120',2,false),
('Session Defaults','auto_timeout','Auto Timeout (minutes)','number','15',3,false),
('Session Defaults','require_consent','Require User Consent','toggle','true',4,true),
('Privacy & Security','no_screenshot','Block Screenshots','toggle','true',1,true),
('Privacy & Security','no_recording','Block Recording','toggle','true',2,true),
('Privacy & Security','mask_sensitive','Mask Sensitive Data','toggle','true',3,true),
('Privacy & Security','auto_delete','Auto Delete Files','toggle','true',4,true),
('AI Configuration','ai_enabled','Enable AI Assist','toggle','true',1,false),
('AI Configuration','ai_translate','Auto Translate','toggle','true',2,false),
('AI Configuration','ai_summarize','Auto Summarize','toggle','true',3,false),
('AI Configuration','ai_risk','Risk Detection','toggle','true',4,false),
('Notifications','notify_new','New Request Alert','toggle','true',1,false),
('Notifications','notify_end','Session End Alert','toggle','true',2,false),
('Notifications','notify_security','Security Alert','toggle','true',3,false),
('Notifications','notify_ai','AI Suggestion Alert','toggle','false',4,false);

-- Control state for live sessions
INSERT INTO public.assist_control_state (session_id, control_mode, cursor_control, keyboard_control, window_specific, resolution_lock, is_paused, voice_active)
SELECT id,'view',false,false,true,true,false,false FROM public.assist_sessions WHERE session_code='SVL-A8K2M9';
INSERT INTO public.assist_control_state (session_id, control_mode, cursor_control, keyboard_control, window_specific, resolution_lock, is_paused, voice_active)
SELECT id,'control',true,true,true,true,false,true FROM public.assist_sessions WHERE session_code='SVL-C9X4L6';
INSERT INTO public.assist_control_state (session_id, control_mode, cursor_control, keyboard_control, window_specific, resolution_lock, is_paused, voice_active)
SELECT id,'view',false,false,true,true,false,false FROM public.assist_sessions WHERE session_code='SVL-E7T3R2';