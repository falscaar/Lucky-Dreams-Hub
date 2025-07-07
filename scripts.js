const SCRIPTS = [
  {
    name: "CodeInputAutoadjust",
    url: "https://raw.githubusercontent.com/falscaar/Lucky-Dreams-Hub/main/CodeInputAutoadjust.user.js",
    enabled: true
  },
  {
    name: "Highlight-Allow-Duplicates-false",
    url: "https://raw.githubusercontent.com/falscaar/Lucky-Dreams-Hub/main/Highlight-Allow-Duplicates-false.user.js",
    enabled: true
  },
  {
    name: "Highlighted-Rows",
    url: "https://raw.githubusercontent.com/falscaar/Lucky-Dreams-Hub/main/Highlighted-Rows.user.js",
    enabled: true
  },
  {
    name: "Internal-ID-Constructor",
    url: "https://raw.githubusercontent.com/falscaar/Lucky-Dreams-Hub/main/Internal-ID-Constructor.user.js",
    enabled: true
  },
  {
    name: "RetInputAutofill",
    url: "https://raw.githubusercontent.com/falscaar/Lucky-Dreams-Hub/main/RetInputAutofill.user.js",
    enabled: true
  },
  {
    name: "Retention-DSL-Checker",
    url: "https://raw.githubusercontent.com/falscaar/Lucky-Dreams-Hub/main/Retention-DSL-Checker.user.js",
    enabled: true
  },
  {
    name: "VIP Group Manual checker - TEST",
    url: "https://raw.githubusercontent.com/falscaar/Lucky-Dreams-Hub/main/VIP%20Group%20Manual%20checker%20-%20TEST.user.js",
    enabled: true
  },
  {
    name: "labels_highlighted",
    url: "https://raw.githubusercontent.com/falscaar/Lucky-Dreams-Hub/main/labels_highlighted.user.js",
    enabled: true
  }
];

// для динамической загрузки 
function loadEnabledScripts() {
  for (const script of SCRIPTS) {
    if (script.enabled) {
      const s = document.createElement('script');
      s.src = script.url;
      s.type = 'text/javascript';
      document.head.appendChild(s);
    }
  }
}
