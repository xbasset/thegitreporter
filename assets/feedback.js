(function () {
  const EVENT_NAME = "TGR Article Feedback";
  const LOG_KEY = "tgr.readerFeedback";

  function cleanComment(value) {
    return String(value || "")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
      .replace(/https?:\/\/\S+/gi, "[link]")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 300);
  }

  function readLocalLog() {
    try {
      const value = window.localStorage.getItem(LOG_KEY);
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  }

  function writeLocalLog(record) {
    try {
      const next = readLocalLog().concat(record).slice(-100);
      window.localStorage.setItem(LOG_KEY, JSON.stringify(next));
    } catch {
      // Local storage is a convenience cache; Plausible is the primary signal.
    }
  }

  function eventProps(root, vote, comment) {
    const tags = root.dataset.tags || "";
    const repos = root.dataset.repos || "";
    return {
      article_slug: root.dataset.articleSlug || "",
      article_title: root.dataset.articleTitle || "",
      article_url: root.dataset.articleUrl || "",
      edition_date: root.dataset.editionDate || "",
      lane: root.dataset.lane || "",
      vote,
      tags,
      repos,
      primary_tag: tags.split(",").filter(Boolean)[0] || "",
      primary_repo: repos.split(",").filter(Boolean)[0] || "",
      has_comment: comment ? "true" : "false",
      comment_length: String(comment.length),
      comment,
    };
  }

  function setStatus(root, text) {
    const status = root.querySelector(".feedback-status");
    if (status) status.textContent = text;
  }

  function bindFeedback(root) {
    const form = root.querySelector(".feedback-form");
    const textarea = root.querySelector("textarea[name='comment']");
    const choices = Array.from(root.querySelectorAll("[data-vote]"));
    let vote = "";

    choices.forEach((button) => {
      button.addEventListener("click", () => {
        vote = button.dataset.vote || "";
        choices.forEach((item) => {
          const selected = item === button;
          item.classList.toggle("selected", selected);
          item.setAttribute("aria-pressed", selected ? "true" : "false");
        });
      });
    });

    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const comment = cleanComment(textarea ? textarea.value : "");
      if (!vote && !comment) {
        setStatus(root, "Choose a signal type or leave a note.");
        return;
      }

      const props = eventProps(root, vote || "comment", comment);
      const record = {
        ...props,
        created_at: new Date().toISOString(),
        source: "site",
      };

      writeLocalLog(record);

      if (typeof window.plausible === "function") {
        window.plausible(EVENT_NAME, { props });
        setStatus(root, "Sent to the desk.");
      } else {
        setStatus(root, "Signal saved locally.");
      }
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-tgr-feedback]").forEach(bindFeedback);
  });
})();
