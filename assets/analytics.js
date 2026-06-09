(function () {
  const ARTICLE_CONTEXT_SELECTOR = "[data-tgr-feedback]";
  const fired = new Set();

  function articleContext() {
    const source = document.querySelector(ARTICLE_CONTEXT_SELECTOR);
    if (!source) return {};
    return {
      article_slug: source.dataset.articleSlug || "",
      article_title: source.dataset.articleTitle || "",
      article_url: source.dataset.articleUrl || "",
      edition_date: source.dataset.editionDate || "",
      lane: source.dataset.lane || "",
      tags: source.dataset.tags || "",
      repos: source.dataset.repos || "",
      primary_tag: (source.dataset.tags || "").split(",").filter(Boolean)[0] || "",
      primary_repo: (source.dataset.repos || "").split(",").filter(Boolean)[0] || "",
    };
  }

  function track(name, params) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", name, {
      page_path: window.location.pathname,
      ...articleContext(),
      ...params,
    });
  }

  function trackOnce(name, params) {
    if (fired.has(name)) return;
    fired.add(name);
    track(name, params);
  }

  function classifyLink(link) {
    const rawHref = link.getAttribute("href") || "";
    if (!rawHref) return "";

    let url;
    try {
      url = new URL(rawHref, window.location.href);
    } catch {
      return "";
    }

    const sameOrigin = url.origin === window.location.origin;
    if (/^https:\/\/x\.com\/thegitreporter\/?$/i.test(url.href)) return "x_follow_click";
    if (sameOrigin && url.pathname === "/feed.xml") return "rss_click";
    if (sameOrigin && url.pathname === "/archive/") return "archive_click";
    if (sameOrigin && /^\/editions\/\d{4}-\d{2}-\d{2}\/$/.test(url.pathname)) return "edition_click";
    if (url.hash === "#evidence") return "evidence_click";

    const isOutbound = !sameOrigin && !/^mailto:/i.test(rawHref);
    const sourceLike = isOutbound || /github\.com|gitlab\.com|docs\.|developer\.|blog\./i.test(url.hostname);
    if (sourceLike) return "source_click";

    return "";
  }

  function bindClickTracking() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest ? event.target.closest("a[href]") : null;
      if (!link) return;
      const eventName = classifyLink(link);
      if (!eventName) return;
      track(eventName, {
        link_url: link.href,
        link_text: String(link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
      });
    });
  }

  function bindEngagementTracking() {
    if (!document.querySelector(ARTICLE_CONTEXT_SELECTOR)) return;

    window.setTimeout(() => {
      trackOnce("article_engaged_45s", { engagement_seconds: "45" });
    }, 45000);

    const onScroll = () => {
      const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      const viewportBottom = window.scrollY + window.innerHeight;
      if (documentHeight <= 0) return;
      if (viewportBottom / documentHeight >= 0.75) {
        trackOnce("article_read_75", { scroll_depth: "75" });
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  window.addEventListener("DOMContentLoaded", () => {
    bindClickTracking();
    bindEngagementTracking();
  });
})();
