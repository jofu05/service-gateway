
-- Create action_templates table
CREATE TABLE public.action_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'rest_api',
  method text NOT NULL DEFAULT 'POST',
  endpoint text,
  input_template jsonb DEFAULT '{}'::jsonb,
  output_mapping jsonb DEFAULT '{}'::jsonb,
  error_config jsonb DEFAULT '{"retry": false, "fallback": ""}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.action_templates ENABLE ROW LEVEL SECURITY;

-- Admins and editors can view
CREATE POLICY "Editors and admins can view action_templates"
  ON public.action_templates FOR SELECT
  USING (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Only admins can manage
CREATE POLICY "Admins can manage action_templates"
  ON public.action_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_action_templates_updated_at
  BEFORE UPDATE ON public.action_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
