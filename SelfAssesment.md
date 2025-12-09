## Self-Assessment Checklist
- Is the payment state machine clearly modeled and easy to change?  
  Yes. Code is very clean and easy to change or add any new state or change anything
- Can I add a new command (e.g. `CHARGEBACK`) with minimal modifications?  
  Yes, just create a new function to handle chargeback and add it to switch in file `handleCommand.ts`
- Is my parsing logic decoupled from business rules?
  - Yes, we merely parse the tokens and do not care about what happens after
- Does `AUDIT` respect the “no side effects” requirement?  
  Yes
- Do I correctly distinguish `SETTLE` (per payment) from `SETTLEMENT` (batch/reporting-level)?  
  Yes
- Is the behavior of inline `#` comments exactly as specified?  
  Yes, the behaviour is right
- Do I avoid raw stack traces and instead provide clear, user-friendly errors?
  Yes. Stack traces will happen with `pnpm start:file` if 
  1) commands.txt is deleted
  2) in `package.json` under `start:file` the file name is changed
- Would I be comfortable maintaining this code in a real codebase?
  Yes, but real codebase would have more backend logics(DB, and etc).
  If we follow proper compartmentalizing, we can.