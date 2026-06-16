# Benchmark de diseño — Brilliant (brilliant.org)

> **Por qué importa para Quanta:** Brilliant es el referente global de **interactividad educativa premium en STEM** (matemática, física, lógica, ciencia de datos, química). Su tesis de producto —"aprender haciendo" mediante **manipulables interactivos** en vez de video/texto pasivo— es exactamente el terreno de Quanta. Su lenguaje visual es **limpio, editorial y sobrio**, lo opuesto al ruido tipo Kahoot. Para un juego de física/química en español con theme pastel, su forma de **visualizar conceptos científicos** es la mina de oro.

> **Nota de método:** este análisis se basa en patrones de diseño públicos y ampliamente documentados del producto Brilliant (web + app). No se incrustan capturas ni assets con copyright; solo se describen **técnicas y patrones** reutilizables. HEX/medidas son aproximaciones derivadas de su lenguaje visual y deben confirmarse vía DevTools antes de copiar valores exactos. Fuentes al final.

---

## 1) Design tokens

Brilliant usa un sistema **claro, de alto contraste y muy poco saturado**, donde el color vive casi exclusivamente en las **ilustraciones y diagramas**, no en el chrome. El UI es casi monocromático para que las visualizaciones STEM sean el foco.

**Paleta (aproximada, confirmar en DevTools):**

| Rol | HEX aprox. | Uso |
| --- | --- | --- |
| Fondo base | `#FFFFFF` / `#F7F7F9` | Lienzo dominante, mucho blanco |
| Tinta / texto | `#16191D` ~ `#202428` | Casi-negro, no negro puro |
| Texto secundario | `#5C636E` | Subtítulos, metadatos |
| Bordes / hairlines | `#E4E7EC` | Separadores finos de 1px |
| Acento primario | azul `#2C6FF6`-ish / verde acción | CTA, links, estados activos |
| Verde "correcto" | `#1FB16B`-ish | Feedback de acierto |
| Rojo "incorrecto" | `#E5484D`-ish | Feedback de error (suave, no agresivo) |
| Amarillo destello | `#FFC53D`-ish | Acentos de logro / chispa |

Las **ilustraciones** sí usan paletas vivas pero **controladas y armónicas**: planos de color sólidos (flat), gradientes muy suaves, y combinaciones limitadas (2-4 tonos por diagrama). Nunca neón saturado.

**Tipografía (premium, su seña de identidad):**
- Familia con fuerte personalidad **serif/semi-serif editorial** para titulares en marketing/branding, combinada con una **sans geométrica neutral** para UI y cuerpo de lección.
- Jerarquía amplia: titulares grandes y aireados, cuerpo cómodo (~16–18px), buena altura de línea (~1.5).
- Pesos: contraste fuerte entre **bold para conceptos clave** y regular para explicación.
- Para Quanta (que no puede licenciar tipografías de marca): replicar la *sensación* con un par como **serif editorial open-source (p. ej. Fraunces / Spectral) para titulares + sans neutral (Inter) para UI**.

**Spacing & radios:**
- Escala de espaciado generosa, ritmo de 8px, mucho **whitespace** (el aire es parte de la marca premium).
- Radios **moderados**: tarjetas y botones ~8–12px; nada excesivamente redondeado (evita el look "infantil"). Esto contrasta con el pastel-bubble de apps gamificadas.
- Sombras **mínimas o ausentes**; jerarquía por espacio y hairlines, no por elevación pesada.

---

## 2) Avatares / personajes

Brilliant **no** apuesta por un mascot central ni avatares de usuario elaborados. En su lugar:
- Usa **personajes ilustrados de figura plana** (estilo geométrico, sin rasgos faciales detallados) dentro de los problemas: una persona empujando una caja, un científico midiendo, etc. Son **funcionales al concepto**, no de marca.
- El "personaje" de la marca es el **estilo de ilustración** mismo. No hay un Duo/mascota.
- **Para Quanta:** se puede mantener un mascot propio (más cercano a la línea Duolingo/Kahoot del benchmark) pero adoptar de Brilliant el uso de **figuras humanas planas dentro de los diagramas de física** (un cuerpo en un plano inclinado, un nadador, un imán manipulado por una mano).

---

## 3) ★ Ilustración y visualización interactiva de conceptos STEM (lo más relevante)

Este es el núcleo y lo que Quanta debe estudiar más:

**Estilo de ilustración:**
- **Vectorial plano (flat) con geometría limpia**: formas sólidas, contornos definidos, sin texturas ruidosas ni sombreados realistas. Estética casi "papel recortado" / editorial científico.
- Paletas reducidas por escena, coherentes con el tema (azules para fluidos, ámbar/rojo para calor, etc.) → **color con significado físico**.
- **Cuadrículas, ejes y vectores** dibujados con la misma pulcritud: flechas de fuerza, líneas de campo, trayectorias punteadas. Notación matemática integrada visualmente, no como texto suelto.
- Diagramas **autoexplicativos**: el dibujo *es* la pregunta. Minimiza texto; el alumno razona sobre la figura.

**Visualizaciones interactivas (el oro para física/química):**
- **Manipulables directos**: el usuario **arrastra un nodo, mueve un slider, gira un dial, ajusta un ángulo** y la simulación responde en tiempo real (la pelota cae distinto, el circuito enciende, la onda cambia de frecuencia). Aprendizaje por *causa→efecto* inmediato.
- **Sliders de parámetro** que reconfiguran un sistema físico: cambiar masa/ángulo/voltaje y ver el resultado actualizarse fluido.
- **Toca-para-clasificar / arrastra-a-su-lugar**: ordenar fuerzas, conectar nodos de un circuito, completar una reacción.
- **Revelado progresivo (scaffolding)**: un concepto se construye en pasos; cada interacción correcta *desbloquea* la siguiente capa del diagrama, en lugar de mostrar todo de golpe.
- **Feedback embebido en la visualización**: al fallar, el propio diagrama muestra qué pasó (la caja resbala, el circuito no cierra), convirtiendo el error en explicación visual.
- **Predicción antes de simular**: piden estimar el resultado, luego corren la simulación → tensión cognitiva + recompensa de ver.

Para Quanta (física/química), esto se traduce directo: **un applet por concepto** (plano inclinado, péndulo, balanceo de ecuaciones, gases, circuitos) construido con Phaser/canvas donde el alumno **manipula y observa**, con color semántico y notación integrada.

---

## 4) Motion & micro-interacciones

- Motion **discreto y físico**: transiciones suaves (~150–250ms), easing natural; nada rebota de forma caricaturesca. El movimiento sirve a la comprensión (una onda que se propaga, un vector que crece), no a la decoración.
- **Animación dirigida por interacción**: el resultado de mover un slider se anima en tiempo real → sensación de "estoy manipulando física real".
- Acierto: confirmación **sobria** (check verde, pequeño destello, avance fluido). Error: el sistema lo *muestra* en vez de castigar visualmente.
- Transiciones de página/lección limpias, sin parpadeos; foco siempre en el lienzo del problema.

---

## 5) Sonido

- Diseño sonoro **minimalista o silencioso por defecto** (especialmente en web). Brilliant prioriza concentración sobre fanfarria; es deliberadamente más callado que apps tipo trivia.
- Si hay audio, son **microtonos sutiles** de confirmación, no jingles. Coherente con su posicionamiento premium/serio.
- **Para Quanta:** ofrecer un perfil sonoro "enfocado" (sutil) además del modo party/Kahoot, según contexto (estudio individual vs. sala competitiva).

---

## 6) Gamificación (más sobria que Kahoot)

- **Streaks (rachas diarias)**: presente y central como hábito, pero presentado con **elegancia** (número + ícono discreto), sin animaciones exageradas.
- **Barras/anillos de progreso por curso y por lección**: avance claro, granular, satisfactorio, con tono editorial.
- **Niveles/secuencia de lecciones** desbloqueables → sensación de camino curado, no de azar.
- Recompensas **intrínsecas**: el placer es "entendí el concepto", reforzado por el revelado progresivo, más que puntos/badges chillones.
- **Para Quanta:** combinar la energía competitiva de Kahoot (salas, puntaje en vivo) con la **sobriedad de progreso de Brilliant** para el modo estudio/single-player: streaks elegantes + anillos de progreso por tema de física/química.

---

## 7) Onboarding

- **Onboarding por interés y nivel**: preguntan objetivos/áreas (matemática, ciencia, CS) y calibran.
- **"Show, don't tell" inmediato**: en los primeros minutos te ponen a **resolver un problema interactivo real**, no a ver un tour. El producto se vende solo demostrando el manipulable.
- Curva suave: primeras interacciones casi imposibles de fallar, generan momentum.
- **Para Quanta:** primer contacto = un mini-reto de física interactivo jugable en <30s, antes de pedir registro.

---

## 8) Layout & responsividad

- Layout **centrado, de una columna, muy aireado**; ancho de lectura controlado para el texto, lienzo amplio para la visualización.
- **Mobile-first real**: las interacciones funcionan con el dedo (drag/slider táctil); el mismo applet escala de móvil a desktop.
- En lección: jerarquía vertical → enunciado → visualización interactiva → opciones/feedback. Sin distracciones laterales durante el problema.
- Marketing/landing: secciones grandes con titulares editoriales + una ilustración/animación demostrativa por bloque.

---

## 9) Accesibilidad

- **Alto contraste** texto-fondo (casi-negro sobre blanco) → buena legibilidad base.
- Tipografía grande y aireada ayuda a lectura.
- Riesgo conocido de las interfaces tipo Brilliant: **dependencia del color y del drag** en las visualizaciones → necesidad de reforzar con **etiquetas, patrones y alternativas no-arrastre** para daltonismo y motricidad. Quanta debe cubrir esto explícitamente (no asumir que el applet es accesible por defecto).
- Color semántico (verde/rojo) **siempre acompañado de ícono/texto**, nunca color solo.

---

## Qué tomar para Quanta

- **★ Un manipulable interactivo por concepto físico/químico**: arrastrar/slider/dial que actualiza una simulación en tiempo real (plano inclinado, péndulo, gases, balanceo de ecuaciones). Causa→efecto inmediato > texto. Es el patrón más transferible y diferenciador.
- **Color con significado físico + ilustración vectorial plana**: paleta reducida por escena (azul=fluido, ámbar=calor), notación y vectores integrados en el dibujo; el diagrama *es* la pregunta.
- **Revelado progresivo (scaffolding)**: construir el concepto en capas que se desbloquean con cada acierto, y mostrar el error *dentro* de la simulación en vez de castigarlo.
- **UI sobria + tipografía editorial premium**: mucho whitespace, casi-monocromo, serif open-source (Fraunces/Spectral) para titulares + Inter para UI → el theme pastel de Quanta puede vivir en las ilustraciones, no en el chrome.
- **Gamificación elegante para el modo estudio**: streaks discretas + anillos de progreso por tema, reservando la energía Kahoot para las salas en vivo.
- **Onboarding "resolvé primero"**: mini-reto interactivo jugable en <30s antes de registro; el manipulable se vende solo.

## Fuentes

- https://brilliant.org/ — sitio oficial (homepage, lenguaje visual y posicionamiento)
- https://brilliant.org/courses/ — catálogo de cursos STEM (física, ciencia, química, matemática)
- https://brilliant.org/about/ — filosofía "learn by doing" / aprendizaje interactivo
- https://www.brilliant.org/physics/ — ejemplos de visualizaciones de física
- App Store / Google Play (Brilliant) — descripciones oficiales del enfoque interactivo y de gamificación

> _Análisis basado en patrones de diseño públicos y documentados de Brilliant; HEX y medidas son aproximaciones a confirmar vía DevTools antes de copiar valores. No se incrustan assets con copyright._
