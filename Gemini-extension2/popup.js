document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const status = document.getElementById("status");
  const clearBtn = document.getElementById("clearData");
  const toggleModeBtn = document.getElementById("toggleMode");
  const autoFillBtn = document.getElementById("autoFill");

  chrome.storage.local.get("darkMode", (data) => {
    if (data.darkMode) {
      document.body.classList.add("dark-mode");
      toggleModeBtn.checked = true;
    }
  });

  toggleModeBtn.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
    chrome.storage.local.set({
      darkMode: document.body.classList.contains("dark-mode"),
    });
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const formUrl = tabs[0].url;
    chrome.storage.local.get([formUrl], (result) => {
      if (result[formUrl]) {
        displayResponse(result[formUrl], true);
        clearBtn.style.display = "block";
      } else {
        clearBtn.style.display = "none";
      }
    });
  });

  document.getElementById("fetchData").addEventListener("click", () => {
    loader.style.display = "block";
    status.textContent = "Fetching form data...";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const formUrl = tabs[0].url;
      chrome.storage.local.remove([formUrl], () => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content.js"],
        });
      });
    });
  });

  clearBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const formUrl = tabs[0].url;
      chrome.storage.local.remove([formUrl], () => {
        status.textContent = "";
        clearBtn.style.display = "none";
      });
    });
  });

  autoFillBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // console.log("Attempting to run autofill.js on:", tabs[0].url);
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["autofill.js"],
      });
    });
  });
});

function displayResponse(data, isFromCache = false) {
  const loader = document.getElementById("loader");
  const status = document.getElementById("status");
  const clearBtn = document.getElementById("clearData");

  loader.style.display = "none";
  clearBtn.style.display = "block";

  const responseData = data.result;

  if (Array.isArray(responseData)) {
    let html = `<div class="response-header">
                  <h3>API Response ${
                    isFromCache
                      ? '<span class="cache-badge">(Cached)</span>'
                      : ""
                  }</h3>
                </div>`;
    responseData.forEach((item, i) => {
      const { fullQuestion, answer, confidence } = item;
      html += `<div class="qa-card">
                 <div class="qa-question">${i + 1}. ${fullQuestion}</div>
                 <div class="qa-answer">Ans. ${answer}</div>
                 <div class="qa-confidence"><span class="confidence-badge">Confidence: ${confidence}</span></div>
                 <button class="copy-btn" data-answer="${encodeURIComponent(
                   answer
                 )}" title="Copy Answer" 
                   style="background: transparent url('images/copy-icon.png') no-repeat center / contain;">
                 </button>
               </div>`;
    });
    status.innerHTML = html;

    document.querySelectorAll(".copy-btn").forEach((btn) => {
      const copyIcon = "images/copy-icon.png";
      const tickIcon = "images/tick-icon.png";
      btn.addEventListener("click", (e) => {
        const button = e.currentTarget;
        const answerToCopy = decodeURIComponent(
          button.getAttribute("data-answer") || ""
        ).trim();

        if (answerToCopy.length === 0) {
          console.error("Copy failed: No answer found");
          return;
        }

        navigator.clipboard
          .writeText(answerToCopy)
          .then(() => {
            // console.log("Copied:", answerToCopy);
            button.style.background = `transparent url('${tickIcon}') no-repeat center / contain`;

            setTimeout(() => {
              button.style.background = `transparent url('${copyIcon}') no-repeat center / contain`;
            }, 1000);
          })
          .catch((err) => {
            console.error("Copy failed:", err);
          });
      });
    });
  } else {
    status.textContent = "Unexpected response format from API.";
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "apiResponse") {
    displayResponse(message.data, false);
  } else if (message.action === "apiResponseError") {
    const loader = document.getElementById("loader");
    const status = document.getElementById("status");
    const clearBtn = document.getElementById("clearData");
    loader.style.display = "none";
    clearBtn.style.display = "none";
    status.textContent = message.error;
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "showLoader") {
    loader.style.display = "block";
    const status = document.getElementById("status");
    status.textContent = "Fetching form data...";
  }
});
