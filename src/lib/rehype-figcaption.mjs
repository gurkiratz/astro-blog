// Turns a markdown image that sits alone in its own paragraph and carries
// alt text into a <figure><img><figcaption>alt</figcaption></figure>, so the
// alt text you already write doubles as a visible caption under the photo.
//
//   ![A cyclist crossing a bridge](../assets/foo.jpg)
//
// becomes a captioned figure with no extra markup needed in the post body.
// Images with no alt text (or images sharing a paragraph with other content)
// are left untouched.
import { visit } from "unist-util-visit";

export default function rehypeFigcaption() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "p") return;

      const elementChildren = node.children.filter(
        (child) => child.type === "element",
      );
      if (elementChildren.length !== 1) return;

      const img = elementChildren[0];
      const alt = img.properties?.alt;
      if (img.tagName !== "img" || !alt) return;

      node.tagName = "figure";
      node.children = [
        img,
        {
          type: "element",
          tagName: "figcaption",
          properties: {},
          children: [{ type: "text", value: alt }],
        },
      ];
    });
  };
}
