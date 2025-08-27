const fs = require("fs");
const { parse } = require("csv-parse");

fs.readFile("PRTCG - FractalSpectrum.csv", "utf8", (err, data) => {
  if (err) throw err;

  parse(data, { columns: true, skip_empty_lines: true }, (err, records) => {
    if (err) throw err;

    // write JSON version so browser can fetch it
    fs.writeFileSync("allCards.json", JSON.stringify(records, null, 2));
  });
});


/*
const cardsData = [
    {
        title: "Casting Sky",
        description: "Leader of the Castings. When the tide is high, waves will crash down on her adversaries.",
        image: "cardDatabase/CastingSky.png"
    },
    {
        title: "Casting Cirrus",
        description: "A ribbon dancer who helps coordinate the plans of the Castings.",
        image: "cardDatabase/CastingCirrus.png"
    },
    {
        title: "Casting Stratus",
        description: "A trained assassin who lies in wait launch his ambushes.",
        image: "cardDatabase/CastingStratus.png"
    },
    {
        title: "Casting Cumulus",
        description: "If you're looking for someone, Cumulus knows a guy. He's well connected with every exchange on the Coast.",
        image: "cardDatabase/CastingCumulus.png"
    },
    {
        title: "Casting Nimbus",
        description: "A world class agent in infiltration, she's almosts never seen, but always brings company.",
        image: "cardDatabase/CastingNimbus.png"
    },
    {
        title: "Carapace Coconut",
        description: "Some call him a kleptomaniac, he thinks it's just economical.",
        image: "cardDatabase/CarapaceCoconut.png"
    },
    {
        title: "Carapace Horseshoe",
        description: "For being so short, he really knows how to punch up.",
        image: "cardDatabase/CarapaceHorseshoe.png"
    },
    {
        title: "Carapace Arrow",
        description: "She's always talking about piercing through the heavens.",
        image: "cardDatabase/CarapaceArrow.png"
    },
    {
        title: "Casting Hermit",
        description: "Hermit is not very fond of xenos.",
        image: "cardDatabase/CarapaceHermit.png"
    },
    {
        title: "Carapace Spider",
        description: "Like a marionette, you'll always find Spider pulling the strings.",
        image: "cardDatabase/CarapaceSpider.png"
    },
    {
        title: "Floral Torch Ginger",
        description: "Under her guidance, her followers can reach their fullest potential.",
        image: "cardDatabase/FloralTorchGinger.png"
    },
    {
        title: "Floral Plum Blossom",
        description: "She can get just a bit jealous sometimes.",
        image: "cardDatabase/FloralPlumBlossom.png"
    },
    {
        title: "Floral Sundew",
        description: "She might not look it, but she's the most welcoming of the Florals.",
        image: "cardDatabase/FloralSundew.png"
    },
    {
        title: "Floral White Lotus",
        description: "In her introspection she knows that it is our union that makes us stronger.",
        image: "cardDatabase/FloralWhiteLotus.png"
    },
    {
        title: "Floral Rangoon",
        description: "If you're down in your luck, Rangoon is always there to lend a hand.",
        image: "cardDatabase/FloralRangoon.png"
    },
    {
        title: "Floral Hibiscus",
        description: "She may not be easily approachable, but she's definitely not selfish.",
        image: "cardDatabase/FloralHibiscus.png"
    },
    {
        title: "Tianshi Imperial Throne",
        description: "From that Throne, what else could you do, but enjoy the scenery.",
        image: "cardDatabase/TianshiImperialThrone.png"
    },
    {
        title: "Tianshi Solid Dipper",
        description: "Let her cook? Nah, she'd eat.",
        image: "cardDatabase/TianshiSolidDipper.png"
    },
    {
        title: "Tianshi Liquid Dipper",
        description: "Now here is a man that you should let cook.",
        image: "cardDatabase/TianshiLiquidDipper.png"
    },
    {
        title: "Tianshi Butcher Shops",
        description: "He may be brutal, but he's not one to waste food.",
        image: "cardDatabase/TianshiButcherShops.png"
    },
    {
        title: "Tianshi Astrologer",
        description: "Maybe she'll fortell your future as well.",
        image: "cardDatabase/TianshiAstrologer.png"
    },
    {
        title: "Tianshi Woman's Bed",
        description: "She prefers to keep her lovers close.",
        image: "cardDatabase/TianshiWoman'sBed.png"
    },
    {
        title: "Weird Death Ball",
        description: "Overhand or Underhand? Crash.",
        image: "cardDatabase/WeirdDeathBall.png"
    },
    {
        title: "Igniting Resonance",
        description: "I can already feel the blood pumping.",
        image: "cardDatabase/IgnitingResonance.png"
    },
    {
        title: "Quaking Stun",
        description: "Time it right and the opponent is hit with the nastiest paralysis.",
        image: "cardDatabase/QuakingStun.png"
    },
    {
        title: "Lethal Overcharge",
        description: "HOLD ON JUST A LITTLE LONGER!",
        image: "cardDatabase/LethalOvercharge.png"
    },
    {
        title: "Dividing Pike",
        description: "They never see the Pike Augment coming.",
        image: "cardDatabase/DividingPike.png"
    },
    {
        title: "Xeric Steppes",
        description: "Sometimes we just need slow down and relax.",
        image: "cardDatabase/XericSteppes.png"
    },
    {
        title: "Jade Orphans",
        description: "Don't underestimate her lonesome. When it all comes together, you better watch your back.",
        image: "cardDatabase/JadeOrphans.png"
    },
    {
        title: "Jade Kong",
        description: "4 of a Kind!",
        image: "cardDatabase/JadeKong.png"
    },
    {
        title: "Jade Pung",
        description: "Triple Threat? How about Triple Teamed.",
        image: "cardDatabase/JadePung.png"
    },
    {
        title: "Jade Chow",
        description: "Just reaping the rewards of the sequence.",
        image: "cardDatabase/JadeChow.png"
    },
    {
        title: "Jade Eyes",
        description: "We're halfway there now!",
        image: "cardDatabase/JadeEyes.png"
    },
    {
        title: "Hidden Jade",
        description: "They never see it coming and they won't have time to react.",
        image: "cardDatabase/HiddenJade.png"
    },
    {
        title: "Checkered King",
        description: "Pesticides won't be enough to stop this swarm.",
        image: "cardDatabase/CheckeredKing.png"
    },
    {
        title: "Checkered Queen",
        description: "And when the world needed her least, she appeared.",
        image: "cardDatabase/CheckeredQueen.png"
    },
    {
        title: "Checkered Wazir",
        description: "Wazir practices death by 1000 jabs.",
        image: "cardDatabase/CheckeredWazir.png"
    },
    {
        title: "Checkered Knight",
        description: "He can come at you from any angle.",
        image: "cardDatabase/CheckeredKnight.png"
    },
    {
        title: "Checkered Ferz",
        description: "She can Drive right past you and you wouldn't notice.",
        image: "cardDatabase/CheckeredFerz.png"
    },
    {
        title: "Checkered Pawn",
        description: "One promotion away from world domination.",
        image: "cardDatabase/CheckeredPawn.png"
    },
    {
        title: "Flame Spawn",
        description: "Looks like a banana, tastes burnt.",
        image: "cardDatabase/FlameSpawn.png"
    },
    {
        title: "Desert Thorns",
        description: "It's a bit hard making friends when you can only give them thorns.",
        image: "cardDatabase/DesertThorns.png"
    },
    {
        title: "Terra Worm",
        description: "The earth giveth and it takes.",
        image: "cardDatabase/TerraWorm.png"
    },
    {
        title: "Grassy Capy",
        description: "He's chill and touches grass too. Talk about a win win.",
        image: "cardDatabase/GrassyCapy.png"
    },
    {
        title: "Vaulting Gull",
        description: "Freedom.",
        image: "cardDatabase/VaultingGull.png"
    },
    {
        title: "Ocean Carp",
        description: "Glub glub glub.",
        image: "cardDatabase/OceanCarp.png"
    },
    {
        title: "Fulgural Spark",
        description: "He'll be there in a jiffy.",
        image: "cardDatabase/FulguralSpark.png"
    },
    {
        title: "Spectral Ghost",
        description: "She's moving through walls? What walls?",
        image: "cardDatabase/SpectralGhost.png"
    },
    {
        title: "Shimmering Petal",
        description: "This petal is a bit too self-sacrificing.",
        image: "cardDatabase/ShimmeringPetal.png"
    },
    {
        title: "Second Chance",
        description: "Adaptation is the mark of a monster.",
        image: "cardDatabase/SecondChance.png"
    },
    {
        title: "Hidden Inventory",
        description: "Long time no see.",
        image: "cardDatabase/HiddenInventory.png"
    },
    {
        title: "Cut-In Seasons",
        description: "A cut through the strongest.",
        image: "cardDatabase/Cut-InSeasons.png"
    },
    {
        title: "Unbreakable Hand",
        description: "Imagine the potential of this in the hands of someone smarter.",
        image: "cardDatabase/UnbreakableHand.png"
    },
    {
        title: "Consuming Cell",
        description: "It's not about singularity, it's about the hunger.",
        image: "cardDatabase/ConsumingCell.png"
    },
    {
        title: "Running Double",
        description: "I think I've finally caught up to y'all.",
        image: "cardDatabase/RunningDouble.png"
    },
    {
        title: "New Fortune",
        description: "This is only brunch.",
        image: "cardDatabase/NewFortune.png"
    },
    {
        title: "Aoshi",
        description: "So that's what killed all the dinosaurs.",
        image: "cardDatabase/Aoshi.png"
    },
    {
        title: "Trascending Flight",
        description: "Her presence is as fleeting as ghost, her beauty unmatched.",
        image: "cardDatabase/TrascendingFlight.png"
    },
    {
        title: "Rescue Officer Third Art",
        description: "She has handled much scarier monsters.",
        image: "cardDatabase/RescueOfficerThirdArt.png"
    },
    {
        title: "Fort Sand",
        description: "Will this fort stand the test of time?",
        image: "cardDatabase/FortSand.png"
    },
    {
        title: "Pele The Barren",
        description: "He's not strong, but he's very persistent.",
        image: "cardDatabase/PeleTheBarren.png"
    },
    {
        title: "Descending Lava",
        description: "It just keeps on coming.",
        image: "cardDatabase/DescendingLava.png"
    },
    {
        title: "From Beyond The Fog",
        description: "His presence, his aura, it's too much",
        image: "cardDatabase/FromBeyondTheFog.png"
    },
    {
        title: "War Warped Corn",
        description: "This war shall be neverending.",
        image: "cardDatabase/WarWarpedCorn.png"
    },
    {
        title: "Eyes of the Overseer",
        description: "They say that he can literally do it all.",
        image: "cardDatabase/EyesOfTheOverseer.png"
    },
    {
        title: "Boxout Kangaroo",
        description: "He may be a boxer, but don't even get me started on his MMA.",
        image: "cardDatabase/BoxoutKangaroo.png"
    },
    {
        title: "Astral Molten Shell",
        description: "No matter what you do, it's damage all for you.",
        image: "cardDatabase/AstralMoltenShell.png"
    },
    {
        title: "Barrage Rush",
        description: "Your struggle is useless.",
        image: "cardDatabase/BarrageRush.png"
    },
    {
        title: "Sacred Summoning",
        description: "Soul for a soul.",
        image: "cardDatabase/SacredSummoning.png"
    },
    {
        title: "Bullet Weaving",
        description: "Weaving bullets like a spider weaving webs.",
        image: "cardDatabase/BulletWeaving.png"
    },
    {
        title: "Fusion Cynoros",
        description: "Everyone is coming down with me.",
        image: "cardDatabase/FusionCynoros.png"
    },
    {
        title: "Borrowed Time",
        description: "I was going save that for later.",
        image: "cardDatabase/BorrowedTime.png"
    },
    {
        title: "Inferno Fist",
        description: "This flame will never cease.",
        image: "cardDatabase/InfernoFist.png"
    },
    {
        title: "Buzzing Flyral",
        description: "THEY\"RE EVERYWHERE!.",
        image: "cardDatabase/BuzzingFlyral.png"
    },
    {
        title: "Lion Toothed Shrapnel",
        description: "You dare to approach the king?",
        image: "cardDatabase/LionToothedShrapnel.png"
    },
    {
        title: "Sentinel Sniper",
        description: "The sentinel can't stand your hubris.",
        image: "cardDatabase/SentinelSniper.png"
    },
    {
        title: "Pocket Anurai",
        description: "From the shadows he waits for the opportune moment to strike.",
        image: "cardDatabase/PocketAnurai.png"
    },
    {
        title: "Festering Algae Bloom",
        description: "Green water is so aesthetic.",
        image: "cardDatabase/FesteringAlgaeBloom.png"
    },
    {
        title: "9Juhs",
        description: "9 what.",
        image: "cardDatabase/9Juhs.png"
    },
    {
        title: "Inugami Seasons",
        description: "If the seasons never changed then we'd never appreciate them.",
        image: "cardDatabase/InugamiSeasons.png"
    },
    {
        title: "Rummaging Loot",
        description: "Have we checked this one yet?",
        image: "cardDatabase/RummagingLoot.png"
    },
    {
        title: "Lovesick Loop",
        description: "You keep me trapped in this Lovesick Loop.",
        image: "cardDatabase/LovesickLoop.png"
    },
    {
        title: "Brick Storm",
        description: "You could've used a door you know.",
        image: "cardDatabase/BrickStorm.png"
    },
    {
        title: "Heavy Reroll",
        description: "You see me rolling.",
        image: "cardDatabase/HeavyReroll.png"
    },
    {
        title: "Foundation's Indestructible Scales",
        description: "People say it gets stronger everytime it nears death.",
        image: "cardDatabase/Foundation'sIndestructibleScales.png"
    },
    {
        title: "Dragon of the Sunken World",
        description: "It emerges from its lake every 1000 years. In between, it's known to possess unsuspecting passersby.",
        image: "cardDatabase/DragonOfTheSunkenWorld.png"
    },
    {
        title: "Divine Insight",
        description: "All things in this world have their laws.",
        image: "cardDatabase/DivineInsight.png"
    },
    {
        title: "Shield of the Ogrex",
        description: "Grappling with a shield is just too even the playing field.",
        image: "cardDatabase/ShieldOfTheOgrex.png"
    },
    {
        title: "Veering Lightning",
        description: "One must understand the flow of water to redirect lightning.",
        image: "cardDatabase/VeeringLightning.png"
    },
    {
        title: "Iron Spire",
        description: "He always believed the best offense is a good defense.",
        image: "cardDatabase/IronSpire.png"
    },





];
*/
