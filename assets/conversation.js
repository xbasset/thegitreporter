(function () {
  const FOCUS_COPY = {
    explore: "Go beyond the summary and help me understand the mechanism, tradeoffs, and wider consequence.",
    challenge: "Stress-test the article’s central claim. Look for counterexamples, alternative explanations, and evidence that would change the conclusion.",
    apply: "Turn this reporting into practical checks: what should a builder, maintainer, or operator test, change, or watch next?",
  };

  function countLabel(count, singular, plural) {
    const value = Number(count) || 0;
    return `${value} ${value === 1 ? singular : plural}`;
  }

  function evidenceLinks(root) {
    try {
      const links = JSON.parse(root.dataset.aiEvidenceLinks || "[]");
      return Array.isArray(links) ? links.filter((link) => link && link.url).slice(0, 6) : [];
    } catch {
      return [];
    }
  }

  function buildPrompt(root, focus) {
    const repos = root.dataset.aiRepos || "See the article source trail";
    const focusCopy = FOCUS_COPY[focus] || FOCUS_COPY.explore;
    const links = evidenceLinks(root);
    const directEvidence = links.length
      ? `\nPrimary evidence links:\n${links.map((link) => `- ${link.label || "Source"}: ${link.url}`).join("\n")}`
      : "";
    return `I’m continuing a conversation about this reported software change.

Article: "${root.dataset.aiTitle || ""}"
Published: ${root.dataset.aiDate || ""}
Summary: ${root.dataset.aiSummary || ""}
Repositories: ${repos}
Evidence: ${countLabel(root.dataset.aiSourceCount, "public source", "public sources")}
Article and evidence trail: ${root.dataset.aiUrl || window.location.href}
${directEvidence}

What I want to explore: ${focusCopy}

Please:
- Read the article, Primary Evidence, and Evidence Limits before answering.
- Separate what the public sources prove from the reporter’s interpretation and from your own inference.
- Cite the specific evidence links you rely on.
- Challenge the strongest claim and name any missing evidence.
- End with 2–3 productive follow-up questions.

If you cannot access the page or its links, say so and ask me to paste the relevant evidence rather than guessing.`;
  }

  function setStatus(root, message) {
    const status = root.querySelector(".ai-conversation-status");
    if (status) status.textContent = message;
  }

  async function copyPrompt(textarea) {
    const value = textarea.value;
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }

    textarea.focus();
    textarea.select();
    return document.execCommand("copy");
  }

  function copyWithStatus(root, textarea, successMessage) {
    copyPrompt(textarea)
      .then((copied) => {
        setStatus(root, copied ? successMessage : "Select and copy the brief manually.");
      })
      .catch(() => {
        setStatus(root, "Select and copy the brief manually.");
      });
  }

  function bindConversation(root) {
    const textarea = root.querySelector(".ai-prompt");
    if (!textarea) return;

    const focusButtons = Array.from(root.querySelectorAll("[data-ai-focus]"));
    focusButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const focus = button.dataset.aiFocus || "explore";
        focusButtons.forEach((item) => {
          const selected = item === button;
          item.classList.toggle("selected", selected);
          item.setAttribute("aria-pressed", selected ? "true" : "false");
        });
        textarea.value = buildPrompt(root, focus);
        setStatus(root, `${button.textContent.trim()} direction selected. You can edit the brief before copying.`);
      });
    });

    const copyButton = root.querySelector(".ai-copy-button");
    if (copyButton) {
      copyButton.addEventListener("click", () => {
        copyWithStatus(root, textarea, "Brief copied. Paste it into any assistant.");
      });
    }

    root.querySelectorAll("[data-ai-provider]").forEach((link) => {
      link.addEventListener("click", () => {
        const name = link.querySelector("span")?.textContent?.trim() || "the assistant";
        copyWithStatus(root, textarea, `Brief copied. Paste it into ${name}.`);
      });
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-tgr-ai-conversation]").forEach(bindConversation);
  });
})();
