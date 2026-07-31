-- Migration 001: Notes & Checklist Schema (NotesPage.tsx & NoteDetailPage.tsx)
-- Compatible with PostgreSQL 15+ & Supabase

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Profiles Table (Auth Sync)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes Table (Work Notes Entity)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    is_private BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'todo', -- 'todo' | 'in_progress' | 'completed'
    priority TEXT DEFAULT 'P2', -- 'P1' | 'P2' | 'P3'
    due_date DATE,
    tags TEXT[] DEFAULT '{}',
    checklist JSONB DEFAULT '[]'::jsonb,
    pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note Members Junction Table (Collaborators)
CREATE TABLE IF NOT EXISTS public.note_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL DEFAULT 'view', -- 'owner' | 'edit' | 'view'
    status TEXT NOT NULL DEFAULT 'accepted',  -- 'pending' | 'accepted'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(note_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notes_owner_id ON public.notes(owner_id);
CREATE INDEX IF NOT EXISTS idx_note_members_note_id ON public.note_members(note_id);
CREATE INDEX IF NOT EXISTS idx_note_members_user_id ON public.note_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_owner_pinned_updated ON public.notes(owner_id, pinned DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tags_gin ON public.notes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_notes_checklist_gin ON public.notes USING gin(checklist);
CREATE INDEX IF NOT EXISTS idx_notes_title_trgm ON public.notes USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_notes_content_trgm ON public.notes USING gin(content gin_trgm_ops);

-- Triggers & Functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view own or shared notes" ON public.notes;
CREATE POLICY "Users can view own or shared notes"
ON public.notes FOR SELECT TO authenticated
USING (
  owner_id = auth.uid() OR (
    is_private = false AND id IN (
      SELECT note_id FROM public.note_members
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  )
);

DROP POLICY IF EXISTS "Users can create notes" ON public.notes;
CREATE POLICY "Users can create notes"
ON public.notes FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners and editors can update notes" ON public.notes;
CREATE POLICY "Owners and editors can update notes"
ON public.notes FOR UPDATE TO authenticated
USING (
  owner_id = auth.uid() OR id IN (
    SELECT note_id FROM public.note_members
    WHERE user_id = auth.uid() AND permission IN ('owner', 'edit') AND status = 'accepted'
  )
);

DROP POLICY IF EXISTS "Only owners can delete notes" ON public.notes;
CREATE POLICY "Only owners can delete notes"
ON public.notes FOR DELETE TO authenticated
USING (owner_id = auth.uid());
