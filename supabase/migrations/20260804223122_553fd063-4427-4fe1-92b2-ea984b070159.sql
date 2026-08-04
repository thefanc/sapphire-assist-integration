-- Sessions: finished sessions are immutable
DROP POLICY IF EXISTS "console update sessions" ON public.assist_sessions;
CREATE POLICY "console update live sessions" ON public.assist_sessions
  FOR UPDATE TO anon, authenticated
  USING (status IN ('pending','active','paused'))
  WITH CHECK (status IN ('pending','active','paused','completed','terminated','blocked'));

-- Session requests: only pending requests can be reviewed
DROP POLICY IF EXISTS "console update requests" ON public.assist_session_requests;
CREATE POLICY "console review pending requests" ON public.assist_session_requests
  FOR UPDATE TO anon, authenticated
  USING (status = 'pending')
  WITH CHECK (status IN ('approved','rejected','expired'));

-- Approvals: only pending approvals can be decided, decisions are final
DROP POLICY IF EXISTS "console update approvals" ON public.assist_approvals;
CREATE POLICY "console decide pending approvals" ON public.assist_approvals
  FOR UPDATE TO anon, authenticated
  USING (status = 'pending')
  WITH CHECK (status IN ('approved','rejected','expired'));

-- File transfers: terminal states are locked
DROP POLICY IF EXISTS "console update transfers" ON public.assist_file_transfers;
CREATE POLICY "console update open transfers" ON public.assist_file_transfers
  FOR UPDATE TO anon, authenticated
  USING (status IN ('pending','in_progress'))
  WITH CHECK (status IN ('pending','in_progress','completed','failed'));

-- Privacy: critical controls can never be disabled
DROP POLICY IF EXISTS "console update privacy" ON public.assist_privacy_controls;
CREATE POLICY "console toggle non critical privacy" ON public.assist_privacy_controls
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (enabled = true OR is_critical = false);

-- Settings: locked settings cannot be changed
DROP POLICY IF EXISTS "console update settings" ON public.assist_settings;
CREATE POLICY "console update unlocked settings" ON public.assist_settings
  FOR UPDATE TO anon, authenticated
  USING (is_locked = false)
  WITH CHECK (is_locked = false);