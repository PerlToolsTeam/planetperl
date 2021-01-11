# planetperl

[Planet Perl](https://perl.theplanetarium.org/) is a web site that aggregates Perl blogs, so you can read them all in one place. Web sites like this used to be popular right back in the early years of this millennium (ask your parents about "RSS feeds").

The site is built using [Perlanet](https://github.com/davorg/perlanet) (which is a Perl version of Python's [Planet](http://www.planetplanet.org/).

If you want to add a Perl blog to the site, then you'll want to send a PR to [perlanetrc](https://github.com/davorg/planetperl/blob/master/perlanetrc).

If you want to make the site look nicer or work more how you'd like it to, then you'll probably want to send a PR to [index.tt](https://github.com/davorg/planetperl/blob/master/index.tt) (and you'll probably need to know a bit about Perl's [Template Toolkit](https://tt2.org/) and/or [jQuery](https://jquery.com/) - or perhaps even [Bootstrap](https://getbootstrap.com/)).

If you want to fix the broken way it parses a particular web feed, then you'll probably want to look at the underlying [Perlanet code](https://github.com/davorg/perlanet).

The site is hosted on [GitHub Pages](https://pages.github.com/) and is automatically rebuilt using [GitHub Actions](https://docs.github.com/en/free-pro-team@latest/actions).
