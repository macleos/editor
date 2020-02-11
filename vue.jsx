const React = {
  createElement: function(tag, attrs, ...children) {
    let element = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).map(k => (element[k] = attrs[k]));
    }
    children.map(c =>
      typeof c == "string"
        ? element.appendChild(document.createTextNode(c))
        : element.appendChild(c)
    );
    return element;
  }
};
import emojiMap from "./emoji.json";

var idx = 0;

const render = () => {
  const editor = document.getElementById("editor");
  editor.appendChild(
    <div
      className="container rte"
      onMouseDown={click}
      onMouseMove={mouseContinue}
      onMouseUp={upClick}
      onPaste={paste}
    >
      <div className="article-text-template">{rendered}</div>
      <textarea
        id="faketextarea"
        style="position:absolute;top:200px"
      ></textarea>
    </div>
  );
};
export default {
  render: function(h) {
    this.h = h;
    return this.getContainerDiv(h, [
      this.getArticleTemplateDiv(h, this.rendered),
      this.renderFakeCopyArea(h)
    ]);
  },
  name: "SimpleEditor",
  props: ["value", "id", "types", "editable"],
  mounted() {
    window.addEventListener("keypress", e => this.keypress(e));
    window.addEventListener("keydown", e => this.keydown(e));

    var vm = this;
    // setInterval(() => {
    //   this.$save("text", this.value, function(err) {
    //     ////////console.log(err);
    //   });
    // }, 5000);
    setInterval(() => {
      if (Date.now() - vm.lastMove > 500) {
        vm.iter = "infinite";
      }
    }, 500);
  },

  methods: {
    renderFakeCopyArea(h) {
      var self = this;
      return h("textarea", {
        attrs: {
          id: "faketextarea"
        },
        style: { position: "absolute", top: "200px" }
      });
    },

    renderShadow: function(h, cursor) {
      return this.editable
        ? this.asRender(
            h,
            this.value.slice(0, cursor),
            h("div", {
              style: {
                visibility: "visible"
              },
              class: {
                cursor: true
              }
            })
          )
        : h();
    },

    getArticleTemplateDiv: function(h, children) {
      return h(
        "div",
        {
          class: {
            "article-text-template": true
          }
        },
        children
      );
    },
    parseEmoji: function(word) {
      return this.emojis[word] != undefined
        ? this.emojis[word]
            .split("?")[0]
            .split("/")
            .pop()
        : "1f60d.png";
    },

    click: function(e) {
      this.cursor = this.cursorFromPoint(e.clientX, e.clientY);
      // this.selection_start = this.cursorFromthis.renderCursor(this.cursor);
      // this.selection_end = this.cursorFromthis.renderCursor(this.cursor);
      // this.selecting = true;
    },
    mouseContinue: function(e) {
      // if (this.selecting) {
      //   this.selection_end = this.cursorFromPoint(e.clientX, e.clientY);
      //   // if(this.selection_end.word < this.selection_start.word){
      //   //   var temp = this.cursorFromthis.renderCursor(this.selection_end)
      //   //   this.selection_end = this.cursorFromthis.renderCursor(this.selection_start)
      //   //   this.selection_start = temp
      //   // }
      //   this.cursor = this.cursorFromthis.renderCursor(this.selection_end);
      // }
    },
    upClick: function(e) {
      // this.selection_end = this.cursorFromPoint(e.clientX, e.clientY);
      // this.selecting = false;
      // this.lastCursorPos = { x: e.clientX, y: e.clientY };
      // ////////console.log(this.getSelectionText());
    },

    cursorFromPoint: function(x, y) {
      var caret = document.caretRangeFromPoint(x, y);

      if (
        caret.startContainer.nodeName == "#text" &&
        caret.startContainer.previousElementSibling
      ) {
        return (
          parseInt(
            caret.startContainer.previousElementSibling.id
              .split("-")
              .slice(-1)[0]
          ) + caret.startOffset
        );
      } else if (caret.startContainer.nodeName == "#text") {
        return (
          caret.startOffset +
          parseInt(caret.startContainer.parentElement.id.split("-")[1])
        );
      } else {
        return parseInt(caret.startContainer.id.split("-").slice(-1)[0]);
      }
    },

    // getSelectionRange: function() {
    //   if (!this.selection_start || !this.selection_end) {
    //     return [this.cursor.word];
    //   }
    //   var start = Math.min(this.selection_start.word, this.selection_end.word);

    //   var end = Math.max(this.selection_start.word, this.selection_end.word);

    //   ////////console.log(end - start + 1);
    //   return [...Array(end - start + 1).keys()].map(n => n + start);
    // },
    // getSelectionText() {
    //   var selectedWords = this.getSelectionRange();
    //   return selectedWords.map(w => this.words[w].text).join(" ");
    // },

    keypress: function(e) {
      if (this.editable) {
        switch (true) {
          case e.which == 0:
            break;
          case e.which == 13:
            e.preventDefault();

            var t = Date.now();
            this.iter = 0;
            this.lastMove = Date.now();
            // this.selection_start = false;
            this.$emit(
              "input",
              this.value.slice(0, this.cursor) +
                "\n" +
                this.value.slice(this.cursor)
            );
            this.cursor = Math.min(this.length() + 1, this.cursor + 1);
            break;
          default:
            e.preventDefault();

            var t = Date.now();
            this.iter = 0;
            this.lastMove = Date.now();
            // this.selection_start = false;
            this.$emit(
              "input",
              this.value.slice(0, this.cursor) +
                String.fromCharCode(e.which) +
                this.value.slice(this.cursor)
            );
            this.cursor = Math.min(this.length() + 1, this.cursor + 1);
        }
      } else {
        return false;
      }
    },
    length() {
      return this.value.length;
    },
    paste: function(e) {
      this.toPasteText = e.clipboardData.getData("Text");
      this.$emit(
        "input",
        this.value.slice(0, this.cursor) +
          this.toPasteText +
          this.value.slice(this.cursor)
      );
      this.cursor = Math.min(
        this.length() + 1,
        this.cursor + this.toPasteText.length
      );
      document.getElementById("faketextarea").value = "";
      document.getElementsByClassName("article-text-template")[0].focus();
      return true;
    },
    keydown: function(e) {
      if (this.editable) {
        switch (true) {
          case e.ctrlKey && e.key == "b":
            e.preventDefault();
            break;

          case e.ctrlKey && e.key == "i":
            e.preventDefault();

            break;

          case e.ctrlKey && e.key == "v":
            document.getElementById("faketextarea").focus();

            break;
          case e.ctrlKey && e.key == "c":
            //e.preventDefault();
            // ////////console.log("copy");
            // this.$copyText(this.getSelectionText()).then(
            //   function(e) {
            //     ////////console.log(e);
            //   },
            //   function(e) {
            //     ////////console.log(e);
            //   }
            // );
            break;
          case e.ctrlKey && e.key == "m":
            e.preventDefault();
            // this.words = this.formatWordsToType(
            //   this.getSelectionRange(),
            //   "math"
            // );

            break;

          case e.ctrlKey && e.key == "#":
            e.preventDefault();

            break;

          case e.key == "ArrowLeft":
            this.iter = 0;

            this.lastMove = Date.now();
            this.cursor = Math.max(0, this.cursor - 1);
            this.selection_start = false;
            //this.moveLeft(1, this.cursor);

            break;
          case e.key == "ArrowRight":
            this.iter = 0;
            this.lastMove = Date.now();

            this.cursor = Math.min(this.length(), this.cursor + 1);

            this.selection_start = false;

            //this.moveRight(1, this.cursor);

            break;
          case e.key == "ArrowUp":
            this.iter = 0;

            this.lastMove = Date.now();
            var getcand = n => {
              var rect = document
                .getElementsByClassName("cursor")[0]
                .getBoundingClientRect();
              var new_x = rect.left;
              var new_y = rect.top - n * (rect.bottom - rect.top);
              var candidate = this.cursorFromPoint(new_x, new_y);
              return candidate;
            };
            var c = getcand(1);
            if (c == this.cursor) {
              c = getcand(2);
              if (c == this.cursor) {
                c = getcand(3);
              }
            }
            this.cursor = c ? c : this.cursor;

            this.selection_start = false;
            //this.moveLeft(1, this.cursor);

            break;
          case e.key == "ArrowDown":
            this.iter = 0;
            this.lastMove = Date.now();
            var getcand = n => {
              var rect = document
                .getElementsByClassName("cursor")[0]
                .getBoundingClientRect();
              var new_x = rect.left;
              var new_y = rect.bottom + n * (rect.bottom - rect.top);
              var candidate = this.cursorFromPoint(new_x, new_y);
              return candidate;
            };
            var c = getcand(1);
            if (c == this.cursor) {
              c = getcand(2);
              if (c == this.cursor) {
                c = getcand(3);
              }
            }
            this.cursor = c ? c : this.cursor;
            this.selection_start = false;

            //this.moveRight(1, this.cursor);

            break;

          case e.key == "Backspace":
            this.$emit(
              "input",
              this.value.slice(0, Math.max(0, this.cursor - 1)) +
                this.value.slice(this.cursor)
            );
            this.cursor = Math.max(0, this.cursor - 1);

            break;
          case e.key == "Delete":
            e.preventDefault();
            this.$emit(
              "input",
              this.value.slice(0, this.cursor) +
                this.value.slice(this.cursor + 1)
            );

            break;

          default:
            break;
        }
      } else {
        return false;
      }
    },

    outerStarting() {
      return [
        "PARAGRAPH",
        "HEADINGONE",
        "HEADINGTWO",
        "BLOCKQUOTE",
        "CODEBLOCK",
        "IMAGE",
        "DATASECTION"
      ];
    },
    paragraphLevelConfig() {
      return {
        PARAGRAPH: { tag: "p", start: "", end: "" },
        HEADINGONE: { tag: "h1", start: "#", end: "" },
        HEADINGTWO: { tag: "h2", start: "##", end: "" },
        CODEBLOCK: { tag: "pre", start: "`", end: "`\n" },
        BLOCKQUOTE: { tag: "blockquote", start: ">", end: "" },
        IMAGE: { tag: "img", start: "!", end: "" },
        DATASECTION: { tag: "pre", start: "+", end: "+\n" }
      };
    },
    outerMapping() {
      return {
        PARAGRAPH: "p",
        HEADINGONE: "h1",
        HEADINGTWO: "h2",
        CODEBLOCK: "pre",
        BLOCKQUOTE: "blockquote",
        IMAGE: "p",
        DATASECTION: "pre"
      };
    },
    outerRenderChars() {
      return {
        PARAGRAPH: "",
        HEADINGONE: "#",
        HEADINGTWO: "##",
        CODEBLOCK: "`",
        BLOCKQUOTE: ">",
        IMAGE: "!",
        ENDCODEBLOCK: "`\n",
        DATASECTION: "+",
        ENDDATASECTION: "+\n"
      };
    },
    outerRender(h, parsed) {
      idx = 0;
      var candidate_rendered;
      if (parsed.length > 0) {
        candidate_rendered = parsed.map(block => {
          var config = this.paragraphLevelConfig()[block.start];
          if (block.start != "IMAGE" && block.start != "DATASECTION") {
            var pre = [h()];
            if (
              idx <= this.cursor &&
              this.cursor <= idx + this.outerRenderChars()[block.start].length
            ) {
              pre = [
                h(
                  "kbd",
                  {
                    attrs: {
                      id:
                        block.start +
                        "-" +
                        idx +
                        "-" +
                        (idx + this.outerRenderChars()[block.start].length)
                    }
                  },
                  [
                    "",
                    this.outerRenderChars()[block.start].slice(
                      0,
                      this.cursor - idx
                    ),
                    this.renderCursor(h, idx),
                    this.outerRenderChars()[block.start].slice(
                      this.cursor - idx
                    )
                  ]
                )
              ];
            } else {
              pre = [
                h(
                  "kbd",
                  {
                    attrs: {
                      id:
                        block.start +
                        "-" +
                        idx +
                        "-" +
                        (idx + this.outerRenderChars()[block.start].length)
                    }
                  },
                  [this.outerRenderChars()[block.start]]
                )
              ];
            }

            idx += this.outerRenderChars()[block.start].length;
            var tempidx = idx;
            var inner = this.innerRender(h, block.contents);

            var post = [h()];
            if (this.outerRenderChars()[block.end]) {
              if (
                idx <= this.cursor &&
                this.cursor < idx + this.outerRenderChars()[block.end].length
              ) {
                post = [
                  h(
                    "kbd",
                    {
                      attrs: {
                        id:
                          block.end +
                          "-" +
                          idx +
                          "-" +
                          (idx + this.outerRenderChars()[block.end].length)
                      }
                    },
                    [
                      "",
                      this.outerRenderChars()[block.end].slice(
                        0,
                        this.cursor - idx
                      ),
                      this.renderCursor(h, idx),
                      this.outerRenderChars()[block.end].slice(
                        this.cursor - idx
                      )
                    ]
                  )
                ];
              } else {
                post = [
                  h(
                    "kbd",
                    {
                      attrs: {
                        id:
                          block.end +
                          "-" +
                          idx +
                          "-" +
                          (idx + this.outerRenderChars()[block.end].length)
                      }
                    },
                    [this.outerRenderChars()[block.end]]
                  )
                ];
              }

              idx += this.outerRenderChars()[block.end].length;
            } else {
              post = h(
                "kbd",
                { attrs: { id: block.start + "-" + tempidx } },
                this.outerRenderChars()[block.end]
              );
              idx += 1;
            }
            var individual_rendered = h(
              this.outerMapping()[block.start],
              {
                attrs: { id: block.start + "-" + idx },
                class: { [block.start]: true }
              },
              [...pre, ...inner, ...post]
            );
            return individual_rendered;
          } else if (block.start == "IMAGE") {
            var pre = [h()];
            if (
              idx <= this.cursor &&
              this.cursor <= idx + this.outerRenderChars()[block.start].length
            ) {
              pre = [
                h(
                  "kbd",
                  {
                    attrs: {
                      id:
                        block.start +
                        "-" +
                        idx +
                        "-" +
                        (idx + this.outerRenderChars()[block.start].length)
                    }
                  },
                  [
                    "",
                    this.outerRenderChars()[block.start].slice(
                      0,
                      this.cursor - idx
                    ),
                    this.renderCursor(h, idx),
                    this.outerRenderChars()[block.start].slice(
                      this.cursor - idx
                    )
                  ]
                )
              ];
            } else {
              pre = [
                h(
                  "kbd",
                  {
                    attrs: {
                      id:
                        block.start +
                        "-" +
                        idx +
                        "-" +
                        (idx + this.outerRenderChars()[block.start].length)
                    }
                  },
                  [this.outerRenderChars()[block.start]]
                )
              ];
            }

            idx += this.outerRenderChars()[block.start].length;
            var tempidx = idx;
            var inner = this.innerRender(h, block.contents);
            var post = [h()];

            post = h(
              "kbd",
              {
                attrs: {
                  id: block.start + "-" + idx + "-" + idx
                }
              },
              []
            );
            idx += 1;

            var individual_rendered = h(
              this.outerMapping()[block.start],
              {
                attrs: {
                  id: block.start + "-" + tempidx + "-" + idx
                },
                class: { [block.start]: true }
              },
              [
                ...pre,
                ...inner,
                h(
                  "img",
                  {
                    class: { img: true },
                    attrs: {
                      src: block.contents.join("")
                    }
                  },
                  []
                ),
                ...post
              ]
            );
            return individual_rendered;
          } else {
            var pre = [h()];
            if (
              idx <= this.cursor &&
              this.cursor <= idx + this.outerRenderChars()[block.start].length
            ) {
              pre = [
                h(
                  "kbd",
                  {
                    attrs: {
                      id:
                        block.start +
                        "-" +
                        idx +
                        "-" +
                        (idx + this.outerRenderChars()[block.start].length)
                    }
                  },
                  [
                    "",
                    this.outerRenderChars()[block.start].slice(
                      0,
                      this.cursor - idx
                    ),
                    this.renderCursor(h, idx),
                    this.outerRenderChars()[block.start].slice(
                      this.cursor - idx
                    )
                  ]
                )
              ];
            } else {
              pre = [
                h(
                  "kbd",
                  {
                    attrs: {
                      id:
                        block.start +
                        "-" +
                        idx +
                        "-" +
                        (idx + this.outerRenderChars()[block.start].length)
                    }
                  },
                  [this.outerRenderChars()[block.start]]
                )
              ];
            }

            idx += this.outerRenderChars()[block.start].length;
            var tempidx = idx;
            var inner = this.innerRender(h, block.contents);
            var pairs = block.contents
              .join("")
              .split("\n")
              .filter(a => a != "")
              .map(a => a.split(" : "))
              .filter(a => a.length >= 2);
            pairs.forEach(element => {
              try {
                this.pageData[element[0]] = eval(element[1]);
              } catch (e) {
                this.pageData[element[0]] = element[1];
              }
            });
            var post = [h()];
            if (this.outerRenderChars()[block.end]) {
              if (
                idx <= this.cursor &&
                this.cursor < idx + this.outerRenderChars()[block.end].length
              ) {
                post = [
                  h(
                    "kbd",
                    {
                      attrs: {
                        id:
                          block.end +
                          "-" +
                          idx +
                          "-" +
                          (idx + this.outerRenderChars()[block.end].length)
                      }
                    },
                    [
                      "",
                      this.outerRenderChars()[block.end].slice(
                        0,
                        this.cursor - idx
                      ),
                      this.renderCursor(h, idx),
                      this.outerRenderChars()[block.end].slice(
                        this.cursor - idx
                      )
                    ]
                  )
                ];
              } else {
                post = [
                  h(
                    "kbd",
                    {
                      attrs: {
                        id:
                          block.end +
                          "-" +
                          idx +
                          "-" +
                          (idx + this.outerRenderChars()[block.end].length)
                      }
                    },
                    [this.outerRenderChars()[block.end]]
                  )
                ];
              }

              idx += this.outerRenderChars()[block.end].length;
            } else {
              post = h(
                "kbd",
                { attrs: { id: block.start + "-" + tempidx } },
                this.outerRenderChars()[block.end]
              );
              idx += 1;
            }
            var individual_rendered = h(
              this.outerMapping()[block.start],
              {
                attrs: { id: block.start + "-" + idx },
                class: { [block.start]: true }
              },
              [...pre, ...inner, ...post]
            );
            return individual_rendered;
          }
        });
        if (
          parsed[parsed.length - 1].end.match(/^END*/) &&
          this.cursor == this.value.length
        ) {
          candidate_rendered.push(
            h("p", { attrs: { id: "PARAGRAPH-" + this.value.length } }, [
              this.renderCursor(h, idx)
            ])
          );
        }
      } else {
        candidate_rendered = [
          h("p", { attrs: { id: "PARAGRAPH-0" } }, [this.renderCursor(h, idx)])
        ];
      }

      return candidate_rendered;
    },
    buildOptions(
      identifier,
      startIndex,
      endIndex = startIndex,
      extraOptions = {}
    ) {
      extraOptions.attrs = extraOptions.attrs ? extraOptions.attrs : {};
      extraOptions.class = extraOptions.class ? extraOptions.class : {};
      extraOptions.attrs.id = `${identifier}-${startIndex}-${endIndex}`;
      extraOptions.class[identifier] = true;
      extraOptions.key =
        extraOptions.key == false ? undefined : extraOptions.attrs.id;
      return extraOptions;
    },
    renderCursor(h) {
      return h(
        "span",
        this.buildOptions("cursor", this.cursor, this.cursor, {
          style: { visibility: this.editable ? "visible" : "hidden" },
          key: "cursor-" + this.cursor
        }),
        []
      );
    },
    shouldRenderControlCharacters(startIndex, endIndex, cursor) {
      if (cursor == startIndex || cursor == endIndex) {
        return "RENDER_WITH_CONTROL_WITHOUT_CURSOR";
      } else if (startIndex + 1 <= cursor && cursor <= endIndex - 1) {
        return "RENDER_WITH_CONTROL_WITH_CURSOR";
      } else {
        return "RENDER_WITHOUT_CONTROL_WITHOUT_CURSOR";
      }
    },
    shouldRenderCursor(startIndex, endIndex, cursor) {
      return startIndex <= cursor && cursor <= endIndex;
    },
    renderControlCharacter(h, character, identifier, index) {
      return h(
        "kbd",
        this.buildOptions(identifier, index, index + 1),
        character
      );
    },
    spanRender(h, current) {
      ////console.log(current);
      var built = [];
      var config = this.config()[current.start.toLowerCase() + "Config"];
      var innerContent = current.contents.join("");
      var containsCursor =
        idx <= this.cursor && this.cursor <= idx + innerContent.length + 2;
      var shouldRenderCursor =
        config.renderForCursor.renderCursor != false &&
        idx < this.cursor &&
        this.cursor < idx + innerContent.length + 2;
      var shouldRenderCursorAfter =
        this.cursor == idx + innerContent.length + 2;
      var startControl = containsCursor
        ? config.renderForCursor.start
        : config.renderNoCursor.start;
      var endControl = containsCursor
        ? config.renderForCursor.end
        : config.renderNoCursor.end;
      var tag = containsCursor
        ? config.renderForCursor.innerTag
        : config.renderNoCursor.innerTag;
      built.push(
        this.renderControlCharacter(h, startControl, current.start, idx)
      );
      idx += 1;
      var prev_idx = idx;
      var renderChildren;
      ////console.log(innerContent);
      if (containsCursor && shouldRenderCursor) {
        renderChildren = [
          config.renderForCursor.innerContentTransform
            ? config.renderForCursor.innerContentTransform(
                innerContent.slice(0, this.cursor - idx)
              )
            : innerContent.slice(0, this.cursor - idx),
          this.renderCursor(h),
          config.renderForCursor.innerContentTransform
            ? config.renderForCursor.innerContentTransform(
                innerContent.slice(this.cursor - idx)
              )
            : innerContent.slice(this.cursor - idx)
        ];
      } else if (!containsCursor) {
        renderChildren = config.renderNoCursor.innerContentTransform
          ? config.renderNoCursor.innerContentTransform(innerContent)
          : config.renderNoCursor.innerOptions
          ? []
          : [innerContent];
      } else {
        renderChildren = config.renderForCursor.innerContentTransform
          ? config.renderForCursor.innerContentTransform(innerContent)
          : innerContent;
      }
      ////console.log(innerContent);
      built.push(
        h(
          tag,
          this.buildOptions(
            current.start,
            idx,
            idx + innerContent.length,
            !containsCursor && config.renderNoCursor.innerOptions
              ? config.renderNoCursor.innerOptions(innerContent)
              : config.renderForCursor.innerOptions
              ? config.renderForCursor.innerOptions(innerContent)
              : { class: { WITH_CURSOR: true } }
          ),
          renderChildren
        )
      );
      idx = prev_idx + innerContent.length;
      ////console.log(current);
      if (current.end.match(/^END/)) {
        built.push(
          this.renderControlCharacter(h, endControl, current.start, idx)
        );
        idx += 1;
      }
      if (shouldRenderCursorAfter) {
        built.push(this.renderCursor(h));
      }
      return built;
    },
    innerRender(h, parsed) {
      return parsed.reduce((built, current) => {
        if (!current.start) {
          switch (
            this.shouldRenderCursor(idx, idx + current.length, this.cursor)
          ) {
            case true:
              built.push(current.slice(0, this.cursor - idx));
              built.push(this.renderCursor(h, idx));
              built.push(current.slice(this.cursor - idx));
              idx += current.length;
              break;
            case false:
              idx += current.length;
              built.push(current);
              break;
          }
        } else {
          built.push(...this.spanRender(h, current));
        }

        return built;
      }, []);
    },
    outerParser(tokens) {
      return tokens.reduce((built, ts) => {
        switch (true) {
          case this.outerStarting().includes(ts):
            built.push({
              start: ts,
              contents: [],
              end: ""
            });
            return built;

            break;
          case (!!ts.match(/^END/) &&
            this.outerStarting().includes(ts.slice(3))) ||
            (!!ts.match(/^AUTOEND/) &&
              this.outerStarting().includes(ts.slice(7))):
            built[built.length - 1].contents = this.innerParser(
              built[built.length - 1].contents
            );
            built[built.length - 1].end = ts;
            return built;

            break;
          default:
            built[built.length - 1].contents.push(ts);
            return built;
        }
      }, []);
    },
    innerParser(tokens) {
      return tokens.reduce((built, ts) => {
        switch (true) {
          case this.innerStarting().includes(ts):
            built.push({
              start: ts,
              contents: [],
              end: undefined
            });
            return built;

            break;

          case !!ts.match(/^END/) || !!ts.match(/^AUTOEND/):
            built[built.length - 1].end = ts;
            return built;

            break;

          default:
            if (built.length == 0 || built[built.length - 1].end) {
              built.push(ts);
            } else {
              built[built.length - 1].contents.push(ts);
            }
            return built;
        }
      }, []);
    },
    tokenise(string, original) {
      var matched = this.innerMatchers()
        .find(matcher => matcher.match(string))
        .match(string);
      if (!matched || matched.length == 0) {
        return [];
      } else {
        return [
          ...matched.slice(0, -1),
          ...this.tokenise(matched.slice(-1)[0])
        ];
      }
    },
    outerTokenise(string) {
      var matcher = this.outerMatchers().find(matcher => matcher.match(string));
      var matched = matcher.match(string);
      if (!matched || matched.length == 0) {
        return [];
      } else {
        return [
          matched[0],
          ...(matcher.inner() ? this.tokenise(matched[1]) : [matched[1]]),
          matched[2],
          ...this.outerTokenise(matched.slice(-1)[0])
        ];
      }
    },
    matcher: (regex, start, end, inner = true) => {
      return {
        inner: () => inner,
        match: string => {
          var result = string.match(regex);
          if (!result) {
            return false;
          }
          var prefix = result[1];
          var contents = result[2];
          var suffix = result[3];
          if (start && end) {
            if (suffix.endsWith(" ")) {
              return [
                start,
                contents,
                end,
                string.slice(
                  prefix.length + contents.length + suffix.length - 1
                )
              ];
            } else {
              return [
                start,
                contents,
                suffix.length > 0 ? end : "AUTO" + end,
                string.slice(prefix.length + contents.length + suffix.length)
              ];
            }
          } else {
            if (suffix.startsWith(" ")) {
              return [
                contents + " ",
                string.slice(prefix.length + contents.length + 1)
              ];
            } else {
              return [contents, string.slice(prefix.length + contents.length)];
            }
          }
        }
      };
    },
    ender: () => {
      return {
        match: string => {
          var result = string.match(/^$/);
          if (!result) {
            return false;
          } else {
            return [];
          }
        }
      };
    },
    innerStarting() {
      var config = this.config();
      return Object.keys(config).map(key => config[key].identifier);
    },

    config() {
      return {
        strongConfig: {
          identifier: "STRONG",
          renderForCursor: {
            start: "*",
            end: "*",
            innerTag: "strong"
          },
          renderNoCursor: {
            start: "",
            end: "",
            innerTag: "strong"
          }
        },
        emConfig: {
          identifier: "EM",
          renderForCursor: {
            start: "_",
            end: "_",
            innerTag: "em"
          },
          renderNoCursor: {
            start: "",
            end: "",
            innerTag: "em"
          }
        },
        strikeConfig: {
          identifier: "STRIKE",
          renderForCursor: {
            start: "~",
            end: "~",
            innerTag: "s"
          },
          renderNoCursor: {
            start: "",
            end: "",
            innerTag: "s"
          }
        },
        smallcapsConfig: {
          identifier: "SMALLCAPS",
          renderForCursor: {
            start: "[",
            end: "]",
            innerTag: "span"
          },
          renderNoCursor: {
            start: "",
            end: "",
            innerTag: "span",
            innerContentTransform: innerContent => innerContent
          }
        },
        emdashConfig: {
          allowNoLeadingSpace: true,
          allowNoTrailingSpace: true,
          requireContent: "-",
          identifier: "EMDASH",
          renderForCursor: {
            start: "-",
            end: "-",
            innerTag: "span"
          },
          renderNoCursor: {
            start: "",
            end: "",
            innerTag: "span",
            innerContentTransform: innerContent => "",
            innerOptions: innerContent => ({
              domProps: {
                innerHTML: "&#8202;&mdash;&#8202;"
              }
            })
          }
        },

        smartquotesConfig: {
          identifier: "SMARTQUOTES",
          allowNoTrailingSpace: true,
          renderForCursor: {
            start: '"',
            end: '"',
            innerTag: "q",
            renderCursor: false,

            innerContentTransform: innerContent =>
              this.innerRender(
                this.h,
                this.innerParser(this.tokenise(innerContent))
              )
          },
          renderNoCursor: {
            start: "“",
            end: "”",
            innerTag: "q",
            innerContentTransform: innerContent =>
              this.innerRender(
                this.h,
                this.innerParser(this.tokenise(innerContent))
              ),
            innerOptions: innerContent => ({
              key: false
            })
          }
        },
        singlesmartquotesConfig: {
          identifier: "SINGLESMARTQUOTES",
          allowNoTrailingSpace: true,

          renderForCursor: {
            start: "'",
            end: "'",
            innerTag: "q",
            renderCursor: false,

            innerContentTransform: innerContent =>
              this.innerRender(
                this.h,
                this.innerParser(this.tokenise(innerContent))
              )
          },
          renderNoCursor: {
            start: "‘",
            end: "’",
            innerTag: "q",
            innerContentTransform: innerContent =>
              this.innerRender(
                this.h,
                this.innerParser(this.tokenise(innerContent))
              ),
            innerOptions: innerContent => ({
              key: false
            })
          }
        },
        ellipsisConfig: {
          allowNoLeadingSpace: true,
          allowNoTrailingSpace: true,

          requireContent: "\\.",
          identifier: "ELLIPSIS",
          renderForCursor: {
            start: ".",
            end: ".",
            innerTag: "span"
          },
          renderNoCursor: {
            start: "",
            end: "",
            innerTag: "span",
            innerContentTransform: innerContent => "",
            innerOptions: innerContent => ({
              domProps: {
                innerHTML: "&hellip;"
              }
            })
          }
        },
        rawhtmlConfig: {
          identifier: "RAWHTML",
          renderForCursor: {
            start: "(",
            end: ")",
            innerTag: "span"
          },
          renderNoCursor: {
            start: "",
            end: "",
            innerTag: "span",
            innerContentTransform: innerContent => "",
            innerOptions: innerContent => ({
              domProps: {
                innerHTML: innerContent
              }
            })
          }
        },
        codeConfig: {
          identifier: "CODE",
          renderForCursor: {
            start: "`",
            end: "`",
            innerTag: "code"
          },
          renderNoCursor: {
            start: "",
            end: "",
            innerTag: "code"
          }
        },
        linkConfig: {
          identifier: "LINK",
          renderForCursor: {
            start: "<",
            end: ">",
            innerTag: "span"
          },
          renderNoCursor: {
            start: "",
            end: "",
            innerTag: "a",
            innerContentTransform: innerContent => innerContent,
            innerOptions: innerContent => ({
              attrs: {
                href: innerContent
              }
            })
          }
        },
        materialiconsConfig: {
          identifier: "MATERIALICONS",
          renderForCursor: {
            start: "%",
            end: "%",
            innerTag: "span"
          },
          renderNoCursor: {
            start: "",
            end: "",
            innerTag: "i",
            innerContentTransform: innerContent => innerContent,
            innerOptions: innerContent => ({
              class: {
                "material-icons": true
              }
            })
          }
        },
        mathConfig: {
          identifier: "MATH",
          renderForCursor: {
            start: "$",
            end: "$",
            innerTag: "span"
          },
          renderNoCursor: {
            start: "",
            end: "",
            innerTag: "span",
            innerOptions: innerContent => ({
              directives: [
                {
                  name: "katex",
                  value: innerContent
                }
              ],
              key: false
            })
          }
        },
        emojiConfig: {
          identifier: "EMOJI",
          renderForCursor: {
            start: ":",
            end: ":",
            innerTag: "span"
          },
          renderNoCursor: {
            start: "",
            end: "",
            innerTag: "img",
            innerOptions: innerContent => ({
              attrs: {
                src:
                  "https://twemoji.maxcdn.com/2/72x72/" +
                  this.parseEmoji(innerContent)
              }
            })
          }
        },

        variableConfig: {
          identifier: "VARIABLE",
          renderForCursor: {
            start: "{",
            end: "}",
            innerTag: "span"
          },
          renderNoCursor: {
            start: "",
            end: "",
            innerTag: "span",
            innerContentTransform: innerContent => {
              var func = innerContent.split("(");
              var r;
              if (func.length > 1) {
                ////////console.log(this.pageData[func[0]]);
                r =
                  this.pageData[func[0]] &&
                  typeof this.pageData[func[0]] == "function"
                    ? this.pageData[func[0]](...func[1].slice(0, -1).split(","))
                    : "undefined";
              } else {
                r = this.pageData[innerContent]
                  ? this.pageData[innerContent]
                  : "undefined";
              }
              var parsed = this.innerParser(this.tokenise(r.toString()));
              ////////console.log(parsed);
              var rendered = parsed.map(node => {
                var config = node.start
                  ? this.config()[node.start.toLowerCase() + "Config"]
                  : {};
                return node.start
                  ? this.h(
                      config.renderNoCursor.innerTag,
                      this.buildOptions(
                        node.start,
                        idx,
                        idx + node.contents.join("").length,
                        config.renderNoCursor.innerOptions
                          ? config.renderNoCursor.innerOptions(
                              node.contents.join("")
                            )
                          : {}
                      ),
                      config.renderNoCursor.innerContentTransform
                        ? config.renderNoCursor.innerContentTransform(
                            node.contents.join("")
                          )
                        : config.renderNoCursor.innerOptions
                        ? []
                        : [node.contents.join("")]
                    )
                  : node;
              });
              return rendered;
            }
          }
        }
      };
    },
    innerMatchers() {
      var config = this.config();
      var regexes = Object.keys(config).map(key => {
        return this.matcher(
          new RegExp(
            `^(\\${config[key].renderForCursor.start})(${
              config[key].requireContent ? config[key].requireContent : ".*?"
            })(\\${config[key].renderForCursor.end} ${
              config[key].allowNoTrailingSpace
                ? "|\\" + config[key].renderForCursor.end + ""
                : ""
            }${
              config[key].allowTrailingPunctuation
                ? "|\\" + config[key].renderForCursor.end + "\\,"
                : ""
            }${
              config[key].allowTrailingPunctuation
                ? "|\\" + config[key].renderForCursor.end + "\\."
                : ""
            }|\\${config[key].renderForCursor.end}$|$)`
          ),
          config[key].identifier,
          "END" + config[key].identifier
        );
      });
      var startingTokens = Object.keys(config)
        .map(
          key =>
            config[key].renderForCursor.start +
            (config[key].requireContent
              ? config[key].requireContent +
                "\\" +
                config[key].renderForCursor.end
              : "") +
            (!!config[key].allowNoLeadingSpace
              ? "|\\" +
                config[key].renderForCursor.start +
                (config[key].requireContent
                  ? config[key].requireContent +
                    "\\" +
                    config[key].renderForCursor.end
                  : "")
              : "")
        )
        .join("| \\");
      ////console.log(startingTokens);
      var text = new RegExp(`()(.*?)( \\${startingTokens}|$)`);

      var textMatcher = this.matcher(text, undefined, undefined);

      var endMatcher = this.ender();
      return [endMatcher, ...regexes, textMatcher];
    },
    outerMatchers() {
      var blockquote = /^(\>)(.*?)(\n|$)/;
      var codeblock = /^(`)((?:.|\n)*?)(`\n|$)/;
      var dataSection = /^(\+)((?:.|\n)*?)(\+\n|$)/;
      var paragraph = /^()(.*?)(\n|$)/;
      var headingOne = /^(\#)(.*?)(\n|$)/;
      var headingTwo = /^(\#\#)(.*?)(\n|$)/;
      var image = /^(\!)(.*?)(\n|$)/;
      var paragraphMatcher = this.matcher(
        paragraph,
        "PARAGRAPH",
        "ENDPARAGRAPH"
      );
      var imageMatcher = this.matcher(image, "IMAGE", "ENDIMAGE", false);
      var headingOneMatcher = this.matcher(
        headingOne,
        "HEADINGONE",
        "ENDHEADINGONE",
        false
      );
      var headingTwoMatcher = this.matcher(
        headingTwo,
        "HEADINGTWO",
        "ENDHEADINGTWO",
        false
      );
      var blockquoteMatcher = this.matcher(
        blockquote,
        "BLOCKQUOTE",
        "ENDBLOCKQUOTE"
      );
      var codeblockMatcher = this.matcher(
        codeblock,
        "CODEBLOCK",
        "ENDCODEBLOCK",
        false
      );
      var dataSectionMatcher = this.matcher(
        dataSection,
        "DATASECTION",
        "ENDDATASECTION",
        false
      );

      var endMatcher = this.ender();
      return [
        endMatcher,
        imageMatcher,
        dataSectionMatcher,
        codeblockMatcher,
        blockquoteMatcher,
        headingTwoMatcher,
        headingOneMatcher,
        paragraphMatcher
      ];
    }
  },
  computed: {
    tokenised() {
      return this.outerTokenise(this.value);
    },
    parsed() {
      return this.outerParser(this.tokenised);
    },
    rendered() {
      return [
        // this.h("div", { class: { tags: true } }, [
        //   this.parsed
        //     .filter(p => p.start == "HEADINGONE" && p.contents.join("") != "")
        //     .map(p =>
        //       this.h("span", { class: { pill: true } }, [p.contents.join("")])
        //     )
        // ]),
        ...this.outerRender(this.h, this.parsed)
      ];
    }
  },
  watch: {
    md(val) {
      this.$emit("input", this.value);
    }
  },
  data() {
    return {
      toPasteText: "",
      k: [],
      lastCursorPos: {
        x: 0,
        y: 0
      },
      words_key: null,
      author: null,
      options: false,
      emojis: emojiMap,
      cursor: 20,
      delta: [
        {
          contains: "paragraph",
          source: "Hello world"
        }
      ],
      pageData: {
        font: "hello world"
      },
      md: this.value,
      h: null,
      lastChar: "",
      lastLastChar: "",
      direction: true,
      iter: 0,
      show_articles: true,
      selecting: false,
      selection_start: false,
      selection_end: {
        word: 0,
        index_in_word: 0,
        global_index: 0
      },
      lastMove: Date.now()
    };
  }
};
