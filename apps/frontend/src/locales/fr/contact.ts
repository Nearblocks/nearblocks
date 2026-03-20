export const contact = {
  disclaimer: {
    community: 'NEAR community support can be found here',
    heading: 'Drop us a message, but please be aware that:',
    item1Body:
      'We do not process transactions and are therefore unable to revert, refund, expedite, cancel or replace them.',
    item1Heading: '1. Refund Transaction',
    item2Body:
      'NearBlocks is an independent block explorer unrelated to other service providers (unless stated explicitly otherwise) and is therefore unable to provide a precise response for inquiries that are specific to other service providers.',
    item2Heading: '2. NEAR Protocol Block Explorer',
    item3Body:
      'Kindly reach out to your wallet service provider, exchanges or project/contract owner for further support as they are in a better position to assist you on the issues related to and from their platforms.',
    item3Heading: '3. Wallet / Exchange / Project related issues',
  },
  faq: {
    additionalSupport: {
      moreQuestions: {
        answer1:
          'For inquiries about partnerships and press, please contact us',
        here: 'here',
        question: 'Where can I go and ask additional questions?',
      },
      title: 'Additional Support',
    },
    features: {
      bugReport: {
        answer1: 'If you encounter a bug, please report it',
        here: 'here',
        question: 'How can I report a bug on NearBlocks?',
      },
      needAccount: {
        answer:
          'You can access most features on NearBlocks without signing in. However, some exclusive features, like commenting, require signing in with your wallet.',
        question: 'Do I need an account to use NearBlocks?',
      },
      title: 'Features & Services',
      whatCanDo: {
        answer1:
          'NearBlocks lets you easily look up transactions, check smart contracts, explore charts and stats, and the latest updates on the NEAR blockchain. Developers can also use our',
        answer2: 'services to build apps or gather blockchain data.',
        api: 'API',
        question: 'What can I do on NearBlocks?',
      },
    },
    introduction: {
      cantDo: {
        answer:
          "NearBlocks doesn't process transactions, move assets between wallets, recover lost funds, or access your private keys. We're not a wallet or exchange service, so we can't reverse transactions or retrieve lost assets.",
        question: "What NearBlocks can't do?",
      },
      offers: {
        answer:
          'NearBlocks makes it easy to access and understand blockchain data on the NEAR network. With NearBlocks, you can view transactions, review wallet histories, interact with smart contracts, and more.',
        question: 'What does NearBlocks offer?',
      },
      title: 'Introduction',
      whatIs: {
        answer:
          'NearBlocks is an easy-to-use blockchain explorer and analytics platform for the NEAR Protocol.',
        question: 'What is NearBlocks?',
      },
      whyHere: {
        answer1:
          'You were likely sent here by your wallet provider to view the details of your transaction. This page, called the',
        answer2:
          "page, serves as proof of payment or receipt, especially if you're receiving funds.",
        linkText: 'Transaction Details',
        question: 'Why am I here?',
      },
    },
    transactions: {
      chargedGas: {
        answer:
          'Even if a transaction fails, gas fees are still charged. This is because validators on the NEAR network have to process and validate the transaction, regardless of its outcome. The fee covers the computational resources used during this process.',
        question: 'Why was I charged a gas fee for a failed transaction?',
      },
      holdFunds: {
        answer:
          'No, NearBlocks does not hold or manage any funds. It is a blockchain explorer that provides detailed information about your transactions and wallet activity.',
        question: 'Does NearBlocks hold my funds?',
      },
      recoverFunds: {
        answer:
          "Once a blockchain transaction is complete, it cannot be undone. If tokens were sent to the wrong address, they cannot be recovered. Only the owner of the receiving address can refund the tokens. If you do not know who owns that address, unfortunately, you won't be able to retrieve the funds.",
        question: 'Can I recover funds sent to the wrong address?',
      },
      scammed: {
        answer:
          "We're sorry to hear you've been scammed. Unfortunately, because blockchain transactions are irreversible, we can't cancel or recover lost funds. Once a transaction is completed, it cannot be undone.",
        question: "I've been scammed. Can NearBlocks help me recover my funds?",
      },
      seeFunds: {
        answer:
          'NearBlocks shows publicly available information from the NEAR blockchain, this includes funds in your wallet, transaction history, and contract interactions. This allows you to easily track and verify your blockchain activities.',
        question: 'Why can I see my funds on NearBlocks?',
      },
      spamTokens: {
        answer1:
          'We understand that receiving spam tokens can be frustrating. Unfortunately, NearBlocks cannot remove or block these tokens due to the nature of blockchain technology. However, you can report the issue to us',
        answer2:
          ', and we will flag the tokens and addresses involved to help prevent further issues.',
        here: 'here',
        question: 'What can I do if I receive spam tokens?',
      },
      successMissing: {
        answer:
          "If your transaction is marked as successful but you don't see the tokens in your wallet, it might be because your wallet doesn't support the specific token or network. Reach out to your wallet service provider for help in resolving the issue and confirming the transaction.",
        question:
          'Why does my transaction show as successful but my tokens are missing?',
      },
      title: 'Transactions',
      unsupportedNetwork: {
        answer:
          "Unfortunately, we can't help with recovering funds sent to an unsupported network. To avoid losing assets, make sure to check which networks are supported by the recipient's platform before sending. We recommend reaching out to the support team of the recipient's exchange or wallet, as they have the expertise and resources to assist you.",
        question:
          "I sent funds to a network that my wallet doesn't support. Can you help me recover them?",
      },
    },
  },
  form: {
    captchaError: 'Please complete the captcha',
    descriptionLabel: 'Message',
    descriptionMaxLength: 'Message must be under 1500 characters',
    descriptionPlaceholder: 'Max characters (300 words)',
    descriptionRequired: 'Message is required',
    emailInvalid: 'Invalid email address',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter email...',
    emailRequired: 'Email is required',
    nameLabel: 'Name',
    namePlaceholder: 'Enter name...',
    nameRequired: 'Name is required',
    send: 'Send Message',
    sending: 'Sending...',
  },
  heading: 'Contact NearBlocks',
  meta: {
    description:
      'Contact the NearBlocks team for any enquiries related to our website and tools. Please understand that we can only assist with issues directly related to the block explorer services.',
    title: 'Contact Us',
  },
  note: 'Note:',
  noteText:
    'Selecting an incorrect subject could result in a delayed or non response. Only inquiries in english will be responded to.',
  subjectLabel: 'Subject',
  subjectPlaceholder: 'Please Select Your Message Subject',
  subjects: {
    advertising: '3. Advertising',
    apiSupport: '2. API Support',
    bug: '4. Issue / Fix / Bug',
    feature: '5. Feature Request',
    generalInquiry: '1. General Inquiry',
    tokenRequest: '6. Legacy Token Request',
  },
} as const;
