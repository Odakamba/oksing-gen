(() => {
const VOWELS = "aiueo";

const CONNECTORS = {
  dia: "diya",
  tua: "tuwa",
  bau: "bawu",
  tau: "tawu",
  bui: "buwi",
  doa: "dowa",
  sua: "suwa",
  dua: "duwa",
};

const REVERSE_CONNECTORS = Object.fromEntries(Object.entries(CONNECTORS).map(([key, value]) => [value, key]));

const PROKEM_DICTIONARY = {
  aku: "okak",
  kamu: "okkam",
  bapak: "bokap",
  nyap: "nyokap",
  "enya'": "nyokap",
  enyak: "nyokap",
  nyak: "nyokap",
  mati: "mokat",
  berak: "boker",
  setan: "soket",
  sini: "sokin",
  duit: "dokut",
  jual: "jokul",
  siapa: "sokap",
  sapa: "sokap",
  sepatu: "sepokat",
  tete: "toket",
  "blue film": "bokep",
  bf: "bokep",
  bep: "bokep",
  sekolah: "skokul",
  skul: "skokul",
  polisi: "plokis",
  plis: "plokis",
  sendiri: "sendokir",
  tua: "toku",
};

const WORD_BANK = [
  "aku",
  "kamu",
  "dia",
  "gue",
  "elu",
  "saya",
  "bui",
  "doa",
  "sua",
  "dua",
  "suka",
  "makan",
  "minum",
  "roti",
  "beli",
  "lagi",
  "mau",
  "pulang",
  "jalan",
  "tidur",
  "telat",
  "sekolah",
  "bapak",
  "sepatu",
  "kemana",
  "kenapa",
  "berapa",
  "gimana",
  "kamar",
  "bau",
  "rokok",
  "takut",
  "kalau",
  "tau",
  "tua",
  "bakpao",
  "bakpau",
  "kacau",
  "walau",
  "balau",
  "silau",
  "kicau",
  "mobil",
  "rusak",
  "berat",
  "datang",
  "malam",
  "sebentar",
  "pasar",
  "rumah",
  "gelap",
  "teman",
  "cinta",
  "mereka",
  "dengan",
  "bunga",
  "kepada",
  "pasangan",
  "sejarah",
  "buaya",
  "bermula",
  "ketika",
  "bangsa",
  "eropa",
  "batavia",
  "dahulu",
  "orang",
  "melihat",
  "tersebut",
  "sini",
  "duit",
  "jual",
  "siapa",
  "mati",
  "berak",
  "setan",
  "bokep",
];

const PHRASE_BANK = [
  "aku telat sekolah",
  "kamu makan roti",
  "dia suka bakpao",
  "aku lagi kacau",
  "jalan pulang malam",
  "mobil rusak berat",
  "sebentar lagi datang",
  "kamu takut kalau dia tau",
  "sejarah roti buaya",
];

const MODE_LABELS = {
  prokem: "Prokem",
  prinem: "Prinem",
  presm: "Presm",
  pregem: "Pregem",
};

function isVowel(char) {
  return VOWELS.includes(char.toLowerCase());
}

function isLetter(char) {
  return /[a-zA-Z']/u.test(char);
}

function tokenize(text) {
  return text.match(/[A-Za-z']+|[^A-Za-z']+/g) || [];
}

function splitWords(text) {
  return text.match(/[A-Za-z']+/g) || [];
}

function preserveCase(source, value) {
  if (!source) return value;
  if (source === source.toUpperCase()) return value.toUpperCase();
  if (source[0] === source[0].toUpperCase()) return value[0].toUpperCase() + value.slice(1);
  return value;
}

function normalizeWord(word) {
  return word.toLowerCase();
}

function hasFinalVowelPair(word) {
  if (word.length < 2) return false;
  return isVowel(word[word.length - 1]) && isVowel(word[word.length - 2]);
}

function countVowels(word) {
  return [...word].filter(isVowel).length;
}

function connectShortFinalVowels(word) {
  const lower = normalizeWord(word);
  if (CONNECTORS[lower]) return preserveCase(word, CONNECTORS[lower]);
  if (lower.length === 3 && hasFinalVowelPair(lower)) {
    const bridge = lower[1] === "i" || lower[1] === "e" ? "y" : "w";
    return preserveCase(word, `${lower.slice(0, 2)}${bridge}${lower[2]}`);
  }
  return word;
}

function shortenForProkem(lower) {
  if (PROKEM_DICTIONARY[lower]) return null;
  if (lower.length <= 2) return lower;
  if (lower.length === 3 && isVowel(lower[lower.length - 1])) return lower.slice(0, 2);
  if (lower.length <= 4 && isVowel(lower[lower.length - 1])) return lower.slice(0, -1);
  return lower.slice(0, 3);
}

function prokemizeRoot(root) {
  const index = [...root].findIndex(isVowel);
  if (index < 0) return `${root}ok`;
  return `${root.slice(0, index)}ok${root.slice(index)}`;
}

function encodeProkemWord(word) {
  const lower = normalizeWord(word);
  if (PROKEM_DICTIONARY[lower]) {
    return {
      output: preserveCase(word, PROKEM_DICTIONARY[lower]),
      formula: `${word} -> kamus -> ${PROKEM_DICTIONARY[lower]}`,
      source: "kamus",
    };
  }
  const root = shortenForProkem(lower);
  const encoded = prokemizeRoot(root);
  return {
    output: preserveCase(word, encoded),
    formula: `${word} -> ${root} -> ${encoded}`,
    source: "aturan",
  };
}

function encodePrinemWord(word) {
  const lower = normalizeWord(word);
  if (countVowels(lower) <= 1) {
    return { output: word, formula: `${word} = ${word}`, source: "satu suku kata" };
  }
  const skipLast = lower.length > 3 && hasFinalVowelPair(lower);
  let output = "";
  const parts = [];
  for (let index = 0; index < lower.length; index += 1) {
    const char = lower[index];
    const shouldPrefix = isVowel(char) && !(skipLast && index === lower.length - 1);
    if (shouldPrefix) {
      output += `in${char}`;
      parts.push(`in-${char}`);
    } else {
      output += char;
      parts.push(char);
    }
  }
  return {
    output: preserveCase(word, output),
    formula: `${word} = ${parts.join("-")} = ${output}`,
    source: skipLast ? "aturan vokal ganda akhir" : "aturan",
  };
}

function lastSyllableSplit(lower, options = {}) {
  let vowelIndex = -1;
  if (options.finalPairUsesFirstVowel && lower.length > 3 && hasFinalVowelPair(lower)) {
    vowelIndex = lower.length - 2;
  } else {
    for (let i = lower.length - 1; i >= 0; i -= 1) {
      if (isVowel(lower[i])) {
        vowelIndex = i;
        break;
      }
    }
  }
  if (vowelIndex <= 0) {
    return { prefix: "", onset: lower.slice(0, vowelIndex), vowel: lower[vowelIndex] || "", coda: lower.slice(vowelIndex + 1) };
  }

  let clusterStart = vowelIndex;
  while (clusterStart > 0 && !isVowel(lower[clusterStart - 1])) {
    clusterStart -= 1;
  }
  const cluster = lower.slice(clusterStart, vowelIndex);
  let onset = cluster.slice(-1);
  if (/(ny|ng|sy|kh)$/.test(cluster)) onset = cluster.slice(-2);
  const onsetStart = vowelIndex - onset.length;
  return {
    prefix: lower.slice(0, onsetStart),
    onset,
    vowel: lower[vowelIndex],
    coda: lower.slice(vowelIndex + 1),
  };
}

function encodePresmWord(word) {
  let prepared = normalizeWord(word);
  let prepFormula = "";
  if (prepared.length <= 2) {
    return { output: word, formula: `${word} = ${word}`, source: "kata pendek" };
  }
  if (prepared.length === 3 && hasFinalVowelPair(prepared)) {
    prepared = normalizeWord(connectShortFinalVowels(prepared));
    prepFormula = `${word} -> ${prepared}; `;
  }
  if (countVowels(prepared) <= 1) {
    return { output: word, formula: `${word} = ${word}`, source: "satu suku kata" };
  }
  const split = lastSyllableSplit(prepared, { finalPairUsesFirstVowel: true });
  if (!split.vowel) return { output: preserveCase(word, prepared), formula: `${word} = ${prepared}`, source: "tanpa vokal" };
  const output = `${split.prefix}s${split.onset}${split.vowel}s${split.vowel}${split.coda}`;
  const base = `${split.prefix}-${split.onset}${split.vowel}${split.coda}`;
  const formula = `${prepFormula}${prepared} = ${base} = ${split.prefix}-s-${split.onset}${split.vowel}-s-${split.vowel}${split.coda} = ${output}`;
  return { output: preserveCase(word, output), formula, source: "aturan" };
}

function encodePregemWord(word) {
  let prepared = normalizeWord(word);
  let prepFormula = "";
  if (prepared.length <= 2) {
    return { output: word, formula: `${word} = ${word}`, source: "kata pendek" };
  }
  if (prepared.length === 3 && hasFinalVowelPair(prepared)) {
    prepared = normalizeWord(connectShortFinalVowels(prepared));
    prepFormula = `${word} -> ${prepared}; `;
  }
  const skipLast = prepared.length > 3 && hasFinalVowelPair(prepared);
  let output = "";
  const parts = [];
  for (let index = 0; index < prepared.length; index += 1) {
    const char = prepared[index];
    const shouldSuffix = isVowel(char) && !(skipLast && index === prepared.length - 1);
    if (shouldSuffix) {
      output += `${char}g${char}`;
      parts.push(`${char}-g${char}`);
    } else {
      output += char;
      parts.push(char);
    }
  }
  return {
    output: preserveCase(word, output),
    formula: `${prepFormula}${prepared} = ${parts.join("-")} = ${output}`,
    source: skipLast ? "aturan vokal ganda akhir" : "aturan",
  };
}

const ENCODERS = {
  prokem: encodeProkemWord,
  prinem: encodePrinemWord,
  presm: encodePresmWord,
  pregem: encodePregemWord,
};

function encodeWord(mode, word) {
  return ENCODERS[mode](word);
}

function encodeText(mode, text) {
  const tokens = tokenize(text);
  const breakdown = [];
  const output = tokens
    .map((token) => {
      if (!token || !isLetter(token[0])) return token;
      const encoded = encodeWord(mode, token);
      breakdown.push({ input: token, output: encoded.output, formula: encoded.formula, source: encoded.source });
      return encoded.output;
    })
    .join("");
  return { output, breakdown, suggestions: [] };
}

function buildReverseMaps(mode) {
  const map = new Map();
  const allWords = [...new Set([...WORD_BANK, ...Object.keys(PROKEM_DICTIONARY)])];
  for (const word of allWords) {
    const encoded = encodeWord(mode, word).output.toLowerCase();
    if (!map.has(encoded)) map.set(encoded, []);
    map.get(encoded).push(word);
  }
  return map;
}

const REVERSE_MAPS = {
  prokem: buildReverseMaps("prokem"),
  prinem: buildReverseMaps("prinem"),
  presm: buildReverseMaps("presm"),
  pregem: buildReverseMaps("pregem"),
};

function reversePrinemRaw(lower) {
  let output = "";
  for (let index = 0; index < lower.length; index += 1) {
    if (lower.slice(index, index + 2) === "in" && isVowel(lower[index + 2] || "")) {
      output += lower[index + 2];
      index += 2;
    } else {
      output += lower[index];
    }
  }
  return output;
}

function reversePregemRaw(lower) {
  let output = "";
  for (let index = 0; index < lower.length; index += 1) {
    const char = lower[index];
    if (isVowel(char) && lower[index + 1] === "g" && lower[index + 2] === char) {
      output += char;
      index += 2;
    } else {
      output += char;
    }
  }
  if (REVERSE_CONNECTORS[output]) return REVERSE_CONNECTORS[output];
  return output;
}

function reversePresmRaw(lower) {
  const known = REVERSE_MAPS.presm.get(lower);
  if (known?.length) return known[0];
  for (let first = 0; first < lower.length; first += 1) {
    if (lower[first] !== "s") continue;
    for (let second = first + 2; second < lower.length; second += 1) {
      if (lower[second] !== "s") continue;
      const prefix = lower.slice(0, first);
      const partA = lower.slice(first + 1, second);
      const partB = lower.slice(second + 1);
      if (!partA || !partB || !isVowel(partB[0])) continue;
      const candidate = prefix + partA + partB.slice(1);
      const normalized = REVERSE_CONNECTORS[candidate] || candidate;
      if (encodePresmWord(normalized).output.toLowerCase() === lower) return normalized;
    }
  }
  return null;
}

function decodeExact(mode, lower) {
  const known = REVERSE_MAPS[mode].get(lower);
  if (known?.length) return known[0];
  if (mode === "prinem") {
    const candidate = reversePrinemRaw(lower);
    return encodePrinemWord(candidate).output.toLowerCase() === lower ? candidate : null;
  }
  if (mode === "pregem") {
    const candidate = reversePregemRaw(lower);
    return encodePregemWord(candidate).output.toLowerCase() === lower ? candidate : null;
  }
  if (mode === "presm") return reversePresmRaw(lower);
  if (mode === "prokem") return null;
  return null;
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, index) => [index]);
  for (let j = 1; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
}

function similarity(a, b) {
  if (!a && !b) return 1;
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

function suggestWord(mode, lower) {
  let best = null;
  const map = REVERSE_MAPS[mode];
  for (const [encoded, originals] of map.entries()) {
    const score = similarity(lower, encoded);
    if (!best || score > best.score) {
      best = { encoded, original: originals[0], score };
    }
  }
  return best && best.score >= 0.72 ? best : null;
}

function decodeText(mode, text) {
  const tokens = tokenize(text);
  const breakdown = [];
  const suggestions = [];
  const output = tokens
    .map((token) => {
      if (!token || !isLetter(token[0])) return token;
      const lower = normalizeWord(token);
      const exactOptions = REVERSE_MAPS[mode].get(lower);
      const decoded = decodeExact(mode, lower);
      if (decoded) {
        if (exactOptions?.length > 1) {
          suggestions.push({
            type: "ambiguous",
            input: token,
            encoded: lower,
            original: exactOptions.join(" / "),
            confidence: 100,
          });
        }
        breakdown.push({ input: token, output: decoded, formula: `${token} -> ${decoded}`, source: "reverse" });
        return preserveCase(token, decoded);
      }
      const suggestion = suggestWord(mode, lower);
      if (suggestion) {
        suggestions.push({
          type: "typo",
          input: token,
          encoded: suggestion.encoded,
          original: suggestion.original,
          confidence: Math.round(suggestion.score * 100),
        });
      }
      breakdown.push({ input: token, output: token, formula: `${token} -> belum dikenali`, source: "unknown" });
      return token;
    })
    .join("");
  return { output, breakdown, suggestions };
}

function translate(mode, direction, text) {
  if (direction === "decode") return decodeText(mode, text);
  return encodeText(mode, text);
}

function normalizeAnswer(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function makeQuizQuestion() {
  const modes = ["prokem", "prinem", "presm", "pregem"];
  const mode = modes[Math.floor(Math.random() * modes.length)];
  const source = Math.random() > 0.52 ? PHRASE_BANK[Math.floor(Math.random() * PHRASE_BANK.length)] : WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
  const expected = encodeText(mode, source).output;
  const variants = [
    {
      meta: `${MODE_LABELS[mode]} - Indonesia ke OKSING`,
      question: `Ubah ke ${MODE_LABELS[mode]}: ${source}`,
      expected,
    },
    {
      meta: `${MODE_LABELS[mode]} - OKSING ke Indonesia`,
      question: `Balikin ke Indonesia: ${expected}`,
      expected: source,
      mode,
      reverse: true,
    },
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

window.OKSINGEngine = {
  MODE_LABELS,
  PHRASE_BANK,
  WORD_BANK,
  encodeText,
  translate,
  makeQuizQuestion,
  normalizeAnswer,
};
})();
