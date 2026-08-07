# libTable reference

Active source: `Scripts/libTable.js`.  
Complexity: simple command script (library-only).  
Direct Roll20 commands: none. The script handles `ready` only; selection is not used.

For integration context only, the JavaScript `libTable` object exposes rollable-table and table-item lookup helpers, including table discovery and item lookup by index, name, weight, and weighted index. These methods are dependencies for Muler and other scripts; they are not Roll20 macros.

Live verification: table visibility, item weights, and campaign data determine returned results.
