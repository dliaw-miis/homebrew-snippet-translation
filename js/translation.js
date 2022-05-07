import JsonDataConnector from "./JsonDataConnector.js"


window.onload = () => {

  let inlineTagnames = [
    "A", "ABBR", "ACRONYM", "AUDIO", "B", "BDI", "BDO", "BIG", "BR",
    "CANVAS", "CITE", "CODE", "DATA", "DATALIST", "DEL", "DFN", "EM",
    "EMBED", "FONT", "I", "IFRAME", "IMG", "INPUT", "INS", "KBD",
    "LABEL", "MAP", "MARK", "METER", "NOSCRIPT", "OBJECT", "OUTPUT",
    "PICTURE", "PROGRESS", "Q", "RUBY", "S", "SAMP", "SCRIPT",
    "SELECT", "SLOT", "SMALL", "SPAN", "STRONG", "SUB", "SUP", "SVG",
    "TEMPLATE", "TEXTAREA", "TIME", "U", "TT", "VAR", "VIDEO", "WBR"
  ]

  // Ignore all-whitespace node groups
  function getTextNodes() {
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      { acceptNode: (node) => node.wholeText.trim().length > 0 }
    );

    var walkedNodes = [];

    while (walker.nextNode()) {
      walkedNodes.push(walker.currentNode);
    }
    return walkedNodes
  }

  /**
   * Get closest block-level parent of each text node
   * @param {*} textNodes 
   * @returns 
   */
  function getTextBlockParentNodes(textNodes) {
    let parentNodes = []
    for (const tNode of textNodes) {
      let parent = tNode.parentNode
      while (inlineTagnames.includes(parent.tagName)) {
        parent = parent.parentNode
      }
      if (parent.textContent.trim().length > 0 && !parentNodes.includes(parent)) {
        // console.log(tNode, parent)
        parentNodes.push(parent)
      }
    }

    return parentNodes
  }

  function removeAttributes(element) {
    while (element.attributes.length > 0) {
      element.removeAttribute(element.attributes[0].name);
    }
  }

  /**
   * Construct a string consisting of element tagnames and text in traversal order.
   * Ignore comments
   */
  function getHtmlElementHashstring(htmlNode) {
    let nodeList = [htmlNode]
    let hashComponents = []
    let i = 0;
    while (i < nodeList.length) {
      let element = nodeList[i]
      if (element.nodeType === Node.ELEMENT_NODE) {
        hashComponents.push(element.tagName)
        nodeList.push(...element.childNodes)
      } else if (element.nodeType === Node.TEXT_NODE) {
        hashComponents.push(element.textContent)
      }
      i++;
    }

    return hashComponents.join(',')
  }

  function getTextGroups() {
    let textNodes = getTextNodes()
    let textGroups = []
    let currentTextGroup = []
    let groupParent = null
    let whitespaceOnly = true
    for (let i = 0; i < textNodes.length; ++i) {
      const tNode = textNodes[i]
      // console.log(tNode)
      if (groupParent === null) {
        // console.log("new groupParent:" + tNode.parentNode)
        groupParent = tNode.parentNode
      }
      // console.log(tNode.textContent)
      if (tNode.textContent && tNode.textContent.trim().length > 0) {
        whitespaceOnly = false
      }
      currentTextGroup.push(tNode)
      let traverse = tNode.nextSibling
      while (traverse &&
          (traverse.nodeType === Node.COMMENT_NODE ||
          traverse.nodeType === Node.ELEMENT_NODE && inlineTagnames.includes(traverse.tagName))) {
        currentTextGroup.push(traverse)
        traverse = traverse.nextSibling
      }

      if (traverse && traverse.nodeType === Node.TEXT_NODE) {
        // console.log("continuing")
        continue  // Let next loop iteration continue building group
      }
      else {  // No sibling, or sibling is block element
        // console.log("no sibling/block")
        if (!whitespaceOnly) {  // If all text in group is whitespace, don't add
          // console.log("no whitespace group")
          // console.log("write node for:" + groupParent)
          textGroups.push([groupParent, currentTextGroup])
        } else {
          // console.log("whitespace group")
        }
        currentTextGroup = []
        groupParent = null
        whitespaceOnly = true
      }
    }

    return textGroups
  }

  function main() {
    const textNodes = getTextNodes()
    const parentNodes = getTextBlockParentNodes(textNodes)
    console.log(parentNodes)

    const connector = new JsonDataConnector()
    const data = connector.getWebsiteData(window.location.origin + window.location.pathname)
    
    for (const pNode of parentNodes) {
      console.log(getHtmlElementHashstring(pNode))
    }
  }

  main()
}
