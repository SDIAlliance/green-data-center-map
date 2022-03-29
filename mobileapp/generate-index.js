var ejs = require('ejs');
var fs = require('fs');
var i18n = require('i18n');
const { vsprintf } = require('sprintf-js');

const STATIC_PATH = 'www/electricitymap';

const {
  localeToFacebookLocale,
  supportedFacebookLocales,
  languageNames,
} = require('./locales-config.json');

const locales = Object.keys(languageNames);

/*
Note: Translation function should be removed and
let the client deal with all translations / formatting of ejs
*/
const localeConfigs = {};
locales.forEach((d) => {
  localeConfigs[d] = require(`${__dirname}/locales/${d}.json`);
});
function translateWithLocale(locale, keyStr) {
  const keys = keyStr.split('.');
  let result = localeConfigs[locale];
  for (let i = 0; i < keys.length; i += 1) {
    if (result == null) { break; }
    result = result[keys[i]];
  }
  if (locale !== 'en' && !result) {
    return translateWithLocale('en', keyStr);
  }
  const formatArgs = Array.prototype.slice.call(arguments).slice(2); // remove 2 first
  return result && vsprintf(result, formatArgs);
}

// duplicated from server.js
// * Long-term caching
function getHash(key, ext, obj) {
  let filename;
  if (typeof obj.assetsByChunkName[key] == 'string') {
    filename = obj.assetsByChunkName[key];
  } else {
    // assume list
    filename = obj.assetsByChunkName[key]
      .filter((d) => d.match(new RegExp('\.' + ext + '$')))[0]
  }
  return filename.replace('.' + ext, '').replace(key + '.', '');
}

// * i18n
i18n.configure({
    // where to store json files - defaults to './locales' relative to modules directory
    locales: locales,
    directory: __dirname + '/locales',
    defaultLocale: 'en',
    queryParameter: 'lang',
    objectNotation: true,
    updateFiles: false // whether to write new locale information to disk - defaults to true
});

const template = ejs.compile(fs.readFileSync('../web/views/pages/index.ejs', 'utf8'));
const manifest = JSON.parse(fs.readFileSync(`${STATIC_PATH}/dist/manifest.json`));

locales.forEach(function(locale) {
    i18n.setLocale(locale);
    const html = template({
        alternateUrls: [],
        bundleHash: getHash('bundle', 'js', manifest),
        vendorHash: getHash('vendor', 'js', manifest),
        stylesHash: getHash('styles', 'css', manifest),
        vendorStylesHash: getHash('vendor', 'css', manifest),
        // Keep using relative resource paths on mobile platforms as that's
        // the way to keep them working with file:// protocol and HashHistory
        // doesn't require paths to be absolute.
        resolvePath: function(relativePath) { return relativePath; },
        isCordova: true,
        locale: locale,
        FBLocale: localeToFacebookLocale[locale],
        locales: { en: localeConfigs['en'], [locale]: localeConfigs[locale] },
        supportedLocales: locales,
        supportedFBLocales: supportedFacebookLocales,
        '__': function() {
            var argsArray = Array.prototype.slice.call(arguments);
            // Prepend the first argument which is the locale
            argsArray.unshift(locale);
            return translateWithLocale.apply(null, argsArray);
        }
    });

    fs.writeFileSync('www/electricitymap/index_' + locale + '.html', html);
});
