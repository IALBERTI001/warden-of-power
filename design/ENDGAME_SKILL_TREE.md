# Warden of Power: endgame progression and skill tree

## Approved direction

The player is the Warden of Power. The setting is an ancient elemental containment complex with overgrown outer grounds. Towers recapture manifestations of unstable power and protect containment seals. Campaign sectors and facility restoration lead to reopening the central engine. This supersedes the proposed garden Keeper role.

Campaign victories provide Restoration Parts for required facility repairs. Endless mode is an endgame unlock after clearing campaign requirements and completing prerequisite restorations. Required project names, quantities and clear conditions need a dedicated campaign specification.

Endless attempts award Resonance for skill-tree progression. Bonuses strengthen towers in endless mode only. Bank earned rewards at wave milestones and preserve them on defeat. Free reassignment is available between attempts, not during a run. Avoid using skill respec as an in-run economy exploit. Specific earnings and costs require testing.

A shared account-based top-10 endless ladder ranks highest completed wave, with the player's own rank shown separately. Proposed tie-break is faster completion to that wave, excluding pauses and normalizing speed settings. Submissions require validation; actual backend, platform integration and anti-cheat are not implemented. Balance versions that are not comparable require separate records.

All status effect treatments from review 04 are approved. Freeze balance starting values: 1.5-second freeze; 4-second resistance after natural thaw; **2-second resistance after fire shatter**. A freeze consumes soaked. Additional hits cannot extend frozen time or bypass resistance. Skill nodes must preserve these rules. Boss duration is shorter, with exact values still to be specified. Update earlier references that assumed shatter recovery equaled natural thaw.

## Skill-tree presentation proposal (awaiting approval)

Interactive review source is the thread-owned `warden-skill-tree.html` visualization. It contains two proposed layouts using the same 20-node catalog:

- **Conduit board:** five parallel elemental branches connected to the Warden's central seal; the complete tree remains visible. Selected details stay beside the board on desktop and reflow below on smaller screens.
- **Branch focus:** elemental navigation and four larger upgrade cards for one branch, with the same comparison panel. This provides larger text and more room for descriptions.

Visual language: quiet dark stone surfaces, restrained brass framing, elemental color only at meaningful nodes, readable cream text, no looping decoration. This is a UI layout and interaction prototype, not final painted icon artwork. Existing approved character and tower art is unchanged. Icons in this review are interface symbols; final skill icon production must follow the approved painted art direction.

Every node can be selected, including locked nodes. Selection never spends currency. Detail view names the bonus, shows current and next rank values, exact price, prerequisite and mechanical limits. Unlock requires a separate explicit action. Locked, available, learned and selected states are labeled, not indicated only through color. Preview currency and allocations are fictional and do not affect a player account.

The proposed catalog has four nodes per branch: three 3-rank upgrades and a 1-rank capstone. Each successive node requires at least rank 1 in the previous node. Thus players can progress along a branch or deepen a learned node. Costs are illustrative: 25/50/75 for first-node ranks, 40/65/90 for second-node ranks, 55/80/105 for third-node ranks, and 120 for capstones. Caps and additive stacking rules are visible. These numbers are not approved combat balance.

| Branch | First node | Second node | Third node | Capstone |
| --- | --- | --- | --- | --- |
| Fire | Furnace tuning: +8% burn damage/rank | Hot pursuit: +6% impact damage/rank | Thermal fracture: +10% shatter damage/rank | Blast chamber: +20% shatter radius |
| Water | Deep saturation: +10% soak duration/rank | Long reach: +4% range/rank | Pressure valve: +5% attack speed/rank | Overflow: soak one additional nearby target |
| Ice | Cold front: +2 percentage points chill slow/rank, 50% slow cap | Brittle targets: +10% ice damage vs frozen/rank | Crystal focus: +4% range/rank | Cold calculation: +20% ice damage vs bosses |
| Lightning | Live wire: +6% damage/rank | Close connection: +8% conduction distance/rank | Conductive force: +8% secondary hit damage/rank | Chain reaction: one extra chain target |
| Engineering | Reserve capacity: +20 starting Charge/rank | Efficient fittings: 2% upgrade discount/rank, 6% cap | Reclamation: +5 percentage points sell refund/rank, 90% refund cap | Stable current: +30 Charge per fifth completed wave |

Engineering refunds are calculated from actual amount paid, including discounts. Minimum upgrade cost is 1 Charge. Baseline sell percentage, slow strength and all cross-skill multiplier ordering still need combat/economy definitions before implementation. No purchases alter Resonance rewards, freeze resistance, campaign balance, or ladder scoring rules.
