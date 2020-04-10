import fs from 'fs'
import path from 'path'
import test from 'ava'
import rimraf from 'rimraf'
import { makeSitemap } from '../'
import { parseString } from 'xml2js'

const BUILDPATH = path.resolve(__dirname, './fixtures')
const SITEMAP_OUTPUT = path.resolve(BUILDPATH, 'sitemap.xml')

test.afterEach.always(t => {
  // Cleanup runs after each test
  rimraf.sync(SITEMAP_OUTPUT)
})

test.serial('Creates Sitemap with all html files', async (t) => {
  let xmlData
  let sitemapData = {}
  try {
    sitemapData = await makeSitemap({
      homepage: 'https://site.com/',
      distPath: BUILDPATH,
    })
    xmlData = await parseXml(SITEMAP_OUTPUT)
  } catch (err) {
    console.log(err)
  }
  const pages = getPages(xmlData)
  t.truthy(sitemapData.sitemapPath)
  t.deepEqual(pages, [
    'https://site.com/index.html',
    'https://site.com/page-one.html',
    'https://site.com/page-three.html',
    'https://site.com/page-two.html',
    'https://site.com/children/child-one.html',
    'https://site.com/children/child-two.html',
    'https://site.com/children/grandchildren/grandchild-one.html',
    'https://site.com/children/grandchildren/grandchild-two.html',
  ])
})

test.serial('Sitemap exclude works correctly', async (t) => {
  let xmlData
  let sitemapData = {}
  const EXCLUDE_PATH = path.resolve(__dirname, './fixtures/children/grandchildren/grandchild-two.html')
  try {
    sitemapData = await makeSitemap({
      homepage: 'https://site.com/',
      distPath: BUILDPATH,
      exclude: [
        // Path
        EXCLUDE_PATH,
        // Glob pattern
        '**/**/child-one.html'
      ]
    })
    xmlData = await parseXml(path.resolve(BUILDPATH, 'sitemap.xml'))
  } catch (err) {
    console.log(err)
  }
  const pages = getPages(xmlData)
  t.truthy(sitemapData.sitemapPath)
  t.deepEqual(pages, [
    'https://site.com/index.html',
    'https://site.com/page-one.html',
    'https://site.com/page-three.html',
    'https://site.com/page-two.html',
    // excluded 'https://site.com/children/child-one.html',
    'https://site.com/children/child-two.html',
    'https://site.com/children/grandchildren/grandchild-one.html',
    // excluded 'https://site.com/children/grandchildren/grandchild-two.html'
  ])
})

function getPages(data) {
  return data.urlset.url.map((record) => {
    return record.loc[0]
  })
}

async function parseXml(filePath) {
  const xml = fs.readFileSync(filePath, 'utf-8')
  return new Promise((resolve, reject) => {
    parseString(xml, function (err, result) {
      if (err) {
        return reject(err)
      }
      return resolve(result)
    })
  })
}
