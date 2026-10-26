import { createContext, useContext, useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
  Navigate,
} from "react-router-dom";

import axios from "axios";

import {
Sprout,
LogOut,
LayoutDashboard,
Package,
Inbox,
Search,
ClipboardList,
Handshake,
CheckCircle2,
MapPin,
CalendarDays,
} from "lucide-react";

// ---------- Mock data (replace with API calls later) ----------

// ---------- State ----------
const Ctx = createContext();
const useApp = () => useContext(Ctx);
const uid = () => Math.random().toString(36).slice(2, 8);
const btn = "inline-flex items-center justify-center gap-1 bg-green-700 text-white px-4 py-2.5 rounded-xl hover:bg-green-800 text-sm font-medium shadow-sm transition";
const btn2 = "inline-flex items-center justify-center gap-1 border border-green-700 text-green-800 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-50 transition";
const inp = "w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600/40 focus:border-green-600";
const cardBase = "bg-white border border-stone-200 rounded-2xl shadow-sm";
const card = cardBase + " p-5";
const EMOJI = { tomato: "🍅", onion: "🧅", chilli: "🌶️", rice: "🌾", maize: "🌽", banana: "🍌", mango: "🥭", groundnut: "🥜", turmeric: "🟡", cotton: "☁️" };
const emoji = (c) => EMOJI[c.toLowerCase()] || "🌱";
const API_URL = "http://localhost:5000/api";


const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("agrisetu_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


const LINKS = {
  farmer: [
    ["Dashboard", "/farmer/dashboard", LayoutDashboard],
    ["My Produce", "/farmer/produce", Package],
    ["Requests", "/farmer/requests", Inbox],
    ["Connections", "/farmer/connections", Handshake]
  ],

  buyer: [
    ["Dashboard", "/buyer/dashboard", LayoutDashboard],
    ["Search", "/buyer/search", Search],
    ["Requirements", "/buyer/requirements", ClipboardList],
    ["Connections", "/buyer/connections", Handshake]
  ]
};

const Badge = ({ s }) => {
  const c = ["accepted", "Available", "Open"].includes(s) ? "bg-green-100 text-green-800" : s === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800";
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${c}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{s}</span>;
};

function Page({ role, children }) {
  const { user, setUser } = useApp();
  
  const nav = useNavigate();
const loc = useLocation(); 
 if (!user || user.role !== role) return <Navigate to="/login" />;
  return (
    <div className="min-h-screen bg-cream text-stone-800 md:flex">

<aside className="md:w-60 md:fixed md:inset-y-0 md:left-0 bg-green-950 text-green-50 p-3 md:p-5 flex md:flex-col items-center md:items-stretch gap-2 md:gap-3 overflow-x-auto md:overflow-y-auto border-r border-green-800/50">
  <Link
    to="/"
    className="flex items-center gap-2 font-serif text-xl font-semibold md:mb-6 shrink-0"
  >
    <span className="bg-green-700 p-1.5 rounded-lg">
      <Sprout size={18} />
    </span>
    AgriSetu
  </Link>

  {LINKS[role].map(([t, to, Icon]) => (
    <Link
      key={to}
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm shrink-0 transition ${
        loc.pathname === to || loc.pathname.startsWith(to + "/")
          ? "bg-green-700 text-white shadow-sm"
          : "text-green-100 hover:bg-green-800/80 hover:text-white"
      }`}
    >
      <Icon size={16} />
      {t}
    </Link>
  ))}

  <div className="ml-auto md:ml-0 md:mt-auto flex items-center gap-2 border-t border-green-800 md:pt-4 shrink-0">
    <span className="w-8 h-8 rounded-full bg-amber-200 text-green-900 grid place-items-center font-semibold text-sm">
      {(user.name || "U")[0].toUpperCase()}
    </span>

    <span className="hidden md:block text-sm flex-1 truncate">
      {user.name}
    </span>

    <button
      title="Logout"
      aria-label="Logout"
      className="p-2 rounded-lg hover:bg-green-800"
      onClick={() => {
        localStorage.removeItem("agrisetu_token");
        localStorage.removeItem("agrisetu_user");
        setUser(null);
        nav("/");
      }}
    >
      <LogOut size={16} />
    </button>
  </div>
</aside>
<main className="md:ml-60 min-h-screen min-w-0 flex-1
  bg-[#fafaf7] px-4 py-5 sm:px-6 sm:py-7
  lg:px-10 lg:py-8">
  <div className="mx-auto w-full max-w-[1440px] space-y-7">
    {children}
  </div>
</main>    </div>
  );
}


const Table = ({
  heads,
  rows,
  rowIds = [],
  highlightedId = null,
  onRowClick = null,
}) => (
  <div className={`${cardBase} overflow-x-auto`}>
    <table className="w-full text-sm">
      <thead className="bg-green-50 text-left text-xs uppercase tracking-wide text-green-900">
        <tr>
          {heads.map((h) => (
            <th key={h} className="p-3 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 && (
          <tr>
            <td
              className="p-8 text-center text-stone-500"
              colSpan={heads.length}
            >
              🌱 Nothing here yet.
            </td>
          </tr>
        )}

        {rows.map((r, i) => {
          const id = rowIds[i];
          const isHighlighted =
            highlightedId && id === highlightedId;

          return (
            <tr
              key={id || i}
              id={id ? `produce-${id}` : undefined}
              onClick={
                onRowClick && id
                  ? () => onRowClick(id)
                  : undefined
              }
              className={`border-t border-stone-100 transition-colors ${
                onRowClick && id ? "cursor-pointer" : ""
              } ${
                isHighlighted
                  ? "bg-green-100 ring-2 ring-inset ring-green-600"
                  : "hover:bg-stone-50"
              }`}
            >
              {r.map((c, j) => (
                <td key={j} className="p-3">
                  {c}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const Stat = ({ n, label }) => {
  const Icon = /Listing/.test(label) ? Package : /Requirement/.test(label) ? ClipboardList : /Request/.test(label) ? Inbox : Handshake;
  return (
    <div className={`${card} flex items-center gap-4 hover:shadow-md hover:border-green-200 transition-all duration-200`}>
      <div className="bg-green-50 text-green-800 rounded-2xl p-3 ring-1 ring-green-100"><Icon size={22} /></div>
      <div><div className="font-serif text-3xl font-semibold text-green-900">{n}</div><div className="text-xs text-stone-500">{label}</div></div>
    </div>
  );
};

// ---------- Public ----------
const Check = ({ children }) => <li className="flex gap-2 text-sm"><CheckCircle2 size={18} className="text-green-700 shrink-0" />{children}</li>;
const Logo = () => <span className="flex items-center gap-2 font-serif text-xl font-semibold text-green-900"><span className="bg-green-800 text-white p-1.5 rounded-lg"><Sprout size={18} /></span>AgriSetu</span>;

function Landing() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">

      {/* Navbar */}
      <nav className="border-b border-stone-200 bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center shadow-sm">
              <Sprout className="text-white" size={22} />
            </div>
            <div>
              <div className="text-xl font-bold text-green-900">AgriSetu</div>
              <div className="text-[10px] tracking-wider text-stone-500 uppercase">
                Farmers • Buyers • Connections
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-50 rounded-xl transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className={btn}
            >
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-stone-50 to-amber-50" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-14 items-center">

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6">
              <Sprout size={16} />
              Connecting Agriculture Directly
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-green-950 leading-tight">
              From the
              <span className="text-green-700"> Farm </span>
              to the
              <span className="text-amber-700"> Right Buyer.</span>
            </h1>

            <p className="mt-6 text-lg text-stone-600 leading-relaxed max-w-xl">
              AgriSetu helps farmers showcase their produce and connect
              directly with genuine buyers — making agricultural trade
              simpler, clearer and more accessible.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/register"
                className={`${btn} px-6 py-3`}
              >
                Get Started
              </Link>

              <Link
                to="/login"
                className={`${btn2} px-6 py-3`}
              >
                Explore AgriSetu
              </Link>
            </div>

            <div className="flex gap-8 mt-10 pt-8 border-t border-stone-200">
              <div>
                <div className="text-2xl font-bold text-green-900">Direct</div>
                <div className="text-sm text-stone-500">Connections</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-green-900">Local</div>
                <div className="text-sm text-stone-500">Opportunities</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-green-900">Simple</div>
                <div className="text-sm text-stone-500">Marketplace</div>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-green-200/50 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-amber-200/50 rounded-full blur-2xl" />

            <div className="relative bg-white border border-stone-200 rounded-[2rem] p-6 shadow-xl">

              <div className="rounded-2xl bg-gradient-to-br from-green-800 to-green-950 p-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-green-200 text-sm">AgriSetu Marketplace</p>
                    <h2 className="text-2xl font-semibold mt-1">
                      Fresh produce.
                    </h2>
                    <h2 className="text-2xl font-semibold">
                      Genuine buyers.
                    </h2>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Sprout size={26} />
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl">🍅</div>
                    <p className="mt-2 font-medium">Tomato</p>
                    <p className="text-xs text-green-200">Grade A</p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl">🌶️</div>
                    <p className="mt-2 font-medium">Chilli</p>
                    <p className="text-xs text-green-200">Available</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <Package className="mx-auto text-green-700" size={20} />
                  <p className="text-xs mt-2 text-stone-600">Produce</p>
                </div>

                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <Search className="mx-auto text-green-700" size={20} />
                  <p className="text-xs mt-2 text-stone-600">Discover</p>
                </div>

                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <Handshake className="mx-auto text-green-700" size={20} />
                  <p className="text-xs mt-2 text-stone-600">Connect</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-20">

          <div className="text-center max-w-2xl mx-auto">
            <p className="text-green-700 font-semibold text-sm uppercase tracking-wider">
              How AgriSetu works
            </p>

            <h2 className="text-3xl font-bold text-green-950 mt-2">
              A simpler way to connect
            </h2>

            <p className="text-stone-500 mt-3">
              Bring farmers and buyers together through a straightforward
              digital marketplace.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">

            {[
              {
                icon: Package,
                title: "List Produce",
                text: "Farmers can add their available crops with quantity, quality and district."
              },
              {
                icon: Search,
                title: "Discover",
                text: "Buyers can search and filter available produce based on their requirements."
              },
              {
                icon: Handshake,
                title: "Connect",
                text: "Interested buyers can send connection requests and start direct communication."
              }
            ].map((item, i) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-stone-50 border border-stone-200 rounded-2xl p-7 hover:-translate-y-1 hover:shadow-lg transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Icon className="text-green-700" size={23} />
                  </div>

                  <div className="text-xs text-stone-400 mt-6">
                    0{i + 1}
                  </div>

                  <h3 className="text-lg font-bold text-green-950 mt-1">
                    {item.title}
                  </h3>

                  <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-950">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center text-white">
          <Sprout className="mx-auto mb-4 text-green-300" size={32} />

          <h2 className="text-3xl font-bold">
            Ready to connect through AgriSetu?
          </h2>

          <p className="text-green-200 mt-3">
            Create your account and start discovering agricultural opportunities.
          </p>

          <Link
            to="/register"
            className="inline-flex mt-7 bg-white text-green-900 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      <footer className="bg-stone-950 text-stone-400 text-sm text-center py-5">
        © 2026 AgriSetu · Connecting Farmers & Buyers
      </footer>

    </div>
  );
}

function Login() {
  const { setUser } = useApp();
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const go = (u) => {
    if (!u) return;

    setUser(u);
    nav(`/${u.role}/dashboard`);
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setErr("");

  const enteredEmail = email.trim().toLowerCase();

  if (!enteredEmail || !password) {
    setErr("Please enter your email and password.");
    return;
  }

  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: enteredEmail,
      password,
    });

    const loggedInUser = {
      ...response.data.user,
      _id: response.data.user.id,
    };

    localStorage.setItem("agrisetu_token", response.data.token);
localStorage.setItem("agrisetu_user", JSON.stringify(loggedInUser));    setUser(loggedInUser);
    nav(`/${loggedInUser.role}/dashboard`);
  } catch (error) {
    setErr(
      error.response?.data?.message ||
        "Unable to connect to the server. Please try again."
    );
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-stone-900 flex items-center justify-center p-5">

      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT SIDE */}
        <div className="hidden md:flex bg-green-950 text-white p-10 flex-col justify-between">

          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Sprout size={23} />
            </div>

            <span className="text-xl font-bold">
              AgriSetu
            </span>
          </Link>

          <div>
            <p className="text-green-300 text-sm font-medium uppercase tracking-wider">
              Welcome back
            </p>

            <h1 className="text-4xl font-bold leading-tight mt-3">
              Connect.
              <br />
              Trade.
              <br />
              Grow.
            </h1>

            <p className="text-green-200 mt-5 leading-relaxed">
              Continue connecting with farmers and buyers
              through AgriSetu.
            </p>
          </div>

          <p className="text-green-300 text-xs">
            Farmers • Buyers • Opportunities
          </p>

        </div>

        {/* RIGHT SIDE */}
        <div className="p-7 sm:p-10">

          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-7">
            <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center">
              <Sprout className="text-white" />
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-green-950">
              Login to AgriSetu
            </h2>

            <p className="text-sm text-stone-500 mt-1">
              Access your agricultural marketplace account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-stone-700">
                Email
              </label>

              <input
                className={`${inp} mt-1`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            
<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
value={password}
onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter password"
    className="w-full rounded-lg border px-4 py-3 pr-12"
  />

  <button
    type="button"
    onClick={() => setShowPassword((previous) => !previous)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
    aria-label={showPassword ? "Hide password" : "Show password"}
    title={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? (
      <EyeOff size={20} />
    ) : (
      <Eye size={20} />
    )}
  </button>
</div>

            {/* ERROR */}
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {err}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className={`${btn} w-full py-3`}
            >
              Login
            </button>

          </form>

          {/* REGISTER */}
          <p className="text-sm text-center text-stone-500 mt-7">
            Don't have an account?{" "}
            <Link
              className="text-green-700 font-semibold hover:underline"
              to="/register"
            >
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

function Register() {
  const { setUser } = useApp();
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    role: "farmer",
    district: "",
    state: "",
  });

  const [err, setErr] = useState("");

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
  e.preventDefault();
  setErr("");

  if (!f.name.trim() || !f.email.includes("@")) {
    return setErr("Enter a name and valid email.");
  }

  if (!/^\d{10}$/.test(f.phone)) {
    return setErr("Phone must be 10 digits.");
  }

  if (f.password.length < 8 || f.password !== f.confirm) {
    return setErr("Password must be 8+ characters and match.");
  }

  if (!f.district || !f.state) {
    return setErr("district and state are required.");
  }

  try {
    await axios.post(`${API_URL}/auth/register`, {
      name: f.name.trim(),
      email: f.email.trim().toLowerCase(),
      password: f.password,
      role: f.role,
      phone: f.phone,
      district: f.district,
      state: f.state,
    });

    const response = await axios.post(`${API_URL}/auth/login`, {
      email: f.email.trim().toLowerCase(),
      password: f.password,
    });

    const loggedInUser = {
      ...response.data.user,
      _id: response.data.user.id,
    };

    localStorage.setItem("agrisetu_token", response.data.token);
    localStorage.setItem("agrisetu_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    nav(`/${loggedInUser.role}/dashboard`);
  } catch (error) {
    setErr(
      error.response?.data?.message ||
        "Unable to connect to the server. Please try again."
    );
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-stone-900 flex items-center justify-center p-5">

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT SIDE */}
        <div className="hidden md:flex bg-green-950 text-white p-10 flex-col justify-between">

          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Sprout size={23} />
            </div>

            <span className="text-xl font-bold">
              AgriSetu
            </span>
          </Link>

          <div>
            <p className="text-green-300 text-sm font-medium uppercase tracking-wider">
              Join AgriSetu
            </p>

            <h1 className="text-4xl font-bold leading-tight mt-3">
              Grow your
              <br />
              connections.
            </h1>

            <p className="text-green-200 mt-5 leading-relaxed">
              Whether you are a farmer looking for genuine buyers
              or a buyer searching for fresh produce, AgriSetu
              helps you connect directly.
            </p>

            <div className="mt-8 space-y-4">

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Package size={18} />
                </div>

                <span className="text-sm text-green-100">
                  Showcase your produce
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Search size={18} />
                </div>

                <span className="text-sm text-green-100">
                  Discover opportunities
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Handshake size={18} />
                </div>

                <span className="text-sm text-green-100">
                  Build direct connections
                </span>
              </div>

            </div>
          </div>

          <p className="text-green-300 text-xs">
            Farmers • Buyers • Opportunities
          </p>

        </div>

        {/* RIGHT SIDE */}
        <div className="p-7 sm:p-10">

          {/* MOBILE LOGO */}
          <div className="md:hidden flex justify-center mb-6">
            <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center">
              <Sprout className="text-white" />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-green-950">
              Create your account
            </h2>

            <p className="text-sm text-stone-500 mt-1">
              Join AgriSetu and start connecting.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">

            {/* PERSONAL INFORMATION */}
            <div>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">
                Personal Information
              </p>

              <div className="space-y-3">

                <div>
                  <label className="text-sm font-medium text-stone-700">
                    Full Name
                  </label>

                  <input
                    className={`${inp} mt-1`}
                    placeholder="Enter your full name"
                    value={f.name}
                    onChange={set("name")}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">

                  <div>
                    <label className="text-sm font-medium text-stone-700">
                      Email
                    </label>

                    <input
                      className={`${inp} mt-1`}
                      type="email"
                      placeholder="you@example.com"
                      value={f.email}
                      onChange={set("email")}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700">
                      Phone
                    </label>

                    <input
                      className={`${inp} mt-1`}
                      type="tel"
                      maxLength="10"
                      placeholder="10-digit number"
                      value={f.phone}
                      onChange={set("phone")}
                    />
                  </div>

                </div>

              </div>
            </div>

            {/* ACCOUNT TYPE */}
            <div className="border-t border-stone-200 pt-5">

              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">
                Account Type
              </p>

              <div className="grid grid-cols-2 gap-3">

                {["farmer", "buyer"].map((role) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => setF({ ...f, role })}
                    className={`p-4 rounded-xl border text-left transition ${
                      f.role === role
                        ? "border-green-600 bg-green-50 ring-2 ring-green-600/20"
                        : "border-stone-200 hover:border-green-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {role === "farmer" ? "🌱" : "🏪"}
                    </div>

                    <div className="font-semibold text-green-950">
                      {role === "farmer" ? "Farmer" : "Buyer"}
                    </div>

                    <div className="text-xs text-stone-500 mt-1">
                      {role === "farmer"
                        ? "List your produce"
                        : "Find agricultural produce"}
                    </div>
                  </button>
                ))}

              </div>
            </div>

            {/* district */}
            <div className="border-t border-stone-200 pt-5">

              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">
                district
              </p>

              <div className="grid sm:grid-cols-2 gap-3">

                <div>
                  <label className="text-sm font-medium text-stone-700">
                    district
                  </label>

                  <input
                    className={`${inp} mt-1`}
                    placeholder="e.g. Guntur "
                    value={f.district}
                    onChange={set("district")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-stone-700">
                    State
                  </label>

                  <input
                    className={`${inp} mt-1`}
                    placeholder="e.g. Andhra Pradesh"
                    value={f.state}
                    onChange={set("state")}
                  />
                </div>

              </div>
            </div>

            {/* SECURITY */}
            <div className="border-t border-stone-200 pt-5">

              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">
                Security
              </p>

              <div className="grid sm:grid-cols-2 gap-3">

                

<div className="relative">
  <label className="text-sm font-medium text-stone-700">
    Password
  </label>

  <input
    className={`${inp} mt-1 pr-12`}
    type={showPassword ? "text" : "password"}
    name="password"
    value={f.password}
    onChange={set("password")}
    placeholder="Enter password"
  />

  <button
    type="button"
    onClick={() => setShowPassword((previous) => !previous)}
    className="absolute right-3 top-[38px] text-gray-500"
    aria-label={showPassword ? "Hide password" : "Show password"}
    title={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>


                <div>
                  <label className="text-sm font-medium text-stone-700">
                    Confirm Password
                  </label>

                  <input
                    className={`${inp} mt-1`}
                    type="password"
                    placeholder="Re-enter password"
                    value={f.confirm}
                    onChange={set("confirm")}
                  />
                </div>

              </div>
            </div>

            {/* ERROR */}
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {err}
              </div>
            )}

            {/* CREATE ACCOUNT */}
            <button
              type="submit"
              className={`${btn} w-full py-3`}
            >
              Create Account
            </button>

          </form>

          {/* LOGIN LINK */}
          <p className="text-sm text-center text-stone-500 mt-6">
            Already have an account?{" "}
            <Link
              className="text-green-700 font-semibold hover:underline"
              to="/login"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

// ---------- Farmer ----------

function DashboardNotifications() {
  const { user } = useApp();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      if (!user?._id) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await api.get("/notifications/mine");

        if (!cancelled) {
          setNotifications(response.data.notifications || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load notifications."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [user?._id]);

async function markAsRead(notificationId) {
  try {
    await api.patch(`/notifications/${notificationId}/read`);

    // Remove the entire notification card from the UI.
    setNotifications((current) =>
      current.filter((notification) => notification._id !== notificationId)
    );
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to mark notification as read."
    );
  }
}


  if (loading) {
    return (
      <section className={`${cardBase} p-5`}>
        <p className="text-sm text-stone-500">
          Loading notifications...
        </p>
      </section>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <section className={`${cardBase} p-5`}>
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      </section>
    );
  }
  if (notifications.length === 0) {
  return null;
}

  return (
    <section className={`${cardBase} p-5 sm:p-6`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-green-950">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Important connection updates
          </p>
        </div>

        {notifications.length > 0 && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            {notifications.length} new
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {notifications.length === 0 ? (
        <div className="rounded-xl bg-green-50/70 px-4 py-6 text-center">
          <p className="font-medium text-green-900">
            You're all caught up
          </p>
          <p className="mt-1 text-sm text-stone-500">
            New connection updates will appear here.
          </p>
        </div>
      ) : (
        
<div className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
  {notifications.map((n) => {
    const isAccepted = n.type === "accepted";
    const isRejected = n.type === "rejected";
    const isUnread = !n.isRead;

    const iconStyle = isAccepted
      ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
      : isRejected
      ? "bg-red-100 text-red-700 ring-red-200"
      : "bg-amber-100 text-amber-700 ring-amber-200";

    const icon = isAccepted
      ? "✓"
      : isRejected
      ? "×"
      : "↗";

    return (
      <article
        key={n._id}
        className={`group flex flex-col gap-4 px-4 py-5 transition-colors duration-200 sm:flex-row sm:items-start sm:px-5 ${
          isUnread
            ? "bg-green-50/50 hover:bg-green-50"
            : "bg-white hover:bg-stone-50/80"
        }`}
      >
        {/* Notification icon */}
        <div className="relative shrink-0">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold ring-1 ${iconStyle}`}
          >
            {icon}
          </div>

          {isUnread && (
            <span
              className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-green-600"
              aria-label="Unread notification"
            />
          )}
        </div>

        {/* Notification content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold leading-5 text-green-950">
              {n.title}
            </h3>

            {isUnread && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-800">
                New
              </span>
            )}
          </div>

          <p className="mt-1.5 text-sm leading-6 text-stone-600">
            {n.message}
          </p>

          <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-400">
            <span aria-hidden="true">◷</span>
            {n.createdAt
              ? new Date(n.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "Time unavailable"}
          </p>
        </div>

        {/* Action */}
        {isUnread && (
          <button
            type="button"
            onClick={() => markAsRead(n._id)}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-green-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-green-800 shadow-sm transition hover:border-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 sm:self-center"
          >
            <span aria-hidden="true">✓</span>
            Mark as read
          </button>
        )}
      </article>
    );
  })}
</div>

      )}
    </section>
  );
}


function FarmerFeedback() {
  const { user } = useApp();

  if (!user?._id) return null;

  return (
    <section className="mt-8">
      <h2 className="font-serif text-2xl font-semibold text-green-900">
        Buyer Feedback
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        View your ratings and feedback from buyers.
      </p>

      <ProduceReviews farmerId={user._id} />
    </section>
  );
}

function FarmerDash() {
  
const { user, produce, conns, users } = useApp();  
const mine = produce.filter(
  (p) =>
    String(p.farmerId?._id || p.farmerId) === String(user?._id)
);

const reqs = conns.filter((c) =>
  mine.some(
    (p) =>
      String(p._id) ===
      String(c.produceId?._id || c.produceId)
  )
);const farmerId = user?._id;  
  const navigate = useNavigate();
  return (
    <Page role="farmer">
      <h1 className="rounded-2xl bg-green-950 px-5 py-4
  font-serif text-2xl font-semibold text-white
  shadow-sm sm:px-7 sm:py-5 sm:text-3xl">
  Farmer Dashboard
</h1>
      <div><h1 className="font-serif text-3xl font-semibold text-green-900">Welcome, {user.name.split(" ")[0]} 👋</h1><p className="text-stone-500 text-sm mt-1">Here is what is happening with your produce today.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat n={mine.filter((p) => p.status === "Available").length} label="Active Listings" />
        <Stat n={reqs.length} label="Buyer Requests" />
        <Stat n={reqs.filter((c) => c.status === "accepted").length} label="Connections" />
      </div>
      <DashboardNotifications
  role="farmer"
  conns={conns}
  produce={produce}
  users={users}
/>



<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
  <h2 className="font-semibold text-lg text-green-900">
    Recent Produce
  </h2>

  <span className="text-sm text-green-700">
    Select a crop to view it in My Produce →
  </span>
</div>

<Table
  heads={["Crop", "Quantity", "Quality", "Status", ""]}
  rows={mine.slice(0, 5).map((p) => [
    p.crop,
    `${p.quantity} ${p.unit}`,
    p.quality,
    <Badge s={p.status} />,
    <span className="text-lg font-semibold text-green-700">
  →
</span>,
  ])}
  rowIds={mine.slice(0, 5).map((p) => p._id)}
  onRowClick={(id) =>
    navigate(`/farmer/produce?highlight=${id}`)
  }
/>

    </Page>
  );
}



function FarmerProduce() {
  const { user, produce, setProduce } = useApp();
  const [q, setQ] = useState("");

  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get("highlight");
  const navigate = useNavigate();

  // Filter produce before using rows in useEffect
 const rows = produce.filter(
  (p) =>
    String(p.farmerId?._id || p.farmerId) === String(user?._id) &&
    (p.crop || "").toLowerCase().includes(q.toLowerCase())
);

  // Scroll to and highlight the selected produce
  useEffect(() => {
    if (
      !highlightedId ||
      !rows.some((p) => p._id === highlightedId)
    ) {
      return;
    }

    const timer = setTimeout(() => {
      document
        .getElementById(`produce-${highlightedId}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);

    return () => clearTimeout(timer);
  }, [highlightedId, rows.length]);

  const deleteProduce = async (p) => {
    if (!window.confirm(`Delete ${p.crop}?`)) return;

    try {
      await api.delete(`/produce/${p._id}`);

      setProduce((previous) =>
        previous.filter((item) => item._id !== p._id)
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to delete produce. Please try again."
      );
    }
  };

  // Keep your existing return (...) JSX below this point


  return (
    <Page role="farmer">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-3xl font-semibold text-green-900">
          My Produce
        </h1>

        <Link to="/farmer/produce/add" className={`${btn} ml-auto`}>
          + Add Produce
        </Link>
      </div>

      <input
        className={inp}
        placeholder="Search by crop..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

    

<Table
  heads={[
    "Image",
    "Crop",
    "Quantity",
    "Quality",
    "district",
    "Available",
    "Status",
    "Actions",
  ]}
  rows={rows.map((p) => [
    p.images?.length > 0 ? (
      <img
        src={p.images[0]}
        alt={p.crop}
        className="h-16 w-16 rounded-lg object-cover"
      />
    ) : (
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-50 text-2xl">
        🌱
      </div>
    ),
    p.crop,
    `${p.quantity} ${p.unit}`,
    p.quality,
    p.district || "—",
    p.date || "—",
    <Badge s={p.status} />,
    <span className="flex gap-3 text-green-800">
      <Link
        to={`/farmer/produce/${p._id}/edit`}
        onClick={(e) => e.stopPropagation()}
      >
        Edit
      </Link>

      <button
        type="button"
        className="text-red-600"
        onClick={(e) => {
          e.stopPropagation();
          deleteProduce(p);
        }}
      >
        Delete
      </button>
    </span>,
  ])}
  rowIds={rows.map((p) => p._id)}
  highlightedId={highlightedId}
  onRowClick={(id) =>
    navigate(`/farmer/produce?highlight=${id}`)
  }
/>
    </Page>
  );
}




function ProduceForm() {
  const { id } = useParams();
  const { user, produce, setProduce, produceLoading } = useApp();
  const nav = useNavigate();

  const old = produce.find((p) => p._id === id);

  const [f, setF] = useState(() => old || {
  crop: "",
  quantity: "",
  unit: "kg",
  quality: "Not sure",
  date: "",
  district: user?.district || "",
  state: user?.state || "",
  description: "",
  images: [],
});

  const [err, setErr] = useState("");
  
const [photoItems, setPhotoItems] = useState(() =>
  (old?.images || []).map((url) => ({
    url,
    existing: true,
  }))
);

const handlePhotoChange = async (event) => {
  const files = Array.from(event.target.files || []);
  event.target.value = "";

  setErr("");

  const currentCount = photoItems.length;

  if (currentCount + files.length > 5) {
    setErr("You can upload up to five photos in total.");
    return;
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxFileSize = 1024 * 1024;
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (files.some((file) => !validTypes.includes(file.type))) {
    setErr("Please select JPG, PNG, or WebP images only.");
    return;
  }

  if (files.some((file) => file.size > maxFileSize)) {
    setErr("Each photo must be 1 MB or smaller.");
    return;
  }
 
  const existingNewSize = photoItems
    .filter((item) => !item.existing)
    .reduce((sum, item) => sum + (item.file?.size || 0), 0);

  if (existingNewSize + totalSize > 5 * 1024 * 1024) {
    setErr("The combined size of new photos must be 5 MB or smaller.");
    return;
  }

  try {
    const newItems = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () =>
              resolve({
                url: reader.result,
                file,
                existing: false,
              });

            reader.onerror = () =>
              reject(new Error("Unable to read one of the selected photos."));

            reader.readAsDataURL(file);
          })
      )
    );

    setPhotoItems((previous) => [...previous, ...newItems]);
  } catch (error) {
    setErr(error.message || "Unable to read selected photos.");
  }
};



const removePhoto = (index) => {
  setPhotoItems((previous) =>
    previous.filter((_, i) => i !== index)
  );
};

useEffect(() => {
  if (id && old) {
    setF({
      crop: old.crop || "",
      quantity: old.quantity ?? "",
      unit: old.unit || "kg",
      quality: old.quality || "Not sure",
      date: old.date || "",
      district: old.district || "",
      state: old.state || "",
      description: old.description || "",
    });

    setPhotoItems(
      (old.images || []).map((url) => ({
        url,
        existing: true,
      }))
    );
  }
}, [id, old?._id]);



  const set = (k) => (e) =>
    setF((previous) => ({
      ...previous,
      [k]: e.target.value
    }));

const submit = async () => {
  if (
    !f.crop.trim() ||
    !(Number(f.quantity) > 0) ||
    !f.date ||
    !f.district.trim() ||
    !f.state.trim()
  ) {
    return setErr(
      "Crop, quantity, available date, district and state are required."
    );
  }

  if (photoItems.length > 5) {
    return setErr("You can upload up to five photos.");
  }

  setErr("");

  const data = {
    crop: f.crop.trim(),
    quantity: Number(f.quantity),
    unit: f.unit,
    quality: f.quality,
    date: f.date,
    district: f.district.trim(),
    state: f.state.trim(),
    description: f.description || "",
    images: photoItems.map((item) => item.url),
  };

  try {
    if (old) {
      const response = await api.patch(
        `/produce/${old._id}`,
        data
      );

      const updatedProduce = response.data.produce;

      setProduce((previous) =>
        previous.map((p) =>
          p._id === old._id ? updatedProduce : p
        )
      );
    } else {
      const response = await api.post("/produce", data);
      const newProduce = response.data.produce;

      setProduce((previous) => [newProduce, ...previous]);
    }

    nav("/farmer/produce");
  } catch (error) {
console.error("Update produce error:", {
message: error.message,
status: error.response?.status,
response: error.response?.data,
});

setErr(
error.response?.data?.message ||
(error.code === "ERR_NETWORK"
? "Cannot connect to the backend. Check that the server is running."
: `Unable to save produce${error.response?.status ? ` (${error.response.status})` : ""}. Please try again.`)
);
}

};


if (id && produceLoading) {
  return (
    <Page role="farmer">
      <p>Loading produce...</p>
    </Page>
  );
}

if (id && !old && !produceLoading) {
  return (
    <Page role="farmer">
      <p>Produce not found.</p>
      <Link to="/farmer/produce" className={btn2}>
        Back to My Produce
      </Link>
    </Page>
  );
}

return (
  <Page role="farmer">
    <div className={`${card} max-w-xl space-y-3`}>
      <h1 className="text-xl font-bold text-green-900">
        {old ? "Edit Produce" : "Add Produce"}
      </h1>

      <input
        className={inp}
        placeholder="Crop name"
        value={f.crop}
        onChange={set("crop")}
        required
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          className={inp}
          type="number"
          min="0.01"
          step="any"
          placeholder="Quantity"
          value={f.quantity}
          onChange={set("quantity")}
          required
        />

        <select
          className={inp}
          value={f.unit}
          onChange={set("unit")}
          required
        >
          <option value="kg">kg</option>
          <option value="quintal">quintal</option>
          <option value="ton">ton</option>
        </select>

        <select
          className={inp}
          value={f.quality}
          onChange={set("quality")}
          required
        >
          <option value="Grade A">Grade A — Premium</option>
          <option value="Grade B">Grade B — Standard</option>
          <option value="Grade C">Grade C — Economy</option>
          <option value="Not sure">Not sure</option>
        </select>

        <div className="col-span-2">
          <p className="text-xs text-stone-500">
            Choose based on the produce's appearance and condition.
            Your selected grade is farmer-declared.
          </p>
        </div>

        <div className="col-span-2 space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Available from
          </label>
          <p className="text-xs text-stone-500">
            The date when this produce is ready for buyers to collect
            or arrange delivery.
          </p>
          <input
            className={inp}
            type="date"
            value={f.date}
            onChange={set("date")}
            required
          />
        </div>

        <input
          className={inp}
          placeholder="district"
          value={f.district}
          onChange={set("district")}
          required
        />

        <input
          className={inp}
          placeholder="State"
          value={f.state}
          onChange={set("state")}
          required
        />
      </div>

      <textarea
        className={inp}
        placeholder="Description"
        value={f.description}
        onChange={set("description")}
      />

      {/* Produce photo upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Produce photos
        </label>

        <p className="text-xs text-stone-500">
          Upload clear photos of your actual crop. JPG, PNG, or WebP.
          Maximum 1 MB per photo and five photos in total.
        </p>

        <input
          className={inp}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handlePhotoChange}
        />

        {photoItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photoItems.map((item, index) => (
              <div
                key={`${index}-${item.url.slice(0, 40)}`}
                className="relative overflow-hidden rounded-xl border"
              >
                <img
                  src={item.url}
                  alt={`Produce photo ${index + 1}`}
                  className="h-32 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-sm text-red-600 shadow"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {err && (
        <p className="text-red-600 text-sm">{err}</p>
      )}

      <div className="flex gap-2">
        <button className={btn} onClick={submit}>
          {old ? "Update" : "Add Produce"}
        </button>

        <button
          type="button"
          className={btn2}
          onClick={() => nav("/farmer/produce")}
        >
          Cancel
        </button>
      </div>
    </div>
  </Page>
);


}


function FarmerRequests({ onlyAccepted = false }) {
const { user, users, produce, conns, setConns } = useApp();
const [requestsLoading, setRequestsLoading] = useState(true);
  const [farmerReviews, setFarmerReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
const [requestsError, setRequestsError] = useState("");
  const pendingSectionRef = useRef(null);

  useEffect(() => {
  let cancelled = false;

  const loadConnections = async () => {
    if (!user?._id) {
      setRequestsLoading(false);
      return;
    }

    setRequestsLoading(true);
setRequestsError("");
    try {
      const response = await api.get("/connections/mine");

      if (!cancelled) {
        const connections = response.data.connections || [];

        setConns((previous) => {
          const updated = connections.map((c) => ({
            ...c,
            _id: c._id || c.id,
            buyerId: c.buyerId,
            farmerId: c.farmerId,
            produceId: c.produceId,
            status: c.status,
          }));

          // Preserve connections not returned by this response only
          // if they belong to a different user context.
          return updated;
        });
      }
    } catch (error) {
      console.error(
        "Unable to load buyer requests:",
        error.response?.data || error.message
      );
      if (!cancelled) {
  setRequestsError(
    error.response?.data?.message ||
      "Unable to load buyer requests. Please try again."
  );
}
    } finally {
      if (!cancelled) {
        setRequestsLoading(false);
      }
    }
  };

  loadConnections();

  return () => {
    cancelled = true;
  };
}, [user?._id, setConns]);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      setReviewsLoading(true);

      try {
        const response = await api.get(
          `/reviews/farmer/${encodeURIComponent(user._id)}`
        );

        if (!cancelled) {
          setFarmerReviews(response.data.reviews || []);
        }
      } catch (error) {
        console.error(
          "Unable to load farmer reviews:",
          error.response?.data || error.message
        );

        if (!cancelled) setFarmerReviews([]);
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    };

    if (onlyAccepted && user?._id) {
      loadReviews();
    } else {
      setFarmerReviews([]);
      setReviewsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [onlyAccepted, user?._id]);

  const rows = conns
    .map((c) => ({
      c,
      p: produce.find(
        (item) =>
          String(item._id) === String(c.produceId?._id || c.produceId)
      ),
      b: users.find(
        (item) =>
          String(item._id) === String(c.buyerId?._id || c.buyerId)
      ),
    }))
    .filter(
      ({ p, c }) =>
        String(p?.farmerId?._id || p?.farmerId) === String(user?._id) &&
        (!onlyAccepted || c.status === "accepted")
    )
    .sort((a, b) => {
      // Put pending requests first, then show the newest first.
      if (a.c.status === "pending" && b.c.status !== "pending") return -1;
      if (a.c.status !== "pending" && b.c.status === "pending") return 1;

      return (
        new Date(b.c.createdAt || 0) -
        new Date(a.c.createdAt || 0)
      );
    });

  const pendingCount = rows.filter(
    ({ c }) => c.status === "pending"
  ).length;

  useEffect(() => {
    if (!onlyAccepted && pendingCount > 0) {
      const frame = requestAnimationFrame(() => {
        pendingSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [onlyAccepted, pendingCount]);

  const upd = async (id, status) => {
    if (updatingId) return;

    setUpdatingId(String(id));

    try {
      await api.patch(`/connections/${id}/status`, { status });

      setConns((previous) =>
        previous.map((c) =>
          String(c._id) === String(id)
            ? { ...c, status }
            : c
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to update request."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Page role="farmer">
      <div className="space-y-6">
        {/* Page heading */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-green-200 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
              Farmer dashboard
            </p>

            <h1 className="mt-1 font-serif text-3xl font-semibold text-green-950">
              {onlyAccepted ? "Connections" : "Buyer Requests"}
            </h1>

            <p className="mt-2 text-sm text-stone-600">
              {onlyAccepted
                ? "View connected buyers, their contact details and reviews."
                : "Review incoming buyer requests and respond directly."}
            </p>
          </div>

          {!onlyAccepted && (
            <div
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                pendingCount > 0
                  ? "border-amber-200 bg-amber-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                  pendingCount > 0
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {pendingCount > 0 ? "!" : "✓"}
              </div>

              <div>
                <p className="text-2xl font-bold text-stone-900">
                  {pendingCount}
                </p>
                <p className="text-xs font-medium text-stone-600">
                  Pending requests
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pending requests callout */}
        {!onlyAccepted && pendingCount > 0 && (
          <div
            ref={pendingSectionRef}
            className="scroll-mt-24 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg text-amber-800">
                !
              </div>

              <div>
                <h2 className="font-semibold text-amber-950">
                  New buyer requests need your attention
                </h2>
                <p className="mt-1 text-sm leading-6 text-amber-900/80">
                  {pendingCount} request{pendingCount === 1 ? "" : "s"}{" "}
                  {pendingCount === 1 ? "is" : "are"} waiting for your
                  response. Accept or reject each request below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Requests table */}
        {/* Requests table */}
{requestsLoading ? (
  <div className="rounded-2xl border border-green-200 bg-green-50/40 px-5 py-12 text-center">
    <p className="text-sm text-stone-600">
      Loading buyer requests...
    </p>
  </div>
) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-green-300 bg-green-50/40 px-5 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
              {onlyAccepted ? "🤝" : "🌱"}
            </div>

            <h2 className="mt-4 font-serif text-xl font-semibold text-green-950">
              {onlyAccepted
                ? "No accepted connections yet"
                : "No buyer requests yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
              {onlyAccepted
                ? "Accepted buyer connections will appear here with contact details and reviews."
                : "When buyers request your produce, their requests will appear here for you to review."}
            </p>
          </div>
        ) : (
          <div
            ref={!onlyAccepted ? pendingSectionRef : null}
            className="scroll-mt-24 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
          >
            <div className="border-b border-stone-100 px-4 py-4 sm:px-5">
              <h2 className="font-serif text-xl font-semibold text-green-950">
                {onlyAccepted ? "Your Connections" : "Incoming Requests"}
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                {rows.length} record{rows.length === 1 ? "" : "s"} · Pending
                requests appear first.
              </p>
            </div>

            <div className="overflow-x-auto">
              <Table
                heads={[
                  "Buyer",
                  "Crop",
                  "Status",
                  onlyAccepted ? "Contact" : "Actions",
                  ...(onlyAccepted ? ["Rating & Review"] : []),
                ]}
                rows={rows.map(({ c, p, b }) => {
                  const review = farmerReviews.find(
                    (r) =>
                      String(r.connectionId?._id || r.connectionId) ===
                      String(c._id)
                  );

                  return [
                    <div className="min-w-32 py-1">
                      <p className="font-semibold text-green-950">
                        {b?.name || "Buyer information unavailable"}
                      </p>

                      {!onlyAccepted && c.status === "pending" && (
                        <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                          New Request
                        </span>
                      )}
                    </div>,

                    <span className="font-medium text-stone-800">
                      {p?.crop || "Produce unavailable"}
                    </span>,

                    <Badge s={c.status} />,

                    onlyAccepted ? (
                      <div className="min-w-44 text-sm text-stone-700">
                        <p>{b?.phone || "No phone"}</p>
                        <p className="mt-1 break-all text-stone-500">
                          {b?.email || "No email"}
                        </p>
                      </div>
                    ) : c.status === "pending" ? (
                      <div className="flex min-w-44 flex-wrap gap-2">
                        <button
                          type="button"
                          className={`${btn} inline-flex items-center justify-center gap-1`}
                          disabled={updatingId !== null}
                          onClick={() => upd(c._id, "accepted")}
                        >
                          {updatingId === String(c._id)
                            ? "Updating..."
                            : "✓ Accept"}
                        </button>

                        <button
                          type="button"
                          className={`${btn2} inline-flex items-center justify-center gap-1`}
                          disabled={updatingId !== null}
                          onClick={() => upd(c._id, "rejected")}
                        >
                          {updatingId === String(c._id)
                            ? "Updating..."
                            : "✕ Reject"}
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`font-medium ${
                          c.status === "accepted"
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {c.status === "accepted"
                          ? "✓ Connected"
                          : "Request rejected"}
                      </span>
                    ),

                    ...(onlyAccepted
                      ? [
                          reviewsLoading ? (
                            <span className="text-sm text-stone-500">
                              Loading reviews...
                            </span>
                          ) : review ? (
                            <div className="min-w-40">
                              <div className="font-medium text-amber-600">
                                {"★".repeat(
                                  Math.max(
                                    0,
                                    Math.min(
                                      5,
                                      Number(review.overallRating) || 0
                                    )
                                  )
                                )}
                                {"☆".repeat(
                                  5 -
                                    Math.max(
                                      0,
                                      Math.min(
                                        5,
                                        Number(review.overallRating) || 0
                                      )
                                    )
                                )}
                                <span className="ml-1 text-stone-700">
                                  {review.overallRating}/5
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-stone-600">
                                Quality: {review.qualityRating}/5 · Service:{" "}
                                {review.serviceRating}/5
                              </p>

                              {review.comment && (
                                <p className="mt-1 whitespace-pre-wrap text-sm text-stone-700">
                                  {review.comment}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-stone-500">
                              No review yet
                            </span>
                          ),
                        ]
                      : []),
                  ];
                })}
              />
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}



    
function StarRating({ value = 0, onChange, size = "text-2xl" }) {
return ( <div className="flex items-center gap-1" role="group" aria-label="Rating">
{[1, 2, 3, 4, 5].map((star) => (
<button
key={star}
type="button"
disabled={!onChange}
onClick={() => onChange?.(star)}
aria-label={`${star} out of 5 stars`}
className={`${size} ${
            star <= value ? "text-amber-500" : "text-stone-300"
          } ${onChange ? "cursor-pointer" : "cursor-default"}`}
>
★ </button>
))} </div>
);
}

function ConnectionReviewForm({ connection, onSubmitted }) {
const [qualityRating, setQualityRating] = useState(0);
const [serviceRating, setServiceRating] = useState(0);
const [overallRating, setOverallRating] = useState(0);
const [comment, setComment] = useState("");
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [success, setSuccess] = useState(false);

const submitReview = async (event) => {
event.preventDefault();
setMessage("");
setSuccess(false);


if (!qualityRating || !serviceRating || !overallRating) {
  setMessage("Please select all three ratings.");
  return;
}

try {
  setLoading(true);

  await api.post("/reviews", {
    connectionId: connection._id,
    qualityRating,
    serviceRating,
    overallRating,
    comment: comment.trim(),
  });

  setSuccess(true);
  setMessage("Review published successfully.");

  onSubmitted?.(connection._id);
} catch (error) {
  setMessage(
    error.response?.data?.message ||
      "Unable to submit your review. Please try again."
  );
} finally {
  setLoading(false);
}


};

return ( <form
   onSubmit={submitReview}
   className="mt-4 space-y-4 border-t border-stone-200 pt-4"
 > <h3 className="font-semibold text-green-900">
Rate your experience </h3>


  {[
    {
      label: "Produce quality",
      value: qualityRating,
      change: setQualityRating,
    },
    {
      label: "Communication and service",
      value: serviceRating,
      change: setServiceRating,
    },
    {
      label: "Overall experience",
      value: overallRating,
      change: setOverallRating,
    },
  ].map((item) => (
    <div key={item.label}>
      <p className="mb-1 text-sm font-medium text-stone-700">
        {item.label}
      </p>
      <StarRating
        value={item.value}
        onChange={item.change}
      />
    </div>
  ))}

  <div>
    <label className="mb-1 block text-sm font-medium text-stone-700">
      Comment (optional)
    </label>

    <textarea
      value={comment}
      onChange={(event) => setComment(event.target.value)}
      maxLength={1000}
      rows={3}
      placeholder="Share your experience with this farmer..."
      className="w-full rounded-xl border border-stone-300 p-3 text-sm outline-none focus:border-green-700"
    />

    <p className="text-right text-xs text-stone-500">
      {comment.length}/1000
    </p>
  </div>

  {message && (
    <p
      aria-live="polite"
      className={`text-sm ${
        success ? "text-green-800" : "text-red-700"
      }`}
    >
      {message}
    </p>
  )}

  {!success && (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl bg-green-800 px-4 py-3 font-medium text-white hover:bg-green-900 disabled:opacity-60 sm:w-auto"
    >
      {loading ? "Publishing..." : "Publish review"}
    </button>
  )}
</form>


);
}


function ProduceReviews({ produceId, farmerId }) {
const [data, setData] = useState({
averageRating: 0,
reviewCount: 0,
reviews: [],
});
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
if (!farmerId) return;


let cancelled = false;

const loadReviews = async () => {
  try {
    setLoading(true);
    setError("");

    const endpoint = produceId
      ? `/reviews/produce/${encodeURIComponent(produceId)}`
      : `/reviews/farmer/${encodeURIComponent(farmerId)}`;

    const response = await api.get(endpoint);

    if (cancelled) return;

const fetchedReviews = response.data.reviews || [];

const reviews = [
  ...new Map(
    fetchedReviews.map((review) => [String(review._id), review])
  ).values(),
];
    setData({
      averageRating:
        response.data.averageRating ??
        (reviews.length
          ? reviews.reduce((sum, review) => sum + review.overallRating, 0) /
            reviews.length
          : 0),
      reviewCount: response.data.reviewCount ?? reviews.length,
      reviews,
    });
  } catch {
    if (!cancelled) {
      setError("Reviews could not be loaded. Please try again later.");
    }
  } finally {
    if (!cancelled) setLoading(false);
  }
};

loadReviews();

return () => {
  cancelled = true;
};


}, [produceId, farmerId]);

return (
  <section className="mt-8">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-green-900">
          Buyer reviews
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Feedback from buyers who connected with farmers.
        </p>
      </div>

      {!loading && !error && (
        <div className="rounded-xl bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-green-900">
              {Number(data.averageRating).toFixed(1)}
            </span>
            <StarRating
              value={Math.round(data.averageRating)}
              size="text-lg"
            />
          </div>
          <p className="text-xs text-stone-600">
            {data.reviews.length}{" "}
            {data.reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      )}
    </div>

    {loading ? (
      <p className="text-sm text-stone-500">Loading reviews...</p>
    ) : error ? (
      <p role="alert" className="text-sm text-red-700">
        {error}
      </p>
    ) : data.reviews.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center">
        <p className="font-medium text-stone-700">No reviews yet</p>
        <p className="mt-1 text-sm text-stone-500">
          Reviews will appear here when buyers share their experiences.
        </p>
      </div>
    ) : (
      
<div className="space-y-3">
  {data.reviews.map((review) => (
    <article
      key={review._id}
      className="overflow-x-auto rounded-xl border border-stone-200 bg-white"
    >
<div className="flex min-w-max items-center gap-8 px-5 py-4 text-sm">
        {/* Buyer */}
        <div className="w-36 shrink-0">
          <p className="truncate font-semibold text-stone-900">
            {review.buyerName || "Buyer"}
          </p>
          <p className="text-xs text-stone-500">
            {review.createdAt
              ? new Date(review.createdAt).toLocaleDateString()
              : ""}
          </p>
        </div>

        {/* Overall rating */}
        <div className="flex w-32 shrink-0 items-center gap-2 whitespace-nowrap">
  <StarRating
    value={review.overallRating}
    size="text-base"
  />
  <span className="shrink-0 font-semibold text-stone-800">
    {review.overallRating}/5
  </span>
</div>

        {/* Quality */}
        <p className="w-28 shrink-0">
          Quality:{" "}
          <strong className="text-stone-900">
            {review.qualityRating}/5
          </strong>
        </p>

        {/* Service */}
        <p className="w-28 shrink-0">
          Service:{" "}
          <strong className="text-stone-900">
            {review.serviceRating}/5
          </strong>
        </p>

        {/* Comment */}
        {review.comment && (
          <p className="max-w-xs truncate text-stone-600" title={review.comment}>
            {review.comment}
          </p>
        )}
      </div>
    </article>
  ))}
</div>


    )}
  </section>
);
}

// ---------- Buyer ----------
function BuyerDash() {
const {
  user,
  reqs = [],
  conns = [],
  produce = [],
  users = [],
} = useApp(); 
const mine = conns.filter(
  (c) =>
    String(c.buyerId?._id || c.buyerId) === String(user?._id)
);
const navigate = useNavigate();  
const myReqs = reqs.filter((r) => r.buyerId === user._id);
  const rec = produce.filter((p) => myReqs.some((r) => r.crop.toLowerCase() === (p.crop || "").toLowerCase()));
  return (

<Page role="buyer">
  <div className="space-y-7">

    
<h1 className="rounded-2xl bg-green-950 px-5 py-5 font-serif text-2xl font-semibold text-white shadow-sm sm:px-7 sm:py-6">
  <span className="block text-xl tracking-wide sm:text-2xl">
     Buyer Portal
  </span>
  <span className="mt-1 block font-sans text-xs font-medium tracking-[0.2em] text-green-300">
    Find fresh produce and connect with farmers directly.
  </span>
</h1>


     <div> <h1 className="font-serif text-3xl font-semibold text-green-900"> Welcome, {user.name} 👋 </h1> <p className="mt-1 text-sm text-stone-500">  </p> </div>

    {/* Statistics */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      
        <Stat
          n={myReqs.filter((r) => r.status === "Open").length}
          label="Open Requirements"
        />
       

      <Stat
        n={mine.length}
        label="Requests Sent"
      />

      <Stat
        n={mine.filter((c) => c.status === "accepted").length}
        label="Connections"
      />
    </div>

    {/* Notifications */}
    <DashboardNotifications
      role="buyer"
      conns={conns}
      produce={produce}
      users={users}
    />

    {/* Recommended produce */}
    <section className="space-y-4">
      

<section className="space-y-5">
  <div className="flex flex-wrap items-end justify-between gap-3">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
        Explore the marketplace
      </p>
      <h2 className="mt-1 font-serif text-2xl font-semibold text-green-950 sm:text-3xl">
        All Available Produce
      </h2>
      <p className="mt-2 text-sm text-stone-600">
        Discover crops listed by farmers and connect directly with them.
      </p>
    </div>

    <button
      type="button"
      onClick={() => navigate("/buyer/search")}
      className="rounded-xl border border-green-800 px-4 py-2.5 text-sm font-semibold text-green-800 transition hover:bg-green-50"
    >
      Browse Marketplace →
    </button>
  </div>

  {produce.filter(
  (p) => String(p.status || "").toLowerCase() === "available"
).length === 0 ? (
    <div className="rounded-2xl border border-dashed border-green-300 bg-white px-5 py-10 text-center">
      <div className="text-4xl">🌱</div>
      <h3 className="mt-3 font-serif text-xl font-semibold text-green-950">
        No produce available right now
      </h3>
      <p className="mt-2 text-sm text-stone-600">
        New listings from farmers will appear here when available.
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {produce
        .filter((p) => p.status === "available")
        .map((p) => {
          const farmer = users.find(
  (u) =>
    String(u._id) === String(p.farmerId?._id || p.farmerId)
);

          return (
            <article
              key={p._id}
              className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
            >
              <div className="relative h-48 overflow-hidden bg-green-50">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.crop}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl">
                    🌾
                  </div>
                )}

                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-green-800 shadow-sm">
                  Available
                </span>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-green-950">
                    {p.crop}
                  </h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {p.district || "district not specified"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-green-50 p-3">
                    <p className="text-xs text-stone-500">Quantity</p>
                    <p className="mt-1 font-semibold text-green-950">
                      {p.quantity} {p.unit}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-3">
                    <p className="text-xs text-stone-500">Quality</p>
                    <p className="mt-1 font-semibold text-stone-800">
                      {p.quality || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-800">
                    {farmer?.name?.charAt(0)?.toUpperCase() || "F"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-stone-500">Listed by</p>
                    <p className="truncate text-sm font-semibold text-stone-800">
                      {farmer?.name || "Farmer"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/buyer/produce/${p._id}`)
                    }
                    className="shrink-0 rounded-xl bg-green-800 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-green-950"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </article>
          );
        })}
    </div>
  )}
  <div>
        <h2 className="font-serif text-3xl font-semibold text-green-900">
          Recommended Produce
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Discover produce listed by farmers.
        </p>
      </div>

      {rec.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rec.map((p) => (
            <ProduceCard key={p._id} p={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-green-300 bg-green-50/70 px-5 py-8 text-center sm:px-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
            🌱
          </div>

          <h3 className="font-serif text-lg font-semibold text-green-950">
            Find the produce you need
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
            Post your crop requirements to help connect with farmers offering
            the produce you are looking for.
          </p>

          <button
            type="button"
            onClick={() => navigate("/buyer/requirements")}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
          >
            + Post a Requirement
          </button>
        </div>
      )}
</section>
    </section>

  </div>
</Page>


  );
}


function ProduceCard({ p }) {
  const { users } = useApp();

  return (
    <div className={`${cardBase} overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-green-200 transition-all duration-200`}>
      
      {/* Show uploaded photos, or the default crop emoji */}
      {p.images?.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 border-b border-green-100 p-2">
          {p.images.map((url, index) => (
            <img
              key={`${p._id}-${index}`}
              src={url}
              alt={`${p.crop} photo ${index + 1}`}
              loading="lazy"
              className="h-36 w-full rounded-xl object-cover"
            />
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50 h-28 grid place-items-center text-5xl border-b border-green-100">
          {emoji(p.crop)}
        </div>
      )}

      <div className="p-4 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-green-900 text-lg">
            {p.crop}
          </h3>
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
            {p.quality}
          </span>
        </div>

        <p className="text-sm font-medium">
          {p.quantity} {p.unit}
        </p>

        <p className="text-sm text-stone-500 flex items-center gap-1">
          <MapPin size={14} />
          {p.district}, {p.state}
        </p>

        <p className="text-sm text-stone-500 flex items-center gap-1">
          <CalendarDays size={14} />
          Available from {p.date}
        </p>

        <p className="text-sm text-stone-500">
          Farmer: {users.find((u) => u._id === p.farmerId)?.name}
        </p>

        <Link
          to={`/buyer/produce/${p._id}`}
          className={`${btn} w-full mt-3`}
        >
          View Details
        </Link>
      </div>
    </div>
  );
}



function BuyerSearch() {
  const { produce } = useApp();
  const [f, setF] = useState({ q: "", district: "", quality: "" });
const rows = produce.filter(
  (p) =>
    String(p.status || "").toLowerCase() === "available" &&
    (p.crop || "").toLowerCase().includes(f.q.toLowerCase()) &&
    (p.district || "").toLowerCase().includes(f.district.toLowerCase()) &&
    (!f.quality || p.quality === f.quality)
);
  return (
    <Page role="buyer">
      <h1 className="font-serif text-3xl font-semibold text-green-900">Search Produce</h1>
      <div className={`${card} grid md:grid-cols-3 gap-3`}>
        <input className={inp} placeholder="Crop name" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <input className={inp} placeholder="district" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })} />
        <select className={inp} value={f.quality} onChange={(e) => setF({ ...f, quality: e.target.value })}><option value="">Any quality</option><option>Grade A</option><option>Grade B</option><option>Grade C</option></select>
      </div>
      <p className="text-sm text-stone-500">{rows.length} result(s)</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">{rows.map((p) => <ProduceCard key={p._id} p={p} />)}</div>
    </Page>
  );
}



function ProduceDetails() {
  const { id } = useParams();
  const {
    user,
    users,
    produce,
    conns,
    setConns,
    produceLoading,
  } = useApp();

  const nav = useNavigate();

  const p = produce.find((x) => String(x._id) === String(id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  if (produceLoading && !p) {
    return (
      <Page role="buyer">
        <p className="text-stone-500">Loading produce details...</p>
      </Page>
    );
  }

  if (!p) {
    return (
      <Page role="buyer">
        <div className={`${card} max-w-2xl text-center space-y-3`}>
          <div className="text-5xl">🌱</div>
          <h1 className="font-serif text-2xl font-semibold text-green-900">
            Produce not found
          </h1>
          <p className="text-sm text-stone-500">
            This listing may have been removed or is no longer available.
          </p>
          <button
            type="button"
            className={btn}
            onClick={() => nav("/buyer/search")}
          >
            Back to Search
          </button>
        </div>
      </Page>
    );
  }

  const farmer = users.find(
    (u) => String(u._id) === String(p.farmerId?._id || p.farmerId)
  );


// Find all requests for this buyer and listing.
const existingConnections = conns.filter(
  (c) =>
    String(c.buyerId?._id || c.buyerId) === String(user?._id) &&
    String(c.produceId?._id || c.produceId) === String(p._id)
);

// Find the latest request using its creation date.
const conn =
  existingConnections.length > 0
    ? [...existingConnections].sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )[0]
    : null;

// Show contact details if any request was accepted.
const acceptedConnection = existingConnections.find(
  (c) => c.status === "accepted"
);

// Allow another request only if there is no previous request,
// or the latest request was accepted or rejected.
const canSendRequest =
  !conn ||
  conn.status === "accepted" ||
  conn.status === "rejected";



  const images = p.images?.length ? p.images : [];

  const otherCrops = produce
    .filter(
      (item) =>
        String(item.farmerId?._id || item.farmerId) ===
          String(p.farmerId?._id || p.farmerId) &&
        String(item._id) !== String(p._id)
    )
    .map((item) => item.crop);

  const sendRequest = async () => {
    // Do not block a new request just because an earlier one exists.
    if (sending || !user || !farmer) return;

    setSending(true);
    setErr("");

    try {
      const response = await api.post("/connections", {
        farmerId: p.farmerId?._id || p.farmerId,
        produceId: p._id,
      });

      const c = response.data.connection;

      const newConnection = {
        ...c,
        _id: c._id || c.id,
        buyerId: String(c.buyerId?._id || c.buyerId || user._id),
        farmerId: String(
          c.farmerId?._id || c.farmerId || p.farmerId?._id || p.farmerId
        ),
        produceId: String(c.produceId?._id || c.produceId || p._id),
        status: c.status || "pending",
      };

      // Keep previous requests and append the new request.
      setConns((previous) => [...previous, newConnection]);
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          "Unable to send connection request. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Page role="buyer">
      <div className="space-y-6">
        {/* Navigation */}
        <button
          type="button"
          onClick={() => nav("/buyer/search")}
          className="inline-flex items-center gap-2 rounded-xl border border-green-700 bg-white px-4 py-2.5 text-sm font-semibold text-green-800 shadow-sm transition hover:bg-green-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
        >
          <span aria-hidden="true">←</span>
          Back to Search
        </button>

        {/* Main product section */}
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {/* Photo gallery */}
          <section className={`${cardBase} overflow-hidden`}>
            <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage] || images[0]}
                  alt={`${p.crop} photo`}
                  className="h-72 w-full object-contain sm:h-96"
                />
              ) : (
                <div className="grid h-72 place-items-center sm:h-96">
                  <span className="text-8xl">{emoji(p.crop)}</span>
                </div>
              )}

              <span className="absolute left-4 top-4">
                <Badge s={p.status || "Available"} />
              </span>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 p-3">
                {images.map((url, index) => (
                  <button
                    key={`${p._id}-detail-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-xl border-2 ${
                      selectedImage === index
                        ? "border-green-700"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${p.crop} thumbnail ${index + 1}`}
                      className="h-16 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Product information */}
          <section className={`${card} space-y-5`}>
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                  Agricultural Produce
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {p.quality || "Quality not specified"}
                </span>
              </div>

              <h1 className="font-serif text-3xl font-semibold text-green-950 sm:text-4xl">
                {emoji(p.crop)} {p.crop}
              </h1>

              <p className="mt-2 text-sm text-stone-500">
                Fresh produce directly from the farmer
              </p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                Available Quantity
              </p>
              <p className="mt-1 text-3xl font-bold text-green-950">
                {p.quantity}{" "}
                <span className="text-lg font-medium">{p.unit}</span>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500">district</p>
                <p className="mt-1 font-medium text-stone-800">
                  {p.district}, {p.state}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500">Available From</p>
                <p className="mt-1 font-medium text-stone-800">
                  {p.date
                    ? new Date(`${p.date}T00:00:00`).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "Date not specified"}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500">Quality Grade</p>
                <p className="mt-1 font-medium text-stone-800">
                  {p.quality || "Not specified"}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500">Listing Status</p>
                <p className="mt-1 font-medium text-stone-800">
                  {p.status || "Available"}
                </p>
              </div>
            </div>

            {p.description?.trim() && (
              <div>
                <h2 className="font-semibold text-green-950">
                  About this Produce
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
                  {p.description}
                </p>
              </div>
            )}

            {/* Connection requests */}
            <div className="border-t border-stone-200 pt-5">
              <h2 className="mb-3 font-semibold text-green-950">
                Interested in this produce?
              </h2>

              
{canSendRequest && (
  <button
    type="button"
    className={`${btn} w-full py-3`}
    onClick={sendRequest}
    disabled={sending || !farmer}
  >
    {sending
      ? "Sending Request..."
      : conn
        ? "Send Connection Request Again"
        : "Send Connection Request"}
  </button>
)}

{conn && (
  <div className="mt-3 rounded-xl border border-green-100 bg-green-50 p-4">
    <p className="font-semibold text-green-900">
      Previous request:{" "}
      {conn.status === "accepted"
        ? "Connection Accepted"
        : conn.status === "rejected"
          ? "Request Rejected"
          : "Connection Request Sent"}
    </p>

    <p className="mt-1 text-sm text-stone-600">
      {conn.status === "accepted"
        ? "The farmer accepted your request. You can send another request if needed."
        : conn.status === "rejected"
          ? "The farmer rejected your request. You can send another request."
          : "Your request is awaiting the farmer's response. Another request cannot be sent yet."}
    </p>
  </div>
)}


              {err && (
                <p className="mt-3 text-sm text-red-600" role="alert">
                  {err}
                </p>
              )}

              <p className="mt-3 text-xs text-stone-500">
                AgriSetu connects buyers and farmers directly. Price and
                transaction arrangements can be discussed between both parties.
              </p>
            </div>
          </section>
        </div>

        {/* Farmer information */}
        <section className={`${card} space-y-4`}>
          <div className="border-b border-green-200 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
              Seller Information
            </p>

            <h2 className="mt-1 font-serif text-2xl font-semibold text-green-950 sm:text-3xl">
              Meet the Farmer
            </h2>

            <div className="mt-3 h-1 w-14 rounded-full bg-green-700" />
          </div>

          {farmer ? (
            <>
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-green-100 text-xl font-bold text-green-900">
                  {(farmer.name || "F")[0].toUpperCase()}
                </div>

                <div>
                  <h3 className="font-semibold text-green-950">
                    {farmer.name}
                  </h3>
                  <p className="text-sm text-stone-500">
                    Farmer · {farmer.district || p.district}
                    {farmer.state ? `, ${farmer.state}` : ""}
                  </p>
                </div>
              </div>

              {acceptedConnection ? (
                <div className="space-y-2 rounded-xl border border-green-100 bg-green-50 p-4">
                  <h3 className="font-semibold text-green-900">
                    Contact Details
                  </h3>
                  <p className="text-sm text-stone-700">
                    Phone: {farmer.phone || "Not provided"}
                  </p>
                  <p className="text-sm text-stone-700">
                    Email: {farmer.email || "Not provided"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-stone-500">
                  Farmer contact details become available after your connection
                  request is accepted.
                </p>
              )}

              {otherCrops.length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold text-green-950">
                    Other Produce from this Farmer
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {otherCrops.map((crop, index) => (
                      <span
                        key={`${crop}-${index}`}
                        className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1.5 text-sm text-stone-700"
                      >
                        {emoji(crop)} {crop}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <ProduceReviews farmerId={farmer._id} />
            </>
          ) : (
            <p className="text-sm text-stone-500">
              Farmer profile information is currently unavailable.
            </p>
          )}
        </section>
      </div>
    </Page>
  );
}





function BuyerReqs() {
  const { user, reqs, setReqs } = useApp();
  const [f, setF] = useState({ crop: "", quantity: "", date: "" });
  
const set = (key) => (e) => {
  setF((previous) => ({
    ...previous,
    [key]: e.target.value,
  }));
};
  const add = () => {
    if (!f.crop || !(Number(f.quantity) > 0) || !f.date) return;
    setReqs([...reqs, { _id: uid(), buyerId: user._id, crop: f.crop, quantity: Number(f.quantity), date: f.date, status: "Open" }]);
    setF({ crop: "", quantity: "", date: "" });
  };
  return (
    
<Page role="buyer">
  <div className="space-y-7">

    {/* Page Header */}
      
    <div className="border-b border-green-200 pb-5">
      <h1 className="font-serif text-4xl font-semibold text-green-900">
       My Requirements
      </h1>
      
    </div>
     

    {/* Requirement Form */}
    <section className={`${card} overflow-hidden`}>
      <div className="border-b border-green-100 bg-green-50/70 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-800 text-xl text-white shadow-sm">
            +
          </div>

          <div>
            <h2 className="font-serif text-xl font-semibold text-green-950">
              Post a New Requirement
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Add your crop details so matching farmers can plan their supply.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-800">
            Crop Name
          </label>
          <input
            className={`${inp} h-12 w-full rounded-xl`}
            placeholder="e.g. Tomato"
            value={f.crop}
            onChange={(e) =>
              setF({ ...f, crop: e.target.value })
            }
          />
          <p className="text-xs text-stone-500">
            Enter the produce you want to buy.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-800">
            Quantity Required
          </label>
          <div className="relative">
            <input
              className={`${inp} h-12 w-full rounded-xl pr-14`}
              type="number"
              min="1"
              placeholder="e.g. 400"
              value={f.quantity}
              onChange={(e) =>
                setF({ ...f, quantity: e.target.value })
              }
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-stone-500">
              kg
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Specify the quantity in kilograms.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-800">
            Required By
          </label>
          <input
            className={`${inp} h-12 w-full rounded-xl`}
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={f.date}
            onChange={(e) =>
              setF({ ...f, date: e.target.value })
            }
            required
          />
          <p className="text-xs text-stone-500">
            Select your expected delivery date.
          </p>
        </div>

        <div className="flex flex-col justify-end gap-2">
          <button
            type="button"
            className={`${btn} flex h-12 w-full items-center justify-center gap-2 rounded-xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
            onClick={add}
          >
            <span className="text-lg">+</span>
            Post Requirement
          </button>
          <p className="text-center text-xs text-stone-500">
            Share your needs with farmers.
          </p>
        </div>
      </div>
    </section>

    {/* Requirements List */}
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
            Your activity
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-green-950">
            Posted Requirements
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Manage the produce you are looking to purchase.
          </p>
        </div>

        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
          <p className="text-xs font-medium text-green-800">
            Total posted
          </p>
          <p className="mt-1 text-2xl font-semibold text-green-950">
            {reqs.filter((r) => r.buyerId === user._id).length}
          </p>
        </div>
      </div>

      {reqs.filter((r) => r.buyerId === user._id).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-green-300 bg-white px-5 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-3xl">
            🌱
          </div>
          <h3 className="mt-4 font-serif text-xl font-semibold text-green-950">
            No requirements posted yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
            Add your first requirement above to tell farmers which crops and
            quantities you are looking for.
          </p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <Table
              heads={[
                "Crop",
                "Quantity",
                "Required By",
                "Status",
                "Action",
              ]}
              rows={reqs
                .filter((r) => r.buyerId === user._id)
                .map((r) => [
                  <span className="font-semibold text-green-950">
                    {r.crop}
                  </span>,
                  <span className="font-medium text-stone-700">
                    {r.quantity} kg
                  </span>,
                  r.date,
                  <Badge s={r.status} />,
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-800"
                    onClick={() =>
                      setReqs(reqs.filter((x) => x._id !== r._id))
                    }
                  >
                    Delete
                  </button>,
                ])}
            />
          </div>
        </div>
      )}
    </section>
  </div>
</Page>
  );
}


function BuyerConns() {
  const { user, users, produce, conns, setConns } = useApp();

  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewingConnectionId, setReviewingConnectionId] = useState(null);
  const [connectionNotice, setConnectionNotice] = useState(null);

  const connectionRefs = useRef({});
  const previousStatuses = useRef({});

  
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [dateSort, setDateSort] = useState("newest");
   // Refresh connection statuses from the backend every 5 seconds.
useEffect(() => {
  if (!user?._id) return;

  let cancelled = false;

  const refreshConnections = async () => {
    try {
      const response = await api.get("/connections/mine");
      if (cancelled) return;

      const latestConnections = response.data.connections || [];
      const changed = [];

for (const connection of latestConnections) {
  const id = String(connection._id || connection.id);

  const buyerId =
    connection.buyerId?._id || connection.buyerId;

  // Only track connections belonging to this buyer.
  if (String(buyerId) !== String(user._id)) continue;

  const status = connection.status;
  const previousStatus = previousStatuses.current[id];

  // Notify only when a pending connection changes status.
  if (
    previousStatus === "pending" &&
    ["accepted", "rejected"].includes(status)
  ) {
    changed.push({ id, status, connection });
  }

  previousStatuses.current[id] = status;
}

      setConns((previous) => {
        const previousById = new Map(
          previous.map((item) => [
            String(item._id || item.id),
            item,
          ])
        );

        return latestConnections.map((latest) => ({
          ...previousById.get(String(latest._id || latest.id)),
          ...latest,
          _id: latest._id || latest.id,
        }));
      });

      if (changed.length > 0) {
        const latestChange = changed[changed.length - 1];
        const { id, status, connection } = latestChange;

        const productId =
          connection.produceId?._id || connection.produceId;

        const product = produce.find(
          (item) => String(item._id) === String(productId)
        );

        setConnectionNotice({
          id,
          status,
          crop: product?.crop || "your requested produce",
          key: `${id}-${status}`,
        });

      }
    } catch (error) {
      console.error(
        "Unable to refresh connections:",
        error.response?.data || error.message
      );
    }
  };

  refreshConnections();

  const intervalId = setInterval(refreshConnections, 5000);

  return () => {
    cancelled = true;
    clearInterval(intervalId);
  };
}, [user?._id, setConns, produce]);



  // Load the buyer's submitted reviews.
  useEffect(() => {
    let cancelled = false;

    const loadMyReviews = async () => {
      try {
        const response = await api.get("/reviews/mine");

        const ids = new Set(
          (response.data.reviews || []).map((review) =>
            String(review.connectionId?._id || review.connectionId)
          )
        );

        if (!cancelled) setReviewedIds(ids);
      } catch {
        if (!cancelled) {
          setReviewError("Unable to check your review history.");
        }
      } finally {
        if (!cancelled) setReviewLoading(false);
      }
    };

    loadMyReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  // Build the buyer's connection list.
  const mine = conns
    .filter(
      (connection) =>
        String(connection.buyerId?._id || connection.buyerId) ===
        String(user?._id)
    )
    .map((connection) => {
      const productId =
        connection.produceId?._id || connection.produceId;

      const product = produce.find(
        (item) => String(item._id) === String(productId)
      );

      const farmerId =
        product?.farmerId?._id ||
        product?.farmerId ||
        connection.farmerId?._id ||
        connection.farmerId;

      const farmer = users.find(
        (item) => String(item._id) === String(farmerId)
      );

      return { connection, product, farmer };
    })
    


const filteredConnections = mine
  .filter(({ connection, product, farmer }) => {
    const query = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !query ||
      (product?.crop || "").toLowerCase().includes(query) ||
      (farmer?.name || "").toLowerCase().includes(query) ||
      (product?.district || "").toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      connection.status === statusFilter;

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    const dateA = new Date(
      a.connection.updatedAt ||
      a.connection.createdAt ||
      0
    ).getTime();

    const dateB = new Date(
      b.connection.updatedAt ||
      b.connection.createdAt ||
      0
    ).getTime();

    return dateSort === "newest"
      ? dateB - dateA
      : dateA - dateB;
  });


  const handleReviewSubmitted = (connectionId) => {
    setReviewedIds((previous) => {
      const updated = new Set(previous);
      updated.add(String(connectionId));
      return updated;
    });

    setReviewingConnectionId(null);
  };

  return (
    <Page role="buyer">
      <div className="space-y-6">
        <div className="border-b border-green-200 pb-5">
          <h1 className="font-serif text-4xl font-semibold text-green-900">
            My Connections
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Track your farmer connections and share your experience after a
            connection is accepted.
          </p>
        </div>

        
<div className="grid grid-cols-1 gap-3 rounded-2xl border border-green-100 bg-white p-4 sm:grid-cols-3">
  <input
    type="search"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search crop, farmer, district..."
    aria-label="Search connections"
    className="w-full rounded-xl border border-stone-300 px-3 py-3 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    aria-label="Filter connections by status"
    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm"
  >
    <option value="all">All statuses</option>
    <option value="pending">Pending</option>
    <option value="accepted">Accepted</option>
    <option value="rejected">Rejected</option>
  </select>

  <select
    value={dateSort}
    onChange={(e) => setDateSort(e.target.value)}
    aria-label="Sort connections by date"
    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm"
  >
    <option value="newest">Newest first</option>
    <option value="oldest">Oldest first</option>
  </select>
</div>

{connectionNotice && (
  <div
    role="status"
    className={`rounded-xl border px-4 py-4 ${
      connectionNotice.status === "accepted"
        ? "border-green-200 bg-green-50 text-green-900"
        : "border-red-200 bg-red-50 text-red-900"
    }`}
  >
    <p className="font-semibold">
      {connectionNotice.status === "accepted"
        ? `Your ${connectionNotice.crop} connection was accepted!`
        : `Your ${connectionNotice.crop} connection was rejected.`}
    </p>

    <p className="mt-1 text-sm">
      The farmer has {connectionNotice.status} your request for{" "}
      <strong>{connectionNotice.crop}</strong>.
    </p>

    <button
      type="button"
      onClick={() => setConnectionNotice(null)}
      className="mt-2 text-sm font-semibold underline"
    >
      Dismiss
    </button>
  </div>
)}

{filteredConnections.length === 0 ? (          <div className="rounded-2xl border border-dashed border-green-300 bg-green-50/60 px-5 py-10 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
              🌱
            </div>
            <h2 className="mt-4 font-serif text-xl font-semibold text-green-950">
              No connections yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
              Explore available produce and connect directly with farmers to
              get started.
            </p>
            <Link
              to="/buyer/search"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-900"
            >
              Find Produce →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
{filteredConnections.map(({ connection, product, farmer }) => {              const id = String(connection._id || connection.id);
              const reviewed = reviewedIds.has(id);
              const isUpdatedConnection = connectionNotice?.id === id;

              return (
                <article
                  key={id}
                  
                  ref={(element) => {
                    if (element) {
                      connectionRefs.current[id] = element;
                    } else {
                      delete connectionRefs.current[id];
                    }
                  }}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                    isUpdatedConnection
                      ? connectionNotice.status === "accepted"
                        ? "border-green-500 ring-2 ring-green-200"
                        : "border-red-400 ring-2 ring-red-200"
                      : "border-stone-200 hover:border-green-200 hover:shadow-md"
                  }`}
                >
                  {isUpdatedConnection && (
                    <div
                      className={`px-5 py-3 text-sm font-semibold ${
                        connectionNotice.status === "accepted"
                          ? "bg-green-800 text-white"
                          : "bg-red-700 text-white"
                      }`}
                    >
                      {connectionNotice.status === "accepted"
                        ? "✓ Your connection was accepted"
                        : "✕ Your connection was rejected"}
                    </div>
                  )}

                  <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-green-100 bg-green-50 shadow-sm">
                        {product?.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.crop || "Produce"}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-green-700">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="font-serif text-xl font-semibold text-green-950">
                          {product?.crop || "Produce unavailable"}
                        </h2>
                        <p className="mt-1 text-sm text-stone-600">
                          Farmer:{" "}
                          <span className="font-medium text-stone-800">
                            {farmer?.name || "Farmer information unavailable"}
                          </span>
                        </p>

                        {product && (
                          <p className="mt-2 text-sm text-stone-500">
                            {product.quantity} {product.unit}
                            <span className="mx-2 text-stone-300">•</span>
                            {product.district || "district unavailable"}
                          </p>
                        )}
                      </div>
                      
<div className="mt-3 space-y-1 text-xs text-stone-500">
  <p>
    <span className="font-semibold text-stone-700">
      Request date:
    </span>{" "}
    {formatConnectionDate(connection.createdAt)}
  </p>

  {["accepted", "rejected"].includes(connection.status) && (
    <p>
      <span className="font-semibold text-stone-700">
        {connection.status === "accepted"
          ? "Accepted date:"
          : "Rejected date:"}
      </span>{" "}
      {formatConnectionDate(connection.updatedAt)}
    </p>
  )}
</div>
                    </div>

                    <Badge s={connection.status} />
                  </div>

                  <div className="border-t border-stone-100 px-5 py-4 sm:px-6">
                    {connection.status === "accepted" ? (
                      <div className="rounded-xl border border-green-100 bg-green-50/70 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-green-800">
                          Connection accepted · Farmer contact
                        </p>

                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <p className="break-words text-stone-700">
                            <span className="font-medium text-stone-900">
                              Phone
                            </span>
                            <span className="mx-2 text-stone-300">·</span>
                            {farmer?.phone || "Not provided"}
                          </p>

                          <p className="break-words text-stone-700">
                            <span className="font-medium text-stone-900">
                              Email
                            </span>
                            <span className="mx-2 text-stone-300">·</span>
                            {farmer?.email || "Not provided"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600">
                        Farmer contact details will be available when the
                        connection is accepted.
                      </p>
         
           )}
                  </div>

                  {connection.status === "accepted" && (
                    <div className="border-t border-stone-100 px-5 py-5 sm:px-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-green-950">
                            Your experience
                          </h3>
                          <p className="mt-1 text-sm text-stone-500">
                            Share feedback about the farmer and produce.
                          </p>
                        </div>

                        {reviewLoading ? (
                          <span className="text-sm text-stone-500">
                            Checking review status...
                          </span>
                        ) : reviewed ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-2 text-sm font-medium text-green-800">
                            <span aria-hidden="true">✓</span>
                            Review submitted
                          </span>
                        ) : reviewError ? (
                          <p role="alert" className="text-sm text-stone-600">
                            Refresh the page to check your review status.
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setReviewingConnectionId((current) =>
                                current === id ? null : id
                              )
                            }
                            className="inline-flex items-center justify-center rounded-xl border border-green-800 bg-white px-4 py-2.5 text-sm font-semibold text-green-800 transition hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                          >
                            {reviewingConnectionId === id
                              ? "Cancel Review"
                              : "Write a Review"}
                          </button>
                        )}
                      </div>

                      {!reviewLoading &&
                        !reviewed &&
                        !reviewError &&
                        reviewingConnectionId === id && (
                          <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50/70 p-4 sm:p-5">
                            <ConnectionReviewForm
                              connection={connection}
                              onSubmitted={handleReviewSubmitted}
                            />
                          </div>
                        )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
}



function formatConnectionDate(date) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------- App ----------
export default function App() {
  const [user, setUser] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("agrisetu_user")) || null;
  } catch {
    return null;
  }
});

const [users, setUsers] = useState([]);
const [produce, setProduce] = useState([]);
const [produceLoading, setProduceLoading] = useState(true);

useEffect(() => {
  let cancelled = false;

  
api
  .get("/produce")
  .then((response) => {
    console.log("Produce API response:", response.data);

    const items = Array.isArray(response.data)
      ? response.data
      : response.data.produce || [];

    console.log("Produce records loaded:", items.length);

    if (!cancelled) {
      setProduce(items);
    }
  })
  .catch((error) => {
    console.error(
      "Unable to load produce:",
      error.response?.data || error.message
    );
  })
    .finally(() => {
      if (!cancelled) setProduceLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, []);

const [reqs, setReqs] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("agrisetu_reqs")) || [];
  } catch {
    return [];
  }
});

const [conns, setConns] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("agrisetu_conns")) || [];
  } catch {
    return [];
  }
});

useEffect(() => {
  if (!user || !localStorage.getItem("agrisetu_token")) return;

  let cancelled = false;

  api
    .get("/connections/mine")
    .then((response) => {
      if (cancelled) return;

      const connections = response.data.connections || [];

      setConns(
  connections.map((c) => ({
    ...c,
    _id: c._id || c.id,
  }))
);

      setUsers((previous) => {
        const profiles = connections
          .filter((c) => c.otherUser)
          .map((c) => ({
            ...c.otherUser,
            _id:
              user.role === "buyer"
                ? c.farmerId
                : c.buyerId,
          }));

        const merged = [...previous, ...profiles, user];
        return [
          ...new Map(merged.map((u) => [u._id, u])).values(),
        ];
      });
    })
    .catch((error) => {
      console.error(
        "Unable to load connections:",
        error.response?.data || error.message
      );
    });

  return () => {
    cancelled = true;
  };
}, [user]);





useEffect(() => {
  localStorage.setItem("agrisetu_reqs", JSON.stringify(reqs));
}, [reqs]);

useEffect(() => {
  localStorage.setItem("agrisetu_conns", JSON.stringify(conns));
}, [conns]);
  return (
    <Ctx.Provider value={{ user, setUser, users, setUsers, produce, setProduce, produceLoading, reqs, setReqs, conns, setConns }}>
      <BrowserRouter>

          <Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  <Route path="/farmer/dashboard" element={<FarmerDash />} />
  <Route path="/farmer/produce" element={<FarmerProduce />} />
  <Route path="/farmer/produce/add" element={<ProduceForm />} />
  <Route path="/farmer/produce/:id/edit" element={<ProduceForm />} />
  <Route path="/farmer/requests" element={<FarmerRequests />} />
  <Route path="/farmer/connections" element={<FarmerRequests onlyAccepted />} />

  <Route path="/buyer/dashboard" element={<BuyerDash />} />
  <Route path="/buyer/search" element={<BuyerSearch />} />
  <Route path="/buyer/produce/:id" element={<ProduceDetails />} />
  <Route path="/buyer/requirements" element={<BuyerReqs />} />
  <Route path="/buyer/connections" element={<BuyerConns />} />

  <Route
    path="*"
    element={
      <div className="p-10 text-center">
        Page not found.{" "}
        <Link className="underline" to="/">
          Home
        </Link>
      </div>
    }
  />
</Routes>        
      </BrowserRouter>
    </Ctx.Provider>
  );
}
