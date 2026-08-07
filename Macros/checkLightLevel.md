# checkLightLevel command reference

Active source: `Scripts/checkLightLevel.js`.  
Complexity: branching diagnostic command script.  
Audience: GM-only for the direct command.  
Selection: uses every actually selected token; no token-ID argument is accepted.

## Inspect selected tokens

```text
!checklight
```

The command reports global light, bright light, accumulated dim-light sources, darkness, and partial illumination for each selected token. The selected tokens must be on a page with dynamic lighting enabled. Do not append `@{selected|token_id}` or a target ID; the parser ignores arguments and reads `msg.selected`.

The source matches `!checklight` case-insensitively anywhere in an API message. Use the canonical standalone form to avoid accidental activation.

Meta-script context: when Plugger is present, the script registers a `checklight` plugin rule that returns the first selected token's total light as a four-decimal string. That plugin call is part of the Plugger language, not a standalone second `!checklight` macro.

For integration context only, `checkLightLevel.isLitBy(tokenOrTokenId)` is a JavaScript API. Dependencies include Roll20 page lighting, path/vector geometry, and optionally Plugger. Live verification is required for UDL line-of-sight and light-source settings.
