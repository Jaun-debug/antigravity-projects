const username = 'JAUN';
const password = '1tvN 7Pga R9Q8 Qgvw xhAN Fgzz';
const base64Auth = Buffer.from(username + ':' + password).toString('base64');

async function test() {
    const res = await fetch('https://desert-tracks.com/wp-json/wp/v2/pages/7655');
    const data = await res.json();
    console.log("TITLE:", data.title.rendered);
    console.log("CONTENT:", data.content.rendered.substring(0, 500));
}
test();
