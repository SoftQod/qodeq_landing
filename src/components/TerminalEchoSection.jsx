import { useEffect, useMemo, useRef, useState } from 'react';

const darkTheme = {
  colors: {
    background: '#0D0D0D',
    panel: '#111111',
    border: '#2D2D2D',
    text: '#ECECEC',
    muted: '#8E8E8E',
    accent: '#10A37F'
  }
};

const initialEntries = [
  {
    id: 1,
    user: 'ops_lead',
    message: 'Great response speed, support queue dropped by 34%.',
    ts: '18:04:12'
  },
  {
    id: 2,
    user: 'casino_team',
    message: 'Escalation flow is clear and easier for agents.',
    ts: '18:06:47'
  },
  {
    id: 3,
    user: 'fintech_pm',
    message: 'Payment-related tickets are resolved much faster now.',
    ts: '18:10:03'
  }
];

/** Demo comments only — same shape as real feedback; rotated for a live feed feel. */
const liveCommentSamples = [
  { user: 'support_lead', message: 'SLA finally feels predictable — bots took the repetitive tier 1 load.' },
  { user: 'vip_host_mia', message: 'Guests get answers in-channel without bouncing between tabs.' },
  { user: 'risk_ops', message: 'Audit trail on escalations saved us twice this quarter.' },
  { user: 'latam_ops', message: 'Spanish flow matches our English queue — big win for parity.' },
  { user: 'product_analyst', message: 'We finally see which intents clog agents vs self-serve.' },
  { user: 'infra_contractor', message: 'Webhook retries are sane; no more mystery duplicate tickets.' },
  { user: 'cx_director', message: 'Agent morale up — less copy-paste, more actual problems.' },
  { user: 'payments_pod', message: 'Refund disputes route with context; resolution time halved.' }
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const pad = (n) => String(n).padStart(2, '0');
const nowTime = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/** Replace with your real inbox for landing enquiries. */
const CONTACT_INBOX = 'hello@qodeq.com';

const inputReset = {
  width: '100%',
  boxSizing: 'border-box',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: darkTheme.colors.text,
  fontSize: 14,
  fontFamily: "Inter, 'Segoe UI', Arial, sans-serif"
};

export const TerminalEchoSection = () => {
  const [entries, setEntries] = useState(initialEntries);
  const [draft, setDraft] = useState('');
  const [recentId, setRecentId] = useState(null);
  const [headerClock, setHeaderClock] = useState(() => nowTime());
  const logScrollRef = useRef(null);

  const [contactReach, setContactReach] = useState('');
  const [contactNote, setContactNote] = useState('');
  const [contactError, setContactError] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const nextId = useMemo(
    () => (entries.length ? Math.max(...entries.map((e) => e.id)) + 1 : 1),
    [entries]
  );

  useEffect(() => {
    const t = window.setInterval(() => setHeaderClock(nowTime()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      return undefined;
    }

    const scheduleNext = () => 13000 + Math.random() * 11000;
    const timeoutRef = { id: 0 };

    const pushLiveComment = () => {
      const sample = pick(liveCommentSamples);
      let addedId = 0;
      setEntries((prev) => {
        const cap = 22;
        const base = prev.length >= cap ? prev.slice(-(cap - 1)) : prev;
        const nid = base.length ? Math.max(...base.map((e) => e.id)) + 1 : 1;
        addedId = nid;
        return [...base, { id: nid, user: sample.user, message: sample.message, ts: nowTime() }];
      });
      setRecentId(addedId);
      window.setTimeout(() => setRecentId(null), 900);
      timeoutRef.id = window.setTimeout(pushLiveComment, scheduleNext());
    };

    timeoutRef.id = window.setTimeout(pushLiveComment, scheduleNext());
    return () => window.clearTimeout(timeoutRef.id);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      return;
    }

    const created = {
      id: nextId,
      user: 'you',
      message: text,
      ts: nowTime()
    };

    setEntries((prev) => [...prev, created]);
    setRecentId(created.id);
    setDraft('');
    window.setTimeout(() => setRecentId(null), 900);

    const scrollLogToBottom = () => {
      const el = logScrollRef.current;
      if (!el) {
        return;
      }
      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
    };
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollLogToBottom);
    });
  };

  const handleContactSubmit = (event) => {
    event.preventDefault();
    const reach = contactReach.trim();
    const note = contactNote.trim();

    if (!reach) {
      setContactError('Enter email, Telegram, or phone so we can reach you.');
      return;
    }

    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reach);
    const looksLikeTg = /^@?[a-zA-Z][a-zA-Z0-9_]{3,}$/.test(reach);
    const digits = reach.replace(/\D/g, '');
    const looksLikePhone = digits.length >= 10;

    if (reach.includes('@') && !looksLikeEmail && !looksLikeTg) {
      setContactError('Check email format or Telegram handle (@username).');
      return;
    }

    if (!looksLikeEmail && !looksLikeTg && !looksLikePhone && reach.length < 6) {
      setContactError('Enter a full phone number, email, or @telegram.');
      return;
    }

    setContactError('');
    setContactSent(true);

    const lines = [`Contact: ${reach}`, note && `\nMessage:\n${note}`].filter(Boolean);

    const body = encodeURIComponent(lines.join('\n'));
    const subject = encodeURIComponent('Contact — QODEQ landing');
    window.location.href = `mailto:${CONTACT_INBOX}?subject=${subject}&body=${body}`;
  };

  return (
    <section
      className="echo-section"
      style={{
        background: darkTheme.colors.background,
        color: darkTheme.colors.text,
        padding: '0 6vw',
        paddingBottom: 'clamp(72px, 12vh, 160px)',
        fontFamily: "Inter, 'Segoe UI', Arial, sans-serif"
      }}
    >
      <style>
        {`
          .echo-section {
            position: relative;
            isolation: isolate;
          }
          .echo-section-content {
            position: relative;
            z-index: 1;
          }
          .echo-ascii-bg {
            position: absolute;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            overflow: hidden;
          }
          .echo-ascii-block {
            position: absolute;
            margin: 0;
            padding: 0;
            font-family:
              ui-monospace,
              SFMono-Regular,
              Menlo,
              Monaco,
              Consolas,
              'Liberation Mono',
              monospace;
            font-size: clamp(11px, 1.45vw, 19px);
            line-height: 1.38;
            letter-spacing: 0.06em;
            color: rgba(16, 163, 127, 0.09);
            white-space: pre;
            user-select: none;
          }
          .echo-ascii-block.echo-ascii-dim {
            color: rgba(16, 163, 127, 0.055);
            font-size: clamp(10px, 1.25vw, 16px);
          }
          .echo-ascii-block.echo-ascii-xl {
            font-size: clamp(13px, 1.85vw, 24px);
            letter-spacing: 0.07em;
            color: rgba(16, 163, 127, 0.065);
          }
          .echo-ascii-band {
            left: 0;
            right: 0;
            width: 100%;
            text-align: center;
            transform: none;
            line-height: 1.5;
          }
          .echo-ascii-band-t {
            top: 0;
          }
          .echo-ascii-band-b {
            bottom: 2%;
          }
          .echo-ascii-rail {
            top: 34%;
            transform: translateY(-50%);
            line-height: 1.55;
            font-size: clamp(12px, 1.6vw, 20px);
          }
          .echo-ascii-rail-l {
            left: clamp(4px, 1vw, 16px);
          }
          .echo-ascii-rail-r {
            right: clamp(4px, 1vw, 16px);
            text-align: right;
          }
          .echo-ascii-tl {
            top: clamp(18px, 4vh, 72px);
            left: clamp(8px, 2vw, 48px);
            transform: rotate(-2.5deg);
          }
          .echo-ascii-tr {
            top: clamp(26px, 5vh, 88px);
            right: clamp(8px, 2vw, 44px);
            text-align: right;
            transform: rotate(2deg);
          }
          .echo-ascii-bl {
            bottom: clamp(124px, 24vh, 270px);
            left: clamp(10px, 2.8vw, 52px);
            transform: rotate(-1.5deg);
          }
          .echo-ascii-br {
            bottom: clamp(132px, 25vh, 280px);
            right: clamp(8px, 2.5vw, 48px);
            text-align: right;
            transform: rotate(2.8deg);
          }
          .echo-ascii-q1 {
            top: 10%;
            left: 12%;
            transform: rotate(-4deg);
          }
          .echo-ascii-q2 {
            top: 14%;
            right: 11%;
            text-align: right;
            transform: rotate(3deg);
          }
          .echo-ascii-q3 {
            bottom: 54%;
            left: 14%;
            transform: rotate(-2deg);
          }
          .echo-ascii-q4 {
            bottom: 50%;
            right: 13%;
            text-align: right;
            transform: rotate(3.5deg);
          }
          .echo-ascii-centerpiece {
            left: 50%;
            top: 22%;
            transform: translate(-50%, -50%) rotate(-0.5deg);
            text-align: center;
          }
          .echo-ascii-scatter-a {
            top: 4%;
            left: 38%;
            transform: rotate(-6deg);
          }
          .echo-ascii-scatter-b {
            top: 32%;
            left: 8%;
            transform: rotate(5deg);
          }
          .echo-ascii-scatter-c {
            top: 38%;
            right: 9%;
            left: auto;
            text-align: right;
            transform: rotate(-4deg);
          }
          .echo-ascii-scatter-d {
            bottom: 68%;
            left: 42%;
            transform: rotate(2deg);
          }
          @media (max-width: 900px) {
            .echo-ascii-centerpiece {
              font-size: clamp(9px, 2.8vw, 14px) !important;
            }
            .echo-ascii-rail-l,
            .echo-ascii-rail-r {
              font-size: clamp(9px, 2.4vw, 13px);
            }
          }
          @media (max-width: 700px) {
            .echo-ascii-block {
              font-size: clamp(8px, 2.6vw, 12px);
              color: rgba(16, 163, 127, 0.085);
            }
            .echo-ascii-block.echo-ascii-dim {
              font-size: clamp(7px, 2.2vw, 11px);
            }
            .echo-ascii-q2,
            .echo-ascii-q4 {
              opacity: 0.75;
            }
          }

          .echo-blink {
            animation: echoBlink 1s steps(1, end) infinite;
          }
          @keyframes echoBlink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
          .echo-line-enter {
            animation: echoLineIn 820ms cubic-bezier(0.22, 1, 0.36, 1);
          }
          @keyframes echoLineIn {
            0% { opacity: 0; transform: translateY(8px); filter: blur(4px); }
            100% { opacity: 1; transform: translateY(0); filter: blur(0); }
          }

          .echo-section .echo-panel {
            transition:
              border-color 280ms cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 280ms cubic-bezier(0.22, 1, 0.36, 1);
          }
          .echo-section .echo-panel:hover {
            border-color: rgba(16, 163, 127, 0.42);
            box-shadow:
              0 18px 60px rgba(0, 0, 0, 0.48),
              0 0 56px rgba(16, 163, 127, 0.14),
              0 0 96px rgba(16, 163, 127, 0.06);
          }

          .echo-section .echo-input-row {
            transition:
              border-color 220ms ease,
              box-shadow 220ms ease,
              background-color 220ms ease;
          }
          .echo-section .echo-input-row:hover {
            border-color: rgba(16, 163, 127, 0.45);
            box-shadow: 0 0 24px rgba(16, 163, 127, 0.07);
            background-color: #0e0e0e;
          }
          .echo-section .echo-input-row:focus-within {
            border-color: rgba(16, 163, 127, 0.55);
            box-shadow: 0 0 28px rgba(16, 163, 127, 0.12);
          }

          .echo-section .echo-log-row {
            margin-left: -10px;
            margin-right: -10px;
            padding: 8px 10px 10px;
            border-radius: 8px;
            transition: background-color 200ms ease;
          }
          .echo-section .echo-log-row:hover {
            background-color: rgba(255, 255, 255, 0.04);
          }
          .echo-section .echo-log-viewport .echo-log-row:last-child {
            margin-bottom: 0 !important;
          }

          .echo-section .echo-field {
            transition:
              border-color 220ms ease,
              box-shadow 220ms ease,
              background-color 220ms ease;
          }
          .echo-section .echo-field:hover {
            border-color: rgba(16, 163, 127, 0.4);
            box-shadow: 0 0 20px rgba(16, 163, 127, 0.06);
            background-color: #0e0e0e;
          }
          .echo-section .echo-field:focus {
            border-color: rgba(16, 163, 127, 0.65);
            box-shadow: 0 0 26px rgba(16, 163, 127, 0.14);
          }

          .echo-section .echo-submit {
            transition:
              border-color 240ms ease,
              box-shadow 240ms ease,
              background 240ms ease,
              color 240ms ease,
              transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
          }
          .echo-section .echo-submit:hover {
            border-color: rgba(16, 163, 127, 0.65);
            box-shadow: 0 0 28px rgba(16, 163, 127, 0.18);
            background: linear-gradient(135deg, #141f1b, #122620);
            color: #f4fffb;
            transform: translateY(-1px);
          }
          .echo-section .echo-submit:active {
            transform: translateY(0);
          }

          .echo-live-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: ${darkTheme.colors.accent};
            box-shadow: 0 0 12px rgba(16, 163, 127, 0.85);
            animation: echoLivePulse 2.2s ease-in-out infinite;
          }
          @keyframes echoLivePulse {
            0%, 100% { opacity: 0.55; transform: scale(1); box-shadow: 0 0 8px rgba(16, 163, 127, 0.35); }
            50% { opacity: 1; transform: scale(1.15); box-shadow: 0 0 16px rgba(16, 163, 127, 0.65); }
          }

          .echo-section .echo-log-viewport {
            position: relative;
            background: linear-gradient(
              180deg,
              rgba(16, 163, 127, 0.03) 0%,
              transparent 22%,
              transparent 78%,
              rgba(0, 0, 0, 0.12) 100%
            );
            scrollbar-width: thin;
            scrollbar-color: rgba(16, 163, 127, 0.42) #0a0a0a;
          }
          .echo-section .echo-log-viewport::-webkit-scrollbar {
            width: 7px;
          }
          .echo-section .echo-log-viewport::-webkit-scrollbar-track {
            background: #0a0a0a;
            border-radius: 999px;
            margin: 4px 0;
          }
          .echo-section .echo-log-viewport::-webkit-scrollbar-thumb {
            background: linear-gradient(
              180deg,
              rgba(16, 163, 127, 0.28),
              rgba(16, 163, 127, 0.52)
            );
            border-radius: 999px;
            border: 2px solid #0a0a0a;
            box-shadow: 0 0 10px rgba(16, 163, 127, 0.15);
          }
          .echo-section .echo-log-viewport::-webkit-scrollbar-thumb:hover {
            background: rgba(16, 163, 127, 0.62);
            box-shadow: 0 0 12px rgba(16, 163, 127, 0.28);
          }
          .echo-log-viewport::after {
            content: '';
            pointer-events: none;
            position: absolute;
            inset: 0;
            opacity: 0.04;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.06) 2px,
              rgba(255, 255, 255, 0.06) 3px
            );
          }

          .echo-section .echo-contact-lead {
            margin: 0 0 22px;
            padding: 16px 20px 17px;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            border-left: 3px solid rgba(16, 163, 127, 0.88);
            background: linear-gradient(
              105deg,
              rgba(16, 163, 127, 0.1) 0%,
              rgba(16, 163, 127, 0.035) 40%,
              transparent 76%
            );
            border-radius: 14px;
            box-shadow:
              inset 0 1px 0 rgba(255, 255, 255, 0.045),
              0 10px 36px rgba(0, 0, 0, 0.22);
          }
          .echo-section .echo-contact-lead p {
            margin: 0;
            font-size: clamp(13px, 1.12vw, 15px);
            line-height: 1.75;
            letter-spacing: 0.01em;
            color: rgba(236, 236, 236, 0.95);
            text-wrap: balance;
          }
          .echo-section .echo-contact-k {
            color: #10a37f;
            font-weight: 600;
            letter-spacing: 0.03em;
            font-size: 1em;
          }
          .echo-section .echo-contact-hint {
            color: rgba(172, 172, 172, 0.95);
            font-weight: 400;
            letter-spacing: 0.02em;
            text-transform: none;
            font-size: 0.98em;
          }
          .echo-section .echo-contact-outro {
            color: rgba(142, 142, 142, 0.98);
            font-weight: 400;
            letter-spacing: 0.03em;
          }

          @media (prefers-reduced-motion: reduce) {
            .echo-section .echo-submit:hover {
              transform: none;
            }
            .echo-live-dot {
              animation: none;
              opacity: 0.9;
            }
            .echo-log-viewport::after {
              display: none;
            }
          }
        `}
      </style>
      <div className="echo-ascii-bg" aria-hidden="true">
        <pre className="echo-ascii-block echo-ascii-band echo-ascii-band-t">{`═══════════════════════   // TERMINAL · ECHO · FEEDBACK   ═══════════════════════`}</pre>
        <pre className="echo-ascii-block echo-ascii-dim echo-ascii-band echo-ascii-band-t" style={{ top: '1.2%' }}>{`···················································································`}</pre>
        <pre className="echo-ascii-block echo-ascii-dim echo-ascii-band echo-ascii-band-b">{`···················································································`}</pre>
        <pre className="echo-ascii-block echo-ascii-band echo-ascii-band-b" style={{ bottom: '5.5%' }}>{`═══════════════════════   ~ stream open · channel live ~   ═══════════════════════`}</pre>

        <pre className="echo-ascii-block echo-ascii-rail echo-ascii-rail-l echo-ascii-dim">{`│
│  //
│  ||
│  ~
│  ||
│  //
│`}</pre>
        <pre className="echo-ascii-block echo-ascii-rail echo-ascii-rail-r echo-ascii-dim">{`│
│  \\\\
│  ||
│  ~
│  ||
│  \\\\
│`}</pre>

        <pre className="echo-ascii-block echo-ascii-xl echo-ascii-centerpiece">{`       ┌─────────────────────────────────────────┐
       │   // Comments & Feedback · echo stream   │
       │   > stdin open · stdout tee · live tail   │
       └─────────────────────────────────────────┘`}</pre>

        <pre className="echo-ascii-block echo-ascii-tl">{`// Comments & Feedback
> stream · live · ACK
  ┌─────────┐
  │ ONLINE  │
  └─────────┘`}</pre>
        <pre className="echo-ascii-block echo-ascii-tr">{`   ~   ~   ~   ~   ~
  .channel.multiplex.
    · · · · · · ·
      [PIPE]`}</pre>
        <pre className="echo-ascii-block echo-ascii-bl">{`+---------------------------+
| feedback.log · rotated    |
+---------------------------+
 $ tail -f ./feedback · OK`}</pre>
        <pre className="echo-ascii-block echo-ascii-br">{`   -----
  ~ EOF ~
   -----
  [ flush ]
   ······`}</pre>

        <pre className="echo-ascii-block echo-ascii-dim echo-ascii-q1">{`/* echo */
 ok = 1`}</pre>
        <pre className="echo-ascii-block echo-ascii-dim echo-ascii-q2">{`  .route.
 ~proxy~`}</pre>
        <pre className="echo-ascii-block echo-ascii-dim echo-ascii-q3">{`+---+
| ? |
+---+`}</pre>
        <pre className="echo-ascii-block echo-ascii-dim echo-ascii-q4">{` ::: ACK :::`}</pre>

        <pre className="echo-ascii-block echo-ascii-scatter-a">{`> _`}</pre>
        <pre className="echo-ascii-block echo-ascii-dim echo-ascii-scatter-b">{`··· ··· ···`}</pre>
        <pre className="echo-ascii-block echo-ascii-dim echo-ascii-scatter-c">{`~ batch ~`}</pre>
        <pre className="echo-ascii-block echo-ascii-scatter-d">{`[ hex ]`}</pre>

        <pre className="echo-ascii-block echo-ascii-dim" style={{ top: '42%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 'clamp(9px, 1.1vw, 14px)' }}>{`────── ····· ────── ····· ────── ····· ──────`}</pre>
        <pre className="echo-ascii-block echo-ascii-dim" style={{ top: '52%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 'clamp(9px, 1.1vw, 14px)' }}>{`···· ═══════════════════════════════════════ ····`}</pre>
      </div>
      <div
        className="echo-section-content"
        style={{ margin: '0 auto', width: 'min(1320px, 100%)' }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: darkTheme.colors.muted,
            marginBottom: 18
          }}
        >
          Terminal Echo
        </div>
        <h2
          style={{
            margin: 0,
            marginBottom: 40,
            fontSize: 'clamp(28px, 4.8vw, 62px)',
            fontWeight: 300,
            letterSpacing: '0.07em',
            textTransform: 'uppercase'
          }}
        >
          Comments & Feedback
        </h2>

        <div
          className="echo-panel"
          style={{
            border: `1px solid ${darkTheme.colors.border}`,
            borderRadius: 20,
            background: darkTheme.colors.panel,
            overflow: 'hidden',
            boxShadow: '0 18px 60px rgba(0,0,0,0.45)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 16px',
              borderBottom: `1px solid ${darkTheme.colors.border}`,
              flexWrap: 'wrap',
              rowGap: 8
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: darkTheme.colors.muted
              }}
            >
              feedback.log
            </span>
            <span style={{ color: darkTheme.colors.border, fontSize: 12, userSelect: 'none' }} aria-hidden="true">
              ·
            </span>
            <span className="echo-live-dot" aria-hidden="true" />
            <span
              style={{
                fontSize: 10,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: darkTheme.colors.accent,
                fontWeight: 500
              }}
            >
              live
            </span>
            <span style={{ flex: 1, minWidth: 8 }} aria-hidden="true" />
            <span
              style={{
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.08em',
                color: darkTheme.colors.muted,
                tabSize: 4
              }}
              aria-live="off"
            >
              comments · {headerClock}
            </span>
          </div>

          <div
            ref={logScrollRef}
            className="echo-log-viewport"
            style={{
              padding: '14px 16px 10px',
              boxSizing: 'border-box',
              height:
                'calc(24px + 4 * (8px + (14px * 1.45) + 10px) + 3 * 14px)',
              overflowY: 'auto'
            }}
          >
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`echo-log-row ${entry.id === recentId ? 'echo-line-enter' : ''}`}
                style={{
                  marginBottom: 14,
                  fontSize: 14,
                  lineHeight: 1.45,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
                }}
              >
                <span style={{ color: darkTheme.colors.accent }}>[{entry.ts}]</span>{' '}
                <span style={{ color: '#b8b8b8' }}>{entry.user}:</span>{' '}
                <span style={{ color: darkTheme.colors.text }}>{entry.message}</span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              borderTop: `1px solid ${darkTheme.colors.border}`,
              padding: '14px 16px 18px'
            }}
          >
            <div
              className="echo-input-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: `1px solid ${darkTheme.colors.border}`,
                borderRadius: 12,
                padding: '10px 12px',
                background: '#0b0b0b'
              }}
            >
              <span
                style={{
                  color: darkTheme.colors.accent,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
                }}
              >
                &gt;
              </span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type feedback and press Enter..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: darkTheme.colors.text,
                  fontSize: 14
                }}
              />
              <span className="echo-blink" style={{ color: darkTheme.colors.accent }}>
                |
              </span>
            </div>
          </form>
        </div>

        <div
          className="echo-panel"
          style={{
            marginTop: 'clamp(28px, 4vw, 48px)',
            border: `1px solid ${darkTheme.colors.border}`,
            borderRadius: 20,
            background: darkTheme.colors.panel,
            overflow: 'hidden',
            boxShadow: '0 18px 60px rgba(0,0,0,0.45)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 16px',
              borderBottom: `1px solid ${darkTheme.colors.border}`,
              flexWrap: 'nowrap',
              columnGap: 12
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57', flexShrink: 0 }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e', flexShrink: 0 }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840', flexShrink: 0 }} />
            <span
              style={{
                marginLeft: 2,
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: darkTheme.colors.muted,
                flexShrink: 0
              }}
            >
              contact.request
            </span>
            {contactError ? (
              <span
                role="alert"
                title={contactError}
                style={{
                  flex: '1 1 0%',
                  minWidth: 0,
                  margin: 0,
                  fontSize: 12,
                  lineHeight: 1.35,
                  letterSpacing: '0.04em',
                  color: '#e57373',
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
                  textAlign: 'right',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {contactError}
              </span>
            ) : null}
          </div>

          <form onSubmit={handleContactSubmit} style={{ padding: '22px 20px 24px' }}>
            <div className="echo-contact-lead" role="note">
              <p>
                Leave one way to reach you —{' '}
                <span className="echo-contact-k">email</span>,{' '}
                <span className="echo-contact-k">Telegram</span>
                <span className="echo-contact-hint"> (@handle or link)</span>, or{' '}
                <span className="echo-contact-k">phone</span>
                {' — '}
                <span className="echo-contact-outro">we will get back to you.</span>
              </p>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: darkTheme.colors.muted }}>
                How to reach you
              </span>
              <input
                type="text"
                name="contact"
                autoComplete="off"
                value={contactReach}
                onChange={(e) => {
                  setContactReach(e.target.value);
                  setContactError('');
                  setContactSent(false);
                }}
                placeholder="you@mail.com · @username · +380 …"
                className="echo-field"
                style={{
                  ...inputReset,
                  border: `1px solid ${darkTheme.colors.border}`,
                  borderRadius: 12,
                  padding: '11px 12px',
                  background: '#0b0b0b'
                }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: darkTheme.colors.muted }}>
                Comment (optional)
              </span>
              <textarea
                name="note"
                value={contactNote}
                onChange={(e) => {
                  setContactNote(e.target.value);
                  setContactError('');
                  setContactSent(false);
                }}
                placeholder="Brief note or preferred time to call…"
                rows={3}
                className="echo-field"
                style={{
                  ...inputReset,
                  border: `1px solid ${darkTheme.colors.border}`,
                  borderRadius: 12,
                  padding: '11px 12px',
                  background: '#0b0b0b',
                  height: 92,
                  resize: 'none',
                  overflowY: 'auto',
                  lineHeight: 1.45
                }}
              />
            </label>

            {contactSent && !contactError ? (
              <p style={{ margin: '12px 0 0', fontSize: 13, color: darkTheme.colors.accent }}>
                If your mail app did not open, email us at {CONTACT_INBOX}.
              </p>
            ) : null}

            <button
              type="submit"
              className="echo-submit"
              style={{
                marginTop: 18,
                border: `1px solid ${darkTheme.colors.border}`,
                borderRadius: 12,
                background: `linear-gradient(135deg, #1a1a1a, ${darkTheme.colors.panel})`,
                color: darkTheme.colors.text,
                padding: '12px 28px',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Submit contact
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
