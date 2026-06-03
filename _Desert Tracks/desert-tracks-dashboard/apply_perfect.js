const fs = require('fs');
const path = require('path');

const username = 'JAUN';
const password = '1tvN 7Pga R9Q8 Qgvw xhAN Fgzz';
const base64Auth = Buffer.from(username + ':' + password).toString('base64');

const monthsData = [
    { name: 'january', id: 7637 },
    { name: 'february', id: 7643 },
    { name: 'march', id: 7650 },
    { name: 'april', id: 7655 },
    { name: 'may', id: 7659 },
    { name: 'june', id: 7666 },
    { name: 'july', id: 7671 },
    { name: 'august', id: 7676 },
    { name: 'september', id: 7680 },
    { name: 'october', id: 7685 },
    { name: 'november', id: 7690 },
    { name: 'december', id: 7696 }
];

const mediaPool = JSON.parse(fs.readFileSync('media_pool.json', 'utf8'));

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}
shuffle(mediaPool);

let imageIndex = 0;

const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
    for (const month of monthsData) {
        console.log(`\nProcessing: ${month.name.toUpperCase()}`);
        
        let textContent = fs.readFileSync(path.join(__dirname, `${month.name}_text.txt`), 'utf8');

        const pageRes = await fetch(`https://desert-tracks.com/wp-json/wp/v2/pages/${month.id}`, { headers: { 'Authorization': 'Basic ' + base64Auth } });
        const pageData = await pageRes.json();
        let originalTitle = pageData.title.rendered || `What is the weather like during ${month.name.charAt(0).toUpperCase() + month.name.slice(1)} in Namibia`;
        
        if (originalTitle.toLowerCase().includes('augustus')) originalTitle = 'What is the weather like during August in Namibia';
        
        const header_url = mediaPool[imageIndex++ % mediaPool.length];
        const pic1_url = mediaPool[imageIndex++ % mediaPool.length];
        const pic2_url = mediaPool[imageIndex++ % mediaPool.length];
        const pic3_url = mediaPool[imageIndex++ % mediaPool.length];
        
        let h2Count = 0;
        let processedText = textContent.replace(/<h2\b/gi, (match) => {
            h2Count++;
            if (h2Count === 2) {
                return `\n<div class="image-gallery">\n<img decoding="async" src="${pic1_url}" alt="Namibia Safari View" style="border-radius:8px;" />\n</div>\n\n<h2`;
            } else if (h2Count === 4) {
                return `\n<div class="image-gallery">\n<img decoding="async" src="${pic2_url}" alt="Namibia Wildlife Experience" style="border-radius:8px;" />\n</div>\n\n<h2`;
            } else if (h2Count === 6) {
                return `\n<div class="image-gallery">\n<img decoding="async" src="${pic3_url}" alt="Namibia Scenic Photography" style="border-radius:8px;" />\n</div>\n\n<h2`;
            }
            return match;
        });

        let firstH2Index = processedText.toLowerCase().indexOf('<h2');
        if (firstH2Index === -1) firstH2Index = processedText.length;
        let pRegex = /<p\b([^>]*)>/i;
        let pMatch = pRegex.exec(processedText.substring(0, firstH2Index));
        if (pMatch) {
            let replacedDrop = false;
            processedText = processedText.replace(pRegex, (m, p1) => {
                if (replacedDrop) return m;
                replacedDrop = true;
                return `<p class="has-drop-cap has-link-color wp-elements-aef59e7a83dabbdadd4eab537877227d"${p1}>`;
            });
        }

const templateTop = `<style>html,body{overflow-x:hidden!important}.site-content,#content,.ast-container,.site-main,.page-content{padding-top:0!important;margin-top:0!important}.u-section-1,.u-section-3,.u-post-header,.u-metadata,.u-post-details-1 h2.u-text-1,.post-background-image-1{display:none!important;opacity:0!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;visibility:hidden!important}.u-section-2{padding-top:0!important;margin-top:0!important;max-width:100%!important}.u-text-2{padding:0!important;margin:0!important;max-width:100%!important}.dt-blog-wrapper{font-family:'Open Sans',sans-serif;background-color:#fcfaf8;color:#4b5563;line-height:1.8;width:100vw!important;position:relative!important;left:50%!important;right:50%!important;margin-left:-50vw!important;margin-right:-50vw!important;max-width:100vw!important;margin-top:-130px!important}.dt-blog-hero{position:relative;width:100%;height:55vh;min-height:400px;background-size:cover;background-position:center;background-repeat:no-repeat}.dt-blog-title-card{position:relative;max-width:900px;margin:-100px auto 60px auto;background:#ffffff;padding:5rem 4rem;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.05);z-index:10;border:1px solid #f3f0ea}.dt-blog-kicker{font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.3em;color:#d87a4d;margin-bottom:24px;display:block}.dt-blog-title{font-family:'Playfair Display',serif!important;font-size:3.5rem;color:#5a554a;line-height:1.15;margin:0;font-weight:400}.dt-blog-content{max-width:780px;margin:0 auto;padding:0 20px 100px 20px;font-size:1.15rem;color:#5a554a}.dt-blog-content > p:first-of-type::first-letter{float:left;font-size:5.5rem;line-height:0.8;padding-top:10px;padding-right:15px;font-family:'Playfair Display',serif;color:#d87a4d}.dt-blog-content p{margin-bottom:2rem}.dt-blog-content h2,.dt-blog-content h3{font-family:'Playfair Display',serif!important;font-size:2.4rem;color:#2c2825;margin-top:4rem;margin-bottom:1.5rem;line-height:1.2;font-weight:400}.dt-blog-content ul{list-style-type:none;padding-left:0;margin-bottom:2rem}.dt-blog-content ul li{position:relative;padding-left:30px;margin-bottom:15px}.dt-blog-content ul li::before{content:"•";color:#d87a4d;position:absolute;left:0;font-size:1.8rem;top:-8px}.dt-side-tab{position:fixed;right:0;bottom:150px;background-color:#5a554a;color:#ffffff;padding:12px 24px;border-top-left-radius:30px;border-bottom-left-radius:30px;font-family:'Open Sans',sans-serif;font-weight:600;font-size:0.9rem;letter-spacing:0.05em;text-decoration:none;box-shadow:-5px 5px 15px rgba(0,0,0,0.15);z-index:100;transition:transform 0.3s,background-color 0.3s}.dt-side-tab:hover{transform:translateX(-5px);background-color:#d87a4d;color:#ffffff}@media (max-width:768px){.dt-blog-title-card{margin:-60px 20px 40px 20px;padding:3rem 2rem}.dt-blog-title{font-size:2.2rem}.dt-blog-hero{height:45vh}}.entry-header,.page-header,.post-header,h1.entry-title,.theme-page-title,.title-wrapper{display:none!important}</style>
<p>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&#038;family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&#038;display=swap" rel="stylesheet">
<br />
<script src="https://unpkg.com/@phosphor-icons/web"></script></p>
<div class="dt-blog-wrapper">
<div class="dt-blog-hero" style="background-image: url('${header_url}');"></div>
<div class="dt-blog-title-card">
<h1 class="dt-blog-title">${originalTitle}</h1>
</div>
<div class="dt-blog-content">\n\n`;

        const templateBottom = `\n\n</div>\n<p>    <a href="javascript:void(0);" class="dt-side-tab enquiry-trigger">Start Your Journey</a>\n</div>`;

        const newHtml = templateTop + processedText + templateBottom;

        const updateRes = await fetch(`https://desert-tracks.com/wp-json/wp/v2/pages/${month.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Basic ' + base64Auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: newHtml })
        });

        if(!updateRes.ok) throw new Error(updateRes.statusText);
        console.log(`Success! Updated ${month.name}`);
        
        await delay(1000);
    }
    console.log("All finished applying Kalahari-style layout to 12 months!");
}

main().catch(console.error);
