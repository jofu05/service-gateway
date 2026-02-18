
-- Allow users to delete own submissions
CREATE POLICY "Users can delete own submissions"
  ON public.submissions FOR DELETE
  USING (auth.uid() = user_id);

-- Allow users to delete own ai_logs via submission ownership
CREATE POLICY "Users can delete own ai_logs"
  ON public.ai_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = ai_logs.submission_id AND s.user_id = auth.uid()
    )
  );
