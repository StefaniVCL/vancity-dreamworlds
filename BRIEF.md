# BRIEF — vancity-dreamworlds

Interviewed in compact form (4 structural questions answered by the CEO via
question dialog, 2026-08-23). Remaining interview slots self-authored in the
brand's voice and marked as such.

## Interview answers

1. **Vibe (their words):** "Psychedelic dreamworld". Original ask: "Build me a
   story worlds website for VCL, use all the art website and imagery craft an
   amazing story for the site" ... "art from the actual site"
   (https://www.vancitylabs.co/). References (self-authored): macro cannabis
   photography treated like planets in a dream; Fantasia's night sequences; the
   feeling of falling asleep in a city that keeps growing things without you.
2. **Journey (their choice):** "Distinct worlds, one per product. Each product
   family (flower, rosin, hash, diamonds, cannalean...) is its own
   self-contained world with its own color, mood and story beat. Scroll travels
   between them." Practical note: eleven full worlds cannot fit the 8 to 14
   viewport-height budget, so four worlds get full acts and every remaining
   product family gets a world-styled card in the market rail, each with its own
   hue and story line, linking to its shop category.
3. **Energy curve (self-authored):** quiet at the top (falling asleep), rising
   wonder through the middle worlds, one true silence, then the loudest moment
   on the page (the Bloom), easing out into a warm, awake ending.
4. **Feel + the one moment:** CEO delegated: "You invent it". Invented peak: THE
   BLOOM. See below.
5. **One thing no site they've seen does (self-authored):** the page behaves
   like a dream: scroll gently and it breathes; scroll fast and it melts.
6. **Distance from premium-minimal (their choice):** psychedelic dreamworld,
   i.e. well away from premium-minimal. Maximal color per world, held to the
   taste floor.
7. **One world or distinct scenes (their choice):** distinct worlds (they
   explicitly did not pick the unbroken journey option).
8. **Assets on hand:** the live site's full art set, downloaded: 11 transparent
   product macros (flower, smalls, preroll, rosin, extracts, hashish, diamonds,
   isolates, edibles, cannalean, vapes), hero rosin poster, brand SVG logo set,
   monthly deals badge. No video. No generation needed; zero kie.ai spend.

## Feeling curve (one line per act)

```
1  Hush         night-indigo ground, the wordmark and one quiet line, the whole
                hero sinks and softens as you scroll, like lying back
2  Surrender    three short lines arrive one at a time on a darkening ground
3  Wonder       the Grove: violet world, small buds and a cone floating at
                different depths under the hand (parallax)
4  Warmth       the Golden River: amber world, molten rosin macro masked beside
                calm copy, a slow wipe pours the second image in
5  Brilliance   the Glass Cavern: ice world, diamonds under a prismatic light
                that follows the pointer
6  Held breath  authored silence: a nearly empty viewport, one faint line.
                THIS EMPTINESS IS INTENTIONAL, it is the quiet before the peak
7  Awe          THE BLOOM: a speck in the void grows into a frost-covered
                purple flower that fills the frame while the whole page blooms
                violet around it
8  Delight      the Candy Sky market: a lateral rail of world-cards, every
                product family gets its own hue and story line, each links to
                its real shop category
9  Resolve      Wake: "Open your eyes. It's all real." One CTA into the shop,
                dawn-warm ground, footer holds
```

## The peak

**THE BLOOM.** Sentence a visitor would say: "There's a bit where a tiny speck
in the dark slowly grows into this huge frosted purple flower under your
scroll, and the whole site turns violet around it."

It gets the largest span on the page (3.2 viewport-heights against a 1.9
next-largest), the silence act in front of it, and the best asset (the frosted
purple bud macro, used nowhere else on the page).

## The tell-someone sentence

It's the site where the dream melts if you scroll too fast and breathes when
you stop, and where a speck in the dark blooms into a giant frozen flower.

## Signature move

**The page dreams with you.** A velocity tracker melts the visible world art
(SVG displacement plus hue drift and grain surge) when the visitor scrolls
fast, and when they stop, the page settles into a slow six-second breathing
cycle. Strongest during the Bloom, where the flower visibly inhales. Bespoke JS
in the page, engine untouched, gated to fine pointers and no-preference reduced
motion.

## Revision 2 (CEO feedback, 2026-08-23)

CEO: the acts didn't flow together, the hero was "a black screen with text",
and the whole page should be artwork. Revision: seven generated dreamworld
backdrops (seedream, one verbatim style preamble) now sit full-bleed behind
every act, and six kling morph clips bridge every pair of adjacent worlds,
head and tail frame-locked to the backdrops on both sides so each transition
scrubs seamlessly from one world into the next. The silence act became the
cavern-to-void bridge (the lights physically go out). Page is now 13 acts at
~21 viewport-heights: over the 8-to-14 guideline, deliberately, because the
CEO asked for the interconnected epic. Measured account delta for all
generation: 976 credits.

## Revision 3 (CEO feedback, 2026-08-23)

CEO: the panels still didn't flow; the section handoffs showed as sliding
blocks. Root cause: act mode stacks stages in document flow, so even
frame-matched clips have a visible seam where one stage slides past the next.
Rebuilt as worldflight (grammar is now continuous world): one fixed canvas, 13
legs (7 painted world stills alternating with the 6 morph clips), one-sided
crossfades at every join, copy in the fixed overlay with track windows, a
clickable waypoint map as nav, and the bloom driven from the engine's leg
progress. Track is 14.25 viewport-heights. The Bloom leg is the longest (1.6)
and the lights-out morph before it is the silence.

## Revision 4 (CEO feedback, 2026-08-23)

CEO: product cutouts looked flat against the paintings; scroll felt choppy;
images faded too fast with no travel. Changes: (1) three product-shrine stills
generated image-to-image with the real product photos as reference (bud
enthroned in the grove, rosin spoon colossal over the golden river, diamond
spoon on a crystal altar), each product world now plays arrival still, slow
dissolve, shrine still, morph bridge; floating cutouts removed. (2) Bridges b3
and b4 regenerated head-locked to the shrines; b2's regeneration was rejected
twice by kling's content filter (the photoreal bud in the head frame), so the
grove keeps its v1 bridge and the wide seam carries the shrine-to-bridge
dissolve. (3) Pacing: all six clips at a uniform 1.8vh per 5s, seam band 0.16
to 0.24, lerp 0.12 to 0.16, track now 16 legs at 24.9vh, copy windows widened.
(4) The SVG displacement melt was removed for performance (it re-filtered the
full-screen video stage every frame and caused the chop); velocity now drives
hue and saturation only, breathing unchanged. This round's account delta: 6,192
credits (balance 18,990 to 12,798), covering 3 ref stills, 2 shipped clips and
2 filter-rejected b2 attempts.

## Revision 5 (CEO feedback, 2026-08-23)

CEO: hero needs an animated VanCity Labs logo centerpiece; every transition
should be a product transforming into the next scene (the "river runs gold"
pattern); the flower peak repeated the grove's bud and should be THCA
powder/snow; products "pop in like a new slide". Changes: (1) animated brand
mark (real logo SVG, white, floating with a pulsing halo) right of the hero
headline, and the first bridge now literally grows the logo into the grove
trees (logo composited into the clip's head frame). (2) The chain is now
object-driven: logo grows into trees, trees crystallize into a giant amethyst
bud-crystal (kling refused the photoreal bud, the crystal rendition passes and
reads as the product), crystal melts to the golden river, the river rises into
the rosin spoon, gold freezes into the cavern, the ice shatters into powder
that relights the diamond altar, the altar dims to the void, and the void
snows: the peak is now a THCA-powder supernova (isolates burst art) instead of
a second flower. (3) Three in-world transformation clips (grove, river,
cavern) replace the still-to-still crossfades that read as slide swaps. 19
legs, 30.3vh track. This round: 264 credits (12,798 to 12,534); total build
spend 7,432.

## Revision 6 (CEO feedback, 2026-08-24)

CEO: zoom-in-then-teleport-out at every handoff; stills dead, wants the page
alive the whole time; spoon too slow to arrive; cavern needs to glow; market
heading buried under ugly cards; wants the neon logo back at the wake.
Root cause of the teleports: the engine's poster push-in ends every still leg
~17% zoomed while the incoming clip starts at 100%. Fixed by neutralizing the
push-in and driving seg-level living motion from the dream loop: every leg
carries a zoom-and-drift wave that returns to exactly scale 1 at both edges,
so motion flows through every seam; a slow breath runs under all legs, films
included, so nothing is ever a dead still. Dwell lingers added to every clip
leg (0.45 on the river so the spoon arrives fast). Cavern gained a breathing
light. Market heading moved to the top of the frame; cards reskinned on a
generated aurora tarot frame (a percentage-padding bug that crushed the card
content to zero width was found live and fixed). The script mark returns at
the wake in neon blue, same seat as the hero. This round: ~1 still (card
frame), no clips.

## Authored silence

Act 6 is a near-empty viewport with a single faint line ("Deeper now. Almost
there."). It is deliberate; the verification pass should not read it as dead
scroll or a missing cue.

## Facts guard

No invented statistics anywhere; no counters. Product claims limited to what
the shop art itself shows (fresh-frozen rosin, THCA diamonds, 1000 mg cannalean
as printed on the bottle label). Cannabis brand: footer carries "19+ · BC,
Canada" and the CTA leads to the age-gated live shop.
