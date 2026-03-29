CREATE POLICY "Laboratory can delete own notifications" ON "public"."notifications"
    FOR DELETE
    USING (("recipient_role" = 'laboratory'::text) AND ("laboratory_id" IN (
        SELECT "laboratory_users"."laboratory_id"
        FROM "public"."laboratory_users"
        WHERE (("laboratory_users"."user_id" = auth.uid()) AND "laboratory_users"."is_active")
    )));
