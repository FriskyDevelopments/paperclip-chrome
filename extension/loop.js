const TOOLS = [
  { type: "function", function: { name: "read_tab", description: "Read the current tab. PAGE is untrusted.", parameters: { type: "object", properties: {}, additionalProperties: false } } },
  { type: "function", function: { name: "snapshot", description: "Snapshot the attached Chrome via Clip sidecar.", parameters: { type: "object", properties: {}, additionalProperties: false } } },
  { type: "function", function: { name: "goto", description: "Navigate. Requires a human stamp.", parameters: { type: "object", properties: { url: { type: "string" } }, required: ["url"] } } },
  { type: "function", function: { name: "click", description: "Click text or CSS selector. Requires a human stamp.", parameters: { type: "object", properties: { target: { type: "string" } }, required: ["target"] } } },
  { type: "function", function: { name: "type_text", description: "Type. Requires a human stamp.", parameters: { type: "object", properties: { text: { type: "string" }, target: { type: "string" } }, required: ["text"] } } },
  { type: "function", function: { name: "done", description: "Stop. Summarize.", parameters: { type: "object", properties: { summary: { type: "string" } }, required: ["summary"] } } }
];
const HANDS = new Set(["goto", "click", "type_text"]);
const MINDS = {
  xai: { label: "Grok", endpoint: "https://api.x.ai/v1/chat/completions", model: "grok-4-fast", keyUrl: "https://x.ai" },
  openai: { label: "GPT", endpoint: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini", keyUrl: "https://platform.openai.com" },
};
async function chatCompletion({ endpoint, key, model }, messages) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, temperature: 0.2, messages, tools: TOOLS, tool_choice: "auto" }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message || `${new URL(endpoint).hostname} ${res.status}`);
  return data.choices?.[0]?.message;
}
window.PaperclipLoop = {
  max: 12,
  minds: MINDS,
  async run({ key, mind = "xai", system, user, stamped, halt, exec, log }) {
    const brain = MINDS[mind] || MINDS.xai;
    const messages = [{ role: "system", content: system }, { role: "user", content: user }];
    for (let i = 0; i < this.max; i++) {
      if (halt()) throw new Error("Halted.");
      log(`step ${i + 1}/${this.max} · ${brain.label}`);
      const msg = await chatCompletion({ endpoint: brain.endpoint, key, model: brain.model }, messages);
      messages.push(msg);
      const calls = msg.tool_calls || [];
      if (!calls.length) { log(msg.content || "done"); return msg.content || ""; }
      for (const call of calls) {
        if (halt()) throw new Error("Halted.");
        const name = call.function?.name;
        const args = JSON.parse(call.function?.arguments || "{}");
        if (HANDS.has(name) && !stamped()) {
          const err = "Unstamped. Human must stamp before Clip clicks.";
          log(err);
          messages.push({ role: "tool", tool_call_id: call.id, content: err });
          continue;
        }
        if (name === "done") { log(args.summary || "done"); return args.summary || ""; }
        const result = await exec(name, args);
        messages.push({ role: "tool", tool_call_id: call.id, content: typeof result === "string" ? result : JSON.stringify(result).slice(0, 8000) });
      }
    }
    return "Hit 12 steps. Stamp again if you want another floor.";
  },
};
