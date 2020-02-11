let cursorRange = document.createRange();
let state = {
  matter: {},
  focus: true,

  content: [
    {
      text:
        "In *mathemtical* logic, :joy: a ...sentence of a predicate logic is a boolean-valued well-formed formula with no free variables. A sentence can be viewed as expressing a proposition, something that must be true or false. The restriction of having no free variables is needed to make sure that sentences can have concrete, fixed truth values: As the free variables of a (general) formula can range over several values, the truth value of such a formula may vary. ",
      rects: [],
      words: [`In`, `maths`, `words`]
    },
    {
      text: `$\\begin{array}{c|cccccc}
        & \text{Critic 1} & \\text{Critic 2} & \\text{Critic 3} & \\text{Critic 4} & \\text{Critic 5} & \\text{Critic 6} \\\\
       \\hline
       \\text{Film 1} & 3 & 7 & 7 & 5 & 5 & 7 \\\\
       \\text{Film 2} & 7 & 5 & 5 & 6 & 8 & 7 \\\\
       \\text{Film 3} & 4 & 5 & 5 & 8 & 8 & 8 \\\\
       \\text{Film 4} & 9 & 3 & 0 & 5 & 8 & 4 \\\\
       \\text{Film 5} & 9 & 8 & 8 & 9 & 10 & 7 \\\\
       \\text{Film 6} & 7 & 8 & 4 & 8 & 9 & 8
       \\end{array}$`,
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
const insert_text = payload => {};
const actions = {
  insert_text: Symbol("insert_text")
};
const handlers = {
  [actions.insert_text]: insert_text
};
const commit = ({ action, payload }) => {
  if (handlers[action]) {
    handlers[action](payload);
  } else {
    throw new Error(`Action ${action} not implemented`);
  }
};
