# Horario Modular Estudiante UniGuajira (Grupo C1 - Uribia)

Aplicación Web Progresiva (PWA) e interactiva para la gestión de horarios modulares, sesiones académicas, tareas y formato oficial institucional para estudiantes de la **Universidad de La Guajira** (Licenciatura en Educación Básica Primaria - Ampliación Uribia, Grupo C1).

---

## 🚀 Características Principales

- **📅 Horario Modular Interactivo**: Visualización por fechas, módulos y sesiones en tiempo real con indicador de clase en curso y próximas sesiones.
- **📱 PWA & Funcionamiento Offline**: Instalable en dispositivos móviles (Android / iOS / PC) mediante Service Worker con soporte de almacenamiento local.
- **📝 Gestor de Tareas y Calificaciones**: Registro de talleres, parciales y entregas con cálculo de notas porcentuales y recordatorios.
- **📄 Formato Oficial y Exportación PDF**: Generación de hoja de horario oficial con estilos de impresión optimizados y descarga en PDF.
- **🗓️ Sincronización de Calendario (.ics)**: Exporta las clases a Google Calendar, Apple Calendar o Outlook.
- **🔔 Notificaciones y Recordatorios**: Notificaciones dentro de la app y del sistema para clases próximas y fechas límite.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Empaquetador**: [Vite](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animaciones**: [Motion](https://motion.dev/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Exportación**: `jspdf` & `html2canvas-pro`

---

## 💻 Instalación y Ejecución Local

1. **Clonar el repositorio**:
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd <CARPETA_DEL_PROYECTO>
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

4. **Compilar para producción**:
   ```bash
   npm run build
   ```
   Los archivos estáticos optimizados se generarán en la carpeta `dist/`.

5. **Verificar tipos (Lint)**:
   ```bash
   npm run lint
   ```

---

## 📦 Estructura del Proyecto

```text
├── public/                 # Manifiesto PWA, iconos y Service Worker
├── src/
│   ├── components/         # Componentes modulares de interfaz
│   ├── data/               # Datos del calendario modular institucional
│   ├── utils/              # Exportadores (PDF, ICS), notificaciones y backup
│   ├── App.tsx             # Componente principal con navegación por pestañas
│   ├── index.css           # Configuración de estilos y utilidades Tailwind
│   ├── main.tsx            # Punto de entrada y registro de Service Worker
│   └── types.ts            # Tipos e interfaces de TypeScript
├── package.json            # Scripts y dependencias
└── vite.config.ts          # Configuración de Vite y plugins
```

---

## 📄 Licencia

Uso académico e institucional para la comunidad de la Universidad de La Guajira.
