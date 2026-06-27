// ESKYNA / EStyle PWA Konfiguration
// Nutzt denselben Analysedienst wie https://eskyna.com/estylepwa/.
window.ESKYNA_CONFIG = {
  apiEndpoint: "https://api.eskyna-style.workers.dev/v1/images",
  // Auf true setzen, wenn die UI ohne Backend mit sample-api-response.json getestet werden soll.
  demoMode: false,
  uploadMode: "binary",
  contentType: "application/octet-stream",
  credentials: "same-origin",
  maxUploadWidth: 1600,
  jpegQuality: 0.88,
  timeoutMs: 45000,
};
