-- Migration 006: Comprehensive fix for team_invitations schema, UUID validation, UPSERT logic, and RLS policies

-- 1. Ensure ALL required columns exist in team_invitations table
ALTER TABLE public.team_invitations
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS invited_email TEXT,
ADD COLUMN IF NOT EXISTS note_id UUID,
ADD COLUMN IF NOT EXISTS team_id UUID,
ADD COLUMN IF NOT EXISTS workspace_id UUID,
ADD COLUMN IF NOT EXISTS note_title TEXT,
ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT 'email';

-- 2. Drop NOT NULL constraints on workspace_id, team_id, and note_id so invitations can be sent flexibly
ALTER TABLE public.team_invitations ALTER COLUMN workspace_id DROP NOT NULL;
ALTER TABLE public.team_invitations ALTER COLUMN team_id DROP NOT NULL;
ALTER TABLE public.team_invitations ALTER COLUMN note_id DROP NOT NULL;

-- Populate email from invited_email if email is NULL
UPDATE public.team_invitations
SET email = invited_email
WHERE email IS NULL AND invited_email IS NOT NULL;

-- Populate invited_email from email if invited_email is NULL
UPDATE public.team_invitations
SET invited_email = email
WHERE invited_email IS NULL AND email IS NOT NULL;

-- 3. Update stored procedure: invite_and_check_auth_provider with UPSERT (Prevents 409 Conflict on re-invites)
CREATE OR REPLACE FUNCTION public.invite_and_check_auth_provider(
    p_email TEXT,
    p_permission TEXT DEFAULT 'edit',
    p_note_id UUID DEFAULT NULL,
    p_team_id UUID DEFAULT NULL,
    p_note_title TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_target_user RECORD;
    v_provider_type TEXT := 'unregistered';
    v_invitation_id UUID;
    v_workspace_id UUID;
    v_existing_id UUID;
    v_result JSONB;
BEGIN
    v_workspace_id := COALESCE(p_team_id, '00000000-0000-0000-0000-000000000000'::uuid);

    -- Search for existing user in auth.users by email
    SELECT id, raw_app_meta_data, raw_user_meta_data
    INTO v_target_user
    FROM auth.users
    WHERE LOWER(email) = LOWER(p_email)
    LIMIT 1;

    IF v_target_user.id IS NOT NULL THEN
        IF COALESCE(v_target_user.raw_app_meta_data->>'provider', '') = 'google'
           OR COALESCE(v_target_user.raw_user_meta_data->>'iss', '') LIKE '%google%' THEN
            v_provider_type := 'google';
        ELSE
            v_provider_type := 'email';
        END IF;
    ELSE
        IF LOWER(p_email) LIKE '%@gmail.com' THEN
            v_provider_type := 'google';
        ELSE
            v_provider_type := 'email';
        END IF;
    END IF;

    -- Check if an active/pending invitation already exists for this email and note/team
    SELECT id INTO v_existing_id
    FROM public.team_invitations
    WHERE (LOWER(email) = LOWER(p_email) OR LOWER(invited_email) = LOWER(p_email))
      AND (
        (p_note_id IS NOT NULL AND note_id = p_note_id) OR
        (p_note_id IS NULL AND (team_id = p_team_id OR workspace_id = v_workspace_id))
      )
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
        -- Update existing invitation to prevent 409 Conflict
        UPDATE public.team_invitations
        SET permission = p_permission,
            status = 'pending',
            provider_type = v_provider_type,
            note_title = COALESCE(p_note_title, note_title),
            updated_at = NOW()
        WHERE id = v_existing_id;

        v_invitation_id := v_existing_id;
    ELSE
        -- Insert new invitation record
        INSERT INTO public.team_invitations (
            email,
            invited_email,
            note_id,
            note_title,
            team_id,
            workspace_id,
            invited_by,
            permission,
            status,
            provider_type
        ) VALUES (
            LOWER(p_email),
            LOWER(p_email),
            p_note_id,
            p_note_title,
            p_team_id,
            v_workspace_id,
            auth.uid(),
            p_permission,
            'pending',
            v_provider_type
        )
        RETURNING id INTO v_invitation_id;
    END IF;

    v_result := jsonb_build_object(
        'id', v_invitation_id,
        'email', LOWER(p_email),
        'permission', p_permission,
        'status', 'pending',
        'provider_type', v_provider_type,
        'note_id', p_note_id,
        'note_title', p_note_title,
        'created_at', NOW()
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.invite_and_check_auth_provider(TEXT, TEXT, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invite_and_check_auth_provider(TEXT, TEXT, UUID, UUID) TO authenticated;

-- 4. Robust RLS Policies for team_invitations
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view invitations for their email or created by them" ON public.team_invitations;
CREATE POLICY "Users can view invitations for their email or created by them"
ON public.team_invitations FOR SELECT
TO authenticated
USING (
  invited_by = auth.uid() 
  OR status = 'pending' 
  OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR (invited_email IS NOT NULL AND LOWER(invited_email) = LOWER(auth.jwt() ->> 'email'))
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
USING (invited_by = auth.uid() OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email')));
