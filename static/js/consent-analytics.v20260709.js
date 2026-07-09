(function () {
  var CONSENT_KEY = "eskynaConsentV1";
  var banner = document.querySelector("[data-cookie-banner]");
  if (!banner) return;

  var settingsPanel = banner.querySelector("[data-cookie-settings]");
  var analyticsToggle = banner.querySelector("[data-cookie-analytics-toggle]");
  var acceptAllBtn = banner.querySelector("[data-cookie-accept-all]");
  var rejectAllBtn = banner.querySelector("[data-cookie-reject-all]");
  var openSettingsBtn = banner.querySelector("[data-cookie-open-settings]");
  var saveSettingsBtn = banner.querySelector("[data-cookie-save-settings]");
  var resetConsentBtn = banner.querySelector("[data-cookie-reset-consent]");
  var openSettingsLinks = document.querySelectorAll("[data-cookie-settings-open]");

  function parseStoredConsent() {
    try {
      var raw = window.localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return {
        necessary: true,
        analytics: !!parsed.analytics,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      return null;
    }
  }

  function storeConsent(consent) {
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch (error) {
      // Ignore storage errors and continue with current in-memory state.
    }
  }

  function clearStoredConsent() {
    try {
      window.localStorage.removeItem(CONSENT_KEY);
    } catch (error) {
      // Ignore storage errors and continue with current in-memory state.
    }
  }

  function setSettingsOpen(isOpen) {
    if (!settingsPanel) return;
    settingsPanel.hidden = !isOpen;
  }

  function showBanner() {
    banner.hidden = false;
  }

  function hideBanner() {
    banner.hidden = true;
    setSettingsOpen(false);
  }

  function updateConsentMode(analyticsGranted) {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: analyticsGranted ? "granted" : "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }
  }

  function applyConsent(consent) {
    document.documentElement.setAttribute(
      "data-analytics-consent",
      consent.analytics ? "granted" : "denied"
    );
    updateConsentMode(consent.analytics);

    if (consent.analytics && typeof window.eskynaLoadAnalytics === "function") {
      window.eskynaLoadAnalytics();
    }

    window.dispatchEvent(new CustomEvent("eskyna:consent-changed", { detail: consent }));
  }

  function saveConsent(analyticsGranted) {
    var consent = {
      necessary: true,
      analytics: !!analyticsGranted,
      updatedAt: new Date().toISOString(),
    };
    storeConsent(consent);
    applyConsent(consent);
    hideBanner();
  }

  function resetConsent() {
    clearStoredConsent();
    if (analyticsToggle) {
      analyticsToggle.checked = false;
    }
    applyConsent({ necessary: true, analytics: false, updatedAt: new Date().toISOString() });
    showBanner();
    setSettingsOpen(true);
  }

  function hasAnalyticsConsent() {
    return document.documentElement.getAttribute("data-analytics-consent") === "granted";
  }

  window.eskynaTracking = window.eskynaTracking || {
    trackEvent: function (eventName, payload) {
      if (!hasAnalyticsConsent()) return;
      if (!eventName) return;
      window.dataLayer = window.dataLayer || [];
      var eventPayload = payload && typeof payload === "object" ? payload : {};
      eventPayload.event = eventName;
      window.dataLayer.push(eventPayload);
    },
  };

  window.eskynaConsent = window.eskynaConsent || {
    reset: resetConsent,
  };

  function bindButtons() {
    if (acceptAllBtn) {
      acceptAllBtn.addEventListener("click", function () {
        saveConsent(true);
      });
    }

    if (rejectAllBtn) {
      rejectAllBtn.addEventListener("click", function () {
        saveConsent(false);
      });
    }

    if (openSettingsBtn) {
      openSettingsBtn.addEventListener("click", function () {
        setSettingsOpen(true);
      });
    }

    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", function () {
        saveConsent(analyticsToggle ? analyticsToggle.checked : false);
      });
    }

    if (resetConsentBtn) {
      resetConsentBtn.addEventListener("click", function () {
        resetConsent();
      });
    }

    for (var i = 0; i < openSettingsLinks.length; i += 1) {
      openSettingsLinks[i].addEventListener("click", function () {
        showBanner();
        setSettingsOpen(true);
      });
    }
  }

  function bindTrackingHooks() {
    document.addEventListener("eskyna:lead", function (event) {
      var leadType = "contact_form";
      if (event && event.detail && event.detail.lead_type) {
        leadType = event.detail.lead_type;
      }
      window.eskynaTracking.trackEvent("generate_lead", { lead_type: leadType });
    });

    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;
      var anchor = target.closest("a[href]");
      if (!anchor) return;
      var href = anchor.getAttribute("href") || "";

      if (href.indexOf("calendar.app.google") !== -1) {
        window.eskynaTracking.trackEvent("click_book_consultation", {
          location: window.location.pathname,
        });
      }

      if (href.indexOf("t.me/") !== -1 || href.indexOf("telegram.me/") !== -1) {
        window.eskynaTracking.trackEvent("click_telegram_bot", {
          location: window.location.pathname,
        });
      }

      if (/\.pdf(?:$|\?)/i.test(href)) {
        window.eskynaTracking.trackEvent("file_download", {
          file_path: href,
          location: window.location.pathname,
        });
      }

      if (href.indexOf("/stilfrage/") !== -1) {
        window.eskynaTracking.trackEvent("ask_style_question", {
          location: window.location.pathname,
        });
      }
    });
  }

  function init() {
    var stored = parseStoredConsent();
    bindButtons();
    bindTrackingHooks();

    if (stored) {
      if (analyticsToggle) {
        analyticsToggle.checked = !!stored.analytics;
      }
      applyConsent(stored);
      hideBanner();
      return;
    }

    if (analyticsToggle) {
      analyticsToggle.checked = false;
    }
    showBanner();
    setSettingsOpen(false);
    applyConsent({ necessary: true, analytics: false, updatedAt: new Date().toISOString() });
  }

  init();
})();
