const theState = () => {
  let cursor = {
    paragraph: 0,
    character: 0
  };
  let paragraphs = [
    {
      dirty: false,
      content:
        "In \\*]mathemtical* logic, \\:joy: a .\\..sentence of a predi\ncate logic is a boolean-valued well-formed formula with no f\nree variables. A sentence can be viewed as expressing a proposition, something that must be true or false. The res\ntriction of having no free variables is needed to make sure that sentences can have concrete, fixed truth values: As the free variables of a (general) formula can range over several values, the truth val\nue of such a formula may vary."
    }
  ];
  const ops = {
    current: {
      insert(content: string) {
        let text = ops.current.paragraph.get();
        text = `${text.slice(0, cursor.character)}${content}${text.slice(
          cursor.character
        )}`;
        ops.current.paragraph.set(text);
      },
      paragraph: {
        get(): string {
          return ops.paragraph.get(cursor.paragraph);
        },
        set(content: string) {
          return ops.paragraph.set(cursor.paragraph, content);
        }
      }
    },
    paragraph: {
      get(n: number): string {
        return paragraphs[n].content;
      },
      set(n: number, content: string) {
        paragraphs[n].content = content;
        paragraphs[n].dirty = true;
      }
    },
    cursor: {
      left(n: number) {},
      right(n: number) {},
      up(n: number) {},
      down(n: number) {}
    }
  };
  return ops;
};
const operations = state => ({
  insert(content: string) {
    state.current.insert(content);
  },
  right() {
    state.cursor.right();
  },
  left() {
    state.cursor.left();
  },
  up() {
    state.cursor.up();
  },
  down() {
    state.cursor.down();
  },
  newline() {},
  backspace() {},
  delete() {}
});
const addText = text => {
  let t = state.content[state.cursor.para].text;
  t = `${t.slice(0, state.cursor.char)}${text}${t.slice(state.cursor.char)}`;
  state.content[state.cursor.para].text = t;
  state.cursor.char += text.length;
};
const appendText = text => {
  let t = state.content[state.cursor.para].text;
  t = `${t.slice(0, state.cursor.char)}${text}${t.slice(state.cursor.char)}`;
  state.content[state.cursor.para].text = t;
};
const addParagraph = () => {
  let t = state.content[state.cursor.para].text;
  let i = t.slice(0, state.cursor.char);
  let e = t.slice(state.cursor.char);
  state.content[state.cursor.para].text = i;
  state.content.splice(state.cursor.para + 1, 0, {
    text: e,
    rects: []
  });
  state.cursor.para += 1;
  state.cursor.char = 0;
};
let state = {
  matter: {},
  focus: true,
  spans: [
    {
      start: { para: 0, char: 81 },
      ident: "a",
      end: { para: 0, char: 287 }
    },
    {
      start: { para: 0, char: 102 },
      ident: "b",
      end: { para: 1, char: 4 }
    },
    {
      start: { para: 0, char: 176 },
      ident: "em",
      end: { para: 1, char: 1 }
    }
  ],
  content: [
    {
      type: "code",
      text:
        "In \\*]mathemtical* logic, \\:joy: a .\\..sentence of a predi\ncate logic is a boolean-valued well-formed formula with no f\nree variables. A sentence can be viewed as expressing a proposition, something that must be true or false. The res\ntriction of having no free variables is needed to make sure that sentences can have concrete, fixed truth values: As the free variables of a (general) formula can range over several values, the truth val\nue of such a formula may vary.",
      rects: []
    },
    {
      text:
        "A set of sentences is called a theory; thus, individual sentences may be called theorems. To properly evaluate the truth (or falsehood) of a sentence, one must make reference to an interpretation of the theory. For first-order theories, interpretations are commonly called structures. Given a structure or interpretation, a sentence will have a fixed truth value. A theory is satisfiable when it is possible to present an interpretation in which all of its sentences are true. The study of algorithms to automatically discover interpretations of theories that render all sentences as being true is known as the satisfiability modulo theories problem. ",
      rects: []
    }
  ],
  cursor: {
    para: 0,
    char: 0,
    projectChar: 0,
    endPara: 0,
    endChar: 0,
    dragging: false,
    range: document.createRange()
  },
  cursorElement: undefined,
  editorElement: undefined
};

const toEmojiCode = memo(word => {
  return emojis[word] != undefined
    ? emojis[word]
        .split("?")[0]
        .split("/")
        .pop()
    : null;
});
window.toEmojiCode = toEmojiCode;

// Things with renderPlain do not allow nesting,
// and pass their content as a string for display

const get = ident => {
  return (
    document.querySelector(`.block#el-${ident} .content`) ||
    document.querySelector(`#el-${ident}.block.content`)
  );
};
const getRects = ident => {
  let e = get(ident);
  let r = document.createRange();
  r.setStart(first(e), 0);
  r.setEnd(last(e), last(e).length - 1);
  let c = r.getClientRects();
  return merge(c);
};
const handleEditorPaste = e => {
  e.preventDefault();
  let paste = (e.clipboardData || window.clipboardData).getData("text");
  paste = paste.split("\n");
  paste.forEach((s, idx) => {
    if (s.length > 0) {
      addText(s);
      if (idx != paste.length - 1) {
        addParagraph();
      }
    }
  });
  syncStateWithDOM();
};
const findDatasetEnd = node => {
  if (node.className && node.className.includes("block")) {
    return 0;
  }
  if (node.dataset && node.dataset.start) {
    // if(!)
    return parseInt(node.dataset.start);
  } else if (node.previousSibling && node.previousSibling.dataset.end) {
    return parseInt(node.previousSibling.dataset.end);
  }
  return findDatasetEnd(node.parentNode);
};
const find = (parent, offsetNode, offset) => {
  // console.log(offsetNode, offset);
  let startingOffset = findDatasetEnd(offsetNode);
  // console.log(startingOffset);
  return startingOffset + offset;
};
const extract = r => ({
  left: r.left,
  right: r.right,
  top: r.top,
  bottom: r.bottom
});
const closeTo = (x, y, leniency) => {
  return Math.abs(x - y) < leniency;
};
const merge = c => {
  let leniency = [...c].reduce((acc, r) => acc + r.height, 0) / c.length;
  let q = [...c]
    .map(extract)
    .sort((a, b) => a.top > b.top)
    .reduce(
      (a, e) =>
        a.length > 0 && closeTo(a[a.length - 1].top, e.top, leniency / 2)
          ? [
              ...a.slice(0, -1),
              {
                ...a[a.length - 1],
                right: Math.max(e.right, a[a.length - 1].right)
              }
            ]
          : [...a, e],
      []
    );
  let z = q.filter(a => !(a.left == a.right && a.top == a.bottom));
  console.log(c);
  return z.length > 0
    ? z
    : q.length > 1
    ? q
    : [{ ...q[0], top: q[0].top == q[0].bottom ? q[0].top - 15 : q[0].top }];
};
const handleEditorMousedown = e => {
  let range = document.caretPositionFromPoint(e.x, e.y);
  console.log(range);

  let par;
  let offsetNode = range.offsetNode;
  let offset = range.offset;
  if (range.offsetNode.id == "editor") {
    par = range.offsetNode.childNodes[range.offset];
    offsetNode = par.firstChild;
    offset = 0;
  } else if (
    range.offsetNode.className &&
    range.offsetNode.className.includes("block")
  ) {
    par = range.offsetNode;
    offsetNode = par.childNodes[range.offset];
    offset = 0;
  } else {
    par = range.offsetNode.parentElement.closest(".content");
  }
  console.log(par, e);
  if (par) {
    let parent = parseInt(par.id.split("-")[1]);
    state.cursor.para = parent;
    let o = offsetNode ? find(par, offsetNode, offset) : 0;

    state.cursor.char = o;
    state.cursor.dragging = true;
    state.cursor.endPara = state.cursor.para;
    state.cursor.endChar = state.cursor.char;
    syncStateWithDOM();
  }
};
const handleEditorMousemove = e => {
  let range = document.caretPositionFromPoint(e.x, e.y);
  let par = range.offsetNode.parentElement.closest(".block");

  if (par) {
    let parent = parseInt(par.id.split("-")[1]);
    let o = find(par, range.offsetNode, range.offset);
    if (parent != state.cursor.endPara || o != state.cursor.endChar) {
      state.cursor.endPara = parent;
      state.cursor.endChar = o;
      syncStateWithDOM();
    }
  }
};
const createCursor = () => {
  const cursor = document.createElement("div");
  cursor.id = "cursor";
  cursor.style.height = `1.2em`;
  cursor.style.width = `1px`;
  cursor.style.background = `#fff`;
  cursor.style.position = `absolute`;
  return cursor;
};
const createPasteTarget = () => {
  const target = document.createElement("textarea");
  target.id = "paste-target";
  return target;
};
const getCurrentLineNumber = () => {
  let { ranges, range } = getRanges(state.cursor);
  if (state.cursor.char + 1 <= state.content[state.cursor.para].text.length) {
    let { ranges: nextRanges, range: nextRange } = getRanges({
      para: state.cursor.para,
      char: state.cursor.char + 1
    });
    if (nextRanges.length > ranges.length) {
      let last = nextRanges.slice(-1)[0];
      last.right = last.left;
      ranges = [...ranges, last];
    }
  }
  return ranges.length - 1;
};
const getCurrentLine = () => {
  let rects = merge(state.cursor.range.getClientRects());
  return rects[rects.length - 1];
};
const getPreviousLine = () => {
  let { ranges, range } = getCursorRange();
  return ranges[ranges.length - 2];
};
const getNextLine = () => {
  let { ranges, range } = getRanges({
    para: state.cursor.para,
    char: state.content[state.cursor.para].text.length
  });

  return ranges[getCurrentLineNumber() + 1];
};

const keypress = e => {
  switch (e.which) {
    case 0:
      break;
    case 13:
      e.preventDefault();
      if (e.shiftKey) {
        addText("\n");
      } else {
        addParagraph();
      }
      break;
    default:
      e.preventDefault();
      let key = String.fromCharCode(e.which);
      if (state.cursor.char == 0) {
        switch (key) {
          case "`":
            state.content[state.cursor.para].type = "code";
            break;
          default:
            addText(key);
            break;
        }
      } else {
        addText(key);
      }
  }
  const string = state.content[state.cursor.para].text.slice(
    0,
    state.cursor.char
  );
  replacements.forEach(({ match, action }) => {
    if (match.test(string)) {
      action({
        ops: {
          text: t => {
            appendText(t);
            return {
              forward: n => {
                keydown({
                  key: "ArrowRight",
                  preventDefault: () => {}
                });
              }
            };
          }
        }
      });
    }
  });
  syncStateWithDOM();
};
const maximum = nodes => {
  if (nodes.nodeName == "#text") {
    return nodes.length;
  } else {
    return [...nodes.childNodes].reduce((acc, curr) => acc + maximum(curr), 0);
  }
};
const last = nodes => {
  if (nodes.nodeName == "#text") {
    return nodes;
  } else {
    return last([...nodes.childNodes].slice(-1)[0]);
  }
};
const first = nodes => {
  if (nodes.nodeName == "#text") {
    return nodes;
  } else {
    return first([...nodes.childNodes][0]);
  }
};
const at = (nodes, index) => {
  if (nodes.nodeName == "#text") {
    return { node: nodes, index };
  } else {
    return [...nodes.childNodes].reduce((acc, el) => {
      if (!acc.node && acc + maximum(el) >= index) {
        acc = at(el, index - acc);
      }
      if (!acc.node) {
        acc += maximum(el);
      }
      return acc;
    }, 0);
  }
};
const atOffset = (nodes, fromNode, index) => {
  if (nodes.nodeName == "#text") {
    return { node: nodes, index };
  } else {
    let acc = 0;
    let el = fromNode;
    while (true) {
      el = el.nextSibling;
      if (!el) {
        break;
      }
      if (!acc.node && acc + maximum(el) >= index) {
        acc = at(el, index - acc);
      }
      if (!acc.node) {
        acc += maximum(el);
      }
    }

    return typeof acc == "number" ? { node: fromNode, index } : acc;
  }
};
const highlightSpan = () => {
  if (state.cursor.para == state.cursor.endPara) {
    return {
      start: {
        para: state.cursor.para,
        char:
          state.cursor.char <= state.cursor.endChar
            ? state.cursor.char
            : state.cursor.endChar
      },
      ident: "highlight",
      end: {
        para: state.cursor.endPara,
        char:
          state.cursor.char <= state.cursor.endChar
            ? state.cursor.endChar
            : state.cursor.char
      }
    };
  } else if (state.cursor.para < state.cursor.endPara) {
    return {
      start: {
        para: state.cursor.para,
        char: state.cursor.char
      },
      ident: "highlight",
      end: {
        para: state.cursor.endPara,
        char: state.cursor.endChar
      }
    };
  } else if (state.cursor.para > state.cursor.endPara) {
    return {
      start: {
        para: state.cursor.endPara,
        char: state.cursor.endChar
      },
      ident: "highlight",
      end: {
        para: state.cursor.para,
        char: state.cursor.char
      }
    };
  }
};

const within = (a, b) => {
  if (b.start.para < a.start.para && a.end.para < b.end.para) {
    return true;
  } else if (b.start.para == a.start.para && a.end.para < b.end.para) {
    return b.start.char <= a.start.char;
  } else if (b.start.para < a.start.para && a.end.para == b.end.para) {
    return a.end.char <= b.end.char;
  } else if (b.start.para == a.start.para && a.end.para == b.end.para) {
    return b.start.char <= a.start.char && a.end.char <= b.end.char;
  }
  return false;
};
const token = (tag, attrs, ...children) => ({
  tag,
  attrs,
  children,
  render: () => {
    if (tag == "plain") {
      return children[0];
    } else if (tag == "command") {
      return <Command {...attrs}>{children}</Command>;
    } else if (config[tag]) {
      return config[tag].render({ ...attrs, children });
    } else {
      return React.createElement(tag, attrs, ...children);
    }
  }
});
const consume = (text, tok, end, match) => {
  if (match && typeof match == "string") {
    if (text.startsWith(match)) {
      return {
        match: true,
        ending: true,
        nest: text.slice(0, match.length),
        rest: text.slice(match.length)
      };
    } else {
      return { match: false };
    }
  } else if (match && typeof match == "function") {
    return match(text);
  }
  if (text.startsWith(tok)) {
    let rest = text.slice(1);
    let i = rest.indexOf(end);
    if (i != -1) {
      return {
        match: true,
        ending: true,
        nest: rest.slice(0, i),
        rest: rest.slice(i + 1)
      };
    } else {
      return { match: true, ending: false, nest: rest, rest: "" };
    }
  } else {
    return { match: false };
  }
};

const run = (para, idx, prev, text, plainPrefix, config) => {
  // console.log(para, idx, prev, text, (plainPrefix = ""), config);
  if (text == "") {
    return { idx, prev: [...prev, plainPrefix] };
  }
  for (const k in config) {
    const entry = config[k];
    const candidate = text.match(
      entry.match(prev.length == 0 && plainPrefix.length == 0)
    );
    if (candidate) {
      let [
        length,
        prefix_length,
        suffix_length,
        prefix,
        children,
        suffix
      ] = entry.split(candidate);
      prev = [...prev, plainPrefix + prefix];
      idx += prefix.length;
      let prefix_start = idx;
      idx += prefix_length;
      let prefix_end = idx;
      prev = [
        ...prev,
        entry.prefix({ "data-start": prefix_start, "data-end": prefix_end })
      ];
      let { prev: inner, idx: i } = run(
        para,
        idx,
        [],
        children,
        "",
        entry.filter_children(config)
      );
      idx = i;
      if (
        state.cursor.para == para &&
        state.cursor.char >= prefix_start &&
        state.cursor.char <= idx
      ) {
        prev = [
          ...prev,
          entry.edit({
            active: true,
            "data-start": prefix_end,
            "data-end": idx,
            children: inner
          })
        ];
      } else {
        prev = [
          ...prev,
          entry.render({
            active: false,
            "data-start": prefix_end,
            "data-end": idx,
            children: inner
          })
        ];
      }
      let suffix_start = idx;
      idx = idx + suffix_length;
      prev = [
        ...prev,
        entry.prefix({ "data-start": suffix_start, "data-end": idx })
      ];
      return run(para, idx, prev, suffix + text.slice(length), "", config);
    }
  }

  plainPrefix = `${plainPrefix}${text[0]}`;
  idx += 1;
  return run(para, idx, prev, text.slice(1), plainPrefix, config);
};
const getSpans = () => {
  return state.content.map((para, idx) => {
    let block = para.type;

    block = blocks[block];
    if (block && block.raw) {
      if (block.matter) {
        state.matter = { ...state.matter, ...block.matter(para.text) };
      }
      return block.render({
        plain: state.cursor.para === idx,
        id: `el-${idx}`,
        children: [para.text]
      });
    } else if (block) {
      return block.render({
        plain: state.cursor.para === idx,
        id: `el-${idx}`,
        children: run(idx, 0, [], para.text, "", inline).prev
      });
    } else {
      return blocks.default.render({
        plain: state.cursor.para === idx,
        id: `el-${idx}`,
        class: "block content",
        children: run(idx, 0, [], para.text, "", inline).prev
      });
    }
  });
};
const getCursorRange = () => {
  let { ranges, range } = getRanges(state.cursor);
  if (state.cursor.char + 1 <= state.content[state.cursor.para].text.length) {
    let { ranges: nextRanges, range: nextRange } = getRanges({
      para: state.cursor.para,
      char: state.cursor.char + 1
    });
    if (nextRanges.length > ranges.length) {
      let last = nextRanges.slice(-1)[0];
      if (ranges.length == 0 || last.top > ranges.slice(-1)[0].bottom) {
        last.right = last.left;
        ranges = [...ranges, last];
      }
    }
  }
  return { ranges, range };
};
const syncStateWithDOM = () => {
  state.matter = {};
  let spans = getSpans();
  let elements = document.querySelectorAll("#editor .block");
  elements.forEach(e => e.remove());
  let editor = document.querySelector("#editor");
  spans.flat().forEach(el => editor.appendChild(el));
  let { ranges, range } = getCursorRange();

  state.cursor.range = range;
  state.cursor.X = ranges[ranges.length - 1].right - 1;

  state.cursorElement.style.top = `${ranges[ranges.length - 1].top +
    window.scrollY}px`;
  state.cursorElement.style.left = `${ranges[ranges.length - 1].right - 1}px`;
  document.normalize();
};
const getRanges = cursor => {
  let current = get(cursor.para);
  let range = document.createRange();
  range.setStart(first(current), 0);
  let startMark = [...current.querySelectorAll("[data-end]")].filter(
    e => parseInt(e.dataset.end) <= cursor.char
  );
  let ranges = [];

  if (startMark.length == 0) {
    let { node, index } = at(current, cursor.char);
    // console.log(node, index);
    range.setEnd(node, index);
    // console.log(range);
    if (!range.collapsed) {
      ranges = merge(range.getClientRects());
    } else {
      ranges = [range.getBoundingClientRect()];
    }
  } else {
    startMark = startMark[startMark.length - 1];
    let { node, index } = atOffset(
      current,
      startMark,
      cursor.char - startMark.dataset.end
    );
    range.setEnd(node, index);
    if (!range.collapsed) {
      ranges = merge(range.getClientRects());
    } else {
      ranges = [range.getBoundingClientRect()];
    }
  }

  return { ranges, range };
};

const keydown = e => {
  switch (true) {
    case e.ctrlKey && e.key == "b":
      e.preventDefault();
      if (
        state.cursor.endPara != state.cursor.para ||
        state.cursor.endChar != state.cursor.char
      ) {
        let span = highlightSpan();
        span.ident = "b";
        state.spans.push(span);
      }
      break;
    case e.ctrlKey && e.key == "i":
      if (
        state.cursor.endPara != state.cursor.para ||
        state.cursor.endChar != state.cursor.char
      ) {
        let span = highlightSpan();
        span.ident = "i";
        state.spans.push(span);
      }
      e.preventDefault();
      break;
    case e.ctrlKey && e.key == "v":
      break;
    case e.ctrlKey && e.key == "c":
      e.preventDefault();
      break;
    case e.ctrlKey && e.key == "m":
      e.preventDefault();
      break;
    case e.ctrlKey && e.key == "#":
      e.preventDefault();
      break;
    case e.key == "ArrowLeft":
      e.preventDefault();

      state.cursor.char -= 1;
      if (state.cursor.char < 0) {
        if (state.cursor.para === 0) {
          state.cursor.char = 0;
          let k = 1 / 0;
        } else {
          state.cursor.para -= 1;
          let current = get(state.cursor.para);
          let max = state.content[state.cursor.para].text.length;
          state.cursor.char = max;
        }
      }

      break;
    case e.key == "ArrowRight":
      e.preventDefault();
      let current = get(state.cursor.para);
      let max = state.content[state.cursor.para].text.length;
      state.cursor.char += 1;
      if (state.cursor.char > max) {
        if (state.cursor.para == state.content.length - 1) {
          state.cursor.char = max;
        } else {
          state.cursor.para += 1;
          state.cursor.char = 0;
        }
      }
      break;
    case e.key == "ArrowUp":
      e.preventDefault();
      if (getCurrentLineNumber() != 0) {
        let target = getPreviousLine();
        let current = getCurrentLine();

        handleEditorMousedown({
          x: state.cursor.X,
          y: (target.bottom + target.top) / 2
        });
      } else if (state.cursor.para > 0) {
        let rects = getRects(state.cursor.para - 1);
        let current = getCurrentLine();
        handleEditorMousedown({
          x: state.cursor.X,
          y: rects[rects.length - 1].top
        });
      }
      break;
    case e.key == "ArrowDown":
      e.preventDefault();

      if (getCurrentLineNumber() < getRects(state.cursor.para).length - 1) {
        let target = getNextLine();
        let current = getCurrentLine();
        handleEditorMousedown({
          x: state.cursor.X,
          y: (target.bottom + target.top) / 2
        });
      } else if (state.cursor.para < state.content.length - 1) {
        let rects = getRects(state.cursor.para + 1);
        let current = getCurrentLine();
        handleEditorMousedown({
          x: state.cursor.X,
          y: (rects[0].top + rects[0].bottom) / 2
        });
      }
      break;
    case e.key == "Backspace":
      e.preventDefault();
      state.cursor.char -= 1;
      if (state.cursor.char < 0) {
        if (state.cursor.para === 0) {
          state.cursor.char = 0;
        } else {
          state.cursor.para -= 1;
          let current = get(state.cursor.para);
          let max = maximum(current);
          state.cursor.char = max;
          state.content[state.cursor.para].text +=
            state.content[state.cursor.para + 1].text;
          state.content.splice(state.cursor.para + 1, 1);
        }
      } else {
        let t = state.content[state.cursor.para].text;
        state.content[state.cursor.para].text =
          t.slice(0, state.cursor.char) + t.slice(state.cursor.char + 1);
      }
      break;
    case e.key == "Delete":
      e.preventDefault();
      break;
    default:
      break;
  }
  syncStateWithDOM();
};
