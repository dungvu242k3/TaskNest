-- Migration 003: Team Management & Invitations (TeamPage.tsx)
-- Compatible with PostgreSQL 15+ & Supabase

-- Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'TaskNest Team Workspace',
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace Members Table
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'admin' | 'member'
    status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'inactive'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- Team Pending Invitations Table
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL DEFAULT 'edit', -- 'edit' | 'view'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'revoked'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Activities Audit Log Table
CREATE TABLE IF NOT EXISTS public.team_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
    note_title TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_team_activities_user_id ON public.team_activities(user_id);

-- Stored Procedure: Remove Member from Team Workspace
CREATE OR REPLACE FUNCTION public.remove_workspace_member(p_workspace_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete member from workspace
    DELETE FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = p_user_id;

    -- Delete member from all shared notes in that workspace
    DELETE FROM public.note_members
    WHERE user_id = p_user_id AND note_id IN (
        SELECT id FROM public.notes WHERE owner_id IN (
            SELECT owner_id FROM public.workspaces WHERE id = p_workspace_id
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activities ENABLE ROW LEVEL SECURITY;

-- Workspaces Policies
DROP POLICY IF EXISTS "Members can view their workspaces" ON public.workspaces;
CREATE POLICY "Members can view their workspaces"
ON public.workspaces FOR SELECT TO authenticated
USING (
    owner_id = auth.uid() OR id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
);

-- Workspace Members Policies
DROP POLICY IF EXISTS "Members can view workspace member list" ON public.workspace_members;
CREATE POLICY "Members can view workspace member list"
ON public.workspace_members FOR SELECT TO authenticated
USING (true);

-- Team Invitations Policies
DROP POLICY IF EXISTS "Owners can manage invitations" ON public.team_invitations;
CREATE POLICY "Owners can manage invitations"
ON public.team_invitations FOR ALL TO authenticated
USING (invited_by = auth.uid());

-- Team Activities Policies
DROP POLICY IF EXISTS "Authenticated users can view team activities" ON public.team_activities;
CREATE POLICY "Authenticated users can view team activities"
ON public.team_activities FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can log activities" ON public.team_activities;
CREATE POLICY "Authenticated users can log activities"
ON public.team_activities FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
