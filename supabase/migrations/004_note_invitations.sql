-- Migration 004: Note-level Invitations & RLS Policies

-- 1. Ensure team_invitations table exists
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
    email TEXT,
    invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL DEFAULT 'edit',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist even if team_invitations table already existed
ALTER TABLE public.team_invitations
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS permission TEXT DEFAULT 'edit',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Enable RLS on team_invitations
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view invitations for their email or created by them" ON public.team_invitations;
CREATE POLICY "Users can view invitations for their email or created by them"
ON public.team_invitations FOR SELECT
TO authenticated
USING (
  invited_by = auth.uid() OR status = 'pending' OR (email IS NOT NULL AND email = (auth.jwt() ->> 'email'))
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

-- 2. Allow RLS access for invited note members on public.notes
DROP POLICY IF EXISTS "Users can view notes where invited or member" ON public.notes;
CREATE POLICY "Users can view notes where invited or member"
ON public.notes FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR (
    is_private = false AND (
      id IN (
        SELECT nm.note_id FROM public.note_members nm
        WHERE nm.user_id = auth.uid() AND nm.status = 'accepted'
      )
      OR id IN (
        SELECT ti.note_id FROM public.team_invitations ti
        WHERE ti.note_id IS NOT NULL AND ti.email IS NOT NULL AND ti.email = (auth.jwt() ->> 'email') AND ti.status = 'accepted'
      )
    )
  )
);
