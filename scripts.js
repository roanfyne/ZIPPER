document.getElementById('downloadForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const websiteUrl = document.getElementById('websiteUrl').value;
    const zip = new JSZip();
    const urlsToFetch = new Set();

    async function fetchAndAddToZip(url, path) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType.includes("text") || contentType.includes("json")) {
                    const text = await response.text();
                    zip.file(path, text);
                    if (contentType.includes("html")) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(text, 'text/html');
                        const links = doc.querySelectorAll('a[href], link[href], script[src], img[src], video[src], audio[src]');
                        links.forEach(link => {
                            const href = link.getAttribute('href') || link.getAttribute('src');
                            if (href && !urlsToFetch.has(href)) {
                                urlsToFetch.add(new URL(href, url).href);
                            }
                        });
                    }
                } else {
                    const blob = await response.blob();
                    zip.file(path, blob);
                }
            }
        } catch (error) {
            console.error(`Failed to fetch ${url}: ${error}`);
        }
    }

    async function processUrls() {
        for (const url of urlsToFetch) {
            const urlObj = new URL(url);
            let path = urlObj.pathname;
            if (path.endsWith('/')) {
                path += 'index.html';
            }
            await fetchAndAddToZip(url, path);
        }
    }

    await fetchAndAddToZip(websiteUrl, 'index.html');
    urlsToFetch.delete(websiteUrl);

    await processUrls();

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "website.zip";
    link.textContent = "Download ZIP file";
    document.getElementById('downloadLink').appendChild(link);
});
