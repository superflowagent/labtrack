-- Restore GRANT permissions for core tables (revoked by incorrect remote_schema migration)
GRANT ALL ON TABLE "public"."clinics" TO "anon";
GRANT ALL ON TABLE "public"."clinics" TO "authenticated";
GRANT ALL ON TABLE "public"."clinics" TO "service_role";

GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";

GRANT ALL ON TABLE "public"."laboratories" TO "anon";
GRANT ALL ON TABLE "public"."laboratories" TO "authenticated";
GRANT ALL ON TABLE "public"."laboratories" TO "service_role";

GRANT ALL ON TABLE "public"."patients" TO "anon";
GRANT ALL ON TABLE "public"."patients" TO "authenticated";
GRANT ALL ON TABLE "public"."patients" TO "service_role";

GRANT ALL ON TABLE "public"."specialists" TO "anon";
GRANT ALL ON TABLE "public"."specialists" TO "authenticated";
GRANT ALL ON TABLE "public"."specialists" TO "service_role";

-- Recreate RLS policies (dropped by incorrect remote_schema migration)
CREATE POLICY "Clinics are managed by owner" ON "public"."clinics" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "Jobs are scoped to clinic" ON "public"."jobs" USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"()))))))) WITH CHECK (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"())))))));

CREATE POLICY "Laboratories are scoped to clinic" ON "public"."laboratories" USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"()))))))) WITH CHECK (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"())))))));

CREATE POLICY "Patients are scoped to clinic" ON "public"."patients" USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"()))))))) WITH CHECK (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"())))))));

CREATE POLICY "Specialists are scoped to clinic" ON "public"."specialists" USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"()))))))) WITH CHECK (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"())))))));
