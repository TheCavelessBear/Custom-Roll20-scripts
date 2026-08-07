# libInline reference

Active source: `Scripts/libInline.js`.  
Complexity: simple command script (library-only).  
Direct Roll20 commands: none. The script handles `ready` only; selection is not used.

For integration context only, the JavaScript `libInline` API parses Roll20 inline rolls and exposes roll data, dice, total values, table results, parsed structures, and roll tips. ZeroFrame depends on these functions. JavaScript library calls are not chat macros.

Registry/help reconciliation: the active source and registry agree that there is no direct command.
