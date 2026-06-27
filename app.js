(() => {
const { MODE_LABELS, makeQuizQuestion, normalizeAnswer, translate } = window.OKSINGEngine;

const pages = [...document.querySelectorAll("[data-page]")];
const tabs = [...document.querySelectorAll("[data-route]")];
const modeSelect = document.querySelector("#modeSelect");
const directionSelect = document.querySelector("#directionSelect");
const inputText = document.querySelector("#inputText");
const resultBox = document.querySelector("#resultBox");
const suggestionBox = document.querySelector("#suggestionBox");
const breakdownList = document.querySelector("#breakdownList");
const translateBtn = document.querySelector("#translateBtn");
const swapBtn = document.querySelector("#swapBtn");
const copyBtn = document.querySelector("#copyBtn");
const quizMeta = document.querySelector("#quizMeta");
const quizQuestion = document.querySelector("#quizQuestion");
const quizAnswer = document.querySelector("#quizAnswer");
const quizFeedback = document.querySelector("#quizFeedback");
const checkQuizBtn = document.querySelector("#checkQuizBtn");
const nextQuizBtn = document.querySelector("#nextQuizBtn");

let lastOutput = "";
let currentQuiz = null;

function setRoute(route) {
  pages.forEach((page) => page.classList.toggle("is-active", page.dataset.page === route));
  tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.route === route));
  history.replaceState(null, "", `#${route}`);
}

function renderSuggestions(suggestions) {
  if (!suggestions.length) {
    suggestionBox.hidden = true;
    suggestionBox.innerHTML = "";
    return;
  }
  suggestionBox.hidden = false;
  suggestionBox.innerHTML = suggestions
    .map((item) => {
      if (item.type === "ambiguous") {
        return `<div>Bentuk <strong>${item.input}</strong> punya beberapa kemungkinan asal: <strong>${item.original}</strong>.</div>`;
      }
      return `<div>Apa maksud anda <strong>${item.encoded}</strong> yang artinya <strong>${item.original}</strong>? <span>(${item.confidence}% mirip dengan input "${item.input}")</span></div>`;
    })
    .join("");
}

function renderBreakdown(items) {
  if (!items.length) {
    breakdownList.innerHTML = `<div class="breakdown-item"><strong>Belum ada kata</strong><code>Masukkan teks untuk melihat formula.</code></div>`;
    return;
  }
  breakdownList.innerHTML = items
    .map(
      (item) => `
        <div class="breakdown-item">
          <strong>${item.input} -> ${item.output}</strong>
          <code>${item.formula}</code>
        </div>
      `,
    )
    .join("");
}

function runTranslate() {
  const mode = modeSelect.value;
  const direction = directionSelect.value;
  const text = inputText.value;
  const result = translate(mode, direction, text);
  lastOutput = result.output;
  resultBox.textContent = result.output || "Hasil akan muncul di sini.";
  renderBreakdown(result.breakdown);
  renderSuggestions(result.suggestions);
}

function swapDirection() {
  const current = directionSelect.value;
  directionSelect.value = current === "encode" ? "decode" : "encode";
  if (lastOutput) inputText.value = lastOutput;
  runTranslate();
}

async function copyOutput() {
  if (!lastOutput) runTranslate();
  try {
    await navigator.clipboard.writeText(lastOutput);
    copyBtn.textContent = "Tersalin";
    setTimeout(() => {
      copyBtn.textContent = "Copy hasil";
    }, 1100);
  } catch {
    copyBtn.textContent = "Copy manual";
  }
}

function newQuiz() {
  currentQuiz = makeQuizQuestion();
  quizMeta.textContent = currentQuiz.meta;
  quizQuestion.textContent = currentQuiz.question;
  quizAnswer.value = "";
  quizFeedback.textContent = "";
  quizFeedback.className = "quiz-feedback";
  quizAnswer.focus();
}

function checkQuiz() {
  if (!currentQuiz) newQuiz();
  const answer = normalizeAnswer(quizAnswer.value);
  const expected = normalizeAnswer(currentQuiz.expected);
  if (answer === expected) {
    quizFeedback.className = "quiz-feedback is-correct";
    quizFeedback.textContent = "Benar. Formula OKSING-nya masuk.";
    return;
  }
  quizFeedback.className = "quiz-feedback is-wrong";
  quizFeedback.textContent = `Belum pas. Jawaban yang benar: ${currentQuiz.expected}`;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setRoute(tab.dataset.route));
});

translateBtn.addEventListener("click", runTranslate);
swapBtn.addEventListener("click", swapDirection);
copyBtn.addEventListener("click", copyOutput);
modeSelect.addEventListener("change", runTranslate);
directionSelect.addEventListener("change", runTranslate);
inputText.addEventListener("input", runTranslate);
checkQuizBtn.addEventListener("click", checkQuiz);
nextQuizBtn.addEventListener("click", newQuiz);
quizAnswer.addEventListener("keydown", (event) => {
  if (event.key === "Enter") checkQuiz();
});

const initialRoute = location.hash?.replace("#", "") || "translator";
setRoute(pages.some((page) => page.dataset.page === initialRoute) ? initialRoute : "translator");
runTranslate();
newQuiz();

document.title = `OKSING GEN - ${MODE_LABELS[modeSelect.value]} Translator by Oda`;
})();
