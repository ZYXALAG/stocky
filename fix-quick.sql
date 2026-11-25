-- =====================================================
-- STOCKY - Script de correction rapide (GRANTs + trigger)
-- =====================================================

-- GRANTs pour toutes les tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.templates TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fields TO anon, authenticated;

-- Table alert_settings
CREATE TABLE IF NOT EXISTS public.alert_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  global_threshold INT NOT NULL DEFAULT 10,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own alert settings" ON public.alert_settings;
CREATE POLICY "Users manage own alert settings"
  ON public.alert_settings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.alert_settings TO anon, authenticated;

-- Trigger handle_new_user corrigé
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fin
SELECT '✅ Corrections appliquées avec succès' AS status;
