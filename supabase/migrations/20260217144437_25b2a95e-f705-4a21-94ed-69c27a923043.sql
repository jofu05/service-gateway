
CREATE POLICY "Users can update own ai_logs"
  ON public.ai_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = ai_logs.submission_id AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = ai_logs.submission_id AND s.user_id = auth.uid()
    )
  );
