document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const SCP = form.SCP.value;

    request(SCP);
  });
});

const request = number => {
  const SCP = formatSCP(number);

  const url = "http://fondationscp.wikidot.com/scp-" + SCP;

  fetch(url)
    .then(response => {
      if (response.status !== 200) {
        throw (new Error("notFound").name = "notFound");
      }

      response
        .text()
        .then(html => {
          createPage(html, url, SCP);
        })
        .catch(r => {
          error("SCPincorrect");
        });
    })
    .catch(e => {
      error(e);
    });
};

const formatSCP = number => {
  if (number < 1000) {
    number = ("00" + number).slice(-3);
  }

  return number;
};

const createPage = (html, url, SCP) => {
  const { desc, classification, img } = exctractData(html);

  const template = document.getElementById("template-SCP").content;

  // i18n
  // LINK
  template.getElementById("SCP-link").textContent = chrome.i18n.getMessage(
    "link"
  );

  // Load data:
  // TITLE
  template.getElementById("SCP-name").textContent = "SCP-" + SCP;
  // CLASSIFICATION
  template.getElementById("SCP-class").textContent = classification;
  // DESCRIPTION
  template.getElementById("SCP-desc").textContent = desc;
  // IMAGE
  template.getElementById("SCP-image").src = img;
  // LINK
  template.getElementById("SCP-link").href = url;

  // Injection
  const page = document.getElementById("page");
  page.innerHTML = document.getElementById("template-SCP").innerHTML;

  // Event
  const link = document.getElementById("SCP-link");
  link.addEventListener("click", () => {
    chrome.tabs.create({
      url
    });
  });
};

const exctractData = html => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  let data = {};

  // DESCRIPTION
  // Extract SCP description
  const desc = doc
    .evaluate("//strong[contains(., 'Description')]", doc, null, 0, null)
    .iterateNext();
  let description = desc.nextSibling.textContent;

  // If description is not complete
  if (description.slice(-1) !== ".") {
    let nextDescription = desc.parentElement.nextElementSibling.textContent;
    description = description.concat("\n", nextDescription);
  }

  data.desc = description;

  // CLASSIFICATION
  const classif = doc
    .evaluate("//strong[contains(., 'Classe')]", doc, null, 0, null)
    .iterateNext();
  const classification = classif.nextSibling.textContent;

  data.classification = classification;

  // IMAGE
  // Extract SCP images if available
  const image = doc.querySelector(
    "div#page-content .scp-image-block.block-right img.image"
  ) || {
    src:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/SCP_Foundation_%28emblem%29.svg/1200px-SCP_Foundation_%28emblem%29.svg.png"
  };
  data.img = image.src;

  return data;
};

const error = r => {
  let msg;

  msg = chrome.i18n.getMessage(r.toString());

  if (!msg) {
    msg = chrome.i18n.getMessage("unknownError");
  }

  notie.alert({
    type: 3,
    text: msg
  });
};
