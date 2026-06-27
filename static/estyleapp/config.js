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

  auth: {
    enabled: true,
    required: true,
    provider: "firebase",
    firebaseSdkVersion: "10.12.4",
    allowedProviders: ["google"],
    redirectAfterLogin: "create",

    // Optional: auf true setzen, wenn der Analyse-Worker Firebase ID Tokens pruefen soll.
    // Achtung: Dann muss die API CORS fuer den Authorization Header erlauben.
    attachIdTokenToAnalysisRequest: false,

    // Firebase Web App Konfiguration hier eintragen.
    // In Firebase Authentication vorerst nur Google aktivieren; Email/Password deaktiviert lassen.
    firebaseConfig: {
      apiKey: "AIzaSyBLnOeqtIgBUObt5S4G9vImavaeS0lua1E",
      authDomain: "eskyna-style.firebaseapp.com",
      projectId: "eskyna-style",
      storageBucket: "eskyna-style.firebasestorage.app",
      messagingSenderId: "349179931593",
      appId: "1:349179931593:web:332b9c02eaee3e8e525618",
      measurementId: "G-ERP45XHEG9",
    },
  },
};
