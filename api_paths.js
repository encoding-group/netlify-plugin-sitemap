const axios = require("axios");
module.exports = function getApiPaths(url) {
  return axios.get(url).then((response) => {
    let links = [];
    for (const post of response.data) {
      links.push(
        post.link.replace(/https\:\/\/api.robinweissenborn.de\//, "/")
      );
      // links.push(post.acf.title_image.url);
    }
    //   console.log(links);
    return links;
  });
};
