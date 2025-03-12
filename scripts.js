document.getElementById('downloadForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const websiteUrl = document.getElementById('websiteUrl').value;
    const response = await fetch(websiteUrl);
    const htmlContent = await response.text();

    const zip = new JSZip();
    zip.file("index.html", htmlContent);

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "website.zip";
    link.textContent = "Download ZIP file";
    document.getElementById('downloadLink').appendChild(link);
});