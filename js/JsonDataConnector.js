import data from "../tl_data/data.js"

export default class JsonDataConnector {

  constructor() {
    this.data = data
  }

  getWebsiteData(url) {
    if (data[url]) {
      return data[url]
    }
    return null
  }
}
