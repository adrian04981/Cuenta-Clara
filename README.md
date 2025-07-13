#  Cuenta Clara

<div align="center">
  <img src="https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/SQLite-07405e?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
</div>

<div align="center">
  <h3> Aplicación moderna de finanzas personales para web y móvil</h3>
  <p>Una solución completa, intuitiva y multiplataforma para el control de gastos e ingresos personales</p>
</div>

---

##  Características Principales

###  **Gestión Inteligente de Transacciones**
-  Registro rápido de ingresos y gastos
-  Modo básico y profesional con cálculo automático de impuestos
-  Categorización automática y personalizable
-  Asignación inteligente por mes visualizado
-  Validaciones en tiempo real con feedback visual

###  **Análisis Financiero Avanzado**
-  **Finanzas Mensual**: Vista detallada por mes con calculadora de impuestos
-  **Historial Completo**: Filtros avanzados y gráficas interactivas
-  Estadísticas automáticas de ingresos vs gastos
-  Tarjetas de resumen con información clave
-  Rangos rápidos (último mes, trimestre, año)

###  **Gestión de Categorías**
-  Categorías predefinidas para gastos e ingresos
-  Edición y personalización completa
-  Eliminación segura con confirmación
-  Restauración de categorías por defecto
-  Maestros separados para ingresos y gastos

###  **Configuración y Respaldo**
-  **Backup/Restore**: Exportación e importación de datos en JSON
-  Configuración de impuestos personalizable
-  Alternancia entre modo básico y profesional
-  Zona de peligro para reset completo de datos
-  Información del sistema y estadísticas

###  **Multiplataforma**
-  **React Native**: Aplicación móvil nativa
-  **Progressive Web App**: Funcionamiento completo en navegadores
-  **Almacenamiento Local**: SQLite (móvil) + LocalStorage (web)
-  **Sincronización**: Context global para actualizaciones en tiempo real

---

##  Tecnologías Utilizadas

| Categoría | Tecnologías |
|-----------|-------------|
| **Frontend** | React Native, React, TypeScript |
| **Navegación** | React Router (web), React Navigation (móvil) |
| **Base de Datos** | SQLite, AsyncStorage, LocalStorage |
| **Gráficas** | Recharts |
| **Fechas** | date-fns con localización en español |
| **Build** | Webpack, Babel |
| **PWA** | Service Workers, Manifest |
| **Estilos** | Inline Styles con tema consistente |

---

##  Instalación y Uso

###  **Requisitos Previos**
`ash
Node.js >= 16.0.0
npm >= 8.0.0
`

###  **Instalación**
`ash
# Clonar el repositorio
git clone https://github.com/adrianhinojosa/cuenta-clara.git
cd cuenta-clara

# Instalar dependencias
npm install
`

###  **Ejecutar en Web (PWA)**
`ash
# Desarrollo
npx webpack serve --mode development

# Producción
npm run build
npx serve dist
`

###  **Ejecutar en Móvil**
`ash
# Android
npm run android

# iOS
npm run ios

# Metro Bundler
npm start
`

---

##  Módulos y Funcionalidades

###  **Finanzas Mensual**
- **Selector de Mes**: Navegación intuitiva entre meses
- **Calculadora de Impuestos**: Modo profesional con cálculos automáticos
- **Tarjetas de Resumen**: Ingresos, gastos, balance y proyecciones
- **Lista de Transacciones**: Filtrada automáticamente por mes seleccionado
- **Formulario Inteligente**: Validaciones y feedback visual en tiempo real

###  **Historial y Reportes**
- **Filtros Avanzados**: Por tipo, categoría, rango de fechas
- **Gráficas Interactivas**: Visualización de tendencias financieras
- **Estadísticas Dinámicas**: Totales, promedios y comparativas
- **Rangos Rápidos**: Botones para períodos comunes
- **Exportación Visual**: Datos claros y organizados

###  **Gestión de Categorías**
- **Maestros Separados**: Categorías específicas para ingresos y gastos
- **Edición en Vivo**: Cambios reflejados inmediatamente
- **Eliminación Segura**: Confirmaciones y validaciones
- **Restauración**: Vuelta a categorías predefinidas
- **Contadores**: Número de transacciones por categoría

###  **Configuración del Sistema**
- **Modos de Operación**: Básico (solo montos) vs Profesional (con impuestos)
- **Gestión de Impuestos**: Configuración de porcentajes personalizables
- **Backup Completo**: Exportación de todas las datos en JSON
- **Restore Inteligente**: Importación con validación de estructura
- **Reset Seguro**: Limpieza completa con confirmación doble

---

##  Diseño y UX

###  **Paleta de Colores**
- **Primario**: Azules (#3b82f6, #2563eb) para acciones principales
- **Éxito**: Verdes (#10b981, #059669) para ingresos y confirmaciones
- **Advertencia**: Naranjas (#f59e0b, #d97706) para validaciones
- **Fondo**: Grises suaves (#f8fafc, #f1f5f9) para contraste

###  **Principios de Diseño**
- **Responsive**: Adaptación automática a diferentes tamaños de pantalla
- **Accesibilidad**: Contraste adecuado y navegación por teclado
- **Consistencia**: Patrones visuales uniformes en toda la aplicación
- **Feedback Visual**: Animaciones y estados para todas las interacciones

###  **Experiencia de Usuario**
- **Navegación Intuitiva**: Sidebar moderno con iconos descriptivos
- **Validaciones en Tiempo Real**: Feedback inmediato en formularios
- **Estados de Carga**: Indicadores visuales para operaciones asíncronas
- **Mensajes Claros**: Confirmaciones y errores fáciles de entender

---

##  Estructura del Proyecto

`
cuenta-clara/
  src/
     services/          # Servicios de datos y APIs
       database.ts       # Configuración SQLite
       dataService.ts    # Servicio principal de datos
       crossPlatformDatabase.ts # Adaptador multiplataforma
     types/             # Definiciones TypeScript
       index.ts          # Interfaces y tipos principales
     utils/            # Utilidades y helpers
        helpers.ts        # Funciones auxiliares
        mockSQLite.js     # Mock para web
        mockFS.js         # Mock del sistema de archivos
        mockShare.js      # Mock para compartir archivos
  public/               # Archivos estáticos para web
    index.html           # HTML principal
    manifest.json        # Configuración PWA
  webpack.config.js      # Configuración Webpack
  babel.config.js       # Configuración Babel
  App.tsx               # Componente principal React Native
  index.web.complete.js # Aplicación web completa
  package.json          # Dependencias y scripts
`

---

##  Próximas Funcionalidades

###  **En Desarrollo**
- [ ]  Sincronización en la nube (Firebase/Supabase)
- [ ]  Más tipos de gráficas y reportes
- [ ]  Integración con APIs bancarias
- [ ]  Notificaciones push para recordatorios
- [ ]  Temas personalizables (claro/oscuro)

###  **Ideas Futuras**
- [ ]  Categorización automática con IA
- [ ]  Predicciones financieras
- [ ]  Gastos compartidos y grupos
- [ ]  Escaneo de recibos con OCR
- [ ]  Soporte multi-moneda

---

##  Contribuir

¡Las contribuciones son bienvenidas! Este es un proyecto open source creado para la comunidad.

###  **Cómo Contribuir**
1.  Fork del repositorio
2.  Crea una rama para tu feature (git checkout -b feature/nueva-funcionalidad)
3.  Commit tus cambios (git commit -m 'Add: nueva funcionalidad')
4.  Push a la rama (git push origin feature/nueva-funcionalidad)
5.  Abre un Pull Request

###  **Reportar Bugs**
- Usa las [GitHub Issues](https://github.com/adrianhinojosa/cuenta-clara/issues)
- Incluye pasos para reproducir el error
- Especifica la plataforma (web/móvil) y versión

###  **Discusiones**
- [GitHub Discussions](https://github.com/adrianhinojosa/cuenta-clara/discussions) para ideas y preguntas
- Etiqueta [@adrianhinojosa](https://github.com/adrianhinojosa) para cuestiones importantes

---

##  Licencia

Este proyecto está licenciado bajo la **MIT License** - consulta el archivo [LICENSE](LICENSE) para más detalles.

---

##  Autor

**Adrián Hinojosa**
-  GitHub: [@adrianhinojosa](https://github.com/adrianhinojosa)
-  LinkedIn: [Adrián Hinojosa](https://linkedin.com/in/adrianhinojosa)
-  Email: contacto@adrianhinojosa.com

---

##  Agradecimientos

-  **Comunidad Open Source** por las librerías y herramientas utilizadas
-  **Material Design** por los principios de diseño
-  **React Native Community** por el excelente ecosistema
-  **Web Development Community** por las mejores prácticas

---

##  Estadísticas del Proyecto

<div align="center">
  <img src="https://img.shields.io/github/stars/adrianhinojosa/cuenta-clara?style=social" alt="GitHub stars" />
  <img src="https://img.shields.io/github/forks/adrianhinojosa/cuenta-clara?style=social" alt="GitHub forks" />
  <img src="https://img.shields.io/github/issues/adrianhinojosa/cuenta-clara" alt="GitHub issues" />
  <img src="https://img.shields.io/github/license/adrianhinojosa/cuenta-clara" alt="License" />
</div>

---

<div align="center">
  <h3> Si te gusta este proyecto, considera darle una estrella en GitHub </h3>
  <p>¡Tu apoyo motiva el desarrollo continuo!</p>
</div>

---

*Última actualización: Julio 2025*
