CREATE TABLE public.county_news_posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 author_id uuid NOT NULL,
 author_name text NOT NULL CHECK (char_length(btrim(author_name)) BETWEEN 1 AND 120),
 county text NOT NULL CHECK (county IN ('Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa','Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi','Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos','Makueni','Mandera','Marsabit','Meru','Migori','Mombasa','Murang''a','Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri','Samburu','Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia','Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot')),
 title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
 summary text NOT NULL DEFAULT '' CHECK (char_length(summary) <= 500),
 body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 50000),
 category text NOT NULL DEFAULT 'Governor updates' CHECK (category IN ('Governor updates','Campaign trail','County affairs','Statement')),
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
 cover_url text CHECK (cover_url IS NULL OR cover_url ~ '^https://'),
 source_url text CHECK (source_url IS NULL OR source_url ~ '^https://'),
 published_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.county_news_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.county_news_posts TO authenticated;
GRANT ALL ON public.county_news_posts TO service_role;
ALTER TABLE public.county_news_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published county news" ON public.county_news_posts FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins read drafts" ON public.county_news_posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create county news" ON public.county_news_posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND author_id = auth.uid());
CREATE POLICY "Admins edit county news" ON public.county_news_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete county news" ON public.county_news_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX county_news_published_idx ON public.county_news_posts (county, status, published_at DESC);
CREATE FUNCTION public.stamp_county_news() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN
 NEW.updated_at = now();
 IF TG_OP = 'UPDATE' THEN NEW.author_id = OLD.author_id; END IF;
 IF NEW.status = 'published' THEN
  IF TG_OP = 'INSERT' THEN NEW.published_at = now();
  ELSIF OLD.status <> 'published' OR OLD.published_at IS NULL THEN NEW.published_at = now();
  ELSE NEW.published_at = OLD.published_at; END IF;
 ELSE NEW.published_at = NULL; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER stamp_county_news BEFORE INSERT OR UPDATE ON public.county_news_posts FOR EACH ROW EXECUTE FUNCTION public.stamp_county_news();
CREATE POLICY "Admins upload county news images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'county-news-images' AND public.has_role(auth.uid(), 'admin') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admins manage county news images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'county-news-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins remove county news images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'county-news-images' AND public.has_role(auth.uid(), 'admin'));