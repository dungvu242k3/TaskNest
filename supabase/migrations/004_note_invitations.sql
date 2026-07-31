-- Migration 004: Add note_id to team_invitations for Note-level Sharing

ALTER TABLE public.team_invitations
ADD COLUMN IF NOT EXISTS note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE;

-- Allow RLS access for invited note members
DROP POLICY IF EXISTS "Users can view notes where invited or member" ON public.notes;
CREATE POLICY "Users can view notes where invited or member"
ON public.notes FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR (
    is_private = false AND (
      id IN (
        SELECT note_id FROM public.note_members
        WHERE note_members.user_id = auth.uid() AND note_members.status = 'accepted'
      )
      OR id IN (
        SELECT note_id FROM public.team_invitations
        WHERE team_invitations.email = (auth.jwt() ->> 'email') AND team_invitations.status = 'accepted'
      )
    )
  )
);
