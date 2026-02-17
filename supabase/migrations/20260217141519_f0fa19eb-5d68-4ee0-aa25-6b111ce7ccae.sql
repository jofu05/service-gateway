
-- Add ai_config_json to flow_versions
ALTER TABLE public.flow_versions ADD COLUMN IF NOT EXISTS ai_config_json jsonb DEFAULT '{}'::jsonb;

-- Add runtime_context_json to submissions
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS runtime_context_json jsonb DEFAULT NULL;

-- Create ai_logs table
CREATE TABLE public.ai_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.submissions(id) ON DELETE CASCADE,
  step_id text NOT NULL,
  trigger text NOT NULL,
  input_meta jsonb DEFAULT '{}'::jsonb,
  output_suggestions jsonb DEFAULT '[]'::jsonb,
  accepted boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai_logs"
  ON public.ai_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = ai_logs.submission_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own ai_logs"
  ON public.ai_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = ai_logs.submission_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all ai_logs"
  ON public.ai_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
