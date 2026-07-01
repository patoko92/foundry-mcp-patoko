const WebSocket = (await import('ws')).WebSocket;

const PLAYER = "rDRHnaM0tEolXMQ0";
const MONSTER = "22kdzAX7IgVs8BhO";

const moves = [
  ["NEE8ePePp17TsW7r", PLAYER],
  ["SeMXkiIdtjmElJSj", MONSTER], ["z0WMqvd1D55Hn6RW", MONSTER], ["lK6XCeP8kyvf6TRk", MONSTER],
  ["xcIisg78wdvzT29g", MONSTER], ["XzkMe7CKp9WzInIz", MONSTER], ["Y8PERM1SOHooYbyi", MONSTER],
  ["sYbBhNKuiu5TaO0E", MONSTER], ["rp1WFwRizPuFhCAM", MONSTER], ["AbMGMGpJirRVcLS5", MONSTER],
  ["WJ1A7HVW9yIvbrhY", MONSTER], ["NYQjmkQQoS4W1Ogl", MONSTER], ["j8jIg97Cw9gAGY36", MONSTER],
  ["wohU8w5gzr4nF0d4", MONSTER], ["IYQ1eladuIm3V4Yo", MONSTER], ["0ktBgSLxeMkWX7fi", MONSTER],
  ["hdXa67mNQ58WuXpe", MONSTER], ["a7stmRk6Haf3x3OP", MONSTER], ["RJE5g6b4n7WvaQQ2", MONSTER],
  ["6PBTZEzJ3T9g2htw", MONSTER], ["5HEWYZBfVjs7UaxO", MONSTER], ["jFxJdK6GojSJVyQi", MONSTER],
  ["PgELxbGAP3sjFWKC", MONSTER], ["7wwuyLuFWOOjgXZf", MONSTER], ["6bQoO0TOpgLDXMj2", MONSTER],
  ["nzkiwVemidy1BACL", MONSTER], ["fe2xFSxwaspeDhmw", MONSTER], ["Yfh2W2M14lpY56rK", MONSTER],
  ["JIgIiucEUEJBivXk", MONSTER], ["LObpjPwYk8eLDMux", MONSTER], ["B6V5fzLTg9Nheehj", MONSTER],
  ["BrV4UDh90buyMCd3", MONSTER], ["HypEn7qc91bRIi5h", MONSTER], ["PVJicRrEtwG8iWvU", MONSTER],
  ["gLsFr5GAy9BBtuiQ", MONSTER], ["KldZwl8UIHgR7Oco", MONSTER], ["M5fcepfxmRurOFR1", MONSTER],
  ["wJWesRqwreVEkqCk", MONSTER], ["KOV9mqBrls3tMadU", MONSTER], ["Cznpp8MBCceF34Pu", MONSTER],
  ["cWnsi8KAo5j0sfFH", MONSTER], ["K2QfoQ67N6zRBi1Y", MONSTER], ["g3gG9gF6MQPE3UJ8", MONSTER],
  ["Qe283k1eeZ5C5p3r", MONSTER], ["7JbEUQjRPSOFBhr6", MONSTER], ["yB3APdesJviu0YBP", MONSTER],
  ["th4sM983ONqaiqXI", MONSTER], ["CXrCstFLLg7uZSeV", MONSTER], ["SC3mHHP42Gm4q0JR", MONSTER],
  ["sT5chC5ft4foPih1", MONSTER], ["CmiAWidKDxNH5ymQ", MONSTER], ["3XFkdF6GAHE3ie6m", MONSTER],
  ["KSxJntGJKjXmAr9c", MONSTER], ["Q54H0Qabq0gBfWV4", MONSTER], ["qTxNP36VhvJYoXol", MONSTER],
  ["DVPuZXSQxI6RY3pJ", MONSTER], ["B1DurGCZzLdGLqay", MONSTER], ["MSyId9ZnfFLNG1D1", MONSTER],
  ["6ohRWzUTmxRowKfB", MONSTER],
];

const N = {"NEE8ePePp17TsW7r":"HUBSI","SeMXkiIdtjmElJSj":"Ape","z0WMqvd1D55Hn6RW":"Baba Lysaga","lK6XCeP8kyvf6TRk":"Badger","xcIisg78wdvzT29g":"Bat","XzkMe7CKp9WzInIz":"Black Bear","Y8PERM1SOHooYbyi":"Boar","sYbBhNKuiu5TaO0E":"Brown Bear","rp1WFwRizPuFhCAM":"Camel","AbMGMGpJirRVcLS5":"Cat","WJ1A7HVW9yIvbrhY":"Constrictor Snake","NYQjmkQQoS4W1Ogl":"Crab","j8jIg97Cw9gAGY36":"Crocodile","wohU8w5gzr4nF0d4":"Dire Wolf","IYQ1eladuIm3V4Yo":"Draft Horse","0ktBgSLxeMkWX7fi":"Elephant","hdXa67mNQ58WuXpe":"Elk","a7stmRk6Haf3x3OP":"Ezmerelda","RJE5g6b4n7WvaQQ2":"Frog","6PBTZEzJ3T9g2htw":"Giant Badger","5HEWYZBfVjs7UaxO":"Giant Crab","jFxJdK6GojSJVyQi":"Giant Goat","PgELxbGAP3sjFWKC":"Giant Seahorse","7wwuyLuFWOOjgXZf":"Giant Spider","6bQoO0TOpgLDXMj2":"Giant Weasel","nzkiwVemidy1BACL":"Goat","fe2xFSxwaspeDhmw":"Hawk","Yfh2W2M14lpY56rK":"Imp","JIgIiucEUEJBivXk":"Ireena","LObpjPwYk8eLDMux":"Lion","B6V5fzLTg9Nheehj":"Lizard","BrV4UDh90buyMCd3":"Madam Eva","HypEn7qc91bRIi5h":"Mastiff","PVJicRrEtwG8iWvU":"Mule","gLsFr5GAy9BBtuiQ":"Octopus","KldZwl8UIHgR7Oco":"Owl","M5fcepfxmRurOFR1":"Panther","wJWesRqwreVEkqCk":"Pony","KOV9mqBrls3tMadU":"Pseudodragon","Cznpp8MBCceF34Pu":"Quasit","cWnsi8KAo5j0sfFH":"Rat","K2QfoQ67N6zRBi1Y":"Raven","g3gG9gF6MQPE3UJ8":"Reef Shark","Qe283k1eeZ5C5p3r":"Rictavio","7JbEUQjRPSOFBhr6":"Riding Horse","yB3APdesJviu0YBP":"Scorpion","th4sM983ONqaiqXI":"Skeleton","CXrCstFLLg7uZSeV":"Slaad Tadpole","SC3mHHP42Gm4q0JR":"Sphinx of Wonder","sT5chC5ft4foPih1":"Spider","CmiAWidKDxNH5ymQ":"Sprite","3XFkdF6GAHE3ie6m":"Strahd","KSxJntGJKjXmAr9c":"Tiger","Q54H0Qabq0gBfWV4":"Venomous Snake","qTxNP36VhvJYoXol":"Vladimir Horngaard","DVPuZXSQxI6RY3pJ":"Warhorse","B1DurGCZzLdGLqay":"Weasel","MSyId9ZnfFLNG1D1":"Wolf","6ohRWzUTmxRowKfB":"Zombie"};

const url = "ws://127.0.0.1:31415/foundry-mcp";
let msgId = 1;
const pending = new Map();
let ok = 0, bad = 0;

function send(name, args) {
  return new Promise((res, rej) => {
    const id = msgId++;
    const t = setTimeout(() => { pending.delete(id); rej(new Error("timeout")); }, 5000);
    pending.set(id, { res, rej, t });
    ws.send(JSON.stringify({jsonrpc:"2.0",id,method:"tools/call",params:{name,arguments:args}}));
  });
}

const ws = new WebSocket(url);
ws.on("open", async () => {
  ws.send(JSON.stringify({type:"register",clientType:"mcp"}));
  await new Promise(r => setTimeout(r, 500));
  for (const [aid, folder] of moves) {
    try {
      const r = await send("update-actor", {id:aid, data:{folder}});
      if (!r?.result?.isError) { ok++; process.stdout.write(`✓ ${N[aid]||aid}\n`); }
      else { bad++; process.stdout.write(`✗ ${N[aid]||aid}\n`); }
    } catch(e) { bad++; process.stdout.write(`✗ ${N[aid]||aid}: ${e.message}\n`); }
  }
  process.stdout.write(`\nFertig: ${ok} verschoben, ${bad} fehlgeschlagen\n`);
  ws.close(); process.exit(0);
});
ws.on("message", d => { try { const m = JSON.parse(d.toString()); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); clearTimeout(p.t); pending.delete(m.id); p.res(m); } } catch {} });
ws.on("error", e => { console.error("WS:", e.message); process.exit(1); });
