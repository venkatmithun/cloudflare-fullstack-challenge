const BASE_URL = "https://cfw-takehome.developers.workers.dev/api/variants";

class ElementHandler {
  constructor(content, attr) {
    this.content = content;
    this.attr = attr;
  }

  element(element) {
    element.setInnerContent(this.content);
    const attribute = element.getAttribute(this.attr);
    if (attribute) {
      element.setAttribute(
        this.attr,
        attribute.replace(
          "https://cloudflare.com",
          "https://www.linkedin.com/in/venkatmithun/"
        )
      );
    }
  }
}

const rewriter = function(variant) {
  return new HTMLRewriter()
    .on(
      "h1#title",
      new ElementHandler(
        variant == "1"
          ? "Cloudflare Full-stack challenge"
          : "Hey! This is Venkat Mithun"
      )
    )
    .on("title", new ElementHandler(variant == "1" ? "Variant 1" : "Variant 2"))
    .on(
      "p#description",
      new ElementHandler(
        variant == "1"
          ? "Deployed by Venkat Mithun!"
          : "Looking for internships!"
      )
    )
    .on("a#url", new ElementHandler("Interested in me?", "href"));
};

addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch((e) => {
      return new Response("Error 500! Internal server error");
    })
  );
});

async function handleRequest(request) {
  const response = await fetch(BASE_URL).then((res) => {
    return res.json();
  });
  const variants = response["variants"];

  const var1 = await fetch(variants[0], request);
  const var2 = await fetch(variants[1], request);
  const NAME = "variant";

  const cookie = request.headers.get("cookie");
  let group, result;

  if (cookie && cookie.includes(`${NAME}=1`)) {
    group = "1";
    result = var1;
  } else if (cookie && cookie.includes(`${NAME}=2`)) {
    group = "2";
    result = var2;
  } else {
    group = Math.random() < 0.5 ? "1" : "2";
    result = group === "1" ? var1 : var2;
    result = new Response(result.body, result);
    // Setting cookie which expires in 5sec
    result.headers.append("Set-Cookie", `${NAME}=${group}; path=/`);
  }
  return rewriter(group).transform(result);
}
