# Audit command reference

Active source: `Scripts/Audit.js`.  
Complexity: branching command script.  
Audience: GM-only; read-only diagnostics.  
Selection: not used; no token IDs are accepted.

```text
!stateaudit [SCOPE] [PAGE]
```

`SCOPE` defaults to `all` and must be one of:

- `ae` — `state.ActionEconomyV2`
- `adr` — `state.AttackDamageResolver`
- `se` — `state.SaveEffects`
- `aoe` — `state.AoEBoom`
- `executioner` — `state.Executioner`
- `all` — emits one audit for each root above

`PAGE` is optional, defaults to 1, and is clamped to the valid unresolved-ID page range. The audit recursively finds Roll20-looking IDs, checks supported object types, and reports unresolved references 20 per page. Generated Previous/Next/Refresh buttons repeat the same command.

```text
!stateaudit
!stateaudit ae 1
!stateaudit all 2
```

Registry discrepancy: the registry describes generic state inspection but does not enumerate these five scopes. The active source is authoritative for the scope set.
