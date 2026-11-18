#!/usr/bin/env python3
"""Builds the bilingual landing pages (EL + EN) from one source so copy, SEO tags and schema stay in sync.

Usage (from the repo root): python3 tools/build.py --base https://example.github.io/up-benefits-builder \
         --gtm GTM-XXXXXXX --summary <n8n summary webhook> --lead <n8n lead webhook>
"""
import argparse, json, html, os

ap = argparse.ArgumentParser()
ap.add_argument('--base', default='https://example.com/up-benefits-builder')
ap.add_argument('--gtm', default='')
ap.add_argument('--summary', default='')
ap.add_argument('--lead', default='')
ap.add_argument('--noindex', action='store_true')
args = ap.parse_args()
BASE = args.base.rstrip('/')

PRODUCTS = {
    'el': [
        ('FlexOne', '#9f51ae', 'Θέλω πολλές παροχές σε μία κάρτα', 'Σίτιση, επιβράβευση, ΜΜΜ, ευεξία και άλλες κατηγορίες σε μία κάρτα, ένα portal και ένα app.', 'https://uphellas.gr/proionta/flexone'),
        ('Up Gift', '#5e7a78', 'Θέλω να επιβραβεύσω την ομάδα', 'Κάρτα δώρου για επετείους, στόχους και γιορτές, με online παραγγελία και φόρτιση.', 'https://uphellas.gr/proionta/up-gift'),
        ('Fitpass', '#e6441f', 'Θέλω ευεξία και λιγότερο burnout', 'Εταιρικό πάσο για γυμναστήρια, studios και χώρους ευεξίας σε όλη την Ελλάδα.', 'https://uphellas.gr/proionta/fitpass'),
        ('Up Expense', '#0772f8', 'Θέλω έλεγχο στα εταιρικά έξοδα', 'Κάρτες με όρια ανά τμήμα, σκανάρισμα αποδείξεων στο app και αυτόματα reports.', 'https://uphellas.gr/proionta/up-expense'),
        ('Chèque Déjeuner', '#ff8500', 'Θέλω κλασικά κουπόνια σίτισης', 'Διατακτικές σίτισης για ομάδες πρώτης γραμμής, χωρίς app, PIN ή smartphone.', 'https://uphellas.gr/proionta/cheque-dejeuner'),
    ],
    'en': [
        ('FlexOne', '#9f51ae', 'I want many benefits on one card', 'Meals, rewards, public transport, wellness and more on one card, one portal and one app.', 'https://uphellas.gr/en/products/flexone'),
        ('Up Gift', '#5e7a78', 'I want to reward my team', 'A gift card for milestones, targets and holidays, ordered and topped up online.', 'https://uphellas.gr/en/products/up-gift'),
        ('Fitpass', '#e6441f', 'I want wellbeing and less burnout', 'A corporate pass for gyms, studios and wellness spaces across Greece.', 'https://uphellas.gr/en/products/fitpass'),
        ('Up Expense', '#0772f8', 'I want control over company spending', 'Cards with limits per department, receipt scanning in the app and automatic reports.', 'https://uphellas.gr/en/products/up-expense'),
        ('Chèque Déjeuner', '#ff8500', 'I want classic meal vouchers', 'Meal vouchers for frontline teams, with no app, PIN or smartphone needed.', 'https://uphellas.gr/en/products/cheque-dejeuner'),
    ],
}

C = {
    'el': {
        'path': '/', 'locale': 'el_GR', 'other': 'en', 'other_path': '/en/', 'other_label': 'EN',
        'title': 'Up Benefits Builder: Βρες το ιδανικό πακέτο εταιρικών παροχών σε 2 λεπτά',
        'desc': 'Απάντησε σε 7 γρήγορες ερωτήσεις και δες ποιος συνδυασμός FlexOne, Up Gift, Fitpass, Up Expense και Chèque Déjeuner ταιριάζει στην ομάδα σου, με αιτιολόγηση για κάθε λύση.',
        'og_title': 'Ποιες εταιρικές παροχές ταιριάζουν στην ομάδα σου; Μάθε σε 2 λεπτά',
        'strip': 'Concept prototype για αξιολόγηση. Δεν είναι επίσημη σελίδα της Up Hellas. Μόνο δοκιμαστικά δεδομένα.',
        'skip': 'Μετάβαση στο εργαλείο',
        'eyebrow': 'Για HR managers και CFOs',
        'h1': 'Βρες το ιδανικό πακέτο εταιρικών παροχών <span>σε 2 λεπτά</span>',
        'lead': 'Σταμάτα να συγκρίνεις σελίδες προϊόντων. Πες μας πώς δουλεύει η ομάδα σου και τι θέλεις να πετύχεις, και θα σου δείξουμε ποιος συνδυασμός λύσεων της Up Hellas ταιριάζει, και γιατί.',
        'bullets': ['7 γρήγορες ερωτήσεις', 'Αιτιολόγηση για κάθε λύση', 'Χωρίς καμία δέσμευση'],
        'noscript': 'Το εργαλείο χρειάζεται JavaScript. Δες όλες τις λύσεις στο <a href="https://uphellas.gr/proionta/ta-proionta-mas">uphellas.gr</a>.',
        'needs_h': 'Ποια λύση για ποια ανάγκη',
        'needs_p': 'Οι πέντε λύσεις της Up Hellas με μια ματιά. Το εργαλείο τις συνδυάζει για εσένα.',
        'how_h': 'Πώς λειτουργεί',
        'how': [('Απαντάς', 'Μέγεθος, κλάδος, μοντέλο εργασίας, στόχοι HR, υπάρχουσες παροχές και budget.'),
                ('Παίρνεις πρόταση', 'Κανόνες που βασίζονται στον κατάλογο της Up προτείνουν τον συνδυασμό σου, με αιτιολόγηση για κάθε λύση.'),
                ('Μιλάς με σύμβουλο', 'Μοιράζεσαι την πρόταση με την ομάδα σου και κλείνεις ένα δωρεάν demo.')],
        'faq_h': 'Συχνές ερωτήσεις',
        'faq': [
            ('Τι είναι το Up Benefits Builder;', 'Είναι ένα δωρεάν διαδραστικό εργαλείο 7 ερωτήσεων που προτείνει ποιος συνδυασμός λύσεων της Up Hellas (FlexOne, Up Gift, Fitpass, Up Expense και Chèque Déjeuner) ταιριάζει σε μια ελληνική επιχείρηση, με σύντομη αιτιολόγηση για κάθε λύση.'),
            ('Ποια λύση της Up Hellas ταιριάζει σε hybrid ή remote ομάδες;', 'Για hybrid και remote ομάδες το εργαλείο προτείνει συνήθως το FlexOne, γιατί προσφέρει ψηφιακές κάρτες και κατηγορίες όπως WFH και ΜΜΜ σε μία κάρτα. Αν ο στόχος είναι η ευεξία, προσθέτει το Fitpass, που περιλαμβάνει και online training.'),
            ('Ποια είναι η διαφορά FlexOne και Chèque Déjeuner;', 'Το FlexOne είναι μία ψηφιακή και φυσική κάρτα με πολλές κατηγορίες παροχών και app για τους εργαζομένους. Το Chèque Déjeuner είναι κλασικές διατακτικές σίτισης, ιδανικές για ομάδες πρώτης γραμμής που προτιμούν να πληρώνουν χωρίς app ή smartphone.'),
            ('Πώς βγαίνει η πρόταση; Τη γράφει AI;', 'Η επιλογή των λύσεων γίνεται με διαφανείς κανόνες, με βάση τις απαντήσεις σου. Το AI γράφει μόνο μια σύντομη προσωποποιημένη σύνοψη, μέσα από κλειστό κατάλογο προϊόντων, και δεν επιτρέπεται να αναφέρει τιμές, ποσά ή φορολογικά όρια.'),
            ('Θα δω τιμές ή φορολογικά οφέλη;', 'Όχι. Τιμές, πλάνα και φορολογικά οφέλη εξαρτώνται από την επιχείρησή σου και τα επιβεβαιώνει ένας σύμβουλος. Για τη γενική εικόνα δες τον Οδηγό Tax Benefits της Up Hellas.'),
            ('Τι γίνεται με τα στοιχεία μου;', 'Οι απαντήσεις στο quiz δεν περιέχουν προσωπικά δεδομένα. Το όνομα, το email και το τηλέφωνό σου πηγαίνουν μόνο στην ομάδα πωλήσεων για να επικοινωνήσει μαζί σου και δεν στέλνονται ποτέ στο μοντέλο AI.'),
        ],
        'foot': 'Concept prototype από τον Γιώργο Κοσύφα για την αξιολόγηση «Web & Agentic AI Specialist» της Up Hellas. Δεν αποτελεί επίσημη σελίδα της Up Hellas. Οι πληροφορίες προϊόντων προέρχονται από το δημόσιο uphellas.gr, χωρίς τιμές ή φορολογικά νούμερα.',
        'foot_links': [('Όλες οι λύσεις στο uphellas.gr', 'https://uphellas.gr/proionta/ta-proionta-mas'), ('Οδηγός Tax Benefits', 'https://uphellas.gr/tax-benefits')],
        'learn': 'Μάθε περισσότερα',
        'crumb_home': 'Αρχική',
    },
    'en': {
        'path': '/en/', 'locale': 'en_GB', 'other': 'el', 'other_path': '/', 'other_label': 'ΕΛ',
        'title': 'Up Benefits Builder: Find the right employee benefits package in 2 minutes',
        'desc': 'Answer 7 quick questions and see which mix of FlexOne, Up Gift, Fitpass, Up Expense and Chèque Déjeuner fits your team, with a reason for each solution.',
        'og_title': 'Which employee benefits fit your team? Find out in 2 minutes',
        'strip': 'Concept prototype for an assessment. Not an official Up Hellas page. Dummy data only.',
        'skip': 'Skip to the tool',
        'eyebrow': 'For HR managers and CFOs',
        'h1': 'Find the right employee benefits package <span>in 2 minutes</span>',
        'lead': 'Stop comparing product pages. Tell us how your team works and what you want to achieve, and we’ll show you which mix of Up Hellas solutions fits, and why.',
        'bullets': ['7 quick questions', 'A reason for every solution', 'No commitment'],
        'noscript': 'This tool needs JavaScript. See all solutions on <a href="https://uphellas.gr/en">uphellas.gr</a>.',
        'needs_h': 'Which solution for which need',
        'needs_p': 'The five Up Hellas solutions at a glance. The tool combines them for you.',
        'how_h': 'How it works',
        'how': [('You answer', 'Team size, industry, work model, HR goals, current benefits and budget.'),
                ('You get a package', 'Rules based on the Up catalogue recommend your mix, with a reason for each solution.'),
                ('You talk to an advisor', 'Share the package with your team and book a free demo.')],
        'faq_h': 'Frequently asked questions',
        'faq': [
            ('What is the Up Benefits Builder?', 'It is a free, 7-question interactive tool that recommends which mix of Up Hellas solutions (FlexOne, Up Gift, Fitpass, Up Expense and Chèque Déjeuner) fits a Greek company, with a short reason for each solution.'),
            ('Which Up Hellas solution suits hybrid or remote teams?', 'For hybrid and remote teams the tool usually recommends FlexOne, because it offers digital cards and categories such as WFH and public transport on one card. If wellbeing is a goal, it adds Fitpass, which also includes online training.'),
            ('What is the difference between FlexOne and Chèque Déjeuner?', 'FlexOne is one digital and physical card with many benefit categories and an employee app. Chèque Déjeuner is classic meal vouchers, ideal for frontline teams who prefer paying without an app or smartphone.'),
            ('How is the recommendation made? Is it written by AI?', 'The solutions are chosen by transparent rules based on your answers. AI only writes a short personalised summary from a closed product catalogue, and it is not allowed to mention prices, amounts or tax limits.'),
            ('Will I see prices or tax benefits?', 'No. Pricing, plans and tax benefits depend on your company and are confirmed by an advisor. For the general picture, see the Up Hellas Tax Benefits Guide.'),
            ('What happens to my details?', 'Your quiz answers contain no personal data. Your name, email and phone only go to the sales team so they can contact you, and they are never sent to the AI model.'),
        ],
        'foot': 'Concept prototype by Giorgos Kosyfas for the Up Hellas “Web & Agentic AI Specialist” assessment. Not an official Up Hellas page. Product information comes from the public uphellas.gr site, with no prices or tax figures.',
        'foot_links': [('All solutions on uphellas.gr', 'https://uphellas.gr/en'), ('Tax Benefits Guide', 'https://uphellas.gr/en/tax-benefits')],
        'learn': 'Learn more',
        'crumb_home': 'Home',
    },
}

CRITICAL_CSS = """
:root{--o:#ff8500;--p:#9f51ae;--bg:#191919;--line:#333;--mut:#b2b2b2}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:#fff;font-family:Linotte,Nunito,"Segoe UI",ui-rounded,system-ui,-apple-system,Roboto,Arial,sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased}
a{color:#ff9d33}
.skip{position:absolute;left:-999px;top:8px;background:#fff;color:#191919;padding:8px 14px;border-radius:99px;z-index:9}.skip:focus{left:8px}
.strip{background:#2a1630;color:#ecdcef;font-size:.8rem;text-align:center;padding:6px 16px}
.wrap{max-width:1240px;margin:0 auto;padding:0 20px}
header.site{display:flex;justify-content:space-between;align-items:center;padding:18px 0}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.05rem;color:#fff;text-decoration:none}
.brand i{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--o),var(--p));font-style:normal;font-size:.9rem;color:#fff}
.lang{display:flex;gap:4px;background:#262626;border-radius:99px;padding:4px}
.lang a,.lang span{padding:6px 12px;border-radius:99px;font-size:.85rem;font-weight:700;text-decoration:none;color:#fff}
.lang span{background:var(--o);color:#191919}
.hero{display:grid;gap:22px;padding:12px 0 56px}
.eyebrow{display:inline-block;font-size:.8rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--o);background:rgba(255,133,0,.12);padding:6px 12px;border-radius:99px}
h1{font-size:clamp(2rem,6vw,3.4rem);line-height:1.08;letter-spacing:-.02em;margin:14px 0 14px;font-weight:800}
h1 span{background:linear-gradient(90deg,var(--o),#ff9d33 40%,#c697ce);-webkit-background-clip:text;background-clip:text;color:transparent}
.lead{font-size:1rem;color:#e5e5e5;max-width:36em;margin:0 0 14px}@media(min-width:600px){.lead{font-size:1.1rem}}
.ticks{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:8px 18px;color:#e5e5e5;font-weight:700;font-size:.95rem}
.ticks li::before{content:"✓";color:var(--o);margin-right:6px}
@media(min-width:960px){.hero{grid-template-columns:1fr 1.05fr;align-items:start;padding-top:48px}.hero-copy{position:sticky;top:32px}}
"""

REST_CSS = """
section.block{padding:56px 0;border-top:1px solid #262626}
h2{font-size:clamp(1.6rem,4vw,2.3rem);line-height:1.15;margin:0 0 10px;letter-spacing:-.01em}
.sub{color:var(--mut);margin:0 0 26px;max-width:40em}
.needs{display:grid;gap:12px}
.need{background:#222;border:1px solid var(--line);border-radius:20px;padding:20px;border-top:4px solid var(--c)}
.need h3{margin:0 0 2px;font-size:1.2rem}.need strong{display:block;color:#ffce99;font-size:.9rem;margin-bottom:8px}.need p{margin:0 0 10px;color:#e5e5e5}
.need a{font-weight:800;text-decoration:none}
@media(min-width:700px){.needs{grid-template-columns:repeat(2,1fr)}}@media(min-width:1100px){.needs{grid-template-columns:repeat(5,1fr)}}
.steps{display:grid;gap:14px;counter-reset:s;list-style:none;padding:0;margin:0}
.steps li{background:#222;border:1px solid var(--line);border-radius:20px;padding:20px 20px 20px 72px;position:relative;counter-increment:s}
.steps li::before{content:counter(s);position:absolute;left:20px;top:18px;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-weight:800;background:linear-gradient(135deg,var(--o),var(--p))}
.steps h3{margin:0 0 4px;font-size:1.1rem}.steps p{margin:0;color:#e5e5e5}
@media(min-width:800px){.steps{grid-template-columns:repeat(3,1fr)}}
.faq details{background:#222;border:1px solid var(--line);border-radius:16px;margin-bottom:10px}
.faq summary{cursor:pointer;padding:16px 20px;font-weight:800;list-style:none;display:flex;justify-content:space-between;gap:12px}
.faq summary::-webkit-details-marker{display:none}.faq summary::after{content:"+";color:var(--o);font-size:1.3rem;line-height:1}
.faq details[open] summary::after{content:"–"}.faq details p{margin:0;padding:0 20px 18px;color:#e5e5e5}
footer.site{border-top:1px solid #262626;padding:32px 0 48px;color:var(--mut);font-size:.88rem}
footer.site nav{display:flex;flex-wrap:wrap;gap:8px 20px;margin-top:10px}
"""


APP_CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'ubb.css')).read().split('\n',1)[1].replace('\n','')

def page(lang):
    c = C[lang]
    url = BASE + c['path']
    other_url = BASE + c['other_path']
    og_img = BASE + '/assets/og-' + lang + '.png'
    robots = 'noindex, nofollow' if args.noindex else 'index, follow, max-image-preview:large'

    schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': c['title'], 'description': c['desc'],
             'inLanguage': 'el-GR' if lang == 'el' else 'en', 'isPartOf': {'@id': BASE + '/#website'},
             'about': {'@id': BASE + '/#app'}, 'primaryImageOfPage': og_img,
             'breadcrumb': {'@id': url + '#breadcrumb'}, 'dateModified': '2026-11-18'},
            {'@type': 'WebSite', '@id': BASE + '/#website', 'url': BASE + '/', 'name': 'Up Benefits Builder',
             'inLanguage': ['el-GR', 'en']},
            {'@type': 'WebApplication', '@id': BASE + '/#app', 'name': 'Up Benefits Builder', 'url': url,
             'applicationCategory': 'BusinessApplication', 'operatingSystem': 'Any (web browser)',
             'isAccessibleForFree': True, 'inLanguage': ['el-GR', 'en'], 'description': c['desc'],
             'about': [{'@type': 'Product', 'name': p[0], 'url': p[4],
                        'brand': {'@type': 'Brand', 'name': 'Up Hellas'}} for p in PRODUCTS[lang]],
             'creator': {'@type': 'Person', 'name': 'Giorgos Kosyfas', 'jobTitle': 'Graphic & Web Designer'}},
            {'@type': 'FAQPage', '@id': url + '#faq', 'inLanguage': 'el-GR' if lang == 'el' else 'en',
             'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in c['faq']]},
            {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': c['crumb_home'], 'item': url},
            ]},
        ],
    }

    gtm_head = gtm_body = ''
    if args.gtm:
        gtm_head = ("<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});"
                    "var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;"
                    "j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);"
                    "})(window,document,'script','dataLayer','%s');</script>" % args.gtm)
        gtm_body = ('<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=%s" height="0" width="0" '
                    'style="display:none;visibility:hidden"></iframe></noscript>' % args.gtm)

    cfg = json.dumps({'summaryEndpoint': args.summary, 'leadEndpoint': args.lead})
    needs = ''.join(
        '<article class="need" style="--c:%s"><h3>%s</h3><strong>%s</strong><p>%s</p><a href="%s" rel="noopener">%s →</a></article>'
        % (col, html.escape(n), html.escape(need), html.escape(d), u, c['learn']) for n, col, need, d, u in PRODUCTS[lang])
    how = ''.join('<li><h3>%s</h3><p>%s</p></li>' % (html.escape(a), html.escape(b)) for a, b in c['how'])
    faq = ''.join('<details><summary>%s</summary><p>%s</p></details>' % (html.escape(q), html.escape(a)) for q, a in c['faq'])
    ticks = ''.join('<li>%s</li>' % html.escape(b) for b in c['bullets'])
    links = ''.join('<a href="%s" rel="noopener">%s</a>' % (u, html.escape(t)) for t, u in c['foot_links'])

    return f"""<!DOCTYPE html>
<html lang="{'el' if lang == 'el' else 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(c['title'])}</title>
<meta name="description" content="{html.escape(c['desc'])}">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="el" href="{BASE}/">
<link rel="alternate" hreflang="en" href="{BASE}/en/">
<link rel="alternate" hreflang="x-default" href="{BASE}/">
<meta name="theme-color" content="#191919">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Up Benefits Builder">
<meta property="og:locale" content="{c['locale']}">
<meta property="og:locale:alternate" content="{'en_GB' if lang == 'el' else 'el_GR'}">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{html.escape(c['og_title'])}">
<meta property="og:description" content="{html.escape(c['desc'])}">
<meta property="og:image" content="{og_img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{html.escape(c['og_title'])}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{html.escape(c['og_title'])}">
<meta name="twitter:description" content="{html.escape(c['desc'])}">
<meta name="twitter:image" content="{og_img}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23ff8500'/%3E%3Cstop offset='1' stop-color='%239f51ae'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='32' cy='32' r='32' fill='url(%23g)'/%3E%3Ctext x='32' y='42' font-family='Arial' font-weight='700' font-size='26' text-anchor='middle' fill='white'%3EUp%3C/text%3E%3C/svg%3E">
<style>{CRITICAL_CSS.strip()}{APP_CSS}</style>
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
<script>window.dataLayer=window.dataLayer||[];window.UBB_CONFIG={cfg};</script>
{gtm_head}
</head>
<body>
{gtm_body}
<a class="skip" href="#tool">{c['skip']}</a>
<div class="strip" role="note">{c['strip']}</div>
<div class="wrap">
<header class="site">
  <a class="brand" href="{url}"><i aria-hidden="true">Up</i>Benefits Builder</a>
  <nav class="lang" aria-label="Language"><span aria-current="page">{'ΕΛ' if lang == 'el' else 'EN'}</span><a href="{other_url}" hreflang="{c['other']}" lang="{c['other']}">{c['other_label']}</a></nav>
</header>
<main>
<section class="hero">
  <div class="hero-copy">
    <span class="eyebrow">{c['eyebrow']}</span>
    <h1>{c['h1']}</h1>
    <p class="lead">{c['lead']}</p>
    <ul class="ticks">{ticks}</ul>
  </div>
  <div id="tool"><div id="ubb-root" data-lang="{lang}"><noscript><p>{c['noscript']}</p></noscript></div></div>
</section>
<section class="block" aria-labelledby="needs-h">
  <h2 id="needs-h">{c['needs_h']}</h2><p class="sub">{c['needs_p']}</p>
  <div class="needs">{needs}</div>
</section>
<section class="block" aria-labelledby="how-h">
  <h2 id="how-h">{c['how_h']}</h2>
  <ol class="steps">{how}</ol>
</section>
<section class="block faq" aria-labelledby="faq-h">
  <h2 id="faq-h">{c['faq_h']}</h2>
  {faq}
</section>
</main>
<footer class="site"><p>{c['foot']}</p><nav>{links}</nav></footer>
</div>
<style>{REST_CSS.strip()}</style>
<script src="{'../' if lang == 'en' else ''}assets/ubb.js" defer></script>
</body>
</html>
"""


os.makedirs('en', exist_ok=True)
with open('index.html', 'w') as f:
    f.write(page('el'))
with open('en/index.html', 'w') as f:
    f.write(page('en'))
with open('robots.txt', 'w') as f:
    f.write('User-agent: *\n%s\nSitemap: %s/sitemap.xml\n' % ('Disallow: /' if args.noindex else 'Allow: /', BASE))
with open('sitemap.xml', 'w') as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n')
    for p in ('/', '/en/'):
        f.write('  <url><loc>%s%s</loc><lastmod>2026-11-18</lastmod>'
                '<xhtml:link rel="alternate" hreflang="el" href="%s/"/><xhtml:link rel="alternate" hreflang="en" href="%s/en/"/></url>\n' % (BASE, p, BASE, BASE))
    f.write('</urlset>\n')
with open('.nojekyll', 'w') as f:
    f.write('')
print('built', BASE)
