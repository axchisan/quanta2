import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { Room } from 'colyseus';
import type { Client } from 'colyseus';
import { parseTriviaQuestion } from '@quanta/ai-gateway';
import type { TriviaQuestion } from '@quanta/ai-gateway';
import { getAIGateway } from '../ai/gateway.js';

const QUESTION_MS = 20_000;
const REVEAL_MS = 4_500;
const BASE_POINTS = 100;

export class PlayerState extends Schema {
  @type('string') nickname = '';
  @type('number') score = 0;
  @type('boolean') answered = false;
  @type('number') lastGain = 0;
  @type('boolean') connected = true;
}

export class KahootState extends Schema {
  /** 'lobby' | 'question' | 'reveal' | 'finished' */
  @type('string') phase = 'lobby';
  /** false hasta que terminó de generar las preguntas con IA. */
  @type('boolean') ready = false;
  @type('string') topic = '';
  @type('number') questionIndex = -1;
  @type('number') totalQuestions = 0;
  @type('string') question = '';
  @type(['string']) options = new ArraySchema<string>();
  /** -1 salvo en 'reveal'/'finished' (anti-cheat: no se revela durante 'question'). */
  @type('number') correctIndex = -1;
  @type('number') deadline = 0;
  @type('string') hostId = '';
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}

interface KahootCreateOptions {
  nickname?: string;
  topic?: string;
  difficulty?: string;
  count?: number;
}

/** Sala Kahoot authoritative: el server tiene las respuestas, valida y puntúa. */
export class KahootRoom extends Room<KahootState> {
  override maxClients = 40;

  private questions: TriviaQuestion[] = [];
  private questionStartedAt = 0;

  override onCreate(options: KahootCreateOptions): void {
    const state = new KahootState();
    state.topic = (options.topic ?? 'Cinemática').slice(0, 48);
    this.setState(state);

    this.onMessage('start', (client) => this.handleStart(client));
    this.onMessage('answer', (client, message: { index?: number }) =>
      this.handleAnswer(client, message),
    );

    const difficulty = options.difficulty ?? 'easy';
    const count = Math.min(Math.max(options.count ?? 5, 1), 10);
    // En background: generar bloquearía la respuesta de matchmaking (timeout).
    void this.generateQuestions(state.topic, difficulty, count);
  }

  private async generateQuestions(topic: string, difficulty: string, count: number): Promise<void> {
    try {
      const gateway = getAIGateway();
      for (let i = 0; i < count; i++) {
        const res = await gateway.generateTrivia({ topic, difficulty });
        this.questions.push(parseTriviaQuestion(res.data));
        this.state.totalQuestions = this.questions.length;
      }
    } catch (error) {
      console.error('[kahoot] no se pudieron generar preguntas', error);
    } finally {
      this.state.ready = true;
    }
  }

  override onJoin(client: Client, options: KahootCreateOptions): void {
    const player = new PlayerState();
    player.nickname = (options.nickname ?? 'Jugador').slice(0, 20) || 'Jugador';
    this.state.players.set(client.sessionId, player);
    if (!this.state.hostId) this.state.hostId = client.sessionId;
  }

  override async onLeave(client: Client, consented: boolean): Promise<void> {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;
    player.connected = false;

    if (consented) {
      this.removePlayer(client.sessionId);
      return;
    }
    try {
      // Reconexión: el cliente tiene 30s para volver con el mismo sessionId.
      await this.allowReconnection(client, 30);
      const back = this.state.players.get(client.sessionId);
      if (back) back.connected = true;
    } catch {
      this.removePlayer(client.sessionId);
    }
  }

  private removePlayer(sessionId: string): void {
    this.state.players.delete(sessionId);
    if (sessionId === this.state.hostId) this.migrateHost();
    this.maybeAdvanceAfterLeave();
  }

  /** Si el anfitrión se va, pasa el rol al primer jugador conectado. */
  private migrateHost(): void {
    let newHost = '';
    this.state.players.forEach((p, id) => {
      if (!newHost && p.connected) newHost = id;
    });
    this.state.hostId = newHost;
  }

  /** Si en 'question' ya respondieron todos los que quedan, avanzar. */
  private maybeAdvanceAfterLeave(): void {
    if (this.state.phase !== 'question') return;
    let pending = false;
    this.state.players.forEach((p) => {
      if (p.connected && !p.answered) pending = true;
    });
    if (!pending && this.state.players.size > 0) {
      this.clock.clear();
      this.endQuestion();
    }
  }

  private handleStart(client: Client): void {
    if (client.sessionId !== this.state.hostId) return;
    if (this.state.phase !== 'lobby') return;
    if (!this.state.ready || this.questions.length === 0) return;
    this.startQuestion(0);
  }

  private startQuestion(index: number): void {
    const q = this.questions[index];
    if (!q) {
      this.finish();
      return;
    }
    this.state.questionIndex = index;
    this.state.question = q.question;
    this.state.options = new ArraySchema<string>(...q.options);
    this.state.correctIndex = -1;
    this.state.phase = 'question';
    this.questionStartedAt = Date.now();
    this.state.deadline = this.questionStartedAt + QUESTION_MS;
    this.state.players.forEach((p) => {
      p.answered = false;
      p.lastGain = 0;
    });
    this.clock.clear();
    this.clock.setTimeout(() => this.endQuestion(), QUESTION_MS);
  }

  private handleAnswer(client: Client, message: { index?: number }): void {
    if (this.state.phase !== 'question') return;
    const player = this.state.players.get(client.sessionId);
    if (!player || player.answered) return;
    const q = this.questions[this.state.questionIndex];
    if (!q) return;

    player.answered = true;
    if (message.index === q.correctIndex) {
      const elapsed = Date.now() - this.questionStartedAt;
      const timeBonus = Math.max(0, Math.round(BASE_POINTS * (1 - elapsed / QUESTION_MS)));
      const gain = BASE_POINTS + timeBonus;
      player.score += gain;
      player.lastGain = gain;
    }

    let pending = false;
    this.state.players.forEach((p) => {
      if (p.connected && !p.answered) pending = true;
    });
    if (!pending) {
      this.clock.clear();
      this.endQuestion();
    }
  }

  private endQuestion(): void {
    const q = this.questions[this.state.questionIndex];
    this.state.correctIndex = q ? q.correctIndex : -1;
    this.state.phase = 'reveal';
    this.clock.clear();
    this.clock.setTimeout(() => {
      const next = this.state.questionIndex + 1;
      if (next >= this.questions.length) this.finish();
      else this.startQuestion(next);
    }, REVEAL_MS);
  }

  private finish(): void {
    this.state.phase = 'finished';
    this.clock.clear();
  }
}
