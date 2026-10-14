import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const output = 'reports/visual/expansion';
await mkdir(output, { recursive: true });
const artifact = JSON.parse(await readFile('reports/export.json', 'utf8'));
const browser = await chromium.launch();
const report = { capturedAt: new Date().toISOString(), artifactSha256: artifact.artifactSha256, browser: browser.version(), views: [] };
try {
  for (const [name,width,height] of [['desktop',1440,900],['mobile',390,844],['small',320,568],['tablet',768,960]]) {
    const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:4173'); await page.evaluate(()=>document.fonts.ready);
    const exp=page.locator('#experience');
    await exp.getByRole('radio',{name:'Translation',exact:true}).check();
    await exp.getByRole('button',{name:'Translate the chalkboard'}).click();
    await exp.getByRole('status').filter({hasText:'pommes means apples'}).waitFor();
    for(const [part,selector] of [['translation','#experience figure'],['translation-context','#experience h3'],['hardware','#hardware'],['configurator','#configure'],['closing','section[aria-labelledby="closing-title"]']]) {
      await page.locator(selector).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
      await page.waitForTimeout(850);
      await page.evaluate(()=>{ if(document.activeElement instanceof HTMLElement)document.activeElement.blur(); });
      await page.screenshot({path:`${output}/${name}-${part}.png`});
    }
    report.views.push({name,width,height,errors,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
    await page.close();
  }
} finally { await browser.close(); }
await writeFile(`${output}/capture.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
