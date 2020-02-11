import React from "./JSXdom";
import katex from "katex";
import hljs from "highlight.js";
const Command = ({ children, ...attrs }) => {
  return <nutshell-mark {...attrs}>{children[0]}</nutshell-mark>;
};
const blocks = {
  image: {
    accept: text => text.startsWith("!"),
    render: ({ children, plain, ...attrs }) =>
      !plain ? (
        <img
          {...attrs}
          plain={plain}
          class="image block content"
          src={children[0].slice(1)}
          onError={e => {
            console.log("err", e);
            e.target.src =
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8wcBQDwADqQFJeuykOwAAAABJRU5ErkJggg==";
          }}
        ></img>
      ) : (
        <>
          <img
            id={"p" + attrs.id}
            plain={plain}
            class="image block content"
            src={children[0].slice(1)}
            $error={e => {
              console.log("err", e);
              e.target.src =
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8wcBQDwADqQFJeuykOwAAAABJRU5ErkJggg==";
            }}
          ></img>
          <div {...attrs} class="image-preview block content" plain={plain}>
            <nutshell-block-mark
              plain={plain}
              data-start={0}
              data-end={children[0].length}
            >
              <nutshell-mark plain={plain} data-start={0} data-end={1}>
                !
              </nutshell-mark>

              {children[0].slice(1)}
            </nutshell-block-mark>
          </div>
        </>
      ),
    raw: true
  },
  math: {
    accept: text => text.startsWith("$") && text.length >= 2,
    render: ({ children, plain, ...attrs }) =>
      !plain ? (
        <div
          {...attrs}
          plain={plain}
          class="math block content"
          innerHTML={katex.renderToString(
            children[0].endsWith("$")
              ? children[0].slice(1).slice(0, -1)
              : children[0].slice(1),
            {
              displayMode: true,

              throwOnError: false
            }
          )}
        ></div>
      ) : (
        <>
          <div
            id={"p" + attrs.id}
            plain={plain}
            class="math block content"
            innerHTML={katex.renderToString(
              children[0].endsWith("$")
                ? children[0].slice(1).slice(0, -1)
                : children[0].slice(1),
              {
                displayMode: true,
                throwOnError: false
              }
            )}
          ></div>
          <div {...attrs} class="math-preview block content">
            <nutshell-block-mark
              plain={plain}
              data-start={0}
              data-end={children[0].length}
            >
              <nutshell-mark plain={plain} data-start={0} data-end={1}>
                $
              </nutshell-mark>

              {children[0].endsWith("$")
                ? children[0].slice(1).slice(0, -1)
                : children[0].slice(1)}

              {children[0].endsWith("$") && (
                <nutshell-mark
                  plain={plain}
                  data-start={children[0].length - 1}
                  data-end={children[0].length}
                >
                  $
                </nutshell-mark>
              )}
            </nutshell-block-mark>
          </div>
        </>
      ),
    raw: true
  },
  code: {
    accept: text =>
      text.startsWith("`") && text.endsWith("`") && text.length > 1,
    render: ({ children, plain, ...attrs }) =>
      false ? (
        <squirrel-block
          {...attrs}
          class="code block content"
          plain={plain}
          data-type="code"
        >
          <squirrel-block-type>code</squirrel-block-type>
          <squirrel-content class="content" id={attrs.id}>
            <div
              {...attrs}
              innerHTML={hljs.highlightAuto(children[0]).value}
            ></div>
          </squirrel-content>
        </squirrel-block>
      ) : (
        <squirrel-block
          {...attrs}
          class="code-preview block content has-wrapping"
          plain={plain}
          data-type="code"
        >
          <squirrel-block-type>code</squirrel-block-type>
          <nutshell-mark plain={plain} data-start={0} data-end={0}>
            `
          </nutshell-mark>
          <squirrel-content class="content" id={attrs.id}>
            <nutshell-block-mark
              plain={plain}
              data-start={0}
              data-end={children[0].length}
              class="content"
              id={attrs.id}
              {...attrs}
            >
              {children[0]}
            </nutshell-block-mark>
          </squirrel-content>
          <nutshell-mark plain={plain}>`</nutshell-mark>
        </squirrel-block>
      )
  },
  // matter: {
  //   accept: text => text.startsWith("+") && text.length >= 2,
  //   render: ({ children, plain, ...attrs }) =>
  //     !plain ? (
  //       <div
  //         {...attrs}
  //         plain={plain}
  //         class="matter block content"
  //         innerHTML={
  //           hljs.highlightAuto(
  //             (children[0].endsWith("+")
  //               ? children[0].slice(1).slice(0, -1)
  //               : children[0].slice(1)
  //             ).trim()
  //           ).value
  //         }
  //       ></div>
  //     ) : (
  //       <div
  //         {...attrs}
  //         class="matter-preview block content has-wrapping"
  //         plain={plain}
  //       >
  //         <nutshell-mark plain={plain} data-start={0} data-end={1}>
  //           +
  //         </nutshell-mark>
  //         <nutshell-block-mark
  //           plain={plain}
  //           data-start={0}
  //           data-end={children[0].length}
  //         >
  //           {children[0].endsWith("+")
  //             ? children[0].slice(1).slice(0, -1)
  //             : children[0].slice(1)}
  //         </nutshell-block-mark>{" "}
  //         {children[0].endsWith("+") && (
  //           <nutshell-mark
  //             plain={plain}
  //             data-start={children[0].length - 1}
  //             data-end={children[0].length}
  //           >
  //             +
  //           </nutshell-mark>
  //         )}
  //       </div>
  //     ),
  //   raw: true
  // },
  heading_one: {
    accept: text => text.startsWith("# "),
    render: ({ children, ...attrs }) => (
      <squirrel-block class="block" {...attrs} data-type="default">
        <squirrel-block-type data-end="0">title</squirrel-block-type>

        <squirrel-content class="content" id={attrs.id}>
          <h1>
            <nutshell-mark plain={attrs.plain} data-start={0} data-end={2}>
              #{" "}
            </nutshell-mark>
            {children[0].slice(2)}
          </h1>
        </squirrel-content>
      </squirrel-block>
    )
  },
  default: {
    // This should never be accepted on its merits, only as a fallback
    accept: text => true,
    render: ({ children, ...attrs }) => (
      <squirrel-block class="block" {...attrs} data-type="default">
        <squirrel-block-type data-end="0">notes</squirrel-block-type>
        <squirrel-content class="content" id={attrs.id}>
          <p>{children}</p>
        </squirrel-content>
      </squirrel-block>
    )
  }
};
const node = () => (
  <squirrel-block>
    <squirrel-block-type>notes</squirrel-block-type>
    <squirrel-block-mark></squirrel-block-mark>
    <squirrel-content>{children}</squirrel-content>
    <squirrel-block-mark></squirrel-block-mark>
  </squirrel-block>
);
const type = {
  text: Symbol("text"),
  img: Symbol("img")
};

const replacements = [
  {
    match: /(^|[^\\])!$/,
    action: ({ ops: { text } }) => {
      return text(`[]()`).forward(1);
    }
  },
  {
    match: /(^|[^\\])`$/,
    action: ({ ops: { text } }) => {
      return text("`");
    }
  },
  {
    match: /(^| )\*$/,
    action: ({ ops: { text } }) => {
      return text(`*`);
    }
  },
  {
    match: /(^|[^\\])_$/,
    action: ({ ops: { text } }) => {
      return text(`_`);
    }
  },
  {
    match: /(^|[^\\]):$/,
    action: ({ ops: { text } }) => {
      return text(`:`);
    }
  },
  {
    match: /(^|[^\\])\$$/,
    action: ({ ops: { text } }) => {
      return text(`$`);
    }
  },
  {
    match: /(^|[^\\])%$/,
    action: ({ ops: { text } }) => {
      return text(`%`);
    }
  }
];
const inline = {
  strong: {
    match: start => (start ? /(^)\*(.*?)\*( |$)/ : /^( )\*(.*?)\*( |$)/),
    // [match_length, prefix_length, suffix_length, plain_prefix, children, suffix]
    split: ([str, ...matches]) => [str.length, 1, 1, ...matches],
    prefix: ({ ...attrs }) => <Command {...attrs}>*</Command>,
    suffix: ({ ...attrs }) => <Command {...attrs}>*</Command>,
    edit: ({ id, children, ...attrs }) => (
      <strong id={id} {...attrs}>
        {children}
      </strong>
    ),
    render: ({ id, children, ...attrs }) => (
      <strong id={id} {...attrs}>
        {children}
      </strong>
    ),
    filter_children: ({ em }) => (em ? { em } : {})
  },
  em: {
    match: start => (start ? /(^)\_(.*?)\_( |$)/ : /^( )\_(.*?)\_( |$)/),
    // [match_length, prefix_length, suffix_length, plain_prefix, children]
    split: ([str, ...matches]) => [str.length, 1, 1, ...matches],
    prefix: ({ ...attrs }) => <Command {...attrs}>_</Command>,
    suffix: ({ ...attrs }) => <Command {...attrs}>_</Command>,
    edit: ({ id, children, ...attrs }) => (
      <em id={id} {...attrs}>
        {children}
      </em>
    ),
    render: ({ id, children, ...attrs }) => (
      <em id={id} {...attrs}>
        {children}
      </em>
    ),
    filter_children: ({ strong }) => (strong ? { strong } : {})
  },
  material: {
    match: start => (start ? /(^)\%(.*?)\%( |$)/ : /^( )\%(.*?)\%( |$)/),
    // [match_length, prefix_length, suffix_length, plain_prefix, children]
    split: ([str, ...matches]) => [str.length, 1, 1, ...matches],
    prefix: ({ ...attrs }) => <Command {...attrs}>%</Command>,
    suffix: ({ ...attrs }) => <Command {...attrs}>%</Command>,
    edit: ({ id, children, ...attrs }) => (
      <nutshell-mark id={id} {...attrs}>
        {children}
      </nutshell-mark>
    ),
    render: ({ id, children, ...attrs }) => (
      <i {...attrs} className="material-icons">
        {children}
      </i>
    ),
    filter_children: ({ strong }) => (strong ? { strong } : {})
  },
  emoji: {
    match: start => (start ? /(^):(.*?):( |$)/ : /^( ):(.*?):( |$)/),
    // [match_length, prefix_length, suffix_length, plain_prefix, children]
    split: ([str, ...matches]) => [str.length, 1, 1, ...matches],
    prefix: ({ ...attrs }) => <Command {...attrs}>:</Command>,
    suffix: ({ ...attrs }) => <Command {...attrs}>:</Command>,
    edit: ({ id, children, ...attrs }) => (
      <nutshell-mark id={id} {...attrs}>
        {children}
        <img
          class="emoji popup"
          src={`https://twemoji.maxcdn.com/2/72x72/${toEmojiCode(children[0])}`}
        ></img>
      </nutshell-mark>
    ),
    render: ({ id, children, ...attrs }) => (
      <img
        id={id}
        {...attrs}
        class="emoji"
        src={`https://twemoji.maxcdn.com/2/72x72/${toEmojiCode(children[0])}`}
      ></img>
    ),
    filter_children: ({}) => ({})
  },
  math: {
    match: start => (start ? /(^)\$(.*?)\$( |$)/ : /^( )\$(.*?)\$( |$)/),
    // [match_length, prefix_length, suffix_length, plain_prefix, children]
    split: ([str, ...matches]) => [str.length, 1, 1, ...matches],
    prefix: ({ ...attrs }) => <Command {...attrs}>$</Command>,
    suffix: ({ ...attrs }) => <Command {...attrs}>$</Command>,
    edit: ({ id, children, ...attrs }) => (
      <nutshell-mark id={id}>
        {children}
        {children[0].length > 0 && (
          <span
            class="math popup"
            innerHTML={katex.renderToString(children[0], {
              throwOnError: false
            })}
          ></span>
        )}
      </nutshell-mark>
    ),
    render: ({ id, children, ...attrs }) => (
      <span
        id={id}
        {...attrs}
        class="math"
        innerHTML={katex.renderToString(children[0], {
          throwOnError: false
        })}
      ></span>
    ),
    filter_children: ({}) => ({})
  },
  ellipsis: {
    match: start => /(^)(\.\.\.)/,
    // [match_length, prefix_length, suffix_length, plain_prefix, children]
    split: ([str, ...matches]) => [str.length, 0, 0, ...matches, ""],
    prefix: ({ ...attrs }) => null,
    suffix: ({ ...attrs }) => null,
    edit: ({ id, children, ...attrs }) => (
      <nutshell-mark id={id} {...attrs}>
        ...
      </nutshell-mark>
    ),
    render: ({ id, children, ...attrs }) => (
      <span {...attrs} innerHTML="&hellip;"></span>
    ),
    filter_children: ({}) => ({})
  }
};

export { blocks, replacements, inline };
export default {
  math: {
    start: `$`,
    end: `$`,
    render: ({ children, plain, ...attrs }) => {
      return !plain ? (
        <span
          {...attrs}
          class="math"
          innerHTML={katex.renderToString(children[0], {
            throwOnError: false
          })}
        ></span>
      ) : (
        <nutshell-mark plain={plain}>
          {children}
          {children[0].length > 0 && (
            <span
              class="math popup"
              innerHTML={katex.renderToString(children[0], {
                throwOnError: false
              })}
            ></span>
          )}
        </nutshell-mark>
      );
    },
    renderPlain: children => <Command>{children}</Command>
  },
  strong: {
    start: `*`,
    end: `*`,
    render: ({ children, ...attrs }) => {
      return <strong {...attrs}>{children}</strong>;
    }
  },
  code: {
    start: ` \``,
    end: `\` `,
    render: ({ children, ...attrs }) => {
      return <code {...attrs}>{children}</code>;
    }
  },
  em: {
    start: `_`,
    end: `_`,
    render: ({ children, ...attrs }) => {
      return <em {...attrs}>{children}</em>;
    }
  },
  material: {
    start: `%`,
    end: `%`,
    render: ({ children, ...attrs }) => {
      return (
        <i {...attrs} className="material-icons">
          {children}
        </i>
      );
    }
  },
  newline: {
    start: ``,
    end: ``,
    match: `\n`,
    render: ({ children, plain, ...attrs }) => <br {...attrs} />,
    renderPlain: () => `.`
  },
  ellipsis: {
    start: ``,
    end: ``,
    match: `...`,
    render: ({ children, plain, ...attrs }) =>
      plain ? (
        <nutshell-mark plain={plain}>...</nutshell-mark>
      ) : (
        <span {...attrs} innerHTML="&hellip;"></span>
      ),
    renderPlain: () => `.`
  },
  emoji: {
    start: `:`,
    end: `:`,
    match: span => {
      if (span[0] != ":") {
        return false;
      }
      let split = 2;
      while (split < 50) {
        let code = toEmojiCode(span.slice(1, split));
        if (code && span[split] == ":") {
          return {
            match: true,
            ending: true,
            nest: span.slice(1, split),
            rest: span.slice(split + 1)
          };
        } else if (code && span.length == span.slice(1, split)) {
          return {
            match: true,
            ending: false,
            nest: span.slice(1, split),
            rest: ""
          };
        } else {
          split += 1;
        }
      }
      return { match: false };
    },
    render: ({ children, plain, ...attrs }) => {
      //console.log(plain);
      return !plain ? (
        <img
          {...attrs}
          class="emoji"
          src={`https://twemoji.maxcdn.com/2/72x72/${toEmojiCode(children[0])}`}
        ></img>
      ) : (
        <nutshell-mark plain={plain}>
          {children}
          <img
            class="emoji popup"
            src={`https://twemoji.maxcdn.com/2/72x72/${toEmojiCode(
              children[0]
            )}`}
          ></img>
        </nutshell-mark>
      );
    },
    renderPlain: children => <Command>{children}</Command>
  }
};
