# Vendored fonts

Two files, both latin-subset variable fonts, both committed on purpose.

| File | Family | Axis | Size | Source |
|---|---|---|---|---|
| `plus-jakarta-sans-latin.woff2` | Plus Jakarta Sans | `wght 400 800` | 24 KB | `https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2` |
| `jetbrains-mono-latin.woff2` | JetBrains Mono | `wght 400 700` | 31 KB | `https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwg.woff2` |

## Why they are here

`next/font/google` downloads fonts during the build. That turned the build into
a network dependency on `fonts.googleapis.com`, and when that request flaked the
build failed with a `TypeError` raised from the font loader - a failure with no
relationship to any change in the commit, which passed on a re-run.

`next/font/local` reads the same files from this directory instead. Nothing
changes in the browser: `next/font` self-hosts either way, so the runtime
requests still go to `/_next/static`, and the generated `@font-face` rules keep
the same weight ranges and fallback metrics (`size-adjust`, `ascent-override`).

## Licence

Both families are licensed under the SIL Open Font License 1.1, which permits
bundling and redistribution:

- Plus Jakarta Sans - <https://fonts.google.com/specimen/Plus+Jakarta+Sans>
- JetBrains Mono - <https://fonts.google.com/specimen/JetBrains+Mono>

The OFL requires the fonts to be redistributed under the same licence and not
sold on their own. Neither applies here, but do not swap these files for a
licensed-otherwise face without checking.

## Refreshing

To move to a newer release of either family, ask Google for the same request
with a modern user agent (which is what returns the variable woff2 rather than
per-weight static files) and take the `latin` block:

```sh
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
```

The `latin` `src:` URL in each response is the file to save, under the same name.
Keep the `weight` range in `layout.tsx` in step with the axis in the table above.
