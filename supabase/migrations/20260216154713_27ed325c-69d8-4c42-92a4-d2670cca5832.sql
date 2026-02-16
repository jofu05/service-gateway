
-- Fix overly permissive INSERT policy on integration_logs
DROP POLICY "System can insert integration logs" ON public.integration_logs;
CREATE POLICY "Admins can insert integration logs" ON public.integration_logs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
