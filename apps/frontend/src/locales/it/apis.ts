export const apis = {
  dashboard: 'User Dashboard',
  description:
    "Data from the leading NEAR Protocol Block Explorer catered to your project's needs.",
  docs: 'API Documentation',
  enterprise: {
    cta: 'Contact Us',
    description:
      'Greater rate limit with SLA support. Suitable for Enterprise user that uses large scale of Nearblocks data.',
    heading: 'Dedicated Plan',
    label: 'Enterprise',
  },
  faq: {
    activation: {
      answer:
        'API Account activations are instant once the plan payment is made. To setup an API key after the subscription payment is made, head to API keys.',
      question: 'When will Account Activation occur?',
    },
    heading: 'Frequently Asked Questions',
    payment: {
      answer: 'We accept VISA and Mastercard credit card payments, via Stripe.',
      question: 'What are the Payment Options available?',
    },
    refund: {
      answer:
        'Payments made are non-refundable and we do not provide refunds or credits for any services already paid for.',
      question: 'What is your refund policy?',
    },
    renewal: {
      answer:
        'Renewals are automatic, you will receive an email notification coming up to your renewal date.',
      question: 'How does Renewal work?',
    },
    subscribe: {
      answer: 'Kindly visit the API self-checkout section above',
      question: 'How do I Subscribe to NearBlocks API services?',
    },
    upgrade: {
      answer:
        'API Account upgrades and cancellations can be done through your API user dashboard. Head to the "Current Plan" section in your dashboard for more details.',
      question: 'How do I Upgrade or Cancel an account?',
    },
  },
  footer: {
    cta: 'View API Documentation',
    description: 'Detailed documentation to get started.',
  },
  heading: 'Build Precise & Reliable Apps with NearBlocks APIs',
  label: 'NEARBLOCKS API',
  meta: {
    description:
      "NearBlocks APIs derives data from NearBlock's NEAR Protocol Block Explorer to cater for NEAR Protocol applications through API Endpoints.",
    title: 'API & Documentation',
  },
  pricing: {
    annually: 'Annually',
    attribution: '* Attribution required',
    billed: 'when billed yearly',
    callsPerDay: 'Up to {{count}} API calls a day',
    callsPerMinute: '{{count}} calls/minute limit',
    callsPerMonth: 'Up to {{count}} API calls a month',
    commercialUse: 'Commercial Use',
    cta: 'Get started now',
    heading: 'Ready to get started?',
    mo: '/mo',
    monthly: 'Monthly',
    mostUsed: 'Most used!',
    off: '(15% off)',
    or: 'Or',
    personalUse: 'Personal Use',
    save: '(Save 15%)',
    subheading: "Choose a plan that's right for you.",
  },
} as const;
