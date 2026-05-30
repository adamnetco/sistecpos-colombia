-- 1) Set search_path on parse_supplier_license
ALTER FUNCTION public.parse_supplier_license(text) SET search_path = public;

-- 2) Lock down EXECUTE on SECURITY DEFINER functions
-- Revoke from PUBLIC for all public SECURITY DEFINER functions, then grant per use case

-- Trigger / internal helpers: no role needs EXECUTE
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_master_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_pos_credential_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_certificate_to_contact() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_lead_to_contact() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_reseller_to_contact() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_access_summary() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.parse_supplier_license(text) FROM PUBLIC, anon, authenticated;

-- Service-role only (called from edge function with service_role key)
REVOKE EXECUTE ON FUNCTION public.upsert_lead_from_external_json_srv(jsonb) FROM PUBLIC, anon, authenticated;

-- Admin-only RPCs (check has_role inside): allow only authenticated
REVOKE EXECUTE ON FUNCTION public.delete_pos_user(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.find_related_by_contact(text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_all_pos_users() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_pos_users_for_lead(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_pos_users_for_license(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.insert_pos_user(uuid, text, text, text, text, text, text, text, uuid, uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.insert_pos_user_for_lead(uuid, text, text, text, text, text, text, text, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.migrate_lead_pos_users_to_license(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.search_profiles(text, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_pos_user(uuid, text, text, text, text, text, text, boolean, text, uuid, boolean, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.upsert_lead_from_external_json(jsonb) FROM PUBLIC, anon;

-- Auth-user-scoped: allow authenticated only
REVOKE EXECUTE ON FUNCTION public.get_client_pos_sessions(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.upsert_client_pos_session(uuid, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_google_tokens(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.upsert_google_tokens(uuid, text, text, timestamptz, text[], text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.link_reseller_on_login(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;

-- Public-facing endpoints used unauthenticated (activation page, payment results, view counters)
-- Already accessible by anon - keep as is, no revoke needed
-- get_lead_by_activation_token, get_wompi_transaction_by_reference, increment_video_view, increment_article_view
