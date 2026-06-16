# References (T017)

> Todas las fuentes consultadas + **licencia de cada recurso reutilizable**. Los productos
> analizados son **referencia de estudio** (su IP NO se usa en la app). Los recursos de la
> sección 2 sí pueden usarse en producción **según su licencia**.
>
> ⚠️ En esta sesión `WebSearch`/`WebFetch` estuvieron denegados; los análisis usaron
> conocimiento público documentado. Las URLs canónicas quedan listadas para el pase de
> verificación en vivo (Playwright, ver `tools/`).

---

## 1. Productos analizados (referencia de estudio — IP de sus dueños, NO usar assets)

| Producto | URL canónica | Notas de fuente |
| --- | --- | --- |
| Kahoot | https://kahoot.com/ · https://kahoot.it/ | Brand/colores+formas de respuesta, podio, SFX |
| Duolingo | https://www.duolingo.com/ · https://design.duolingo.com/ | Design system "Feather"; World Characters; Rive |
| Duolingo (blog) | https://blog.duolingo.com/world-character-redesign/ | Rediseño de personajes |
| Quizizz | https://quizizz.com/ | Memes/feedback, power-ups, redemption |
| Blooket | https://www.blooket.com/ | Blooks, tiers de rareza, modos |
| Gimkit | https://www.gimkit.com/ | Economía in-game, modos |
| Brilliant | https://brilliant.org/ | Manipulables STEM, ilustración editorial |
| Khan Academy | https://www.khanacademy.org/ | Avatares por energy points, maestría, Wonder Blocks |
| Prodigy Math | https://www.prodigygame.com/ | Avatar paper-doll, RPG educativo |

> Las fuentes específicas de cada sitio están al pie de cada `sites/*.md` ("## Fuentes").
> Galerías de inspiración de método (no scraping de producto): Mobbin, Dribbble, Behance,
> Land-book, Godly, Figma Community.

---

## 2. Recursos REUTILIZABLES en producción (con licencia)

### Tecnología de animación
| Recurso | Licencia | Uso en Quanta |
| --- | --- | --- |
| **Rive** (editor) + `@rive-app/react-canvas` (runtime) | Runtime MIT; editor gratis | Personaje Quark con State Machine |
| **canvas-confetti** | MIT | Confeti de celebración (one-shot) |
| **Framer Motion** | MIT | Animación Fase 0 (SVG/React) |
| **lottie-web** / LottieFiles | Apache-2.0 (lib); animaciones: **verificar c/u** | Efectos one-shot (solo Lotties CC0/CC-BY) |

### Iconografía y fuentes
| Recurso | Licencia | Uso |
| --- | --- | --- |
| **Lucide** | ISC | Íconos (ya en el stack); formas de respuesta/feedback |
| **Baloo 2** (display) | OFL | Ya en uso, se mantiene |
| **Nunito** (texto) | OFL | Ya en uso, se mantiene |

### Inspiración de MÉTODO para producir assets originales (no copiar 1:1)
| Recurso | Licencia | Uso |
| --- | --- | --- |
| **DiceBear** (avatares procedurales) | estilos varían (varios CC0/MIT) — **verificar por estilo** | Referencia de avatar modular |
| **Open Peeps** | CC0 | Referencia de personajes modulares |
| **Kenney** (game assets / SFX) | CC0 | SFX/UI de respaldo si no se sintetizan |
| **unDraw** | licencia libre (atribución no requerida) | Ilustración de respaldo |

> Antes de comitear cualquiera de estos, confirmar la licencia **del recurso específico**
> (DiceBear y LottieFiles tienen licencias por-ítem) y registrarlo acá.

---

## 3. Declaración de cumplimiento

- **Cero assets con copyright de terceros** comiteados a la app en T017.
- `assets/refs/` contendría **solo** capturas de referencia para estudio interno
  (documentadas con su fuente), **nunca** importadas por la app. (En esta sesión no se
  generaron capturas porque la red estuvo denegada; el script `tools/extract-design-tokens.mjs`
  las produce cuando haya acceso.)
- Todo asset que llegue a producción será **original de Quanta** o de **licencia libre**
  registrada en este archivo.
