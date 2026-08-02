/**
 * LLMClient.js — Unified LLM abstraction layer
 *
 * Priority resolution:
 *   1. Lyzr AI (LYZR_API_KEY) — uses Lyzr's OpenAI-compatible chat endpoint
 *   2. OpenAI (OPENAI_API_KEY)
 *   3. Pattern-match fallback engine (no key required)
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Adjust if needed, or just dotenv.config() is fine if running from server root
dotenv.config(); // Standard fallback

const LYZR_BASE = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';
const OPENAI_BASE = 'https://api.openai.com/v1/chat/completions';

export class LLMClient {
  constructor() {
    this.lyzrKey = process.env.LYZR_API_KEY;
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.LLM_MODEL || 'gpt-4o-mini';
    this.lyzrAgentId = process.env.LYZR_AGENT_ID || null;

    const isDummyLyzr = !this.lyzrKey || this.lyzrKey === 'mock_lyzr_key' || this.lyzrKey === 'your_lyzr_api_key_here' || this.lyzrKey.trim() === '';
    const isDummyOpenAI = !this.openaiKey || this.openaiKey === 'mock_openai_key' || this.openaiKey === 'your_openai_api_key_here' || this.openaiKey.trim() === '';

    if (!isDummyLyzr) {
      this.provider = 'lyzr';
      console.log(`🤖 LLM Provider: Lyzr AI (Agent ID: ${this.lyzrAgentId || 'default'})`);
    } else if (!isDummyOpenAI) {
      this.provider = 'openai';
      console.log(`🤖 LLM Provider: OpenAI (${this.model})`);
    } else {
      this.provider = 'pattern';
      console.log('🤖 LLM Provider: Pattern-Match Engine (no live API key configured — Demo Mode)');
    }
  }

  getProviderInfo() {
    return {
      provider: this.provider,
      isRealLLM: this.isRealLLM(),
      model: this.model,
      hasLyzrKey: this.provider === 'lyzr',
      hasOpenAIKey: this.provider === 'openai',
      lyzrAgentId: this.lyzrAgentId || 'default'
    };
  }

  /**
   * Send a chat completion request with a system prompt and user message.
   * Returns the assistant's text reply.
   */
  async complete(systemPrompt, userMessage, opts = {}) {
    if (this.provider === 'lyzr') {
      return this._callLyzr(systemPrompt, userMessage, opts);
    } else if (this.provider === 'openai') {
      return this._callOpenAI(systemPrompt, userMessage, opts);
    } else {
      return null; // signal to caller: use pattern fallback
    }
  }

  async _callOpenAI(systemPrompt, userMessage, opts) {
    const resp = await axios.post(
      OPENAI_BASE,
      {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: opts.temperature ?? 0.1,
        max_tokens: opts.maxTokens ?? 2048,
        response_format: opts.jsonMode ? { type: 'json_object' } : undefined
      },
      {
        headers: {
          Authorization: `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    return resp.data.choices[0].message.content;
  }

  async _callLyzr(systemPrompt, userMessage, opts) {
    // Lyzr AI uses its own inference endpoint with agent_id
    // If agent_id is not set, use Lyzr's OpenAI-compatible passthrough
    const payload = {
      user_id: 'compliancegraph_system',
      agent_id: this.lyzrAgentId || 'default',
      message: `${systemPrompt}\n\n${userMessage}`,
      session_id: `session_${Date.now()}`
    };

    try {
      const resp = await axios.post(LYZR_BASE, payload, {
        headers: {
          'x-api-key': this.lyzrKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      const raw = resp.data?.response ?? resp.data?.message ?? resp.data?.output ?? resp.data;
      if (typeof raw === 'object') {
        return JSON.stringify(raw);
      }
      return raw || null;
    } catch (err) {
      console.warn('[LyzrClient] API error, falling back to OpenAI if available:', err.message);
      if (this.openaiKey && this.openaiKey !== 'mock_openai_key') {
        return this._callOpenAI(systemPrompt, userMessage, opts);
      }
      return null;
    }
  }

  isRealLLM() {
    return this.provider !== 'pattern';
  }
}

// Singleton instance shared across all agents
export const llm = new LLMClient();
