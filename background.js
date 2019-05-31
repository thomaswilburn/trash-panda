var raccoon = `🦝`;
var rMatch = new RegExp(raccoon, "i");

var wait = (d = 300) => new Promise(ok => setTimeout(ok, d));

var cleanup = async function(tabId) {
  var identities = await browser.contextualIdentities.query({});
  var ourBins = identities.filter(i => i.name.match(rMatch));
  var tabs = await browser.tabs.query({});
  // filter out the closing tab, if given
  if (tabId) {
    tabs = tabs.filter(t => t.id != tabId);
  }
  var activeStores = new Set(tabs.map(t => t.cookieStoreId));
  ourBins.forEach(function(bin) {
    if (activeStores.has(bin.cookieStoreId)) return;
    console.log(`Removing unused trash container: ${bin.name}`);
    browser.contextualIdentities.remove(bin.cookieStoreId);
  });
};

var create = async function(url) {
  var bin = await browser.contextualIdentities.create({
    name: `${raccoon} ${url}`,
    color: "red",
    icon: "pet"
  });
  var tab = await browser.tabs.create({
    cookieStoreId: bin.cookieStoreId,
    url: url,
    active: true
  });
};

var init = async function() {
  browser.menus.create({
    contexts: ["link"],
    id: "open-trash",
    title: "Open in a new trash container"
  });

  browser.menus.onClicked.addListener(function(info) {
    create(info.linkUrl);
  });

  console.log(raccoon.repeat(5), "Trash bears deployed!", raccoon.repeat(5));
  cleanup();
  browser.tabs.onRemoved.addListener(cleanup);

};

init();