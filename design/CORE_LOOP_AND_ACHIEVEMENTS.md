# Tutorial map and account achievements

Design baseline: October 20, 2026.

## Accepted direction

The first map is the tutorial map. Teach placement, earning and spending gold, upgrading, wave previews, elemental combinations, adapting a defense, and boss preparation through play. Use the approved elemental sprite reference and preserve all previously approved visual designs. Account achievements provide lasting goals and profile badges.

The specifics below are the initial design specification. Numerical thresholds and tutorial pacing require playtesting; they are not claims of implemented gameplay or account services.

## Tutorial: First Watch

One fixed path with a clearly visible bend and several forgiving placement positions. Eight short waves, approximately 5–7 minutes for a first playthrough, subject to testing. No build timers. Pause and speed controls remain available. Prompts point at the relevant control and use one short instruction at a time. Returning players can skip guidance and replay the map.

1. **Place and observe.** Open directly on the battlefield with enough gold for a fire tower. Highlight a useful placement area. Teach range before confirming a purchase, then let the player start wave one. Avoid a separate mandatory menu.
2. **Earn and upgrade.** Show gold arriving from kills. Offer a basic upgrade and explain its actual effect. Keep enough resources available to complete the lesson without waiting or grinding.
3. **Read the threat.** Preview a small fast-enemy wave. Introduce water and show the effect of its slowing/soaking attacks through enemy visuals.
4. **Discover the first combo.** Introduce ice and suggest overlapping its range with water. A water-soaked enemy freezes when hit by ice: award **Just Chilling**. Use a forgiving enemy group and enough gold to demonstrate this reliably.
5. **Try another interaction.** Introduce lightning against a group. Water plus lightning visibly chains through soaked targets. Award **Current Affairs** when an additional target is actually hit.
6. **Choose the tradeoff.** Demonstrate that fire shatters a frozen target, deals a burst, and ends its freeze. Make the ending of crowd control explicit. Award **Ice to Meet You** on a resolved shatter event.
7. **Build independently.** Preview a mixed wave. Remove compulsory prompts and let the player spend, reposition through selling, and experiment. Show sell value before confirmation. An undoable placement preview prevents accidental purchases.
8. **Prepare for the boss.** Preview a slow, high-health tutorial boss. It remains susceptible to the taught interactions; do not introduce unexplained immunities. Reward completion, show earned badges, and reveal the next goals.

Teaching is not locked behind achievement triggers: if the intended interaction does not occur, show a contextual hint and provide a retry opportunity. Never silently award an achievement for an interaction that did not happen. Tutorial achievements remain available on replay. Failure offers immediate retry with guidance; it does not remove account unlocks.

## Combo event definitions

These definitions make achievement rules understandable and prevent ambiguous tracking.

- **Water + ice / soaked freeze:** an ice hit transitions a currently soaked, non-frozen enemy into frozen state. Mere range overlap does not count.
- **Water + lightning / conduction:** a lightning attack uses a soaked target to hit at least one additional enemy. Damage must resolve on that additional enemy.
- **Fire + ice / shatter:** a fire hit on a currently frozen enemy resolves shatter burst damage and consumes the frozen state.
- Combo kills attribute damage to the originating combo event. A later unrelated kill does not become a combo kill.
- One enemy can satisfy separate combo achievements over time, but a particular freeze transition counts only once. Repeated hit callbacks are not new freezes.

## Launch achievement catalog — 20 badges

All achievements are one-time account unlocks. Every badge has a name, description, earned date, and matching profile artwork. All are visible while locked, including progress where applicable. A mission means a completed standard campaign mission; tutorial-specific exclusions are stated below. No achievements require ads, payment, daily streaks, or account login during combat.

| Stable ID | Name | Exact unlock rule | Badge art concept |
| --- | --- | --- | --- |
| first_foundation | Permit to Defend | Confirm the first tower placement in a valid build position. | Small stone foundation with a gold check mark. |
| first_upgrade | A Little More Oomph | Complete the first paid tower upgrade. | Copper wrench beside an upward orange spark. |
| tutorial_clear | Class Dismissed | Win the tutorial map. | Rolled parchment with a tiny tower seal. |
| first_soaked_freeze | Just Chilling | Trigger one water + ice soaked-freeze event. | Turquoise droplet enclosed in a pale-blue ice crystal. |
| first_conduction | Current Affairs | Trigger one water + lightning conduction event. | Turquoise droplet crossed by a violet lightning fork. |
| first_shatter | Ice to Meet You | Trigger one fire + ice shatter event. | Orange flame breaking through blue crystal fragments. |
| all_combos_one_run | Chemistry Set | Trigger all three launch combo types during one mission attempt. | Three small elemental gems around a copper ring. |
| one_chain_four | Watt a Crowd | One lightning attack damages at least four distinct enemies, including its initial target, through water conduction. | Violet bolt branching into four turquoise sparks. |
| one_shatter_three | Breaking the Ice | One shatter burst kills at least three distinct enemies, including the primary target if applicable. | Three cracked ice shards surrounding an orange burst. |
| freeze_twenty_five | Freeze Frame | Trigger 25 soaked-freeze events across all attempts. | Faceted ice crystal inside a copper frame. |
| conduction_twenty_five | Making Connections | Trigger 25 conduction events across all attempts. | Two copper terminals joined by a violet arc over water. |
| shatter_twenty_five | Some Like It Thawed | Trigger 25 shatter events across all attempts. | Melting ice crystal with a small central flame. |
| all_elements_one_run | Four Real | Have at least one built tower of each of the four elements at the same time during a mission. | Four elemental stones set in a stone crest. |
| perfect_campaign_mission | Not on My Watch | Win a non-tutorial campaign mission without any enemy reducing base health. | Untarnished stone shield with a gold star. |
| close_call | Structurally Questionable | Win a non-tutorial campaign mission with base health above zero and at or below 10% of its starting maximum. | Cracked stone shield held together with copper braces. |
| early_wave_five | Express Delivery | Manually send five eligible waves early across all attempts. Count only when enemies from the previous wave remain alive; count each wave once. | Copper wave bell with orange speed marks. |
| two_elements_only | Less Is More | Win a non-tutorial campaign mission after building towers from no more than two element types over the entire attempt. Selling towers does not erase element usage. | Two elemental gems on a compact stone pedestal. |
| three_maps_clear | Change of Scenery | Win three distinct campaign maps, including the tutorial. | Three tiny landscape stones joined by a path. |
| ten_mission_wins | Shift Supervisor | Win ten campaign missions across all attempts, with at most one tutorial win contributing. | Stone tower crest with a copper laurel. |
| first_endless_twenty | Overtime Optional | Complete wave 20 in endless mode. | Copper hourglass with an orange ember inside. |

**Availability:** the first playable tutorial can support its applicable achievements. Badges requiring later maps or endless mode must display their availability clearly and cannot be presented as currently earnable until those modes ship. The launch plan includes three campaign maps and an endless mode if the complete catalog is to be earnable on release. If that scope changes, revise the affected catalog entries explicitly before release.

**Balance dependencies:** wave compositions must make four-target conduction and three-kill shatter attainable through ordinary play. Early-wave sending is optional and appears after the introductory lessons. No achievement is required to finish the tutorial or advance the campaign. The two-element challenge must be tested as a viable strategy.

## Profile and reward presentation

- Achievement gallery: 20 visible slots with locked/earned state, a readable requirement, progress for cumulative goals, and earned date.
- Let the player choose one earned badge for their profile. Do not replace it automatically when another unlocks.
- Small non-blocking unlock toast during play, with a queue so several unlocks never cover the battlefield at once. Honor mute and reduced-motion preferences.
- Mission results recap all newly earned badges and suggest up to three currently available unfinished goals.
- Rewards are profile recognition, not damage, gold, or required progression. Every ordinary achievement has equal visual care; difficulty can affect border treatment without changing the underlying art style.
- Badge art uses the approved painted fantasy materials, colored outlines, elemental colors, upper-left light, and coherent copper/stone framing. Check recognizability at 32 and 64 pixels. Individual artwork is still to be created and reviewed; the descriptions here are not finished assets.

## Persistence contract

The eventual account system must retain unlocks between sessions and devices. Local storage alone does not satisfy per-account persistence.

- Persist stable achievement IDs, an unlock timestamp, and cumulative counters separately from mission saves. Persist the equipped badge ID as a profile preference.
- Evaluate from resolved gameplay events, never button clicks alone. Maintain unique run IDs and event IDs or equivalent deduplication so retries, callbacks, and synchronization do not double-count.
- Save an unlock promptly. Unlocks are monotonic: loading an older mission or repeating the tutorial must not relock them.
- Guests can earn locally without a compulsory sign-in gate. Clearly communicate local-only status. On account attachment, merge earned-ID sets, keep the earliest known unlock timestamp, and migrate guest counters once using an idempotent migration record. Do not add complete historical counter snapshots together repeatedly.
- Account isolation matters: after sign-out, do not copy the previous account's achievements into another account. Define guest ownership explicitly before implementation.
- Concurrent account sessions need deduplicated event/delta handling or a single-writer scheme for cumulative counters; taking the maximum alone can lose independent progress, and summing snapshots can duplicate it.
- Provide a platform persistence adapter so the CrazyGames account/save integration can back this design when preparing that build. Verify current platform requirements at implementation time. Do not build an external login gate for the CrazyGames version.
- Version the catalog and save format. Balance updates must preserve existing earned IDs. Internal development reset tools must not appear in the production profile.

## Verification before release

Verify actual combo events and kill attribution; no unlock on mere placement/range overlap. Verify one award per badge, cumulative progress after a failed run, save/reload, replay, account switching, guest migration, duplicate events, and interrupted writes. Verify that all 20 launch goals are actually attainable and that badge toasts never obscure tutorial controls. Review tutorial playtests for confusion, waiting, and whether players understand the interaction they just earned a badge for.
