document.addEventListener("DOMContentLoaded", () => {
  inflateEditor();
});
let state = {
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
      text:
        "In mathematical logic, a sentence of a predicate logic is a boolean-valued well-formed formula with no free variables. A sentence can be viewed as expressing a proposition, something that must be true or false. The restriction of having no free variables is needed to make sure that sentences can have concrete, fixed truth values: As the free variables of a (general) formula can range over several values, the truth value of such a formula may vary. ",
      rects: []
    },
    {
      text: "Sentences without any logical connectives.",
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
    endPara: 0,
    endChar: 0,
    dragging: false,
    range: document.createRange()
  },
  cursorElement: undefined,
  editorElement: undefined
};
const inflateEditor = () => {
  const editor = document.getElementById("editor");
  const cursor = createCursor();
  state.editorElement = editor;
  state.cursorElement = cursor;

  let p = create("p", 0);
  editor.appendChild(cursor);
  editor.appendChild(p);

  window.addEventListener("keypress", e => (state.focus ? keypress(e) : null));
  window.addEventListener("keydown", e => (state.focus ? keydown(e) : null));
  window.addEventListener("paste", e => handleEditorPaste(e));

  editor.addEventListener("mousedown", e => {
    handleEditorMousedown(e);
  });
  editor.addEventListener("mousemove", e => {
    if (state.cursor.dragging) {
      handleEditorMousemove(e);
    }
  });
  editor.addEventListener("mouseup", e => {
    state.cursor.dragging = false;
  });
  syncStateWithDOM();
};
const create = (tag, ident) => {
  let el = document.createElement(tag);
  el.className = "block content";
  el.id = `el-${ident}`;
  el.innerText = "";
  return el;
};
const createSpan = ident => {
  let el = document.createElement("span");
  el.className = ident;
  el.id = `span-${ident}`;
  el.innerText = "";
  return el;
};
const createNoBreak = () => {
  let el = document.createElement("span");
  el.className = "nowrap";
  el.innerText = "";
  return el;
};

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
  //console.log(state.content);
  syncStateWithDOM();
};
const find = (parent, offsetNode, offset) => {
  if (parent == offsetNode) {
    return offset;
  } else {
    let o = 0;
    let b = false;
    [...parent.childNodes].forEach(e => {
      if (!b) {
        if (e.contains(offsetNode)) {
          b = e;
        } else {
          o += maximum(e);
        }
      }
    });
    //console.log(offset);
    return find(b, offsetNode, o + offset);
  }
};
const extract = r => ({
  left: r.left,
  right: r.right,
  top: r.top,
  bottom: r.bottom
});
const merge = c => {
  let q = [...c]
    .map(extract)
    .sort((a, b) => a.top > b.top)
    .reduce(
      (a, e) =>
        a.length > 0 && a[a.length - 1].top == e.top
          ? [...a.slice(0, -1), { ...a[a.length - 1], right: e.right }]
          : [...a, e],
      []
    );
  let z = q.filter(a => a.left != a.right && a.top != a.bottom);
  return z.length > 0
    ? z
    : q.length > 1
    ? q
    : [{ ...q[0], top: q[0].top == q[0].bottom ? q[0].top - 15 : q[0].top }];
};
const handleEditorMousedown = e => {
  let range = document.caretPositionFromPoint(e.x, e.y);
  let par = range.offsetNode.parentElement.closest(".block");

  if (par) {
    let parent = parseInt(par.id.split("-")[1]);
    state.cursor.para = parent;
    let o = find(par, range.offsetNode, range.offset);
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
  cursor.style.width = `2px`;
  cursor.style.background = `#2196f3`;
  cursor.style.position = `absolute`;
  return cursor;
};
const createPasteTarget = () => {
  const target = document.createElement("textarea");
  target.id = "paste-target";
  return target;
};
const getCurrentLineNumber = () => {
  return merge(state.cursor.range.getClientRects()).length - 1;
};
const getCurrentLine = () => {
  let rects = merge(state.cursor.range.getClientRects());
  return rects[rects.length - 1];
};
const getPreviousLine = () => {
  let rects = merge(state.cursor.range.getClientRects());
  return rects[rects.length - 2];
};
const getNextLine = () => {
  let rects = getRects(state.cursor.para);
  //console.log(rects, getCurrentLineNumber());
  return rects[getCurrentLineNumber() + 1];
};
const keypress = e => {
  switch (e.which) {
    case 0:
      break;
    case 13:
      e.preventDefault();
      //console.log(`Keypress: Enter`);
      addParagraph();
      break;
    default:
      e.preventDefault();
      let key = String.fromCharCode(e.which);
      //console.log(`Keypress: `, key);
      addText(key);
  }
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
const getSpans = () => {
  let endpoints = [...state.spans, highlightSpan()]
    .reduce(
      (acc, span) => [...acc, span.start, span.end],
      state.content.map((c, i) => ({ para: i, char: 0 }))
    )
    .sort((a, b) =>
      a.para == b.para ? (a.char < b.char ? -1 : 1) : a.para < b.para ? -1 : 1
    );
  endpoints = [
    ...endpoints,
    ...state.content
      .map((p, i) => [{ para: i, char: 0 }, { para: i, char: p.text.length }])
      .reduce((a, e) => [...a, ...e], []),
    {
      para: state.cursor.endPara,
      char: state.cursor.endChar
    },
    {
      para: state.cursor.para,
      char: state.cursor.char
    }
  ].sort((a, b) =>
    a.para == b.para ? (a.char < b.char ? -1 : 1) : a.para < b.para ? -1 : 1
  );

  return [
    ...state.spans,
    {
      start: { para: 0, char: 0 },
      ident: "t",
      end: {
        para: state.content.length - 1,
        char: state.content[state.content.length - 1].text.length
      }
    },
    highlightSpan()
  ]
    .map(s =>
      endpoints
        .filter(
          e =>
            (e.para > s.start.para && e.para < s.end.para) ||
            (s.start.para == s.end.para &&
              s.start.para == e.para &&
              e.char >= s.start.char &&
              e.char <= s.end.char) ||
            (s.start.para != s.end.para &&
              e.para == s.start.para &&
              e.char >= s.start.char) ||
            (s.start.para != s.end.para &&
              e.para == s.end.para &&
              e.char <= s.end.char)
        )
        .reduce(
          (acc, p) =>
            acc.length == 0
              ? [[p]]
              : [...acc.slice(0, -1), [acc[acc.length - 1][0], p], [p]],
          []
        )
    )
    .map((e, idx) =>
      e
        .filter(p => p.length > 1)
        .map(p => ({
          ident: [
            ...state.spans,
            {
              start: { para: 0, char: 0 },
              ident: "t",
              end: {
                para: state.content.length - 1,
                char: state.content[state.content.length - 1].text.length
              }
            },
            highlightSpan()
          ][idx].ident,
          from: p[0],
          to: p[1]
        }))
    )
    .reduce((acc, el) => [...acc, ...el])
    .sort((a, b) =>
      a.from.para == b.from.para
        ? a.from.char < b.from.char
          ? -1
          : 1
        : a.from.para < b.from.para
        ? -1
        : 1
    )
    .filter(e => !(e.from.para == e.to.para && e.from.char == e.to.char))
    .reduce((a, e) => {
      return a.length == 0
        ? [e]
        : e.from.para == a[a.length - 1].from.para &&
          e.from.char == a[a.length - 1].from.char &&
          e.to.para == a[a.length - 1].to.para &&
          e.to.char == a[a.length - 1].to.char
        ? [
            ...a.slice(0, -1),
            { ...e, ident: a[a.length - 1].ident + " " + e.ident }
          ]
        : [...a, e];
    }, [])
    .filter(e => e.from.para == e.to.para)
    .filter(e => !(e.from.para == e.to.para && e.from.char == e.to.char));
};
const syncStateWithDOM = () => {
  let spans = getSpans();
  let m = {};
  spans.forEach(s => {
    m[s.from.para] = m[s.from.para] || [];
    m[s.from.para].push(s);
  });

  let newElements = state.content.map((para, idx) => {
    let current = null;
    switch (true) {
      case state.content[idx].text.startsWith("##"):
        current = create("h2", idx);
        break;
      case state.content[idx].text.startsWith("#"):
        current = create("h1", idx);
        break;
      case state.content[idx].text.startsWith(">"):
        current = create("blockquote", idx);
        break;
      default:
        current = create("p", idx);
        break;
    }
    let t = state.content[idx].text;
    let parts = m[idx];
    parts = parts.map(p => {
      let styled = createSpan(p.ident);
      styled.append(t.slice(p.from.char, p.to.char));
      return styled;
    });
    current.append(...parts);

    return current;
  });
  let elements = document.querySelectorAll("#editor .block");
  elements.forEach(e => e.remove());
  newElements.forEach(e => state.editorElement.appendChild(e));
  let current = get(state.cursor.para);

  state.cursor.range.setStart(first(current), 0);
  let { node, index } = at(current, state.cursor.char);
  state.cursor.range.setEnd(node, index);
  let ranges = merge(state.cursor.range.getClientRects());
  //console.log(ranges, state.cursor.range);
  state.cursorElement.style.top = `${ranges[ranges.length - 1].top}px`;
  state.cursorElement.style.left = `${ranges[ranges.length - 1].right - 1}px`;
};
const addText = text => {
  let t = state.content[state.cursor.para].text;
  t = `${t.slice(0, state.cursor.char)}${text}${t.slice(state.cursor.char)}`;
  state.content[state.cursor.para].text = t;
  state.cursor.char += text.length;
};
const inspect = a => console.log(JSON.parse(JSON.stringify(a)));
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
          let max = maximum(current);
          state.cursor.char = max;
        }
      }

      break;
    case e.key == "ArrowRight":
      e.preventDefault();
      let current = get(state.cursor.para);
      let max = maximum(current);
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
          x: current.right,
          y: (target.bottom + target.top) / 2
        });
      } else if (state.cursor.para > 0) {
        let rects = getRects(state.cursor.para - 1);
        let current = getCurrentLine();
        handleEditorMousedown({
          x: current.right,
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
          x: current.right,
          y: (target.bottom + target.top) / 2
        });
      } else if (state.cursor.para < state.content.length - 1) {
        let rects = getRects(state.cursor.para + 1);
        let current = getCurrentLine();
        handleEditorMousedown({
          x: current.right,
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
