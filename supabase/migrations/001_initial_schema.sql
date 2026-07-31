-- TaskNest Database Schema & Row Level Security (RLS) Policies

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create All Tables First
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    is_private BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'P2',
    due_date DATE,
    tags TEXT[] DEFAULT '{}',
    checklist JSONB DEFAULT '[]'::jsonb,
    pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.note_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL DEFAULT 'view', -- 'view' | 'edit'
    status TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'accepted'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(note_id, user_id)
);

-- 3. Enable RLS on All Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_members ENABLE ROW LEVEL SECURITY;

-- 4. Auth User Profile Trigger
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

-- 5. RLS Policies for PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 6. RLS Policies for NOTES
DROP POLICY IF EXISTS "Users can view own notes or invited shared notes" ON public.notes;
CREATE POLICY "Users can view own notes or invited shared notes"
ON public.notes FOR SELECT
TO authenticated
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
ON public.notes FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners and editors can update notes" ON public.notes;
CREATE POLICY "Owners and editors can update notes"
ON public.notes FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() OR id IN (
    SELECT note_id FROM public.note_members
    WHERE user_id = auth.uid() AND permission = 'edit' AND status = 'accepted'
  )
);

DROP POLICY IF EXISTS "Only owners can delete notes" ON public.notes;
CREATE POLICY "Only owners can delete notes"
ON public.notes FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- 7. RLS Policies for NOTE_MEMBERS
DROP POLICY IF EXISTS "Members can view their own invitations or note members" ON public.note_members;
CREATE POLICY "Members can view their own invitations or note members"
ON public.note_members FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR note_id IN (
    SELECT id FROM public.notes WHERE owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Note owners can manage note members" ON public.note_members;
CREATE POLICY "Note owners can manage note members"
ON public.note_members FOR ALL
TO authenticated
USING (
  note_id IN (SELECT id FROM public.notes WHERE owner_id = auth.uid())
);
