export default {
  createElement: (tag, attrs, ...children) => {
    //console.log(attrs);
    if (typeof tag == "function") {
      return tag({ ...attrs, children: children.flat() });
    }
    let element = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).map(k => {
        if (k.startsWith("$")) {
          element.addEventListener(k.slice(1), attrs[k]);
        } else if (k.toLowerCase() != k) {
          element[k] = attrs[k];
        } else {
          element.setAttribute(k, attrs[k]);
        }
      });
    }
    children.flat().map(c => {
      if (typeof c == "string") {
        element.appendChild(document.createTextNode(c));
      } else if (c !== null && c !== false) {
        element.appendChild(c);
      }
    });
    return element;
  },
  Fragment: props => {
    return props.children;
  }
};
