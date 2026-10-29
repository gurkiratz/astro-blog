// Obsidian links notes as relative `.md` files ([x](deep-learning.md)). On the
// site those live at /writing/<slug>, so rewrite them at build time.
import { visit } from "unist-util-visit";

export default function rehypeMdLinks() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string" || /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(href)) return;

      const m = href.match(/^(?:\.\/)?([^/?#]+)\.md(#.*)?$/i);
      if (!m) return;
      node.properties.href = `/writing/${encodeURIComponent(decodeURIComponent(m[1]))}${m[2] ?? ""}`;
    });
  };
}
