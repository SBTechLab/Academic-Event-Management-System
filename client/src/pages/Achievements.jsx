import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award } from 'lucide-react';
import { isEventCompleted } from '../eventUtils';

const Achievements = () => {
    const { getAuthHeaders, user } = useAuth();
    const [participantAchievements, setParticipantAchievements] = useState([]);
    const [coordinatorAchievements, setCoordinatorAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAchievements = async () => {
        try {
            const [regsRes, eventsRes] = await Promise.all([
                fetch('http://localhost:5001/api/registrations/my-registrations', { headers: getAuthHeaders() }),
                fetch('http://localhost:5001/api/events?limit=200')
            ]);
            if (!regsRes.ok) throw new Error('Failed to fetch registrations');
            if (!eventsRes.ok) throw new Error('Failed to fetch events');
            const regs = await regsRes.json();
            const allEvents = await eventsRes.json();

            setParticipantAchievements(
                regs.filter(r => r.role_type === 'participant' && r.status === 'attended')
                    .map(r => ({ ...r, event: allEvents.find(e => e.id === r.event_id) || r.event }))
                    .filter(r => r.event?.date && isEventCompleted(r.event.date, r.event.time || '00:00:00'))
            );
            setCoordinatorAchievements(
                regs.filter(r => r.role_type === 'coordinator' && r.status === 'registered')
                    .map(r => ({ ...r, event: allEvents.find(e => e.id === r.event_id) || r.event }))
                    .filter(r => r.event?.date && isEventCompleted(r.event.date, r.event?.time || '00:00:00'))
            );
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAchievements(); }, [getAuthHeaders]);
    useEffect(() => {
        const fn = () => { if (document.visibilityState === 'visible') fetchAchievements(); };
        document.addEventListener('visibilitychange', fn);
        return () => document.removeEventListener('visibilitychange', fn);
    }, []);
    useEffect(() => {
        const t = setInterval(fetchAchievements, 5000);
        return () => clearInterval(t);
    }, []);

    const printCertificate = (record) => {
        const isCoord = record.role_type === 'coordinator';
        const eventDate = record.event?.date
            ? new Date(record.event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : 'N/A';
        const location = record.event?.location || 'N/A';
        const eventTitle = record.event?.title || 'Event Name';
        const studentName = user?.full_name || 'Participant';

        const c = isCoord
            ? { primary: '#145a32', secondary: '#1e8449', light: '#d5f5e3', accent: '#27ae60', gold: '#d4ac0d' }
            : { primary: '#1a3a6b', secondary: '#2471a3', light: '#d6eaf8', accent: '#2980b9', gold: '#d4ac0d' };

        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${isCoord ? 'Coordinator Certificate' : 'Participation Certificate'}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body {
    width:297mm; height:210mm;
    background:#ffffff;
    -webkit-print-color-adjust:exact !important;
    print-color-adjust:exact !important;
    color-adjust:exact !important;
  }
  @page { size:A4 landscape; margin:0; }
  @media print { .page { box-shadow:none !important; } }
  .page {
    width:297mm; height:210mm;
    position:relative; overflow:hidden;
    background:#ffffff;
    font-family:Georgia,'Times New Roman',serif;
  }
  .strip-left {
    position:absolute; top:0; left:0; bottom:0; width:22mm;
    background-color:${c.primary};
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .strip-left-inner {
    position:absolute; top:0; left:22mm; bottom:0; width:5mm;
    background-color:${c.accent};
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .strip-right {
    position:absolute; top:0; right:0; bottom:0; width:22mm;
    background-color:${c.primary};
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .strip-right-inner {
    position:absolute; top:0; right:22mm; bottom:0; width:5mm;
    background-color:${c.accent};
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .bar-top {
    position:absolute; top:0; left:0; right:0; height:10mm;
    background-color:${c.primary};
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .bar-top-inner {
    position:absolute; top:10mm; left:0; right:0; height:3mm;
    background-color:${c.accent};
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .bar-bottom {
    position:absolute; bottom:0; left:0; right:0; height:10mm;
    background-color:${c.primary};
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .bar-bottom-inner {
    position:absolute; bottom:10mm; left:0; right:0; height:3mm;
    background-color:${c.accent};
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .watermark {
    position:absolute; top:50%; left:50%;
    transform:translate(-50%,-50%);
    width:120mm; height:120mm; border-radius:50%;
    background-color:${c.light}; opacity:0.4;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .strip-text-left {
    position:absolute; top:50%; left:11mm;
    transform:translate(-50%,-50%) rotate(-90deg);
    font-family:Arial,sans-serif; font-size:7pt;
    letter-spacing:3px; text-transform:uppercase;
    color:rgba(255,255,255,0.7); white-space:nowrap; z-index:5;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .strip-text-right {
    position:absolute; top:50%; right:11mm;
    transform:translate(50%,-50%) rotate(90deg);
    font-family:Arial,sans-serif; font-size:7pt;
    letter-spacing:3px; text-transform:uppercase;
    color:rgba(255,255,255,0.7); white-space:nowrap; z-index:5;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .content {
    position:absolute; top:13mm; bottom:13mm; left:30mm; right:30mm;
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; text-align:center; z-index:10; padding:0 20px;
  }
  .org {
    font-family:Arial,sans-serif; font-size:8pt;
    letter-spacing:3px; text-transform:uppercase;
    color:${c.secondary}; margin-bottom:3mm;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .divider { display:flex; align-items:center; gap:6px; width:100%; margin-bottom:3mm; }
  .div-line {
    flex:1; height:1px; background-color:${c.accent};
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .div-diamond {
    width:7px; height:7px; background-color:${c.gold};
    transform:rotate(45deg); flex-shrink:0;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .cert-of {
    font-family:Arial,sans-serif; font-size:9pt;
    letter-spacing:5px; text-transform:uppercase;
    color:${c.secondary}; margin-bottom:1mm;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .cert-title {
    font-size:28pt; font-weight:bold; color:${c.primary};
    margin-bottom:4mm; line-height:1.1;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .presented { font-family:Arial,sans-serif; font-size:9pt; color:#888; letter-spacing:2px; text-transform:uppercase; margin-bottom:2mm; }
  .name {
    font-size:22pt; font-weight:bold; color:${c.primary};
    border-bottom:2px solid ${c.gold};
    padding-bottom:2mm; margin-bottom:4mm; min-width:80mm;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .desc { font-family:Arial,sans-serif; font-size:10pt; color:#444; line-height:1.6; max-width:160mm; margin-bottom:4mm; }
  .desc b { color:${c.primary}; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .meta { display:flex; gap:20mm; margin-bottom:4mm; }
  .meta-item { display:flex; flex-direction:column; align-items:center; gap:1mm; }
  .meta-label { font-family:Arial,sans-serif; font-size:7pt; letter-spacing:2px; text-transform:uppercase; color:#aaa; }
  .meta-val {
    font-family:Arial,sans-serif; font-size:9pt; font-weight:bold; color:${c.primary};
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .sigs { display:flex; justify-content:space-between; width:100%; padding:0 10mm; margin-top:2mm; }
  .sig { display:flex; flex-direction:column; align-items:center; gap:2mm; }
  .sig-line {
    width:35mm; height:1px; background-color:${c.primary};
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .sig-label { font-family:Arial,sans-serif; font-size:7pt; letter-spacing:1px; text-transform:uppercase; color:#888; }
  .seal { position:absolute; bottom:14mm; right:32mm; width:22mm; height:22mm; z-index:20; }
</style>
</head>
<body>
<div class="page">
  <div class="bar-top"></div>
  <div class="bar-top-inner"></div>
  <div class="bar-bottom"></div>
  <div class="bar-bottom-inner"></div>
  <div class="strip-left"></div>
  <div class="strip-left-inner"></div>
  <div class="strip-right"></div>
  <div class="strip-right-inner"></div>
  <div class="strip-text-left">Academic Event Management System</div>
  <div class="strip-text-right">Department of Computer Engineering</div>
  <div class="watermark"></div>
  <div class="seal">
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <polygon points="40,5 47,25 68,25 52,38 58,58 40,46 22,58 28,38 12,25 33,25" fill="${c.gold}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;"/>
      <circle cx="40" cy="40" r="16" fill="${c.primary}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;"/>
      <text x="40" y="37" text-anchor="middle" font-size="7" fill="white" font-family="Arial" font-weight="bold">DEPT</text>
      <text x="40" y="47" text-anchor="middle" font-size="7" fill="white" font-family="Arial" font-weight="bold">CERT</text>
    </svg>
  </div>
  <div class="content">
    <div class="org">Department of Computer Engineering &nbsp;•&nbsp; Academic Event Management System</div>
    <div class="divider"><div class="div-line"></div><div class="div-diamond"></div><div class="div-line"></div></div>
    <div class="cert-of">Certificate of</div>
    <div class="cert-title">${isCoord ? 'Coordination &amp; Leadership' : 'Participation'}</div>
    <div class="presented">This certificate is proudly presented to</div>
    <div class="name">${studentName}</div>
    <div class="desc">
      ${isCoord
        ? `For outstanding dedication and leadership as an <b>Event Coordinator</b> for <b>"${eventTitle}"</b>, demonstrating exceptional organizational skills and commitment to academic excellence.`
        : `For active participation in the event <b>"${eventTitle}"</b>, showcasing enthusiasm and commitment to academic and professional development.`
      }
    </div>
    <div class="meta">
      <div class="meta-item"><span class="meta-label">Event Date</span><span class="meta-val">${eventDate}</span></div>
      <div class="meta-item"><span class="meta-label">Venue</span><span class="meta-val">${location}</span></div>
      <div class="meta-item"><span class="meta-label">Role</span><span class="meta-val">${isCoord ? 'Coordinator' : 'Participant'}</span></div>
    </div>
    <div class="divider"><div class="div-line"></div><div class="div-diamond"></div><div class="div-line"></div></div>
    <div class="sigs">
      <div class="sig"><div class="sig-line"></div><div class="sig-label">Faculty Coordinator</div></div>
      <div class="sig"><div class="sig-line"></div><div class="sig-label">Head of Department</div></div>
      <div class="sig"><div class="sig-line"></div><div class="sig-label">Principal</div></div>
    </div>
  </div>
</div>
<script>
  window.onload = () => {
    window.print();
    window.onfocus = () => window.close();
  };
</script>
</body>
</html>`;

        const w = window.open('', '_blank', 'width=1200,height=800');
        if (w) {
            w.document.write(html);
            w.document.close();
            w.focus();
            w.onafterprint = () => { w.close(); window.focus(); };
        } else alert('Please allow popups to download certificate.');
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-gray-500 font-semibold">Loading achievements...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">My Achievements</h1>
                <p className="text-gray-500 mt-1">Certificates for events you have successfully attended and completed.</p>
            </div>

            {participantAchievements.length === 0 && coordinatorAchievements.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No certificates yet</h3>
                    <p className="text-gray-500 mt-1">Attend events or get coordinator approval to generate certificates.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {participantAchievements.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Participant Certificates</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {participantAchievements.map(item => (
                                    <div key={`p-${item.id}`} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-500">Event</p>
                                                <p className="font-semibold text-gray-800">{item.event?.title || 'Unknown event'}</p>
                                            </div>
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" onClick={() => printCertificate(item)}>
                                                Download
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Date: {item.event?.date || 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {coordinatorAchievements.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Coordinator Certificates</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {coordinatorAchievements.map(item => (
                                    <div key={`c-${item.id}`} className="p-4 border border-green-200 rounded-lg bg-green-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-500">Event</p>
                                                <p className="font-semibold text-gray-800">{item.event?.title || 'Unknown event'}</p>
                                            </div>
                                            <button className="text-green-700 hover:text-green-900 text-sm font-medium" onClick={() => printCertificate(item)}>
                                                Download
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Date: {item.event?.date || 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Achievements;
