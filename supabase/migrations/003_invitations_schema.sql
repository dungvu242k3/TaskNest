-- Migration 003: Create Team Invitations Table & RLS Policies

CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL DEFAULT 'edit', -- 'edit' | 'view'
    status TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'accepted' | 'canceled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view invitations for their email or created by them" ON public.team_invitations;
CREATE POLICY "Users can view invitations for their email or created by them"
ON public.team_invitations FOR SELECT
TO authenticated
USING (
  invited_by = auth.uid() OR status = 'pending'
);

DROP POLICY IF EXISTS "Authenticated users can send invitations" ON public.team_invitations;
CREATE POLICY "Authenticated users can send invitations"
ON public.team_invitations FOR INSERT
TO authenticated
WITH CHECK (invited_by = auth.uid());

DROP POLICY IF EXISTS "Invited users or creators can update invitation status" ON public.team_invitations;
CREATE POLICY "Invited users or creators can update invitation status"
ON public.team_invitations FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Creators can delete invitations" ON public.team_invitations;
CREATE POLICY "Creators can delete invitations"
ON public.team_invitations FOR DELETE
TO authenticated
USING (invited_by = auth.uid());
