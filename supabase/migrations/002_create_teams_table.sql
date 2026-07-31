-- Migration 002: Create Teams and Team Members Tables

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'admin' | 'member'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- 3. Enable RLS on both tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 4. Helper Security Definer Functions to bypass RLS recursion
CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS Policies for TEAMS
DROP POLICY IF EXISTS "Team members or owners can view teams" ON public.teams;
CREATE POLICY "Team members or owners can view teams"
ON public.teams FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR public.is_team_member(id, auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams"
ON public.teams FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Team owners can update teams" ON public.teams;
CREATE POLICY "Team owners can update teams"
ON public.teams FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Team owners can delete teams" ON public.teams;
CREATE POLICY "Team owners can delete teams"
ON public.teams FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- 6. RLS Policies for TEAM_MEMBERS
DROP POLICY IF EXISTS "Team members can view member lists" ON public.team_members;
CREATE POLICY "Team members can view member lists"
ON public.team_members FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR public.is_team_member(team_id, auth.uid())
);

DROP POLICY IF EXISTS "Team owners or admins can manage members" ON public.team_members;
CREATE POLICY "Team owners or admins can manage members"
ON public.team_members FOR ALL
TO authenticated
USING (
  public.is_team_member(team_id, auth.uid())
);

-- 7. Helper RPC Function to Create a Team and automatically add Owner to team_members
CREATE OR REPLACE FUNCTION public.create_team(p_name TEXT, p_description TEXT DEFAULT '')
RETURNS JSONB AS $$
DECLARE
  v_team_id UUID;
  v_result JSONB;
BEGIN
  -- Insert into teams
  INSERT INTO public.teams (name, description, owner_id)
  VALUES (p_name, p_description, auth.uid())
  RETURNING id INTO v_team_id;

  -- Insert owner into team_members
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (v_team_id, auth.uid(), 'owner');

  SELECT jsonb_build_object(
    'id', t.id,
    'name', t.name,
    'description', t.description,
    'owner_id', t.owner_id,
    'created_at', t.created_at
  ) INTO v_result
  FROM public.teams t
  WHERE t.id = v_team_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
