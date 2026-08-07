# MetaScriptToolbox reference

Complexity: simple command script (no chat command).

Source: active `Scripts/MetaScriptToolbox.js`. This file is a dependency gate and shared utility container for the installed meta-script stack. **It has no chat command, macro grammar, or public callable API.**

On `ready`, the active source validates that the following live globals meet minimum versions/contracts: ZeroFrame (`RegisterMetaOp`), APILogic, Fetch, SelectManager (`GetPlayerID`, `GetSelected`, `GetWho`), Muler, Plugger, MathOps (`MathProcessor`), libTokenMarkers, libTable, and Messenger. `checkLightLevel.isLitBy` is optional. If required dependencies fail, it whispers a GM missing-mod notice; it does not repair or replace them.

Use the module-specific references for actual syntax:

- ZeroFrame: loop/order/release tags.
- SelectManager: selection and preserved context.
- Fetch: property/repeating lookup.
- Muler: variable loading/storage.
- Plugger, MathOps, and APILogic: evaluation, math, and conditional rewriting.

The registry calls this file a shared meta-script utility and records no callable return API. Its own source returns an empty object. Any proposed `!metascripttoolbox`, `{& toolbox ...}`, or direct API call is unsupported. The exact result of dependency checking is live-only: confirm the Roll20 API log and GM notice after installation, particularly because it runs after ZeroFrame and before several project scripts in the required registry order.
