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

  document.addEventListener("DOMContentLoaded", bindLanguageLinks);
})();
