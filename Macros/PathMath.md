# PathMath command reference

Active source: `Scripts/PathMath.js`.  
Complexity: branching diagnostic command script.  
Audience: player-usable in parser terms; no GM check is implemented.  
Selection: both commands unconditionally use the first actually selected path. Neither accepts an ID argument.

## Path diagnostic and red clone

```text
!pathInfo
```

Logs the selected path and its segment conversion, then creates a new red-stroked path from the converted segments on the same page and layer. Despite its name, this diagnostic mutates the page. Missing/invalid selection is caught and written only to the API log.

## Convert path to a UDL window

```text
!pathToUDLWindow
```

Passes the first selected path to `pathToUDLWindow()`. No mode or other argument is parsed. Missing/invalid selection is caught and logged.

Do not add token or path-ID substitutions; both commands rely on selected-path message context. Select only the intended path.

For integration context only, `PathMath` publishes its geometry classes and functions to other scripts and depends on `VecMath` and `MatrixMath`. Those JavaScript APIs are not macros. Live verification is required for Roll20 path formats and UDL window behavior.
