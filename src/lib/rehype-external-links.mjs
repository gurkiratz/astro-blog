// Opens absolute http(s) links in a new tab. Relative links, #anchors and
// mailto: are left alone so internal navigation stays in the same tab.
import { visit } from "unist-util-visit";

export default function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string" || !/^https?:\/\//i.test(href)) return;

      node.properties.target = "_blank";
      node.properties.rel = ["noopener", "noreferrer"];
    });
  };
}
