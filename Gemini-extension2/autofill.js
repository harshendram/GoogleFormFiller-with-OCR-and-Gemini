function isKnownType(typeStr) {
  return ["radio", "checkbox", "input", "textarea", "dropdown"].includes(
    typeStr
  );
}

function normalize(str) {
  return str
    ? String(str)
        .replace(/\u00A0/g, " ")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .trim()
        .toLowerCase()
    : "";
}

function doubleClick(el) {
  if (!el) return;
  el.scrollIntoView({ block: "center" });
  if (typeof el.focus === "function") el.focus();
  ["mousedown", "mouseup", "click"].forEach((evtType) => {
    const evt = new MouseEvent(evtType, { bubbles: true, cancelable: true });
    el.dispatchEvent(evt);
  });
  ["mousedown", "mouseup", "click"].forEach((evtType) => {
    const evt = new MouseEvent(evtType, { bubbles: true, cancelable: true });
    el.dispatchEvent(evt);
  });
}

function pressEnter(el) {
  if (!el) return;
  el.scrollIntoView({ block: "center" });
  if (typeof el.focus === "function") el.focus();
  ["keydown", "keypress", "keyup"].forEach((evtType) => {
    const evt = new KeyboardEvent(evtType, {
      key: "Enter",
      code: "Enter",
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(evt);
  });
}

function w(classes, root = document) {
  if (classes.length === 0) return [];
  const selector = `span.${classes.join(".")}`;
  return Array.from(root.querySelectorAll(selector));
}

function y(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function x(obj) {
  for (const [key, arr] of Object.entries(obj)) {
    if (arr.length > 0) return [key, arr];
  }
  return null;
}

function Q(spanEl) {
  let wrapper = spanEl;
  for (let i = 0; i < 4; i++) {
    if (!wrapper) break;
    wrapper = wrapper.parentElement;
  }

  if (!wrapper || (wrapper.innerText && wrapper.innerText.trim().length < 10)) {
    let temp = spanEl;
    for (let j = 0; j < 5; j++) {
      if (!temp.parentElement) break;
      temp = temp.parentElement;
    }
    wrapper = temp;
  }
  if (!wrapper) throw new Error("wrapper not found");
  return wrapper;
}

function S(titleSpans, radioClasses, checkboxClasses) {
  const questions = [];
  const questionsElementsMap = new Map();

  titleSpans.forEach((spanEl, idx) => {
    if (!spanEl.textContent) {
      console.warn("Title not found in span:", spanEl);
      return;
    }
    let wrapper;
    try {
      wrapper = Q(spanEl);
    } catch (err) {
      console.warn("Unable to find wrapper for span:", spanEl);
      return;
    }

    let radioEls = w(radioClasses, wrapper);
    if (!radioEls.length) {
      radioEls = y('div[role="radio"]', wrapper);
    }
    let checkboxEls = w(checkboxClasses, wrapper);
    if (!checkboxEls.length) {
      checkboxEls = y('div[role="checkbox"]', wrapper);

      if (!checkboxEls.length) {
        checkboxEls = y("div.uHMk6b.fsHoPb", wrapper);
      }
    }
    const inputEls = y("input", wrapper);
    const textareaEls = y("textarea", wrapper);
    const dropdownEls = y('div[role="listbox"]', wrapper);

    const fieldObj = {
      radio: radioEls,
      checkbox: checkboxEls,
      input: inputEls,
      textarea: textareaEls,
      dropdown: dropdownEls,
    };

    const found = x(fieldObj);
    if (!found) {
      console.warn("Question type not found in container:", wrapper);
      return;
    }
    const [fieldType, arr] = found;
    const questionId = `Q-${idx}`;
    const questionTitle = spanEl.textContent;
    if (isKnownType(fieldType)) {
      if (fieldType === "radio" || fieldType === "checkbox") {
        const optionMap = new Map();
        arr.forEach((el, optionIndex) => {
          optionMap.set(`O-${optionIndex}`, el);
        });
        questions.push({
          title: questionTitle,
          id: questionId,
          type: fieldType,
          options: Array.from(optionMap.entries()).map(([oid, el]) => ({
            text: el.textContent,
            id: oid,
          })),
        });
        questionsElementsMap.set(questionId, optionMap);
      } else if (fieldType === "input" || fieldType === "textarea") {
        questions.push({
          title: questionTitle,
          id: questionId,
          type: fieldType,
        });
        questionsElementsMap.set(questionId, arr[0]);
      } else if (fieldType === "dropdown") {
        questions.push({
          title: questionTitle,
          id: questionId,
          type: "dropdown",
        });
        questionsElementsMap.set(questionId, arr[0]);
      }
    } else {
      console.warn("Unrecognized fieldType:", fieldType);
    }
  });
  return { questions, questionsElementsMap };
}

function v(optionId, questionId, questionsElementsMap) {
  const questionEl = questionsElementsMap.get(questionId);
  if (!questionEl) throw new Error("Question not found for ID " + questionId);
  if (questionEl instanceof Map) {
    const el = questionEl.get(optionId);
    if (!el) throw new Error("Option not found: " + optionId);
    return el;
  }
  return questionEl;
}

function fillAnswers(questions, questionsElementsMap, aiData) {
  for (const { fullQuestion, answer } of aiData) {
    // Use partial matching for improved detection.
    const questionObj = questions.find((q) => {
      const normTitle = normalize(q.title);
      const normAI = normalize(fullQuestion);
      return (
        normTitle === normAI ||
        normTitle.includes(normAI) ||
        normAI.includes(normTitle)
      );
    });
    if (!questionObj) {
      console.warn(`Could not find question: "${fullQuestion}"`);
      continue;
    }
    // console.log(`Filling question: "${fullQuestion}" => "${answer}"`);
    if (questionObj.type === "input" || questionObj.type === "textarea") {
      const field = v(questionObj.id, questionObj.id, questionsElementsMap);
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement
      ) {
        field.scrollIntoView({ block: "center" });
        field.focus();
        field.value = answer;
        field.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        console.warn("Expected input/textarea but got something else");
      }
    } else if (
      questionObj.type === "radio" ||
      questionObj.type === "checkbox"
    ) {
      const answers = answer.split(",").map((a) => normalize(a));
      questionObj.options.forEach((opt) => {
        const normOpt = normalize(opt.text);
        answers.forEach((ans) => {
          if (normOpt.includes(ans)) {
            //console.log(`Double-clicking option: "${opt.text}"`);
            const el = v(opt.id, questionObj.id, questionsElementsMap);
            doubleClick(el);
          }
        });
      });
    } else if (questionObj.type === "dropdown") {
      //console.log(`Opening dropdown for: "${questionObj.title}"`);
      const dropdownEl = v(
        questionObj.id,
        questionObj.id,
        questionsElementsMap
      );
      doubleClick(dropdownEl);
      setTimeout(() => {
        const normAnswer = normalize(answer);
        const allOptions = document.querySelectorAll('div[role="option"]');
        let matched = false;
        /* console.log(
          `Searching for dropdown option that includes "${normAnswer}" among ${allOptions.length} options`
        );*/
        for (let i = 0; i < allOptions.length; i++) {
          const optDiv = allOptions[i];
          const span = optDiv.querySelector("span.vRMGwf.oJeWuf");
          if (!span) continue;
          const text = normalize(span.innerText || "");
          if (text.includes(normAnswer)) {
            // console.log(`Double-clicking dropdown option: "${span.innerText}"`);
            optDiv.scrollIntoView({ block: "center" });
            optDiv.focus();
            pressEnter(optDiv);
            doubleClick(optDiv);
            optDiv.setAttribute("aria-selected", "true");
            const changeEvt = new Event("change", { bubbles: true });
            optDiv.dispatchEvent(changeEvt);
            matched = true;
            break;
          }
        }
        if (!matched) {
          console.warn(`⚠️ No dropdown option matched "${answer}"`);
        } else {
          setTimeout(() => {
            pressEnter(dropdownEl);
            doubleClick(dropdownEl);
          }, 300);
        }
      }, 2000);
    } else {
      console.warn("Unknown question type:", questionObj.type);
    }
  }
}

function fillAll(aiData) {
  const radioClasses = ["aDTYNe", "snByac", "OvPDhc", "OIC90c"];
  const checkboxClasses = ["aDTYNe", "snByac", "n5vBHf", "OIC90c"];
  const titleSpans = Array.from(document.getElementsByTagName("span")).filter(
    (el) => el.textContent && el.classList.contains("M7eMe")
  );
  if (!titleSpans.length) {
    console.warn("No question titles found using span.M7eMe");
    return;
  }
  const { questions, questionsElementsMap } = S(
    titleSpans,
    radioClasses,
    checkboxClasses
  );
  fillAnswers(questions, questionsElementsMap, aiData);
}

async function competitorFill() {
  const stored = await new Promise((resolve) => {
    chrome.storage.local.get(window.location.href, (res) => resolve(res));
  });
  if (!stored[window.location.href]) {
    console.warn("No stored data found for this form in local storage.");
    return;
  }
  const aiData = stored[window.location.href].result;
  if (!Array.isArray(aiData)) {
    console.warn("Unexpected format: 'result' is not an array.", aiData);
    return;
  }

  fillAll(aiData);
}

competitorFill();
