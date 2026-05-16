(function () {
  var key = "eskynaPreferredLanguage";

  function getStoredLanguage() {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function setStoredLanguage(lang) {
    try {
      window.localStorage.setItem(key, lang);
    } catch (err) {
      // Ignore storage errors (private mode, blocked storage, etc.)
    }
  }

  function detectBrowserLanguage() {
    var langs = [];
    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
      langs = navigator.languages;
    } else if (navigator.language) {
      langs = [navigator.language];
    }

    for (var i = 0; i < langs.length; i += 1) {
      if (String(langs[i]).toLowerCase().indexOf("ru") === 0) {
        return "ru";
      }
    }

    return "de";
  }

  function applyAutoRedirect() {
    var path = window.location.pathname;
    var isRoot = path === "/" || path === "/index.html";

    if (!isRoot) {
      return;
    }

    var preferred = getStoredLanguage() || detectBrowserLanguage();

    if (preferred === "ru") {
      window.location.replace("/ru/");
    }
  }

  function bindLanguageLinks() {
    var links = document.querySelectorAll(".language-link[data-lang]");
    for (var i = 0; i < links.length; i += 1) {
      links[i].addEventListener("click", function (event) {
        var lang = event.currentTarget.getAttribute("data-lang");
        if (lang) {
          setStoredLanguage(lang);
        }
      });
    }
  }

  applyAutoRedirect();
  document.addEventListener("DOMContentLoaded", bindLanguageLinks);
})();
