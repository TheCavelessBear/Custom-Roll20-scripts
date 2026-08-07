# Messenger reference

Active source: `Scripts/Messenger.js`.  
Complexity: simple command script (library-only).  
Direct Roll20 commands: none. Selection is not used.

For integration context only, the JavaScript `Messenger` API provides shared HTML, CSS, buttons, encoded text, and message-box construction for scripts that adopt it. These helpers do not create a standalone Roll20 macro interface.

Registry/help reconciliation: the source and registry agree that the only direct lifecycle entry is setup on `ready`.
