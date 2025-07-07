const SCRIPTS = [
  {
    name: "Codes Autoadjuster",
    url: "https://github.com/falscaar/Lucky-Dreams-Hub/raw/refs/heads/main/CodeInputAutoadjust.user.js",
    enabled: true
  },
  {
    name: "Highlight "AllowDuplicates: false",
    url: "https://github.com/falscaar/Lucky-Dreams-Hub/raw/refs/heads/main/Highlight-Allow-Duplicates-false.user.js",
    enabled: true
  },
  {
    name: "HighlightedRows (Restricted Countries checking)",
    url: "https://github.com/falscaar/Lucky-Dreams-Hub/raw/refs/heads/main/Highlighted-Rows.user.js",
    enabled: true
  },
  {
    name: "Internal_ID Constructor",
    url: "https://github.com/falscaar/Lucky-Dreams-Hub/raw/refs/heads/main/Internal-ID-Constructor.user.js",
    enabled: true
  },
  {
    name: "Currency input auto-filler",
    url: "https://github.com/falscaar/Lucky-Dreams-Hub/raw/refs/heads/main/RetInputAutofill.user.js",
    enabled: true
  },
  {
    name: "DSL Validator (Ret)",
    url: "https://github.com/falscaar/Lucky-Dreams-Hub/raw/refs/heads/main/Retention-DSL-Checker.user.js",
    enabled: true
  },
  {
    name: "VIP Group Manual checker - (only for TEST)",
    url: "https://github.com/falscaar/Lucky-Dreams-Hub/raw/refs/heads/main/VIP%20Group%20Manual%20checker%20-%20TEST.user.js",
    enabled: false
  },
  {
    name: "Highlighted Labels section for Jira",
    url: "https://github.com/falscaar/Lucky-Dreams-Hub/raw/refs/heads/main/labels_highlighted.user.js",
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
