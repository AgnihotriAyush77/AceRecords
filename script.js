/* Ace Records asset loader — decompresses the original CSS and application JS. */
(async function loadAceRecordsAssets() {
  const base = new URL(".", document.baseURI);
  async function readGzip(path) {
    if (!("DecompressionStream" in window)) {
      throw new Error("This browser does not support gzip asset decoding. Please use a recent version of Chrome, Edge, Firefox or Safari.");
    }
    const response = await fetch(new URL(path, base), { cache: "no-cache" });
    if (!response.ok) throw new Error("Could not load " + path + " (" + response.status + ").");
    const decoded = response.body.pipeThrough(new DecompressionStream("gzip"));
    return await new Response(decoded).text();
  }
  try {
    const [css, source] = await Promise.all([
      readGzip("style.bundle.css.gz"),
      readGzip("app.bundle.js.gz")
    ]);
    const style = document.createElement("style");
    style.id = "ace-records-theme";
    style.textContent = css;
    document.head.appendChild(style);

    const patchedSource = source.replace(
      "document.addEventListener('DOMContentLoaded', initialise);",
      "initialise();"
    );
    if (patchedSource === source) throw new Error("Application initialization hook was not found.");
    const script = document.createElement("script");
    script.text = patchedSource;
    document.body.appendChild(script);
  } catch (error) {
    console.error("Ace Records could not start:", error);
    const message = document.createElement("div");
    message.className = "asset-error";
    message.textContent = "Ace Records could not load its app files. Please refresh the page or try a modern browser. " + error.message;
    document.body.appendChild(message);
  }
})();