
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('user', 'manager', 'editor', 'admin');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  ad_groups JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Flow statuses
CREATE TYPE public.flow_status AS ENUM ('draft', 'published', 'archived');

-- Flows
CREATE TABLE public.flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  target_type TEXT DEFAULT 'incident',
  status flow_status NOT NULL DEFAULT 'draft',
  current_version INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view published flows" ON public.flows FOR SELECT TO authenticated USING (status = 'published' OR public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Editors can manage flows" ON public.flows FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin'));

-- Flow versions
CREATE TABLE public.flow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES public.flows(id) ON DELETE CASCADE NOT NULL,
  version INT NOT NULL,
  status flow_status NOT NULL DEFAULT 'draft',
  tree_json JSONB DEFAULT '{}'::jsonb,
  mapping_json JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.flow_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view published versions" ON public.flow_versions FOR SELECT TO authenticated USING (status = 'published' OR public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Editors can manage versions" ON public.flow_versions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin'));

-- Submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_version_id UUID REFERENCES public.flow_versions(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers_json JSONB DEFAULT '{}'::jsonb,
  pob_ticket_id TEXT,
  pob_status_cache TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own submissions" ON public.submissions FOR UPDATE USING (auth.uid() = user_id);

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  payload_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);

-- Integration logs
CREATE TABLE public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id TEXT,
  endpoint TEXT,
  request_meta JSONB,
  response_meta JSONB,
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view integration logs" ON public.integration_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert integration logs" ON public.integration_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON public.flows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
