/*
# Create iMovies catalog and booking tables

1. New Tables
- `movies`: public movie catalog records with title, description, genre, runtime, rating, poster image, hero image, and featured status.
- `showtimes`: public screening options linked to a movie, including auditorium, date, time, format, price, and available seats.
- `bookings`: public booking records for this single-tenant demo, storing contact details, selected showtime, seats, total price, and booking reference.

2. Security
- Row level security is enabled on all three tables.
- Anonymous and authenticated users can read the public movie and showtime catalog.
- Anonymous and authenticated users can create bookings and read bookings for this shared demo experience.
- Update and delete access is not exposed to the browser.

3. Important Notes
- This is intentionally a no-sign-in cinema demo, so catalog and booking policies are shared rather than user-owned.
- Seat availability is represented on each showtime and is updated by the client for this demo flow.
*/

CREATE TABLE IF NOT EXISTS public.movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  tagline text NOT NULL,
  description text NOT NULL,
  genre text NOT NULL,
  runtime_minutes integer NOT NULL CHECK (runtime_minutes > 0),
  rating text NOT NULL,
  release_label text NOT NULL,
  poster_url text NOT NULL,
  backdrop_url text NOT NULL,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.showtimes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  show_date date NOT NULL,
  show_time text NOT NULL,
  auditorium text NOT NULL,
  format text NOT NULL DEFAULT 'Digital',
  price numeric(8,2) NOT NULL CHECK (price >= 0),
  available_seats integer NOT NULL DEFAULT 48 CHECK (available_seats >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference text NOT NULL UNIQUE,
  showtime_id uuid NOT NULL REFERENCES public.showtimes(id),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  seats text[] NOT NULL,
  total_price numeric(8,2) NOT NULL CHECK (total_price >= 0),
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS showtimes_movie_date_idx ON public.showtimes(movie_id, show_date);
CREATE INDEX IF NOT EXISTS bookings_showtime_idx ON public.bookings(showtime_id);

ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.movies TO anon, authenticated;
GRANT SELECT ON public.showtimes TO anon, authenticated;
GRANT SELECT, INSERT ON public.bookings TO anon, authenticated;

DROP POLICY IF EXISTS "Public can view movies" ON public.movies;
CREATE POLICY "Public can view movies" ON public.movies FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can view showtimes" ON public.showtimes;
CREATE POLICY "Public can view showtimes" ON public.showtimes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can view bookings" ON public.bookings;
CREATE POLICY "Public can view bookings" ON public.bookings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
CREATE POLICY "Public can create bookings" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

INSERT INTO public.movies (title, tagline, description, genre, runtime_minutes, rating, release_label, poster_url, backdrop_url, featured)
SELECT * FROM (VALUES
  ('The Last Signal', 'Every ending starts with a signal.', 'A lone astronaut receives a transmission from a world that should not exist and must choose between coming home and answering the call.', 'Sci-fi', 128, 'PG-13', 'Now showing', 'https://images.pexels.com/photos/7672879/pexels-photo-7672879.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/7672879/pexels-photo-7672879.jpeg?auto=compress&cs=tinysrgb&w=1600', true),
  ('After the Red', 'Some memories never fade.', 'A celebrated photographer returns to her hometown and finds the past waiting in every frame.', 'Drama', 112, 'R', 'Now showing', 'https://images.pexels.com/photos/7991488/pexels-photo-7991488.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/7991488/pexels-photo-7991488.jpeg?auto=compress&cs=tinysrgb&w=1600', false),
  ('Neon Horizon', 'Find the light beyond the city.', 'Two strangers chase an impossible sunrise through a sleepless city where every choice changes the night.', 'Thriller', 104, 'PG-13', 'Now showing', 'https://images.pexels.com/photos/7170769/pexels-photo-7170769.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/7170769/pexels-photo-7170769.jpeg?auto=compress&cs=tinysrgb&w=1600', false),
  ('Orbit Nine', 'The mission was only the beginning.', 'A deep-space crew discovers that the route home has been rewritten by something watching from the dark.', 'Sci-fi', 136, 'PG-13', 'Coming soon', 'https://images.pexels.com/photos/29146237/pexels-photo-29146237.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/29146237/pexels-photo-29146237.jpeg?auto=compress&cs=tinysrgb&w=1600', false)
) AS seed(title, tagline, description, genre, runtime_minutes, rating, release_label, poster_url, backdrop_url, featured)
WHERE NOT EXISTS (SELECT 1 FROM public.movies WHERE public.movies.title = seed.title);

INSERT INTO public.showtimes (movie_id, show_date, show_time, auditorium, format, price)
SELECT m.id, d.show_date, s.show_time, s.auditorium, s.format, s.price
FROM public.movies m
CROSS JOIN (VALUES (CURRENT_DATE), (CURRENT_DATE + 1), (CURRENT_DATE + 2)) AS d(show_date)
CROSS JOIN (VALUES ('12:30 PM', 'Hall 01', 'IMAX', 14.50), ('3:45 PM', 'Hall 02', 'Dolby', 16.00), ('7:15 PM', 'Hall 01', 'IMAX', 18.50), ('9:40 PM', 'Hall 03', 'Digital', 13.00)) AS s(show_time, auditorium, format, price)
WHERE NOT EXISTS (SELECT 1 FROM public.showtimes st WHERE st.movie_id = m.id AND st.show_date = d.show_date AND st.show_time = s.show_time);