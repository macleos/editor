const keyToOperation = (key, arg, operations) => {
  switch (key) {
    case "RETURN":
      return operations.newline();
    case "ARROWLEFT":
      return operations.left();
    case "ARROWRIGHT":
      return operations.right();
    case "ARROWUP":
      return operations.up();
    case "ARROWDOWN":
      return operations.down();
    case "BACKSPACE":
      return operations.backspace();
    case "DELETE":
      return operations.delete();
    case "TEXT":
      return operations.insert(arg);
  }
};
const keys = {
  RETURN: e => e.which == 13,
  ARROWLEFT: e => e.key == "ArrowLeft",
  ARROWRIGHT: e => e.key == "ArrowRight",
  ARROWUP: e => e.key == "ArrowUp",
  ARROWDOWN: e => e.key == "ArrowDown",
  BACKSPACE: e => e.key == "Backspace",
  DELETE: e => e.key == "Delete",
  TEXT: e => true
};

export const run_operation = operations => e =>
  keyToOperation(
    Object.keys(keys).find(k => keys[k](e)),
    String.fromCharCode(e.which),
    operations
  );

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
