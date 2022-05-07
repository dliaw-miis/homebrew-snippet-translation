window.onload = () => {

  let inlineTagnames = [
    "A", "ABBR", "ACRONYM", "AUDIO", "B", "BDI", "BDO", "BIG", "BR",
    "CANVAS", "CITE", "CODE", "DATA", "DATALIST", "DEL", "DFN", "EM",
    "EMBED", "FONT", "I", "IFRAME", "IMG", "INPUT", "INS", "KBD",
    "LABEL", "MAP", "MARK", "METER", "NOSCRIPT", "OBJECT", "OUTPUT",
    "PICTURE", "PROGRESS", "Q", "RUBY", "S", "SAMP", "SCRIPT",
    "SELECT", "SLOT", "SMALL", "SPAN", "STRONG", "SUB", "SUP", "SVG",
    "TEMPLATE", "TEXTAREA", "TIME", "U", "TT", "VAR", "VIDEO", "WBR"]

  function fetchTextNodes() {
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    var walkedNodes = [];

    while (walker.nextNode()) {
      walkedNodes.push(walker.currentNode);
    }
    return walkedNodes
  }

  function fetchTextBlockParentNodes(textNodes) {
    let parentNodes = []
    for (let tNode of textNodes) {
      let parent = tNode.parentNode
      while (inlineTagNames.includes(parent.tagName)) {
        parent = parent.parentNode
      }
      if (!parentNodes.includes(parent)) {
        parentNodes.push(parent)
      }
    }

    return parentNodes
  }

  function getTextGroups() {
    let textNodes = fetchTextNodes()
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

  console.log(getTextGroups())
}
