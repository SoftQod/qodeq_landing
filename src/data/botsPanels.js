export const botsPanels = [
  {
    id: '01',
    slug: 'chatbot',
    title: 'Chatbot',
    shortLabel: 'Chat',
    tagline: 'Instant AI dialogue for players and operators',
    color: '#22C55E',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Module 01',
        title: 'Qodeq: automate up to 60% of requests without operators',
        lead: 'Reduce support costs, speed up responses and provide 24/7 customer assistance.'
      },
      {
        type: 'text',
        title: 'Overview',
        body: `The Chatbot module handles high-volume player communication without queue growth. It understands intent, pulls account context, and resolves routine cases in seconds while routing edge cases to human teams with a full transcript and suggested actions.

Designed for 24/7 operations, it scales with traffic spikes during campaigns, sports events, and bonus launches without additional headcount.`
      },
      {
        type: 'stats',
        items: [
          { label: 'Avg. first response', value: '< 3 sec' },
          { label: 'Languages', value: '40+' },
          { label: 'Deflection rate', value: 'up to 68%' },
          { label: 'Channels', value: 'Web · App · TG' }
        ]
      },
      {
        type: 'list',
        title: 'Core capabilities',
        items: [
          'Natural language understanding tuned for betting & casino vocabulary',
          'Account lookup: balance, bonus status, verification, limits',
          'Guided flows for deposits, withdrawals, and KYC reminders',
          'Automatic escalation with priority tags and operator notes',
          'Sentiment detection and VIP routing rules',
          'Canned responses editable per brand / jurisdiction'
        ]
      },
      {
        type: 'grid',
        title: 'Use cases',
        cards: [
          { title: 'Player support', text: 'FAQ, how-to, and policy answers without wait time.' },
          { title: 'Retention', text: 'Proactive outreach on inactive accounts and bonus eligibility.' },
          { title: 'Compliance', text: 'Responsible gaming prompts and self-exclusion guidance.' },
          { title: 'Ops assist', text: 'Internal copilot for support agents with draft replies.' }
        ]
      },
      {
        type: 'steps',
        title: 'How it works',
        steps: [
          { title: 'Ingest', text: 'Connect CRM, payment, and game APIs for live context.' },
          { title: 'Understand', text: 'Classify intent and extract entities from user messages.' },
          { title: 'Resolve', text: 'Execute automated actions or propose agent takeover.' },
          { title: 'Learn', text: 'Analytics loop improves answers from resolved tickets.' }
        ]
      },
      {
        type: 'list',
        title: 'Integrations',
        items: [
          'Telegram, WhatsApp, Viber, custom web widget',
          'Zendesk, Intercom, Freshdesk bridges',
          'REST / webhooks for custom back-office',
          'SSO for operator dashboard'
        ]
      }
    ]
  },
  {
    id: '02',
    slug: 'call-center-bot',
    title: 'Call Center Bot',
    shortLabel: 'Call',
    tagline: 'Voice AI for inbound and outbound call centers',
    color: '#3B82F6',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Module 02',
        title: 'Call Center Bot',
        lead: 'Intelligent phone call processing with speech recognition, synthesis, and real-time routing for iGaming contact centers.'
      },
      {
        type: 'text',
        title: 'Overview',
        body: `Call Center Bot answers and places calls with human-like voice, understands accents and domain terms, and completes standard requests end-to-end. Operators receive warm transfers with summary and recommended next steps.

The system reduces average handle time and smooths peak load during verification waves or payment incidents.`
      },
      {
        type: 'stats',
        items: [
          { label: 'ASR accuracy', value: '95%+' },
          { label: 'Concurrent calls', value: '1 000+' },
          { label: 'AHT reduction', value: '−22%' },
          { label: 'Outbound', value: 'Yes' }
        ]
      },
      {
        type: 'list',
        title: 'Core capabilities',
        items: [
          'Multi-language speech recognition and TTS',
          'IVR replacement with conversational trees',
          'Queue management and skill-based routing',
          'Call recording, transcription, and QA scoring',
          'Outbound campaigns with compliance windows',
          'Real-time supervisor dashboard and barging'
        ]
      },
      {
        type: 'grid',
        title: 'Use cases',
        cards: [
          { title: 'Inbound support', text: 'Balance, bonus, and account status by voice.' },
          { title: 'Verification', text: 'KYC reminders and document follow-ups.' },
          { title: 'Collections', text: 'Payment reminders within regulatory limits.' },
          { title: 'Surveys', text: 'NPS and satisfaction calls after key events.' }
        ]
      },
      {
        type: 'steps',
        title: 'Call flow',
        steps: [
          { title: 'Answer', text: 'Pick up with brand voice and language detection.' },
          { title: 'Authenticate', text: 'Secure player verification via PIN / OTP.' },
          { title: 'Act', text: 'API actions or scripted resolutions.' },
          { title: 'Transfer', text: 'Hand off to human with context package.' }
        ]
      },
      {
        type: 'list',
        title: 'Telephony integrations',
        items: [
          'SIP trunks and major CCaaS platforms',
          'Asterisk, FreeSWITCH, Twilio-compatible stacks',
          'CRM screen-pop on transfer',
          'Compliance: call time windows, DNC lists'
        ]
      }
    ]
  },
  {
    id: '03',
    slug: 'payment-bot',
    title: 'Payment Bot',
    shortLabel: 'Pay',
    tagline: 'Automated payment operations and player finance support',
    color: '#EF4444',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Module 03',
        title: 'Payment Bot',
        lead: 'Automated processing of payment requests, status checks, and secure finance-related support for iGaming platforms.'
      },
      {
        type: 'text',
        title: 'Overview',
        body: `Payment Bot connects to PSPs and internal ledger systems to verify transaction status, explain delays, and guide players through deposit and withdrawal flows. It enforces security checks and flags anomalies before funds move.

Finance and risk teams get unified logs and rule-based alerts across all payment touchpoints.`
      },
      {
        type: 'stats',
        items: [
          { label: 'PSP connectors', value: '80+' },
          { label: 'Status checks / min', value: '10k+' },
          { label: 'Fraud signals', value: 'Real-time' },
          { label: 'PCI scope', value: 'Reduced' }
        ]
      },
      {
        type: 'list',
        title: 'Core capabilities',
        items: [
          'Deposit & withdrawal status in natural language',
          'Method recommendation by country and limits',
          'KYC / AML hold explanations and next steps',
          'Chargeback and dispute intake templates',
          'Reconciliation mismatch detection',
          'Operator approval workflows for high-risk actions'
        ]
      },
      {
        type: 'grid',
        title: 'Use cases',
        cards: [
          { title: 'Player queries', text: '"Where is my withdrawal?" with live PSP poll.' },
          { title: 'Ops automation', text: 'Bulk status refresh during incidents.' },
          { title: 'Risk', text: 'Velocity checks and duplicate account signals.' },
          { title: 'Reporting', text: 'Daily settlement summaries per method.' }
        ]
      },
      {
        type: 'steps',
        title: 'Transaction journey',
        steps: [
          { title: 'Request', text: 'Player asks about a specific TX or method.' },
          { title: 'Verify', text: 'Match user, amount, and PSP reference.' },
          { title: 'Explain', text: 'Return status, ETA, or required action.' },
          { title: 'Escalate', text: 'Open finance ticket if manual review needed.' }
        ]
      },
      {
        type: 'list',
        title: 'Security & compliance',
        items: [
          'No storage of full card data — tokenized references only',
          'Audit trail for every automated action',
          'Role-based access for finance operators',
          'GDPR-ready data retention policies'
        ]
      }
    ]
  },
  {
    id: '04',
    slug: 'qa-bot',
    title: 'QA Bot',
    shortLabel: 'QA',
    tagline: 'AI quality control for every conversation',
    color: '#FACC15',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Module 04',
        title: 'QA Bot',
        lead: 'Service quality control based on AI analysis of chats, calls, and emails — scoring, coaching, and compliance in one layer.'
      },
      {
        type: 'text',
        title: 'Overview',
        body: `QA Bot reviews 100% of interactions instead of random samples. It scores adherence to scripts, tone, resolution quality, and regulatory phrases, then surfaces coaching opportunities and systemic issues.

Managers get dashboards by team, channel, and topic cluster without manual listening marathons.`
      },
      {
        type: 'stats',
        items: [
          { label: 'Coverage', value: '100%' },
          { label: 'Score dimensions', value: '24+' },
          { label: 'Review time saved', value: '−70%' },
          { label: 'Languages', value: 'Multi' }
        ]
      },
      {
        type: 'list',
        title: 'Core capabilities',
        items: [
          'Automatic dialogue and call transcription analysis',
          'Custom scorecards per brand and jurisdiction',
          'Compliance keyword and forbidden phrase detection',
          'Agent ranking and trend reports',
          'Root-cause clustering on complaints',
          'Export to BI and workforce management tools'
        ]
      },
      {
        type: 'grid',
        title: 'Use cases',
        cards: [
          { title: 'QA automation', text: 'Replace manual sampling with full coverage.' },
          { title: 'Coaching', text: 'Clip library of best and worst examples.' },
          { title: 'Compliance', text: 'RG and AML phrase monitoring.' },
          { title: 'Product insight', text: 'Topic trends from unresolved dialogs.' }
        ]
      },
      {
        type: 'steps',
        title: 'Analysis pipeline',
        steps: [
          { title: 'Collect', text: 'Ingest chats, calls, emails from connected sources.' },
          { title: 'Score', text: 'Apply ML models and rule-based checks.' },
          { title: 'Report', text: 'Dashboards and agent-level breakdowns.' },
          { title: 'Improve', text: 'Trigger training tasks and script updates.' }
        ]
      },
      {
        type: 'list',
        title: 'Outputs',
        items: [
          'PDF / CSV audit packs for regulators',
          'Slack alerts on critical violations',
          'API for custom analytics warehouses',
          'Weekly executive summary emails'
        ]
      }
    ]
  }
];

export const getBotBySlug = (slug) => botsPanels.find((b) => b.slug === slug);

export const getBotIndexBySlug = (slug) => botsPanels.findIndex((b) => b.slug === slug);

export const parseBotSlugFromHash = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.location.hash.replace('#', '').replace(/^bot-/, '');
  return getBotBySlug(raw) ? raw : null;
};
