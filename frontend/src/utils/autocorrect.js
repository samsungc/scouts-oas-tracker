// Lightweight autocorrect for free-text fields (goals, evidence notes,
// comments, reflections). When a word is finished (space, newline or
// punctuation typed after it), common misspellings are fixed and the first
// word of a sentence is capitalised. Pressing Backspace straight after a
// correction undoes it, and that word is then left alone in that field.
//
// installAutocorrect() hooks every <textarea> on the page. A field opts out
// with autocorrect="off" or spellCheck={false}; a single-line input opts in
// with data-autocorrect.

const CORRECTIONS = {
  // Contractions typed without the apostrophe
  im: "I'm", ive: "I've",
  dont: "don't", doesnt: "doesn't", didnt: "didn't",
  cant: "can't", couldnt: "couldn't", wouldnt: "wouldn't", shouldnt: "shouldn't",
  isnt: "isn't", wasnt: "wasn't", arent: "aren't", werent: "weren't",
  hasnt: "hasn't", havent: "haven't", hadnt: "hadn't", wont: "won't",
  thats: "that's", whats: "what's", theres: "there's", heres: "here's",
  youre: "you're", theyre: "they're", weve: "we've", youve: "you've",
  theyve: "they've", itll: "it'll", youll: "you'll", theyll: "they'll",
  // Common misspellings and slips
  teh: 'the', hte: 'the', taht: 'that', thier: 'their', wiht: 'with',
  adn: 'and', nad: 'and', jsut: 'just', becuase: 'because', becasue: 'because',
  beacuse: 'because', alot: 'a lot', recieve: 'receive', recieved: 'received',
  beleive: 'believe', belive: 'believe', acheive: 'achieve', acheived: 'achieved',
  acheivement: 'achievement', untill: 'until', occured: 'occurred',
  occuring: 'occurring', begining: 'beginning', definately: 'definitely',
  definatly: 'definitely', definitly: 'definitely', seperate: 'separate',
  seperately: 'separately', tommorow: 'tomorrow', tomorow: 'tomorrow',
  tommorrow: 'tomorrow', freind: 'friend', freinds: 'friends', wierd: 'weird',
  realy: 'really', finaly: 'finally', basicly: 'basically', usualy: 'usually',
  probaly: 'probably', probly: 'probably', comming: 'coming', runing: 'running',
  swiming: 'swimming', planing: 'planning', stoped: 'stopped', droped: 'dropped',
  writen: 'written', experiance: 'experience', expirience: 'experience',
  enviroment: 'environment', goverment: 'government', neccessary: 'necessary',
  necesary: 'necessary', accomodate: 'accommodate', accross: 'across',
  activites: 'activities', actvities: 'activities', comunity: 'community',
  communtiy: 'community', responsability: 'responsibility', leadrship: 'leadership',
  wich: 'which', whcih: 'which', becomeing: 'becoming', truely: 'truly',
  arguement: 'argument', calender: 'calendar', excercise: 'exercise',
  exersise: 'exercise', knowlege: 'knowledge', libary: 'library',
  sucess: 'success', succesful: 'successful', sucessful: 'successful',
  successfull: 'successful', helpfull: 'helpful', usefull: 'useful',
  beautifull: 'beautiful', carefull: 'careful', wonderfull: 'wonderful',
  thankyou: 'thank you', infront: 'in front', aswell: 'as well',
  everytime: 'every time', atleast: 'at least', incase: 'in case',
  campign: 'camping', campping: 'camping', hikeing: 'hiking',
  canoing: 'canoeing', kayacking: 'kayaking', kyaking: 'kayaking',
  equiptment: 'equipment', equipement: 'equipment', compas: 'compass',
  shelterd: 'sheltered', firewod: 'firewood', tempature: 'temperature',
  temprature: 'temperature', weatehr: 'weather', wether: 'weather',
  skils: 'skills', skillls: 'skills', badgde: 'badge', bagde: 'badge',
  scoutes: 'scouts', expidition: 'expedition',
  expedtion: 'expedition', expeditoin: 'expedition', acheiving: 'achieving',
  // "i" on its own is always "I"
  i: 'I',
}

const BOUNDARY = /[\s.,!?;:)"\]]/
const WORD_CHAR = /[A-Za-z']/
// A word only counts if it starts after whitespace, an opening bracket or
// quote, or at the start of the text. Anything else (@mentions, URLs,
// emails, hyphenated words, numbers) is left alone.
const WORD_START_OK = /[\s("[]/
const ABBREVIATIONS = /(?:^|\s)(?:e\.g|i\.e|etc|vs|approx|mr|mrs|ms|dr|st)\.\s*$/i

function matchCase(original, replacement) {
  if (original.length > 1 && original === original.toUpperCase()) {
    return replacement.toUpperCase()
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1)
  }
  return replacement
}

function startsSentence(textBefore) {
  const trimmed = textBefore.replace(/[ \t("[]+$/, '')
  if (trimmed === '' || trimmed.endsWith('\n')) return true
  if (!/[.!?]$/.test(trimmed)) return false
  return !ABBREVIATIONS.test(trimmed)
}

/**
 * Works out the correction for the word that ends just before `caret`, when
 * the character just typed (at caret - 1) is a word boundary.
 * Returns { value, caret, word } with the corrected text, or null if no
 * change is needed. `ignore` is a set of lower-case words to leave alone.
 */
export function correctAt(value, caret, ignore = new Set()) {
  if (caret < 2 || !BOUNDARY.test(value[caret - 1])) return null

  const wordEnd = caret - 1
  let wordStart = wordEnd
  while (wordStart > 0 && WORD_CHAR.test(value[wordStart - 1])) wordStart--
  if (wordStart === wordEnd) return null
  if (wordStart > 0 && !WORD_START_OK.test(value[wordStart - 1])) return null

  // Trim quotes around the word so "dont" in quotes still works
  let start = wordStart
  let end = wordEnd
  while (start < end && value[start] === "'") start++
  while (end > start && value[end - 1] === "'") end--
  if (start === end) return null

  const word = value.slice(start, end)
  const lower = word.toLowerCase()
  if (ignore.has(lower)) return null

  let replacement = word
  const fix = Object.hasOwn(CORRECTIONS, lower) ? CORRECTIONS[lower] : null
  if (fix) {
    replacement = lower === 'i' || /^I'/.test(fix) ? fix : matchCase(word, fix)
  }

  if (/^[a-z]/.test(replacement) && startsSentence(value.slice(0, start))) {
    // Only capitalise plain words; leave things like "iPhone" alone
    if (/^[a-z][a-z']*(?: [a-z]+)?$/.test(replacement)) {
      replacement = replacement[0].toUpperCase() + replacement.slice(1)
    }
  }

  if (replacement === word) return null

  const next = value.slice(0, start) + replacement + value.slice(end)
  return { value: next, caret: caret + replacement.length - word.length, word: lower }
}

// ── DOM wiring ───────────────────────────────────────────────────────────────

const state = new WeakMap() // element -> { ignore, last }

function isEnabled(el) {
  if (el.tagName === 'TEXTAREA') {
    if (el.getAttribute('autocorrect') === 'off') return false
    if (el.getAttribute('spellcheck') === 'false') return false
    return !el.readOnly && !el.disabled
  }
  return el.tagName === 'INPUT' && el.hasAttribute('data-autocorrect')
}

// React tracks the last value it saw on each field, so writing through the
// element's own `value` setter would hide the change from onChange. Writing
// through the prototype setter keeps React's onChange firing as normal.
function setNativeValue(el, value) {
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)
}

function handleInput(e) {
  const el = e.target
  if (!el || !isEnabled(el) || e.isComposing) return
  if (el.selectionStart !== el.selectionEnd) return

  let s = state.get(el)
  if (!s) {
    s = { ignore: new Set(), last: null }
    state.set(el, s)
  }

  const caret = el.selectionStart
  const last = s.last
  s.last = null

  // Backspace straight after a correction puts back what was typed
  if (e.inputType === 'deleteContentBackward' && last) {
    const expected = last.value.slice(0, last.caret - 1) + last.value.slice(last.caret)
    if (el.value === expected && caret === last.caret - 1) {
      const restored = last.original.slice(0, last.originalCaret - 1) + last.original.slice(last.originalCaret)
      setNativeValue(el, restored)
      el.setSelectionRange(last.originalCaret - 1, last.originalCaret - 1)
      s.ignore.add(last.word)
      return
    }
  }

  if (e.inputType !== 'insertText' && e.inputType !== 'insertLineBreak') return

  const result = correctAt(el.value, caret, s.ignore)
  if (!result) return

  s.last = { value: result.value, caret: result.caret, original: el.value, originalCaret: caret, word: result.word }
  setNativeValue(el, result.value)
  el.setSelectionRange(result.caret, result.caret)
}

let installed = false

/** Turns on autocorrect for every textarea on the page. Safe to call twice. */
export function installAutocorrect() {
  if (installed || typeof document === 'undefined') return
  installed = true
  // Capture phase on document runs before React's own listener on the root,
  // so React's onChange sees the corrected text.
  document.addEventListener('input', handleInput, true)
}
