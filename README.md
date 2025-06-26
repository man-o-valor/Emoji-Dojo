# 😀 Emoji Dojo 🎋
Welcome to Emoji Dojo, a Discord Bot game that I've been working on and off on for about a year! It's not currently available to invite or play yet, but you can follow this repository if you want me to keep you posted :)

In Emoji Dojo, you build and arrange **Squads** by collecting **Emojis**. Your Squad is used to battle directly against other users' Squads in **Battles**. If you win Battles, you earn **Coins**. Then, you can spend your Coins at the **Shop** to get new Emojis and complete your **Dojo**.

## Table of contents
1. Emojis 😀
1. Squads 👥
1. Battling 🤜
1. The Shop 💁
1. Devoting your Emojis 🛐
1. List of Commands 💬

## Emojis 😀  
**Emojis** are what you collect in your Emoji Dojo. Each one has a **Health Value**, **Attack Power Value**, **Rarity**, **Class** and **Ability**. Understanding each of these is the key to building the best strategies for Battling. When you view the stats of an Emoji, you'll see a menu like this:

---

### 👏 Clap
❤️ Health: **4**  
⚔️ Attack Power: **0**  
*️⃣ Rarity: **Common**  
🟣 Class: **Damaging**  
Ability:  
Deals 1 more damage for each other undefeated friendly 👏  
You have 1

---

Your **Dojo** is the complete list of every Emoji you own, even ones that you aren't currently using. They're organized by rarity.
  
| You can view stats of Emojis you have with the `/dojo [emoji name]` command, or a list of all of your Emojis with the `/dojo` command. |  
| :--- |

## Squads 👥
Your **Squad** is like your toolbar of Emojis, the ones you're "using" right now. Only 8 Emojis can fit in your Squad at a time, so pick your favorites wisely! Squads always go into battle from *front to back*, or *index 1 through index 8*, so organizing the order of them matters. Some Emojis' abilities will make use of positions of the Emoji in the Squad, so thought should be put into the order of the Emojis as well as which ones you pick. In Battles, the only the frontmost emoji will attack until it is defeated, and then the rest of the Squad moves forward and then new frontmost starts attacking.
  
| You can view your Squad with the `/squad` command, and switch out Emojis in it with the `/dojo [emoji name]` command. |
| :--- |

## Battling 🤜
**Battling** is the real action that happens in Emoji Dojo. When you Battle, you put your Sqaud up against your opponent's Squad and watch them fight until one Squad is completely defeated. You can battle against a fellow user, or if you're short on Coins (or friends), DojoBot. Additonally, Battles happen completely autonomously with no interaction from either player. Battles look like this:

❤️❤️❤️❤️❤️❤️❤️❤️ | ❤️❤️❤️❤️❤️❤️❤️❤️  
⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️ | ⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️  
🟢🟢🟢🟢🟢🟢🟢🟩 | 🟥🔴🔴🔴🔴🔴🔴🔴  

🟢 = Your Squad ("friendly" Emojis)  
🔴 = Opponent Squad ("enemy" Emojis)  
⬜ = "frontmost" Emojis  

The "frontmost" Emojis of each Squad deal damage to each other in turns until one of them is defeated. When an emoji is defeated, it is removed from the game and the rest of the Squad moves up, making the Emoji directly behind the old frontmost emoji the new frontmost emoji.  

Each Emoji has its own health and attack power displayed above them, which start at their base health and attack power values. During the Battle, they will be altered by attacks and abilities, but those changes are only reflected during that Battle. New Emojis can be brought into the Battle by abilities as well, and it is possible to have any number of Emojis in your Squad during a Battle.

At the beginning of the Battle, a random Sqaud attacks first, affecting the frontmost enemy Emoji's health value and resolving any effects. When an Emoji is reduced to 0 or lower health, it is defeated.

At the end of each Battle, the winner will recieve Coins based on how many of their Emojis are undefeated. The loser will lose coins based on how many of the winner's Emojis are undefeated, but the loser loses less coins than the winner gains. Battles can result in a draw if they take too many turns to finish or if they are trapped in an infinite loop.

| You can Battle a fellow user with the `/battleuser` command, or Battle DojoBot with the `/battlebot` command. |
| :--- |

## The Shop 💁
**The Shop** is your main source of getting new Emojis and also, coincidentally, the only way to spend your Coins. The Shop each day is run by Tipping Hand, an NPC who's in charge of wrangling Emojis to sell and trade. You can buy random emojis or random emoji packs if you don't really mind what you get, or if you're looking out for a specific Emoji, you can try to grab it if it's being specially offered. The special offer Emojis refresh every 24 hours. Please note, the random Emoji Packs are not gambling boxes, because the value of the contents of each one is always the same :)

| You can visit the Shop with the `/shop` command, who would've guessed? |
| :--- |

## Devoting your Emojis 🛐
If you ever have any Emojis in your Dojo that you'll never need, you can get rid of them by ~~sacrificing~~ **Devoting** them! You can Devote Emojis from their stat pages, and each Devotion you make will bring you closer to attracting a Master Emoji. There is one Master Emoji for each Emoji class, and when you Devote an Emoji, it will make progress towards obtaining the Master of the class the Devoted Emoji belongs to. Master Emojis are incredibly powerful, and they can synergize with other emojis of their class to make your Squad extremely powerful!

| You can see your Devoting progress with the `/devotions` command, or Devote your emojis with the `/dojo [emoji name]` command. |
| :--- |

## List of Commands 💬
`/battlebot` *(battle Dojobot)*  
`/battleuser` *(battle another user)*  
`/coins` *(view your Coins and Coin Doublers)*  
`/daily` *(collect your Daily Reward)*  
`/devotions` *(view your Devoting progress)*  
`/dojo` *(see the Emojis you currently own or details about one)*  
`/friendlybattle` *(battle another user with no coins involved)*  
`/shop` *(visit the Shop)*  
`/squad` *(view your Squad)*  

## Technical Shenanigans 📟
If you want to clone or fork Emoji Dojo:  
- Create a `config.json` file containing something like this:  
    ```{"token":"when you clone this replace this with your Discord bot's token from the developer portal"}```  
- Create a database at `databases/database.sqlite`.  
- Create an empty `logs.json` file.  
- Finally, install the node packages you need with `npm i` in your terminal.  
Your version of Emoji Dojo is ready to run with `node dc.js` and `node .` :)  
  
---

> psst! this was last updated on june 25, 2025