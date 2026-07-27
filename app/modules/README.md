# Venu module library

Every Venu feature is a **self-contained module** that lives in its own file here.
When we build a client site, the app loads *only* the modules that client's
`features` config turns on — so each event ships exactly the code it needs.

## The interface

Each module file registers itself into a global registry:

```js
window.VenuModules = window.VenuModules || {};
VenuModules.register("schedule", {
  tab:   { label: "Schedule", view: "schedule" },   // optional bottom-tab entry
  styles: "...css string...",                        // optional, injected once
  render(ctx) {                                       // build the module's UI
    // ctx = { el, client, slug, store }
    //   el     -> the container element to render into
    //   client -> the resolved client config (brand, days, speakers, ...)
    //   slug   -> client slug (for scoped storage keys)
    //   store  -> the Firestore-backed storage adapter
  }
});
```

## Loading (per config)

The app reads `client.features` (e.g. `{ schedule:true, photoWall:true, ... }`),
loads the matching `modules/<id>.js` files, and calls each module's `render(ctx)`
into its view. Modules with a `tab` also add a bottom-nav entry.

## Status

`manifest.js` is the single source of truth for module metadata **and dev status**
(`live | beta | planned | roadmap`) — the same statuses shown on Michael's owner
view in the builder portal.

- **live** modules are extracted into real files here first.
- **planned** modules start as stubs and get built out iteratively (Task 11).

## Build order

Extract the already-working features first: `schedule`, `speakers`, `sponsors`,
`photo-wall`, `moderation`, `big-screen`. Then work down the planned list.
