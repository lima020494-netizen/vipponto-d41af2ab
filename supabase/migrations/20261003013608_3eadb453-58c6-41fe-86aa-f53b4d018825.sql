CREATE POLICY "No direct client access to folha links"
ON public.folha_access_tokens
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);