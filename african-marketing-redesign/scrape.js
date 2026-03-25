const https = require('https');

https.get('https://www.african-marketing.com/products/beverages', (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    const urls = data.match(/https:\/\/(assets\.3\.commercebuild\.com|afmar\.eu\.xmsymphony\.com)[^"']+\.(png|jpg|jpeg|webp)/gi);
    if (urls) {
      console.log(Array.from(new Set(urls)).slice(0, 15).join('\n'));
    } else {
      console.log('No image URLs found');
    }
  });
});
