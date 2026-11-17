# How Planet Perl works

Planet Perl aggregates Perl-related web feeds into a static website at
<https://perl.theplanetarium.org/>. This repository supplies configuration,
a page template, browser assets, and a small JSON export script. The feed
aggregation engine is the external Perl distribution **Perlanet**; its
implementation is not included here.

There is no application server, database, JavaScript build pipeline, or
package.json in this repository. GitHub Actions generates the site and deploys
the contents of `docs/` to GitHub Pages. Visitors receive static HTML, XML,
JSON, images, CSS, and JavaScript.

## Repository map

| Path | Purpose |
| --- | --- |
| `perlanetrc` | YAML configuration: site metadata, source feeds, output paths, limits, cache, and filtering settings. |
| `index.tt` | Template Toolkit template for the generated homepage. |
| `cpanfile` | Declares dependencies on `Perlanet` and `LWP::Protocol::https`. |
| `bin/link-json` | Converts a local or remote feed into a filtered JSON array of article links. |
| `docs/script.js` | Source selection, saved browser preferences, and keyboard navigation. |
| `docs/css/style.css` | Layout, typography, light/dark themes, and responsive styling. |
| `docs/images/` | Branding and feed subscription icons. |
| `docs/CNAME` | Contains the custom hostname `perl.theplanetarium.org`. |
| `.github/workflows/buildsite.yml` | Generates, packages, and deploys the site. |
| `.github/workflows/reject-pr.yml` | Automatically closes opened or reopened pull requests that change `docs/index.html`. |
| `.github/dependabot.yml` | Requests weekly GitHub Actions dependency updates. |

`docs/` contains both maintained assets and generated outputs. The generated
files `docs/index.html`, `docs/atom.xml`, and `docs/opml.xml` are ignored by Git;
a fresh clone needs a build to create them. `docs/links.json` is also generated,
but is **not** currently ignored. Local builds also create `perlanet.log`, which
is not ignored. Existing generated files in a working directory can be stale
and should not be treated as the source of truth.

## From source feeds to published files

The build follows this sequence:

```text
perlanetrc: feed URLs and aggregation settings
                 |
                 v
             perlanet <--- index.tt
                 |
                 +-- docs/index.html   rendered article cards and source list
                 +-- docs/atom.xml     aggregated Atom feed
                 |       |
                 |       v
                 |   bin/link-json --> docs/links.json
                 |
                 +-- docs/opml.xml     source feed subscription list

generated files + maintained assets in docs/
       |
       v
GitHub Pages artifact --> deployed website
```

`perlanet` runs from the repository root and uses `perlanetrc`. Perlanet handles
fetching, parsing, aggregation, and rendering; this repository does not contain
its own implementation of those steps. Feed parsing problems may therefore
need a fix in Perlanet or its dependencies rather than in this project.

The configuration lists sources including blogs, community
sites, jobs, videos, and Perl's GitHub commit feed. Each source has a `feed` URL,
a display `title`, and a `web` URL for its website. The configured limits are
75 entries overall, five entries per source, and a one-month cutoff.
`spam_filter` supplies patterns to Perlanet. Exact filtering and ordering
semantics depend on the installed Perlanet version.

Other settings include site title and description, author information, the
Google Analytics identifier, output filenames, and `cache_dir: /tmp/perl`.
The workflow does not explicitly preserve that cache between runs.

### JSON export

`bin/link-json` takes one positional argument: a local feed filename or an
HTTP(S) feed URL. It parses that feed with `XML::Feed` and writes pretty-printed
JSON to standard output. The workflow passes `docs/atom.xml`, so this export
contains a subset of the already aggregated entries, not the original feed
directory.

Each array element has this shape:

```json
{
  "title": "An article title",
  "url": "https://example.org/article",
  "posted": "2026-11-17T12:00:00"
}
```

`posted` comes from the entry's `modified` date, falling back to `issued`, and
uses that date object's `iso8601` method. The script preserves feed iteration
order; it does not separately sort or deduplicate the results.

It skips links matching the configured patterns for Stack Overflow, Perl's
GitHub area, Weekly Challenge tag pages, Reddit, and HTTP RabbitFarm URLs.
It also skips titles containing `perl tokens` or `perlinx`, case-insensitively.
These exclusions apply only to the JSON export. They are separate from
`perlanetrc`'s aggregation settings and the browser's source checkboxes.

## Page rendering and browser behavior

`index.tt` receives the aggregate `feed` and `config` from Perlanet. It renders
a source list sorted by title and one card per aggregate entry. Source slugs
connect checkbox IDs to CSS classes on cards. Each card shows the article link,
source, optional author, and modification date or publication date. The body
uses entry content, falling back to its summary. The `card_body` macro also
contains special cases suppressing bodies for source names `twitter`, `cpan`,
and `last.fm`.

The layout uses Bootstrap 5.3.7 and jQuery 3.7.1 from CDNs. It also loads Google
Fonts, Font Awesome, Google's favicon service, a conditional Google Analytics
tag, and `perl-ads.perlhacks.com/perl-ads.js`. Those external services are
runtime dependencies for their respective features. Local CSS uses custom
properties and `prefers-color-scheme` for light/dark themes. On wide screens
the source list is a sticky sidebar; on smaller screens it follows the cards.
The template adds the CSS file's modification time to its URL for cache busting.

`docs/script.js` provides:

- Source checkboxes that show or hide cards already present in the page. They
  do not change the build, fetch more articles, or alter the published feeds.
- Persistent source choices in the `planet_perl` localStorage object, keyed by
  source slug, with string values `"true"` and `"false"`. An initial migration
  moves older per-source localStorage keys into this object.
- Show and Hide buttons, plus `s` and `h` shortcuts, to control article bodies.
  Both buttons and shortcuts save the choice in a `showhide` cookie for
  1,000 days. An early script in `index.tt` restores the hidden state before
  article bodies appear, using the `hide-articles` class on the HTML element.
  First-time visitors see full articles. The buttons expose the selected
  state with `aria-pressed`.
- Next and Previous buttons, plus `n` and `p` shortcuts, to move between
  visible article cards, skipping sources the visitor has hidden and keeping
  headings below the fixed navigation bar. Shortcuts ignore form fields,
  editable content, and Ctrl/Alt/Meta combinations.

All four buttons appear on mobile and desktop, with touch targets at least
44 pixels tall and a layout that wraps on narrow screens.

Preferences stay in the visitor's browser; there is no account or server-side
preference store.

## Automated build and deployment

The `Generate web page` workflow runs:

- Every four hours, at minute zero (`0 */4 * * *`, UTC).
- When manually dispatched.
- On pushes changing `perlanetrc`, `index.tt`, `docs/*`, or `docs/css/*`.

There is no branch filter on the push trigger. The path filters do not cover
everything used by the build: changes only to `bin/link-json`, `cpanfile`,
workflow files, or nested `docs/images/` files do not match them. Such changes
can be picked up by a later scheduled or manual build.

The build job runs on Ubuntu inside `davorg/perl-perlanet:latest`. It checks out
the repository, runs `perlanet` with output redirected to `perlanet.log`, then
runs `bin/link-json docs/atom.xml > docs/links.json`. It uploads the log as an
artifact with three-day retention, then uploads all of `docs/` as the Pages
artifact. The log upload is an ordinary step, so an earlier failed command
can prevent it from running.

A separate deployment job waits for the build and uses `actions/deploy-pages`.
It has `pages: write` and `id-token: write` permissions and targets the
`github-pages` environment. Generated output is deployed as an artifact, not
committed back to the repository. Repository Pages settings and domain DNS
configuration are outside the files inspected here.

The workflow uses a mutable `latest` container tag, and `cpanfile` specifies no
versions. Consequently, this checkout alone does not pin the Perl runtime or
the complete dependency set used by a future build.

## Building and inspecting locally

Run commands from the repository root. With Perl, `cpanm`, and any required
system libraries available, install the declared dependencies:

```sh
cpanm --installdeps .
```

The JSON exporter additionally imports `URI`, `XML::Feed`, and `JSON::PP`.
These must be available too; they are not separately declared in `cpanfile`.
The CI container is expected to supply the tools needed for both build steps.

Use the same generation commands as CI:

```sh
mkdir -p docs
perlanet > perlanet.log 2>&1
bin/link-json docs/atom.xml > docs/links.json
```

Feed fetching requires network access. For an HTTP preview, if Python 3 is
available, serve `docs/` as the web root:

```sh
python3 -m http.server 8000 --directory docs
```

Open `http://localhost:8000/`. Serving that directory as the root matters
because the template uses paths such as `/script.js`, `/css/style.css`, and
`/atom.xml`. Some metadata and subscription links still use the production
URL from `perlanetrc`; this preview command does not rewrite configuration.

There is no checked-in automated test suite or separate lint/test workflow.
Useful checks after implementation changes include compiling the exporter
with `perl -c bin/link-json`, inspecting generated XML/JSON, and trying source
selection, saved preferences, shortcuts, and mobile/dark layouts in a browser.

## Where to make changes and current caveats

- Add or update a source in `perlanetrc`, using the existing `feed`, `title`,
  and `web` structure.
- Change generated markup in `index.tt`, appearance in `docs/css/style.css`,
  and interactions in `docs/script.js`. Do not edit generated `docs/index.html`;
  the PR workflow closes requests that change it.
- Change JSON-only exclusions or output fields in `bin/link-json`.
- Change build timing, triggers, or deployment in
  `.github/workflows/buildsite.yml`.

Several implementation details deserve attention when working in these areas:

- “All Feeds” has handlers in both the template and `docs/script.js`. The
  template handler sets individual checkbox states and then triggers clicks,
  while the script has its own bulk state update. It is also always marked
  checked at startup, even when saved source choices hide some feeds.
- The template includes malformed footer markup (`<div class="row>`).
- Source HTML bodies are inserted without an HTML-escaping filter in the
  template. Any upstream sanitization depends on Perlanet and its dependencies.
- The JSON exporter assumes feed parsing succeeds and each included entry has
  a usable date. Its URL exclusions are interpolated regular expressions,
  rather than escaped literal prefix comparisons.

These are observations of the current code, not fixes included in this document.

## Review scope

This explanation is based on the tracked configuration, template, scripts,
assets, and workflows. During review, `perlanetrc` parsed successfully as YAML,
`bin/link-json` passed Perl's syntax check, and the exporter ran successfully
against an existing local `docs/atom.xml`. Perlanet itself was unavailable in
the review environment, so a complete network aggregation and deployment were
not run. Existing local generated files do not establish the current state of
the published website.
