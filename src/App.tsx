import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Film,
  MapPin,
  Menu,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Movie = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  genre: string;
  runtime_minutes: number;
  rating: string;
  release_label: string;
  poster_url: string;
  backdrop_url: string;
  featured: boolean;
};

type Showtime = {
  id: string;
  movie_id: string;
  show_date: string;
  show_time: string;
  auditorium: string;
  format: string;
  price: number;
  available_seats: number;
};

type BookingDetails = {
  name: string;
  email: string;
};

const posterImages = {
  lastSignal: 'https://images.pexels.com/photos/7672879/pexels-photo-7672879.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  afterRed: 'https://images.pexels.com/photos/7991488/pexels-photo-7991488.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  neonHorizon: 'https://images.pexels.com/photos/7170769/pexels-photo-7170769.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  orbitNine: 'https://images.pexels.com/photos/29146237/pexels-photo-29146237.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

const fallbackMovies: Movie[] = [
  { id: 'last-signal', title: 'The Last Signal', tagline: 'Every ending starts with a signal.', description: 'A lone astronaut receives a transmission from a world that should not exist and must choose between coming home and answering the call.', genre: 'Sci-fi', runtime_minutes: 128, rating: 'PG-13', release_label: 'Now showing', poster_url: posterImages.lastSignal, backdrop_url: posterImages.lastSignal, featured: true },
  { id: 'after-red', title: 'After the Red', tagline: 'Some memories never fade.', description: 'A celebrated photographer returns to her hometown and finds the past waiting in every frame.', genre: 'Drama', runtime_minutes: 112, rating: 'R', release_label: 'Now showing', poster_url: posterImages.afterRed, backdrop_url: posterImages.afterRed, featured: false },
  { id: 'neon-horizon', title: 'Neon Horizon', tagline: 'Find the light beyond the city.', description: 'Two strangers chase an impossible sunrise through a sleepless city where every choice changes the night.', genre: 'Thriller', runtime_minutes: 104, rating: 'PG-13', release_label: 'Now showing', poster_url: posterImages.neonHorizon, backdrop_url: posterImages.neonHorizon, featured: false },
  { id: 'orbit-nine', title: 'Orbit Nine', tagline: 'The mission was only the beginning.', description: 'A deep-space crew discovers that the route home has been rewritten by something watching from the dark.', genre: 'Sci-fi', runtime_minutes: 136, rating: 'PG-13', release_label: 'Coming soon', poster_url: posterImages.orbitNine, backdrop_url: posterImages.orbitNine, featured: false },
];

const formatDate = (date: string): string => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));

function App() {
  const [movies, setMovies] = useState<Movie[]>(fallbackMovies);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(fallbackMovies[0]);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeGenre, setActiveGenre] = useState('All films');
  const [search, setSearch] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalog = async (): Promise<void> => {
      const [movieResult, showtimeResult] = await Promise.all([
        supabase.from('movies').select('*').order('featured', { ascending: false }),
        supabase.from('showtimes').select('*').order('show_date').order('show_time'),
      ]);
      if (!movieResult.error && movieResult.data?.length) {
        setMovies(movieResult.data as Movie[]);
        setSelectedMovie(movieResult.data[0] as Movie);
      }
      if (!showtimeResult.error && showtimeResult.data) setShowtimes(showtimeResult.data as Showtime[]);
      setLoading(false);
    };
    void loadCatalog();
  }, []);

  const genres = useMemo(() => ['All films', ...Array.from(new Set(movies.map((movie) => movie.genre)))], [movies]);
  const filteredMovies = movies.filter((movie) => {
    const matchesGenre = activeGenre === 'All films' || movie.genre === activeGenre;
    const matchesSearch = movie.title.toLowerCase().includes(search.toLowerCase());
    return matchesGenre && matchesSearch;
  });
  const featuredMovie = movies.find((movie) => movie.featured) ?? movies[0];
  const movieShowtimes = showtimes.filter((showtime) => showtime.movie_id === selectedMovie?.id);
  const displayShowtimes = movieShowtimes.length ? movieShowtimes : [
    { id: 'demo-1', movie_id: selectedMovie?.id ?? '', show_date: new Date().toISOString().slice(0, 10), show_time: '12:30 PM', auditorium: 'Hall 01', format: 'IMAX', price: 14.5, available_seats: 48 },
    { id: 'demo-2', movie_id: selectedMovie?.id ?? '', show_date: new Date().toISOString().slice(0, 10), show_time: '3:45 PM', auditorium: 'Hall 02', format: 'Dolby', price: 16, available_seats: 48 },
    { id: 'demo-3', movie_id: selectedMovie?.id ?? '', show_date: new Date().toISOString().slice(0, 10), show_time: '7:15 PM', auditorium: 'Hall 01', format: 'IMAX', price: 18.5, available_seats: 48 },
  ];
  const totalPrice = selectedShowtime ? selectedShowtime.price * selectedSeats.length : 0;

  const openMovie = (movie: Movie): void => {
    setSelectedMovie(movie);
    setSelectedSeats([]);
    setSelectedShowtime(null);
    document.getElementById('showtimes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const chooseShowtime = (showtime: Showtime): void => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    setBookingOpen(true);
  };

  const toggleSeat = (seat: string): void => {
    setSelectedSeats((current) => current.includes(seat) ? current.filter((item) => item !== seat) : [...current, seat]);
  };

  const submitBooking = async (details: BookingDetails): Promise<void> => {
    if (!selectedShowtime || !selectedSeats.length) return;
    const reference = `IM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const { error } = await supabase.from('bookings').insert({
      booking_reference: reference,
      showtime_id: selectedShowtime.id.startsWith('demo-') ? null : selectedShowtime.id,
      customer_name: details.name,
      customer_email: details.email,
      seats: selectedSeats,
      total_price: totalPrice,
    });
    if (error && !selectedShowtime.id.startsWith('demo-')) return;
    setBookingOpen(false);
    setConfirmation(reference);
    setSelectedSeats([]);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#151515]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f7f5]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#top" className="flex items-center gap-2.5 text-xl font-semibold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e84932] text-white"><Film size={18} /></span>iMovies</a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-black/60 md:flex">
            <a className="text-black" href="#movies">Browse films</a><a href="#showtimes">Showtimes</a><a href="#experience">Our cinemas</a>
          </nav>
          <div className="flex items-center gap-3"><button className="hidden rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition hover:border-black/50 sm:block">Sign in</button><button onClick={() => setMobileMenuOpen((current) => !current)} className="rounded-full border border-black/15 p-2 md:hidden" aria-label="Toggle menu"><Menu size={19} /></button><button className="grid h-10 w-10 place-items-center rounded-full bg-[#151515] text-white transition hover:bg-[#e84932]" aria-label="Account"><UserRound size={17} /></button></div>
        </div>
        {mobileMenuOpen && <div className="border-t border-black/10 px-5 py-4 md:hidden"><div className="flex flex-col gap-4 text-sm font-medium"><a href="#movies" onClick={() => setMobileMenuOpen(false)}>Browse films</a><a href="#showtimes" onClick={() => setMobileMenuOpen(false)}>Showtimes</a><a href="#experience" onClick={() => setMobileMenuOpen(false)}>Our cinemas</a></div></div>}
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-[1280px] gap-8 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 lg:px-12 lg:pb-24 lg:pt-16">
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#e84932]"><Sparkles size={14} /> The cinema, reimagined</div>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.07em] sm:text-7xl">Make tonight<br /><span className="text-[#e84932]">movie night.</span></h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-black/60">Discover stories worth leaving the house for. Find your seat, grab your tickets, and let the lights go down.</p>
            <div className="mt-9 flex flex-wrap gap-3"><a href="#movies" className="inline-flex items-center gap-2 rounded-full bg-[#151515] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#e84932]">Explore films <ArrowRight size={16} /></a><button onClick={() => document.getElementById('showtimes')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 rounded-full border border-black/15 px-6 py-3.5 text-sm font-semibold transition hover:border-black/50">View showtimes</button></div>
            <div className="mt-12 flex items-center gap-5 border-t border-black/10 pt-6 text-sm text-black/50"><div><span className="block text-2xl font-semibold tracking-tight text-black">12</span> screens</div><div className="h-8 w-px bg-black/10" /><div><span className="block text-2xl font-semibold tracking-tight text-black">4.9</span> audience rating</div><div className="h-8 w-px bg-black/10" /><div><span className="block text-2xl font-semibold tracking-tight text-black">4K</span> projection</div></div>
          </div>
          <div className="relative min-h-[520px] overflow-hidden rounded-[28px] bg-[#1b1d24] shadow-2xl shadow-black/10 lg:min-h-[600px]">
            <img src={featuredMovie?.backdrop_url} alt={featuredMovie?.title} className="absolute inset-0 h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101115] via-[#101115]/15 to-black/10" />
            <div className="absolute left-6 top-6 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">Featured tonight</div>
            <div className="absolute bottom-7 left-7 right-7 text-white"><div className="mb-3 flex items-center gap-3 text-xs font-medium text-white/70"><span>{featuredMovie?.genre}</span><span className="h-1 w-1 rounded-full bg-white/60" /><span>{featuredMovie?.runtime_minutes} min</span><span className="h-1 w-1 rounded-full bg-white/60" /><span>{featuredMovie?.rating}</span></div><h2 className="text-4xl font-semibold tracking-[-0.06em]">{featuredMovie?.title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-white/70">{featuredMovie?.tagline}</p><button onClick={() => openMovie(featuredMovie)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e84932] hover:text-white">Book tickets <ArrowRight size={15} /></button></div>
          </div>
        </section>

        <section id="movies" className="border-t border-black/10 bg-white"><div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#e84932]">Curated for you</p><h2 className="text-4xl font-semibold tracking-[-0.06em]">Now showing</h2></div><div className="flex flex-col gap-3 sm:flex-row"><div className="flex items-center gap-2 rounded-full border border-black/10 bg-[#f7f7f5] px-4 py-2.5"><Search size={16} className="text-black/40" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-40 bg-transparent text-sm outline-none placeholder:text-black/40" placeholder="Search films" /></div><div className="flex gap-1 rounded-full bg-[#f7f7f5] p-1">{genres.map((genre) => <button key={genre} onClick={() => setActiveGenre(genre)} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${activeGenre === genre ? 'bg-[#151515] text-white' : 'text-black/50 hover:text-black'}`}>{genre}</button>)}</div></div></div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{filteredMovies.map((movie) => <MovieCard key={movie.id} movie={movie} onClick={() => openMovie(movie)} />)}</div>
          </div></section>

        <section id="showtimes" className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#e84932]">Plan your visit</p><h2 className="max-w-sm text-4xl font-semibold leading-[1.05] tracking-[-0.06em]">Pick a film.<br />Pick a time.<br />Take your seat.</h2><div className="mt-8 flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff0ed] text-[#e84932]"><MapPin size={19} /></div><div><p className="text-sm font-semibold">iMovies Downtown</p><p className="mt-1 text-xs text-black/50">18 Market Street, level 2</p></div><ChevronDown size={17} className="ml-auto text-black/40" /></div></div><div className="rounded-[24px] bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Showing</p><h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{selectedMovie?.title}</h3></div><div className="flex items-center gap-2 rounded-xl bg-[#f7f7f5] px-3 py-2 text-sm font-medium"><CalendarDays size={16} className="text-[#e84932]" /> {formatDate(displayShowtimes[0].show_date)}</div></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{loading ? <p className="text-sm text-black/50">Loading showtimes...</p> : displayShowtimes.slice(0, 6).map((showtime) => <button key={showtime.id} onClick={() => chooseShowtime(showtime)} className="group rounded-2xl border border-black/10 p-4 text-left transition hover:-translate-y-0.5 hover:border-[#e84932] hover:shadow-lg hover:shadow-[#e84932]/10"><div className="flex items-center justify-between"><span className="text-lg font-semibold">{showtime.show_time}</span><ArrowRight size={16} className="text-black/30 transition group-hover:text-[#e84932]" /></div><p className="mt-2 text-xs text-black/50">{showtime.format} · {showtime.auditorium}</p><p className="mt-4 text-sm font-semibold">${showtime.price.toFixed(2)} <span className="font-normal text-black/40">/ ticket</span></p></button>)}</div><p className="mt-6 flex items-center gap-2 text-xs text-black/40"><ShieldCheck size={14} className="text-[#23a26d]" /> Secure booking · Free cancellation up to 2 hours before</p></div></div></section>

        <section id="experience" className="bg-[#151515] text-white"><div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1fr_1fr] md:items-center lg:px-12 lg:py-20"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff8877]">More than a movie</p><h2 className="max-w-lg text-4xl font-semibold leading-[1.05] tracking-[-0.06em]">Designed for the way great stories feel.</h2><p className="mt-5 max-w-md text-base leading-7 text-white/55">From the first trailer to the final frame, every detail is made to get you closer to the screen.</p></div><div className="grid grid-cols-2 gap-3"><Feature icon={<Ticket size={19} />} title="Easy tickets" text="Book in under a minute." /><Feature icon={<Clock3 size={19} />} title="Flexible plans" text="Change your showtime." /><Feature icon={<Play size={19} />} title="Premium screens" text="IMAX and Dolby sound." /><Feature icon={<ShieldCheck size={19} />} title="Safe & secure" text="Your details stay private." /></div></div></section>
      </main>

      <footer className="border-t border-black/10 bg-[#f7f7f5]"><div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-8 text-sm text-black/45 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12"><div className="flex items-center gap-2 font-semibold text-black"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#e84932] text-white"><Film size={14} /></span>iMovies</div><p>Stories worth leaving the house for.</p><p>© 2026 iMovies Cinemas</p></div></footer>

      {bookingOpen && selectedShowtime && <BookingModal movie={selectedMovie} showtime={selectedShowtime} seats={selectedSeats} onToggleSeat={toggleSeat} total={totalPrice} onClose={() => setBookingOpen(false)} onSubmit={submitBooking} />}
      {confirmation && <Confirmation reference={confirmation} onClose={() => setConfirmation(null)} />}
    </div>
  );
}

function MovieCard({ movie, onClick }: { movie: Movie; onClick: () => void }) {
  return <button onClick={onClick} className="group text-left"><div className="relative aspect-[0.72] overflow-hidden rounded-2xl bg-[#ddd]"><img src={movie.poster_url} alt={movie.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-80" /><span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black">{movie.release_label}</span><span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white text-black opacity-0 shadow-lg transition group-hover:opacity-100"><ArrowRight size={15} /></span></div><div className="mt-4 flex items-start justify-between gap-3"><div><h3 className="font-semibold tracking-[-0.02em]">{movie.title}</h3><p className="mt-1 text-xs text-black/45">{movie.genre} · {movie.runtime_minutes} min</p></div><span className="rounded-md border border-black/10 px-1.5 py-1 text-[10px] font-semibold">{movie.rating}</span></div></button>;
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"><div className="mb-6 grid h-9 w-9 place-items-center rounded-lg bg-[#e84932] text-white">{icon}</div><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-white/45">{text}</p></div>; }

function BookingModal({ movie, showtime, seats, onToggleSeat, total, onClose, onSubmit }: { movie: Movie | null; showtime: Showtime; seats: string[]; onToggleSeat: (seat: string) => void; total: number; onClose: () => void; onSubmit: (details: BookingDetails) => Promise<void> }) {
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<BookingDetails>({ name: '', email: '' });
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 8;
  const reservedSeats = ['A3', 'B5', 'C2', 'D7', 'E1'];
  const canContinue = seats.length > 0;
  const canConfirm = details.name.trim().length > 1 && details.email.includes('@');
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[26px] bg-[#f7f7f5] shadow-2xl"><div className="flex items-start justify-between border-b border-black/10 p-6 sm:p-8"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e84932]">Reserve your seats</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">{movie?.title}</h2><p className="mt-1 text-sm text-black/50">{formatDate(showtime.show_date)} · {showtime.show_time} · {showtime.auditorium}</p></div><button onClick={onClose} className="rounded-full p-2 transition hover:bg-black/5" aria-label="Close"><X size={20} /></button></div><div className="p-6 sm:p-8">{step === 1 ? <><div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-semibold">Choose your seats</p><p className="mt-1 text-xs text-black/45">{showtime.format} presentation · ${showtime.price.toFixed(2)} each</p></div><div className="flex gap-3 text-[10px] text-black/45"><span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm border border-black/15 bg-white" /> Available</span><span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm bg-[#151515]" /> Selected</span></div></div><div className="mb-10 flex flex-col items-center"><div className="mb-8 h-1.5 w-2/3 rounded-full bg-gradient-to-r from-transparent via-[#e84932] to-transparent shadow-[0_0_24px_rgba(232,73,50,0.45)]" /><p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">Screen</p><div className="space-y-2.5">{rows.map((row) => <div key={row} className="flex items-center gap-2.5"><span className="w-4 text-xs font-semibold text-black/35">{row}</span>{Array.from({ length: seatsPerRow }, (_, index) => { const seat = `${row}${index + 1}`; const reserved = reservedSeats.includes(seat); const selected = seats.includes(seat); return <button key={seat} disabled={reserved} onClick={() => onToggleSeat(seat)} className={`grid h-8 w-8 place-items-center rounded-md text-[10px] font-semibold transition sm:h-9 sm:w-9 ${reserved ? 'cursor-not-allowed bg-black/10 text-black/20' : selected ? 'bg-[#151515] text-white shadow-lg shadow-black/20' : 'border border-black/10 bg-white text-black/50 hover:-translate-y-0.5 hover:border-[#e84932] hover:text-[#e84932]'}`}>{index + 1}</button>; })}</div>)}</div></div><div className="flex items-center justify-between border-t border-black/10 pt-6"><div><p className="text-xs text-black/45">{seats.length} {seats.length === 1 ? 'seat' : 'seats'} selected</p><p className="mt-1 text-xl font-semibold">${total.toFixed(2)}</p></div><button disabled={!canContinue} onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-full bg-[#151515] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e84932] disabled:cursor-not-allowed disabled:opacity-30">Continue <ArrowRight size={15} /></button></div></> : <><button onClick={() => setStep(1)} className="mb-7 text-sm font-medium text-black/50 transition hover:text-black">← Back to seats</button><p className="text-sm font-semibold">Where should we send your tickets?</p><p className="mt-1 text-xs text-black/45">Your confirmation will arrive instantly by email.</p><div className="mt-6 space-y-4"><label className="block text-xs font-semibold">Full name<input value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#e84932]" placeholder="Alex Morgan" /></label><label className="block text-xs font-semibold">Email address<input type="email" value={details.email} onChange={(event) => setDetails({ ...details, email: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#e84932]" placeholder="alex@example.com" /></label></div><div className="mt-8 flex items-center justify-between rounded-2xl bg-white p-4"><div><p className="text-xs text-black/45">Total for {seats.length} tickets</p><p className="mt-1 text-lg font-semibold">${total.toFixed(2)}</p></div><button disabled={!canConfirm} onClick={() => void onSubmit(details)} className="rounded-full bg-[#e84932] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c93b28] disabled:cursor-not-allowed disabled:opacity-30">Confirm booking</button></div></>}</div></div></div>;
}

function Confirmation({ reference, onClose }: { reference: string; onClose: () => void }) { return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-[26px] bg-[#f7f7f5] p-8 text-center shadow-2xl"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#dcf6ea] text-[#23a26d]"><Check size={30} /></div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#23a26d]">Booking confirmed</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">You’re all set.</h2><p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-black/50">Your tickets are reserved. We’ve sent the details to your inbox.</p><div className="mt-6 rounded-2xl bg-white p-4"><p className="text-xs text-black/40">Booking reference</p><p className="mt-1 text-lg font-semibold tracking-wider">{reference}</p></div><button onClick={onClose} className="mt-6 w-full rounded-full bg-[#151515] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e84932]">Done</button></div></div>; }

export default App;
