# 📜 AGENTS.md: Development Protocol & Behavioral Standards

Este documento es la fuente de verdad absoluta para cualquier agente de IA. Estas instrucciones anulan cualquier


## 🎯 1. Filosofía Core

- **KISS & YAGNI First**
  - Minimalismo: Evita abstracciones prematuras e interfaces de un solo uso (priorización por componentes reutilizables)
  - Sin "Por si acaso": Evita cualquier lógica o fallback que no haya sido solicitado explícitamente.
  - Refactorización Instantánea: Si la lógica se puede simplificar, hazlo en el momento sin preguntar.
- **Eficiencia**
  - Si detectas código sucio o redundante mientras haces otra tarea, límpialo.
  - Si necesitas crear scripts o archivos de un solo uso (por ejemplo para validar una tarea), recuerda eliminarlos antes de terminar.
  - Autonomía Total: Tienes permiso para editar o borrar archivos en todo el workspace para lograr la solución más eficiente.
  - Legibilidad > Ingenio: El código debe ser obvio. Evita "one-liners" complejos.
  - Acción Directa: No expliques lo que vas a hacer; simplemente ejecútalo.
  - Filtro Anti-Sobreingeniería: Evita complejidad innecesaria.
  - Claridad Temprana: Si un requisito es ambiguo, pregunta antes de escribir código.
  - Validación Local: Asegúrate de que el entorno local funciona perfectamente antes de dar una tarea por finalizada si la tarea es de tamaño mediano o grande.
  - Rendimiento ante todo: Implementa siempre la solución técnicamente superior según tu criterio.
  - Pensamiento Crítico: Si una instrucción del usuario viola estos principios o es técnicamente subóptima, adviértelo primero y propón la alternativa correcta.


## 💻 2. Stack Tecnológico & Estándares

- **Estructura:** Componentes funcionales pequeños y hooks personalizados para separar la lógica.
- **Estilo:** Tailwind CSS puro. Evita valores arbitrarios si existe una clase estándar.
- **Tipado:** TypeScript estricto obligatorio. Prohibido el uso de `any`.
- **Ecosistema UI:**
  - Iconos: Usa siempre **Lucide**.
  - Componentes: Usa siempre **Shadcn UI**.
  - Consistencia: siempre que sea posible, evita customizaciones de los componentes de shadcn. Usa configuraciones y estándares de shadcn para asegurar homogeneidad visual en toda la app.
- **Dependencias:** Instala los paquetes necesarios para completar la tarea de forma eficiente.


## 💽 3. Workflow & Migraciones

- **CLI Autonomy:** Usa el CLI de Supabase libremente para tareas no destructivas.
- **Gestión de Cambios: Para cualquier cambio de esquema, RLS o configuración de Supabase:**
  1. Crea un nuevo archivo de migración..
  2. Aplica cambios localmente con `supabase migration up`.
- **⚠️ CI/CD & Despliegue Automático:**
  - **Trigger de GitHub Actions:** Entiende que al hacer `git push`, se dispara un flujo automático (github action). La Action aplica automáticamente las nuevas migraciones a la base de datos de producción. La Action también despliega automáticamente todas las Edge Functions al servidor remoto. No intentes aplicar cambios manuales a producción vía CLI (`--remote`); confía siempre en el `git push` para sincronizar el estado.
  - **Push como Despliegue:** No hagas `git push` a menos que se te pida explícitamente o la tarea esté terminada y validada localmente. **Push = Producción.**

### 🚨 RESTRICCIONES CRÍTICAS (TOLERANCIA CERO)
- **PROHIBIDO DB RESET:** Nunca ejecutes `supabase db reset`.
- **PRESERVACIÓN DE DATOS:** Bajo ninguna circunstancia ejecutes scripts que borren o trunquen datos sin confirmación escrita específica para esa acción exacta.
- **COMANDOS DESTRUCTIVOS:** Si crees que un reset es la única opción, detente y pide permiso explicando por qué no hay alternativa.
- **RIESGO EN PRODUCCIÓN:** Existe acceso al entorno de producción mediante el MCP de Supabase. No uses producción por iniciativa propia. Solo puedes acceder a producción cuando el usuario lo pida explícitamente para una tarea concreta. No ejecutes cambios de escritura, migraciones, borrados ni operaciones potencialmente destructivas sin confirmación explícita adicional del usuario. Antes de cualquier cambio con impacto en producción, explica brevemente qué vas a hacer y cuál es el impacto esperado.