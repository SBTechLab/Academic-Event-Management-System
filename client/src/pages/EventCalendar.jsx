import { useState, useEffect } from 'react';

const BLUE = '#0061ff';
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const fmt = (date) => date.toISOString().split('T')[0];

const EventCalendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('month');
    const [current, setCurrent] = useState(new Date());
    const [search, setSearch] = useState('');
    const [rangeFrom, setRangeFrom] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5001/api/events?limit=200&_=${Date.now()}`)
            .then(r => r.json())
            .then(data => {
                setEvents(Array.isArray(data) ? data.filter(e => e.status === 'approved') : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = events.filter(e => {
        const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
        const matchDate = rangeFrom ? e.date === rangeFrom : true;
        return matchSearch && matchDate;
    });

    const byDate = {};
    filtered.forEach(e => {
        if (!byDate[e.date]) byDate[e.date] = [];
        byDate[e.date].push(e);
    });

    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    const weekStart = new Date(current);
    weekStart.setDate(current.getDate() - current.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

    const prevPeriod = () => {
        const d = new Date(current);
        if (view === 'month') d.setMonth(d.getMonth() - 1);
        else if (view === 'week') d.setDate(d.getDate() - 7);
        else d.setDate(d.getDate() - 1);
        setCurrent(d);
    };
    const nextPeriod = () => {
        const d = new Date(current);
        if (view === 'month') d.setMonth(d.getMonth() + 1);
        else if (view === 'week') d.setDate(d.getDate() + 7);
        else d.setDate(d.getDate() + 1);
        setCurrent(d);
    };

    const periodLabel = () => {
        if (view === 'month') return `${MONTHS[month]} ${year}`;
        if (view === 'week') return `${MONTHS[weekDays[0].getMonth()]} ${weekDays[0].getDate()} – ${weekDays[6].getDate()}, ${weekDays[6].getFullYear()}`;
        return current.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    // Upcoming events (next 5 from today)
    const today = fmt(new Date());
    const upcoming = filtered
        .filter(e => e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    const EventChip = ({ event }) => (
        <div
            onClick={e => { e.stopPropagation(); setSelected(event); }}
            className="truncate rounded-md px-1.5 py-0.5 text-white cursor-pointer hover:opacity-80 transition text-[10px] font-medium leading-4"
            style={{ background: BLUE, marginBottom: '2px' }}
            title={event.title}
        >
            {event.title}
        </div>
    );

    const DayCell = ({ date }) => {
        if (!date) return <div className="rounded-lg bg-gray-50" style={{ minHeight: '64px' }} />;
        const key = fmt(date);
        const dayEvents = byDate[key] || [];
        const isToday = key === fmt(new Date());
        return (
            <div
                className={`rounded-lg p-1.5 flex flex-col cursor-default transition ${isToday ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-white border border-gray-100 hover:border-blue-200'}`}
                style={{ minHeight: '64px' }}
            >
                <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                    {date.getDate()}
                </span>
                {dayEvents.slice(0, 2).map(ev => <EventChip key={ev.id} event={ev} />)}
                {dayEvents.length > 2 && (
                    <span
                        className="text-[10px] text-blue-500 font-semibold cursor-pointer"
                        onClick={() => setSelected({ _group: true, date: key, events: dayEvents })}
                    >
                        +{dayEvents.length - 2} more
                    </span>
                )}
            </div>
        );
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-gray-500 text-sm">Loading calendar...</div>;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #0061ff, #0040cc)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight">Event Calendar</h1>
                        {filtered.length > 0 && <p className="text-blue-100 text-xs mt-0.5">{filtered.length} approved events</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Search */}
                        <div className="relative">
                            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white bg-opacity-20 text-white placeholder-blue-200 border border-white border-opacity-30 focus:outline-none focus:bg-opacity-30 w-36"
                            />
                        </div>
                        {/* Date filter */}
                        <input
                            type="date"
                            value={rangeFrom}
                            onChange={e => setRangeFrom(e.target.value)}
                            className="px-2 py-1.5 text-xs rounded-lg bg-white text-gray-700 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        {(search || rangeFrom) && (
                            <button onClick={() => { setSearch(''); setRangeFrom(''); }} className="text-xs text-blue-200 hover:text-white underline">Clear</button>
                        )}
                        {/* View toggle */}
                        <div className="flex bg-white bg-opacity-20 rounded-lg p-0.5 gap-0.5">
                            {['month', 'week', 'day'].map(v => (
                                <button key={v} onClick={() => setView(v)}
                                    className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition ${view === v ? 'bg-white text-blue-600' : 'text-white hover:bg-white hover:bg-opacity-10'}`}>
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main: Calendar + Sidebar */}
            <div className="flex gap-4 items-start">
                {/* Calendar Panel */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Nav */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                        <button onClick={prevPeriod} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 font-bold text-base transition">‹</button>
                        <h2 className="text-base font-extrabold text-gray-800">{periodLabel()}</h2>
                        <button onClick={nextPeriod} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 font-bold text-base transition">›</button>
                    </div>

                    {/* Month View */}
                    {view === 'month' && (
                        <div className="p-3">
                            <div className="grid grid-cols-7 mb-1">
                                {DAYS.map(d => (
                                    <div key={d} className="text-center text-[11px] font-bold text-gray-400 uppercase py-1">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {cells.map((date, i) => <DayCell key={i} date={date} />)}
                            </div>
                        </div>
                    )}

                    {/* Week View */}
                    {view === 'week' && (
                        <div className="p-3">
                            <div className="grid grid-cols-7 gap-1">
                                {weekDays.map((date, i) => (
                                    <div key={i}>
                                        <div className="text-center text-[11px] font-bold text-gray-400 uppercase mb-1">
                                            {DAYS[i]} <span className={fmt(date) === fmt(new Date()) ? 'text-blue-600' : 'text-gray-500'}>{date.getDate()}</span>
                                        </div>
                                        <DayCell date={date} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Day View */}
                    {view === 'day' && (
                        <div className="p-5">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                {current.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                            {(byDate[fmt(current)] || []).length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-10">No events on this day.</p>
                            ) : (
                                <div className="space-y-2">
                                    {(byDate[fmt(current)] || []).map(ev => (
                                        <div key={ev.id} onClick={() => setSelected(ev)}
                                            className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50 cursor-pointer hover:shadow-sm transition">
                                            <span className="text-xs font-bold text-blue-600 w-12 flex-shrink-0">{ev.time?.slice(0, 5)}</span>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{ev.title}</p>
                                                <p className="text-xs text-gray-500">{ev.location}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Upcoming Sidebar */}
                <div className="w-56 flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
                    <h3 className="text-sm font-extrabold text-gray-800">Upcoming</h3>
                    {upcoming.length === 0 ? (
                        <p className="text-xs text-gray-400">No upcoming events.</p>
                    ) : upcoming.map(ev => (
                        <div key={ev.id} onClick={() => setSelected(ev)}
                            className="cursor-pointer group p-2.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition">
                            <p className="text-xs font-bold text-gray-800 group-hover:text-blue-600 leading-snug line-clamp-2">{ev.title}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {ev.time?.slice(0, 5)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Event Detail Modal */}
            {selected && !selected._group && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                        <div className="p-1" style={{ background: 'linear-gradient(135deg, #0061ff, #0040cc)' }}>
                            <div className="bg-white rounded-xl p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{selected.event_type}</span>
                                        <h3 className="text-base font-extrabold text-gray-900 mt-2 leading-snug">{selected.title}</h3>
                                    </div>
                                    <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-2xl leading-none ml-2">×</button>
                                </div>
                                <div className="space-y-2 text-xs">
                                    {[
                                        ['📅 Date', new Date(selected.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
                                        ['🕐 Time', selected.time],
                                        ['📍 Location', selected.location],
                                    ].map(([label, val]) => (
                                        <div key={label} className="flex gap-2 items-start">
                                            <span className="text-gray-400 w-20 flex-shrink-0">{label}</span>
                                            <span className="text-gray-700 font-semibold">{val}</span>
                                        </div>
                                    ))}
                                    {selected.description && (
                                        <div className="pt-2 border-t border-gray-100 mt-2">
                                            <p className="text-gray-500 leading-relaxed">{selected.description}</p>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setSelected(null)}
                                    className="mt-4 w-full py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition"
                                    style={{ background: BLUE }}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Group Modal */}
            {selected && selected._group && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 max-h-[70vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-extrabold text-gray-900">
                                Events · {new Date(selected.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                            </h3>
                            <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
                        </div>
                        <div className="space-y-2">
                            {selected.events.map(ev => (
                                <div key={ev.id} onClick={() => setSelected(ev)}
                                    className="p-3 rounded-xl border border-blue-100 bg-blue-50 cursor-pointer hover:shadow-sm transition">
                                    <p className="text-sm font-bold text-gray-800">{ev.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{ev.time?.slice(0, 5)} · {ev.location}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventCalendar;
