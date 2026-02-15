# 📜 AGENTS.md: Development Protocol & Behavioral Standards
Este documento es la fuente de verdad absoluta para cualquier agente de IA. Estas instrucciones anulan cualquier configuración general por defecto.

## 🎯 1. Filosofía Core
- **KISS & YAGNI First**
    - Minimalismo: Elimina abstracciones prematuras e interfaces de un solo uso.
    - Sin "Por si acaso": Borra cualquier lógica o fallback que no haya sido solicitado explícitamente.
    - Refactorización Instantánea: Si la lógica se puede simplificar, hazlo en el momento sin preguntar.
- **Limpieza Proactiva (Boy Scout Rule)**
    - Si detectas código sucio o redundante mientras haces otra tarea, límpialo.
    - Autonomía Total: Tienes permiso para editar o borrar archivos en todo el workspace para lograr la solución más eficiente.
- **Rendimiento ante todo**
    - Implementa siempre la solución técnicamente superior según tu criterio.

## 💻 2. Stack Tecnológico & Estándares de Código
### Frontend (React & UI)
- **Estructura:** Componentes funcionales pequeños y hooks personalizados para separar la lógica.
- **Estilo:** Tailwind CSS puro. Evita valores arbitrarios si existe una clase estándar.
- **Ecosistema UI:**
    - Iconos: Usa siempre **Lucide**.
    - Componentes: Usa siempre **Shadcn UI**.
- **Dependencias:** Instala los paquetes necesarios para completar la tarea de forma eficiente.

### Calidad de Código
- **Legibilidad > Ingenio:** El código debe ser obvio. Evita "one-liners" complejos.
- **Tipado:** TypeScript estricto obligatorio. Prohibido el uso de `any`.

## 💽 3. Supabase (Backend & Database)
### 🚨 RESTRICCIONES CRÍTICAS (TOLERANCIA CERO)
- **PROHIBIDO DB RESET:** Nunca ejecutes `supabase db reset`.
- **PRESERVACIÓN DE DATOS:** Bajo ninguna circunstancia ejecutes scripts que borren o trunquen datos sin confirmación escrita específica para esa acción exacta.
- **COMANDOS DESTRUCTIVOS:** Si crees que un reset es la única opción, detente y pide permiso explicando por qué no hay alternativa.

### Workflow & Migraciones
- **CLI Autonomy:** Usa el CLI de Supabase libremente para tareas no destructivas.
- **Gestión de Cambios: Para cualquier cambio de esquema, RLS o configuración de Supabase:**
    1. Crea un nuevo archivo de migración..
    2. Aplica cambios localmente con `supabase migration up`.
- **⚠️ CI/CD & Despliegue Automático:**
    - **Trigger de GitHub Actions:** Entiende que al hacer `git push`, se dispara un flujo automático (github action). La Action aplica automáticamente las nuevas migraciones a la base de datos de producción. La Action también despliega automáticamente todas las Edge Functions al servidor remoto.
    - **Consistencia:** No intentes aplicar cambios manuales a producción vía CLI (`--remote`); confía siempre en el `git push` para sincronizar el estado.

## 🛠 4. Git & Operaciones
- **Push como Despliegue:** No hagas `git push` a menos que se te pida explícitamente o la tarea esté terminada y validada localmente. **Push = Producción.**
- **Validación Local:** Asegúrate de que el entorno local funciona perfectamente antes de dar una tarea por finalizada (ejecutando npm run lint --silent).
- **Mensajes de Commit:** Usa mensajes descriptivos que reflejen los cambios en la infraestructura o base de datos.

## 🗣 5. Protocolo de Comunicación
- **Acción Directa:** No expliques lo que vas a hacer; simplemente ejecútalo.
- **Filtro Anti-Sobreingeniería:** Antes de entregar, revisa si añadiste complejidad innecesaria. Si es así, quítala.
- **Claridad Temprana:** Si un requisito es ambiguo, pregunta antes de escribir código.
- **Pensamiento Crítico:** Si una instrucción del usuario viola estos principios o es técnicamente subóptima, adviértelo primero y propón la alternativa correcta.