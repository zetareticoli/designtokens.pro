# Design Tokens Pro vs Style Dictionary

[Style Dictionary](https://styledictionary.com/) is Amazon’s open-source build system for design tokens. You define values once in JSON (or JavaScript), and it transforms them into CSS variables, iOS, Android, documentation, or any format you configure. Version 4 understands the DTCG shape (`$value`, `$type`, `$description`) as well as the older format.

Teams often treat the Style Dictionary docs as “the design tokens guide.” Those docs teach the **pipeline**. They do not teach the decisions the pipeline will faithfully ship.

## What Style Dictionary is for

Use it when you have a token source of truth and need platform-specific output: sources, platforms, transform groups, formats, and references. Custom transforms exist because every org’s output is slightly different. The documentation will not sit with your designers to agree what “primary” means.

## What the guide is for

Design Tokens Pro starts earlier: what a token is, which pieces belong in the name, how to layer primitive / semantic / component tokens, how compound tokens differ from single values, how themes stay maintainable, and how to document and retire tokens. JSON examples are there so you can feed a clean set into Style Dictionary — or any other transformer.

| | Design Tokens Pro | Style Dictionary |
|---|---|---|
| What it is | $39 written guide | Open-source Node build tool |
| Job | Decide names, layers, themes, docs | Transform and emit platform files |
| Audience | Designers and developers together | Primarily engineers configuring a build |
| You still need | A tool to export to code (often this one) | A coherent token model as input |

## They complement each other

Style Dictionary will not write your taxonomy. The guide will not compile Swift tokens. Read the guide first if you are still arguing about naming or layers. Open Style Dictionary when you are ready to ship CSS and native files from a source you trust.

- Checkout: https://francescoimprota.kit.com/products/design-tokens-pro?step=checkout
- Other comparisons: https://www.designtokens.pro/compare
