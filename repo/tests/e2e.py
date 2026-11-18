import asyncio, json, sys, http.server, threading, functools
from playwright.async_api import async_playwright
PORT=8765
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    h=functools.partial(Q, directory=".")
    http.server.ThreadingHTTPServer(('127.0.0.1',PORT),lambda *a: h(*a)).serve_forever()
threading.Thread(target=serve,daemon=True).start()
import logging
async def run(lang, mobile, shots):
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        ctx=await b.new_context(viewport={'width':390,'height':844} if mobile else {'width':1366,'height':900}, device_scale_factor=1, is_mobile=mobile, has_touch=mobile)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: m.type=='error' and errs.append(m.text))
        await pg.goto(f'http://127.0.0.1:{PORT}/'+('en/' if lang=='en' else ''))
        tag=f'{lang}-{"m" if mobile else "d"}'
        await pg.screenshot(path=f'tests/{tag}-0.png', full_page=False)
        # step1 size: single -> autoadvance
        await pg.click('label[for="ubb-size-50249"]'); await pg.wait_for_timeout(500)
        await pg.click('label[for="ubb-industry-tech"]'); await pg.wait_for_timeout(500)
        await pg.click('label[for="ubb-work_model-hybrid"]'); await pg.wait_for_timeout(500)
        # goals multi: try 3 to test max
        await pg.click('label[for="ubb-goals-retention"]'); await pg.click('label[for="ubb-goals-wellbeing"]'); await pg.click('label[for="ubb-goals-tax"]')
        err=await pg.inner_text('.ubb-error'); 
        if shots: await pg.screenshot(path=f'tests/{tag}-goals.png')
        await pg.click('button[type=submit]'); await pg.wait_for_timeout(300)
        # current: none exclusive test
        await pg.click('label[for="ubb-current-meal"]'); await pg.click('label[for="ubb-current-none"]'); await pg.click('label[for="ubb-current-meal"]')
        cur=await pg.eval_on_selector_all('input[name=current]:checked','els=>els.map(e=>e.value)')
        await pg.click('button[type=submit]'); await pg.wait_for_timeout(300)
        # spend: submit empty to test validation
        await pg.click('button[type=submit]'); await pg.wait_for_timeout(200); verr=await pg.inner_text('.ubb-error')
        await pg.click('label[for="ubb-spend-travel"]'); await pg.click('button[type=submit]'); await pg.wait_for_timeout(300)
        # back test then forward
        await pg.click('[data-act=back]'); await pg.wait_for_timeout(200); q=await pg.inner_text('.ubb-q'); await pg.click('button[type=submit]'); await pg.wait_for_timeout(300)
        await pg.click('label[for="ubb-budget-100200"]'); await pg.wait_for_timeout(700)
        await pg.screenshot(path=f'tests/{tag}-gate.png', full_page=True)
        await pg.fill('#ubb-f-name','Μαρία Δοκιμή'); await pg.fill('#ubb-f-email','maria@gmail.com'); await pg.wait_for_timeout(100)
        hint=await pg.is_visible('#ubb-email-hint')
        await pg.fill('#ubb-f-company','Demo AE'); await pg.fill('#ubb-f-phone','6912345678')
        await pg.click('.ubb-gate button[type=submit]'); await pg.wait_for_timeout(200); cerr=await pg.inner_text('[data-err=consent]')
        await pg.check('input[name=consent]'); await pg.click('.ubb-gate button[type=submit]'); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'tests/{tag}-results.png', full_page=True)
        dl=await pg.evaluate('dataLayer.filter(e=>e.event && !e.event.startsWith("gtm")).map(e=>e.event+(e.step_number?":"+e.step_number:""))')
        summ=await pg.inner_text('.ubb-summary-text')
        await b.close()
        return dict(tag=tag, maxerr=err, current=cur, validation=verr, back_q=q, freehint=hint, consent_err=cerr, dl=dl, summary=summ, errors=errs)
async def main():
    for lang in ('el','en'):
        for m in (True,False):
            r=await run(lang,m, True); print(json.dumps(r,ensure_ascii=False,indent=1))
asyncio.run(main())
