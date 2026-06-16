import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { matchMaker, Room } from 'colyseus';
import type { Client } from 'colyseus';
import { parseTriviaQuestion } from '@quanta/ai-gateway';
import type { TriviaAudience, TriviaQuestion } from '@quanta/ai-gateway';
import { getAIGateway } from '../ai/gateway.js';

// Código de sala corto estilo Kahoot: 6 chars sin caracteres ambiguos (0/O/1/I/L).
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

/** Genera un código de 6 chars único (verifica contra el matchmaker). */
async function generateRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    const existing = await matchMaker.query({ roomId: code });
    if (existing.length === 0) return code;
  }
  return ''; // improbable: dejamos el id por defecto de Colyseus
}

const AUDIENCES: readonly TriviaAudience[] = ['ninos', 'secundaria', 'universidad'];
function normalizeAudience(value: string | undefined): TriviaAudience {
  return AUDIENCES.includes(value as TriviaAudience) ? (value as TriviaAudience) : 'secundaria';
}
import { persistGameResults, verifyAccessToken, type GameResultRow } from '../db/supabase.js';

const QUESTION_MS = 20_000;
const REVEAL_MS = 4_500;
const BASE_POINTS = 100;
const MODE = 'kahoot';

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
  /** true si terminó de generar pero no se obtuvo ninguna pregunta (todos los proveedores fallaron). */
  @type('boolean') genFailed = false;
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
  audience?: string;
  count?: number;
  /** JWT de Supabase del jugador logueado (opcional: invitados no lo envían). */
  accessToken?: string;
}

/** Sala Kahoot authoritative: el server tiene las respuestas, valida y puntúa. */
export class KahootRoom extends Room<KahootState> {
  override maxClients = 40;

  private questions: TriviaQuestion[] = [];
  private questionStartedAt = 0;
  private difficulty = 'easy';
  private audience: TriviaAudience = 'secundaria';
  private count = 5;
  /** sessionId → user id de Supabase (solo jugadores logueados). Privado: no se sincroniza. */
  private readonly userIds = new Map<string, string>();
  /** sessionId → cantidad de respuestas correctas en la partida. */
  private readonly correctCounts = new Map<string, number>();
  private persisted = false;

  override async onCreate(options: KahootCreateOptions): Promise<void> {
    // Código corto estilo Kahoot. Colyseus permite reemplazar roomId en onCreate;
    // el listing y el registro local se setean DESPUÉS de onCreate (consistente).
    const code = await generateRoomCode();
    if (code) this.roomId = code;

    const state = new KahootState();
    state.topic = (options.topic ?? 'Cinemática').trim().slice(0, 64) || 'Cinemática';
    this.setState(state);

    this.difficulty = options.difficulty ?? 'easy';
    this.audience = normalizeAudience(options.audience);
    this.count = Math.min(Math.max(options.count ?? 5, 1), 10);

    this.onMessage('start', (client) => this.handleStart(client));
    this.onMessage('answer', (client, message: { index?: number }) =>
      this.handleAnswer(client, message),
    );
    this.onMessage('regenerate', (client) => this.handleRegenerate(client));

    // En background: generar bloquearía la respuesta de matchmaking (timeout).
    void this.generateQuestions();
  }

  /** Genera todas las preguntas en paralelo (mucho más rápido que en serie) y
   *  tolera la caída de un proveedor: conserva las que sí se generaron. */
  private async generateQuestions(): Promise<void> {
    this.state.ready = false;
    this.state.genFailed = false;
    this.questions = [];
    this.state.totalQuestions = 0;
    try {
      const gateway = getAIGateway();
      const results = await Promise.allSettled(
        Array.from({ length: this.count }, (_, i) =>
          gateway.generateTrivia({
            topic: this.state.topic,
            difficulty: this.difficulty,
            audience: this.audience,
            nonce: i + 1,
          }),
        ),
      );
      for (const result of results) {
        if (result.status !== 'fulfilled') {
          console.error('[kahoot] falló la generación de una pregunta', result.reason);
          continue;
        }
        try {
          this.questions.push(parseTriviaQuestion(result.value.data));
        } catch (error) {
          console.error('[kahoot] pregunta inválida descartada', error);
        }
      }
      this.state.totalQuestions = this.questions.length;
    } catch (error) {
      console.error('[kahoot] no se pudieron generar preguntas', error);
    } finally {
      this.state.genFailed = this.questions.length === 0;
      this.state.ready = true;
    }
  }

  /** El anfitrión puede reintentar la generación si falló (estando en lobby). */
  private handleRegenerate(client: Client): void {
    if (client.sessionId !== this.state.hostId) return;
    if (this.state.phase !== 'lobby') return;
    if (!this.state.ready) return; // ya está generando
    void this.generateQuestions();
  }

  override async onJoin(client: Client, options: KahootCreateOptions): Promise<void> {
    const player = new PlayerState();
    player.nickname = (options.nickname ?? 'Jugador').slice(0, 20) || 'Jugador';
    this.state.players.set(client.sessionId, player);
    this.correctCounts.set(client.sessionId, 0);
    if (!this.state.hostId) this.state.hostId = client.sessionId;
    // Atribución a la cuenta: verificamos el JWT server-side (no confiamos en el cliente).
    const userId = await verifyAccessToken(options.accessToken);
    if (userId) this.userIds.set(client.sessionId, userId);
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
    this.userIds.delete(sessionId);
    this.correctCounts.delete(sessionId);
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
      this.correctCounts.set(client.sessionId, (this.correctCounts.get(client.sessionId) ?? 0) + 1);
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
    // En background: la persistencia nunca debe bloquear el game loop.
    void this.persistResults();
  }

  /** Atribuye el resultado de la partida a los jugadores logueados (idempotente). */
  private async persistResults(): Promise<void> {
    if (this.persisted) return;
    this.persisted = true;

    // Ranking final por score desc (empates: orden de inserción del Map).
    const ranked = [...this.state.players.entries()].sort(([, a], [, b]) => b.score - a.score);
    const totalPlayers = ranked.length;
    const totalQuestions = this.questions.length;

    const rows: GameResultRow[] = [];
    ranked.forEach(([sessionId, player], idx) => {
      const userId = this.userIds.get(sessionId);
      if (!userId) return; // solo jugadores logueados
      rows.push({
        user_id: userId,
        room_code: this.roomId,
        mode: MODE,
        topic: this.state.topic,
        nickname: player.nickname,
        score: player.score,
        rank: idx + 1,
        total_players: totalPlayers,
        correct_count: this.correctCounts.get(sessionId) ?? 0,
        total_questions: totalQuestions,
      });
    });

    await persistGameResults(rows);
  }
}
