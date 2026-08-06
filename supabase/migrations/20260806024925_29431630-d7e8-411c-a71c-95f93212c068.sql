DROP POLICY IF EXISTS "console toggle non critical privacy" ON public.assist_privacy_controls;

CREATE POLICY "console toggle non critical privacy"
ON public.assist_privacy_controls
FOR UPDATE
TO anon, authenticated
USING (is_critical = false)
WITH CHECK (is_critical = false);