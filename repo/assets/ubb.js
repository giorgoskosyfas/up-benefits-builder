/*!
 * Up Benefits Builder v1.0 (concept prototype for the Up Hellas assessment)
 * Zero-dependency, framework-free web app. Mounts into #ubb-root.
 *
 * Config (optional) — set before this script loads:
 *   window.UBB_CONFIG = {
 *     summaryEndpoint: 'https://<n8n>/webhook/ubb-summary',  // AI summary (server-side key)
 *     leadEndpoint:    'https://<n8n>/webhook/ubb-lead',     // lead routing
 *     demoUrl:         'https://uphellas.gr/epikoinonia'
 *   }
 * Without endpoints the app runs in demo mode: deterministic summary, lead logged to console.
 */
(function () {
  'use strict';

  var CFG = Object.assign({
    summaryEndpoint: '',
    leadEndpoint: '',
    demoUrl: { el: 'https://uphellas.gr/epikoinonia', en: 'https://uphellas.gr/en/contact' },
    timeoutMs: 9000
  }, window.UBB_CONFIG || {});

  /* =====================================================================
   * 1. PRODUCT CATALOGUE — the single source of truth.
   *    Written from the public product pages on uphellas.gr (Nov 2026).
   *    Deliberately contains NO prices and NO tax figures.
   * ===================================================================== */
  var CATALOG = {
    flexone: {
      name: 'FlexOne', art: { el: 'το', en: '' }, color: '#9f51ae',
      url: { el: 'https://uphellas.gr/proionta/flexone', en: 'https://uphellas.gr/en/products/flexone' },
      tagline: {
        el: 'Όλες οι εταιρικές παροχές σε μία κάρτα, ένα portal και ένα app.',
        en: 'All your company benefits on one card, one portal and one app.'
      },
      plans: {
        flexplus: { name: 'FlexPlus', el: 'σίτιση, επιβράβευση και ΜΜΜ', en: 'meals, rewards and public transport' },
        flexmax: { name: 'FlexMax', el: 'όλες οι κατηγορίες παροχών, από σίτιση μέχρι ευεξία και WFH', en: 'every benefit category, from meals to wellness and WFH' }
      },
      reasons: {
        base: {
          el: 'Συγκεντρώνει πολλές παροχές σε μία κάρτα, ένα portal και ένα app, άρα λιγότερη διαχείριση για το HR.',
          en: 'Brings many benefits together on one card, one portal and one app, so HR has less to manage.'
        },
        tax: {
          el: 'Αξιοποιεί το ισχύον φορολογικό πλαίσιο για παροχές όπως σίτιση, επιβράβευση και ΜΜΜ, ώστε να φτάνει περισσότερη αξία στην ομάδα σου.',
          en: 'Makes use of the current tax framework for benefits such as meals, rewards and public transport, so more value reaches your team.'
        },
        retention: {
          el: 'Κάθε εργαζόμενος βλέπει τις παροχές του στο app: μια καθημερινή, ορατή απόδειξη ότι η εταιρεία νοιάζεται.',
          en: 'Every employee sees their benefits in the app: a daily, visible reminder that the company cares.'
        },
        remote: {
          el: 'Ψηφιακές κάρτες και κατηγορίες όπως WFH και ΜΜΜ ταιριάζουν σε hybrid και remote ομάδες.',
          en: 'Digital cards and categories such as WFH and public transport suit hybrid and remote teams.'
        },
        upgrade_meal: {
          el: 'Δίνεις ήδη παροχή σίτισης; Το FlexOne την κρατά και προσθέτει όποιες κατηγορίες θέλεις, χωρίς νέο πάροχο.',
          en: 'Already offer a meal benefit? FlexOne keeps it and adds any categories you want, with no new provider.'
        }
      }
    },
    cheque: {
      name: 'Chèque Déjeuner', art: { el: 'το', en: '' }, color: '#ff8500',
      url: { el: 'https://uphellas.gr/proionta/cheque-dejeuner', en: 'https://uphellas.gr/en/products/cheque-dejeuner' },
      tagline: {
        el: 'Οι κλασικές διατακτικές σίτισης, με ψηφιακή διαχείριση.',
        en: 'Classic meal vouchers, managed digitally.'
      },
      reasons: {
        frontline: {
          el: 'Ιδανικό για ομάδες πρώτης γραμμής: χρησιμοποιείται στο ταμείο χωρίς app, PIN ή smartphone.',
          en: 'Ideal for frontline teams: used at the till with no app, PIN or smartphone.'
        },
        tax: {
          el: 'Αφορολόγητη παροχή σίτισης, εντός των ορίων που προβλέπει η νομοθεσία.',
          en: 'A tax-free meal benefit, within the limits set by law.'
        },
        brand: {
          el: 'Εξατομικεύεται με το όνομα και το logo της εταιρείας σου.',
          en: 'Can be personalised with your company name and logo.'
        }
      }
    },
    fitpass: {
      name: 'Fitpass', art: { el: 'το', en: '' }, color: '#e6441f',
      url: { el: 'https://uphellas.gr/proionta/fitpass', en: 'https://uphellas.gr/en/products/fitpass' },
      tagline: {
        el: 'Το εταιρικό πάσο ευεξίας για γυμναστήρια, studios και χώρους ευεξίας.',
        en: 'The corporate wellness pass for gyms, studios and wellness spaces.'
      },
      reasons: {
        wellbeing: {
          el: 'Μία συνδρομή για γυμναστήρια, yoga, pilates, κολυμβητήρια και χώρους ευεξίας σε όλη την Ελλάδα.',
          en: 'One membership for gyms, yoga, pilates, pools and wellness spaces across Greece.'
        },
        holistic: {
          el: 'Περιλαμβάνει γραμμή ψυχολογικής υποστήριξης και online training, άρα ευεξία και για όσους δουλεύουν από το σπίτι.',
          en: 'Includes a mental-health support line and online training, so it works for people at home too.'
        },
        retention: {
          el: 'Ένα μοντέρνο benefit που ξεχωρίζει στο employer branding και βοηθά στην προσέλκυση ταλέντων.',
          en: 'A modern benefit that stands out in employer branding and helps attract talent.'
        },
        upgrade: {
          el: 'Έχεις ήδη wellness παροχή; Με το Fitpass η ομάδα διαλέγει διαφορετική δραστηριότητα κάθε μέρα.',
          en: 'Already offer wellness? With Fitpass people can pick a different activity every day.'
        }
      }
    },
    gift: {
      name: 'Up Gift', art: { el: 'η', en: '' }, color: '#5e7a78',
      url: { el: 'https://uphellas.gr/proionta/up-gift', en: 'https://uphellas.gr/en/products/up-gift' },
      tagline: {
        el: 'Η κάρτα δώρου για επιβράβευση και αναγνώριση.',
        en: 'The gift card for rewards and recognition.'
      },
      reasons: {
        recognition: {
          el: 'Επιβράβευση σε λίγα λεπτά για επετείους, στόχους ή γιορτές, με παραγγελία και φόρτιση online.',
          en: 'Reward people in minutes for milestones, targets or holidays, with online ordering and top-ups.'
        },
        freedom: {
          el: 'Ο εργαζόμενος διαλέγει μόνος του τι θα αγοράσει, σε φυσικά και online καταστήματα.',
          en: 'Employees choose what to buy themselves, in physical and online stores.'
        },
        tax: {
          el: 'Παροχή σε είδος με φορολογικά οφέλη, εντός των νόμιμων ορίων.',
          en: 'A benefit in kind with tax advantages, within legal limits.'
        }
      }
    },
    expense: {
      name: 'Up Expense', art: { el: 'η', en: '' }, color: '#0772f8',
      url: { el: 'https://uphellas.gr/proionta/up-expense', en: 'https://uphellas.gr/en/products/up-expense' },
      tagline: {
        el: 'Έξυπνη διαχείριση εταιρικών εξόδων με κάρτες και app.',
        en: 'Smart company expense management with cards and an app.'
      },
      plans: {
        fuelplus: { name: 'Fuel Plus', el: 'καύσιμα, διόδια, parking και πλύσιμο', en: 'fuel, tolls, parking and car wash' },
        expense: { name: 'Expense', el: 'συγκεκριμένες κατηγορίες όπως ταξίδια και διαμονή', en: 'specific categories such as travel and accommodation' },
        expenseplus: { name: 'Expense Plus', el: 'δικά σου πλάνα εξόδων, σε Ελλάδα και εξωτερικό', en: 'your own expense plans, in Greece and abroad' }
      },
      reasons: {
        control: {
          el: 'Όρια ανά τμήμα ή εργαζόμενο και παρακολούθηση κάθε συναλλαγής σε πραγματικό χρόνο.',
          en: 'Limits per department or employee, with every transaction tracked in real time.'
        },
        receipts: {
          el: 'Οι αποδείξεις σκανάρονται στο app. Τέλος στα εξοδολόγια και στις χαμένες αποδείξεις.',
          en: 'Receipts are scanned in the app. No more expense reports or lost receipts.'
        },
        field: {
          el: 'Οι ομάδες στον δρόμο πληρώνουν με εταιρική κάρτα, χωρίς να βάζουν δικά τους χρήματα.',
          en: 'Teams on the road pay with a company card, not their own money.'
        },
        fuel: {
          el: 'Ειδικά πλάνα για καύσιμα και έξοδα οχήματος όπως διόδια και parking.',
          en: 'Dedicated plans for fuel and vehicle costs such as tolls and parking.'
        }
      }
    }
  };

  /* =====================================================================
   * 2. QUESTIONNAIRE (7 steps)
   * ===================================================================== */
  var STEPS = [
    { id: 'size', type: 'single', options: ['1-9', '10-49', '50-249', '250-999', '1000+'] },
    { id: 'industry', type: 'single', options: ['retail_hospitality', 'tech', 'services_finance', 'manufacturing_logistics', 'health', 'public_education', 'other'] },
    { id: 'work_model', type: 'single', options: ['office', 'hybrid', 'remote', 'field'] },
    { id: 'goals', type: 'multi', min: 1, max: 2, options: ['retention', 'wellbeing', 'tax', 'expenses', 'recognition'] },
    { id: 'current', type: 'multi', min: 1, exclusive: 'none', options: ['meal', 'gift', 'wellness', 'expense_cards', 'health_insurance', 'none'] },
    { id: 'spend', type: 'multi', min: 1, exclusive: 'no', options: ['fuel', 'travel', 'purchases', 'no'] },
    { id: 'budget', type: 'single', options: ['lt50', '50_100', '100_200', 'gt200', 'unsure'] }
  ];

  /* =====================================================================
   * 3. COPY (Greek + English)
   * ===================================================================== */
  var T = {
    el: {
      eyebrow: 'Up Benefits Builder',
      stepOf: 'Βήμα {n} από {t}',
      back: 'Πίσω', next: 'Συνέχεια', finish: 'Δες το πακέτο σου',
      errSingle: 'Διάλεξε μία επιλογή για να συνεχίσεις.',
      errMulti: 'Διάλεξε τουλάχιστον μία επιλογή.',
      errMax: 'Έως {max} επιλογές. Κράτα τις πιο σημαντικές.',
      q: {
        size: { t: 'Πόσους ανθρώπους έχει η ομάδα σου;', h: 'Συνολικός αριθμός εργαζομένων.' },
        industry: { t: 'Σε ποιον κλάδο δραστηριοποιείστε;', h: 'Διάλεξε τον πιο κοντινό.' },
        work_model: { t: 'Πώς δουλεύει κυρίως η ομάδα σου;', h: 'Το μοντέλο που ισχύει για τους περισσότερους.' },
        goals: { t: 'Τι θέλεις να πετύχεις με τις παροχές;', h: 'Διάλεξε έως 2 στόχους.' },
        current: { t: 'Τι προσφέρεις ήδη στους ανθρώπους σου;', h: 'Διάλεξε όσα ισχύουν.' },
        spend: { t: 'Ξοδεύουν οι εργαζόμενοι εταιρικά χρήματα;', h: 'Π.χ. σε καύσιμα, ταξίδια ή αγορές. Διάλεξε όσα ισχύουν.' },
        budget: { t: 'Τι budget σκέφτεσαι ανά εργαζόμενο τον μήνα;', h: 'Μια χοντρική εκτίμηση αρκεί. Δεν δεσμεύει σε τίποτα.' }
      },
      o: {
        '1-9': ['1–9', 'Μικρή ομάδα'], '10-49': ['10–49', 'Μικρή επιχείρηση'], '50-249': ['50–249', 'Μεσαία επιχείρηση'],
        '250-999': ['250–999', 'Μεγάλη επιχείρηση'], '1000+': ['1.000+', 'Enterprise'],
        retail_hospitality: ['Λιανεμπόριο & φιλοξενία'], tech: ['Τεχνολογία & τηλεπικοινωνίες'],
        services_finance: ['Επαγγελματικές & χρηματοοικονομικές υπηρεσίες'], manufacturing_logistics: ['Βιομηχανία & logistics'],
        health: ['Υγεία & φάρμακο'], public_education: ['Δημόσιος τομέας & εκπαίδευση'], other: ['Άλλος κλάδος'],
        office: ['Στο γραφείο', 'Κάθε μέρα on site'], hybrid: ['Hybrid', 'Λίγο γραφείο, λίγο σπίτι'],
        remote: ['Remote', 'Από οπουδήποτε'], field: ['Στον δρόμο', 'Πωλήσεις, τεχνικοί, διανομές'],
        retention: ['Να κρατήσω και να προσελκύσω ταλέντα'], wellbeing: ['Ευεξία και work-life balance'],
        tax: ['Περισσότερο καθαρό όφελος, με φορολογική αποδοτικότητα'], expenses: ['Απλούστερη διαχείριση εταιρικών εξόδων'],
        recognition: ['Επιβράβευση και αναγνώριση'],
        meal: ['Κάρτα ή κουπόνια σίτισης'], gift: ['Δωροκάρτες ή δώρα'], wellness: ['Γυμναστήριο ή wellness'],
        expense_cards: ['Κάρτες καυσίμων ή εξόδων'], health_insurance: ['Ιδιωτική ασφάλιση υγείας'], none: ['Τίποτα ακόμα'],
        fuel: ['Καύσιμα και έξοδα οχήματος'], travel: ['Ταξίδια και διαμονή'], purchases: ['Αγορές γραφείου, marketing κ.ά.'],
        no: ['Όχι, σχεδόν ποτέ'],
        lt50: ['Έως 50€'], '50_100': ['50–100€'], '100_200': ['100–200€'], gt200: ['Πάνω από 200€'], unsure: ['Δεν έχω αποφασίσει ακόμα']
      },
      readyTitle: 'Το πακέτο σου είναι έτοιμο!',
      readyText: 'Με βάση τις απαντήσεις σου, αυτός είναι ο συνδυασμός που ταιριάζει στην ομάδα σου.',
      match: 'ταίριασμα',
      gateTitle: 'Ξεκλείδωσε ολόκληρο το πακέτο',
      gateText: 'Γιατί ταιριάζει κάθε λύση, ποιο πλάνο να διαλέξεις, μια προσωποποιημένη σύνοψη και μια κάρτα για να το μοιραστείς με την ομάδα σου.',
      fName: 'Ονοματεπώνυμο', fEmail: 'Εταιρικό email', fCompany: 'Εταιρεία', fPhone: 'Τηλέφωνο', optional: 'προαιρετικό',
      fConsent: 'Συμφωνώ να επικοινωνήσει μαζί μου η Up Hellas για αυτή την πρόταση, σύμφωνα με την <a href="https://uphellas.gr/politiki-aporritou" target="_blank" rel="noopener">Πολιτική Απορρήτου</a>.',
      submit: 'Ξεκλείδωσε το πακέτο μου', sending: 'Μια στιγμή…',
      privacy: 'Χωρίς spam. Τα στοιχεία σου πηγαίνουν μόνο στον σύμβουλο που θα σε βοηθήσει.',
      freeHint: 'Με εταιρικό email σε εξυπηρετούμε πιο γρήγορα.',
      eName: 'Συμπλήρωσε το ονοματεπώνυμό σου.', eEmail: 'Χρειαζόμαστε ένα έγκυρο email.', eCompany: 'Συμπλήρωσε την εταιρεία σου.',
      ePhone: 'Έλεγξε τον αριθμό (π.χ. 69XXXXXXXX).', eConsent: 'Χρειαζόμαστε τη συγκατάθεσή σου για να επικοινωνήσουμε μαζί σου.',
      resTitle: 'Το Up πακέτο σου', resTitleCo: 'Το Up πακέτο για την {company}',
      summaryLabel: 'Η σύνοψή σου', aiBadge: 'AI',
      aiNote: 'Γραμμένη από AI αποκλειστικά με βάση τον κατάλογο λύσεων της Up, χωρίς τιμές ή φορολογικά νούμερα.',
      fbNote: 'Σύνοψη βασισμένη στις απαντήσεις σου.',
      roleCore: 'Βασική λύση', roleAddon: 'Συμπλήρωμα', roleAlt: 'Εναλλακτική για ομάδες πρώτης γραμμής', roleSpend: 'Για τα εταιρικά έξοδα',
      plan: 'Προτεινόμενο πλάνο', learn: 'Μάθε περισσότερα',
      ctaTitle: 'Επόμενο βήμα: δες το πακέτο σου στην πράξη',
      ctaText: 'Ένας σύμβουλος της Up Hellas θα σου δείξει πώς στήνεται, ποιο πλάνο ταιριάζει και τι όφελος αφήνει στην ομάδα σου.',
      ctaBtn: 'Κλείσε ένα δωρεάν demo',
      shareTitle: 'Μοιράσου το με την ομάδα σου',
      shareText: 'Στείλε το στο HR ή στο λογιστήριο για να το δείτε μαζί.',
      share: 'Κοινοποίηση', copy: 'Αντιγραφή συνδέσμου', copied: 'Αντιγράφηκε!', download: 'Λήψη κάρτας',
      restart: 'Ξεκίνα από την αρχή',
      disclaimer: 'Ενδεικτική πρόταση με βάση τις απαντήσεις σου. Πλάνα, τιμές και φορολογικά οφέλη επιβεβαιώνονται από τον σύμβουλό σου.',
      sharedBanner: 'Κάποιος μοιράστηκε μαζί σου αυτό το πακέτο. Ξεκλείδωσέ το ή <button type="button" class="ubb-link" data-act="restart">φτιάξε το δικό σου</button>.',
      cardTag: 'Το Up πακέτο μου', cardFoot: 'Φτιάξε το δικό σου σε 2 λεπτά',
      shareMsg: 'Δες το πακέτο παροχών που ταιριάζει στην ομάδα μας:',
      and: ' και ',
      demoMode: 'Demo mode: η φόρμα δεν στέλνει δεδομένα.'
    },
    en: {
      eyebrow: 'Up Benefits Builder',
      stepOf: 'Step {n} of {t}',
      back: 'Back', next: 'Continue', finish: 'See your package',
      errSingle: 'Pick one option to continue.',
      errMulti: 'Pick at least one option.',
      errMax: 'Up to {max} choices. Keep the most important ones.',
      q: {
        size: { t: 'How many people are on your team?', h: 'Total number of employees.' },
        industry: { t: 'Which industry are you in?', h: 'Pick the closest match.' },
        work_model: { t: 'How does your team mostly work?', h: 'The model that applies to most people.' },
        goals: { t: 'What do you want your benefits to achieve?', h: 'Pick up to 2 goals.' },
        current: { t: 'What do you already offer your people?', h: 'Pick all that apply.' },
        spend: { t: 'Do employees spend company money?', h: 'For example on fuel, travel or purchases. Pick all that apply.' },
        budget: { t: 'What monthly budget per employee do you have in mind?', h: 'A rough estimate is fine. No commitment.' }
      },
      o: {
        '1-9': ['1–9', 'Small team'], '10-49': ['10–49', 'Small business'], '50-249': ['50–249', 'Mid-size company'],
        '250-999': ['250–999', 'Large company'], '1000+': ['1,000+', 'Enterprise'],
        retail_hospitality: ['Retail & hospitality'], tech: ['Tech & telecoms'],
        services_finance: ['Professional & financial services'], manufacturing_logistics: ['Manufacturing & logistics'],
        health: ['Healthcare & pharma'], public_education: ['Public sector & education'], other: ['Other'],
        office: ['In the office', 'On site every day'], hybrid: ['Hybrid', 'Part office, part home'],
        remote: ['Remote', 'From anywhere'], field: ['On the road', 'Sales, technicians, delivery'],
        retention: ['Keep and attract talent'], wellbeing: ['Wellbeing and work-life balance'],
        tax: ['More net value through tax efficiency'], expenses: ['Simpler company expense management'],
        recognition: ['Rewards and recognition'],
        meal: ['Meal card or vouchers'], gift: ['Gift cards or gifts'], wellness: ['Gym or wellness'],
        expense_cards: ['Fuel or expense cards'], health_insurance: ['Private health insurance'], none: ['Nothing yet'],
        fuel: ['Fuel and vehicle costs'], travel: ['Travel and accommodation'], purchases: ['Office, marketing and other purchases'],
        no: ['No, hardly ever'],
        lt50: ['Up to €50'], '50_100': ['€50–100'], '100_200': ['€100–200'], gt200: ['Over €200'], unsure: ['Not decided yet']
      },
      readyTitle: 'Your package is ready!',
      readyText: 'Based on your answers, this is the mix that fits your team.',
      match: 'match',
      gateTitle: 'Unlock your full package',
      gateText: 'Why each solution fits, which plan to choose, a personalised summary and a card to share with your team.',
      fName: 'Full name', fEmail: 'Work email', fCompany: 'Company', fPhone: 'Phone', optional: 'optional',
      fConsent: 'I agree that Up Hellas may contact me about this recommendation, in line with the <a href="https://uphellas.gr/en/politiki-aporritou" target="_blank" rel="noopener">Privacy Policy</a>.',
      submit: 'Unlock my package', sending: 'One moment…',
      privacy: 'No spam. Your details only go to the advisor who will help you.',
      freeHint: 'Use your work email and we can reply faster.',
      eName: 'Please enter your full name.', eEmail: 'Please enter a valid email.', eCompany: 'Please enter your company.',
      ePhone: 'Please check the number (e.g. +30 69XXXXXXXX).', eConsent: 'We need your consent to contact you.',
      resTitle: 'Your Up package', resTitleCo: 'The Up package for {company}',
      summaryLabel: 'Your summary', aiBadge: 'AI',
      aiNote: 'Written by AI only from the Up solutions catalogue, with no prices or tax figures.',
      fbNote: 'Summary based on your answers.',
      roleCore: 'Core solution', roleAddon: 'Add-on', roleAlt: 'Alternative for frontline teams', roleSpend: 'For company spending',
      plan: 'Suggested plan', learn: 'Learn more',
      ctaTitle: 'Next step: see your package in action',
      ctaText: 'An Up Hellas advisor will show you how it is set up, which plan fits and what it leaves in your team’s pocket.',
      ctaBtn: 'Book a free demo',
      shareTitle: 'Share it with your team',
      shareText: 'Send it to HR or finance and review it together.',
      share: 'Share', copy: 'Copy link', copied: 'Copied!', download: 'Download card',
      restart: 'Start over',
      disclaimer: 'Indicative recommendation based on your answers. Plans, pricing and tax benefits are confirmed by your advisor.',
      sharedBanner: 'Someone shared this package with you. Unlock it or <button type="button" class="ubb-link" data-act="restart">build your own</button>.',
      cardTag: 'My Up package', cardFoot: 'Build yours in 2 minutes',
      shareMsg: 'Here is the benefits package that fits our team:',
      and: ' and ',
      demoMode: 'Demo mode: the form does not send any data.'
    }
  };

  /* =====================================================================
   * 4. RULES ENGINE — deterministic, explainable, testable.
   * ===================================================================== */
  var SIZE_ORDER = ['1-9', '10-49', '50-249', '250-999', '1000+'];
  var MAX_BENEFITS = { lt50: 2, '50_100': 3, '100_200': 4, gt200: 4, unsure: 3 };
  var THRESHOLD = 40;

  function recommend(a) {
    var g = toSet(a.goals), cur = toSet(a.current), sp = toSet(a.spend);
    var s = { flexone: 0, cheque: 0, fitpass: 0, gift: 0, expense: 0 };
    var r = { flexone: [], cheque: [], fitpass: [], gift: [], expense: [] };
    var dispersed = a.work_model === 'hybrid' || a.work_model === 'remote';
    var frontline = a.industry === 'retail_hospitality' || a.industry === 'manufacturing_logistics';
    var spends = sp.fuel || sp.travel || sp.purchases;

    // FlexOne: the all-in-one core for most teams
    s.flexone = 35; r.flexone.push('base');
    if (g.tax) { s.flexone += 30; r.flexone.push('tax'); }
    if (g.retention) { s.flexone += 20; r.flexone.push('retention'); }
    if (cur.meal) { s.flexone += 15; r.flexone.push('upgrade_meal'); }
    if (dispersed) { s.flexone += 10; r.flexone.push('remote'); }
    if (g.expenses && Object.keys(g).length === 1) s.flexone -= 25;

    // Chèque Déjeuner: frontline teams that prefer a physical voucher
    if (frontline && a.work_model !== 'remote') { s.cheque += 40; r.cheque.push('frontline'); }
    if (g.tax) { s.cheque += 10; r.cheque.push('tax'); }
    if (a.work_model === 'remote') s.cheque -= 30;
    r.cheque.push('brand');

    // Fitpass: wellbeing
    if (g.wellbeing) { s.fitpass += 55; r.fitpass.push('wellbeing'); }
    if (g.retention) { s.fitpass += 20; r.fitpass.push('retention'); }
    if (dispersed) { s.fitpass += 5; r.fitpass.push('holistic'); }
    if (cur.wellness) { s.fitpass += 5; r.fitpass.push('upgrade'); }

    // Up Gift: recognition
    if (g.recognition) { s.gift += 55; r.gift.push('recognition'); }
    if (g.retention) s.gift += 15;
    if (g.tax) { s.gift += 15; r.gift.push('tax'); }
    if (!cur.gift) s.gift += 5;
    r.gift.push('freedom');

    // Up Expense: company spending (separate budget from employee benefits)
    if (g.expenses) { s.expense += 55; r.expense.push('control'); }
    if (spends) { s.expense += 30; if (!g.expenses) r.expense.push('control'); }
    if (spends && SIZE_ORDER.indexOf(a.size) >= 2) s.expense += 10;
    if ((sp.fuel ? 1 : 0) + (sp.travel ? 1 : 0) + (sp.purchases ? 1 : 0) >= 2) s.expense += 10;
    if (a.work_model === 'field') { s.expense += 15; r.expense.push('field'); }
    if (sp.fuel) r.expense.push('fuel');
    if (cur.expense_cards) s.expense += 5;
    r.expense.push('receipts');

    // Benefits (per-employee budget) vs. spend management (company budget)
    var benefits = ['flexone', 'cheque', 'fitpass', 'gift']
      .filter(function (id) { return s[id] >= THRESHOLD; })
      .sort(function (x, y) { return s[y] - s[x]; });
    var cap = MAX_BENEFITS[a.budget] || 3;
    // Never recommend both meal solutions as equals: keep both only as core + alternative
    benefits = benefits.slice(0, cap);
    if (!benefits.length && s.expense < THRESHOLD) benefits = ['flexone'];

    var items = benefits.map(function (id, i) {
      var role = i === 0 ? 'core' : 'addon';
      if ((id === 'cheque' && benefits.indexOf('flexone') > -1 && benefits.indexOf('flexone') < i) ||
          (id === 'flexone' && benefits.indexOf('cheque') > -1 && benefits.indexOf('cheque') < i)) role = 'alt';
      return item(id, role);
    });
    if (s.expense >= THRESHOLD) {
      var exp = item('expense', items.length ? 'spend' : 'core');
      if (g.expenses && Object.keys(g).length === 1) items.unshift(exp); else items.push(exp);
      if (items[0].id === 'expense') items[0].role = 'core';
    }

    function item(id, role) {
      var reasons = uniq(r[id]).slice(0, 3);
      return { id: id, role: role, score: s[id], match: Math.min(98, 58 + Math.round(Math.max(s[id], 0) * 0.4)), reasons: reasons, plan: planFor(id) };
    }
    function planFor(id) {
      if (id === 'flexone') {
        return (a.budget === '100_200' || a.budget === 'gt200' || g.wellbeing || dispersed || Object.keys(g).length > 1) ? 'flexmax' : 'flexplus';
      }
      if (id === 'expense') {
        if (sp.purchases || (sp.travel && sp.fuel)) return 'expenseplus';
        if (sp.travel) return 'expense';
        if (sp.fuel) return 'fuelplus';
        return 'expense';
      }
      return null;
    }
    return { items: items, scores: s };
  }

  /* =====================================================================
   * 5. DETERMINISTIC FALLBACK SUMMARY (used when AI is off/slow/invalid)
   * ===================================================================== */
  function fallbackSummary(a, rec, lang) {
    var t = T[lang];
    var names = rec.items.map(function (it) { return CATALOG[it.id].name; });
    var core = rec.items[0];
    var coreName = CATALOG[core.id].name;
    var goal = t.o[a.goals[0]][0].toLowerCase();
    var rest = names.slice(1);
    if (lang === 'el') {
      var art = CATALOG[core.id].art.el;
      var s1 = 'Με βάση τις απαντήσεις σου, ' + art + ' ' + coreName + ' αποτελεί τον πυρήνα του πακέτου σου, γιατί απαντά άμεσα στον στόχο σου: ' + goal + '.';
      var s2 = rest.length === 1 ? ' Η λύση ' + rest[0] + ' το συμπληρώνει, ώστε η ομάδα σου να κερδίζει αξία και σε άλλα σημεία της καθημερινότητάς της.'
        : rest.length ? ' Οι λύσεις ' + joinList(rest, lang) + ' το συμπληρώνουν, ώστε η ομάδα σου να κερδίζει αξία και σε άλλα σημεία της καθημερινότητάς της.' : '';
      var s3 = ' Όλα διαχειρίζονται ψηφιακά, με απλή ενεργοποίηση για την ομάδα σου. Ένας σύμβουλος της Up Hellas μπορεί να σου δείξει πώς στήνεται στην πράξη και ποιο πλάνο ταιριάζει καλύτερα.';
      return s1 + s2 + s3;
    }
    var e1 = 'Based on your answers, ' + coreName + ' is the foundation of your package because it speaks directly to your goal: ' + goal + '.';
    var e2 = rest.length ? ' ' + joinList(rest, lang) + (rest.length === 1 ? ' rounds' : ' round') + ' it out, so your team gets value in other parts of their day too.' : '';
    var e3 = ' Everything is managed digitally and is simple to roll out. An Up Hellas advisor can show you how it works in practice and which plan fits best.';
    return e1 + e2 + e3;
  }

  // Client-side guardrail (defence in depth; the server validates too)
  function isSafeSummary(text, rec, lang) {
    if (typeof text !== 'string') return false;
    var words = text.trim().split(/\s+/).length;
    if (words < 35 || words > 160) return false;
    if (/\d|€|%|\$|ευρώ|euro/i.test(text)) return false;
    var allowed = rec.items.map(function (i) { return i.id; });
    for (var id in CATALOG) {
      if (allowed.indexOf(id) === -1 && text.toLowerCase().indexOf(CATALOG[id].name.toLowerCase()) > -1) return false;
    }
    var greek = (text.match(/[Ͱ-Ͽἀ-῿]/g) || []).length;
    var latin = (text.match(/[a-z]/gi) || []).length;
    if (lang === 'el' && greek < latin) return false;
    if (lang === 'en' && greek > 0) return false;
    return true;
  }

  /* =====================================================================
   * 6. ANALYTICS — dataLayer events for GTM/GA4 (never any PII)
   * ===================================================================== */
  window.dataLayer = window.dataLayer || [];
  function track(event, params) {
    var payload = Object.assign({ event: event, quiz_id: 'up_benefits_builder', quiz_lang: state.lang }, params || {});
    window.dataLayer.push(payload);
  }

  /* =====================================================================
   * 7. STATE
   * ===================================================================== */
  var root, state = {
    lang: 'el', step: 0, answers: {}, started: false, completed: false, unlocked: false,
    lead: null, rec: null, summary: null, summarySource: null, shared: false, dropSent: false, error: ''
  };
  var summaryPromise = null;
  var STORE_KEY = 'ubb_state_v1';

  function save() {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({
        step: state.step, answers: state.answers, started: state.started, doneSteps: state.doneSteps, completed: state.completed,
        unlocked: state.unlocked, lead: state.lead ? { company: state.lead.company } : null, summary: state.summary, summarySource: state.summarySource
      }));
    } catch (e) { /* storage unavailable: fine */ }
  }
  function restore() {
    try {
      var raw = sessionStorage.getItem(STORE_KEY);
      if (!raw) return;
      var s = JSON.parse(raw);
      if (s && s.answers) Object.assign(state, s);
      if (state.completed) state.rec = recommend(state.answers);
    } catch (e) { /* ignore */ }
  }

  /* =====================================================================
   * 8. RENDERING
   * ===================================================================== */
  function h(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k] != null ? o[k] : ''; }); }

  function render(focus) {
    var t = T[state.lang];
    var html;
    if (!state.completed) html = renderStep(t);
    else if (!state.unlocked) html = renderGate(t);
    else html = renderResults(t);
    root.innerHTML = '<div class="ubb" lang="' + state.lang + '">' + html + '</div>';
    if (focus) {
      var target = root.querySelector('[data-focus]');
      if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
      var top = root.getBoundingClientRect().top + window.scrollY - 16;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
    if (state.unlocked) hydrateSummary();
  }

  function renderStep(t) {
    var step = STEPS[state.step];
    var q = t.q[step.id];
    var total = STEPS.length;
    var pct = Math.round((state.step / total) * 100);
    var val = state.answers[step.id];
    var isMulti = step.type === 'multi';
    var opts = step.options.map(function (o) {
      var label = t.o[o];
      var checked = isMulti ? (val || []).indexOf(o) > -1 : val === o;
      var id = 'ubb-' + step.id + '-' + o.replace(/[^a-z0-9]/gi, '');
      return '<label class="ubb-opt' + (checked ? ' is-on' : '') + '" for="' + id + '">' +
        '<input id="' + id + '" type="' + (isMulti ? 'checkbox' : 'radio') + '" name="' + step.id + '" value="' + h(o) + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="ubb-opt-mark" aria-hidden="true"></span>' +
        '<span class="ubb-opt-text"><span class="ubb-opt-title">' + h(label[0]) + '</span>' +
        (label[1] ? '<span class="ubb-opt-sub">' + h(label[1]) + '</span>' : '') + '</span></label>';
    }).join('');
    var last = state.step === total - 1;
    return '' +
      '<div class="ubb-top">' +
        '<span class="ubb-eyebrow">' + t.eyebrow + '</span>' +
        '<span class="ubb-count">' + fmt(t.stepOf, { n: state.step + 1, t: total }) + '</span>' +
      '</div>' +
      '<div class="ubb-progress" role="progressbar" aria-label="' + h(fmt(t.stepOf, { n: state.step + 1, t: total })) + '" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + state.step + '">' +
        '<span style="width:' + Math.max(pct, 4) + '%"></span></div>' +
      '<form class="ubb-step" data-step="' + step.id + '" novalidate>' +
        '<fieldset><legend><span class="ubb-q" data-focus>' + h(q.t) + '</span><span class="ubb-hint">' + h(q.h) + '</span></legend>' +
        '<div class="ubb-opts' + (step.options.length > 5 ? ' is-dense' : '') + '">' + opts + '</div></fieldset>' +
        '<p class="ubb-error" role="alert" aria-live="assertive">' + h(state.error || '') + '</p>' +
        '<div class="ubb-nav">' +
          (state.step > 0 ? '<button type="button" class="ubb-btn ubb-btn-ghost" data-act="back">← ' + t.back + '</button>' : '<span></span>') +
          '<button type="submit" class="ubb-btn ubb-btn-primary">' + (last ? t.finish : t.next) + ' →</button>' +
        '</div>' +
      '</form>';
  }

  function productChip(it) {
    var p = CATALOG[it.id];
    return '<li class="ubb-chip" style="--c:' + p.color + '"><span class="ubb-dot" aria-hidden="true"></span>' +
      '<span class="ubb-chip-name">' + h(p.name) + '</span><span class="ubb-chip-match">' + it.match + '% ' + T[state.lang].match + '</span></li>';
  }

  function renderGate(t) {
    var rec = state.rec;
    var demo = !CFG.leadEndpoint;
    return '' +
      (state.shared ? '<div class="ubb-banner">' + t.sharedBanner + '</div>' : '') +
      '<div class="ubb-ready">' +
        '<span class="ubb-eyebrow">' + t.eyebrow + '</span>' +
        '<h2 class="ubb-h2" data-focus>' + t.readyTitle + '</h2>' +
        '<p class="ubb-lead">' + t.readyText + '</p>' +
        '<ul class="ubb-chips">' + rec.items.map(productChip).join('') + '</ul>' +
        '<div class="ubb-peek" aria-hidden="true"><span></span><span></span><span></span></div>' +
      '</div>' +
      '<form class="ubb-gate" novalidate>' +
        '<h3 class="ubb-h3">' + t.gateTitle + '</h3>' +
        '<p class="ubb-sub">' + t.gateText + '</p>' +
        field('name', t.fName, 'text', 'name', true) +
        field('email', t.fEmail, 'email', 'email', true, '<span class="ubb-field-hint" id="ubb-email-hint" hidden>' + t.freeHint + '</span>') +
        field('company', t.fCompany, 'text', 'organization', true) +
        field('phone', t.fPhone + ' <span class="ubb-opt-label">(' + t.optional + ')</span>', 'tel', 'tel', false) +
        '<div class="ubb-hp" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
        '<label class="ubb-check"><input type="checkbox" name="consent" required><span>' + t.fConsent + '</span></label>' +
        '<p class="ubb-error" data-err="consent" role="alert"></p>' +
        '<button type="submit" class="ubb-btn ubb-btn-primary ubb-btn-block">' + t.submit + ' →</button>' +
        '<p class="ubb-micro">' + t.privacy + (demo ? ' <em>' + t.demoMode + '</em>' : '') + '</p>' +
      '</form>' +
      '<div class="ubb-foot"><button type="button" class="ubb-link" data-act="back-to-quiz">← ' + t.back + '</button></div>';
  }

  function field(name, label, type, ac, req, extra) {
    var v = state.lead && state.lead[name] ? h(state.lead[name]) : '';
    return '<div class="ubb-field"><label for="ubb-f-' + name + '">' + label + '</label>' +
      '<input id="ubb-f-' + name + '" name="' + name + '" type="' + type + '" autocomplete="' + ac + '"' + (req ? ' required aria-required="true"' : '') +
      (type === 'tel' ? ' inputmode="tel"' : '') + (type === 'email' ? ' inputmode="email" aria-describedby="ubb-email-hint"' : '') + ' value="' + v + '">' +
      (extra || '') + '<p class="ubb-error" data-err="' + name + '" role="alert"></p></div>';
  }

  function renderResults(t) {
    var rec = state.rec, lang = state.lang;
    var company = state.lead && state.lead.company;
    var cards = rec.items.map(function (it) {
      var p = CATALOG[it.id];
      var role = { core: t.roleCore, addon: t.roleAddon, alt: t.roleAlt, spend: t.roleSpend }[it.role];
      var plan = it.plan && p.plans ? p.plans[it.plan] : null;
      return '<article class="ubb-card' + (it.role === 'core' ? ' is-core' : '') + '" style="--c:' + p.color + '">' +
        '<div class="ubb-card-head"><span class="ubb-role">' + h(role) + '</span><span class="ubb-chip-match">' + it.match + '% ' + t.match + '</span></div>' +
        '<h3 class="ubb-card-title">' + h(p.name) + '</h3>' +
        '<p class="ubb-card-tag">' + h(p.tagline[lang]) + '</p>' +
        '<ul class="ubb-reasons">' + it.reasons.map(function (k) { return '<li>' + h(p.reasons[k][lang]) + '</li>'; }).join('') + '</ul>' +
        (plan ? '<p class="ubb-plan"><strong>' + t.plan + ':</strong> ' + h(plan.name) + ' <span>(' + h(plan[lang]) + ')</span></p>' : '') +
        '<a class="ubb-more" href="' + p.url[lang] + '" target="_blank" rel="noopener" data-product="' + it.id + '">' + t.learn + ' →</a>' +
        '</article>';
    }).join('');
    return '' +
      '<div class="ubb-res-head">' +
        '<span class="ubb-eyebrow">' + t.eyebrow + '</span>' +
        '<h2 class="ubb-h2" data-focus>' + h(company ? fmt(t.resTitleCo, { company: company }) : t.resTitle) + '</h2>' +
      '</div>' +
      '<section class="ubb-summary" aria-live="polite" aria-busy="' + (state.summary ? 'false' : 'true') + '">' +
        '<div class="ubb-summary-head"><h3 class="ubb-h3">' + t.summaryLabel + '</h3>' +
        (state.summarySource === 'ai' ? '<span class="ubb-ai">' + t.aiBadge + '</span>' : '') + '</div>' +
        (state.summary
          ? '<p class="ubb-summary-text">' + h(state.summary) + '</p><p class="ubb-micro">' + (state.summarySource === 'ai' ? t.aiNote : t.fbNote) + '</p>'
          : '<div class="ubb-skel"><span></span><span></span><span></span></div>') +
      '</section>' +
      '<div class="ubb-cards">' + cards + '</div>' +
      '<section class="ubb-cta">' +
        '<h3 class="ubb-h3">' + t.ctaTitle + '</h3><p>' + t.ctaText + '</p>' +
        '<a class="ubb-btn ubb-btn-primary" data-act="demo" href="' + (CFG.demoUrl[lang] || CFG.demoUrl) + '" target="_blank" rel="noopener">' + t.ctaBtn + ' →</a>' +
      '</section>' +
      '<section class="ubb-share">' +
        '<div><h3 class="ubb-h3">' + t.shareTitle + '</h3><p class="ubb-sub">' + t.shareText + '</p></div>' +
        '<div class="ubb-share-btns">' +
          (navigator.share ? '<button type="button" class="ubb-btn ubb-btn-ghost" data-act="share">' + t.share + '</button>' : '') +
          '<button type="button" class="ubb-btn ubb-btn-ghost" data-act="copy">' + t.copy + '</button>' +
          '<button type="button" class="ubb-btn ubb-btn-ghost" data-act="download">' + t.download + '</button>' +
        '</div>' +
      '</section>' +
      '<p class="ubb-micro ubb-disclaimer">' + t.disclaimer + '</p>' +
      '<div class="ubb-foot"><button type="button" class="ubb-link" data-act="restart">↺ ' + t.restart + '</button></div>';
  }

  /* =====================================================================
   * 9. AI SUMMARY (server-side via n8n; client never holds an API key)
   * ===================================================================== */
  function requestSummary() {
    if (summaryPromise) return summaryPromise;
    var lang = state.lang, rec = state.rec, a = state.answers;
    var fallback = function () { return { text: fallbackSummary(a, rec, lang), source: 'fallback' }; };
    if (!CFG.summaryEndpoint) {
      summaryPromise = Promise.resolve(fallback());
      return summaryPromise;
    }
    var ctrl = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, CFG.timeoutMs);
    summaryPromise = fetch(CFG.summaryEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, // "simple" request → no CORS preflight
      body: JSON.stringify({ lang: lang, answers: a, recommendation: rec.items.map(slimItem) }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      clearTimeout(timer);
      if (data && data.source === 'ai' && isSafeSummary(data.summary, rec, lang)) return { text: data.summary, source: 'ai' };
      if (data && data.summary && isSafeSummary(data.summary, rec, lang)) return { text: data.summary, source: 'fallback' };
      return fallback();
    }).catch(function () { clearTimeout(timer); return fallback(); });
    return summaryPromise;
  }

  function hydrateSummary() {
    if (state.summary) return;
    requestSummary().then(function (res) {
      state.summary = res.text; state.summarySource = res.source; save();
      var box = root.querySelector('.ubb-summary');
      if (!box) return;
      var t = T[state.lang];
      box.setAttribute('aria-busy', 'false');
      box.innerHTML = '<div class="ubb-summary-head"><h3 class="ubb-h3">' + t.summaryLabel + '</h3>' +
        (res.source === 'ai' ? '<span class="ubb-ai">' + t.aiBadge + '</span>' : '') + '</div>' +
        '<p class="ubb-summary-text">' + h(res.text) + '</p><p class="ubb-micro">' + (res.source === 'ai' ? t.aiNote : t.fbNote) + '</p>';
    });
  }

  function slimItem(it) { return { id: it.id, role: it.role, plan: it.plan, reasons: it.reasons }; }

  /* =====================================================================
   * 10. LEAD SUBMISSION
   * ===================================================================== */
  var FREE_DOMAINS = ['gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.gr', 'ymail.com', 'hotmail.com', 'hotmail.gr', 'outlook.com', 'outlook.com.gr', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'aol.com', 'protonmail.com', 'proton.me', 'gmx.com', 'gmx.net', 'mail.com', 'yandex.com', 'zoho.com', 'otenet.gr', 'hol.gr', 'in.gr', 'freemail.gr', 'windowslive.com', 'forthnet.gr', 'cosmotemail.gr'];

  function emailDomain(email) { return (email.split('@')[1] || '').toLowerCase().trim(); }
  function isFreeEmail(email) { return FREE_DOMAINS.indexOf(emailDomain(email)) > -1; }

  function validateLead(f) {
    var t = T[state.lang], errs = {};
    if (f.name.trim().length < 2) errs.name = t.eName;
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(f.email.trim())) errs.email = t.eEmail;
    if (f.company.trim().length < 2) errs.company = t.eCompany;
    var digits = f.phone.replace(/[^\d]/g, '');
    if (f.phone.trim() && !(digits.length === 10 || (digits.length === 12 && digits.indexOf('30') === 0) || (digits.length >= 10 && digits.length <= 15 && /^\+/.test(f.phone.trim())))) errs.phone = t.ePhone;
    if (!f.consent) errs.consent = t.eConsent;
    return errs;
  }

  function utm() {
    var p = new URLSearchParams(location.search), o = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(function (k) { if (p.get(k)) o[k] = p.get(k).slice(0, 120); });
    return o;
  }
  function gaClientId() {
    var m = document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/);
    return m ? m[1] : '';
  }

  function submitLead(f) {
    var payload = {
      lead: { name: f.name.trim(), email: f.email.trim(), company: f.company.trim(), phone: f.phone.trim() },
      consent: true,
      honeypot: f.website || '',
      lang: state.lang,
      answers: state.answers,
      recommendation: state.rec.items.map(slimItem),
      context: Object.assign({ page_url: location.href.split('#')[0].slice(0, 300), referrer: document.referrer.slice(0, 300), ga_client_id: gaClientId(), user_agent: navigator.userAgent.slice(0, 200), submitted_at: new Date().toISOString() }, utm())
    };
    if (!CFG.leadEndpoint) {
      if (window.console) console.info('[UBB demo mode] lead payload', payload);
      return Promise.resolve({ ok: true, demo: true });
    }
    return fetch(CFG.leadEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload),
      keepalive: true
    }).then(function (r) { return { ok: r.ok }; }).catch(function () { return { ok: false }; });
  }

  /* =====================================================================
   * 11. SHARE CARD (canvas → PNG) + SHARE LINK
   * ===================================================================== */
  function shareUrl() {
    var a = state.answers;
    var code = STEPS.map(function (s) {
      var v = a[s.id];
      if (s.type === 'multi') return (v || []).map(function (x) { return s.options.indexOf(x); }).join('');
      return s.options.indexOf(v);
    }).join('-');
    var u = new URL(location.href);
    u.hash = 'ubb=' + code;
    u.searchParams.set('utm_source', 'ubb_share');
    u.searchParams.set('utm_medium', 'referral');
    return u.toString();
  }
  function parseShare() {
    var m = location.hash.match(/ubb=([\d-]+)/);
    if (!m) return null;
    var parts = m[1].split('-');
    if (parts.length !== STEPS.length) return null;
    var a = {};
    for (var i = 0; i < STEPS.length; i++) {
      var s = STEPS[i];
      if (s.type === 'multi') {
        a[s.id] = parts[i].split('').map(function (d) { return s.options[+d]; }).filter(Boolean);
        if (!a[s.id].length) return null;
      } else {
        a[s.id] = s.options[+parts[i]];
        if (!a[s.id]) return null;
      }
    }
    return a;
  }

  function drawCard() {
    var t = T[state.lang], W = 1200, H = 630;
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    var bg = x.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#191919'); bg.addColorStop(1, '#2a1630');
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    var glow = x.createRadialGradient(W - 150, 80, 10, W - 150, 80, 420);
    glow.addColorStop(0, 'rgba(255,133,0,.45)'); glow.addColorStop(1, 'rgba(255,133,0,0)');
    x.fillStyle = glow; x.fillRect(0, 0, W, H);
    var font = 'Linotte, Nunito, "Segoe UI", system-ui, sans-serif';
    x.fillStyle = '#ff8500'; x.font = '700 30px ' + font; x.fillText('Up Benefits Builder', 72, 96);
    x.fillStyle = '#fff'; x.font = '800 60px ' + font;
    var title = state.lead && state.lead.company ? fmt(t.resTitleCo, { company: state.lead.company }) : t.cardTag;
    x.fillText(title.length > 34 ? title.slice(0, 33) + '…' : title, 72, 180);
    var y = 260;
    state.rec.items.slice(0, 4).forEach(function (it) {
      var p = CATALOG[it.id];
      roundRect(x, 72, y, 1056, 70, 35); x.fillStyle = 'rgba(255,255,255,.07)'; x.fill();
      x.fillStyle = p.color; x.beginPath(); x.arc(112, y + 35, 12, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#fff'; x.font = '700 32px ' + font; x.fillText(p.name, 140, y + 46);
      x.fillStyle = 'rgba(255,255,255,.7)'; x.font = '600 26px ' + font;
      var m = it.match + '% ' + t.match; x.fillText(m, 1100 - x.measureText(m).width, y + 45);
      y += 86;
    });
    x.fillStyle = 'rgba(255,255,255,.6)'; x.font = '600 24px ' + font; x.fillText(t.cardFoot + ' →', 72, H - 40);
    return c;
  }
  function roundRect(x, l, tp, w, hh, r) {
    x.beginPath(); x.moveTo(l + r, tp); x.arcTo(l + w, tp, l + w, tp + hh, r); x.arcTo(l + w, tp + hh, l, tp + hh, r);
    x.arcTo(l, tp + hh, l, tp, r); x.arcTo(l, tp, l + w, tp, r); x.closePath();
  }

  /* =====================================================================
   * 12. EVENTS
   * ===================================================================== */
  function onSubmit(e) {
    var form = e.target;
    if (form.classList.contains('ubb-step')) { e.preventDefault(); nextStep(form); }
    if (form.classList.contains('ubb-gate')) { e.preventDefault(); unlock(form); }
  }

  function readStep(form) {
    var step = STEPS[state.step];
    var checked = [].slice.call(form.querySelectorAll('input:checked')).map(function (i) { return i.value; });
    return step.type === 'multi' ? checked : checked[0];
  }

  function stepError(step, v) {
    var t = T[state.lang];
    if (step.type === 'single') return v ? '' : t.errSingle;
    if (!v || v.length < (step.min || 1)) return t.errMulti;
    if (step.max && v.length > step.max) return fmt(t.errMax, { max: step.max });
    return '';
  }

  function nextStep(form) {
    var step = STEPS[state.step];
    var v = readStep(form);
    var err = stepError(step, v);
    if (err) { state.error = err; render(false); return; }
    state.error = '';
    state.answers[step.id] = v;
    if (!state.doneSteps) state.doneSteps = {};
    if (!state.doneSteps[step.id]) { // once per step, so the GA4 funnel counts people, not clicks
      state.doneSteps[step.id] = true;
      track('quiz_step_complete', { step_number: state.step + 1, step_id: step.id, step_answer: [].concat(v).join('|') });
    }
    if (state.step < STEPS.length - 1) {
      state.step++;
    } else {
      state.completed = true;
      state.rec = recommend(state.answers);
      track('quiz_complete', completeParams());
      requestSummary(); // prefetch: the AI summary is usually ready before the form is submitted
    }
    save(); render(true);
  }

  function completeParams() {
    var a = state.answers;
    return {
      recommended_products: state.rec.items.map(function (i) { return i.id; }).join('|'),
      company_size: a.size, industry: a.industry, work_model: a.work_model, budget_band: a.budget, hr_goals: a.goals.join('|')
    };
  }

  function unlock(form) {
    var t = T[state.lang];
    var el = function (n) { return form.elements.namedItem(n); };
    var f = {
      name: el('name').value, email: el('email').value, company: el('company').value, phone: el('phone').value,
      consent: el('consent').checked, website: el('website').value
    };
    var errs = validateLead(f);
    [].forEach.call(form.querySelectorAll('[data-err]'), function (p) {
      var k = p.getAttribute('data-err');
      p.textContent = errs[k] || '';
      var inp = form.querySelector('[name="' + k + '"]');
      if (inp) inp.setAttribute('aria-invalid', errs[k] ? 'true' : 'false');
    });
    var firstBad = Object.keys(errs)[0];
    if (firstBad) { var bad = form.querySelector('[name="' + firstBad + '"]'); if (bad) bad.focus(); return; }
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = t.sending;
    state.lead = { name: f.name.trim(), company: f.company.trim() };
    // Results never wait on the CRM: fire the lead, then reveal.
    submitLead(f);
    track('generate_lead', Object.assign(completeParams(), { lead_email_type: isFreeEmail(f.email) ? 'free' : 'business', has_phone: f.phone.trim() ? 'yes' : 'no' }));
    state.unlocked = true; save();
    setTimeout(function () { render(true); }, 250);
  }

  function onClick(e) {
    var el = e.target.closest('[data-act]');
    if (el) {
      var act = el.getAttribute('data-act');
      if (act === 'back') { state.error = ''; state.step = Math.max(0, state.step - 1); save(); render(true); }
      if (act === 'back-to-quiz') { state.completed = false; state.step = STEPS.length - 1; save(); render(true); }
      if (act === 'restart') { reset(); }
      if (act === 'demo') track('demo_click', { recommended_products: state.rec.items.map(function (i) { return i.id; }).join('|') });
      if (act === 'copy') copyLink(el);
      if (act === 'share') nativeShare();
      if (act === 'download') downloadCard();
      return;
    }
    var more = e.target.closest('.ubb-more');
    if (more) track('product_click', { product_id: more.getAttribute('data-product') });
  }

  function onChange(e) {
    var inp = e.target;
    if (!inp.closest('.ubb-step')) return;
    var step = STEPS[state.step];
    if (!state.started) { state.started = true; track('quiz_start', { entry: state.shared ? 'shared_link' : 'direct' }); }
    if (step.type === 'multi' && step.exclusive) {
      var boxes = [].slice.call(root.querySelectorAll('input[name="' + step.id + '"]'));
      if (inp.value === step.exclusive && inp.checked) boxes.forEach(function (b) { if (b !== inp) b.checked = false; });
      else if (inp.checked) boxes.forEach(function (b) { if (b.value === step.exclusive) b.checked = false; });
    }
    if (step.type === 'multi' && step.max) {
      var on = root.querySelectorAll('input[name="' + step.id + '"]:checked');
      if (on.length > step.max) { inp.checked = false; showErr(fmt(T[state.lang].errMax, { max: step.max })); }
      else showErr('');
    } else showErr('');
    [].forEach.call(root.querySelectorAll('.ubb-opt'), function (l) { l.classList.toggle('is-on', l.querySelector('input').checked); });
    // Single choice auto-advances: fewer taps, faster flow (Back is always available)
    if (step.type === 'single' && inp.checked) {
      clearTimeout(onChange._t);
      onChange._t = setTimeout(function () { var f = root.querySelector('.ubb-step'); if (f) nextStep(f); }, reducedMotion() ? 0 : 220);
    }
  }
  function showErr(msg) { var el = root.querySelector('.ubb-error'); if (el) el.textContent = msg; state.error = msg; }

  function onInput(e) {
    if (e.target.name === 'email') {
      var hint = root.querySelector('#ubb-email-hint');
      if (hint) hint.hidden = !isFreeEmail(e.target.value);
    }
  }

  function copyLink(btn) {
    var url = shareUrl(), t = T[state.lang];
    var done = function () { btn.textContent = t.copied; setTimeout(function () { btn.textContent = t.copy; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { prompt('', url); });
    else prompt('', url);
    track('share_result', { share_method: 'copy_link' });
  }
  function nativeShare() {
    var t = T[state.lang];
    var url = shareUrl();
    var canvas = drawCard();
    var text = t.shareMsg + ' ' + state.rec.items.map(function (i) { return CATALOG[i.id].name; }).join(' + ');
    canvas.toBlob(function (blob) {
      var file = blob && window.File ? new File([blob], 'up-benefits-package.png', { type: 'image/png' }) : null;
      var data = { title: 'Up Benefits Builder', text: text, url: url };
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
      navigator.share(data).then(function () { track('share_result', { share_method: data.files ? 'native_with_card' : 'native' }); }, function () {});
    });
  }
  function downloadCard() {
    var a = document.createElement('a');
    a.download = 'up-benefits-package.png';
    a.href = drawCard().toDataURL('image/png');
    document.body.appendChild(a); a.click(); a.remove();
    track('share_result', { share_method: 'download_card' });
  }

  function reset() {
    state.step = 0; state.answers = {}; state.completed = false; state.unlocked = false; state.rec = null;
    state.summary = null; state.summarySource = null; state.shared = false; state.started = false; state.dropSent = false; state.error = ''; state.doneSteps = {};
    summaryPromise = null;
    if (/ubb=/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    save(); render(true);
  }

  // Drop-off: fired once when the visitor leaves mid-quiz or at the lead form
  function onLeave() {
    if (state.dropSent || !state.started || state.unlocked) return;
    state.dropSent = true;
    var atGate = state.completed && !state.unlocked;
    track('quiz_drop_off', {
      last_step_number: atGate ? STEPS.length + 1 : state.step + 1,
      last_step_id: atGate ? 'lead_form' : STEPS[state.step].id
    });
  }

  function reducedMotion() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function toSet(arr) { var o = {}; (arr || []).forEach(function (k) { o[k] = true; }); return o; }
  function uniq(arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); }
  function joinList(arr, lang) {
    if (arr.length <= 1) return arr.join('');
    return arr.slice(0, -1).join(', ') + T[lang].and + arr[arr.length - 1];
  }

  /* =====================================================================
   * 13. BOOT
   * ===================================================================== */
  function boot() {
    root = document.getElementById('ubb-root');
    if (!root) return;
    var lang = (root.getAttribute('data-lang') || document.documentElement.lang || 'el').slice(0, 2).toLowerCase();
    state.lang = T[lang] ? lang : 'el';
    var shared = parseShare();
    if (shared) {
      state.answers = shared; state.completed = true; state.shared = true; state.started = true; state.step = STEPS.length - 1;
      state.rec = recommend(shared);
      track('quiz_start', { entry: 'shared_link' });
      track('quiz_complete', completeParams());
    } else restore();
    root.addEventListener('submit', onSubmit);
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    root.addEventListener('input', onInput);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') onLeave(); });
    window.addEventListener('pagehide', onLeave);
    render(false);
  }

  // Exposed for tests and for the n8n fallback parity check
  window.UBB = { recommend: recommend, fallbackSummary: fallbackSummary, isSafeSummary: isSafeSummary, CATALOG: CATALOG, STEPS: STEPS, T: T, isFreeEmail: isFreeEmail };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
